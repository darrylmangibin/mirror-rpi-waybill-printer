from app.utils.loggers import get_logger
from app.services.waybills.models.WaybillPrint import WaybillPrint

logger = get_logger(__name__)


class PrintWaybillAction:
    """
    Single-action controller for printing waybill files.
    Similar to Laravel's Invokable Action Controllers.
    
    Thin orchestrator that validates input and delegates to service.
    """
    
    def __call__(self, waybill_print: WaybillPrint) -> dict:
        """
        Print a waybill file.
        
        Args:
            waybill_print (WaybillPrint): The waybill print record to print
        
        Returns:
            dict: Response with status and data
        """
        try:
            local_file_path = waybill_print.local_file_path
            invoice_number = waybill_print.invoice_number
            
            logger.info(f"PrintWaybillAction executing - Invoice: {invoice_number}")
            
            # For now, just log the local file path
            logger.info(f"Hey Logging this local_file_path: {local_file_path}")
            
            return {
                "status": "success",
                "message": "Print action logged successfully",
                "data": {
                    "waybill_id": waybill_print.id,
                    "invoice_number": invoice_number,
                    "local_file_path": local_file_path
                }
            }
        
        except Exception as e:
            logger.error(f"Error in PrintWaybillAction: {str(e)}", exc_info=True)
            return {
                "status": "error",
                "message": str(e),
                "data": {
                    "waybill_id": waybill_print.id,
                    "invoice_number": waybill_print.invoice_number
                }
            }

