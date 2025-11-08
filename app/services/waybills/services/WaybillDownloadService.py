import os
import pathlib
import requests
from datetime import datetime
from urllib.parse import urlparse
from app.utils.loggers import get_logger

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
            logger.info(f"Download directory ready: {self.download_directory}")
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
    
    def download(self, waybill_url: str, invoice_number: str, waybill_id: int) -> dict:
        """
        Download a waybill file from URL and save to local storage.
        Trusts Content-Type header over URL extension (server is authoritative).
        
        Args:
            waybill_url (str): URL of the waybill file
            invoice_number (str): Invoice number for filename
            waybill_id (int): Waybill print ID for unique filename
        
        Returns:
            dict: {
                'success': bool,
                'filepath': str (if successful),
                'filename': str (if successful),
                'file_size': int (if successful),
                'error': str (if failed)
            }
        """
        try:
            logger.info(f"File download initiated - Invoice: {invoice_number}, URL: {waybill_url}")
            
            # Download file with timeout and streaming
            response = requests.get(waybill_url, timeout=30, stream=True)
            response.raise_for_status()
            
            # PRIORITY 1: Check Content-Type header from server (authoritative source)
            extension = self._get_extension_from_content_type(response.headers.get('Content-Type'))
            
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
            filename = f"{waybill_id}_{invoice_number}_{timestamp}{extension}"
            
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
            
            file_size = os.path.getsize(filepath)
            logger.info(f"File downloaded successfully - Invoice: {invoice_number}, Path: {filepath}, Size: {file_size} bytes")
            
            return {
                'success': True,
                'filepath': filepath,
                'filename': filename,
                'file_size': file_size
            }
        
        except requests.exceptions.Timeout:
            error_msg = f"Download timeout for Invoice: {invoice_number}"
            logger.error(error_msg)
            return {
                'success': False,
                'error': "Download timed out. Please try again."
            }
        
        except requests.exceptions.RequestException as e:
            error_msg = f"Network error downloading waybill for Invoice: {invoice_number} - {str(e)}"
            logger.error(error_msg)
            return {
                'success': False,
                'error': f"Network error: {str(e)}"
            }
        
        except Exception as e:
            logger.error(f"Error downloading waybill for Invoice: {invoice_number}: {str(e)}", exc_info=True)
            return {
                'success': False,
                'error': str(e)
            }

