"""
SocketIO Configuration
Similar to Laravel config files
"""

import os
from dotenv import load_dotenv

load_dotenv()

ENVIRONMENT = os.getenv("ENVIRONMENT", "development").lower()

ASYNC_MODE = "threading" if ENVIRONMENT == "development" else "gevent"

SOCKETIO_CONFIG = {
    "cors_allowed_origins": "*",
    "async_mode": ASYNC_MODE,
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
