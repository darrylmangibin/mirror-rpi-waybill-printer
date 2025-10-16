import logging
from datetime import datetime


class LazyFileHandler(logging.FileHandler):
    """
    Custom file handler that only creates the log file when an actual log entry is written.
    This prevents creating empty log files on every app startup.
    """
    
    def __init__(self):
        self.log_file_name = datetime.now().strftime("%m_%d_%Y") + ".log"
        self._file_created = False
        # Initialize the base Handler class (not FileHandler yet)
        logging.Handler.__init__(self)
        self.level = logging.NOTSET
        self.stream = None
    
    def emit(self, record):
        """
        Override emit to create the file only when the first log entry is written.
        """
        if not self._file_created:
            # Initialize the parent FileHandler with the log file path
            logging.FileHandler.__init__(self, self.log_file_name)
            # Set the formatter
            formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
            self.setFormatter(formatter)
            self._file_created = True
        
        # Write the log entry
        logging.FileHandler.emit(self, record)
    
    def close(self):
        """
        Close the handler and the underlying stream if it was created.
        """
        if self._file_created and self.stream:
            logging.FileHandler.close(self)
        else:
            logging.Handler.close(self)


def setup_logger(app):
    """
    Configure logging for the Flask application.
    Creates a log file ONLY when an error or warning is logged.
    Log file format: MM_DD_YYYY.log
    """
    handler = LazyFileHandler()
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    handler.setLevel(logging.INFO)
    app.logger.addHandler(handler)
    app.logger.setLevel(logging.INFO)
