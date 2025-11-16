from app.utils.loggers import get_logger
from app.services.waybills.models.WaybillPrint import WaybillPrint
from app.services.waybills.services.PrintWaybillService import PrintWaybillService

logger = get_logger(__name__)


class PrintWaybillAction:
    """
    Single-action controller for printing waybill files.
    Similar to Laravel's Invokable Action Controllers.
    
    Thin orchestrator that validates input and delegates to service.
    All business logic and database updates handled by the service.
    """
    
    def __init__(self):
        """Initialize the action with the print service."""
        self.print_service = PrintWaybillService()
    
    def __call__(self, waybill_print: WaybillPrint) -> dict:
        """
        Print a waybill.
        
        Args:
            waybill_print (WaybillPrint): The waybill print record to print
        
        Returns:
            dict: Response from the print service with status and data
        """
        try:
            invoice_number = waybill_print.invoice_number
            
            logger.info(f"PrintWaybillAction executing - Invoice: {invoice_number}")
            
            # Delegate to service - handles validation, status updates, and error handling
            result = self.print_service.print_waybill(waybill_print)
            
            # NEW: Queue for CUPS monitoring if print was successful
            if result.get('status') == 'success' and result.get('data'):
                try:
                    cups_job_id = result['data'].get('job_id')
                    printer_name = result['data'].get('printer')
                    
                    if cups_job_id and printer_name:
                        from app.services.waybills.jobs.monitor_print_job import queue_monitor
                        queue_monitor(waybill_print.id, cups_job_id, printer_name, invoice_number)
                        logger.info(f"[AUTO-QUEUE MONITOR] Invoice: {invoice_number} - Queued for CUPS status monitoring, JobID: {cups_job_id}")
                except Exception as monitor_error:
                    logger.error(f"Failed to queue monitor after print: {str(monitor_error)}", exc_info=True)
            
            return result
        
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

