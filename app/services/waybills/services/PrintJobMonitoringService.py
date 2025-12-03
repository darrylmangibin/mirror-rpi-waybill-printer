from datetime import datetime
from app.utils.loggers import get_logger
from app.database import db
from app.services.waybills.models.WaybillPrint import WaybillPrint
from app.services.waybills.enums.WaybillPrintStatuses import WaybillPrintStatuses
from app.services.waybills.enums.PrintStatuses import PrintStatuses
from app.services.waybills.services.CupsJobMonitorService import CupsJobMonitorService
from app.services.waybills.services.PrinterCheckService import PrinterCheckService

logger = get_logger(__name__)


class PrintJobMonitoringService:
    """
    Service for monitoring print jobs and updating their status.
    Handles:
    - Checking if jobs are stuck or too old
    - Checking CUPS status for completion
    - Updating database atomically
    """
    
    STUCK_JOB_TIMEOUT = 120  # 2 minutes in seconds
    ONE_DAY_SECONDS = 86400  # 24 hours
    
    def __init__(self):
        self.cups_service = CupsJobMonitorService()
        self.printer_service = PrinterCheckService()
        self.now = datetime.now()
    
    def monitor_all_printing_jobs(self):
        """
        Monitor all printing jobs and update their status.
        
        Returns:
            dict: {
                'updated': int,
                'completed': int,
                'cancelled': int,
                'errors': list
            }
        """
        # Query all jobs currently printing
        printing_jobs = WaybillPrint.query.filter(
            WaybillPrint.status == WaybillPrintStatuses.PRINTING.value
        ).all()
        
        if not printing_jobs:
            return {'updated': 0, 'completed': 0, 'cancelled': 0, 'errors': []}
        
        jobs_updated = 0
        jobs_completed = 0
        jobs_cancelled = 0
        errors = []
        
        for waybill in printing_jobs:
            try:
                invoice = waybill.invoice_number or f"ID:{waybill.id}"
                
                # Skip if no CUPS job ID
                if not waybill.cups_job_id or not waybill.printer_name:
                    logger.warning(f"[MONITOR] Missing CUPS info for Invoice: {invoice}, WaybillID: {waybill.id}")
                    continue
                
                # Check if printer is offline
                if not self.printer_service.is_printer_online(waybill.printer_name):
                    if self._mark_offline_stuck(waybill, invoice):
                        jobs_cancelled += 1
                        jobs_updated += 1
                    continue
                
                # Check CUPS job status
                cups_status = self.cups_service.check_job_status(waybill.printer_name, waybill.cups_job_id)
                
                # Check if job is stuck or too old
                if self._mark_stuck_jobs(waybill, invoice):
                    jobs_cancelled += 1
                    jobs_updated += 1
                    continue
                
                # Handle job based on CUPS status
                result = self._handle_cups_status(waybill, invoice, cups_status)
                if result == 'completed':
                    jobs_completed += 1
                    jobs_updated += 1
                elif result == 'updated':
                    jobs_updated += 1
                
            except Exception as e:
                error_msg = f"Error monitoring Invoice {waybill.invoice_number}: {str(e)}"
                logger.error(f"[MONITOR ERROR] {error_msg}", exc_info=True)
                errors.append(error_msg)
                continue
        
        # Commit all updates atomically
        if jobs_updated > 0:
            db.session.commit()
            logger.info(f"[MONITOR] Updated: {jobs_updated} (Completed: {jobs_completed}, Cancelled: {jobs_cancelled})")
            
            # Notify frontend via SSE
            self._notify_sse(printing_jobs)
        
        return {
            'updated': jobs_updated,
            'completed': jobs_completed,
            'cancelled': jobs_cancelled,
            'errors': errors
        }
    
    def _mark_offline_stuck(self, waybill, invoice):
        """Check if offline printer is stuck, mark as cancelled if so."""
        if waybill.updated_at:
            elapsed = (self.now - waybill.updated_at).total_seconds()
        else:
            elapsed = 0
        
        if elapsed > self.STUCK_JOB_TIMEOUT:
            logger.error(f"[MONITOR] Printer offline for {elapsed}s - Marking as cancelled: Invoice {invoice}")
            waybill.status = WaybillPrintStatuses.CANCELLED.value
            waybill.print_status = PrintStatuses.CANCELLED.value
            waybill.print_error = "Print job cancelled - printer offline > 2 minutes"
            waybill.print_completed_at = self.now.replace(microsecond=0)
            return True
        return False
    
    def _mark_stuck_jobs(self, waybill, invoice):
        """Check if job is stuck or too old, mark as cancelled if so."""
        time_in_queue = (self.now - waybill.updated_at).total_seconds()
        time_since_created = (self.now - waybill.created_at).total_seconds()
        
        # If stuck for 2+ minutes
        if time_in_queue > self.STUCK_JOB_TIMEOUT:
            logger.warning(f"[MONITOR] ⚠️  STUCK (2+ min) - Invoice: {invoice}, Time: {time_in_queue}s")
            waybill.status = WaybillPrintStatuses.CANCELLED.value
            waybill.print_status = PrintStatuses.CANCELLED.value
            waybill.print_error = "Print job cancelled - stuck in printing state for > 2 minutes"
            waybill.print_completed_at = self.now.replace(microsecond=0)
            return True
        
        # If created more than 1 day ago
        if time_since_created > self.ONE_DAY_SECONDS:
            logger.warning(f"[MONITOR] ⚠️  TOO OLD (>1 day) - Invoice: {invoice}, Age: {time_since_created/86400:.1f} days")
            waybill.status = WaybillPrintStatuses.CANCELLED.value
            waybill.print_status = PrintStatuses.CANCELLED.value
            waybill.print_error = "Print job cancelled - older than 1 day"
            waybill.print_completed_at = self.now.replace(microsecond=0)
            return True
        
        return False
    
    def _handle_cups_status(self, waybill, invoice, cups_status):
        """Handle job based on CUPS status. Returns 'completed', 'updated', or None."""
        logger.debug(f"[MONITOR] Check Invoice: {invoice}, State: {cups_status['state_name']}")
        
        # Handle completed jobs
        if cups_status['is_completed']:
            logger.info(f"[CUPS COMPLETED] ✅ COMPLETED - Invoice: {invoice}, WaybillID: {waybill.id}")
            waybill.status = WaybillPrintStatuses.COMPLETED.value
            waybill.print_status = PrintStatuses.COMPLETED.value
            waybill.error_message = None
            waybill.print_error = None
            waybill.print_completed_at = self.now.replace(microsecond=0)
            return 'completed'
        
        # Handle failed jobs
        elif cups_status['is_failed']:
            error_msg = f"CUPS job {cups_status['state_name']}"
            logger.error(f"[MONITOR] ❌ FAILED - Invoice: {invoice}, Error: {error_msg}")
            waybill.status = WaybillPrintStatuses.ERROR.value
            waybill.print_status = PrintStatuses.ERROR.value
            waybill.error_message = error_msg
            waybill.print_error = error_msg
            waybill.print_completed_at = self.now.replace(microsecond=0)
            return 'updated'
        
        # Handle processing jobs
        elif cups_status['is_processing']:
            if waybill.print_status != PrintStatuses.PRINTING.value:
                waybill.print_status = PrintStatuses.PRINTING.value
                return 'updated'
        
        return None
    
    def _notify_sse(self, printing_jobs):
        """Notify frontend via SSE of updates."""
        try:
            from app.services.sse_service import notify_waybill_update
            for waybill in printing_jobs:
                notify_waybill_update(waybill.id)
        except Exception as e:
            logger.warning(f"Failed to notify SSE: {str(e)}")

