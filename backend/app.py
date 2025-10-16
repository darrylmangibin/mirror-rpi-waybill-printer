from flask import Flask
from utils import setup_logger
from routes import api_bp
from database import init_app as init_db


def create_app():
    """
    Application factory function.
    Creates and configures the Flask application.
    """
    app = Flask(__name__)
    
    # Configure logging
    setup_logger(app)
    
    # Initialize database
    init_db(app)
    
    # Register blueprints
    app.register_blueprint(api_bp)
    
    return app


app = create_app()


if __name__ == '__main__':
    app.run(debug=True)