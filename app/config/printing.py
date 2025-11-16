"""
Printing Configuration
Defines all printing-related settings following Laravel config pattern.

Usage:
    from app.config.helper import get
    from app.config import printing
    
    mock_mode = get(printing.config, 'mock.enabled')
    printer_name = get(printing.config, 'printer.name')
"""

import os

config = {
    # Mock/Test Mode Configuration
    'mock': {
        'enabled': False,  # HARD-CODED: Set to False when ready for real printing
        'description': 'When enabled, simulates printing and CUPS monitoring without touching the actual printer'
    },
    
    # Printer Configuration
    'printer': {
        'name': os.getenv('PRINTER_NAME', 'XP410B'),
        'description': 'Default printer name - can be overridden via PRINTER_NAME environment variable',
    },
    
    # Label Configuration (for XPrinter thermal labels)
    'label': {
        'width': int(os.getenv('LABEL_WIDTH', '100')),  # mm
        'height': int(os.getenv('LABEL_HEIGHT', '150')),  # mm
        'scaling': int(os.getenv('LABEL_SCALING', '100')),  # percentage
        'description': 'Default label dimensions for thermal printer'
    },
    
    # CUPS Monitoring Configuration
    'monitoring': {
        'check_interval': 5,  # seconds between CUPS status checks
        'max_checks': 120,  # maximum checks before timeout (5 seconds × 120 = 10 minutes)
        'timeout_seconds': 600,  # 10 minutes
        'description': 'Monitor settings for tracking print jobs through CUPS'
    },
    
    # Mock Mode Simulation Settings
    'mock_simulation': {
        'job_id_range': (1000, 9999),  # random job ID range for mock
        'pending_checks': 1,  # how many checks before moving to processing
        'processing_checks': 3,  # how many checks before marking as completed
        'description': 'Controls mock job progression through states'
    }
}

