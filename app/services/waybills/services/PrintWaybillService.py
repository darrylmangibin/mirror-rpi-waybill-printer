import os
import cups
from datetime import datetime
from app.utils.loggers import get_logger
from app.database import db
from app.services.waybills.enums.WaybillPrintStatuses import WaybillPrintStatuses
from app.services.waybills.constants.AwbPaperSize import AWB_WIDTH_MM, AWB_HEIGHT_MM

logger = get_logger(__name__)

# Default AWB paper size (IATA Resolution 606: 102mm × 127mm = 4" × 5")
DEFAULT_LABEL_WIDTH = AWB_WIDTH_MM      # 102mm = 4 inches
DEFAULT_LABEL_HEIGHT = AWB_HEIGHT_MM    # 127mm = 5 inches
DEFAULT_SCALING = 100                   # No scaling by default
DEFAULT_PRINTER_NAME = os.getenv('PRINTER_NAME', None)  # Get from env or None to use system default


class PrintWaybillService:
    """
    Service for printing waybill files using CUPS.
    Similar to Laravel Service pattern for business logic separation.
    Handles file validation, status management, and printing process.
    """
    
    def __init__(self, printer_name=None, label_width=None, label_height=None, scaling=None):
        """
        Initialize the service with optional printer name and print settings.
        
        Args:
            printer_name (str, optional): Name of the printer to use. Defaults to PRINTER_NAME env var or system default printer.
            label_width (int, optional): Label width in mm. Defaults to 102mm for AWB labels (IATA Resolution 606).
            label_height (int, optional): Label height in mm. Defaults to 127mm for AWB labels (IATA Resolution 606).
            scaling (int, optional): Print scaling percentage. Defaults to 100 (no scaling).
        """
        self.printer_name = printer_name or DEFAULT_PRINTER_NAME
        self.label_width = label_width or DEFAULT_LABEL_WIDTH
        self.label_height = label_height or DEFAULT_LABEL_HEIGHT
        self.scaling = scaling or DEFAULT_SCALING
    
    def _get_cups_connection(self):
        """
        Get CUPS connection and determine printer to use.
        
        Returns:
            tuple: (cups.Connection object, printer_name)
        
        Raises:
            ValueError: If no printer is available
        """
        try:
            conn = cups.Connection()
            
            # Use specified printer or get default
            if self.printer_name:
                printers = conn.getPrinters()
                if self.printer_name not in printers:
                    raise ValueError(f"Printer '{self.printer_name}' not found. Available printers: {list(printers.keys())}")
                printer_name = self.printer_name
            else:
                # Get default printer from CUPS
                default_printer = conn.getDefault()
                if not default_printer:
                    raise ValueError("No default printer configured in CUPS. Please set a default printer using: lpadmin -d <printer_name>")
                printer_name = default_printer
            
            logger.info(f"CUPS connection established - Using printer: {printer_name}")
            return conn, printer_name
        
        except cups.IPPError as e:
            raise Exception(f"CUPS connection error: {str(e)}")
        except Exception as e:
            raise Exception(f"Failed to connect to CUPS: {str(e)}")
    
    def print_waybill(self, waybill_print, label_width=None, label_height=None, scaling=None) -> dict:
        """
        Print a waybill file using CUPS with proper sizing for XPrinter thermal printer.
        
        Validates local file path exists before processing.
        Updates status to "printing" when job is successfully submitted to CUPS.
        
        Args:
            waybill_print: WaybillPrint model instance
            label_width (int, optional): Label width in mm. Uses instance default if not specified.
            label_height (int, optional): Label height in mm. Uses instance default if not specified.
            scaling (int, optional): Print scaling percentage. Uses instance default if not specified.
        
        Returns:
            dict: {
                'status': 'success' or 'error',
                'message': str,
                'data': {
                    'waybill_id': int,
                    'invoice_number': str,
                    'local_file_path': str (if successful),
                    'job_id': int (if successful),
                    'printer': str (if successful),
                    'label_size': str (if successful),
                    'scaling': int (if successful)
                }
            }
        """
        try:
            invoice_number = waybill_print.invoice_number
            local_file_path = waybill_print.local_file_path
            
            # Use provided values or fall back to instance defaults
            width = label_width or self.label_width
            height = label_height or self.label_height
            scale = scaling or self.scaling
            
            # Validate local file path exists
            if not local_file_path:
                raise ValueError("Local file path is missing. Please download the waybill first.")
            
            # Validate file exists on disk
            if not os.path.exists(local_file_path):
                raise FileNotFoundError(f"Waybill file not found at: {local_file_path}")
            
            # Log the file path and print settings for debugging
            logger.info(f"PrintWaybillService validating - Invoice: {invoice_number}, File: {local_file_path}, Label size: {width}x{height}mm, Scaling: {scale}%")
            
            # Get CUPS connection and printer
            conn, printer_name = self._get_cups_connection()
            
            # Create print options dictionary for XPrinter thermal printer
            print_options = {
                "media": f"Custom.{width}x{height}mm",  # Custom label size for XPrinter
                "scaling": str(scale),  # Scaling percentage
                "fit-to-page": "true"  # Ensure content fits the label
            }
            
            # Submit print job to CUPS
            job_title = f"Waybill-{invoice_number}"
            job_id = conn.printFile(printer_name, local_file_path, job_title, print_options)
            
            label_size = f"{width}x{height}mm"
            logger.info(f"Print job submitted to CUPS - JobID: {job_id}, Invoice: {invoice_number}, Printer: {printer_name}, Label size: {label_size}, Scaling: {scale}%")
            
            # Update status to "printing" after successful submission to CUPS
            waybill_print.status = WaybillPrintStatuses.PRINTING.value
            db.session.commit()
            
            logger.info(f"Waybill status updated to 'printing' - Invoice: {invoice_number}, JobID: {job_id}")
            
            return {
                'status': 'success',
                'message': 'Waybill sent to printer',
                'data': {
                    'waybill_id': waybill_print.id,
                    'invoice_number': invoice_number,
                    'local_file_path': local_file_path,
                    'job_id': job_id,
                    'printer': printer_name,
                    'label_size': label_size,
                    'scaling': scale
                }
            }
        
        except FileNotFoundError as e:
            error_msg = str(e)
            logger.error(f"File not found for Invoice: {waybill_print.invoice_number} - {error_msg}")
            
            # Update database with error status
            try:
                waybill_print.status = WaybillPrintStatuses.ERROR.value
                waybill_print.error_message = error_msg
                db.session.commit()
            except Exception as db_error:
                logger.error(f"Failed to update WaybillPrint on file not found error: {str(db_error)}", exc_info=True)
            
            return {
                'status': 'error',
                'message': error_msg,
                'data': {
                    'waybill_id': waybill_print.id,
                    'invoice_number': waybill_print.invoice_number
                }
            }
        
        except ValueError as e:
            error_msg = str(e)
            logger.error(f"Validation error for Invoice: {waybill_print.invoice_number} - {error_msg}")
            
            return {
                'status': 'error',
                'message': error_msg,
                'data': {
                    'waybill_id': waybill_print.id,
                    'invoice_number': waybill_print.invoice_number
                }
            }
        
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Error printing waybill for Invoice: {waybill_print.invoice_number}: {error_msg}", exc_info=True)
            
            # Update database with error status
            try:
                waybill_print.status = WaybillPrintStatuses.ERROR.value
                waybill_print.error_message = error_msg
                db.session.commit()
            except Exception as db_error:
                logger.error(f"Failed to update WaybillPrint on error: {str(db_error)}", exc_info=True)
            
            return {
                'status': 'error',
                'message': error_msg,
                'data': {
                    'waybill_id': waybill_print.id,
                    'invoice_number': waybill_print.invoice_number
                }
            }

