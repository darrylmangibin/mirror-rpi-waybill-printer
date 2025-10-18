from flask import Flask
from flask_migrate import Migrate
from utils import setup_logger
from routes import api_bp, health_bp
from models import db, init_models
from jobs.scheduler import JobScheduler
from domains.print_jobs.jobs.print_job_cron import PrintJobCron
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()


def create_app():
    """
    Application factory function.
    Creates and configures the Flask application.
    """
    # Get the absolute path to the templates directory
    template_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'templates')
    
    app = Flask(__name__, template_folder=template_dir)
    
    # Configure database from environment or use default
    database_uri = os.getenv('DATABASE_URI', 'sqlite:///raspberry_pi.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = database_uri
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Configure Flask environment
    app.config['ENV'] = os.getenv('FLASK_ENV', 'development')
    app.config['DEBUG'] = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    
    # Configure logging
    setup_logger(app)
    
    # Initialize database and migrations
    db.init_app(app)
    Migrate(app, db)
    
    # Initialize models
    init_models(app)
    
    # Initialize job scheduler (only once)
    JobScheduler.initialize()
    
    # Register jobs only if not already registered
    if 'print_job_cron' not in JobScheduler._jobs:
        # Print Jobs Domain
        JobScheduler.register_job(
            cron_instance=PrintJobCron(),
            job_id='print_job_cron',
            interval_seconds=1
        )
    
    # Start scheduler (only if not already running)
    if not JobScheduler._scheduler.running:
        JobScheduler.start(app)
    
    # Register blueprints
    app.register_blueprint(health_bp)
    app.register_blueprint(api_bp)
    
    # Register shutdown handler
    @app.teardown_appcontext
    def shutdown_scheduler(exception=None):
        """Gracefully stop the scheduler on app shutdown."""
        JobScheduler.stop()
    
    return app


app = create_app()


if __name__ == '__main__':
    host = os.getenv('SERVER_HOST', '0.0.0.0')
    port = int(os.getenv('SERVER_PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(host=host, port=port, debug=debug)