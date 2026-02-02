from app.utils.loggers import get_logger
from flask import Flask
from flask_socketio import SocketIO
from datetime import datetime

logger = get_logger(__name__)


class SocketIOService:
    """
    Service class for SocketIO operations
    """

    socketio: SocketIO

    def __init__(self, app: Flask):
        from app.services.socketio.config.socketio_config import SOCKETIO_CONFIG

        self.socketio = SocketIO(app, **SOCKETIO_CONFIG)

        # Register event handlers
        from app.services.socketio.events import (
            ConnectionEvents,
            InvoiceEvents,
            VideoEvents,
        )

        ConnectionEvents.register_events(self.socketio)
        InvoiceEvents.register_events(self.socketio)
        VideoEvents.register_events(self.socketio)

    @staticmethod
    def broadcast_to_all(self, event_name: str, data: dict):
        """
        Broadcast message to all connected clients

        Args:
            event_name: Name of the event
            data: Data to broadcast
        """
        payload = {"timestamp": datetime.utcnow().isoformat() + "Z", **data}

        try:
            self.socketio.emit(event_name, payload, broadcast=True)
        except Exception as e:
            logger.error(
                f"Error broadcasting {event_name} to all clients: {str(e)}",
                exc_info=True,
            )
        logger.info(f"📡 Broadcast {event_name} to all clients")
