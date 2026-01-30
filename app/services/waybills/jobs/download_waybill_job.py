import threading
import time
from queue import Queue as ThreadQueue
from app.utils.loggers import get_logger

logger = get_logger(__name__)

# Single shared queue for download tasks
download_queue = ThreadQueue()


def worker():
    """Background worker - processes download tasks."""
    while True:
        try:
            waybill_id = download_queue.get()

            # Create fresh app context for this thread
            from app import create_app
            from app.database import db

            app, _ = create_app()  # Unpack tuple (app, socketio)

            with app.app_context():
                from app.services.waybills.models.WaybillPrint import WaybillPrint

                waybill = db.session.query(WaybillPrint).get(waybill_id)
                if not waybill:
                    logger.error(f"Waybill {waybill_id} not found")
                    download_queue.task_done()
                    continue

                invoice = waybill.invoice_number
                logger.info(f"[DOWNLOAD STARTED] Invoice: {invoice}")

                try:
                    from app.services.waybills.actions.DownloadWaybillAction import (
                        DownloadWaybillAction,
                    )

                    action = DownloadWaybillAction()
                    result = action(waybill)

                    # Refresh waybill object to ensure session is clean
                    db.session.refresh(waybill)

                    logger.info(
                        f"[DOWNLOAD COMPLETE] Invoice: {invoice}, Status: {result.get('status')}"
                    )

                    # Note: Auto-printing is disabled by default. Manual printing is required via the UI.
                    if result.get("status") == "success":
                        logger.info(
                            f"[DOWNLOAD SUCCESS] Invoice: {invoice} - Download complete. Manual print required via UI."
                        )
                except Exception as e:
                    logger.error(
                        f"[DOWNLOAD ERROR] Invoice: {invoice}: {str(e)}", exc_info=True
                    )

            download_queue.task_done()

        except Exception as e:
            logger.error(f"Worker fatal error: {str(e)}", exc_info=True)
            time.sleep(1)


def start_workers(num_workers=1):
    """Start background worker threads on app startup."""
    for i in range(num_workers):
        thread = threading.Thread(
            target=worker, daemon=True, name=f"WaybillDownloadWorker-{i}"
        )
        thread.start()


def queue_download(waybill_id):
    """Queue a waybill for download."""
    download_queue.put(waybill_id)
    logger.debug(f"Download task queued for waybill ID: {waybill_id}")
