import os
import requests
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse


class FileDownloadService:
    """
    Service for downloading waybill files (PDF, PNG, JPG, etc.) locally.
    Generates unique filenames and manages storage directory.
    """
    
    # Storage directory path
    STORAGE_DIR = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))),
        'storage',
        'waybills'
    )
    
    def __init__(self):
        """Initialize the download service and ensure storage directory exists."""
        self._ensure_storage_directory()
    
    def _ensure_storage_directory(self):
        """Create storage directory if it doesn't exist."""
        try:
            Path(self.STORAGE_DIR).mkdir(parents=True, exist_ok=True)
        except Exception as e:
            raise Exception(f"Failed to create storage directory: {str(e)}")
    
    def _get_file_extension(self, url):
        """
        Extract file extension from URL.
        
        Args:
            url: The URL to extract extension from
            
        Returns:
            str: File extension (e.g., 'pdf', 'png', 'jpg') or 'bin' if not found
        """
        try:
            parsed_url = urlparse(url)
            path = parsed_url.path
            
            # Get extension from path
            if '.' in path:
                ext = path.split('.')[-1].lower()
                # Remove query parameters if present
                if '?' in ext:
                    ext = ext.split('?')[0]
                if ext and len(ext) <= 5:  # Reasonable extension length
                    return ext
            
            return 'bin'  # Default binary extension
        except Exception:
            return 'bin'
    
    def _generate_unique_filename(self, invoice_number, extension):
        """
        Generate unique filename with invoice number and timestamp.
        Format: {invoice_number}_{ISO8601_datetime}.{extension}
        
        Args:
            invoice_number: Invoice identifier
            extension: File extension
            
        Returns:
            str: Unique filename
        """
        timestamp = datetime.utcnow().isoformat().replace(':', '-').replace('.', '_')
        # Clean invoice number for safe filename
        safe_invoice = invoice_number.replace('/', '_').replace('\\', '_')
        return f"{safe_invoice}_{timestamp}.{extension}"
    
    def download_file(self, invoice_number, waybill_url, timeout=30):
        """
        Download waybill file from URL and store locally.
        
        Args:
            invoice_number: Invoice identifier for filename
            waybill_url: URL to download from
            timeout: Request timeout in seconds
            
        Returns:
            dict: {
                'success': bool,
                'file_path': str (local path if successful),
                'file_size': int (file size in bytes if successful),
                'error': str (error message if failed)
            }
        """
        try:
            # Validate URL
            if not waybill_url or not isinstance(waybill_url, str):
                return {
                    'success': False,
                    'error': 'Invalid waybill_url'
                }
            
            # Download file
            response = requests.get(waybill_url, timeout=timeout, stream=True)
            response.raise_for_status()
            
            # Get file extension
            extension = self._get_file_extension(waybill_url)
            
            # Generate unique filename
            filename = self._generate_unique_filename(invoice_number, extension)
            file_path = os.path.join(self.STORAGE_DIR, filename)
            
            # Write file to storage
            file_size = 0
            with open(file_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
                        file_size += len(chunk)
            
            return {
                'success': True,
                'file_path': file_path,
                'file_size': file_size
            }
        
        except requests.exceptions.RequestException as e:
            return {
                'success': False,
                'error': f'Failed to download file: {str(e)}'
            }
        except IOError as e:
            return {
                'success': False,
                'error': f'Failed to save file: {str(e)}'
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'Unexpected error during download: {str(e)}'
            }
