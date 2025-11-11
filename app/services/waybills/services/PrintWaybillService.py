import os
import time
import cups
from datetime import datetime
from app.utils.loggers import get_logger
from app.database import db
from app.services.waybills.enums.WaybillPrintStatuses import WaybillPrintStatuses

logger = get_logger(__name__)


class PrintWaybillService:
    """
    Service for printing waybill files using CUPS.
    Similar to Laravel Service pattern for business logic separation.
    Handles file validation, status management, and printing process.
    """
    
    def __init__(self, printer_name=None):
        """
        Initialize the service with optional printer name.
        If not specified, uses the default printer configured in CUPS.
        
        Args:
            printer_name (str, optional): Name of the printer to use. Defaults to system default printer.
        """
        self.printer_name = printer_name
    
    def _get_cups_connection(self):
        """
        Get CUPS connection and determine printer to use.
        
        Returns:
            tuple: (cups.Connection object, printer_name)
        
        Raises:
            ValueError: If no printer is available
        """
        try:
            conn = cups.Connection()
            
            # Use specified printer or get default
            if self.printer_name:
                printers = conn.getPrinters()
                if self.printer_name not in printers:
                    raise ValueError(f"Printer '{self.printer_name}' not found. Available printers: {list(printers.keys())}")
                printer_name = self.printer_name
            else:
                # Get default printer from CUPS
                default_printer = conn.getDefault()
                if not default_printer:
                    raise ValueError("No default printer configured in CUPS. Please set a default printer using: lpadmin -d <printer_name>")
                printer_name = default_printer
            
            logger.info(f"CUPS connection established - Using printer: {printer_name}")
            return conn, printer_name
        
        except cups.IPPError as e:
            raise Exception(f"CUPS connection error: {str(e)}")
        except Exception as e:
            raise Exception(f"Failed to connect to CUPS: {str(e)}")
    
    def _poll_job_status(self, conn, job_id, invoice_number, max_wait_seconds=300, poll_interval=1):
        """
        Poll CUPS job status until completion or timeout.
        
        Args:
            conn: CUPS connection object
            job_id: Job ID to monitor
            invoice_number: Invoice number for logging
            max_wait_seconds: Maximum time to wait for job completion (default 5 minutes)
            poll_interval: How often to check job status in seconds (default 1 second)
        
        Returns:
            dict: {
                'completed': bool,
                'state': int,
                'state_name': str,
                'message': str
            }
        
        CUPS Job States:
            3 = PENDING (queued, waiting)
            5 = PROCESSING (currently printing)
            9 = COMPLETED (done successfully)
            7 = CANCELED (user canceled)
            8 = ABORTED (error occurred)
        """
        start_time = time.time()
        
        # Map CUPS job states to readable names
        state_names = {
            3: "PENDING",
            5: "PROCESSING",
            9: "COMPLETED",
            7: "CANCELED",
            8: "ABORTED"
        }
        
        while True:
            try:
                # Get job attributes from CUPS
                job_attrs = conn.getJobAttributes(job_id)
                job_state = job_attrs.get('job-state', [None])[0]
                
                state_name = state_names.get(job_state, "UNKNOWN")
                logger.info(f"CUPS Job Status - JobID: {job_id}, Invoice: {invoice_number}, State: {state_name} ({job_state})")
                
                # Check if job reached terminal state
                if job_state == 9:  # COMPLETED
                    logger.info(f"✅ Print job completed - JobID: {job_id}, Invoice: {invoice_number}")
                    return {
                        'completed': True,
                        'state': job_state,
                        'state_name': state_name,
                        'message': 'Job completed successfully'
                    }
                
                elif job_state in [7, 8]:  # CANCELED or ABORTED
                    logger.warning(f"⚠️ Print job failed - JobID: {job_id}, Invoice: {invoice_number}, State: {state_name}")
                    return {
                        'completed': False,
                        'state': job_state,
                        'state_name': state_name,
                        'message': f'Job {state_name.lower()}'
                    }
                
                # Check if timeout exceeded
                elapsed = time.time() - start_time
                if elapsed > max_wait_seconds:
                    logger.error(f"⏱️ Print job timeout - JobID: {job_id}, Invoice: {invoice_number}, Waited {elapsed}s")
                    return {
                        'completed': False,
                        'state': job_state,
                        'state_name': state_name,
                        'message': f'Timeout waiting for job completion (waited {int(elapsed)}s)'
                    }
                
                # Job still pending or processing, wait and retry
                logger.info(f"Job still processing... (State: {state_name}, Waited: {int(elapsed)}s)")
                time.sleep(poll_interval)
                
            except Exception as e:
                logger.error(f"Error polling job status - JobID: {job_id}, Invoice: {invoice_number}: {str(e)}", exc_info=True)
                return {
                    'completed': False,
                    'state': None,
                    'state_name': 'ERROR',
                    'message': f'Error checking job status: {str(e)}'
                }
    
    def print_waybill(self, waybill_print) -> dict:
        """
        Print a waybill file using CUPS and wait for completion.
        
        Validates local file path exists before processing.
        Updates status to "for printing" before sending to printer.
        Polls CUPS until job completes, then updates status to "completed" or "error".
        
        Args:
            waybill_print: WaybillPrint model instance
        
        Returns:
            dict: {
                'status': 'success' or 'error',
                'message': str,
                'data': {
                    'waybill_id': int,
                    'invoice_number': str,
                    'local_file_path': str (if successful),
                    'job_id': int (if successful),
                    'printer': str (if successful)
                }
            }
        """
        try:
            invoice_number = waybill_print.invoice_number
            local_file_path = waybill_print.local_file_path
            
            # Validate local file path exists
            if not local_file_path:
                raise ValueError("Local file path is missing. Please download the waybill first.")
            
            # Validate file exists on disk
            if not os.path.exists(local_file_path):
                raise FileNotFoundError(f"Waybill file not found at: {local_file_path}")
            
            # Log the file path for debugging
            logger.info(f"PrintWaybillService validating - Invoice: {invoice_number}, File: {local_file_path}")
            
            # Update status to "for printing" before sending to printer
            waybill_print.status = WaybillPrintStatuses.FOR_PRINTING.value
            db.session.commit()
            
            logger.info(f"Waybill status updated to 'for printing' - Invoice: {invoice_number}")
            
            # Get CUPS connection and printer
            conn, printer_name = self._get_cups_connection()
            
            # Submit print job to CUPS
            job_title = f"Waybill-{invoice_number}"
            job_id = conn.printFile(printer_name, local_file_path, job_title, {})
            
            logger.info(f"Print job submitted to CUPS - JobID: {job_id}, Invoice: {invoice_number}, Printer: {printer_name}")
            
            # Update status to "printed" temporarily while waiting for job to complete
            waybill_print.status = WaybillPrintStatuses.PRINTED.value
            db.session.commit()
            
            logger.info(f"Waybill status updated to 'printed' - Invoice: {invoice_number}, JobID: {job_id}")
            
            # Poll CUPS to wait for job completion
            logger.info(f"Polling CUPS for job completion - JobID: {job_id}, Invoice: {invoice_number}")
            job_result = self._poll_job_status(conn, job_id, invoice_number)
            
            # Update final status based on CUPS job result
            if job_result['completed']:
                # Job completed successfully
                waybill_print.status = WaybillPrintStatuses.COMPLETED.value
                waybill_print.error_message = None
                db.session.commit()
                
                logger.info(f"✅ Waybill status updated to 'completed' - Invoice: {invoice_number}, JobID: {job_id}")
                
                return {
                    'status': 'success',
                    'message': 'Waybill printed successfully',
                    'data': {
                        'waybill_id': waybill_print.id,
                        'invoice_number': invoice_number,
                        'local_file_path': local_file_path,
                        'job_id': job_id,
                        'printer': printer_name
                    }
                }
            else:
                # Job failed or timed out
                error_msg = job_result['message']
                waybill_print.status = WaybillPrintStatuses.ERROR.value
                waybill_print.error_message = error_msg
                db.session.commit()
                
                logger.error(f"❌ Waybill status updated to 'error' - Invoice: {invoice_number}, JobID: {job_id}, Reason: {error_msg}")
                
                return {
                    'status': 'error',
                    'message': f'Print job failed: {error_msg}',
                    'data': {
                        'waybill_id': waybill_print.id,
                        'invoice_number': invoice_number,
                        'job_id': job_id,
                        'printer': printer_name
                    }
                }
        
        except FileNotFoundError as e:
            error_msg = str(e)
            logger.error(f"File not found for Invoice: {waybill_print.invoice_number} - {error_msg}")
            
            # Update database with error status
            try:
                waybill_print.status = WaybillPrintStatuses.ERROR.value
                waybill_print.error_message = error_msg
                db.session.commit()
            except Exception as db_error:
                logger.error(f"Failed to update WaybillPrint on file not found error: {str(db_error)}", exc_info=True)
            
            return {
                'status': 'error',
                'message': error_msg,
                'data': {
                    'waybill_id': waybill_print.id,
                    'invoice_number': waybill_print.invoice_number
                }
            }
        
        except ValueError as e:
            error_msg = str(e)
            logger.error(f"Validation error for Invoice: {waybill_print.invoice_number} - {error_msg}")
            
            return {
                'status': 'error',
                'message': error_msg,
                'data': {
                    'waybill_id': waybill_print.id,
                    'invoice_number': waybill_print.invoice_number
                }
            }
        
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Error printing waybill for Invoice: {waybill_print.invoice_number}: {error_msg}", exc_info=True)
            
            # Update database with error status
            try:
                waybill_print.status = WaybillPrintStatuses.ERROR.value
                waybill_print.error_message = error_msg
                db.session.commit()
            except Exception as db_error:
                logger.error(f"Failed to update WaybillPrint on error: {str(db_error)}", exc_info=True)
            
            return {
                'status': 'error',
                'message': error_msg,
                'data': {
                    'waybill_id': waybill_print.id,
                    'invoice_number': waybill_print.invoice_number
                }
            }

