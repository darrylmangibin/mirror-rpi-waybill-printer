import os
import cups
from datetime import datetime
from app.utils.loggers import get_logger
from app.database import db
from app.services.waybills.enums.WaybillPrintStatuses import WaybillPrintStatuses

logger = get_logger(__name__)


class PrintWaybillService:
    """
    Service for printing waybill files using CUPS.
    Similar to Laravel Service pattern for business logic separation.
    Handles file validation, status management, and printing process.
    """
    
    def __init__(self, printer_name=None):
        """
        Initialize the service with optional printer name.
        If not specified, uses the default printer configured in CUPS.
        
        Args:
            printer_name (str, optional): Name of the printer to use. Defaults to system default printer.
        """
        self.printer_name = printer_name
    
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
    
    def print_waybill(self, waybill_print) -> dict:
        """
        Print a waybill file using CUPS.
        Validates local file path exists before processing.
        Updates status to "for printing" before sending to printer,
        then to "printed" after successful submission.
        
        Args:
            waybill_print: WaybillPrint model instance
        
        Returns:
            dict: {
                'status': 'success' or 'error',
                'message': str,
                'data': {
                    'waybill_id': int,
                    'invoice_number': str,
                    'local_file_path': str (if successful),
                    'job_id': int (if successful),
                    'printer': str (if successful)
                }
            }
        """
        try:
            invoice_number = waybill_print.invoice_number
            local_file_path = waybill_print.local_file_path
            
            # Validate local file path exists
            if not local_file_path:
                raise ValueError("Local file path is missing. Please download the waybill first.")
            
            # Validate file exists on disk
            if not os.path.exists(local_file_path):
                raise FileNotFoundError(f"Waybill file not found at: {local_file_path}")
            
            # Log the file path for debugging
            logger.info(f"PrintWaybillService validating - Invoice: {invoice_number}, File: {local_file_path}")
            
            # Update status to "for printing" before sending to printer
            waybill_print.status = WaybillPrintStatuses.FOR_PRINTING.value
            db.session.commit()
            
            logger.info(f"Waybill status updated to 'for printing' - Invoice: {invoice_number}")
            
            # Get CUPS connection and printer
            conn, printer_name = self._get_cups_connection()
            
            # Submit print job to CUPS
            job_title = f"Waybill-{invoice_number}"
            job_id = conn.printFile(printer_name, local_file_path, job_title, {})
            
            logger.info(f"Print job submitted to CUPS - JobID: {job_id}, Invoice: {invoice_number}, Printer: {printer_name}")
            
            # Update status to "printed" after successful submission
            waybill_print.status = WaybillPrintStatuses.PRINTED.value
            db.session.commit()
            
            logger.info(f"Waybill status updated to 'printed' - Invoice: {invoice_number}, JobID: {job_id}")
            
            return {
                'status': 'success',
                'message': 'Waybill sent to printer',
                'data': {
                    'waybill_id': waybill_print.id,
                    'invoice_number': invoice_number,
                    'local_file_path': local_file_path,
                    'job_id': job_id,
                    'printer': printer_name
                }
            }
        
        except FileNotFoundError as e:
            error_msg = str(e)
            logger.error(f"File not found for Invoice: {waybill_print.invoice_number} - {error_msg}")
            
            # Update database with error status
            try:
                waybill_print.status = WaybillPrintStatuses.FAILED.value
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
                waybill_print.status = WaybillPrintStatuses.FAILED.value
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

