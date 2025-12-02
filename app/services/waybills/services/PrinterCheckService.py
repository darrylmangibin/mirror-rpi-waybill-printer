"""
Printer Status Check Service

Monitors printer availability and handles offline scenarios by:
1. Checking if printer is online/offline
2. Detecting jobs stuck waiting for offline printer
3. Auto-canceling stuck jobs with appropriate error messages
4. Updating waybill status to reflect printer unavailability
"""

from datetime import datetime, timedelta
from app.utils.loggers import get_logger
from app.database import db
from app.services.waybills.models.WaybillPrint import WaybillPrint
from app.services.waybills.enums.WaybillPrintStatuses import WaybillPrintStatuses
from app.config.helper import get
from app.config import printing as printing_config

# Optional CUPS import
try:
    import cups
except ImportError:
    cups = None

logger = get_logger(__name__)

# Config
MOCK_MODE = get(printing_config.config, 'mock.enabled')
STUCK_JOB_TIMEOUT = 300  # 5 minutes in seconds - consider job stuck if waiting this long


class PrinterCheckService:
    """
    Service to check printer status and handle offline scenarios.
    """
    
    def __init__(self):
        """Initialize CUPS connection."""
        if cups is None:
            logger.warning("CUPS module not available - PrinterCheckService will run in mock mode")
            self.conn = None
            return
        
        try:
            self.conn = cups.Connection()
            logger.info("PrinterCheckService initialized")
        except Exception as e:
            logger.error(f"Failed to initialize CUPS connection in PrinterCheckService: {str(e)}")
            self.conn = None
    
    def _ensure_connection(self):
        """Ensure CUPS connection is active, reconnect if needed."""
        try:
            if not self.conn:
                self.conn = cups.Connection()
        except Exception as e:
            logger.error(f"Failed to reconnect to CUPS: {str(e)}")
    
    def is_printer_online(self, printer_name: str) -> bool:
        """
        Check if printer is online and available.
        
        Args:
            printer_name (str): Name of the printer to check
        
        Returns:
            bool: True if printer is online, False if offline or error
        """
        if MOCK_MODE:
            logger.info(f"[MOCK] Checking printer '{printer_name}' - assuming online")
            return True
        
        try:
            self._ensure_connection()
            if not self.conn:
                logger.error(f"No CUPS connection available for printer check")
                return False
            
            # Get printer details
            printers = self.conn.getPrinters()
            
            if printer_name not in printers:
                logger.warning(f"Printer '{printer_name}' not found in CUPS")
                return False
            
            printer_info = printers[printer_name]
            
            # Check printer state
            printer_state = printer_info.get('printer-state', None)
            state_reasons = printer_info.get('printer-state-reasons', [])
            
            if isinstance(state_reasons, str):
                state_reasons = [state_reasons]
            
            state_reasons_str = ' '.join(state_reasons).lower()
            
            logger.debug(f"Printer '{printer_name}' state: {printer_state}, reasons: {state_reasons_str}")
            
            # CUPS printer states:
            # 3 = idle (online and ready)
            # 4 = processing (online and printing)
            # Other = potentially offline or in error
            
            is_online = printer_state in [3, 4]
            
            if not is_online:
                logger.warning(f"Printer '{printer_name}' is NOT online - State: {printer_state}, Reasons: {state_reasons_str}")
            
            return is_online
        
        except Exception as e:
            logger.error(f"Error checking printer '{printer_name}' status: {str(e)}", exc_info=True)
            return False
    
    def check_and_handle_stuck_jobs(self, printer_name: str) -> dict:
        """
        Check for jobs stuck waiting on offline printer and cancel them.
        
        Args:
            printer_name (str): Name of the printer to check
        
        Returns:
            dict: Report of actions taken
        """
        try:
            # Check if printer is actually offline
            is_online = self.is_printer_online(printer_name)
            
            if is_online:
                logger.info(f"Printer '{printer_name}' is online - no action needed")
                return {
                    'status': 'success',
                    'message': 'Printer is online',
                    'printer_online': True,
                    'cancelled_count': 0,
                    'cancelled_jobs': []
                }
            
            # Printer is OFFLINE - find stuck jobs
            logger.warning(f"Printer '{printer_name}' is OFFLINE - checking for stuck jobs")
            
            # Find all pending/printing jobs for this printer
            active_jobs = WaybillPrint.query.filter(
                WaybillPrint.printer_name == printer_name,
                WaybillPrint.print_status.in_(['pending', 'printing']),
                WaybillPrint.cups_job_id.isnot(None)
            ).all()
            
            cancelled_jobs = []
            now = datetime.now()
            
            for waybill in active_jobs:
                # Calculate how long job has been stuck
                if waybill.updated_at:
                    elapsed = (now - waybill.updated_at).total_seconds()
                else:
                    elapsed = 0
                
                invoice = waybill.invoice_number or f"ID:{waybill.id}"
                
                # If job is stuck longer than timeout, cancel it
                if elapsed > STUCK_JOB_TIMEOUT or elapsed == 0:
                    try:
                        self._cancel_stuck_job(waybill)
                        cancelled_jobs.append({
                            'waybill_id': waybill.id,
                            'invoice_number': invoice,
                            'cups_job_id': waybill.cups_job_id,
                            'elapsed_seconds': elapsed
                        })
                        logger.warning(f"[OFFLINE CANCEL] Invoice: {invoice}, WaybillID: {waybill.id}, JobID: {waybill.cups_job_id}, Elapsed: {elapsed}s")
                    except Exception as e:
                        logger.error(f"Failed to cancel stuck job for invoice {invoice}: {str(e)}", exc_info=True)
            
            return {
                'status': 'success',
                'message': f'Printer offline - cancelled {len(cancelled_jobs)} stuck jobs',
                'printer_online': False,
                'cancelled_count': len(cancelled_jobs),
                'cancelled_jobs': cancelled_jobs
            }
        
        except Exception as e:
            logger.error(f"Error in check_and_handle_stuck_jobs: {str(e)}", exc_info=True)
            return {
                'status': 'error',
                'message': str(e),
                'printer_online': None,
                'cancelled_count': 0,
                'cancelled_jobs': []
            }
    
    def _cancel_stuck_job(self, waybill: WaybillPrint) -> None:
        """
        Mark a stuck job as failed and update waybill status.
        
        Args:
            waybill (WaybillPrint): The waybill to mark as failed
        """
        error_msg = "Printer offline - job waiting timeout (5 minutes)"
        
        waybill.print_status = 'error'  # Mark as error, not cancelled (user didn't cancel it)
        waybill.status = 'error'
        waybill.print_error = error_msg
        waybill.print_completed_at = datetime.now().replace(microsecond=0)
        
        db.session.commit()
        
        logger.info(f"[STUCK JOB FAILED] Invoice: {waybill.invoice_number}, WaybillID: {waybill.id}, Error: {error_msg}")
    
    def get_printer_status_report(self, printer_name: str) -> dict:
        """
        Get comprehensive report on printer and its jobs status.
        
        Args:
            printer_name (str): Name of the printer
        
        Returns:
            dict: Detailed status report
        """
        try:
            is_online = self.is_printer_online(printer_name)
            
            # Get active jobs
            active_jobs = WaybillPrint.query.filter(
                WaybillPrint.printer_name == printer_name,
                WaybillPrint.print_status.in_(['pending', 'printing']),
                WaybillPrint.cups_job_id.isnot(None)
            ).all()
            
            stuck_jobs = []
            now = datetime.now()
            
            for waybill in active_jobs:
                if waybill.updated_at:
                    elapsed = (now - waybill.updated_at).total_seconds()
                else:
                    elapsed = 0
                
                if elapsed > STUCK_JOB_TIMEOUT:
                    stuck_jobs.append({
                        'waybill_id': waybill.id,
                        'invoice_number': waybill.invoice_number,
                        'print_status': waybill.print_status,
                        'elapsed_seconds': elapsed
                    })
            
            return {
                'printer_name': printer_name,
                'is_online': is_online,
                'active_job_count': len(active_jobs),
                'stuck_job_count': len(stuck_jobs),
                'stuck_jobs': stuck_jobs
            }
        
        except Exception as e:
            logger.error(f"Error getting printer status report: {str(e)}", exc_info=True)
            return {
                'printer_name': printer_name,
                'is_online': None,
                'error': str(e)
            }

