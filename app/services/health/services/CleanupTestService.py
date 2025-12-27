from app.utils.loggers import get_logger
from app.database import db
from app.services.waybills.models.WaybillPrint import WaybillPrint
from app.services.waybills.jobs.auto_cleanup_cron import auto_cleanup_old_waybills
from datetime import datetime, timedelta
from app.config.environment import CLEANUP_HOURS_THRESHOLD

logger = get_logger(__name__)


class CleanupTestService:
    """Service for testing auto-cleanup CRON job functionality."""
    
    @staticmethod
    def create_test_waybills(count: int = 10) -> dict:
        """
        Create test waybill records with 1-hour time spacing.
        
        Args:
            count: Number of test waybills to create (default: 10)
            
        Returns:
            dict: Created waybills with metadata
        """
        try:
            now = datetime.now()
            test_waybills = []
            
            logger.info(f"[TEST CLEANUP] Creating {count} test waybills for cleanup testing...")
            
            for i in range(count):
                created_at = now - timedelta(hours=i)
                waybill = WaybillPrint(
                    tenant_id=1,
                    invoice_number=f"TEST-CLEANUP-{i+1:03d}",
                    marketplace="test",
                    status="downloaded",
                    local_file_path=f"/tmp/test_cleanup_{i}.pdf",
                    created_at=created_at,
                    updated_at=created_at,
                    print_status="idle"
                )
                db.session.add(waybill)
                
                will_delete = i > CLEANUP_HOURS_THRESHOLD
                test_waybills.append({
                    'invoice_number': waybill.invoice_number,
                    'created_at': created_at.strftime('%Y-%m-%d %H:%M:%S'),
                    'age_hours': i,
                    'will_be_deleted': will_delete
                })
            
            db.session.commit()
            
            logger.info(f"[TEST CLEANUP] Created {len(test_waybills)} test waybills")
            return {
                'success': True,
                'created_count': len(test_waybills),
                'waybills': test_waybills
            }
        
        except Exception as e:
            logger.error(f"[TEST CLEANUP] Error creating test waybills: {str(e)}", exc_info=True)
            db.session.rollback()
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def trigger_cleanup(app) -> dict:
        """
        Manually trigger the auto-cleanup CRON job.
        
        Args:
            app: Flask app instance
            
        Returns:
            dict: Cleanup results with before/after counts
        """
        try:
            logger.info("[TEST CLEANUP] Manually triggering cleanup CRON job...")
            
            # Get count before cleanup
            count_before = db.session.query(WaybillPrint).count()
            
            # Run cleanup
            auto_cleanup_old_waybills(app)
            
            # Get count after cleanup
            count_after = db.session.query(WaybillPrint).count()
            
            deleted_count = count_before - count_after
            
            logger.info(f"[TEST CLEANUP] Cleanup completed - Deleted {deleted_count} records")
            
            return {
                'success': True,
                'records_before': count_before,
                'records_after': count_after,
                'records_deleted': deleted_count,
                'threshold_hours': CLEANUP_HOURS_THRESHOLD
            }
        
        except Exception as e:
            logger.error(f"[TEST CLEANUP] Error triggering cleanup: {str(e)}", exc_info=True)
            return {
                'success': False,
                'error': str(e)
            }

