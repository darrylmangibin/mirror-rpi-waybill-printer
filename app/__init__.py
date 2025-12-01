import os
from flask import Flask, request
from flask_cors import CORS
from flask_migrate import Migrate
from flask_sieve import Sieve
from app.database import db
from app.utils.network import get_local_ip
from app.services.waybills.jobs.download_waybill_job import start_workers
from app.services.waybills.jobs.print_waybill_job import start_print_workers
from app.services.waybills.jobs.monitor_print_job import start_monitor_workers

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
    
    # Initialize Flask-Sieve for request validation
    Sieve(app)
    
    # Register blueprints
    from app.services.waybills.routes.api import waybills_bp
    from app.services.health.routes.api import health_bp
    app.register_blueprint(waybills_bp)
    app.register_blueprint(health_bp)
    
    # Import models
    from app.services.waybills.models.WaybillPrint import WaybillPrint
    
    # Register CLI commands (like Laravel Artisan)
    from app.commands import routes
    from app.commands import db as db_commands
    app.cli.add_command(routes)
    app.cli.add_command(db_commands)

    # Start background workers for waybill processing
    with app.app_context():
        from app.utils.loggers import get_logger
        logger = get_logger(__name__)
        
        try:
            start_workers(num_workers=1)           # Download worker thread
            logger.info("✓ Download workers initialized")
        except Exception as e:
            logger.error(f"Failed to start download workers: {str(e)}", exc_info=True)
        
        try:
            start_print_workers(num_workers=1)     # Print worker thread
            logger.info("✓ Print workers initialized")
        except Exception as e:
            logger.error(f"Failed to start print workers: {str(e)}", exc_info=True)
        
        try:
            start_monitor_workers(num_workers=1)   # NEW: Monitor worker thread (checks CUPS job status)
            logger.info("✓ Monitor workers initialized successfully")
        except Exception as e:
            logger.error(f"Failed to start monitor workers: {str(e)}", exc_info=True)
    
    @app.route('/api/network/local-ip')
    def get_network_info():
        # Check if HTTPS is enabled via environment variable or proxy headers
        use_https = os.getenv('USE_HTTPS', 'false').lower() == 'true'
        
        # Also check for X-Forwarded-Proto header (set by nginx reverse proxy)
        if request.headers.get('X-Forwarded-Proto') == 'https':
            use_https = True
        
        protocol = "https" if use_https else "http"
        return {
            "local_ip": get_local_ip(),
            "api_url": f"{protocol}://{get_local_ip()}:5000",
            "status": "success"
        }
    
    @app.route('/')
    def hello():
        return {"message": "Hello World", "status": "success"}
    
    return app
