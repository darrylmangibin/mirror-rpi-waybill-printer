import os
from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from app.database import db

def create_app():
    # Set custom instance path to keep database inside app directory
    instance_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instance')
    os.makedirs(instance_path, exist_ok=True)
    
    app = Flask(__name__, instance_path=instance_path)
    
    # Database configuration (now uses instance folder inside app/)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///fusion_printer.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize extensions
    db.init_app(app)
    migrate = Migrate(app, db, directory='app/migrations')
    
    # Enable CORS - allows frontend on different port to call this API
    CORS(app)
    
    # Register blueprints
    from app.services.waybills.routes.api import waybills_bp
    app.register_blueprint(waybills_bp)
    
    # Import models
    from app.services.waybills.models.WaybillPrint import WaybillPrint
    
    # Import models
    from app.models.Shipment import Shipment
    
    # Register CLI commands (like Laravel Artisan)
    from app.commands import routes
    from app.commands import db as db_commands
    app.cli.add_command(routes)
    app.cli.add_command(db_commands)
    
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
