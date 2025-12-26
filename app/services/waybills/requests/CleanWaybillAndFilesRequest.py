from flask_sieve import FormRequest
from datetime import datetime


class CleanWaybillAndFilesRequest(FormRequest):
    """
    Validation request for cleaning waybills and files by date range.
    Validates date format and ensures from_date <= to_date.
    """
    
    def rules(self):
        """
        Define validation rules for incoming request data.
        
        Returns:
            dict: Validation rules
        """
        return {
            'from': ['required', 'string', 'regex:^\d{4}-\d{2}-\d{2}$'],
            'to': ['required', 'string', 'regex:^\d{4}-\d{2}-\d{2}$']
        }
    
    def messages(self):
        """
        Define custom error messages for validation failures.
        
        Returns:
            dict: Custom error messages
        """
        return {
            'from.required': 'from date is required',
            'from.string': 'from must be a string',
            'from.regex': 'from must be in YYYY-MM-DD format',
            'to.required': 'to date is required',
            'to.string': 'to must be a string',
            'to.regex': 'to must be in YYYY-MM-DD format'
        }
    
    def authorize(self):
        """
        Additional validation - can be used to validate business logic.
        
        Returns:
            bool: True if validation passes
        """
        # Validate that dates are parseable and from_date <= to_date
        try:
            from_date = self.validated_data.get('from')
            to_date = self.validated_data.get('to')
            
            from_dt = datetime.strptime(from_date, '%Y-%m-%d')
            to_dt = datetime.strptime(to_date, '%Y-%m-%d')
            
            if from_dt > to_dt:
                self.errors['date_range'] = 'from date must be before or equal to to date'
                return False
            
            return True
        except Exception as e:
            self.errors['date_validation'] = str(e)
            return False

