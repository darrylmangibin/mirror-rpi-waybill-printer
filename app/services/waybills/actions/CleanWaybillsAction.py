import os
from datetime import datetime, timedelta
from app.utils.loggers import get_logger
from app.database import db
from app.services.waybills.models.WaybillPrint import WaybillPrint

logger = get_logger(__name__)


class CleanWaybillsAction:
    """
    Action class to handle the cleanup of old waybill print files.
    This includes filtering based on date range and predefined retention policies,
    and then safely deleting the associated local files.
    """

    def execute(self, from_date: datetime = None, to_date: datetime = None) -> dict:
        """
        Executes the waybill file cleanup process.

        Args:
            from_date (datetime, optional): If provided, only waybills created on or after
                                            this date will be considered for cleanup.
            to_date (datetime, optional): If provided, only waybills created on or before
                                          this date will be considered for cleanup.

        Returns:
            dict: A dictionary indicating the status and a message.
        """
        log_message = f"Hey, we are preparing to clean files (Action). "
        if from_date:
            log_message += f"Filtering from {from_date.strftime('%Y-%m-%d')}. "
        if to_date:
            log_message += f"Filtering up to {to_date.strftime('%Y-%m-%d')}. "
        if not from_date and not to_date:
            log_message += "No specific date range provided, will use default retention policies. "

        logger.info(log_message)

        # Define cleanup thresholds
        COMPLETED_PRINT_RETENTION_DAYS = 7
        FAILED_DOWNLOAD_RETENTION_DAYS = 3
        FAILED_PRINT_RETENTION_DAYS = 3
        DOWNLOADED_UNPRINTED_RETENTION_DAYS = 14

        now = datetime.now()

        # Base query for waybills to be cleaned
        base_query = WaybillPrint.query.filter(
            WaybillPrint.local_file_path.isnot(None)
        )
        if from_date:
            # For 'from_date', we want to include the entire day, so use >= start of day
            base_query = base_query.filter(WaybillPrint.created_at >= from_date.replace(hour=0, minute=0, second=0, microsecond=0))
        if to_date:
            # For 'to_date', we want to include the entire day, so use < start of next day
            next_day = to_date + timedelta(days=1)
            base_query = base_query.filter(WaybillPrint.created_at < next_day.replace(hour=0, minute=0, second=0, microsecond=0))

        # 1. Clean up successfully printed waybills
        completed_cutoff_date = now - timedelta(days=COMPLETED_PRINT_RETENTION_DAYS)
        completed_prints_to_clean = base_query.filter(
            WaybillPrint.print_status == 'completed',
            WaybillPrint.print_completed_at < completed_cutoff_date,
        ).all()

        logger.info(f"Found {len(completed_prints_to_clean)} completed prints to clean.")
        for waybill_print in completed_prints_to_clean:
            self._delete_file_and_clear_path(waybill_print, "completed print")

        # 2. Clean up failed downloads/prints
        failed_download_cutoff_date = now - timedelta(days=FAILED_DOWNLOAD_RETENTION_DAYS)
        failed_downloads_to_clean = base_query.filter(
            WaybillPrint.status == 'failed',
            WaybillPrint.downloaded_at < failed_download_cutoff_date,
        ).all()

        logger.info(f"Found {len(failed_downloads_to_clean)} failed downloads to clean.")
        for waybill_print in failed_downloads_to_clean:
            self._delete_file_and_clear_path(waybill_print, "failed download")

        failed_print_cutoff_date = now - timedelta(days=FAILED_PRINT_RETENTION_DAYS)
        failed_prints_to_clean = base_query.filter(
            WaybillPrint.print_status == 'error',
            WaybillPrint.print_completed_at < failed_print_cutoff_date,
        ).all()

        logger.info(f"Found {len(failed_prints_to_clean)} failed prints to clean.")
        for waybill_print in failed_prints_to_clean:
            self._delete_file_and_clear_path(waybill_print, "failed print")

        # 3. Clean up downloaded but unprinted waybills (if they are very old)
        downloaded_unprinted_cutoff_date = now - timedelta(days=DOWNLOADED_UNPRINTED_RETENTION_DAYS)
        downloaded_unprinted_to_clean = base_query.filter(
            WaybillPrint.status == 'downloaded',
            WaybillPrint.print_status.in_(['idle', 'pending', 'cancelled']),
            WaybillPrint.downloaded_at < downloaded_unprinted_cutoff_date,
        ).all()

        logger.info(f"Found {len(downloaded_unprinted_to_clean)} downloaded but unprinted waybills to clean.")
        for waybill_print in downloaded_unprinted_to_clean:
            self._delete_file_and_clear_path(waybill_print, "downloaded but unprinted")

        try:
            db.session.commit()
            logger.info("WaybillPrint file cleanup completed successfully.")
            return {
                'status': 'success',
                'message': log_message.strip() + " Cleanup completed."
            }
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error during WaybillPrint file cleanup commit: {str(e)}", exc_info=True)
            return {
                'status': 'error',
                'message': f"Cleanup failed: {str(e)}"
            }
    @staticmethod
    def _delete_file_and_clear_path(waybill_print: WaybillPrint, reason: str):
        file_path = waybill_print.local_file_path
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
                waybill_print.local_file_path = None
                waybill_print.updated_at = datetime.now().replace(microsecond=0)
                logger.info(f"[CLEANUP] Deleted file '{file_path}' for WaybillPrint ID {waybill_print.id} ({reason}).")
            except Exception as e:
                logger.error(f"[CLEANUP] Failed to delete file '{file_path}' for WaybillPrint ID {waybill_print.id}: {str(e)}", exc_info=True)
        elif file_path:
            logger.warning(f"[CLEANUP] File path '{file_path}' for WaybillPrint ID {waybill_print.id} ({reason}) did not exist on disk, clearing path in DB.")
            waybill_print.local_file_path = None
            waybill_print.updated_at = datetime.now().replace(microsecond=0)
        else:
            logger.info(f"[CLEANUP] No local file path to delete for WaybillPrint ID {waybill_print.id} ({reason}).")

