from enum import Enum


class PrintJobStatus(Enum):
    """
    Print Job Status Enum
    
    Defines all possible statuses for a print job, similar to Laravel enums.
    This prevents spelling errors and provides type safety when working with job statuses.
    """
    PENDING = 'pending'
    IN_PROGRESS = 'in_progress'
    COMPLETED = 'completed'
    FAILED = 'failed'
    
    @classmethod
    def values(cls):
        """Get all status values as a list"""
        return [status.value for status in cls]
    
    @classmethod
    def get(cls, value):
        """
        Get status enum by value.
        
        Args:
            value: Status value string
            
        Returns:
            PrintJobStatus enum or None if not found
        """
        for status in cls:
            if status.value == value:
                return status
        return None
