"""
Printer Configuration Constants

This file centralizes all printer settings for easy configuration and maintenance.
All settings can be overridden via environment variables.

Environment Variables:
- PRINTER_NAME: Name of the CUPS printer to use (default: system default)
- PRINTER_MODE: "raw" or "standard" (default: "raw" for thermal printers)
- PRINTER_DPI: DPI for image conversion (default: 203 for thermal printers)
- PRINTER_CONVERT_PDF: "true" to convert PDF to PNG (default: "true")
- PRINTER_SCALING: Print scaling percentage (default: 100)
- PRINTER_FIT_TO_PAGE: "true" to fit content to page (default: "true")
- AWB_LABEL_WIDTH_MM: Label width in mm (default: 102)
- AWB_LABEL_HEIGHT_MM: Label height in mm (default: 127)
"""

import os
from app.services.waybills.constants.AwbPaperSize import AWB_WIDTH_MM, AWB_HEIGHT_MM


class PrinterConfig:
    """Centralized printer configuration."""
    
    # ==================== PRINTER IDENTIFICATION ====================
    PRINTER_NAME = os.getenv('PRINTER_NAME', None)  # None = use system default
    
    # ==================== PRINTER MODE ====================
    # "raw" - Send data directly to printer (bypasses format validation)
    # "standard" - Use CUPS standard IPP protocol
    PRINTER_MODE = os.getenv('PRINTER_MODE', 'raw')
    
    # ==================== IMAGE CONVERSION ====================
    # DPI for converting PDF to PNG (203 DPI is optimal for 80mm thermal printers)
    PRINTER_DPI = int(os.getenv('PRINTER_DPI', '203'))
    
    # Whether to convert PDF to PNG for thermal printer compatibility
    CONVERT_PDF_TO_PNG = os.getenv('PRINTER_CONVERT_PDF', 'true').lower() == 'true'
    
    # ==================== LABEL DIMENSIONS ====================
    # IATA Standard AWB Label Size (102mm × 127mm = 4" × 5")
    LABEL_WIDTH_MM = int(os.getenv('AWB_LABEL_WIDTH_MM', str(AWB_WIDTH_MM)))
    LABEL_HEIGHT_MM = int(os.getenv('AWB_LABEL_HEIGHT_MM', str(AWB_HEIGHT_MM)))
    
    # ==================== PRINT OPTIONS ====================
    # Print scaling percentage (100 = no scaling)
    SCALING = int(os.getenv('PRINTER_SCALING', '100'))
    
    # Fit content to page
    FIT_TO_PAGE = os.getenv('PRINTER_FIT_TO_PAGE', 'true').lower() == 'true'
    
    # ==================== IMAGE CONVERSION OPTIONS ====================
    # Convert RGBA to RGB for thermal printer compatibility
    CONVERT_COLOR_MODE = os.getenv('PRINTER_CONVERT_COLOR_MODE', 'true').lower() == 'true'
    
    @staticmethod
    def get_print_options(label_width_mm=None, label_height_mm=None, scaling=None) -> dict:
        """
        Generate CUPS print options based on current configuration.
        
        Args:
            label_width_mm (int, optional): Override label width in mm
            label_height_mm (int, optional): Override label height in mm
            scaling (int, optional): Override scaling percentage
            
        Returns:
            dict: Print options dictionary for CUPS
        """
        width = label_width_mm or PrinterConfig.LABEL_WIDTH_MM
        height = label_height_mm or PrinterConfig.LABEL_HEIGHT_MM
        scale = scaling or PrinterConfig.SCALING
        
        options = {
            "media": f"Custom.{width}x{height}mm",
            "scaling": str(scale),
        }
        
        # Add fit-to-page if enabled
        if PrinterConfig.FIT_TO_PAGE:
            options["fit-to-page"] = "true"
        
        # Add raw mode if configured
        if PrinterConfig.PRINTER_MODE == 'raw':
            options["raw"] = "true"
        
        return options
    
    @staticmethod
    def should_convert_pdf_to_png(file_path: str) -> bool:
        """
        Determine if a file should be converted from PDF to PNG.
        
        Args:
            file_path (str): Path to the file
            
        Returns:
            bool: True if file is PDF and conversion is enabled
        """
        is_pdf = file_path.lower().endswith('.pdf')
        return is_pdf and PrinterConfig.CONVERT_PDF_TO_PNG
    
    @staticmethod
    def get_summary() -> str:
        """Get a summary of current printer configuration for logging."""
        return (
            f"Printer: {PrinterConfig.PRINTER_NAME or 'system default'} | "
            f"Mode: {PrinterConfig.PRINTER_MODE} | "
            f"Label: {PrinterConfig.LABEL_WIDTH_MM}x{PrinterConfig.LABEL_HEIGHT_MM}mm | "
            f"Scaling: {PrinterConfig.SCALING}% | "
            f"PDF→PNG: {PrinterConfig.CONVERT_PDF_TO_PNG}"
        )

