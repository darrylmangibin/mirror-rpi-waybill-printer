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

        @socketio.on("active_invoice")
        def handle_active_invoice(data):
            """
            Active invoice
            """
            try:
                emit(
                    "active_invoice",
                    {
                        "status": "success",
                        "data": data,
                    },
                    broadcast=True,
                )

            except Exception as e:
                logger.error(f"Error in active_invoice: {str(e)}", exc_info=True)
                emit("error", {"message": str(e)})

        @socketio.on("inactive_invoice")
        def handle_inactive_invoice(data):
            """
            Inactive invoice
            """
            try:
                emit(
                    "inactive_invoice",
                    {
                        "status": "success",
                        "data": data,
                    },
                    broadcast=True,
                )

            except Exception as e:
                logger.error(f"Error in inactive_invoice: {str(e)}", exc_info=True)

        @socketio.on("packing_completed")
        def handle_packing_completed(data):
            """
            Packing completed
            """
            try:
                emit(
                    "packing_completed",
                    {
                        "status": "success",
                        "data": data,
                    },
                    broadcast=True,
                )
            except Exception as e:
                logger.error(f"Error in complete_invoice: {str(e)}", exc_info=True)
