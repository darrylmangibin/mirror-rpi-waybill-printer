import threading
import time
from queue import Queue as ThreadQueue
from app.utils.loggers import get_logger

logger = get_logger(__name__)

# Single shared queue for retry tasks
retry_queue = ThreadQueue()

# Universal max retries for all marketplaces
MAX_RETRIES = 2


def retry_worker():
    """Background worker - processes retry download tasks."""
    while True:
        try:
            waybill_id = retry_queue.get()

            # Create fresh app context for this thread
            from app import create_app
            from app.database import db

            app, _ = create_app()  # Unpack tuple (app, socketio)

            with app.app_context():
                from app.services.waybills.models.WaybillPrint import WaybillPrint
                from datetime import datetime

                waybill = db.session.query(WaybillPrint).get(waybill_id)
                if not waybill:
                    logger.error(f"Waybill {waybill_id} not found for retry")
                    retry_queue.task_done()
                    continue

                invoice = waybill.invoice_number
                current_retry = waybill.download_retry_count + 1

                logger.info(
                    f"[RETRY STARTED] Invoice: {invoice}, Marketplace: {waybill.marketplace}, Attempt: {current_retry}/{MAX_RETRIES}"
                )

                try:
                    # Update retry tracking before attempt
                    waybill.download_retry_count = current_retry
                    waybill.last_retry_at = datetime.now().replace(microsecond=0)
                    waybill.error_message = (
                        None  # Clear previous error message for fresh attempt
                    )
                    db.session.commit()

                    # Re-attempt download
                    from app.services.waybills.actions.DownloadWaybillAction import (
                        DownloadWaybillAction,
                    )

                    action = DownloadWaybillAction()
                    result = action(waybill)

                    # Refresh waybill object
                    db.session.refresh(waybill)

                    if result.get("status") == "success":
                        logger.info(
                            f"[RETRY SUCCESS] Invoice: {invoice}, Marketplace: {waybill.marketplace}, Attempt: {current_retry}/{MAX_RETRIES}"
                        )
                    else:
                        logger.warning(
                            f"[RETRY FAILED] Invoice: {invoice}, Marketplace: {waybill.marketplace}, Attempt: {current_retry}/{MAX_RETRIES}: {result.get('message')}"
                        )

                except Exception as e:
                    logger.error(
                        f"[RETRY ERROR] Invoice: {invoice}, Marketplace: {waybill.marketplace}, Attempt: {current_retry}/{MAX_RETRIES}: {str(e)}",
                        exc_info=True,
                    )

            retry_queue.task_done()

        except Exception as e:
            logger.error(f"Retry worker fatal error: {str(e)}", exc_info=True)
            time.sleep(1)


def start_retry_workers(num_workers=1):
    """Start background retry worker threads on app startup."""
    for i in range(num_workers):
        thread = threading.Thread(
            target=retry_worker, daemon=True, name=f"WaybillRetryWorker-{i}"
        )
        thread.start()
    logger.info(f"Started {num_workers} retry worker thread(s)")


def queue_retry(waybill_id, delay_seconds=5):
    """
    Queue a waybill for retry after a delay.
    Universal backup mechanism for all marketplaces.

    Args:
        waybill_id: ID of the waybill to retry
        delay_seconds: Delay before retrying (exponential backoff, default 5s)
    """
    # Sleep before queueing to allow time between attempts
    time.sleep(delay_seconds)
    retry_queue.put(waybill_id)
    logger.debug(
        f"Retry task queued for waybill ID: {waybill_id} (delay: {delay_seconds}s)"
    )
