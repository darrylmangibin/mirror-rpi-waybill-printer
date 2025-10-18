from domains.print_jobs.services import WaybillPrintJobTriggerService
from utils import ResponseTrait


class WaybillPrintJobPrintAction(ResponseTrait):
    """
    Invokable action for triggering printing of a specific waybill print job.
    Orchestrates service layer and returns standardized responses.
    """
    
    def __init__(self):
        self.service = WaybillPrintJobTriggerService()
    
    def __call__(self, waybill_print_job_id, app):
        """
        Execute the print action for a specific waybill print job.
        
        Args:
            waybill_print_job_id: The ID of the waybill print job to print
            app: Flask app instance
            
        Returns:
            tuple: (response_dict, status_code)
        """
        # Log request received
        app.logger.info(f"[ACTION] Print action received - Job ID: {waybill_print_job_id}")
        print(f"[ACTION] Print action received - Job ID: {waybill_print_job_id}")
        
        # Call service to handle business logic
        app.logger.info(f"[ACTION] Calling service.trigger_print()")
        result = self.service.trigger_print(waybill_print_job_id, app)
        
        app.logger.info(f"[ACTION] Service returned: success={result['success']}, error={result['error']}")
        print(f"[ACTION] Service returned: success={result['success']}, error={result['error']}")
        
        if result['success']:
            # Success case
            app.logger.info(f"[ACTION] Print succeeded - returning 200")
            return self.success(
                data=result['data'].to_dict(),
                message=f"Print action completed for job {waybill_print_job_id}",
                status_code=200
            )
        
        # Error cases - determine appropriate HTTP status code
        error = result['error']
        app.logger.warning(f"[ACTION] Print failed - error: {error}")
        
        if 'not found' in error.lower():
            app.logger.warning(f"[ACTION] Returning 404 - job not found")
            return self.not_found(message=error)
        elif 'already been completed' in error.lower():
            app.logger.warning(f"[ACTION] Returning 422 - already completed")
            return self.error(message=error, status_code=422)
        elif 'not found or not downloaded' in error.lower():
            app.logger.warning(f"[ACTION] Returning 422 - file not downloaded")
            return self.error(message=error, status_code=422)
        else:
            app.logger.error(f"[ACTION] Returning 500 - server error")
            return self.server_error(message=error)
