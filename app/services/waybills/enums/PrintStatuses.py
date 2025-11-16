from enum import Enum


class PrintStatuses(Enum):
    """
    Enumeration for print-specific status values.
    Separate from download status to track printing phase independently.
    Similar to Laravel Enums for type-safe status management.
    """
    
    IDLE = "idle"               # Not yet attempted to print
    PENDING = "pending"         # Queued for printing, waiting to submit to CUPS
    PRINTING = "printing"       # Submitted to CUPS, currently printing or in queue
    COMPLETED = "completed"     # Print job completed successfully
    ERROR = "error"             # Print job failed or aborted
    
    def __str__(self):
        """Return the string value of the enum."""
        return self.value

