import os
import pathlib
import requests
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
            # Try to get filename from URL path
            parsed_url = urlparse(url)
            filename = os.path.basename(parsed_url.path)
            
            # If no extension, assume PDF
            if not os.path.splitext(filename)[1]:
                filename = f"{filename}.pdf"
            
            return filename
        except Exception:
            return None
    
    def _sanitize_filename(self, filename: str) -> str:
        """Ensure safe filename (remove problematic characters)."""
        return "".join(c for c in filename if c.isalnum() or c in ('.', '-', '_')).rstrip()
    
    def download(self, waybill_url: str, invoice_number: str) -> dict:
        """
        Download a waybill file from URL and save to local storage.
        
        Args:
            waybill_url (str): URL of the waybill file
            invoice_number (str): Invoice number for logging and fallback filename
        
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
            
            # Generate filename
            filename = self._get_filename_from_url(waybill_url)
            if not filename:
                filename = f"waybill_{invoice_number}.pdf"
            
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

