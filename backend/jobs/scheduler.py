from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from config.config import Config
import sys


class JobScheduler:
    """
    Generic job scheduler for background tasks.
    
    Supports multiple cron jobs with different intervals.
    Usage:
        JobScheduler.initialize()
        JobScheduler.register_job(cron_instance, job_id, interval_seconds)
        JobScheduler.start(app)
    """
    
    _scheduler = None
    _jobs = {}  # Dictionary to store registered jobs: {job_id: {cron, interval}}
    _app = None
    
    @classmethod
    def initialize(cls):
        """Initialize the scheduler. Should be called once during app startup."""
        if cls._scheduler is not None:
            return  # Already initialized
        
        try:
            cls._scheduler = BackgroundScheduler(daemon=False)
            print("✅ Job Scheduler initialized successfully")
        except Exception as e:
            print(f"❌ Failed to initialize scheduler: {str(e)}")
            raise
    
    @classmethod
    def register_job(cls, cron_instance, job_id, interval_seconds):
        """
        Register a cron job to be scheduled.
        
        Args:
            cron_instance: The cron job instance with execute(app) method
            job_id: Unique identifier for this job (e.g., 'print_job_cron', 'cleanup_cron')
            interval_seconds: How often to run (in seconds)
        """
        cls._jobs[job_id] = {
            'cron': cron_instance,
            'interval': interval_seconds
        }
        print(f"✅ Registered job: {job_id} (interval: {interval_seconds}s)")
    
    @classmethod
    def start(cls, app):
        """Start all registered scheduler jobs."""
        if cls._scheduler is None:
            cls.initialize()
        
        cls._app = app
        
        # Check if scheduler is enabled
        enabled = Config.is_enabled('app.cron_enabled', True)
        
        if not enabled:
            app.logger.info("Job scheduler is disabled via APP_CRON_ENABLED=false")
            print("Job scheduler is disabled via APP_CRON_ENABLED=false")
            return
        
        if len(cls._jobs) == 0:
            app.logger.warning("No jobs registered!")
            print("⚠️ No jobs registered!")
            return
        
        try:
            # Register all jobs with the scheduler (silently, no verbose output)
            for job_id, job_config in cls._jobs.items():
                cron = job_config['cron']
                interval = job_config['interval']
                
                # Wrapper to handle errors
                def create_wrapper(cron_obj, job_name):
                    def wrapper():
                        try:
                            result = cron_obj.execute(app)
                            if not result.get('success', False):
                                app.logger.warning(f"Job {job_name} warning: {result.get('errors', [])}")
                        except Exception as e:
                            app.logger.error(f"❌ Job {job_name} error: {str(e)}")
                            print(f"❌ Job {job_name} error: {str(e)}", file=sys.stderr)
                            import traceback
                            traceback.print_exc()
                    return wrapper
                
                # Add job to scheduler (no log output)
                cls._scheduler.add_job(
                    func=create_wrapper(cron, job_id),
                    trigger=IntervalTrigger(seconds=interval),
                    id=job_id,
                    name=job_id,
                    replace_existing=True,
                    misfire_grace_time=10
                )
            
            # Start the scheduler
            if not cls._scheduler.running:
                cls._scheduler.start()
                print("✅ Scheduler Running...")
                app.logger.info("✅ Scheduler Running...")
            else:
                app.logger.info("ℹ️ Scheduler already running")
        
        except Exception as e:
            error_msg = f"❌ Failed to start job scheduler: {str(e)}"
            app.logger.error(error_msg)
            print(error_msg, file=sys.stderr)
            raise
    
    @classmethod
    def stop(cls):
        """Stop the scheduler gracefully."""
        if cls._scheduler is not None and cls._scheduler.running:
            try:
                cls._scheduler.shutdown(wait=False)
                print("Job Scheduler stopped")
                if cls._app:
                    cls._app.logger.info("Job Scheduler stopped")
            except Exception as e:
                print(f"Error stopping scheduler: {str(e)}", file=sys.stderr)
