import os
from functools import lru_cache


class Config:
    """
    Application configuration loader - similar to Laravel's config()
    Loads from environment variables with caching
    
    Usage:
        Config.get('printer.mode', 'mock')
        Config.is_enabled('app.allow_duplicate_job')
    """
    
    @staticmethod
    @lru_cache(maxsize=128)
    def get(key, default=None):
        """
        Get configuration value
        
        Args:
            key: Configuration key in dot notation (e.g., 'app.allow_duplicate_job')
            default: Default value if not found
        
        Returns:
            Configuration value (converted to appropriate type)
            
        Example:
            Config.get('printer.mode', 'mock')
            Config.get('app.allow_duplicate_job', False)
        """
        # Convert dot notation to env var notation
        # app.allow_duplicate_job -> APP_ALLOW_DUPLICATE_JOB
        env_key = key.upper().replace('.', '_')
        value = os.getenv(env_key, default)
        
        # Convert string booleans to actual booleans
        if isinstance(value, str):
            if value.lower() == 'true':
                return True
            elif value.lower() == 'false':
                return False
        
        return value
    
    @staticmethod
    def is_enabled(key):
        """
        Check if a boolean configuration is enabled
        
        Args:
            key: Configuration key
        
        Returns:
            True if enabled, False otherwise
            
        Example:
            if Config.is_enabled('app.allow_duplicate_job'):
                # Allow duplicates
        """
        return Config.get(key, False) is True
