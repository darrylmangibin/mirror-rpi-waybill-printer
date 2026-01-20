"""
SocketIO Configuration
Similar to Laravel config files
"""

SOCKETIO_CONFIG = {
    "cors_allowed_origins": "*",
    "async_mode": "threading",
    "logger": True,
    "engineio_logger": False,
    "ping_timeout": 60,
    "ping_interval": 25,
}

# Namespaces (like Laravel route groups)
NAMESPACES = {
    "default": "/",
    "invoice": "/invoice",
    "video": "/video",
}
