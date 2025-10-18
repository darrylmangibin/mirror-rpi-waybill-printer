from domains.print_jobs.models.waybill_print_job import WaybillPrintJob
from domains.print_jobs.enums.print_job_status import PrintJobStatus


class PrintJobCron:
    """
    Print job cron - handles printing of waybills.
    Monitors and processes print jobs with in_progress status.
    """
    
    def __init__(self):
        self.execution_count = 0
    
    def execute(self, app):
        """
        Execute the print job cron.
        Fetches waybill print jobs with in_progress status, marks the first one as completed,
        and logs the remaining in_progress jobs.
        
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
                # Get all jobs with in_progress status using raw SQL
                in_progress_jobs_result = db.session.execute(
                    db.text("SELECT id FROM waybill_print_jobs WHERE status = 'in_progress' ORDER BY id ASC")
                ).fetchall()
                
                in_progress_job_ids = [row[0] for row in in_progress_jobs_result]
                
                # If there are jobs, mark the first one as completed
                if in_progress_job_ids:
                    first_job_id = in_progress_job_ids[0]
                    db.session.execute(
                        db.text("UPDATE waybill_print_jobs SET status = 'completed' WHERE id = :id"),
                        {"id": first_job_id}
                    )
                    db.session.commit()
                    
                    # Remove first job from the list (it's now completed)
                    remaining_job_ids = in_progress_job_ids[1:]
                else:
                    remaining_job_ids = []
                
            except Exception as e:
                app.logger.error(f"Error in print_job_cron: {str(e)}")
                remaining_job_ids = []
        
        log_message = f"Print Job Cron #{self.execution_count} - In Progress Jobs: {remaining_job_ids}"
        app.logger.info(log_message)
        
        return {
            'success': True,
            'execution': self.execution_count,
            'message': log_message,
            'in_progress_job_ids': remaining_job_ids,
            'total_in_progress': len(remaining_job_ids)
        }