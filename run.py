# Gevent monkey patching MUST be first, before any other imports
import os

ENVIRONMENT = os.getenv("ENVIRONMENT", "development").lower()

if ENVIRONMENT == "production":
    from gevent import monkey

    monkey.patch_all()

import logging
from dotenv import load_dotenv

load_dotenv()

print(f"Starting application in {ENVIRONMENT} mode.")

from app import create_app
from app.config.environment import DEBUG, HOST, PORT

# Disable Werkzeug logger to prevent duplicate logs from Flask's built-in logging
logging.getLogger("werkzeug").setLevel(logging.WARNING)

app, socketio = create_app()

if __name__ == "__main__":
    # CRITICAL: Disable reloader to prevent duplicate initialization
    # Flask reloader runs code in both parent and child process, causing duplicate logs
    socketio.run(
        app,
        debug=DEBUG,
        host=HOST,
        port=PORT,
        use_reloader=False,
        allow_unsafe_werkzeug=True,
    )
