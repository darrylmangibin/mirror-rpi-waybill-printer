import logging
from datetime import datetime


class LazyFileHandler(logging.FileHandler):
    """
    Custom file handler that only creates the log file when an actual log entry is written.
    This prevents creating empty log files on every app startup.
    Uses FileHandler's built-in delay mechanism for thread safety.
    """
    
    def __init__(self):
        self.log_file_name = datetime.now().strftime("%m_%d_%Y") + ".log"
        # Use delay=True to prevent file creation until first log entry
        super().__init__(self.log_file_name, mode='a', delay=True)
        self.setLevel(logging.NOTSET)
    
    def emit(self, record):
        """
        Override emit to set formatter on first use, then call parent emit.
        """
        # Set the formatter on first emit if not already set
        if not self.formatter:
            formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
            self.setFormatter(formatter)
        
        # Call parent emit which will handle file opening via _open() if needed
        try:
            super().emit(record)
        except Exception:
            self.handleError(record)


def setup_logger(app):
    """
    Configure logging for the Flask application.
    Creates a log file ONLY when an entry is logged.
    Log file format: MM_DD_YYYY.log
    """
    handler = LazyFileHandler()
    handler.setLevel(logging.INFO)
    app.logger.addHandler(handler)
    app.logger.setLevel(logging.INFO)
