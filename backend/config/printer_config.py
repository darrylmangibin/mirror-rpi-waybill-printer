import os
from enum import Enum


class PrinterMode(Enum):
    """Supported printer modes"""
    CUPS = 'cups'
    ESCPOS = 'escpos'
    MOCK = 'mock'


class PrinterConfig:
    """
    Printer configuration loader from environment variables.
    Provides centralized printer settings management.
    """
    
    @staticmethod
    def load():
        """
        Load printer configuration from environment variables.
        
        Returns:
            dict: Configuration dictionary with all printer settings
            
        Raises:
            ValueError: If invalid printer mode is specified
        """
        printer_mode = os.getenv('PRINTER_MODE', 'mock').lower()
        
        # Validate printer mode
        valid_modes = [mode.value for mode in PrinterMode]
        if printer_mode not in valid_modes:
            raise ValueError(
                f"Invalid PRINTER_MODE '{printer_mode}'. "
                f"Valid options: {', '.join(valid_modes)}"
            )
        
        config = {
            'mode': printer_mode,
            'enabled': os.getenv('PRINT_ENABLED', 'true').lower() == 'true',
            'printer_name': os.getenv('PRINTER_NAME', 'default'),
            'usb_vendor': os.getenv('PRINTER_USB_VENDOR', '0x04b8'),
            'usb_product': os.getenv('PRINTER_USB_PRODUCT', '0x0005'),
        }
        
        return config
    
    @staticmethod
    def get_mode():
        """Get current printer mode"""
        return os.getenv('PRINTER_MODE', 'mock').lower()
    
    @staticmethod
    def is_enabled():
        """Check if printing is enabled"""
        return os.getenv('PRINT_ENABLED', 'true').lower() == 'true'
