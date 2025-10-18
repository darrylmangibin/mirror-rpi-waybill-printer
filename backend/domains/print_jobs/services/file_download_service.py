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
    
    # Static storage directory path - PROJECT_ROOT/storage/waybills
    STORAGE_DIR = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))),
        'storage',
        'waybills'
    )
    
    # Allowed file extensions for waybill documents
    ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpeg', 'jpg'}
    
    def __init__(self):
        """Initialize the download service and ensure storage directory exists."""
        self._ensure_storage_directory()
    
    def _ensure_storage_directory(self):
        """Create storage directory if it doesn't exist."""
        try:
            Path(self.STORAGE_DIR).mkdir(parents=True, exist_ok=True)
        except Exception as e:
            raise Exception(f"Failed to create storage directory: {str(e)}")
    
    def _get_extension_from_content_type(self, content_type):
        """
        Extract file extension from Content-Type header.
        
        Args:
            content_type: The Content-Type header value
            
        Returns:
            str: File extension (e.g., 'pdf', 'png') or empty string if not recognized
        """
        if not content_type:
            return ''
        
        # Extract just the mime type (before semicolon if present)
        mime_type = content_type.split(';')[0].strip().lower()
        
        content_type_map = {
            'application/pdf': 'pdf',
            'image/png': 'png',
            'image/jpeg': 'jpg',
            'image/jpg': 'jpg',
            'image/gif': 'gif',
            'image/webp': 'webp',
            'image/tiff': 'tiff',
        }
        
        return content_type_map.get(mime_type, '')
    
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
    
    def _validate_url_exists(self, url, timeout=10):
        """
        Validate that URL exists and is accessible using HEAD request.
        
        Args:
            url: URL to validate
            timeout: Request timeout in seconds
            
        Returns:
            dict: {
                'exists': bool,
                'error': str (error message if not exists)
            }
        """
        try:
            # Try HEAD request first (faster, doesn't download file)
            response = requests.head(url, timeout=timeout, allow_redirects=True)
            
            if response.status_code == 404:
                return {
                    'exists': False,
                    'error': 'File not found (404): URL does not exist'
                }
            elif response.status_code == 403:
                return {
                    'exists': False,
                    'error': 'Access denied (403): File is not accessible'
                }
            elif response.status_code >= 400:
                return {
                    'exists': False,
                    'error': f'HTTP error {response.status_code}: Unable to access file'
                }
            
            # HEAD request successful
            return {
                'exists': True,
                'error': None
            }
        
        except requests.exceptions.Timeout:
            return {
                'exists': False,
                'error': 'Connection timeout: URL is not responding'
            }
        except requests.exceptions.ConnectionError:
            return {
                'exists': False,
                'error': 'Connection error: Unable to reach the server'
            }
        except Exception as e:
            return {
                'exists': False,
                'error': f'URL validation failed: {str(e)}'
            }
    
    def _generate_unique_filename(self, invoice_number, extension):
        """
        Generate unique filename with invoice number and timestamp.
        Format: {invoice_number}_{YYYYMMDDHHmmssFFFFFF}.{extension}
        
        Args:
            invoice_number: Invoice identifier
            extension: File extension
            
        Returns:
            str: Unique filename
        """
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S%f")
        # Clean invoice number for safe filename
        safe_invoice = invoice_number.replace('/', '_').replace('\\', '_')
        return f"{safe_invoice}_{timestamp}.{extension}"
    
    def download_file(self, invoice_number, waybill_url, timeout=30, validate_first=True):
        """
        Download waybill file from URL and store locally.
        
        Args:
            invoice_number: Invoice identifier for filename
            waybill_url: URL to download from
            timeout: Request timeout in seconds
            validate_first: If True, validate URL exists before downloading
            
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
            
            # Validate URL exists (optional check for early error detection)
            if validate_first:
                validation = self._validate_url_exists(waybill_url, timeout=10)
                if not validation['exists']:
                    return {
                        'success': False,
                        'error': validation['error']
                    }
            
            # Download file
            response = requests.get(waybill_url, timeout=timeout, stream=True)
            response.raise_for_status()
            
            # Detect file extension: Try URL first (takes priority), then Content-Type header fallback
            extension = self._get_file_extension(waybill_url)
            
            # If URL didn't give us a recognized extension, try Content-Type header
            if not extension or extension == 'bin':
                content_type = response.headers.get('Content-Type', '').lower()
                content_type_ext = self._get_extension_from_content_type(content_type)
                if content_type_ext:
                    extension = content_type_ext
            
            # Default to bin if still no extension
            if not extension:
                extension = 'bin'
            
            # Validate extension is in allowed list
            if extension.lower() not in self.ALLOWED_EXTENSIONS:
                return {
                    'success': False,
                    'error': f'File type not allowed. Only pdf, png, jpeg, jpg are supported. Got: {extension}',
                    'detected_extension': extension
                }
            
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
