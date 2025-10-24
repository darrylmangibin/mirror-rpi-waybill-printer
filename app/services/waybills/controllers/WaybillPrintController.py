from app.utils.loggers import get_logger
from app.services.waybills.services.WaybillPrintService import test_foo

logger = get_logger(__name__)


class WaybillPrintController:
    """Controller for handling waybill printing operations."""
    
    def store(self, data: dict) -> dict:
        """
        Store/create a waybill print request.
        
        Args:
            data: Validated request data dictionary containing:
                - invoice_number: Invoice number for the waybill
                - waybill_url: URL of the waybill to print
            
        Returns:
            dict: Response with status and message
        """
        try:
            invoice_number = data.get('invoice_number')
            waybill_url = data.get('waybill_url')
            
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
            logger.error(f"Error storing waybill: {str(e)}", exc_info=True)
            return {
                "status": "error",
                "message": str(e)
            }
