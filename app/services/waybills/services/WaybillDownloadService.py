import os
import pathlib
import requests
from datetime import datetime
from urllib.parse import urlparse
from pypdf import PdfReader, PdfWriter
from app.utils.loggers import get_logger
from app.database import db
from app.services.waybills.enums.WaybillPrintStatuses import WaybillPrintStatuses

logger = get_logger(__name__)


class WaybillDownloadService:
    """
    Service for downloading and storing waybill files.
    Similar to Laravel Service pattern for business logic separation.
    Handles file download, storage, and error handling.
    Cross-platform compatible for Linux (Raspberry Pi OS, Linux Mint, etc.)
    """
    
    def __init__(self):
        """
        Initialize the service.
        Always uses app/storage/waybills/ and creates directory if it doesn't exist.
        """
        # Always use app/storage/waybills/ (cross-platform compatible)
        # Navigate from app/services/waybills/services/ up 4 levels to app/
        app_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
        self.download_directory = os.path.join(app_dir, 'storage', 'waybills')
        
        # Ensure directory exists before downloading
        self._ensure_download_directory()
    
    def _ensure_download_directory(self):
        """Ensure app/storage/waybills/ directory exists, create if needed."""
        try:
            pathlib.Path(self.download_directory).mkdir(parents=True, exist_ok=True)
        except Exception as e:
            logger.error(f"Failed to create download directory: {str(e)}")
            raise
    
    def _get_filename_from_url(self, url: str) -> str:
        """Extract filename from URL or generate one."""
        try:
            # Try to get filename from URL path (before query string)
            parsed_url = urlparse(url)
            path = parsed_url.path
            
            # Remove query parameters
            filename = os.path.basename(path)
            
            # If filename is empty or no extension, return None to trigger fallback
            if not filename or not os.path.splitext(filename)[1]:
                return None
            
            return filename
        except Exception:
            return None
    
    def _sanitize_filename(self, filename: str) -> str:
        """Ensure safe filename (remove problematic characters)."""
        return "".join(c for c in filename if c.isalnum() or c in ('.', '-', '_')).rstrip()
    
    def _get_extension_from_content_type(self, content_type: str) -> str:
        """Get file extension from Content-Type header."""
        if not content_type:
            return None
        
        # Map common content types to extensions
        content_type_map = {
            'application/pdf': '.pdf',
            'image/png': '.png',
            'image/jpeg': '.jpg',
            'image/jpg': '.jpg',
            'image/gif': '.gif',
            'image/webp': '.webp',
            'application/zip': '.zip',
        }
        
        # Get base content type (before semicolon)
        base_type = content_type.split(';')[0].strip().lower()
        return content_type_map.get(base_type)
    
    def _get_waybill_from_third_party(self, waybill_print, invoice_number: str) -> str:
        """
        Generate fallback waybill URL from third-party API (Railway).
        Used when no waybill_url is provided from the initial response.
        
        Args:
            waybill_print: WaybillPrint model instance (contains tenant_id)
            invoice_number (str): Invoice number for the waybill
        
        Returns:
            str: Fallback waybill URL
        """
        tenant_id = waybill_print.tenant_id
        fallback_url = f"https://fusion-production-api-{tenant_id}.up.railway.app/api/waybills/{invoice_number}/print-waybill"
        logger.info(f"Using fallback third-party URL for invoice {invoice_number} (tenant: {tenant_id})")
        return fallback_url
    
    def _should_crop_pdf(self, marketplace: str = None) -> bool:
        """
        Determine if PDF should be cropped based on marketplace.
        Only Zalora and Shopify waybills are cropped to 4x6 inches.
        
        Args:
            marketplace (str, optional): Marketplace name
        
        Returns:
            bool: True if should crop, False otherwise
        """
        # Marketplaces that require 4x6 inch cropping
        crop_marketplaces = {'zalora', 'shopify'}
        
        if marketplace and marketplace.lower() in crop_marketplaces:
            return True
        
        return False
    
    def _get_crop_dimensions(self, marketplace: str = None) -> tuple:
        """
        Get crop dimensions based on marketplace.
        Returns width and height in points (72 DPI).
        Currently only Zalora and Shopify use custom dimensions.
        
        Args:
            marketplace (str, optional): Marketplace name
        
        Returns:
            tuple: (width, height) in points for 4x6 inches
        """
        # 4x6 inches in points (72 DPI)
        # 4 inches = 288 points, 6 inches = 432 points
        crop_width = 288
        crop_height = 432
        
        return (crop_width, crop_height)
    
    def _crop_pdf_to_label_size(self, pdf_path: str, invoice_number: str, marketplace: str = None, offset_x: int = 45, offset_y: int = 29) -> str:
        """
        Crop PDF to marketplace-specific label size (4x6 inches for thermal printer).
        Crops from top-left corner with optional offset to avoid cutting edges.
        Creates a new cropped PDF file while preserving the original.
        
        Args:
            pdf_path (str): Path to the original PDF file
            invoice_number (str): Invoice number for logging
            marketplace (str, optional): Marketplace name for size lookup
            offset_x (int): Horizontal offset from left edge in points (default 10)
            offset_y (int): Vertical offset from top edge in points (default 10)
        
        Returns:
            str: Path to the cropped PDF file
        
        Raises:
            Exception: If PDF cropping fails
        """
        try:
            crop_width, crop_height = self._get_crop_dimensions(marketplace)
            logger.info(f"Starting PDF crop to {crop_width}x{crop_height} points ({crop_width/72:.1f}x{crop_height/72:.1f} inches) with offset ({offset_x}, {offset_y}) - Invoice: {invoice_number}, Marketplace: {marketplace}, File: {pdf_path}")
            
            # Get dimensions in points
            label_width = crop_width
            label_height = crop_height
            
            # Read the original PDF
            reader = PdfReader(pdf_path)
            writer = PdfWriter()
            
            # Process each page
            for page_num, page in enumerate(reader.pages):
                # Get page dimensions
                original_width = page.mediabox.width
                original_height = page.mediabox.height
                
                logger.info(f"Processing page {page_num + 1} - Original size: {original_width}x{original_height} points")
                
                # Crop from TOP-LEFT with offset (PDF coordinates start at bottom-left)
                # lower_left = (offset_x, original_height - label_height - offset_y)
                # upper_right = (label_width + offset_x, original_height - offset_y)
                page.mediabox.lower_left = (offset_x, original_height - label_height - offset_y)
                page.mediabox.upper_right = (label_width + offset_x, original_height - offset_y)
                
                writer.add_page(page)
            
            # Generate cropped filename (replace extension)
            base_path = os.path.splitext(pdf_path)[0]
            cropped_path = f"{base_path}_cropped.pdf"
            
            # Save cropped PDF
            with open(cropped_path, 'wb') as f:
                writer.write(f)
            
            # Verify cropped file was created
            if not os.path.exists(cropped_path):
                raise IOError(f"Cropped PDF was not created successfully: {cropped_path}")
            
            original_size = os.path.getsize(pdf_path)
            cropped_size = os.path.getsize(cropped_path)
            
            logger.info(f"PDF cropped successfully - Invoice: {invoice_number}, Original size: {original_size} bytes, Cropped size: {cropped_size} bytes, Cropped file: {cropped_path}")
            
            # Delete original file and keep only the cropped version
            try:
                os.remove(pdf_path)
                logger.info(f"Original PDF file removed - Invoice: {invoice_number}, File: {pdf_path}")
            except Exception as e:
                logger.warning(f"Failed to delete original PDF file - Invoice: {invoice_number}: {str(e)}")
            
            return cropped_path
        
        except Exception as e:
            logger.error(f"Failed to crop PDF - Invoice: {invoice_number}, File: {pdf_path}: {str(e)}", exc_info=True)
            raise Exception(f"PDF cropping failed: {str(e)}")
    
    def _cleanup_old_waybill_file(self, old_file_path: str, invoice_number: str) -> None:
        """
        Clean up old waybill file when a new one is downloaded.
        
        Args:
            old_file_path (str): Path to the old waybill file to remove
            invoice_number (str): Invoice number for logging
        """
        if old_file_path and os.path.exists(old_file_path):
            try:
                os.remove(old_file_path)
                logger.info(f"Old waybill file cleaned up - Invoice: {invoice_number}, File: {old_file_path}")
            except Exception as e:
                logger.warning(f"Failed to delete old waybill file - Invoice: {invoice_number}, File: {old_file_path}: {str(e)}")
    
    def download(self, waybill_print, waybill_url: str, invoice_number: str) -> dict:
        """
        Download a waybill file from URL and save to local storage.
        Trusts Content-Type header over URL extension (server is authoritative).
        Automatically crops PDF files to A4 size for optimal printing.
        Updates the WaybillPrint record with download status and file path.
        
        Args:
            waybill_print: WaybillPrint model instance
            waybill_url (str): URL of the waybill file
            invoice_number (str): Invoice number for filename
        
        Returns:
            dict: {
                'status': 'success' or 'error',
                'message': str,
                'data': {
                    'waybill_id': int,
                    'invoice_number': str,
                    'filepath': str (if successful),
                    'filename': str (if successful),
                    'file_size': int (if successful)
                }
            }
        """
        try:
            # Store old file path for cleanup when re-downloading
            old_file_path = waybill_print.local_file_path
            
            # Use fallback URL if no waybill_url provided
            is_fallback_url = False
            if not waybill_url:
                waybill_url = self._get_waybill_from_third_party(waybill_print, invoice_number)
                is_fallback_url = True
            
            # Download file with timeout and streaming
            response = requests.get(waybill_url, timeout=30, stream=True)
            response.raise_for_status()
            
            # Log response details for debugging
            content_type = response.headers.get('Content-Type', 'Not specified')
            logger.info(f"Download response - Invoice: {invoice_number}, Content-Type: {content_type}, Fallback: {is_fallback_url}, Status: {response.status_code}")
            
            # PRIORITY 1: Check Content-Type header from server (authoritative source)
            extension = self._get_extension_from_content_type(content_type)
            
            # PRIORITY 2: Fallback to URL filename extension if Content-Type not recognized
            if not extension:
                url_filename = self._get_filename_from_url(waybill_url)
                if url_filename:
                    extension = os.path.splitext(url_filename)[1]
            
            # PRIORITY 3: Default to PDF if all else fails
            if not extension:
                extension = '.pdf'
            
            # Generate unique filename: id_invoice_number_datetime (no milliseconds)
            timestamp = datetime.now().strftime('%Y%m%d-%H%M%S')
            filename = f"{waybill_print.id}_{invoice_number}_{timestamp}{extension}"
            
            # Ensure safe filename
            filename = self._sanitize_filename(filename)
            
            filepath = os.path.join(self.download_directory, filename)
            
            # Save file to disk
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
            
            # Verify file was created
            if not os.path.exists(filepath):
                raise IOError(f"File was not saved successfully: {filepath}")
            
            original_file_size = os.path.getsize(filepath)
            
            # Log successful download
            logger.info(f"Waybill saved successfully - Invoice: {invoice_number}, File: {filename}, Size: {original_file_size} bytes, Fallback: {is_fallback_url}")
            
            # CROP PDF TO 4x6 INCHES for Zalora and Shopify only
            marketplace = waybill_print.marketplace
            if filepath.lower().endswith('.pdf') and self._should_crop_pdf(marketplace):
                try:
                    filepath = self._crop_pdf_to_label_size(filepath, invoice_number, marketplace)
                    filename = os.path.basename(filepath)
                    logger.info(f"PDF cropped to 4x6 inches - Invoice: {invoice_number}, Marketplace: {marketplace}, New file: {filename}")
                except Exception as crop_error:
                    logger.error(f"PDF cropping failed, but continuing with original file - Invoice: {invoice_number}: {str(crop_error)}")
                    # Continue with original file if cropping fails
            elif filepath.lower().endswith('.pdf'):
                logger.info(f"PDF skipping crop (not Zalora/Shopify) - Invoice: {invoice_number}, Marketplace: {marketplace}")
            
            file_size = os.path.getsize(filepath)
            
            # Update database record with download status
            waybill_print.status = WaybillPrintStatuses.DOWNLOADED.value
            waybill_print.local_file_path = filepath
            waybill_print.downloaded_at = datetime.now().replace(microsecond=0)
            db.session.commit()
            
            # Clean up old waybill file after successful new download
            self._cleanup_old_waybill_file(old_file_path, invoice_number)
            
            # Build success message based on whether cropping was applied
            if self._should_crop_pdf(waybill_print.marketplace):
                message = 'Waybill downloaded, cropped to 4x6 inches, and saved successfully'
            else:
                message = 'Waybill downloaded and saved successfully'
            
            return {
                'status': 'success',
                'message': message,
                'data': {
                    'waybill_id': waybill_print.id,
                    'invoice_number': invoice_number,
                    'filepath': filepath,
                    'filename': filename,
                    'file_size': file_size
                }
            }
        
        except requests.exceptions.Timeout:
            error_msg = "Download timed out. Please try again."
            logger.error(f"Download timeout for Invoice: {invoice_number}")
            
            # Update database with error status
            try:
                waybill_print.status = WaybillPrintStatuses.ERROR.value
                waybill_print.error_message = error_msg
                db.session.commit()
            except Exception as db_error:
                logger.error(f"Failed to update WaybillPrint on timeout: {str(db_error)}", exc_info=True)
            
            return {
                'status': 'error',
                'message': error_msg,
                'data': {
                    'waybill_id': waybill_print.id,
                    'invoice_number': invoice_number
                }
            }
        
        except requests.exceptions.RequestException as e:
            error_msg = f"Network error: {str(e)}"
            logger.error(f"Network error downloading waybill for Invoice: {invoice_number} - {str(e)}")
            
            # Update database with error status
            try:
                waybill_print.status = WaybillPrintStatuses.ERROR.value
                waybill_print.error_message = error_msg
                db.session.commit()
            except Exception as db_error:
                logger.error(f"Failed to update WaybillPrint on network error: {str(db_error)}", exc_info=True)
            
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
            logger.error(f"Error downloading waybill for Invoice: {invoice_number}: {error_msg}", exc_info=True)
            
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
                    'invoice_number': invoice_number
                }
            }

