"""
SocketIO Configuration
"""

SOCKETIO_CONFIG = {
    "cors_allowed_origins": "*",
    "async_mode": "threading",
    "logger": True,
    "engineio_logger": False,
    "ping_timeout": 60,
    "ping_interval": 25,
}

NAMESPACES = {
    "default": "/",
    "invoice": "/invoice",
    "video": "/video",
}
