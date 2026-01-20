from flask_socketio import emit, join_room, leave_room
from flask import request
from app.utils.loggers import get_logger
from app.services.socketio.services.SocketIOService import SocketIOService

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
            Client sends: { "invoice_number": "INV-12345", "tenant_id": "tenant-123" }
            """
            try:
                invoice_number = data.get("invoice_number")
                tenant_id = data.get("tenant_id")

                if not invoice_number or not tenant_id:
                    emit(
                        "error",
                        {"message": "invoice_number and tenant_id are required"},
                    )
                    return

                # Create room name for this invoice (tenant-scoped)
                room_name = SocketIOService.get_invoice_room_name(
                    invoice_number, tenant_id
                )
                join_room(room_name)

                logger.info(
                    f"📧 Client {request.sid} subscribed to invoice: {invoice_number} (tenant: {tenant_id})"
                )

                emit(
                    "subscribed",
                    {
                        "status": "success",
                        "invoice_number": invoice_number,
                        "tenant_id": tenant_id,
                        "message": f"Subscribed to invoice {invoice_number}",
                    },
                )

            except Exception as e:
                logger.error(f"Error in subscribe_invoice: {str(e)}", exc_info=True)
                emit("error", {"message": str(e)})

        @socketio.on("unsubscribe_invoice")
        def handle_unsubscribe_invoice(data):
            """
            Unsubscribe from invoice updates
            Client sends: { "invoice_number": "INV-12345", "tenant_id": "tenant-123" }
            """
            try:
                invoice_number = data.get("invoice_number")
                tenant_id = data.get("tenant_id")

                if not invoice_number or not tenant_id:
                    return

                room_name = SocketIOService.get_invoice_room_name(
                    invoice_number, tenant_id
                )
                leave_room(room_name)

                logger.info(
                    f"📧 Client {request.sid} unsubscribed from invoice: {invoice_number}"
                )

                emit(
                    "unsubscribed",
                    {
                        "status": "success",
                        "invoice_number": invoice_number,
                        "message": f"Unsubscribed from invoice {invoice_number}",
                    },
                )

            except Exception as e:
                logger.error(f"Error in unsubscribe_invoice: {str(e)}", exc_info=True)
