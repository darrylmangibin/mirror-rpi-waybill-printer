"""
Unified Print Job Monitor - CRON Job
Replaces queue-based monitoring (monitor_print_job.py + printer_check_job.py)

Benefits:
- Single source of truth - one job monitoring everything
- No race conditions - atomic updates
- Better RPi resource management
- Cleaner code - single monitoring loop
- Automatic stuck job cleanup

How it works:
1. Runs every 5 seconds (via APScheduler)
2. Queries all waybills with status='printing'
3. For each: checks CUPS status + printer online
4. Updates database atomically
5. Handles stuck jobs (> 5 minutes waiting)
"""

from datetime import datetime, timedelta
from app.utils.loggers import get_logger
from app.database import db
from app.services.waybills.models.WaybillPrint import WaybillPrint
from app.services.waybills.enums.WaybillPrintStatuses import WaybillPrintStatuses
from app.services.waybills.enums.PrintStatuses import PrintStatuses
from app.services.waybills.services.CupsJobMonitorService import CupsJobMonitorService
from app.services.waybills.services.PrinterCheckService import PrinterCheckService

logger = get_logger(__name__)

# Configuration
STUCK_JOB_TIMEOUT = 300  # 5 minutes in seconds
CHECK_INTERVAL = 2  # 2 seconds between checks (via APScheduler)


