"""
Barcode/QR Code Validation Service

Validates that PDFs contain actual shipping data (barcodes/QR codes)
instead of placeholder/test documents.

Uses pyzbar for cross-platform barcode detection.
Works on Linux/RPi without system dependencies (except libzbar).
"""

import os
import tempfile
from pdf2image import convert_from_path
from pyzbar.pyzbar import decode
from app.utils.loggers import get_logger

logger = get_logger(__name__)


class BarcodeValidationService:
    """
    Service to validate PDFs contain actual barcodes/QR codes.
    """
    
    def __init__(self):
        """Initialize the service."""
        self.min_barcodes_per_page = 1  # At least 1 barcode/QR per page
    
    def validate_pdf_has_barcode(self, pdf_path: str, max_pages: int = 3) -> dict:
        """
        Check if PDF contains barcodes or QR codes.
        
        Args:
            pdf_path (str): Path to PDF file
            max_pages (int): Maximum pages to scan (performance)
        
        Returns:
            dict: {
                'valid': bool,
                'barcodes_found': int,
                'types': list (of barcode types found),
                'error': str (if validation failed)
            }
        """
        try:
            if not os.path.exists(pdf_path):
                return {
                    'valid': False,
                    'barcodes_found': 0,
                    'types': [],
                    'error': f'PDF file not found: {pdf_path}'
                }
            
            logger.info(f"[BARCODE VALIDATION] Starting validation for: {pdf_path}")
            
            # Convert PDF to images (only first N pages)
            try:
                images = convert_from_path(pdf_path, first_page=1, last_page=max_pages)
            except Exception as e:
                return {
                    'valid': False,
                    'barcodes_found': 0,
                    'types': [],
                    'error': f'Failed to convert PDF to images: {str(e)}'
                }
            
            if not images:
                return {
                    'valid': False,
                    'barcodes_found': 0,
                    'types': [],
                    'error': 'PDF appears to be empty or unreadable'
                }
            
            total_barcodes = 0
            barcode_types = set()
            
            # Scan each image for barcodes
            for page_num, image in enumerate(images, 1):
                try:
                    # Decode barcodes in this image
                    decoded_objects = decode(image)
                    
                    if decoded_objects:
                        logger.debug(f"[BARCODE VALIDATION] Page {page_num}: Found {len(decoded_objects)} barcode(s)")
                        
                        for obj in decoded_objects:
                            total_barcodes += 1
                            barcode_types.add(obj.type)
                            logger.debug(f"  - Type: {obj.type}, Data: {obj.data[:20]}...")  # Log first 20 chars
                    else:
                        logger.debug(f"[BARCODE VALIDATION] Page {page_num}: No barcodes found")
                
                except Exception as e:
                    logger.warning(f"[BARCODE VALIDATION] Error scanning page {page_num}: {str(e)}")
                    continue
            
            # Validation result
            is_valid = total_barcodes >= self.min_barcodes_per_page
            
            result = {
                'valid': is_valid,
                'barcodes_found': total_barcodes,
                'types': list(barcode_types),
                'error': None if is_valid else f'No barcodes/QR codes found (need at least {self.min_barcodes_per_page})'
            }
            
            if is_valid:
                logger.info(f"[BARCODE VALIDATION] ✅ PASSED - Found {total_barcodes} barcodes, Types: {list(barcode_types)}")
            else:
                logger.warning(f"[BARCODE VALIDATION] ❌ FAILED - {result['error']}")
            
            return result
        
        except Exception as e:
            logger.error(f"[BARCODE VALIDATION] Fatal error: {str(e)}", exc_info=True)
            return {
                'valid': False,
                'barcodes_found': 0,
                'types': [],
                'error': f'Barcode validation error: {str(e)}'
            }
    
    def validate_multiple_pages(self, pdf_path: str) -> dict:
        """
        Scan all pages of PDF for barcodes.
        
        Args:
            pdf_path (str): Path to PDF file
        
        Returns:
            dict: {
                'valid': bool,
                'pages_scanned': int,
                'pages_with_barcodes': int,
                'total_barcodes': int,
                'types': list,
                'error': str
            }
        """
        try:
            images = convert_from_path(pdf_path)
            
            total_barcodes = 0
            pages_with_barcodes = 0
            barcode_types = set()
            
            for page_num, image in enumerate(images, 1):
                try:
                    decoded_objects = decode(image)
                    if decoded_objects:
                        pages_with_barcodes += 1
                        total_barcodes += len(decoded_objects)
                        for obj in decoded_objects:
                            barcode_types.add(obj.type)
                except Exception as e:
                    logger.warning(f"Error scanning page {page_num}: {str(e)}")
            
            is_valid = pages_with_barcodes > 0
            
            return {
                'valid': is_valid,
                'pages_scanned': len(images),
                'pages_with_barcodes': pages_with_barcodes,
                'total_barcodes': total_barcodes,
                'types': list(barcode_types),
                'error': None if is_valid else 'No barcodes found in any page'
            }
        
        except Exception as e:
            logger.error(f"Multi-page validation error: {str(e)}", exc_info=True)
            return {
                'valid': False,
                'pages_scanned': 0,
                'pages_with_barcodes': 0,
                'total_barcodes': 0,
                'types': [],
                'error': str(e)
            }

