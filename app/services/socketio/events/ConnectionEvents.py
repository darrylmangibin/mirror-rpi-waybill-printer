import time
from flask_socketio import emit, disconnect
from flask import request
from app.utils.loggers import get_logger

logger = get_logger(__name__)


class ConnectionEvents:
    """
    Handle WebSocket connection events
    Similar to Laravel Events
    """

    @staticmethod
    def register_events(socketio):
        """Register all connection-related events"""

        @socketio.on("connect")
        def handle_connect():
            """Handle client connection"""
            client_id = request.sid
            client_ip = request.remote_addr
            logger.info(f"Client connected - SID: {client_id}, IP: {client_ip}")

            emit(
                "connection_established",
                {
                    "status": "success",
                    "message": "Connected to server successfully",
                    "sid": client_id,
                    "timestamp": ConnectionEvents._get_timestamp(),
                },
            )

        @socketio.on("disconnect")
        def handle_disconnect():
            """Handle client disconnection"""
            client_id = request.sid
            logger.info(f"Client disconnected - SID: {client_id}")

            disconnect(sid=client_id)

        @socketio.on("ping")
        def handle_ping(payload):
            """Handle ping for keepalive"""
            logger.info(f"Ping received from client - SID: {request.sid}")
            emit("pong", {"timestamp": ConnectionEvents._get_timestamp()})

    @staticmethod
    def _get_timestamp():
        """Get current timestamp in ISO format"""
        from datetime import datetime

        return datetime.utcnow().isoformat() + "Z"
