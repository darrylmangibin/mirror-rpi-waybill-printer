from app.utils.loggers import get_logger
from app.services.waybills.services.WaybillPrintService import test_foo

logger = get_logger(__name__)


class WaybillPrintController:
    """Controller for handling waybill printing operations."""
    
    def store(self, invoice_number: str, waybill_url: str) -> dict:
        """
        Store/create a waybill print request.
        
        Args:
            invoice_number: Invoice number for the waybill
            waybill_url: URL of the waybill to print
            
        Returns:
            dict: Response with status and message
        """
        try:
            logger.info(f"Storing waybill print - Invoice: {invoice_number}")
            
            # Call service method
            result = test_foo()  # Replace with actual service logic later
            
            logger.info(f"Successfully stored waybill {invoice_number}")
            
            return {
                "status": "success",
                "message": "Waybill print request stored",
                "invoice_number": invoice_number,
                "waybill_url": waybill_url,
                "service_result": result
            }
            
        except Exception as e:
            logger.error(f"Error storing waybill {invoice_number}: {str(e)}", exc_info=True)
            return {
                "status": "error",
                "message": str(e),
                "invoice_number": invoice_number
            }
