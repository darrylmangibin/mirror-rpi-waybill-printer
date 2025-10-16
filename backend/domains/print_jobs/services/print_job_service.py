from handlers import handle_print_job


class PrintJobService:
    """
    Service layer for print job operations.
    Handles validation and business logic coordination.
    """
    
    def validate_create_request(self, data):
        """
        Validate print job creation request data.
        
        Args:
            data: Request JSON data
            
        Returns:
            dict: {
                'valid': bool,
                'errors': list of error messages,
                'data': validated data or None
            }
        """
        errors = []
        
        # Validate JSON data exists
        if not data:
            errors.append("Invalid JSON")
            return {'valid': False, 'errors': errors, 'data': None}
        
        # Validate required fields
        invoice_number = data.get("invoice_number")
        waybill_url = data.get("waybill_url")
        
        if not invoice_number:
            errors.append("Missing invoice_number")
        if not waybill_url:
            errors.append("Missing waybill_url")
        
        if errors:
            return {'valid': False, 'errors': errors, 'data': None}
        
        return {
            'valid': True,
            'errors': [],
            'data': {
                'invoice_number': invoice_number,
                'waybill_url': waybill_url
            }
        }
    
    def create_print_job(self, app, invoice_number, waybill_url):
        """
        Create a print job.
        
        Args:
            app: Flask app instance
            invoice_number: Invoice identifier
            waybill_url: URL to waybill document
            
        Returns:
            dict: Result from handler
        """
        return handle_print_job(app, invoice_number, waybill_url)
