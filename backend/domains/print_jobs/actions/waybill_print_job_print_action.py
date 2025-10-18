from domains.print_jobs.services import WaybillPrintJobTriggerService
from utils import ResponseTrait


class WaybillPrintJobPrintAction(ResponseTrait):
    """
    Invokable action for triggering printing of a specific waybill print job.
    Orchestrates service layer and returns standardized responses.
    Similar to Laravel invokable controllers.
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
        # Call service to handle business logic
        result = self.service.trigger_print(waybill_print_job_id, app)
        
        if result['success']:
            # Success case
            return self.success(
                data=result['data'].to_dict(),
                message=f"Print action logged for job {waybill_print_job_id}",
                status_code=200
            )
        
        # Error cases - determine appropriate HTTP status code
        error = result['error']
        
        if 'not found' in error.lower():
            return self.not_found(message=error)
        elif 'already been completed' in error.lower():
            return self.error(message=error, status_code=422)
        elif 'not been downloaded' in error.lower():
            return self.error(message=error, status_code=422)
        else:
            return self.server_error(message=error)
