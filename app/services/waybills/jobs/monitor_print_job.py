import threading
import time
from queue import Queue as ThreadQueue
from datetime import datetime
from app.utils.loggers import get_logger

logger = get_logger(__name__)

# Queue to store print jobs that need monitoring
monitor_queue = ThreadQueue()


def monitor_worker():
    """
    Background worker - monitors CUPS print job status and updates database.
    Periodically checks CUPS for job completion and updates WaybillPrint status.
    """
    from app.services.waybills.services.CupsJobMonitorService import CupsJobMonitorService
    
    monitor_service = CupsJobMonitorService()
    
    while True:
        try:
            # Get job to monitor (with timeout to allow graceful shutdown)
            try:
                job_data = monitor_queue.get(timeout=5)
            except:
                continue
            
            waybill_id = job_data['waybill_id']
            cups_job_id = job_data['cups_job_id']
            printer_name = job_data['printer_name']
            invoice_number = job_data.get('invoice_number', f'ID:{waybill_id}')
            
            # Create fresh app context for this thread
            from app import create_app
            from app.database import db
            
            app = create_app()
            
            with app.app_context():
                from app.services.waybills.models.WaybillPrint import WaybillPrint
                
                waybill = db.session.query(WaybillPrint).get(waybill_id)
                if not waybill:
                    logger.error(f"Waybill {waybill_id} not found during monitoring")
                    monitor_queue.task_done()
                    continue
                
                logger.info(f"[MONITOR START] Invoice: {invoice_number}, WaybillID: {waybill_id}, CUPS JobID: {cups_job_id}, Printer: {printer_name}")
                
                # Monitor the job until completion or error
                max_checks = 120  # Check for max 10 minutes (every 5 seconds)
                check_count = 0
                
                while check_count < max_checks:
                    try:
                        # Check job status from CUPS
                        status = monitor_service.check_job_status(printer_name, cups_job_id)
                        
                        if status['is_completed']:
                            # Job completed successfully ✅
                            logger.info(f"[PRINT COMPLETED] Invoice: {invoice_number}, WaybillID: {waybill_id}, CUPS JobID: {cups_job_id}")
                            waybill.print_status = 'completed'
                            waybill.status = 'completed'  # Overall status is also completed
                            waybill.print_completed_at = datetime.now().replace(microsecond=0)
                            db.session.commit()
                            break
                        
                        elif status['is_failed']:
                            # Job failed/aborted ❌
                            error_msg = f"CUPS job {status['state_name']}"
                            logger.error(f"[PRINT FAILED] Invoice: {invoice_number}, WaybillID: {waybill_id}, CUPS JobID: {cups_job_id}: {error_msg}")
                            waybill.print_status = 'error'
                            waybill.status = 'error'  # Overall status is also error
                            waybill.print_error = error_msg
                            waybill.print_completed_at = datetime.now().replace(microsecond=0)
                            db.session.commit()
                            break
                        
                        elif status['is_processing']:
                            # Job still processing - update to 'printing' if not already
                            if waybill.print_status != 'printing':
                                logger.debug(f"[PRINT IN PROGRESS] Invoice: {invoice_number}, WaybillID: {waybill_id}, CUPS JobID: {cups_job_id}, State: {status['state_name']}")
                                waybill.print_status = 'printing'
                                db.session.commit()
                        
                        # Wait before checking again
                        check_count += 1
                        time.sleep(5)
                    
                    except Exception as e:
                        logger.error(f"[MONITOR ERROR] Invoice: {invoice_number}, WaybillID: {waybill_id}: {str(e)}", exc_info=True)
                        check_count += 1
                        time.sleep(5)
                
                # Check if we hit timeout
                if check_count >= max_checks:
                    logger.warning(f"[MONITOR TIMEOUT] Invoice: {invoice_number}, WaybillID: {waybill_id}, CUPS JobID: {cups_job_id} - Exceeded maximum monitoring time ({max_checks * 5} seconds)")
                    waybill.print_status = 'error'
                    waybill.status = 'error'
                    waybill.print_error = "Print job monitoring timeout - status unknown"
                    waybill.print_completed_at = datetime.now().replace(microsecond=0)
                    db.session.commit()
                
                logger.info(f"[MONITOR COMPLETE] Invoice: {invoice_number}, WaybillID: {waybill_id}, Final print_status: {waybill.print_status}")
            
            monitor_queue.task_done()
        
        except Exception as e:
            logger.error(f"Monitor worker fatal error: {str(e)}", exc_info=True)
            time.sleep(1)


def start_monitor_workers(num_workers: int = 1):
    """
    Start background monitor worker threads on app startup.
    
    Args:
        num_workers (int): Number of monitor worker threads to start
    """
    for i in range(num_workers):
        thread = threading.Thread(
            target=monitor_worker,
            daemon=True,
            name=f"PrintMonitorWorker-{i}"
        )
        thread.start()
    logger.info(f"✓ Started {num_workers} print monitor worker thread(s)")


def queue_monitor(waybill_id: int, cups_job_id: int, printer_name: str, invoice_number: str = None):
    """
    Queue a CUPS print job for monitoring.
    
    Args:
        waybill_id (int): Database ID of the waybill
        cups_job_id (int): CUPS job ID
        printer_name (str): Printer name
        invoice_number (str): Optional invoice number for logging
    """
    monitor_queue.put({
        'waybill_id': waybill_id,
        'cups_job_id': cups_job_id,
        'printer_name': printer_name,
        'invoice_number': invoice_number
    })
    logger.debug(f"Monitor task queued - Waybill: {waybill_id}, CUPS JobID: {cups_job_id}, Printer: {printer_name}")

