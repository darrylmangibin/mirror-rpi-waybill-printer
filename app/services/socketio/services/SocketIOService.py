from app.utils.loggers import get_logger
from datetime import datetime

logger = get_logger(__name__)


class SocketIOService:
    """
    Service class for SocketIO operations
    Similar to Laravel Services
    """

    @staticmethod
    def get_invoice_room_name(invoice_number: str, tenant_id: str) -> str:
        """
        Generate room name for invoice subscriptions
        Ensures tenant isolation
        """
        return f"invoice:{tenant_id}:{invoice_number}"

    @staticmethod
    def get_video_room_name(stream_id: str) -> str:
        """Generate room name for video stream subscriptions"""
        return f"video:{stream_id}"

    @staticmethod
    def emit_invoice_update(socketio, invoice_number: str, tenant_id: str, data: dict):
        """
        Emit invoice update to all subscribed clients

        Args:
            socketio: SocketIO instance
            invoice_number: The invoice number
            tenant_id: The tenant ID (for isolation)
            data: Update data to send
        """
        room = SocketIOService.get_invoice_room_name(invoice_number, tenant_id)

        payload = {
            "invoice_number": invoice_number,
            "tenant_id": tenant_id,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            **data,
        }

        socketio.emit("invoice_updated", payload, room=room)
        logger.info(f"📧 Emitted invoice update to room: {room}")

    @staticmethod
    def emit_video_start(socketio, stream_id: str, data: dict = None):
        """
        Emit video start event to all subscribed clients

        Args:
            socketio: SocketIO instance
            stream_id: Video stream ID
            data: Additional data (optional)
        """
        room = SocketIOService.get_video_room_name(stream_id)

        payload = {
            "stream_id": stream_id,
            "event": "video_start",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            **(data or {}),
        }

        socketio.emit("video_start", payload, room=room)
        logger.info(f"📹 Emitted video_start to room: {room}")

    @staticmethod
    def emit_video_stop(socketio, stream_id: str, data: dict = None):
        """
        Emit video stop event to all subscribed clients

        Args:
            socketio: SocketIO instance
            stream_id: Video stream ID
            data: Additional data (optional)
        """
        room = SocketIOService.get_video_room_name(stream_id)

        payload = {
            "stream_id": stream_id,
            "event": "video_stop",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            **(data or {}),
        }

        socketio.emit("video_stop", payload, room=room)
        logger.info(f"📹 Emitted video_stop to room: {room}")

    @staticmethod
    def broadcast_to_all(socketio, event_name: str, data: dict):
        """
        Broadcast message to all connected clients

        Args:
            socketio: SocketIO instance
            event_name: Name of the event
            data: Data to broadcast
        """
        payload = {"timestamp": datetime.utcnow().isoformat() + "Z", **data}

        socketio.emit(event_name, payload, broadcast=True)
        logger.info(f"📡 Broadcast {event_name} to all clients")
