from flask_sieve import FormRequest


class ChangeStatusRequest(FormRequest):
    """
    Validation request for changing a waybill print status.
    Similar to Laravel's FormRequest.
    """
    
    def rules(self):
        """
        Define validation rules for incoming request data.
        
        Returns:
            dict: Validation rules
        """
        return {
            'status': ['required', 'string', 'in:pending,downloaded,failed']
        }
    
    def messages(self):
        """
        Define custom error messages for validation failures.
        
        Returns:
            dict: Custom error messages
        """
        return {
            'status.required': 'Status is required',
            'status.string': 'Status must be a string',
            'status.in': 'Status must be one of: pending, downloaded, failed'
        }

