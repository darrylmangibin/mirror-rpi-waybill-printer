from models import db
from domains.print_jobs.models import WaybillPrintJob
from domains.print_jobs.enums import PrintJobStatus
from domains.print_jobs.services.printer_service import PrinterServiceFactory
from utils import utcnow_without_microseconds


class WaybillPrintJobTriggerService:
    """
    Service for triggering print actions on waybill print jobs.
    Validates job state, executes printing, and updates job status.
    """
    
    def trigger_print(self, waybill_print_job_id, app):
        """
        Trigger a print action for a specific waybill print job.
        Validates the job state, prints the file, and updates job status.
        
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
            
            # Mark print as started
            print_job.print_started_at = utcnow_without_microseconds()
            db.session.commit()
            
            log_message = (
                f"Print action triggered - Job ID: {print_job.id}, "
                f"Tenant: {print_job.tenant_id}, "
                f"Invoice: {print_job.invoice_number}, "
                f"File: {print_job.file_path}"
            )
            app.logger.info(log_message)
            print(log_message)
            
            # Get printer service and execute print
            printer_service = PrinterServiceFactory.create(app)
            print_result = printer_service.print_file(print_job.file_path)
            
            # Update job with print result
            print_job.print_completed_at = utcnow_without_microseconds()
            
            if print_result['success']:
                # Success case
                print_job.status = PrintJobStatus.COMPLETED.value
                print_job.print_status = 'completed'
                success_message = (
                    f"Print job completed - ID: {print_job.id}, "
                    f"Message: {print_result['message']}"
                )
                app.logger.info(success_message)
                print(success_message)
            else:
                # Failure case
                print_job.status = PrintJobStatus.FAILED.value
                print_job.print_status = 'failed'
                print_job.error_message = print_result['error']
                error_message = (
                    f"Print job failed - ID: {print_job.id}, "
                    f"Error: {print_result['error']}"
                )
                app.logger.error(error_message)
                print(error_message)
            
            db.session.commit()
            
            return {
                'success': print_result['success'],
                'error': print_result.get('error'),
                'data': print_job
            }
        
        except Exception as e:
            # If printing fails, mark job as failed
            try:
                print_job = WaybillPrintJob.query.filter_by(id=waybill_print_job_id).first()
                if print_job:
                    print_job.status = PrintJobStatus.FAILED.value
                    print_job.print_status = 'error'
                    print_job.print_completed_at = utcnow_without_microseconds()
                    print_job.error_message = f"Print error: {str(e)}"
                    db.session.commit()
            except Exception as commit_error:
                app.logger.error(f"Failed to update print job status: {str(commit_error)}")
            
            error_message = f"Error triggering print for job {waybill_print_job_id}: {str(e)}"
            app.logger.error(error_message)
            return {
                'success': False,
                'error': error_message,
                'data': None
            }
