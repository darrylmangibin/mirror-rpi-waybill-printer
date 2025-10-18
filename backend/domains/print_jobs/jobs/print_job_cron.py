import time


class PrintJobCron:
    """
    Print job cron - handles printing of waybills.
    Queries for jobs ready to print and triggers printing.
    """
    
    def __init__(self):
        self.execution_count = 0
    
    def execute(self, app):
        """
        Execute the print job cron.
        
        Args:
            app: Flask app instance
            
        Returns:
            dict: Execution status
        """
        self.execution_count += 1
        
        try:
            with app.app_context():
                try:
                    from models import db
                    from domains.print_jobs.models import WaybillPrintJob
                    from domains.print_jobs.enums import PrintJobStatus
                    
                    # Query for jobs ready to print
                    jobs = db.session.query(WaybillPrintJob).filter(
                        WaybillPrintJob.status == PrintJobStatus.IN_PROGRESS.value,
                        WaybillPrintJob.download_completed_at.isnot(None)
                    ).limit(5).all()
                    
                    jobs_found = len(jobs)
                    
                    if jobs_found > 0:
                        print(f"[PRINT CRON #{self.execution_count}] Found {jobs_found} jobs")
                    
                    return {
                        'success': True,
                        'execution': self.execution_count,
                        'jobs_found': jobs_found
                    }
                
                except Exception as inner_e:
                    print(f"[PRINT CRON ERROR] Inner error: {str(inner_e)}")
                    import traceback
                    traceback.print_exc()
                    return {
                        'success': False,
                        'error': str(inner_e)
                    }
        
        except Exception as outer_e:
            print(f"[PRINT CRON ERROR] Outer error: {str(outer_e)}")
            import traceback
            traceback.print_exc()
            return {
                'success': False,
                'error': str(outer_e)
            }
