import os
import logging
from dotenv import load_dotenv
from app import create_app
from app.config.environment import DEBUG, HOST, PORT

# Load .env file if it exists
load_dotenv()

# Disable Werkzeug logger to prevent duplicate logs from Flask's built-in logging
logging.getLogger("werkzeug").setLevel(logging.WARNING)

app, socketio = create_app()

if __name__ == "__main__":
    # CRITICAL: Disable reloader to prevent duplicate initialization
    # Flask reloader runs code in both parent and child process, causing duplicate logs
    socketio.run(app, debug=DEBUG, host=HOST, port=PORT, use_reloader=False)
