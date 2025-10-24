from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from app.database import db

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
    
    # Register blueprints
    from app.services.waybills.routes.api import waybills_bp
    app.register_blueprint(waybills_bp)
    
    # Register CLI commands (like Laravel Artisan)
    from app.commands import db, routes
    app.cli.add_command(db)
    app.cli.add_command(routes)
    
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
