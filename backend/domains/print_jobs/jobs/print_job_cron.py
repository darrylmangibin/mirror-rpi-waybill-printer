import time


class PrintJobCron:
    """
    Print job cron - handles printing of waybills.
    TEMPORARILY DISABLED FOR DEBUGGING
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
        
        # TEMPORARILY: Just return success, no logic
        return {
            'success': True,
            'execution': self.execution_count,
        }
