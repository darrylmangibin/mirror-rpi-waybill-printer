from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from domains.print_jobs.jobs.print_job_cron import PrintJobCron
from config.config import Config


class PrintJobScheduler:
    """
    Scheduler for background print job processing.
    
    Uses APScheduler to run the print job cron at regular intervals.
    Runs in a background thread without blocking Flask requests.
    """
    
    _scheduler = None
    _cron = None
    
    @classmethod
    def initialize(cls):
        """
        Initialize the scheduler.
        Should be called once during app startup.
        """
        if cls._scheduler is not None:
            return  # Already initialized
        
        cls._scheduler = BackgroundScheduler(daemon=True)
        cls._cron = PrintJobCron()
    
    @classmethod
    def start(cls, app):
        """
        Start the scheduler with the print job cron job.
        
        Args:
            app: Flask app instance for logging and context
        """
        if cls._scheduler is None:
            cls.initialize()
        
        # Get configuration
        enabled = Config.is_enabled('app.cron_enabled', True)
        interval = Config.get('app.cron_print_interval', 60)
        
        app.logger.info(f"Print job scheduler starting...")
        app.logger.info(f"  - Enabled: {enabled}")
        app.logger.info(f"  - Interval: {interval} seconds")
        
        if not enabled:
            app.logger.info("Print job cron is disabled via CRON_ENABLED=false")
            return
        
        try:
            # Add job to scheduler
            cls._scheduler.add_job(
                func=cls._cron.execute,
                args=[app],
                trigger=IntervalTrigger(seconds=interval),
                id='print_job_cron',
                name='Print Job Cron',
                replace_existing=True,
                misfire_grace_time=10  # Allow 10s grace time if job is delayed
            )
            
            # Start the scheduler
            cls._scheduler.start()
            app.logger.info("✅ Print job scheduler started successfully")
        
        except Exception as e:
            app.logger.error(f"❌ Failed to start print job scheduler: {str(e)}")
            raise
    
    @classmethod
    def stop(cls):
        """
        Stop the scheduler gracefully.
        Should be called on app shutdown.
        """
        if cls._scheduler is not None and cls._scheduler.running:
            try:
                cls._scheduler.shutdown(wait=False)
                print("Print job scheduler stopped")
            except Exception as e:
                print(f"Error stopping scheduler: {str(e)}")
