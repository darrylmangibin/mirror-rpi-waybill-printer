import logging
from datetime import datetime


def setup_logger(app):
    """
    Configure logging for the Flask application.
    Creates a log file with format: MM_DD_YYYY.log
    """
    log_file_name = datetime.now().strftime("%m_%d_%Y") + ".log"
    handler = logging.FileHandler(log_file_name)
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    app.logger.addHandler(handler)
    app.logger.setLevel(logging.INFO)
