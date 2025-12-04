"""
Service Container for dependency injection.
Manages service lifecycle and caching.
"""

from app.services.waybills.services.CupsJobMonitorService import CupsJobMonitorService
from app.services.waybills.services.PrinterCheckService import PrinterCheckService


class ServiceContainer:
    """
    Manages service instances with lazy initialization and caching.
    Single responsibility: Create and cache services.
    """
    
    _instance = None
    _services = {}
    
    def __new__(cls):
        """Singleton pattern - only one container instance."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    @property
    def cups_service(self) -> CupsJobMonitorService:
        """Get or create CUPS service (lazy initialization)."""
        if 'cups' not in self._services:
            self._services['cups'] = CupsJobMonitorService()
        return self._services['cups']
    
    @property
    def printer_service(self) -> PrinterCheckService:
        """Get or create Printer service (lazy initialization)."""
        if 'printer' not in self._services:
            self._services['printer'] = PrinterCheckService()
        return self._services['printer']
    
    def reset(self):
        """Reset all cached services (useful for testing)."""
        self._services.clear()
    
    def __repr__(self):
        return f"<ServiceContainer with {len(self._services)} cached services>"


# Global container instance
container = ServiceContainer()

