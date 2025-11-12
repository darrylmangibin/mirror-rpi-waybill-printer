from flask_sieve import FormRequest
from app.services.waybills.enums.WaybillPrintStatuses import WaybillPrintStatuses


class ChangeStatusRequest(FormRequest):
    """
    Validation request for changing a waybill print status.
    Similar to Laravel's FormRequest.
    Validates status values against WaybillPrintStatuses enum.
    """
    
    def rules(self):
        """
        Define validation rules for incoming request data.
        
        Returns:
            dict: Validation rules
        """
        # Get valid status values from enum
        valid_statuses = ','.join([status.value for status in WaybillPrintStatuses])
        
        return {
            'status': ['required', 'string', f'in:{valid_statuses}']
        }
    
    def messages(self):
        """
        Define custom error messages for validation failures.
        
        Returns:
            dict: Custom error messages
        """
        valid_statuses = ', '.join([status.value for status in WaybillPrintStatuses])
        
        return {
            'status.required': 'Status is required',
            'status.string': 'Status must be a string',
            'status.in': f'Status must be one of: {valid_statuses}'
        }

