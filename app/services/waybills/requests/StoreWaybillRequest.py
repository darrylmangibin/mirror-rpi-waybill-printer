from flask_sieve import FormRequest


class StoreWaybillRequest(FormRequest):
    """
    Validation request for storing a waybill print.
    Similar to Laravel's FormRequest.
    """
    
    def rules(self):
        """
        Define validation rules for incoming request data.
        
        Returns:
            dict: Validation rules
        """
        return {
            'invoice_number': ['required', 'string'],
            'waybill_url': ['nullable', 'string'],
            'marketplace': ['nullable', 'string'],
            'tenant_id': ['required', 'string'],
            'auto_print': ['nullable', 'boolean']  # Optional flag, defaults to true
        }
    
    def messages(self):
        """
        Define custom error messages for validation failures.
        
        Returns:
            dict: Custom error messages
        """
        return {
            'invoice_number.required': 'Invoice number is required',
            'invoice_number.string': 'Invoice number must be a string',
            'waybill_url.string': 'Waybill URL must be a string',
            'marketplace.string': 'Marketplace must be a string',
            'tenant_id.required': 'Tenant ID is required',
            'tenant_id.string': 'Tenant ID must be a string',
            'auto_print.boolean': 'Auto print must be a boolean'  # New error message
        }
