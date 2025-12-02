import os
import pathlib
import requests
from datetime import datetime
from urllib.parse import urlparse
from pypdf import PdfReader, PdfWriter
from app.utils.loggers import get_logger
from app.database import db
from app.services.waybills.enums.WaybillPrintStatuses import WaybillPrintStatuses
from app.services.waybills.enums.Marketplaces import Marketplaces
from app.services.waybills.config.download_service_config import config, get_crop_offset
from app.config.helper import get as config_get
import asyncio
from playwright.async_api import async_playwright

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
    
    def _get_waybill_from_third_party(self, waybill_print, invoice_number: str) -> tuple:
        """
        Generate fallback waybill URL from third-party API based on marketplace.
        Used when no waybill_url is provided from the initial response.
        
        Uses FusionTech hosted URL as universal fallback for all marketplaces with Shopify crop offsets.
        
        Args:
            waybill_print: WaybillPrint model instance (contains tenant_id, marketplace)
            invoice_number (str): Invoice number for the waybill
        
        Returns:
            tuple: (fallback_url, crop_marketplace) where crop_marketplace is always Shopify for consistent crop offsets
        """
        tenant_id = waybill_print.tenant_id
        marketplace = waybill_print.marketplace
        
        # Use FusionTech hosted pattern for all marketplaces as universal fallback
        fallback_url = f"https://{tenant_id}.fusiontech.asia/jnt/waybill/{invoice_number}"
        logger.info(f"Using FusionTech fallback URL for invoice {invoice_number} (tenant: {tenant_id}, marketplace: {marketplace}), applying Shopify crop offsets")
        
        # Always use Shopify offsets for consistent PDF cropping across all marketplaces
        return (fallback_url, Marketplaces.SHOPIFY.value)
    
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
        crop_marketplaces = Marketplaces.get_crop_eligible_marketplaces()
        
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
        # Edit config['pdf'] in app/services/waybills/config/download_service_config.py to change dimensions
        return (config['pdf']['label_width_points'], config['pdf']['label_height_points'])
    
    def _is_html_content(self, response) -> bool:
        """
        Check if the response is HTML instead of a file.
        Used to detect when API returns a webpage instead of a direct file.
        
        Args:
            response: requests.Response object
        
        Returns:
            bool: True if content is HTML, False otherwise
        """
        try:
            content_type = response.headers.get('Content-Type', '').lower()
            
            # Check if Content-Type header indicates HTML
            if 'text/html' in content_type:
                logger.info(f"HTML detected from Content-Type header: {content_type}")
                return True
            
            # Also check the actual content (fallback) - peek at first bytes
            content = response.content[:config['file_io']['html_preview_size']]
            try:
                text = content.decode(config['encoding']['default_encoding'], errors='ignore')
                if text.startswith('<!DOCTYPE') or '<html' in text.lower() or '<?xml' in text:
                    logger.info(f"HTML detected from content inspection")
                    return True
            except:
                pass
            
            return False
        except Exception as e:
            logger.warning(f"Error checking if content is HTML: {str(e)}")
            return False
    
    def _validate_waybill_content(self, filepath: str, invoice_number: str) -> dict:
        """
        Validate that the downloaded waybill file contains actual waybill content,
        not placeholder text like "Generating waybill please wait".
        
        Checks:
        - PDF: Extract text and check for "Generating" keywords
        - Image (PNG/JPG): Check file size (too small = probably placeholder)
        
        Returns:
            dict: {
                'is_valid': bool,
                'reason': str,
                'keywords_found': list
            }
        """
        try:
            forbidden_keywords = [
                'generating',
                'please wait',
                'processing',
                'loading',
                'preparing'
            ]
            
            # Handle PDF files
            if filepath.lower().endswith('.pdf'):
                try:
                    reader = PdfReader(filepath)
                    
                    # Extract text from all pages
                    full_text = ""
                    for page in reader.pages:
                        full_text += page.extract_text().lower()
                    
                    # Check for forbidden keywords
                    found_keywords = [kw for kw in forbidden_keywords if kw in full_text]
                    
                    if found_keywords:
                        logger.warning(f"Waybill still generating - Invoice: {invoice_number}, Found: {found_keywords}")
                        return {
                            'is_valid': False,
                            'reason': f"Waybill still generating. Found: {', '.join(found_keywords)}",
                            'keywords_found': found_keywords
                        }
                    
                    # Check if PDF has actual content (not just blank pages)
                    if len(full_text.strip()) < 10:
                        return {
                            'is_valid': False,
                            'reason': "PDF appears to be blank or empty",
                            'keywords_found': []
                        }
                    
                    logger.info(f"PDF content validated successfully - Invoice: {invoice_number}")
                    return {
                        'is_valid': True,
                        'reason': 'PDF content validated successfully',
                        'keywords_found': []
                    }
                
                except Exception as e:
                    logger.error(f"PDF validation failed - Invoice: {invoice_number}: {str(e)}")
                    # Assume valid if can't read (might be encrypted, corrupted but valid)
                    return {
                        'is_valid': True,
                        'reason': f'Could not fully validate PDF: {str(e)}',
                        'keywords_found': []
                    }
            
            # Handle image files
            elif filepath.lower().endswith(('.png', '.jpg', '.jpeg')):
                # For images, check file size (too small = probably placeholder)
                file_size = os.path.getsize(filepath)
                if file_size < 5000:  # Less than 5KB = probably placeholder
                    logger.warning(f"Image file too small - Invoice: {invoice_number}, Size: {file_size} bytes")
                    return {
                        'is_valid': False,
                        'reason': f"Image file too small ({file_size} bytes) - likely placeholder. Please wait and retry.",
                        'keywords_found': []
                    }
                
                logger.info(f"Image file size validated - Invoice: {invoice_number}, Size: {file_size} bytes")
                return {
                    'is_valid': True,
                    'reason': 'Image file size validated',
                    'keywords_found': []
                }
            
            # Unknown format - assume valid
            logger.info(f"Unknown file type, skipping validation - Invoice: {invoice_number}")
            return {
                'is_valid': True,
                'reason': 'Unknown file type - skipping validation',
                'keywords_found': []
            }
        
        except Exception as e:
            logger.error(f"Validation error - Invoice: {invoice_number}: {str(e)}")
            # On error, assume valid to not break the download process
            return {
                'is_valid': True,
                'reason': f'Validation error (assuming valid): {str(e)}',
                'keywords_found': []
            }
    
    async def _convert_webpage_to_pdf(self, url: str, invoice_number: str, output_path: str) -> bool:
        """
        Convert a webpage (HTML) to PDF using headless browser (Playwright).
        Used when the waybill endpoint returns HTML instead of direct PDF.
        
        Args:
            url (str): URL of the webpage to convert
            invoice_number (str): Invoice number for logging
            output_path (str): Where to save the PDF
        
        Returns:
            bool: True if successful, False otherwise
        
        Raises:
            Exception: If conversion fails
        """
        try:
            logger.info(f"Starting webpage-to-PDF conversion - Invoice: {invoice_number}, URL: {url}")
            
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                page = await browser.new_page()
                
                logger.info(f"Playwright browser launched, loading page - Invoice: {invoice_number}")
                
                # Navigate to the URL and wait for page to be interactive
                # Using 'domcontentloaded' instead of 'networkidle' to avoid timeout on pages with persistent background requests
                # This waits for the page to be visible and interactive, not for ALL network requests to finish
                # Edit config['timeouts'] in app/services/waybills/config/download_service_config.py to adjust timeouts
                await page.goto(url, wait_until=config['playwright']['page_load_wait_until'], timeout=config['timeouts']['playwright_page_load_ms'])
                
                # Give the page an extra moment to fully render
                await page.wait_for_timeout(config['timeouts']['playwright_render_delay_ms'])
                
                logger.info(f"Page loaded, generating PDF - Invoice: {invoice_number}")
                
                # Generate PDF with configured format (standard paper size)
                await page.pdf(path=output_path, format=config['pdf']['page_format'])
                
                await browser.close()
                
                # Verify file was created
                if not os.path.exists(output_path):
                    raise IOError(f"PDF file was not created: {output_path}")
                
                file_size = os.path.getsize(output_path)
                logger.info(f"Webpage converted to PDF successfully - Invoice: {invoice_number}, File size: {file_size} bytes, Path: {output_path}")
                
                return True
                
        except Exception as e:
            logger.error(f"Failed to convert webpage to PDF - Invoice: {invoice_number}, URL: {url}: {str(e)}", exc_info=True)
            raise Exception(f"Webpage-to-PDF conversion failed: {str(e)}")
    
    def _crop_pdf_to_label_size(self, pdf_path: str, invoice_number: str, marketplace: str = None, offset_x: int = None, offset_y: int = None) -> str:
        """
        Crop PDF to marketplace-specific label size (4x6 inches for thermal printer).
        Crops from top-left corner with optional offset to avoid cutting edges.
        Creates a new cropped PDF file while preserving the original.
        
        Args:
            pdf_path (str): Path to the original PDF file
            invoice_number (str): Invoice number for logging
            marketplace (str, optional): Marketplace name for size lookup
            offset_x (int): Horizontal offset from left edge in points (default varies by marketplace)
            offset_y (int): Vertical offset from top edge in points (default varies by marketplace)
        
        Returns:
            str: Path to the cropped PDF file
        
        Raises:
            Exception: If PDF cropping fails
        """
        try:
            # Set marketplace-specific offsets
            # Negative offsets expand the crop box outward for padding
            # Positive offsets shrink the crop box inward
            # Edit config['crop_offsets'] in app/services/waybills/config/download_service_config.py to adjust offsets
            if offset_x is None or offset_y is None:
                if marketplace and marketplace.lower() == Marketplaces.SHOPIFY.value:
                    # Shopify: negative offset to add white space padding (expand outward)
                    offset_x = offset_x if offset_x is not None else config['crop_offsets']['shopify']['x']
                    offset_y = offset_y if offset_y is not None else config['crop_offsets']['shopify']['y']
                elif marketplace and marketplace.lower() == Marketplaces.ZALORA.value:
                    # Zalora: positive offset to shrink from edges
                    offset_x = offset_x if offset_x is not None else config['crop_offsets']['zalora']['x']
                    offset_y = offset_y if offset_y is not None else config['crop_offsets']['zalora']['y']
                else:
                    # Other marketplaces: default small positive offset for safety
                    offset_x = offset_x if offset_x is not None else config['crop_offsets']['default']['x']
                    offset_y = offset_y if offset_y is not None else config['crop_offsets']['default']['y']
            
            crop_width, crop_height = self._get_crop_dimensions(marketplace)
            dpi = config['pdf']['dpi']
            logger.info(f"Starting PDF crop to {crop_width}x{crop_height} points ({crop_width/dpi:.1f}x{crop_height/dpi:.1f} inches) with offset ({offset_x}, {offset_y}) - Invoice: {invoice_number}, Marketplace: {marketplace}, File: {pdf_path}")
            
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
                # For Shopify/Zalora: crop to 4x6" starting near the top-left corner
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
            crop_marketplace = waybill_print.marketplace  # Default to original marketplace
            if not waybill_url:
                waybill_url, crop_marketplace = self._get_waybill_from_third_party(waybill_print, invoice_number)
                is_fallback_url = True
            
            # Download file with timeout and streaming
            # Edit config['timeouts'] in app/services/waybills/config/download_service_config.py to adjust timeout
            response = requests.get(waybill_url, timeout=config['timeouts']['requests_download_sec'], stream=True)
            response.raise_for_status()
            
            # Log response details for debugging
            content_type = response.headers.get('Content-Type', 'Not specified')
            logger.info(f"Download response - Invoice: {invoice_number}, Content-Type: {content_type}, Fallback: {is_fallback_url}, Status: {response.status_code}")
            
            # CHECK: If API returns HTML instead of file, convert webpage to PDF
            if self._is_html_content(response):
                logger.info(f"HTML content detected, converting webpage to PDF - Invoice: {invoice_number}, URL: {waybill_url}")
                
                # Generate filename for the PDF
                timestamp = datetime.now().strftime(config['encoding']['timestamp_format'])
                filename = f"{waybill_print.id}_{invoice_number}_{timestamp}.pdf"
                filename = self._sanitize_filename(filename)
                filepath = os.path.join(self.download_directory, filename)
                
                # Convert webpage to PDF using Playwright
                try:
                    asyncio.run(self._convert_webpage_to_pdf(waybill_url, invoice_number, filepath))
                    logger.info(f"Webpage conversion successful - Invoice: {invoice_number}, Output file: {filename}")
                    
                    # Get file size after conversion
                    file_size = os.path.getsize(filepath)
                    
                    # CROP PDF TO 4x6 INCHES for Zalora and Shopify only
                    if self._should_crop_pdf(crop_marketplace):
                        try:
                            filepath = self._crop_pdf_to_label_size(filepath, invoice_number, crop_marketplace)
                            filename = os.path.basename(filepath)
                            logger.info(f"PDF cropped to 4x6 inches after webpage conversion - Invoice: {invoice_number}")
                        except Exception as crop_error:
                            logger.error(f"PDF cropping failed after conversion, continuing with original - Invoice: {invoice_number}: {str(crop_error)}")
                    
                    file_size = os.path.getsize(filepath)
                    
                    # Update database record
                    waybill_print.status = WaybillPrintStatuses.DOWNLOADED.value
                    waybill_print.local_file_path = filepath
                    waybill_print.downloaded_at = datetime.now().replace(microsecond=0)
                    db.session.commit()
                    
                    # Clean up old waybill file
                    self._cleanup_old_waybill_file(old_file_path, invoice_number)
                    
                    # Build success message
                    if self._should_crop_pdf(crop_marketplace):
                        message = 'Waybill webpage converted to PDF, cropped to 4x6 inches, and saved successfully'
                    else:
                        message = 'Waybill webpage converted to PDF and saved successfully'
                    
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
                except Exception as e:
                    error_msg = f"Failed to convert webpage to PDF: {str(e)}"
                    logger.error(f"Webpage-to-PDF conversion error - Invoice: {invoice_number}: {error_msg}", exc_info=True)
                    
                    # Update database with error status
                    try:
                        waybill_print.status = WaybillPrintStatuses.ERROR.value
                        waybill_print.error_message = error_msg
                        db.session.commit()
                    except Exception as db_error:
                        logger.error(f"Failed to update WaybillPrint on conversion error: {str(db_error)}", exc_info=True)
                    
                    return {
                        'status': 'error',
                        'message': error_msg,
                        'data': {
                            'waybill_id': waybill_print.id,
                            'invoice_number': invoice_number
                        }
                    }
            
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
            timestamp = datetime.now().strftime(config['encoding']['timestamp_format'])
            filename = f"{waybill_print.id}_{invoice_number}_{timestamp}{extension}"
            
            # Ensure safe filename
            filename = self._sanitize_filename(filename)
            
            filepath = os.path.join(self.download_directory, filename)
            
            # Save file to disk
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=config['file_io']['download_chunk_size']):
                    if chunk:
                        f.write(chunk)
            
            # Verify file was created
            if not os.path.exists(filepath):
                raise IOError(f"File was not saved successfully: {filepath}")
            
            original_file_size = os.path.getsize(filepath)
            
            # Log successful download
            logger.info(f"Waybill saved successfully - Invoice: {invoice_number}, File: {filename}, Size: {original_file_size} bytes, Fallback: {is_fallback_url}")
            
            # CROP PDF TO 4x6 INCHES for Zalora and Shopify only
            if filepath.lower().endswith('.pdf') and self._should_crop_pdf(crop_marketplace):
                try:
                    filepath = self._crop_pdf_to_label_size(filepath, invoice_number, crop_marketplace)
                    filename = os.path.basename(filepath)
                    logger.info(f"PDF cropped to 4x6 inches - Invoice: {invoice_number}, Crop marketplace: {crop_marketplace}, New file: {filename}")
                except Exception as crop_error:
                    logger.error(f"PDF cropping failed, but continuing with original file - Invoice: {invoice_number}: {str(crop_error)}")
                    # Continue with original file if cropping fails
            elif filepath.lower().endswith('.pdf'):
                logger.info(f"PDF skipping crop (not Zalora/Shopify) - Invoice: {invoice_number}, Marketplace: {waybill_print.marketplace}")
            
            file_size = os.path.getsize(filepath)
            
            # Validate waybill content - check if file is not a placeholder/generating message
            validation = self._validate_waybill_content(filepath, invoice_number)
            if not validation['is_valid']:
                # File is invalid (still generating or blank)
                waybill_print.status = WaybillPrintStatuses.ERROR.value
                waybill_print.error_message = validation['reason']
                db.session.commit()
                
                logger.warning(f"[VALIDATION FAILED] Waybill content invalid - Invoice: {invoice_number}: {validation['reason']}")
                
                return {
                    "status": "error",
                    "message": validation['reason'],
                    "data": {
                        "waybill_id": waybill_print.id,
                        "invoice_number": invoice_number
                    }
                }
            
            # Update database record with download status
            waybill_print.status = WaybillPrintStatuses.DOWNLOADED.value
            waybill_print.local_file_path = filepath
            waybill_print.downloaded_at = datetime.now().replace(microsecond=0)
            db.session.commit()
            
            # Clean up old waybill file after successful new download
            self._cleanup_old_waybill_file(old_file_path, invoice_number)
            
            # Build success message based on whether cropping was applied
            if self._should_crop_pdf(crop_marketplace):
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

