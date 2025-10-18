import subprocess
import os
from abc import ABC, abstractmethod
from config.printer_config import PrinterConfig, PrinterMode


class BasePrinterService(ABC):
    """Abstract base class for printer services"""
    
    def __init__(self, app=None):
        """
        Initialize printer service.
        
        Args:
            app: Flask app instance for logging
        """
        self.app = app
    
    @abstractmethod
    def print_file(self, file_path, printer_name=None):
        """
        Print a file.
        
        Args:
            file_path: Path to file to print
            printer_name: Optional printer name/identifier
            
        Returns:
            dict: {
                'success': bool,
                'message': str,
                'error': str or None
            }
        """
        pass
    
    def _log(self, message, level='info'):
        """Log message using Flask app logger if available"""
        if self.app:
            getattr(self.app.logger, level)(message)
        print(message)


class CupsPrinterService(BasePrinterService):
    """
    CUPS-based printer service for standard printers (Epson L120, etc.)
    Uses subprocess to call the 'lp' command.
    """
    
    def print_file(self, file_path, printer_name=None):
        """
        Print file using CUPS (lp command).
        
        Args:
            file_path: Path to PDF file to print
            printer_name: CUPS printer name (uses PRINTER_NAME from env if not provided)
            
        Returns:
            dict: Print result status
        """
        try:
            # Validate file exists
            if not os.path.exists(file_path):
                return {
                    'success': False,
                    'message': 'Print failed',
                    'error': f'File not found: {file_path}'
                }
            
            # Use provided printer name or environment default
            config = PrinterConfig.load()
            printer = printer_name or config['printer_name'] or 'default'
            
            # Build lp command
            cmd = ['lp', '-d', printer, file_path]
            
            self._log(f"CUPS: Printing file {file_path} to printer '{printer}'")
            
            # Execute print command
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode == 0:
                message = f"Print job submitted successfully to {printer}"
                self._log(message)
                return {
                    'success': True,
                    'message': message,
                    'error': None
                }
            else:
                error_msg = result.stderr or result.stdout or "Unknown error"
                return {
                    'success': False,
                    'message': 'Print command failed',
                    'error': error_msg
                }
        
        except subprocess.TimeoutExpired:
            return {
                'success': False,
                'message': 'Print timeout',
                'error': 'Print job timed out after 30 seconds'
            }
        except FileNotFoundError:
            return {
                'success': False,
                'message': 'CUPS not available',
                'error': 'lp command not found. Make sure CUPS is installed.'
            }
        except Exception as e:
            return {
                'success': False,
                'message': 'Print error',
                'error': str(e)
            }


class EscposPrinterService(BasePrinterService):
    """
    ESC/POS printer service for thermal printers (XPrinter, etc.)
    Uses python-escpos library for direct USB communication.
    """
    
    def print_file(self, file_path, printer_name=None):
        """
        Print file to ESC/POS thermal printer.
        
        Args:
            file_path: Path to PDF file to print
            printer_name: Optional (not used for USB thermal printers)
            
        Returns:
            dict: Print result status
        """
        try:
            # Check if file exists
            if not os.path.exists(file_path):
                return {
                    'success': False,
                    'message': 'Print failed',
                    'error': f'File not found: {file_path}'
                }
            
            # Lazy import to avoid dependency if not using this mode
            try:
                from escpos.printer import Usb
                from PIL import Image
            except ImportError:
                return {
                    'success': False,
                    'message': 'ESC/POS libraries not installed',
                    'error': 'python-escpos or Pillow not installed. Run: pip install python-escpos pillow'
                }
            
            # Get USB IDs from config
            config = PrinterConfig.load()
            try:
                usb_vendor = int(config['usb_vendor'], 16)
                usb_product = int(config['usb_product'], 16)
            except ValueError:
                return {
                    'success': False,
                    'message': 'Invalid USB configuration',
                    'error': 'PRINTER_USB_VENDOR or PRINTER_USB_PRODUCT is not a valid hex value'
                }
            
            self._log(f"ESC/POS: Printing file {file_path} to thermal printer (USB {hex(usb_vendor)}:{hex(usb_product)})")
            
            # Connect to USB printer
            printer = Usb(usb_vendor, usb_product)
            
            # For now, print a notification that we're processing the file
            # In production, you would convert PDF to image and print
            printer.text("Waybill Document\n")
            printer.text(f"File: {os.path.basename(file_path)}\n")
            printer.cut()
            
            message = "Print job sent to thermal printer"
            self._log(message)
            
            return {
                'success': True,
                'message': message,
                'error': None
            }
        
        except Exception as e:
            error_msg = str(e)
            self._log(f"ESC/POS error: {error_msg}", 'error')
            return {
                'success': False,
                'message': 'Print error',
                'error': error_msg
            }


class MockPrinterService(BasePrinterService):
    """
    Mock printer service for testing and development.
    Simulates printing without actual hardware.
    """
    
    def print_file(self, file_path, printer_name=None):
        """
        Simulate printing a file.
        
        Args:
            file_path: Path to file to "print"
            printer_name: Optional mock printer name
            
        Returns:
            dict: Simulated success response
        """
        try:
            if not os.path.exists(file_path):
                return {
                    'success': False,
                    'message': 'Print simulation failed',
                    'error': f'File not found: {file_path}'
                }
            
            file_size = os.path.getsize(file_path)
            message = f"[MOCK] Print job simulated: {os.path.basename(file_path)} ({file_size} bytes)"
            self._log(message)
            
            return {
                'success': True,
                'message': message,
                'error': None
            }
        
        except Exception as e:
            return {
                'success': False,
                'message': 'Mock print error',
                'error': str(e)
            }


class PrinterServiceFactory:
    """Factory to create appropriate printer service based on configuration"""
    
    @staticmethod
    def create(app=None):
        """
        Create printer service based on PRINTER_MODE environment variable.
        
        Args:
            app: Flask app instance for logging
            
        Returns:
            BasePrinterService: Appropriate printer service instance
            
        Raises:
            ValueError: If invalid printer mode is configured
        """
        mode = PrinterConfig.get_mode()
        
        if mode == PrinterMode.CUPS.value:
            return CupsPrinterService(app)
        elif mode == PrinterMode.ESCPOS.value:
            return EscposPrinterService(app)
        elif mode == PrinterMode.MOCK.value:
            return MockPrinterService(app)
        else:
            raise ValueError(f"Unknown printer mode: {mode}")
