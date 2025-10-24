from app.utils.loggers import get_logger
from app.services.waybills.services.WaybillPrintService import WaybillPrintService
from app.services.waybills.models.WaybillPrint import WaybillPrint

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
            
            # Call service method to create and save waybill
            waybill_print = WaybillPrintService.create(data)
            
            logger.info(f"Successfully stored waybill {invoice_number}")
            
            return {
                "status": "success",
                "message": "Waybill print request stored",
                "data": waybill_print.to_dict()
            }
            
        except Exception as e:
            logger.error(f"Error storing waybill: {str(e)}", exc_info=True)
            return {
                "status": "error",
                "message": str(e)
            }
    
    def destroy(self, waybill_print: WaybillPrint) -> dict:
        """
        Delete a waybill print.
        
        Args:
            waybill_print: WaybillPrint model instance to delete
            
        Returns:
            dict: Response with status and message
        """
        try:
            waybill_id = waybill_print.id
            logger.info(f"Deleting waybill print - ID: {waybill_id}")
            
            # Call service method to delete waybill
            WaybillPrintService.destroy(waybill_print)
            
            logger.info(f"Successfully deleted waybill {waybill_id}")
            
            return {
                "status": "success",
                "message": "Waybill print deleted successfully"
            }
            
        except Exception as e:
            logger.error(f"Error deleting waybill: {str(e)}", exc_info=True)
            return {
                "status": "error",
                "message": str(e)
            }
