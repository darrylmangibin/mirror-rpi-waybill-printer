from enum import Enum


class WaybillPrintStatuses(Enum):
    """
    Enumeration for WaybillPrint status values.
    Similar to Laravel Enums for type-safe status management.
    """
    
    PENDING = "pending"
    FOR_PRINTING = "for printing"
    PRINTED = "printed"
    FAILED = "failed"
    
    def __str__(self):
        """Return the string value of the enum."""
        return self.value

