from domains.print_jobs.models import WaybillPrintJob
from domains.print_jobs.enums import PrintJobStatus
from utils import ResponseTrait


class WaybillPrintJobPrintAction(ResponseTrait):
    """
    Invokable action for triggering printing of a specific waybill print job.
    Logs the print action request without executing actual printing.
    """
    
    def __call__(self, waybill_print_job_id, app):
        """
        Execute the print action for a specific waybill print job.
        Logs the action without triggering actual printing.
        
        Args:
            waybill_print_job_id: The ID of the waybill print job to print
            app: Flask app instance
            
        Returns:
            tuple: (response_dict, status_code)
        """
        try:
            # Find the print job
            print_job = WaybillPrintJob.query.filter_by(id=waybill_print_job_id).first()
            
            if not print_job:
                return self.not_found(
                    message=f"Print job with ID {waybill_print_job_id} not found"
                )
            
            # Validate that the job has a downloaded file
            if not print_job.file_path or not print_job.download_completed_at:
                return self.error(
                    message="Cannot print: File has not been downloaded yet",
                    status_code=422
                )
            
            # Validate that the job is in a state that can be printed
            if print_job.status == PrintJobStatus.COMPLETED.value:
                return self.error(
                    message="This print job has already been completed",
                    status_code=422
                )
            
            # Log the print action
            log_message = (
                f"Print action triggered - Job ID: {print_job.id}, "
                f"Tenant: {print_job.tenant_id}, "
                f"Invoice: {print_job.invoice_number}, "
                f"File: {print_job.file_path}"
            )
            app.logger.info(log_message)
            print(log_message)
            
            # Return the job details
            return self.success(
                data=print_job.to_dict(),
                message=f"Print action logged for job {print_job.id}",
                status_code=200
            )
        
        except Exception as e:
            error_message = f"Error in print action for job {waybill_print_job_id}: {str(e)}"
            app.logger.error(error_message)
            return self.server_error(message=error_message)
