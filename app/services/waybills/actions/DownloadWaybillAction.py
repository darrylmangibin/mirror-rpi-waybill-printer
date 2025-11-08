from app.utils.loggers import get_logger
from app.services.waybills.models.WaybillPrint import WaybillPrint
from app.services.waybills.services.WaybillDownloadService import WaybillDownloadService

logger = get_logger(__name__)


class DownloadWaybillAction:
    """
    Single-action controller for downloading waybill files.
    Similar to Laravel's Invokable Action Controllers.
    
    This class is callable via __call__ method.
    Orchestrates the download workflow by delegating to WaybillDownloadService.
    """
    
    def __init__(self):
        """Initialize the action with the download service."""
        self.download_service = WaybillDownloadService()
    
    def __call__(self, waybill_print: WaybillPrint) -> dict:
        """
        Download and save a waybill file to local storage.
        
        Args:
            waybill_print (WaybillPrint): The waybill print record to download
        
        Returns:
            dict: Response with status and message
        """
        try:
            invoice_number = waybill_print.invoice_number
            waybill_url = waybill_print.waybill_url
            
            logger.info(f"DownloadWaybillAction executing - Invoice: {invoice_number}")
            
            # Validate URL
            if not waybill_url:
                raise ValueError("Waybill URL is missing")
            
            # Delegate to service for actual download
            result = self.download_service.download(waybill_url, invoice_number)
            
            if result['success']:
                return {
                    "status": "success",
                    "message": "Waybill downloaded and saved successfully",
                    "data": {
                        "waybill_id": waybill_print.id,
                        "invoice_number": invoice_number,
                        "filepath": result['filepath'],
                        "filename": result['filename'],
                        "file_size": result['file_size']
                    }
                }
            else:
                return {
                    "status": "error",
                    "message": result['error'],
                    "data": {
                        "waybill_id": waybill_print.id,
                        "invoice_number": invoice_number
                    }
                }
        
        except Exception as e:
            logger.error(f"Error in DownloadWaybillAction: {str(e)}", exc_info=True)
            return {
                "status": "error",
                "message": str(e),
                "data": {
                    "waybill_id": waybill_print.id,
                    "invoice_number": waybill_print.invoice_number
                }
            }
