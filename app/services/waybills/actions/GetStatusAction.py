from app.utils.loggers import get_logger
from app.services.waybills.models.WaybillPrint import WaybillPrint
from datetime import datetime

logger = get_logger(__name__)


class GetStatusAction:
    """
    Single-action controller for retrieving waybill print status.
    Similar to Laravel's Invokable Action Controllers.
    
    Provides comprehensive status information including download/print statuses,
    error messages, timestamps, elapsed times, and stuck job detection.
    """
    
    def __call__(self, waybill_print: WaybillPrint) -> dict:
        """
        Get comprehensive status information for a waybill print job.
        
        Args:
            waybill_print (WaybillPrint): The waybill print record to check
        
        Returns:
            dict: Response with status, message, and detailed data
        """
        try:
            now = datetime.now()
            
            # Calculate elapsed times and detect stuck jobs
            download_elapsed_seconds = None
            print_elapsed_seconds = None
            is_download_stuck = False
            is_print_stuck = False
            
            # Download elapsed time calculation and stuck detection
            if waybill_print.status == "downloading":
                # Calculate elapsed time from updated_at (when status changed to downloading)
                if waybill_print.updated_at:
                    elapsed = (now - waybill_print.updated_at).total_seconds()
                    download_elapsed_seconds = int(elapsed)
                    # Stuck if updated_at is older than 60 seconds
                    is_download_stuck = download_elapsed_seconds > 60
                elif waybill_print.created_at:
                    # Fallback to created_at if updated_at is not available
                    elapsed = (now - waybill_print.created_at).total_seconds()
                    download_elapsed_seconds = int(elapsed)
                    is_download_stuck = download_elapsed_seconds > 60
            elif waybill_print.downloaded_at:
                # Calculate total download time (completed)
                download_start = waybill_print.created_at
                if download_start:
                    elapsed = (waybill_print.downloaded_at - download_start).total_seconds()
                    download_elapsed_seconds = int(elapsed)
            
            # Print elapsed time calculation and stuck detection
            if waybill_print.print_status == "printing":
                # Calculate elapsed time from updated_at (when status changed to printing)
                if waybill_print.updated_at:
                    elapsed = (now - waybill_print.updated_at).total_seconds()
                    print_elapsed_seconds = int(elapsed)
                    # Stuck if updated_at is older than 600 seconds (10 minutes)
                    is_print_stuck = print_elapsed_seconds > 600
                elif waybill_print.created_at:
                    # Fallback to created_at if updated_at is not available
                    elapsed = (now - waybill_print.created_at).total_seconds()
                    print_elapsed_seconds = int(elapsed)
                    is_print_stuck = print_elapsed_seconds > 600
            elif waybill_print.print_completed_at:
                # Calculate total print time (completed)
                print_start = waybill_print.downloaded_at if waybill_print.downloaded_at else waybill_print.created_at
                if print_start:
                    elapsed = (waybill_print.print_completed_at - print_start).total_seconds()
                    print_elapsed_seconds = int(elapsed)
            
            # Build response data
            data = {
                "id": waybill_print.id,
                "invoice_number": waybill_print.invoice_number,
                "marketplace": waybill_print.marketplace,
                "download_status": waybill_print.status,
                "download_error": waybill_print.error_message,
                "downloaded_at": waybill_print.downloaded_at.strftime('%Y-%m-%d %H:%M:%S') if waybill_print.downloaded_at else None,
                "local_file_path": waybill_print.local_file_path,
                "print_status": waybill_print.print_status,
                "print_error": waybill_print.print_error,
                "print_completed_at": waybill_print.print_completed_at.strftime('%Y-%m-%d %H:%M:%S') if waybill_print.print_completed_at else None,
                "cups_job_id": waybill_print.cups_job_id,
                "printer_name": waybill_print.printer_name,
                "created_at": waybill_print.created_at.strftime('%Y-%m-%d %H:%M:%S') if waybill_print.created_at else None,
                "updated_at": waybill_print.updated_at.strftime('%Y-%m-%d %H:%M:%S') if waybill_print.updated_at else None,
                "is_download_stuck": is_download_stuck,
                "is_print_stuck": is_print_stuck,
                "download_elapsed_seconds": download_elapsed_seconds,
                "print_elapsed_seconds": print_elapsed_seconds,
            }
            
            return {
                "status": "success",
                "message": "Status retrieved successfully",
                "data": data
            }
        
        except Exception as e:
            logger.error(f"Error in GetStatusAction: {str(e)}", exc_info=True)
            return {
                "status": "error",
                "message": str(e),
                "data": {
                    "waybill_id": waybill_print.id,
                    "invoice_number": waybill_print.invoice_number
                }
            }

