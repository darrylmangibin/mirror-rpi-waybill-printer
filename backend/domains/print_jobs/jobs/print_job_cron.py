class PrintJobCron:
    """
    Print job cron - handles printing of waybills.
    """
    
    def __init__(self):
        self.execution_count = 0
    
    def execute(self, app):
        """
        Execute the print job cron.
        
        Args:
            app: Flask app instance
            
        Returns:
            dict: Execution status
        """
        self.execution_count += 1
        log_message = f"Print Job Cron #{self.execution_count}"
        app.logger.info(log_message)
        
        return {
            'success': True,
            'execution': self.execution_count,
            'message': log_message
        }