import os
import logging
from dotenv import load_dotenv

load_dotenv()

ENVIRONMENT = os.getenv("ENVIRONMENT", "development").lower()

print(f"Starting application in {ENVIRONMENT} mode.")

if ENVIRONMENT == "production":
    import eventlet

    eventlet.monkey_patch()

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
