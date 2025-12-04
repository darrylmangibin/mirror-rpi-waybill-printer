from app.utils.loggers import get_logger
from app.services.waybills.enums.CupsJobStateReasons import CupsJobStateReasons, CupsJobStateGroups

# Optional CUPS import - for development environments where CUPS isn't available
try:
    import cups
except ImportError:
    cups = None

logger = get_logger(__name__)



class CupsJobMonitorService:
    """
    Service to monitor CUPS print job status.
    Queries CUPS daemon for job state and translates to our status values.
    """
    
    # CUPS job state constants (from CUPS documentation)
    JOB_STATES = {
        1: 'pending',      # Job is pending
        2: 'held',         # Job is held
        3: 'processing',   # Job is currently processing
        4: 'stopped',      # Job has stopped
        5: 'canceled',     # Job has been canceled
        7: 'completed',    # Job completed (SUCCESS)
        9: 'aborted'       # Job was aborted (ERROR)
    }
    
    def __init__(self):
        """Initialize CUPS connection."""
        if cups is None:
            logger.warning("CUPS module not available - CupsJobMonitorService will run in mock mode")
            self.conn = None
            return
        
        try:
            self.conn = cups.Connection()
        except Exception as e:
            logger.error(f"Failed to initialize CUPS connection in CupsJobMonitorService: {str(e)}")
            self.conn = None
    
    def _ensure_connection(self):
        """Ensure CUPS connection is active, reconnect if needed."""
        try:
            if not self.conn:
                self.conn = cups.Connection()
        except Exception as e:
            logger.error(f"Failed to reconnect to CUPS: {str(e)}")
            self.conn = None
    
    def check_job_status(self, printer_name: str, job_id: int) -> dict:
        """
        Check the status of a specific CUPS print job.
        
        Args:
            printer_name (str): Name of the printer
            job_id (int): CUPS job ID
        
        Returns:
            dict: {
                'job_id': int,
                'state': int (CUPS state code) or None,
                'state_name': str (human-readable state),
                'is_completed': bool,
                'is_failed': bool,
                'is_processing': bool,
                'error': str (if error occurred) or None
            }
        """
        try:
            self._ensure_connection()
            
            if not self.conn:
                return {
                    'job_id': job_id,
                    'state': None,
                    'state_name': 'unknown',
                    'is_completed': False,
                    'is_failed': True,
                    'is_processing': False,
                    'error': 'CUPS connection unavailable'
                }
            
            # Get job attributes from CUPS daemon
            # Ensure job_id is an integer (CUPS API requirement)
            job_id_int = int(job_id)
            
            # Query actual CUPS daemon
            logger.debug(f"[CUPS DEBUG] Calling getJobAttributes with job_id={job_id_int} (type: {type(job_id_int).__name__})")
            
            # Call CUPS to get job attributes - CUPS API only needs job_id
            job_attrs = self.conn.getJobAttributes(job_id_int)
            job_state = job_attrs.get('job-state', None)
            
            # DEBUG: Log all available job attributes to understand job state better
            logger.info(f"[CUPS RAW ATTRIBUTES] JobID: {job_id_int}, All attrs: {job_attrs}")
            
            # Translate CUPS state to our status
            state_name = self.JOB_STATES.get(job_state, 'unknown')
            
            # Get job state reasons (more reliable than state code)
            state_reasons = job_attrs.get('job-state-reasons', '')
            if isinstance(state_reasons, list):
                state_reasons = ' '.join(state_reasons)
            state_reasons = str(state_reasons).lower()
            
            logger.debug(f"[CUPS STATE REASONS] JobID: {job_id}, state_reasons: {state_reasons}")
            
            # Determine job completion/failure/processing
            # IMPORTANT: Check is_processing FIRST - if actively printing, don't mark as failed!
            
            # Check if job is currently processing/printing
            is_processing = (
                state_reasons in CupsJobStateGroups.PROCESSING.value or
                any(reason in state_reasons for reason in CupsJobStateGroups.PROCESSING.value) or
                job_state in [1, 2, 3, 4]  # Pending, held, processing, stopped
            )
            
            # Check if job is completed successfully
            is_completed = (
                any(reason in state_reasons for reason in CupsJobStateGroups.COMPLETED.value) or
                job_state == 7  # Fallback to state code
            )
            
            # CRITICAL: Only mark as failed if NOT currently printing!
            # This prevents false failures when job-state=5 (held) but job-printing is active
            is_failed = (
                (
                    any(reason in state_reasons for reason in CupsJobStateGroups.FAILED.value) or
                    job_state in [5, 9]  # Fallback to state codes
                ) and 
                not is_processing  # ← KEY: Don't fail if still printing!
            )
            
            logger.info(f"CUPS Job Status Check - JobID: {job_id}, Printer: {printer_name}, State: {job_state} ({state_name})")
            
            return {
                'job_id': job_id,
                'state': job_state,
                'state_name': state_name,
                'is_completed': is_completed,
                'is_failed': is_failed,
                'is_processing': is_processing,
                'error': None
            }
        
        except cups.IPPError as e:
            # Job might have been removed from queue after completion
            logger.warning(f"CUPS IPP Error checking job {job_id} on {printer_name}: {str(e)}")
            logger.debug(f"[CUPS IPP ERROR DETAILS] Exception type: {type(e).__name__}, Message: {str(e)}")
            return {
                'job_id': job_id,
                'state': None,
                'state_name': 'unknown',
                'is_completed': False,
                'is_failed': True,
                'is_processing': False,
                'error': f"CUPS error: {str(e)}"
            }
        
        except TypeError as e:
            # This happens when CUPS API receives wrong type arguments
            logger.error(f"TypeError checking CUPS job {job_id}: {str(e)}", exc_info=True)
            logger.error(f"[TYPE ERROR DEBUG] printer_name='{printer_name}' (type: {type(printer_name).__name__}), job_id_int={job_id_int} (type: {type(job_id_int).__name__})")
            return {
                'job_id': job_id,
                'state': None,
                'state_name': 'unknown',
                'is_completed': False,
                'is_failed': False,
                'is_processing': False,
                'error': f"Type error: {str(e)}"
            }
        
        except Exception as e:
            logger.error(f"Error checking CUPS job status for job {job_id}: {str(e)}", exc_info=True)
            logger.error(f"[EXCEPTION DEBUG] Exception type: {type(e).__name__}, Printer: {printer_name}, JobID: {job_id}")
            return {
                'job_id': job_id,
                'state': None,
                'state_name': 'unknown',
                'is_completed': False,
                'is_failed': False,
                'is_processing': False,
                'error': str(e)
            }
    
    def get_all_jobs_for_printer(self, printer_name: str, include_completed: bool = False) -> dict:
        """
        Get all jobs for a printer.
        
        Args:
            printer_name (str): Name of the printer
            include_completed (bool): Whether to include completed jobs
        
        Returns:
            dict: {job_id: job_attributes, ...}
        """
        try:
            self._ensure_connection()
            
            if not self.conn:
                logger.error("Cannot get jobs - CUPS connection unavailable")
                return {}
            
            # Get active jobs
            jobs = self.conn.getJobs(printer_name, completed=False)
            
            # Optionally get completed jobs too
            if include_completed:
                completed_jobs = self.conn.getJobs(printer_name, completed=True)
                jobs = {**jobs, **completed_jobs}
            
            return jobs
        
        except Exception as e:
            logger.error(f"Error getting jobs for printer {printer_name}: {str(e)}", exc_info=True)
            return {}

