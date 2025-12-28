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

# Cleanup Configuration
CLEANUP_INTERVAL_MINUTES = int(os.getenv('CLEANUP_INTERVAL_MINUTES', '30'))
CLEANUP_HOURS_THRESHOLD = int(os.getenv('CLEANUP_HOURS_THRESHOLD', '6'))



