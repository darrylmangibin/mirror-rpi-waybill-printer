import os
from dotenv import load_dotenv
from app import create_app
from app.config.environment import DEBUG, HOST, PORT

# Load .env file if it exists
load_dotenv()

app = create_app()

if __name__ == '__main__':
    app.run(debug=DEBUG, host=HOST, port=PORT, use_reloader=False)


