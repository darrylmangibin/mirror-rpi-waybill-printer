from app.utils.loggers import get_logger
from app.services.waybills.services.WaybillPrintService import WaybillPrintService

logger = get_logger(__name__)


class CleanWaybillAndFilesAction:
    """
    Single-action controller for cleaning waybills and their associated files.
    Similar to Laravel's Invokable Action Controllers.
    
    Thin orchestrator that validates input and delegates to service.
    All business logic and database updates handled by the service.
    """
    
    def __init__(self):
        """Initialize the action with the WaybillPrintService."""
        self.service = WaybillPrintService()
    
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
            logger.info(f"CleanWaybillAndFilesAction executing - From: {from_}, To: {to}")
            
            # Delegate to service - handles cleanup and error handling
            result = self.service.clean_up_waybills_and_files(from_, to)
            
            return result
        
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
            return {
                "status": "error",
                "message": str(e),
                "data": {
                    "from": from_,
                    "to": to
                }
            }

