from domains.print_jobs.services import PrintJobService
from domains.print_jobs.enums import PrintJobStatus
from utils import ResponseTrait


class CreatePrintJobAction(ResponseTrait):
    """
    Invokable action for creating print jobs.
    Orchestrates the service layer and coordinates the business logic.
    Similar to Laravel invokable controllers.
    """
    
    def __init__(self):
        self.service = PrintJobService()
    
    def __call__(self, request_data, app):
        """
        Execute the create print job action.
        
        Args:
            request_data: JSON data from request
            app: Flask app instance
            
        Returns:
            tuple: (response_dict, status_code)
        """
        # Validate request data using service
        validation = self.service.validate_create_request(request_data)
        
        if not validation['valid']:
            return self.validation_error(
                errors=validation['errors'],
                message="Validation failed"
            )
        
        # Extract validated data
        validated_data = validation['data']
        
        # Check for duplicate print job (like Laravel validation)
        duplicate_check = self.service.check_duplicate_job(
            validated_data['tenant_id'],
            validated_data['invoice_number'],
            validated_data['waybill_url']
        )
        
        if duplicate_check['exists']:
            return self.conflict(
                data=duplicate_check['job'],
                message="Duplicate print job already exists for this tenant, invoice, and URL"
            )
        
        # Execute business logic
        try:
            result = self.service.create_print_job(
                app,
                validated_data['tenant_id'],
                validated_data['invoice_number'],
                validated_data['waybill_url']
            )
            return self.created(
                data=result['data'],
                message=result['message']
            )
        except Exception as e:
            # Return error response if database operation fails
            return self.server_error(
                message=str(e)
            )
