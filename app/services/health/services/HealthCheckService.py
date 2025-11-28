from app.utils.loggers import get_logger

logger = get_logger(__name__)


class HealthCheckService:
    """Service to check if the server is reachable and healthy."""
    
    def check_connection(self):
        """
        Check server connection and health status.
        Returns a simple success response indicating the server is reachable.
        """
        try:
            return {
                "status": "success",
                "message": "✓ Connected! You can now send API requests."
            }
        except Exception as e:
            logger.error(f"Health check failed: {str(e)}")
            return {
                "status": "error",
                "message": str(e)
            }

