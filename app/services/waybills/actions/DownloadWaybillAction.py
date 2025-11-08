from app.utils.loggers import get_logger
from app.services.waybills.models.WaybillPrint import WaybillPrint
from app.services.waybills.services.WaybillDownloadService import WaybillDownloadService

logger = get_logger(__name__)


class DownloadWaybillAction:
    """
    Single-action controller for downloading waybill files.
    Similar to Laravel's Invokable Action Controllers.
    
    Thin orchestrator that validates input and delegates to service.
    All business logic and database updates handled by the service.
    """
    
    def __init__(self):
        """Initialize the action with the download service."""
        self.download_service = WaybillDownloadService()
    
    def __call__(self, waybill_print: WaybillPrint) -> dict:
        """
        Download and save a waybill file to local storage.
        All database updates handled by the service.
        
        Args:
            waybill_print (WaybillPrint): The waybill print record to download
        
        Returns:
            dict: Response from the download service with status and data
        """
        try:
            invoice_number = waybill_print.invoice_number
            waybill_url = waybill_print.waybill_url
            
            logger.info(f"DownloadWaybillAction executing - Invoice: {invoice_number}")
            
            # Validate URL
            if not waybill_url:
                raise ValueError("Waybill URL is missing")
            
            # Delegate to service - handles download, database updates, and error handling
            return self.download_service.download(waybill_print, waybill_url, invoice_number)
        
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
