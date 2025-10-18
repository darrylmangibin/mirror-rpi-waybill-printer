from datetime import datetime
from models import db
from domains.print_jobs.models import WaybillPrintJob
from domains.print_jobs.enums import PrintJobStatus
from domains.print_jobs.services.file_download_service import FileDownloadService
from utils import utcnow_without_microseconds


class PrintJobService:
    """
    Service layer for print job operations.
    Handles validation and business logic coordination.
    """
    
    def __init__(self):
        self.download_service = FileDownloadService()
    
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
        tenant_id = data.get("tenant_id")
        invoice_number = data.get("invoice_number")
        waybill_url = data.get("waybill_url")
        
        if not tenant_id:
            errors.append("Missing tenant_id")
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
                'tenant_id': tenant_id,
                'invoice_number': invoice_number,
                'waybill_url': waybill_url
            }
        }
    
    def check_duplicate_job(self, tenant_id, invoice_number, waybill_url):
        """
        Check if a print job already exists for the given combination.
        Similar to Laravel's validation check.
        
        Args:
            tenant_id: Tenant identifier
            invoice_number: Invoice identifier
            waybill_url: URL to waybill document
            
        Returns:
            dict: {
                'exists': bool,
                'job': dict with job details if exists, None otherwise
            }
        """
        try:
            existing_job = WaybillPrintJob.query.filter_by(
                tenant_id=tenant_id,
                invoice_number=invoice_number,
                waybill_url=waybill_url
            ).first()
            
            if existing_job:
                return {
                    'exists': True,
                    'job': existing_job.to_dict()
                }
            
            return {
                'exists': False,
                'job': None
            }
        except Exception as e:
            # If there's an error checking, treat as if not exists
            return {
                'exists': False,
                'job': None
            }
    
    def create_print_job(self, app, tenant_id, invoice_number, waybill_url):
        """
        Create a print job and download the waybill file.
        
        Args:
            app: Flask app instance
            tenant_id: Tenant identifier
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
                tenant_id=tenant_id,
                invoice_number=invoice_number,
                waybill_url=waybill_url,
                status=PrintJobStatus.PENDING.value
            )
            
            # Add to session and commit to database
            db.session.add(waybill_print_job)
            db.session.commit()
            
            log_message = f"Created print job - ID: {waybill_print_job.id}, Tenant: {tenant_id}, Invoice: {invoice_number}, PDF URL: {waybill_url}"
            app.logger.info(log_message)
            print(log_message)
            
            # Start download process - update status to in_progress
            return self._download_and_update_job(app, waybill_print_job, waybill_url)
        
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
    
    def _download_and_update_job(self, app, waybill_print_job, waybill_url):
        """
        Download waybill file and update job status.
        
        Args:
            app: Flask app instance
            waybill_print_job: WaybillPrintJob instance
            waybill_url: URL to download from
            
        Returns:
            dict: Updated job details with status and file information
        """
        try:
            # Mark job as in_progress and set download start time
            waybill_print_job.status = PrintJobStatus.IN_PROGRESS.value
            waybill_print_job.download_started_at = utcnow_without_microseconds()
            db.session.commit()
            
            log_message = f"Started download for job ID: {waybill_print_job.id}"
            app.logger.info(log_message)
            print(log_message)
            
            # Download the file
            download_result = self.download_service.download_file(
                waybill_print_job.invoice_number,
                waybill_url
            )
            
            if download_result['success']:
                # Update job with file information
                waybill_print_job.file_path = download_result['file_path']
                waybill_print_job.file_size = download_result['file_size']
                waybill_print_job.download_completed_at = utcnow_without_microseconds()
                # Keep status as in_progress - the actual print job processing will change it later
                db.session.commit()
                
                success_message = f"File downloaded successfully - ID: {waybill_print_job.id}, Size: {download_result['file_size']} bytes"
                app.logger.info(success_message)
                print(success_message)
            else:
                # Mark job as failed with error message
                waybill_print_job.status = PrintJobStatus.FAILED.value
                waybill_print_job.error_message = download_result['error']
                db.session.commit()
                
                error_message = f"Download failed - ID: {waybill_print_job.id}, Error: {download_result['error']}"
                app.logger.error(error_message)
                print(error_message)
            
            # Convert to dict while session is still active
            job_data = waybill_print_job.to_dict()
            
            # Return response
            return {
                "message": "Print job created and processed successfully",
                "data": job_data
            }
        
        except Exception as e:
            # If something goes wrong during download, mark as failed
            try:
                waybill_print_job.status = PrintJobStatus.FAILED.value
                waybill_print_job.error_message = f"Processing error: {str(e)}"
                db.session.commit()
                job_data = waybill_print_job.to_dict()
            except Exception as commit_error:
                app.logger.error(f"Failed to update job status: {str(commit_error)}")
                job_data = waybill_print_job.to_dict()
            
            error_msg = f"Error processing print job: {str(e)}"
            app.logger.error(error_msg)
            print(error_msg)
            
            return {
                "message": error_msg,
                "data": job_data
            }
