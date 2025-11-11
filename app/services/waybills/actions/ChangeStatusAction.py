from app.utils.loggers import get_logger
from app.services.waybills.models.WaybillPrint import WaybillPrint
from app.services.waybills.services.WaybillPrintService import WaybillPrintService

logger = get_logger(__name__)


class ChangeStatusAction:
    """
    Single-action controller for changing waybill print status.
    Similar to Laravel's Invokable Action Controllers.
    
    Thin orchestrator that validates input and delegates to service.
    All business logic and database updates handled by the service.
    """
    
    def __init__(self):
        """Initialize the action with the WaybillPrintService."""
        self.service = WaybillPrintService()
    
    def __call__(self, waybill_print: WaybillPrint, status: str) -> dict:
        """
        Change the status of a waybill print.
        
        Args:
            waybill_print (WaybillPrint): The waybill print record to update
            status (str): New status value ('pending', 'downloaded', 'failed')
        
        Returns:
            dict: Response from the service with status and data
        """
        try:
            invoice_number = waybill_print.invoice_number
            
            logger.info(f"ChangeStatusAction executing - Invoice: {invoice_number}, New Status: {status}")
            
            # Delegate to service - handles validation, status changes, and error handling
            updated_waybill = self.service.change_status(waybill_print, status)
            
            return {
                "status": "success",
                "message": f"Waybill status changed to '{status}' successfully",
                "data": updated_waybill.to_dict()
            }
        
        except ValueError as e:
            logger.warning(f"Validation error in ChangeStatusAction: {str(e)}")
            return {
                "status": "error",
                "message": str(e),
                "data": {
                    "waybill_id": waybill_print.id,
                    "invoice_number": waybill_print.invoice_number
                }
            }
        except Exception as e:
            logger.error(f"Error in ChangeStatusAction: {str(e)}", exc_info=True)
            return {
                "status": "error",
                "message": str(e),
                "data": {
                    "waybill_id": waybill_print.id,
                    "invoice_number": waybill_print.invoice_number
                }
            }

