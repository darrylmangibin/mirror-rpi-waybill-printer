"""
Thermal Printer Service using ESC/POS Protocol

Converts images to ESC/POS commands for thermal printers.
Works with any 80mm thermal printer (XPrinter, Epson, Star, etc.)
No CUPS drivers needed - direct USB communication.
"""

import os
from pathlib import Path
from PIL import Image
from escpos.printer import Usb, Serial, Network
from app.utils.loggers import get_logger
from app.database import db
from app.services.waybills.enums.WaybillPrintStatuses import WaybillPrintStatuses

logger = get_logger(__name__)


class ThermalPrintService:
    """
    ESC/POS based thermal printer service.
    Supports USB, Serial, and Network connections.
    """
    
    # XPrinter USB identifiers
    XPRINTER_VENDOR_ID = 0x2D37
    XPRINTER_PRODUCT_ID = 0x8327
    
    def __init__(self, vendor_id=None, product_id=None):
        """
        Initialize thermal printer service.
        
        Args:
            vendor_id: USB vendor ID (default: XPrinter 0x2D37)
            product_id: USB product ID (default: XPrinter 0x8327)
        """
        self.vendor_id = vendor_id or self.XPRINTER_VENDOR_ID
        self.product_id = product_id or self.XPRINTER_PRODUCT_ID
        
        logger.info(f"ThermalPrintService initialized - Vendor: 0x{self.vendor_id:04X}, Product: 0x{self.product_id:04X}")
    
    def _get_printer_connection(self):
        """
        Get connection to thermal printer via USB.
        
        Returns:
            Usb: python-escpos Usb printer object
            
        Raises:
            Exception: If printer not found or connection fails
        """
        try:
            logger.info(f"Attempting to connect to thermal printer (USB {self.vendor_id:04X}:{self.product_id:04X})")
            printer = Usb(self.vendor_id, self.product_id)
            logger.info("✓ Connected to thermal printer via USB")
            return printer
        
        except Exception as e:
            error_msg = f"Failed to connect to thermal printer: {str(e)}"
            logger.error(error_msg)
            raise Exception(error_msg)
    
    def _resize_image_for_printer(self, image_path: str, max_width=384) -> Image.Image:
        """
        Resize image to fit 80mm thermal printer (384 pixels at 203 DPI).
        
        Args:
            image_path: Path to image file
            max_width: Maximum width in pixels (384 for 80mm printer at 203 DPI)
            
        Returns:
            Image: Resized PIL Image object
        """
        try:
            logger.info(f"Loading and resizing image: {image_path}")
            
            image = Image.open(image_path)
            
            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Resize maintaining aspect ratio
            original_width, original_height = image.size
            ratio = max_width / original_width
            new_height = int(original_height * ratio)
            
            image = image.resize((max_width, new_height), Image.Resampling.LANCZOS)
            logger.info(f"Image resized: {original_width}x{original_height} → {max_width}x{new_height}")
            
            return image
        
        except Exception as e:
            logger.error(f"Failed to resize image: {str(e)}")
            raise Exception(f"Image processing failed: {str(e)}")
    
    def print_waybill(self, waybill_print, invoice_number: str = None) -> dict:
        """
        Print waybill using thermal printer ESC/POS protocol.
        
        Args:
            waybill_print: WaybillPrint model instance
            invoice_number: Override invoice number (optional)
            
        Returns:
            dict: {'status': 'success'/'error', 'message': str, 'data': {...}}
        """
        invoice_number = invoice_number or waybill_print.invoice_number
        local_file_path = waybill_print.local_file_path
        
        try:
            # Validate file exists
            if not local_file_path or not os.path.exists(local_file_path):
                raise FileNotFoundError(f"Waybill file not found: {local_file_path}")
            
            logger.info(f"Starting thermal print - Invoice: {invoice_number}, File: {local_file_path}")
            
            # Connect to printer
            printer = self._get_printer_connection()
            
            # Resize image for thermal printer
            image = self._resize_image_for_printer(local_file_path)
            
            # Convert to black and white (thermal printers work best with B&W)
            image = image.convert('L')  # Grayscale
            image = image.convert('1')  # Black and white (1-bit)
            
            logger.info(f"Printing image: {image.size}")
            
            # Print image using ESC/POS
            printer.image(image)
            
            # Add some space and cut
            printer.text("\n\n")
            printer.cut()
            
            # Close connection
            printer.close()
            
            logger.info(f"✓ Print job completed - Invoice: {invoice_number}")
            
            # Update status to printing
            waybill_print.status = WaybillPrintStatuses.PRINTING.value
            db.session.commit()
            
            return {
                'status': 'success',
                'message': 'Waybill sent to thermal printer',
                'data': {
                    'waybill_id': waybill_print.id,
                    'invoice_number': invoice_number,
                    'file_path': local_file_path,
                    'method': 'ESC/POS (direct USB)'
                }
            }
        
        except FileNotFoundError as e:
            error_msg = str(e)
            logger.error(f"File not found - Invoice: {invoice_number}: {error_msg}")
            
            try:
                waybill_print.status = WaybillPrintStatuses.ERROR.value
                waybill_print.error_message = error_msg
                db.session.commit()
            except Exception as db_error:
                logger.error(f"Failed to update database: {str(db_error)}")
            
            return {
                'status': 'error',
                'message': error_msg,
                'data': {
                    'waybill_id': waybill_print.id,
                    'invoice_number': invoice_number
                }
            }
        
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Thermal print failed - Invoice: {invoice_number}: {error_msg}", exc_info=True)
            
            try:
                waybill_print.status = WaybillPrintStatuses.ERROR.value
                waybill_print.error_message = error_msg
                db.session.commit()
            except Exception as db_error:
                logger.error(f"Failed to update database: {str(db_error)}")
            
            return {
                'status': 'error',
                'message': error_msg,
                'data': {
                    'waybill_id': waybill_print.id,
                    'invoice_number': invoice_number
                }
            }

