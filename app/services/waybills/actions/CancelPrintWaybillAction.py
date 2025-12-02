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
            
            # Check if there's a CUPS job to cancel
            # Allow canceling if cups_job_id exists, regardless of print_status
            # (job might be marked as error but still stuck in CUPS queue)
            if not cups_job_id:
                logger.warning(f"No CUPS job to cancel - Invoice: {invoice_number} (ID: {waybill_print.id}), print_status: {waybill_print.print_status}")
                return {
                    "status": "error",
                    "message": "No CUPS job to cancel (job was never sent to printer)",
                    "data": {
                        "waybill_id": waybill_print.id,
                        "invoice_number": invoice_number
                    }
                }
            
            # Allow canceling jobs in any state if they have a CUPS job ID
            # This handles cases where job is marked as error/idle but still queued in CUPS
            logger.info(f"Canceling CUPS job - Invoice: {invoice_number}, WaybillID: {waybill_print.id}, CUPS JobID: {cups_job_id}, Current status: {waybill_print.print_status}")
            
            # Cancel the CUPS job
            result = self.print_service.cancel_cups_job(printer_name, cups_job_id)
            
            if result.get('success'):
                # Update waybill status to cancelled
                waybill_print.print_status = 'cancelled'
                waybill_print.print_error = "Print job was cancelled by user"
                waybill_print.print_completed_at = None  # Clear completed timestamp when cancelled
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

