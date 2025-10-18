from domains.print_jobs.models import WaybillPrintJob
from domains.print_jobs.enums import PrintJobStatus


class WaybillPrintJobTriggerService:
    """
    Service for triggering print actions on waybill print jobs.
    Handles validation and logging without executing actual printing.
    """
    
    def trigger_print(self, waybill_print_job_id, app):
        """
        Trigger a print action for a specific waybill print job.
        Validates the job state and logs the action.
        
        Args:
            waybill_print_job_id: The ID of the waybill print job
            app: Flask app instance for logging
            
        Returns:
            dict: {
                'success': bool,
                'error': str or None,
                'data': WaybillPrintJob instance or None
            }
        """
        try:
            # Find the print job
            print_job = WaybillPrintJob.query.filter_by(id=waybill_print_job_id).first()
            
            # Validate job exists
            if not print_job:
                return {
                    'success': False,
                    'error': f'Print job with ID {waybill_print_job_id} not found',
                    'data': None
                }
            
            # Validate file has been downloaded
            if not print_job.file_path or not print_job.download_completed_at:
                return {
                    'success': False,
                    'error': 'Cannot print: File has not been downloaded yet',
                    'data': print_job
                }
            
            # Validate job is not already completed
            if print_job.status == PrintJobStatus.COMPLETED.value:
                return {
                    'success': False,
                    'error': 'This print job has already been completed',
                    'data': print_job
                }
            
            # Log the print action
            log_message = (
                f"Print action triggered - Job ID: {print_job.id}, "
                f"Tenant: {print_job.tenant_id}, "
                f"Invoice: {print_job.invoice_number}, "
                f"File: {print_job.file_path}"
            )
            app.logger.info(log_message)
            print(log_message)
            
            return {
                'success': True,
                'error': None,
                'data': print_job
            }
        
        except Exception as e:
            error_message = f"Error triggering print for job {waybill_print_job_id}: {str(e)}"
            app.logger.error(error_message)
            return {
                'success': False,
                'error': error_message,
                'data': None
            }
