"""
Configuration for WaybillDownloadService.

Centralized settings for file download, PDF processing, and browser automation.
Laravel-style array configuration for easy management and environment-based overrides.

Edit this file to adjust service behavior, timeouts, dimensions, and offsets.

Helper Functions:
    - get(key): Get config value using dot notation (generic, from app.config.helper)
    - get_crop_offset(marketplace, axis): Get marketplace-specific crop offset
"""

from app.config.helper import get as config_get

# ============================================================================
# WAYBILL DOWNLOAD SERVICE CONFIGURATION
# ============================================================================

config = {
    # PDF Dimensions & Formatting (72 DPI basis)
    'pdf': {
        'dpi': 72,
        'label_width_points': 288,  # 4 inches
        'label_height_points': 432,  # 6 inches
        'page_format': 'A4',  # A4, Letter, etc.
    },

    # PDF Crop Offsets for different marketplaces (in points)
    # Negative offsets expand crop box outward for padding
    # Positive offsets shrink crop box inward
    'crop_offsets': {
        'shopify': {
            'x': -2,  # Negative: add white space padding on left
            'y': -2,  # Negative: add white space padding on top
        },
        'zalora': {
            'x': 45,  # Positive: shrink from left edge
            'y': 29,  # Positive: shrink from top edge
        },
        'default': {
            'x': 5,  # Default safety margin
            'y': 5,  # Default safety margin
        },
    },

    # Timeouts & Delays (milliseconds for Playwright, seconds for requests)
    'timeouts': {
        'playwright_page_load_ms': 30000,  # 30 seconds - page load timeout
        'playwright_render_delay_ms': 2000,  # 2 seconds - extra render wait
        'requests_download_sec': 30,  # 30 seconds - HTTP request timeout
    },

    # File I/O Settings
    'file_io': {
        'html_preview_size': 500,  # bytes to peek for HTML detection
        'download_chunk_size': 8192,  # 8KB chunks for streaming
    },

    # Encoding & Format
    'encoding': {
        'default_encoding': 'utf-8',
        'timestamp_format': '%Y%m%d-%H%M%S',  # YYYYMMDD-HHMMSS
    },

    # Playwright Browser Automation
    'playwright': {
        'headless': True,  # Run without GUI
        'page_load_wait_until': 'domcontentloaded',  # domcontentloaded | networkidle
    },

    # Directory Navigation
    'app_dir_levels_up': 4,  # Levels up from service file to app root
}


# ============================================================================
# HELPER FUNCTIONS - Waybill Specific
# ============================================================================

def get_crop_offset(marketplace: str, axis: str = 'x'):
    """
    Get crop offset for a specific marketplace.
    
    This is a waybill-specific helper function.
    For generic config access, use: from app.config.helper import get
    
    Examples:
        get_crop_offset('shopify', 'x')  # Returns -2
        get_crop_offset('zalora', 'y')  # Returns 29
    
    Args:
        marketplace: Marketplace name (shopify, zalora, default)
        axis: x or y axis
    
    Returns:
        Offset value
    """
    marketplace = marketplace.lower() if marketplace else 'default'
    offsets = config['crop_offsets'].get(marketplace, config['crop_offsets']['default'])
    return offsets.get(axis.lower(), config['crop_offsets']['default'][axis.lower()])
