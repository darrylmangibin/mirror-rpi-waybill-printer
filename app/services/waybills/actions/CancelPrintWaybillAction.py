from app.utils.loggers import get_logger
from app.services.waybills.models.WaybillPrint import WaybillPrint
from app.services.waybills.services.PrintWaybillService import PrintWaybillService
from app.services.waybills.enums.PrintStatuses import PrintStatuses
from app.database import db

logger = get_logger(__name__)


class CancelPrintWaybillAction:
    """
    Action to cancel an ongoing print job.
    Cancels the CUPS job and updates the waybill status.
    """
    
    def __init__(self):
        """Initialize the action with the print service."""
        self.print_service = PrintWaybillService()
    
    def __call__(self, waybill_print: WaybillPrint) -> dict:
        """
        Cancel a print job.
        
        Args:
            waybill_print (WaybillPrint): The waybill print record to cancel
        
        Returns:
            dict: Response with status and message
        """
        try:
            invoice_number = waybill_print.invoice_number
            cups_job_id = waybill_print.cups_job_id
            printer_name = waybill_print.printer_name
            
            # Check if there's a print job to cancel
            if not cups_job_id or waybill_print.print_status == PrintStatuses.IDLE.value:
                logger.warning(f"No active print job to cancel - Invoice: {invoice_number} (ID: {waybill_print.id})")
                return {
                    "status": "error",
                    "message": "No active print job to cancel",
                    "data": {
                        "waybill_id": waybill_print.id,
                        "invoice_number": invoice_number
                    }
                }
            
            # Only allow canceling if job is pending or printing
            if waybill_print.print_status not in [PrintStatuses.PENDING.value, PrintStatuses.PRINTING.value]:
                logger.warning(f"Cannot cancel - print job is already {waybill_print.print_status} - Invoice: {invoice_number}")
                return {
                    "status": "error",
                    "message": f"Cannot cancel - print job is already {waybill_print.print_status}",
                    "data": {
                        "waybill_id": waybill_print.id,
                        "invoice_number": invoice_number
                    }
                }
            
            # Cancel the CUPS job
            result = self.print_service.cancel_cups_job(printer_name, cups_job_id)
            
            if result.get('success'):
                # Update waybill status to cancelled/error
                waybill_print.print_status = PrintStatuses.ERROR.value
                waybill_print.print_error = "Print job was cancelled by user"
                db.session.commit()
                
                logger.info(f"[CANCEL SUCCESS] Invoice: {invoice_number}, JobID: {cups_job_id}, Printer: {printer_name}")
                
                return {
                    "status": "success",
                    "message": "Print job cancelled successfully",
                    "data": {
                        "waybill_id": waybill_print.id,
                        "invoice_number": invoice_number,
                        "cups_job_id": cups_job_id
                    }
                }
            else:
                logger.error(f"Failed to cancel CUPS job - Invoice: {invoice_number}, JobID: {cups_job_id}")
                return {
                    "status": "error",
                    "message": result.get('error', 'Failed to cancel print job'),
                    "data": {
                        "waybill_id": waybill_print.id,
                        "invoice_number": invoice_number
                    }
                }
        
        except Exception as e:
            logger.error(f"Error in CancelPrintWaybillAction: {str(e)}", exc_info=True)
            try:
                waybill_print.print_status = PrintStatuses.ERROR.value
                waybill_print.print_error = f"Cancel failed: {str(e)}"
                db.session.commit()
            except Exception as db_error:
                logger.error(f"Failed to update waybill status: {str(db_error)}", exc_info=True)
            
            return {
                "status": "error",
                "message": str(e),
                "data": {
                    "waybill_id": waybill_print.id,
                    "invoice_number": waybill_print.invoice_number
                }
            }

