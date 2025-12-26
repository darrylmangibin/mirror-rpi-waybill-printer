from app.utils.loggers import get_logger
from datetime import datetime
from app.database import db
from app.services.waybills.models.WaybillPrint import WaybillPrint
import os

logger = get_logger(__name__)


class CleanWaybillAndFilesAction:
    """
    Single-action controller for cleaning waybills and their associated files.
    Similar to Laravel's Invokable Action Controllers.
    
    Deletes waybills within a date range and removes their associated local files.
    """
    
    def __init__(self):
        """Initialize the action."""
        pass
    
    def __call__(self, from_: str, to: str) -> dict:
        """
        Clean waybills and files within a date range.
        
        Args:
            from_ (str): Start date in 'YYYY-MM-DD' format
            to (str): End date in 'YYYY-MM-DD' format
        
        Returns:
            dict: Response with status, message, and data about cleaned items
        """
        try:
            logger.info(f"Hey I am cleaning. Cleaning waybills from {from_} to {to}")
            
            # Parse dates
            from_datetime = datetime.strptime(from_, '%Y-%m-%d')
            to_datetime = datetime.strptime(to, '%Y-%m-%d')
            
            # Query waybills within date range
            waybills_to_clean = WaybillPrint.query.filter(
                WaybillPrint.created_at >= from_datetime,
                WaybillPrint.created_at <= to_datetime.replace(hour=23, minute=59, second=59)
            ).all()
            
            cleaned_count = 0
            files_deleted = 0
            errors = []
            
            logger.info(f"Found {len(waybills_to_clean)} waybills to clean between {from_} and {to}")
            
            # Clean up files and delete waybills
            for waybill in waybills_to_clean:
                try:
                    # Delete associated file if it exists
                    if waybill.local_file_path and os.path.exists(waybill.local_file_path):
                        try:
                            os.remove(waybill.local_file_path)
                            files_deleted += 1
                            logger.info(f"Deleted file for waybill {waybill.id}: {waybill.local_file_path}")
                        except Exception as e:
                            error_msg = f"Failed to delete file for waybill {waybill.id}: {str(e)}"
                            logger.warning(error_msg)
                            errors.append(error_msg)
                    
                    # Delete waybill record
                    db.session.delete(waybill)
                    cleaned_count += 1
                    logger.info(f"Deleted waybill record {waybill.id}")
                    
                except Exception as e:
                    error_msg = f"Error cleaning waybill {waybill.id}: {str(e)}"
                    logger.error(error_msg)
                    errors.append(error_msg)
            
            # Commit all deletions
            db.session.commit()
            
            return {
                "status": "success",
                "message": f"Successfully cleaned {cleaned_count} waybills and deleted {files_deleted} files",
                "data": {
                    "from": from_,
                    "to": to,
                    "waybills_deleted": cleaned_count,
                    "files_deleted": files_deleted,
                    "errors": errors if errors else None
                }
            }
        
        except ValueError as e:
            logger.warning(f"Validation error in CleanWaybillAndFilesAction: {str(e)}")
            return {
                "status": "error",
                "message": f"Invalid date format: {str(e)}",
                "data": {
                    "from": from_,
                    "to": to
                }
            }
        except Exception as e:
            logger.error(f"Error in CleanWaybillAndFilesAction: {str(e)}", exc_info=True)
            db.session.rollback()
            return {
                "status": "error",
                "message": str(e),
                "data": {
                    "from": from_,
                    "to": to
                }
            }

