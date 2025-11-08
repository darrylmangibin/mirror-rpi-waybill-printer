import os
import pathlib
import requests
from datetime import datetime
from urllib.parse import urlparse
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
    
    def download(self, waybill_print, waybill_url: str, invoice_number: str) -> dict:
        """
        Download a waybill file from URL and save to local storage.
        Trusts Content-Type header over URL extension (server is authoritative).
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
            
            file_size = os.path.getsize(filepath)
            
            # Update database record with download status
            waybill_print.status = WaybillPrintStatuses.FOR_PRINTING.value
            waybill_print.local_file_path = filepath
            waybill_print.downloaded_at = datetime.now().replace(microsecond=0)
            db.session.commit()
            
            logger.info(f"File downloaded successfully - Invoice: {invoice_number}, Path: {filepath}, Size: {file_size} bytes")
            logger.info(f"WaybillPrint record updated - ID: {waybill_print.id}, Status: {WaybillPrintStatuses.FOR_PRINTING.value}")
            
            return {
                'status': 'success',
                'message': 'Waybill downloaded and saved successfully',
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
                waybill_print.status = WaybillPrintStatuses.FAILED.value
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
                waybill_print.status = WaybillPrintStatuses.FAILED.value
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
                waybill_print.status = WaybillPrintStatuses.FAILED.value
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

