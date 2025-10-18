import os
from dotenv import dotenv_values


class Config:
    """
    Application configuration loader - similar to Laravel's config()
    Reads from .env file and environment variables dynamically
    
    Usage:
        Config.get('printer.mode', 'mock')
        Config.is_enabled('app.allow_duplicate_job')
    """
    
    @staticmethod
    def _get_env_file_path():
        """Get the path to .env file"""
        # Look for .env in the current directory and parent directories
        current_dir = os.path.dirname(os.path.abspath(__file__))
        backend_dir = os.path.dirname(current_dir)  # Go up to backend/
        env_path = os.path.join(backend_dir, '.env')
        
        if os.path.exists(env_path):
            return env_path
        
        # Fallback to current working directory
        if os.path.exists('.env'):
            return '.env'
        
        return None
    
    @staticmethod
    def get(key, default=None):
        """
        Get configuration value from .env or environment
        Reads fresh from .env file on each call
        
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
        
        # Try to read from .env file first (always fresh)
        env_file = Config._get_env_file_path()
        if env_file:
            env_vars = dotenv_values(env_file)
            if env_key in env_vars:
                value = env_vars[env_key]
                # Convert string booleans to actual booleans
                if isinstance(value, str):
                    if value.lower() == 'true':
                        return True
                    elif value.lower() == 'false':
                        return False
                return value
        
        # Fallback to os.getenv for system environment variables
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
