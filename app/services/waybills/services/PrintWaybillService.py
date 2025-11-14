import os
import cups
from datetime import datetime
from pathlib import Path
from pdf2image import convert_from_path
from PIL import Image
from app.utils.loggers import get_logger
from app.database import db
from app.services.waybills.enums.WaybillPrintStatuses import WaybillPrintStatuses
from app.services.waybills.constants.AwbPaperSize import AWB_WIDTH_MM, AWB_HEIGHT_MM
from app.services.waybills.constants.PrinterConfig import PrinterConfig

logger = get_logger(__name__)


class PrintWaybillService:
    """
    Service for printing waybill files using CUPS.
    Similar to Laravel Service pattern for business logic separation.
    Handles file validation, status management, and printing process.
    
    Note: Printer model is Generic Text-Only Printer (XP-410B)
    """
    
    def __init__(self, printer_name=None, label_width=None, label_height=None, scaling=None):
        """
        Initialize the service with static printer settings.
        
        Args:
            printer_name (str, optional): Ignored - uses static value "Xprinter-XP410B"
            label_width (int, optional): Ignored - uses static value 102mm
            label_height (int, optional): Ignored - uses static value 127mm
            scaling (int, optional): Ignored - uses static value 100
        """
        # Use static values from PrinterConfig - no optional overrides
        self.printer_name = "XP-410B"
        self.label_width = 102
        self.label_height = 127
        self.scaling = 100
        
        logger.info(f"PrintWaybillService initialized - {PrinterConfig.get_summary()}")
    
    def _convert_pdf_to_png(self, pdf_path: str) -> str:
        """
        Convert PDF file to PNG image for thermal printer compatibility.
        Uses DPI from PrinterConfig (default 203 for thermal printers).
        
        Args:
            pdf_path (str): Path to the PDF file
            
        Returns:
            str: Path to the converted PNG file
            
        Raises:
            Exception: If conversion fails
        """
        try:
            # Convert first page of PDF to image
            logger.info(f"Converting PDF to PNG (DPI: {PrinterConfig.PRINTER_DPI}): {pdf_path}")
            images = convert_from_path(pdf_path, first_page=1, last_page=1, dpi=PrinterConfig.PRINTER_DPI)
            
            if not images:
                raise ValueError("PDF conversion resulted in no images")
            
            # Get the first (and only) image
            image = images[0]
            
            # Convert color mode if necessary (thermal printers need RGB or grayscale)
            if PrinterConfig.CONVERT_COLOR_MODE:
                if image.mode == 'RGBA':
                    rgb_image = Image.new('RGB', image.size, (255, 255, 255))
                    rgb_image.paste(image, mask=image.split()[3] if len(image.split()) == 4 else None)
                    image = rgb_image
                elif image.mode != 'RGB':
                    image = image.convert('RGB')
            
            # Create PNG path
            pdf_filename = Path(pdf_path).stem
            png_path = pdf_path.replace('.pdf', '.png')
            
            # Save as PNG
            image.save(png_path, 'PNG')
            logger.info(f"PDF converted to PNG: {png_path}")
            
            return png_path
        
        except Exception as e:
            logger.error(f"Failed to convert PDF to PNG: {str(e)}", exc_info=True)
            raise Exception(f"PDF conversion failed: {str(e)}")
    
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
        Print a waybill file using CUPS with static settings for XPrinter thermal printer.
        
        Validates local file path exists before processing.
        Updates status to "printing" when job is successfully submitted to CUPS.
        
        Args:
            waybill_print: WaybillPrint model instance
            label_width (int, optional): Ignored - uses static 102mm
            label_height (int, optional): Ignored - uses static 127mm
            scaling (int, optional): Ignored - uses static 100
        
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
            
            # Use static values - ignore optional parameters
            width = 102
            height = 127
            scale = 100
            
            # Validate local file path exists
            if not local_file_path:
                raise ValueError("Local file path is missing. Please download the waybill first.")
            
            # Validate file exists on disk
            if not os.path.exists(local_file_path):
                raise FileNotFoundError(f"Waybill file not found at: {local_file_path}")
            
            # Log the file path and print settings for debugging
            logger.info(f"PrintWaybillService validating - Invoice: {invoice_number}, File: {local_file_path}, Label size: {width}x{height}mm, Scaling: {scale}%")
            
            # Check file format and convert if necessary
            print_file_path = local_file_path
            if PrinterConfig.should_convert_pdf_to_png(local_file_path):
                logger.info(f"PDF detected, converting to PNG for thermal printer - Invoice: {invoice_number}")
                print_file_path = self._convert_pdf_to_png(local_file_path)
                logger.info(f"PDF conversion complete - PNG path: {print_file_path}")
            elif local_file_path.lower().endswith('.png'):
                logger.info(f"PNG file ready for printing - Invoice: {invoice_number}")
            else:
                logger.warning(f"Unknown file format, attempting to print as-is - Invoice: {invoice_number}")
            
            # Get CUPS connection and printer
            conn, printer_name = self._get_cups_connection()
            
            # Create print options using centralized configuration
            print_options = PrinterConfig.get_print_options(width, height, scale)
            logger.info(f"Print options generated - {print_options}")
            
            # Submit print job to CUPS
            job_title = f"Waybill-{invoice_number}"
            job_id = conn.printFile(printer_name, print_file_path, job_title, print_options)
            
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

