"""
Environment configuration - Simple and Laravel-like
"""

import os
from dotenv import load_dotenv

# Load .env file if it exists
load_dotenv()

# Simple configuration flags
DEBUG = os.getenv('DEBUG', 'False').lower() in ('true', '1', 'yes')
HOST = os.getenv('HOST', '0.0.0.0')
PORT = int(os.getenv('PORT', 5000))

# Print Configuration
PRINTER_NAME = os.getenv('PRINTER_NAME', 'XP410B')
# Ex. usb://Xprinter/XP-410B?serial=410BBE235170626
PRINTER_URI="usb://Xprinter/XP-410B?serial=REPLACE_ME"


# Cleanup Configuration
CLEANUP_INTERVAL_MINUTES = int(os.getenv('CLEANUP_INTERVAL_MINUTES', '30'))
CLEANUP_HOURS_THRESHOLD = int(os.getenv('CLEANUP_HOURS_THRESHOLD', '6'))



