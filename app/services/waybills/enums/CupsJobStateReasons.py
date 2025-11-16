from enum import Enum


class CupsJobStateReasons(Enum):
    """
    Enumeration for CUPS job state reason values.
    These are the 'job-state-reasons' values returned by CUPS.
    Used to determine the actual state of a print job.
    
    Reference: https://tools.ietf.org/html/rfc8011
    """
    
    # Processing States
    JOB_PRINTING = "job-printing"
    JOB_PROCESSING = "processing"
    
    # Completion States
    JOB_COMPLETED_SUCCESSFULLY = "job-completed-successfully"
    JOB_COMPLETED_WITH_WARNING = "job-completed-with-warning"
    JOB_COMPLETED_WITH_ERROR = "job-completed-with-error"
    
    # Error/Failure States
    JOB_ABORTED = "aborted"
    JOB_CANCELED = "canceled"
    
    # Queue States
    JOB_HELD = "job-held"
    JOB_STOPPED = "job-stopped"
    JOB_PENDING = "job-pending"
    
    # Other States
    NONE = "none"
    
    def __str__(self):
        """Return the string value of the enum."""
        return self.value


class CupsJobStateGroups(Enum):
    """
    Groups of CUPS job state reasons for easier logic checking.
    """
    
    PROCESSING = [
        CupsJobStateReasons.JOB_PRINTING.value,
        CupsJobStateReasons.JOB_PROCESSING.value,
    ]
    
    COMPLETED = [
        CupsJobStateReasons.JOB_COMPLETED_SUCCESSFULLY.value,
        CupsJobStateReasons.JOB_COMPLETED_WITH_WARNING.value,
    ]
    
    FAILED = [
        CupsJobStateReasons.JOB_COMPLETED_WITH_ERROR.value,
        CupsJobStateReasons.JOB_ABORTED.value,
        CupsJobStateReasons.JOB_CANCELED.value,
    ]
    
    QUEUED = [
        CupsJobStateReasons.JOB_HELD.value,
        CupsJobStateReasons.JOB_STOPPED.value,
        CupsJobStateReasons.JOB_PENDING.value,
    ]

