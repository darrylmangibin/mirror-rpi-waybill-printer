from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from app.db.models import db

def create_app():
    app = Flask(__name__)
    
    # Database configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///waybills.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize extensions
    db.init_app(app)
    migrate = Migrate(app, db, directory='app/migrations')
    
    # Enable CORS - allows frontend on different port to call this API
    CORS(app)
    
    # Ensure models are imported so migrations can detect them
    from app.db.models import Waybill, PrintHistory  # noqa: F401
    
    # Register blueprints
    from app.services.waybills.routes.api import waybills_bp
    app.register_blueprint(waybills_bp)
    
    # API endpoint for testing
    @app.route('/api/hello')
    def api_hello():
        return {
            "message": "Hello from Flask Backend!",
            "status": "success"
        }
    
    @app.route('/')
    def hello():
        return {"message": "Hello World"}
    
    return app
