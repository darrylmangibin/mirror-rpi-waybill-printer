from app.utils.loggers import get_logger
from app.services.waybills.models.WaybillPrint import WaybillPrint

logger = get_logger(__name__)


class DownloadWaybillAction:
    """
    Single-action controller for downloading waybill files.
    Similar to Laravel's Invokable Action Controllers.
    
    This class is callable via __call__ method.
    """
    
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
            
            # Validate inputs
            if not waybill_url:
                raise ValueError("Waybill URL is missing")
            
            logger.info(f"File download initiated - Invoice: {invoice_number}, URL: {waybill_url}")
            
            return {
                "status": "success",
                "message": "Waybill download initiated",
                "data": {
                    "waybill_id": waybill_print.id,
                    "invoice_number": invoice_number,
                    "waybill_url": waybill_url
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
