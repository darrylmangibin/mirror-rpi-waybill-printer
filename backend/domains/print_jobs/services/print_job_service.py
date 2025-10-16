from models import db
from domains.print_jobs.models import WaybillPrintJob


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
        Create a print job and save it to the database.
        
        Args:
            app: Flask app instance
            invoice_number: Invoice identifier
            waybill_url: URL to waybill document
            
        Returns:
            dict: Created print job details
            
        Raises:
            Exception: If database insertion fails
        """
        try:
            # Create a new WaybillPrintJob instance
            waybill_print_job = WaybillPrintJob(
                invoice_number=invoice_number,
                waybill_url=waybill_url,
                status='pending'  # New jobs start with pending status
            )
            
            # Add to session and commit to database
            db.session.add(waybill_print_job)
            db.session.commit()
            
            # Log the successful creation
            log_message = f"Created print job - ID: {waybill_print_job.id}, Invoice Number: {invoice_number}, PDF URL: {waybill_url}"
            app.logger.info(log_message)
            print(log_message)  # Also log to console for immediate feedback
            
            # Return success response with complete model data
            return {
                "message": "Print job created successfully",
                "data": waybill_print_job.to_dict()
            }
        except Exception as e:
            # Log the error
            error_message = f"Failed to create print job for invoice {invoice_number}: {str(e)}"
            app.logger.error(error_message)
            print(f"Error: {error_message}")
            
            # Safely rollback the transaction if it's active
            try:
                db.session.rollback()
            except Exception as rollback_error:
                print(f"Rollback error (can be ignored): {rollback_error}")
            
            # Re-raise the exception to be handled by the action
            raise Exception(error_message)
