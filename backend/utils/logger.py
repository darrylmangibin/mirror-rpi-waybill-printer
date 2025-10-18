import logging
import os
from datetime import datetime


class LazyFileHandler(logging.FileHandler):
    """
    Custom file handler that only creates the log file when an actual log entry is written.
    This prevents creating empty log files on every app startup.
    Uses FileHandler's built-in delay mechanism for thread safety.
    Saves logs to storage/logs directory.
    """
    
    def __init__(self, logs_dir='storage/logs'):
        # Ensure logs directory exists
        os.makedirs(logs_dir, exist_ok=True)
        
        self.log_file_name = os.path.join(logs_dir, datetime.now().strftime("%m_%d_%Y") + ".log")
        # Use delay=True to prevent file creation until first log entry
        # Use UTF-8 encoding to support Unicode characters
        super().__init__(self.log_file_name, mode='a', delay=True, encoding='utf-8')
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
    Location: storage/logs/ directory
    """
    handler = LazyFileHandler()
    handler.setLevel(logging.INFO)
    app.logger.addHandler(handler)
    app.logger.setLevel(logging.INFO)


def cleanup_old_logs(logs_dir='storage/logs', days=7):
    """
    Remove log files older than specified number of days.
    
    Args:
        logs_dir (str): Directory containing log files. Default: 'storage/logs'
        days (int): Number of days to keep logs. Default: 7
    
    Returns:
        dict: Dictionary with 'deleted' list and 'error' message if any
    
    Example:
        cleanup_old_logs(days=7)  # Keep last 7 days of logs
    """
    import glob
    from pathlib import Path
    from datetime import timedelta
    
    result = {
        'deleted': [],
        'error': None
    }
    
    if not os.path.exists(logs_dir):
        result['error'] = f"Logs directory not found: {logs_dir}"
        return result
    
    try:
        cutoff_time = datetime.now() - timedelta(days=days)
        log_files = glob.glob(os.path.join(logs_dir, '*.log'))
        
        for log_file in log_files:
            file_mtime = datetime.fromtimestamp(os.path.getmtime(log_file))
            
            if file_mtime < cutoff_time:
                try:
                    os.remove(log_file)
                    result['deleted'].append(os.path.basename(log_file))
                except OSError as e:
                    if result['error'] is None:
                        result['error'] = []
                    result['error'].append(f"Failed to delete {os.path.basename(log_file)}: {str(e)}")
        
        return result
    
    except Exception as e:
        result['error'] = str(e)
        return result
