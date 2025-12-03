import os
from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from flask_sieve import Sieve
from apscheduler.schedulers.background import BackgroundScheduler
from app.database import db
from app.utils.network import get_local_ip
from app.services.waybills.jobs.download_waybill_job import start_workers
from app.services.waybills.jobs.print_waybill_job import start_print_workers
from app.services.waybills.jobs.print_job_monitor_cron import start_print_monitor_cron

def create_app():
    # Set custom instance path to keep database inside app directory
    instance_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instance')
    os.makedirs(instance_path, exist_ok=True)
    
    app = Flask(__name__, instance_path=instance_path)
    
    # Database configuration (now uses instance folder inside app/)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///fusion_printer.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Connection pooling optimization for RPi
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'pool_size': 5,                    # RPi: smaller pool
        'max_overflow': 10,                # Allow overflow to 15 total
        'pool_recycle': 3600,              # Recycle connections every hour
        'pool_pre_ping': True,             # Test connection before use
        'echo': False,                     # No SQL logging (saves RPi CPU)
    }
    
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

    # Start background workers and CRON jobs
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
        
        # Initialize APScheduler for CRON jobs
        try:
            scheduler = BackgroundScheduler(daemon=True)
            start_print_monitor_cron(scheduler, app)    # Pass app for app context in background thread
            scheduler.start()
            logger.info("✓ APScheduler initialized with print monitor CRON job")
        except Exception as e:
            logger.error(f"Failed to start APScheduler: {str(e)}", exc_info=True)
    
    @app.route('/api/network/local-ip')
    def get_network_info():
        return {
            "local_ip": get_local_ip(),
            "api_url": f"http://{get_local_ip()}:5000",
            "status": "success"
        }
    
    @app.route('/')
    def hello():
        return {"message": "Hello World", "status": "success"}
    
    return app
