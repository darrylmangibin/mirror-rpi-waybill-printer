from app.utils.loggers import get_logger
from app.services.waybills.models.WaybillPrint import WaybillPrint

logger = get_logger(__name__)


class PrintWaybillAction:
    """
    Single-action controller for printing waybill files.
    Similar to Laravel's Invokable Action Controllers.
    
    Thin orchestrator that validates input and delegates to service.
    """
    
    def __init__(self):
        """Initialize the action."""
        pass
    
    def __call__(self, waybill_print: WaybillPrint) -> dict:
        """
        Print a waybill.
        
        Args:
            waybill_print (WaybillPrint): The waybill print record to print
        
        Returns:
            dict: Response with status and data
        """
        try:
            invoice_number = waybill_print.invoice_number
            local_file_path = waybill_print.local_file_path
            
            logger.info(f"PrintWaybillAction executing - Invoice: {invoice_number}")
            
            # Validate file path
            if not local_file_path:
                raise ValueError("Local file path is missing. Please download the waybill first.")
            
            # TODO: Add printing logic here
            
            return {
                "status": "success",
                "message": "Waybill sent to printer",
                "data": {
                    "waybill_id": waybill_print.id,
                    "invoice_number": invoice_number
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

