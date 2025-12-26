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

    def __call__(self, from_: date = None, to: date = None) -> dict:
        """
        Executes the waybill file cleanup process.

        Args:
            from_ (date, optional): If provided, only waybills created on or after
                                            this date will be considered for cleanup.
            to (date, optional): If provided, only waybills created on or before
                                          this date will be considered for cleanup.

        Returns:
            dict: A dictionary indicating the status and a message.
        """
        logger.info(f"Executing CleanWaybillsAction with from: {from_}, to: {to}")
        