def monitor_all_printing_jobs(app=None):
    """
    CRON job: Monitor all printing jobs and update status.
    Runs every 2 seconds via APScheduler.
    
    Single atomic update - no race conditions!
    """
    if not app:
        logger.error("[MONITOR CRON] No app context provided")
        return
    
    try:
        # CRITICAL: Use app context for database access in background thread
        with app.app_context():
            # Query all jobs currently printing
            printing_jobs = WaybillPrint.query.filter(
                WaybillPrint.status == WaybillPrintStatuses.PRINTING.value
            ).all()
            
            if not printing_jobs:
                logger.debug("[MONITOR CRON] No printing jobs to check")
                return
            
            logger.info(f"[MONITOR CRON] Checking {len(printing_jobs)} printing job(s)")
            
            cups_service = CupsJobMonitorService()
            printer_service = PrinterCheckService()
            now = datetime.now()
            
            jobs_updated = 0
            jobs_completed = 0
            jobs_failed = 0
            
            for waybill in printing_jobs:
                try:
                    invoice = waybill.invoice_number or f"ID:{waybill.id}"
                    
                    # Skip if no CUPS job ID (shouldn't happen)
                    if not waybill.cups_job_id or not waybill.printer_name:
                        logger.warning(f"[MONITOR CRON] Missing CUPS info for Invoice: {invoice}, WaybillID: {waybill.id}")
                        continue
                    
                    # Check if printer is online
                    if not printer_service.is_printer_online(waybill.printer_name):
                        # Printer offline - check if stuck
                        if waybill.updated_at:
                            elapsed = (now - waybill.updated_at).total_seconds()
                        else:
                            elapsed = 0
                        
                        if elapsed > STUCK_JOB_TIMEOUT:
                            # Mark as error - stuck waiting for offline printer
                            logger.error(f"[MONITOR CRON] Printer offline for {elapsed}s - Marking as error: Invoice {invoice}")
                            waybill.status = WaybillPrintStatuses.ERROR.value
                            waybill.print_status = PrintStatuses.ERROR.value
                            waybill.error_message = "Printer is offline - timeout waiting for printer"
                            waybill.print_error = "Printer is offline - timeout waiting for printer"
                            waybill.print_completed_at = now.replace(microsecond=0)
                            jobs_failed += 1
                        else:
                            # Still waiting for printer to come online - just log it
                            logger.info(f"[MONITOR CRON] Waiting for printer - elapsed: {elapsed}s - Invoice: {invoice}")
                        
                        jobs_updated += 1
                        continue
                    
                    # Printer is online - check CUPS job status
                    cups_status = cups_service.check_job_status(waybill.printer_name, waybill.cups_job_id)
                    
                    logger.debug(f"[MONITOR CRON] Check Invoice: {invoice}, State: {cups_status['state_name']}, "
                               f"Completed: {cups_status['is_completed']}, Failed: {cups_status['is_failed']}")
                    
                    # Handle completed jobs
                    if cups_status['is_completed']:
                        logger.info(f"[CUPS COMPLETED] ✅ COMPLETED - Invoice: {invoice}, WaybillID: {waybill.id}")
                        
                        # Log detailed CUPS state info when completed
                        logger.info(f"[CUPS COMPLETED] CUPS State Details:")
                        logger.info(f"  - Job ID: {waybill.cups_job_id}")
                        logger.info(f"  - Printer: {waybill.printer_name}")
                        logger.info(f"  - CUPS State Code: {cups_status['state']}")
                        logger.info(f"  - CUPS State Name: {cups_status['state_name']}")
                        logger.info(f"  - Time in Queue: {(now - waybill.updated_at).total_seconds()}s")
                        logger.info(f"  - DB Status Before: {waybill.status} / {waybill.print_status}")
                        
                        waybill.status = WaybillPrintStatuses.COMPLETED.value
                        waybill.print_status = PrintStatuses.COMPLETED.value
                        waybill.error_message = None
                        waybill.print_error = None
                        waybill.print_completed_at = now.replace(microsecond=0)
                        
                        logger.info(f"[CUPS COMPLETED] DB Status After: {waybill.status} / {waybill.print_status}")
                        logger.info(f"[CUPS COMPLETED] Print completed at: {waybill.print_completed_at}")
                        
                        jobs_completed += 1
                        jobs_updated += 1
                    
                    # Handle failed jobs
                    elif cups_status['is_failed']:
                        error_msg = f"CUPS job {cups_status['state_name']}"
                        logger.error(f"[MONITOR CRON] ❌ FAILED - Invoice: {invoice}, Error: {error_msg}")
                        waybill.status = WaybillPrintStatuses.ERROR.value
                        waybill.print_status = PrintStatuses.ERROR.value
                        waybill.error_message = error_msg
                        waybill.print_error = error_msg
                        waybill.print_completed_at = now.replace(microsecond=0)
                        jobs_failed += 1
                        jobs_updated += 1
                    
                    # Handle processing jobs (update print_status to 'printing')
                    elif cups_status['is_processing']:
                        if waybill.print_status != PrintStatuses.PRINTING.value:
                            logger.info(f"[MONITOR CRON] 🖨️  IN PROGRESS - Invoice: {invoice}")
                            waybill.print_status = PrintStatuses.PRINTING.value
                            jobs_updated += 1
                    
                except Exception as e:
                    logger.error(f"[MONITOR CRON ERROR] Invoice: {waybill.invoice_number}, Error: {str(e)}", exc_info=True)
                    continue
            
            # Commit all updates atomically
            if jobs_updated > 0:
                db.session.commit()
                logger.info(f"[MONITOR CRON SUMMARY] Updated: {jobs_updated}, Completed: {jobs_completed}, Failed: {jobs_failed}")
                
                # Notify frontend via SSE
                try:
                    from app.services.sse_service import notify_waybill_update
                    for waybill in printing_jobs:
                        notify_waybill_update(waybill.id)
                except Exception as e:
                    logger.warning(f"Failed to notify SSE: {str(e)}")
    
    except Exception as e:
        logger.error(f"[MONITOR CRON FATAL] {str(e)}", exc_info=True)


def start_print_monitor_cron(scheduler, app):
    """
    Register the print monitor CRON job with APScheduler.
    
    Args:
        scheduler: APScheduler BackgroundScheduler instance
        app: Flask app instance for app context
    """
    try:
        # Add job to run every 2 seconds
        scheduler.add_job(
            func=monitor_all_printing_jobs,
            args=[app],
            trigger="interval",
            seconds=CHECK_INTERVAL,
            id="print_monitor_cron",
            name="Print Job Monitor (CRON)",
            replace_existing=True,
            misfire_grace_time=10
        )
        logger.info(f"✓ Print monitor CRON job registered (interval: {CHECK_INTERVAL}s)")
    except Exception as e:
        logger.error(f"Failed to register print monitor CRON job: {str(e)}", exc_info=True)

