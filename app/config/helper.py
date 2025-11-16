"""
Configuration helper functions.

Provides utility functions for accessing configuration values using dot notation,
following Laravel's config helper pattern for easy access throughout the application.
"""


def get(config_dict: dict, key: str, default=None):
    """
    Get a configuration value using dot notation.
    
    This is a generic helper that works with any configuration dictionary.
    Supports nested access using dot notation.
    
    Examples:
        get(config, 'pdf.dpi')  # Returns 72
        get(config, 'crop_offsets.shopify.x')  # Returns -2
        get(config, 'timeouts.requests_download_sec')  # Returns 30
        get(config, 'nonexistent.key', 'default_value')  # Returns 'default_value'
    
    Args:
        config_dict: The configuration dictionary to search
        key: Configuration key using dot notation
        default: Default value if key not found
    
    Returns:
        Configuration value or default
    """
    keys = key.split('.')
    value = config_dict
    
    for k in keys:
        if isinstance(value, dict):
            value = value.get(k)
            if value is None:
                return default
        else:
            return default
    
    return value


def get_nested(config_dict: dict, *keys, default=None):
    """
    Get a nested configuration value using variable arguments.
    
    Alternative to dot notation if you prefer a more explicit approach.
    
    Examples:
        get_nested(config, 'pdf', 'dpi')  # Returns 72
        get_nested(config, 'crop_offsets', 'shopify', 'x')  # Returns -2
    
    Args:
        config_dict: The configuration dictionary to search
        *keys: Variable number of keys representing the nested path
        default: Default value if key not found
    
    Returns:
        Configuration value or default
    """
    value = config_dict
    
    for key in keys:
        if isinstance(value, dict):
            value = value.get(key)
            if value is None:
                return default
        else:
            return default
    
    return value

