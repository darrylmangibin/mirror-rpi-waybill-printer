from flask_socketio import emit, join_room, leave_room
from flask import request
from app.utils.loggers import get_logger

logger = get_logger(__name__)


class InvoiceEvents:
    """
    Handle invoice-related WebSocket events
    """

    @staticmethod
    def register_events(socketio):
        """Register all invoice-related events"""

        @socketio.on("subscribe_invoice")
        def handle_subscribe_invoice(data):
            """
            Subscribe to updates for a specific invoice
            """
            try:
                emit(
                    "subscribed_invoice",
                    {
                        "status": "success",
                        "data": data,
                    },
                )

                logger.info(
                    f"Client {request.sid} subscribed to invoice: {data}",
                    exc_info=True,
                )

            except Exception as e:
                logger.error(f"Error in subscribe_invoice: {str(e)}", exc_info=True)
                emit("error", {"message": str(e)})

        @socketio.on("unsubscribe_invoice")
        def handle_unsubscribe_invoice(data):
            """
            Unsubscribe from invoice updates
            """
            try:
                emit(
                    "unsubscribed_invoice",
                    {
                        "status": "success",
                        "data": data,
                    },
                )

            except Exception as e:
                logger.error(f"Error in unsubscribe_invoice: {str(e)}", exc_info=True)
