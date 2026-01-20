from flask_socketio import SocketIO

# Global socketio instance
socketio = None


def init_socketio(app):
    """Initialize SocketIO with the Flask app"""
    global socketio
    from app.services.socketio.config.socketio_config import SOCKETIO_CONFIG

    socketio = SocketIO(app, **SOCKETIO_CONFIG)

    # Register event handlers
    from app.services.socketio.events import (
        ConnectionEvents,
        InvoiceEvents,
        VideoEvents,
    )

    ConnectionEvents.register_events(socketio)
    InvoiceEvents.register_events(socketio)
    VideoEvents.register_events(socketio)

    return socketio


def get_socketio():
    """Get the global socketio instance"""
    return socketio
