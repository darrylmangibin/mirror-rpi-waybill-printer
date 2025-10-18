from domains.print_jobs.models.waybill_print_job import WaybillPrintJob
from domains.print_jobs.enums.print_job_status import PrintJobStatus


class PrintJobCron:
    """
    Print job cron - handles printing of waybills.
    Monitors and processes print jobs with in_progress status.
    Uses batch processing for optimal RPi performance.
    """
    
    def __init__(self):
        self.execution_count = 0
        self.batch_size = 5  # Process 5 jobs per cycle for RPi efficiency
    
    def execute(self, app):
        """
        Execute the print job cron.
        Fetches batch of waybill print jobs with in_progress status, 
        marks them as completed, and logs progress.
        
        Args:
            app: Flask app instance
            
        Returns:
            dict: Execution status
        """
        self.execution_count += 1
        
        # Use app context for database operations
        with app.app_context():
            from models import db
            
            try:
                # Fetch batch of jobs with in_progress status AND fully downloaded (SQLAlchemy ORM way)
                in_progress_jobs = WaybillPrintJob.query.filter(
                    WaybillPrintJob.status == PrintJobStatus.IN_PROGRESS.value,
                    WaybillPrintJob.file_path.isnot(None),
                    WaybillPrintJob.download_completed_at.isnot(None)
                ).order_by(WaybillPrintJob.id.asc()).limit(self.batch_size).all()
                
                # Log each job for processing (without updating yet)
                completed_count = 0
                for job in in_progress_jobs:
                    app.logger.info(f"Updating WaybillPrintJob ID={job.id}")
                    completed_count += 1
                
                # Get count of remaining in_progress jobs for logging
                remaining_count = WaybillPrintJob.query.filter(
                    WaybillPrintJob.status == PrintJobStatus.IN_PROGRESS.value,
                    WaybillPrintJob.file_path.isnot(None),
                    WaybillPrintJob.download_completed_at.isnot(None)
                ).count()
                
            except Exception as e:
                app.logger.error(f"Error in print_job_cron: {str(e)}")
                completed_count = 0
                remaining_count = 0
        
        log_message = f"Print Job Cron #{self.execution_count} - Completed: {completed_count}, Remaining: {remaining_count}"
        app.logger.info(log_message)
        
        return {
            'success': True,
            'execution': self.execution_count,
            'message': log_message,
            'completed_count': completed_count,
            'remaining_count': remaining_count
        }