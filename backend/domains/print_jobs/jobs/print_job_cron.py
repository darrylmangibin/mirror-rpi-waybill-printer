from datetime import datetime
from models import db
from domains.print_jobs.models import WaybillPrintJob
from domains.print_jobs.services import PrintJobService
from domains.print_jobs.enums import PrintJobStatus
from config.config import Config


class PrintJobCron:
    """
    Cron job for processing ready-to-print jobs.
    
    Runs periodically to:
    1. Query database for jobs with status=in_progress AND download_completed_at IS NOT NULL
    2. Process up to CRON_BATCH_SIZE jobs per cycle
    3. Trigger printing for each job using PrintJobService
    4. Log results for monitoring
    """
    
    def __init__(self):
        """Initialize the cron job."""
        self.service = PrintJobService()
        self.batch_size = Config.get('app.cron_batch_size', 5)
    
    def execute(self, app):
        """
        Execute the cron job.
        
        Queries for jobs ready to print and processes them.
        This method is called periodically by the scheduler.
        
        Args:
            app: Flask app instance for logging and context
            
        Returns:
            dict: {
                'success': bool,
                'jobs_found': int,
                'jobs_processed': int,
                'errors': list of error messages
            }
        """
        app.logger.info("Print job cron starting...")
        
        try:
            # Query for jobs ready to print using optimized indexed columns
            # Only fetch jobs with status='in_progress' and download_completed_at set
            jobs_to_print = self._get_ready_to_print_jobs()
            
            jobs_found = len(jobs_to_print)
            app.logger.info(f"Found {jobs_found} jobs ready to print")
            
            if jobs_found == 0:
                return {
                    'success': True,
                    'jobs_found': 0,
                    'jobs_processed': 0,
                    'errors': []
                }
            
            # Process jobs
            processed = 0
            errors = []
            
            for job_id in jobs_to_print:
                try:
                    # Fetch full job record for processing
                    job = WaybillPrintJob.query.get(job_id)
                    
                    if not job:
                        app.logger.warning(f"Job {job_id} not found during processing")
                        continue
                    
                    # Trigger printing
                    app.logger.info(f"Processing job {job_id} (Invoice: {job.invoice_number})")
                    self.service._trigger_printing(app, job)
                    
                    processed += 1
                    app.logger.info(f"Successfully processed job {job_id}")
                
                except Exception as e:
                    error_msg = f"Error processing job {job_id}: {str(e)}"
                    app.logger.error(error_msg)
                    errors.append(error_msg)
            
            result = {
                'success': True,
                'jobs_found': jobs_found,
                'jobs_processed': processed,
                'errors': errors
            }
            
            app.logger.info(
                f"Print job cron completed - Found: {jobs_found}, "
                f"Processed: {processed}, Errors: {len(errors)}"
            )
            
            return result
        
        except Exception as e:
            error_msg = f"Critical error in print job cron: {str(e)}"
            app.logger.error(error_msg)
            return {
                'success': False,
                'jobs_found': 0,
                'jobs_processed': 0,
                'errors': [error_msg]
            }
    
    def _get_ready_to_print_jobs(self):
        """
        Query database for jobs ready to print.
        
        Optimized query that:
        - Uses indexed columns (status, download_completed_at)
        - Only selects required columns (id)
        - Limits results to CRON_BATCH_SIZE to prevent memory bloat
        - Ordered by created_at (FIFO)
        
        Returns:
            list: List of job IDs ready to print
        """
        try:
            # Query using indexed columns for optimal performance
            jobs = db.session.query(WaybillPrintJob.id).filter(
                WaybillPrintJob.status == PrintJobStatus.IN_PROGRESS.value,
                WaybillPrintJob.download_completed_at.isnot(None)
            ).order_by(
                WaybillPrintJob.created_at.asc()  # FIFO order
            ).limit(self.batch_size).all()
            
            # Extract IDs from query results
            return [job[0] for job in jobs]
        
        except Exception as e:
            # If query fails, return empty list to prevent cron crash
            print(f"Error querying ready-to-print jobs: {str(e)}")
            return []
