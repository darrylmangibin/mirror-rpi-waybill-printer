"""
Unified Print Job Monitor - CRON Job
Monitors printing jobs via background scheduler.
Delegates all logic to PrintJobMonitoringService.
"""

from app.utils.loggers import get_logger
from app.services.waybills.services.PrintJobMonitoringService import PrintJobMonitoringService

logger = get_logger(__name__)

# Configuration
CHECK_INTERVAL = 2  # 2 seconds between checks (via APScheduler)


def monitor_all_printing_jobs(app=None):
    """
    CRON job: Monitor all printing jobs.
    Runs every 2 seconds via APScheduler.
    Delegates to PrintJobMonitoringService.
    """
    if not app:
        logger.error("[CRON] No app context provided")
        return
    
    try:
        # Use app context for database access in background thread
        with app.app_context():
            service = PrintJobMonitoringService()
            result = service.monitor_all_printing_jobs()
            
            if result['errors']:
                for error in result['errors']:
                    logger.error(f"[CRON] {error}")
    
    except Exception as e:
        logger.error(f"[CRON FATAL] {str(e)}", exc_info=True)


def start_print_monitor_cron(scheduler, app):
    """
    Register the print monitor CRON job with APScheduler.
    
    Args:
        scheduler: APScheduler BackgroundScheduler instance
        app: Flask app instance for app context
    """
    try:
        # Add job to run every 2 seconds
        scheduler.add_job(
            func=monitor_all_printing_jobs,
            args=[app],
            trigger="interval",
            seconds=CHECK_INTERVAL,
            id="print_monitor_cron",
            name="Print Job Monitor (CRON)",
            replace_existing=True,
            misfire_grace_time=10
        )
        logger.info(f"✓ Print monitor CRON job registered (interval: {CHECK_INTERVAL}s)")
    except Exception as e:
        logger.error(f"Failed to register print monitor CRON job: {str(e)}", exc_info=True)

