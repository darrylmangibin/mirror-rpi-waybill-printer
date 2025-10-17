"""
Datetime utility functions for consistent timestamp handling.
Provides functions that return datetime without microseconds for MySQL-compatible storage.
"""
from datetime import datetime


def utcnow_without_microseconds():
    """
    Get current UTC datetime without microseconds.
    
    Returns:
        datetime: Current UTC time with microseconds set to 0
        
    Example:
        >>> dt = utcnow_without_microseconds()
        >>> dt.microsecond
        0
    """
    return datetime.utcnow().replace(microsecond=0)


__all__ = ['utcnow_without_microseconds']
