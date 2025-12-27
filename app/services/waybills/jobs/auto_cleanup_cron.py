"""
Auto Cleanup CRON Job
Automatically cleans up waybills and files older than 6 hours.
Runs on a configurable interval (default: every 30 minutes).
IMPORTANT: Only deletes records OLDER than the threshold - latest data is NEVER touched.
"""

from datetime import datetime, timedelta
from app.utils.loggers import get_logger
from app.database import db
from app.services.waybills.models.WaybillPrint import WaybillPrint
from app.config.environment import CLEANUP_INTERVAL_MINUTES, CLEANUP_HOURS_THRESHOLD
import os

logger = get_logger(__name__)

# Configuration is now loaded from environment variables
HOURS_THRESHOLD = CLEANUP_HOURS_THRESHOLD
def auto_cleanup_old_waybills(app=None):
    """
    Auto-cleanup CRON job: Delete waybills and files older than 6 hours.
    Runs automatically on a schedule via APScheduler.
    
    SAFETY: Only deletes records with created_at < (now - 6 hours)
    Latest records are NEVER touched.
    
    Args:
        app: Flask app instance for app context
    """
    if not app:
        logger.error("[AUTO-CLEANUP] No app context provided")
        return
    
    try:
        with app.app_context():
            # Calculate cutoff time: ONLY delete records older than this
            now = datetime.now()
            cutoff_time = now - timedelta(hours=HOURS_THRESHOLD)
            
            logger.info(f"[AUTO-CLEANUP] Starting cleanup for records older than {HOURS_THRESHOLD} hours")
            logger.info(f"[AUTO-CLEANUP] Current time: {now.strftime('%Y-%m-%d %H:%M:%S')}")
            logger.info(f"[AUTO-CLEANUP] Cutoff time: {cutoff_time.strftime('%Y-%m-%d %H:%M:%S')}")
            logger.info(f"[AUTO-CLEANUP] ⚠️  Records created AFTER cutoff time will NOT be deleted (safety feature)")
            
            BATCH_SIZE = 100
            total_found = 0
            deleted_records = 0
            deleted_files = 0
            errors = []
            
            # Process in batches to handle large datasets efficiently
            offset = 0
            while True:
                # Fetch batch of old waybills (ONLY those created before cutoff_time)
                batch = db.session.query(WaybillPrint).filter(
                    WaybillPrint.created_at < cutoff_time
                ).offset(offset).limit(BATCH_SIZE).all()
                
                if not batch:
                    break  # No more old records
                
                total_found += len(batch)
                
                # Delete each waybill and its associated file
                for waybill in batch:
                    try:
                        # Log what we're deleting (for safety/audit trail)
                        created_at_str = waybill.created_at.strftime('%Y-%m-%d %H:%M:%S') if waybill.created_at else 'unknown'
                        age_hours = (now - waybill.created_at).total_seconds() / 3600 if waybill.created_at else 0
                        
                        logger.debug(f"[AUTO-CLEANUP] Deleting waybill ID: {waybill.id}, Invoice: {waybill.invoice_number}, Created: {created_at_str} ({age_hours:.1f} hours old)")
                        
                        # Delete local file if it exists and path is not null
                        if waybill.local_file_path:
                            try:
                                if os.path.exists(waybill.local_file_path):
                                    os.remove(waybill.local_file_path)
                                    deleted_files += 1
                                    logger.debug(f"[AUTO-CLEANUP] File deleted: {waybill.local_file_path}")
                            except Exception as e:
                                error_msg = f"Failed to delete file for waybill {waybill.id}: {str(e)}"
                                errors.append(error_msg)
                                logger.warning(f"[AUTO-CLEANUP] {error_msg}")
                        
                        # Delete database record
                        db.session.delete(waybill)
                        deleted_records += 1
                        
                    except Exception as e:
                        error_msg = f"Error cleaning waybill {waybill.id}: {str(e)}"
                        errors.append(error_msg)
                        logger.error(f"[AUTO-CLEANUP] {error_msg}")
                
                # Commit batch deletions
                db.session.commit()
                offset += BATCH_SIZE
            
            # Log results
            if deleted_records > 0 or deleted_files > 0:
                logger.info(f"[AUTO-CLEANUP] ✓ CLEANUP COMPLETED")
                logger.info(f"[AUTO-CLEANUP]   Records deleted: {deleted_records}")
                logger.info(f"[AUTO-CLEANUP]   Files deleted: {deleted_files}")
                logger.info(f"[AUTO-CLEANUP]   Total found: {total_found}")
                if errors:
                    logger.warning(f"[AUTO-CLEANUP] Errors encountered ({len(errors)}): {errors}")
            else:
                logger.info(f"[AUTO-CLEANUP] ✓ Cleanup completed - No old records found to delete")
                logger.info(f"[AUTO-CLEANUP] All waybills are newer than {HOURS_THRESHOLD} hours (data is safe)")
    
    except Exception as e:
        logger.error(f"[AUTO-CLEANUP FATAL] {str(e)}", exc_info=True)


def start_auto_cleanup_cron(scheduler, app):
    """
    Register the auto-cleanup CRON job with APScheduler.
    
    Args:
        scheduler: APScheduler BackgroundScheduler instance
        app: Flask app instance for app context
    """
    try:
        # Add job to run every CLEANUP_INTERVAL_MINUTES
        scheduler.add_job(
            func=auto_cleanup_old_waybills,
            args=[app],
            trigger="interval",
            minutes=CLEANUP_INTERVAL_MINUTES,
            id="auto_cleanup_cron",
            name=f"Auto Cleanup CRON (older than {HOURS_THRESHOLD} hours)",
            replace_existing=True,
            misfire_grace_time=10
        )
        logger.info(f"✓ Auto-cleanup CRON job registered")
        logger.info(f"  Interval: Every {CLEANUP_INTERVAL_MINUTES} minutes")
        logger.info(f"  Cleanup threshold: Records older than {HOURS_THRESHOLD} hours")
        logger.info(f"  Safety: Recent data (< {HOURS_THRESHOLD} hours old) will NEVER be deleted")
    except Exception as e:
        logger.error(f"Failed to register auto-cleanup CRON job: {str(e)}", exc_info=True)

