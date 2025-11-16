import threading
import time
from queue import Queue as ThreadQueue
from app.utils.loggers import get_logger

logger = get_logger(__name__)

# Single shared queue for print tasks
print_queue = ThreadQueue()


def print_worker():
    """Background worker - processes print tasks."""
    while True:
        try:
            waybill_id = print_queue.get()
            
            # Create fresh app context for this thread
            from app import create_app
            from app.database import db
            
            app = create_app()
            
            with app.app_context():
                from app.services.waybills.models.WaybillPrint import WaybillPrint
                
                waybill = db.session.query(WaybillPrint).get(waybill_id)
                if not waybill:
                    logger.error(f"Waybill {waybill_id} not found for printing")
                    print_queue.task_done()
                    continue
                
                invoice = waybill.invoice_number
                logger.info(f"[PRINT STARTED] Invoice: {invoice}")
                
                try:
                    from app.services.waybills.actions.PrintWaybillAction import PrintWaybillAction
                    action = PrintWaybillAction()
                    result = action(waybill)
                    
                    # Refresh waybill object to ensure session is clean
                    db.session.refresh(waybill)
                    
                    logger.info(f"[PRINT COMPLETE] Invoice: {invoice}, Status: {result.get('status')}")
                    logger.debug(f"[DEBUG] Full result: {result}")  # DEBUG: See full result
                    
                    # NEW: If print was successful, queue for CUPS monitoring
                    if result.get('status') == 'success':
                        logger.info(f"[DEBUG] Print successful, checking for data...")  # DEBUG
                        if result.get('data'):
                            cups_job_id = result['data'].get('job_id')
                            printer_name = result['data'].get('printer')
                            logger.info(f"[DEBUG] CUPS JobID: {cups_job_id}, Printer: {printer_name}")  # DEBUG
                            
                            if cups_job_id and printer_name:
                                try:
                                    from app.services.waybills.jobs.monitor_print_job import queue_monitor
                                    queue_monitor(waybill.id, cups_job_id, printer_name, invoice)
                                    logger.info(f"[AUTO-QUEUE MONITOR] Invoice: {invoice} - Queued for CUPS status monitoring, JobID: {cups_job_id}")
                                except Exception as monitor_error:
                                    logger.error(f"[ERROR] Failed to queue monitor: {str(monitor_error)}", exc_info=True)
                            else:
                                logger.warning(f"[WARNING] Missing cups_job_id or printer_name - JobID: {cups_job_id}, Printer: {printer_name}")
                        else:
                            logger.warning(f"[WARNING] No data in result: {result}")
                    else:
                        logger.warning(f"[WARNING] Print not successful, status: {result.get('status')}")
                
                except Exception as e:
                    logger.error(f"[PRINT ERROR] Invoice: {invoice}: {str(e)}", exc_info=True)
            
            print_queue.task_done()
        
        except Exception as e:
            logger.error(f"Print worker fatal error: {str(e)}", exc_info=True)
            time.sleep(1)


def start_print_workers(num_workers=1):
    """Start background print worker threads on app startup."""
    for i in range(num_workers):
        thread = threading.Thread(target=print_worker, daemon=True, name=f"WaybillPrintWorker-{i}")
        thread.start()
    logger.info(f"✓ Started {num_workers} waybill print worker threads")


def queue_print(waybill_id):
    """Queue a waybill for printing."""
    print_queue.put(waybill_id)
    logger.debug(f"Print task queued for waybill ID: {waybill_id}")

