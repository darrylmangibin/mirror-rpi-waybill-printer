"""
Printer Status Check Job

Periodic background job that:
1. Checks if configured printer is online
2. Detects and cancels jobs stuck waiting on offline printer
3. Runs every N minutes to monitor printer availability
"""

import threading
import time
from app.utils.loggers import get_logger
from app.config.helper import get
from app.config import printing as printing_config

logger = get_logger(__name__)

# Get printer name from config
PRINTER_NAME = get(printing_config.config, 'printer.name')
CHECK_INTERVAL = 30  # Check every 30 seconds


def printer_check_worker():
    """
    Background worker - periodically checks printer status.
    If printer is offline, cancels stuck print jobs.
    """
    from app.services.waybills.services.PrinterCheckService import PrinterCheckService
    
    logger.info(f"Printer check worker started - checking '{PRINTER_NAME}' every {CHECK_INTERVAL} seconds")
    
    check_service = PrinterCheckService()
    
    while True:
        try:
            # Get status report
            report = check_service.get_printer_status_report(PRINTER_NAME)
            
            if not report.get('is_online'):
                logger.warning(f"[PRINTER CHECK] Printer '{PRINTER_NAME}' is OFFLINE - {report.get('stuck_job_count', 0)} stuck jobs detected")
                
                # If printer is offline and there are stuck jobs, handle them
                if report.get('stuck_job_count', 0) > 0:
                    result = check_service.check_and_handle_stuck_jobs(PRINTER_NAME)
                    logger.info(f"[PRINTER OFFLINE HANDLER] Result: {result['message']} - Cancelled: {result['cancelled_count']} jobs")
            else:
                logger.debug(f"[PRINTER CHECK] Printer '{PRINTER_NAME}' is online - {report.get('active_job_count', 0)} active jobs")
            
            # Wait before next check
            time.sleep(CHECK_INTERVAL)
        
        except Exception as e:
            logger.error(f"Printer check worker error: {str(e)}", exc_info=True)
            time.sleep(CHECK_INTERVAL)


def start_printer_check_worker():
    """
    Start the printer check background worker in a daemon thread.
    Called during app initialization.
    """
    try:
        thread = threading.Thread(target=printer_check_worker, daemon=True)
        thread.start()
        logger.info(f"Printer check worker thread started (daemon)")
    except Exception as e:
        logger.error(f"Failed to start printer check worker: {str(e)}", exc_info=True)

