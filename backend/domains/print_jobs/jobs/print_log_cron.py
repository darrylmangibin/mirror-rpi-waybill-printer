import time


class PrintLogCron:
    """
    Test cron job - logs a message every second.
    Used to verify the job scheduler is working correctly.
    """
    
    def __init__(self):
        self.execution_count = 0
    
    def execute(self, app):
        """
        Execute the test cron job.
        
        Args:
            app: Flask app instance
            
        Returns:
            dict: Execution status
        """
        self.execution_count += 1
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
        
        message = f"[{timestamp}] 📝 TEST LOG CRON #{self.execution_count}"
        
        # Log to both file and console
        app.logger.info(message)
        print(message)
        
        return {
            'success': True,
            'execution': self.execution_count,
            'timestamp': timestamp
        }
