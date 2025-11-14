"""
Printer Configuration - Static Values for XPrinter-XP410B Thermal Printer

This file contains hardcoded printer settings optimized for reliable thermal printing.
No environment variables - all values are static for consistency and reliability.
"""


class PrinterConfig:
    """Static printer configuration for XPrinter-XP410B."""
    
    # ==================== PRINTER IDENTIFICATION ====================
    # Static printer name - must match CUPS queue name exactly
    PRINTER_NAME = "XP-410B"
    
    # ==================== PRINTER MODE ====================
    # "raw" - Send data directly to printer (required for thermal printers)
    PRINTER_MODE = "raw"
    
    # ==================== IMAGE CONVERSION ====================
    # DPI for converting PDF to PNG (203 DPI is optimal for 80mm thermal printers)
    PRINTER_DPI = 203
    
    # Always convert PDF to PNG for thermal printer compatibility
    CONVERT_PDF_TO_PNG = True
    
    # ==================== LABEL DIMENSIONS ====================
    # IATA Standard AWB Label Size (102mm × 127mm = 4" × 5")
    # Static values - no dynamic loading from environment or other files
    LABEL_WIDTH_MM = 102
    LABEL_HEIGHT_MM = 127
    
    # ==================== PRINT OPTIONS ====================
    # Print scaling percentage (100 = no scaling)
    SCALING = 100
    
    # Fit content to page
    FIT_TO_PAGE = True
    
    # ==================== IMAGE CONVERSION OPTIONS ====================
    # Convert RGBA to RGB for thermal printer compatibility
    CONVERT_COLOR_MODE = True
    
    @staticmethod
    def get_print_options(label_width_mm=None, label_height_mm=None, scaling=None) -> dict:
        """
        Generate CUPS print options with static, reliable settings.
        
        Args:
            label_width_mm (int, optional): Override label width in mm
            label_height_mm (int, optional): Override label height in mm
            scaling (int, optional): Override scaling percentage
            
        Returns:
            dict: Print options dictionary for CUPS
        """
        # Use provided values or static defaults
        width = label_width_mm or 102
        height = label_height_mm or 127
        scale = scaling or 100
        
        # Static options for thermal printer compatibility
        options = {
            "media": f"Custom.{width}x{height}mm",
            "scaling": str(scale),
            "fit-to-page": "true",
            "raw": "true",
        }
        
        return options
    
    @staticmethod
    def should_convert_pdf_to_png(file_path: str) -> bool:
        """
        Check if file should be converted from PDF to PNG.
        Always returns True for PDF files (conversion is always enabled).
        
        Args:
            file_path (str): Path to the file
            
        Returns:
            bool: True if file is PDF
        """
        return file_path.lower().endswith('.pdf')
    
    @staticmethod
    def get_summary() -> str:
        """Get printer configuration summary for logging."""
        return (
            f"Printer: XP-410B | "
            f"Mode: raw | "
            f"Label: 102x127mm | "
            f"Scaling: 100% | "
            f"PDF→PNG: Always"
        )

