from app.utils.loggers import get_logger
from app.services.waybills.models.WaybillPrint import WaybillPrint
from app.services.waybills.services.WaybillDownloadService import WaybillDownloadService
from app.services.waybills.enums.WaybillPrintStatuses import WaybillPrintStatuses
from app.database import db

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
        Sets status to DOWNLOADING immediately, then delegates to service.
        All database updates handled by the service.
        
        Args:
            waybill_print (WaybillPrint): The waybill print record to download
        
        Returns:
            dict: Response from the download service with status and data
        """
        try:
            invoice_number = waybill_print.invoice_number
            waybill_url = waybill_print.waybill_url
            
            # Validate URL
            if not waybill_url:
                raise ValueError("Waybill URL is missing")
            
            # Step 1: Set status to DOWNLOADING immediately
            waybill_print.status = WaybillPrintStatuses.DOWNLOADING.value
            db.session.commit()
            
            # Step 2: Delegate to service - handles download, database updates, and error handling
            return self.download_service.download(waybill_print, waybill_url, invoice_number)
        
        except Exception as e:
            logger.error(f"Error in DownloadWaybillAction: {str(e)}", exc_info=True)
            # Try to set status to ERROR if commit fails
            try:
                waybill_print.status = WaybillPrintStatuses.ERROR.value
                waybill_print.error_message = str(e)
                db.session.commit()
            except Exception as db_error:
                logger.error(f"Failed to update waybill status to ERROR: {str(db_error)}", exc_info=True)
            
            return {
                "status": "error",
                "message": str(e),
                "data": {
                    "waybill_id": waybill_print.id,
                    "invoice_number": waybill_print.invoice_number
                }
            }
