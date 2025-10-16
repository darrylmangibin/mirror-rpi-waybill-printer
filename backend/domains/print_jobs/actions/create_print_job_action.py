from domains.print_jobs.services import PrintJobService


class CreatePrintJobAction:
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
            return {
                "error": ", ".join(validation['errors'])
            }, 400
        
        # Extract validated data
        validated_data = validation['data']
        
        # Execute business logic
        result = self.service.create_print_job(
            app,
            validated_data['invoice_number'],
            validated_data['waybill_url']
        )
        
        return result, 201
