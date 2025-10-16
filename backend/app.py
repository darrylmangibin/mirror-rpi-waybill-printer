from flask import Flask
from flask_migrate import Migrate
from utils import setup_logger
from routes import api_bp
from models import db, init_models


def create_app():
    """
    Application factory function.
    Creates and configures the Flask application.
    """
    app = Flask(__name__)
    
    # Configure database
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///raspberry_pi.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Configure logging
    setup_logger(app)
    
    # Initialize database and migrations
    db.init_app(app)
    Migrate(app, db)
    
    # Initialize models
    init_models(app)
    
    # Register blueprints
    app.register_blueprint(api_bp)
    
    return app


app = create_app()


if __name__ == '__main__':
    app.run(debug=True)