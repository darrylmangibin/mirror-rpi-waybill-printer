import subprocess
import os
from config.printer_config import PrinterConfig
from models import db
from domains.print_jobs.models import WaybillPrintJob
from domains.print_jobs.enums import PrintJobStatus
from utils import utcnow_without_microseconds


class WaybillPrintJobTriggerService:
    """
    Service for triggering print actions on waybill print jobs.
    Simple, direct printing without complex configuration.
    """
    
    def _get_cups_printer_name(self, friendly_name, app):
        """
        Get actual CUPS printer name from friendly name.
        Queries CUPS to find the printer.
        
        Args:
            friendly_name: User-friendly name (e.g., "EPSON L120 Series")
            app: Flask app for logging
            
        Returns:
            str: Actual CUPS printer name or original name if not found
        """
        try:
            app.logger.info(f"[CUPS] Looking for printer: {friendly_name}")
            
            # Get list of available printers from CUPS
            result = subprocess.run(
                ['lpstat', '-p'],
                capture_output=True,
                text=True,
                timeout=5
            )
            
            if result.returncode != 0:
                app.logger.warning(f"[CUPS] lpstat failed: {result.stderr}")
                return friendly_name
            
            # Parse output to find printer names
            # Output format: "printer name is idle..."
            lines = result.stdout.split('\n')
            app.logger.info(f"[CUPS] Raw output:\n{result.stdout}")
            
            # Normalize search name (keep only alphanumeric, lowercase)
            def normalize_name(name):
                return ''.join(c.lower() for c in name if c.isalnum())
            
            normalized_search = normalize_name(friendly_name)
            app.logger.info(f"[CUPS] Normalized search: '{normalized_search}'")
            
            for line in lines:
                # Only process lines that START with "printer" keyword
                if line.strip().lower().startswith('printer '):
                    # Extract printer name (second word)
                    parts = line.split()
                    if len(parts) >= 2:
                        printer_name = parts[1]
                        normalized_printer = normalize_name(printer_name)
                        
                        app.logger.info(f"[CUPS] Checking: '{printer_name}' (normalized: '{normalized_printer}')")
                        
                        # Check if names match (fuzzy match - one contained in other)
                        if normalized_printer in normalized_search or normalized_search in normalized_printer:
                            app.logger.info(f"[CUPS] [OK] FOUND MATCH: '{friendly_name}' -> '{printer_name}'")
                            return printer_name
            
            app.logger.warning(f"[CUPS] [FAIL] No match found for '{friendly_name}', using as-is")
            return friendly_name
        
        except Exception as e:
            app.logger.warning(f"[CUPS] Error querying printers: {str(e)}, using friendly name")
            return friendly_name
    
    def trigger_print(self, waybill_print_job_id, app):
        """
        Trigger a print action for a specific waybill print job.
        Simple direct approach - tries wslprint or lp command.
        
        Args:
            waybill_print_job_id: The ID of the waybill print job
            app: Flask app instance for logging
            
        Returns:
            dict: {
                'success': bool,
                'error': str or None,
                'data': WaybillPrintJob instance or None
            }
        """
        app.logger.info(f"[SERVICE] trigger_print called with job_id={waybill_print_job_id}")
        print(f"[SERVICE] trigger_print called with job_id={waybill_print_job_id}")
        
        try:
            # Find the print job
            app.logger.info(f"[SERVICE] Querying database for job {waybill_print_job_id}")
            print_job = WaybillPrintJob.query.filter_by(id=waybill_print_job_id).first()
            
            if not print_job:
                app.logger.error(f"[SERVICE] Job {waybill_print_job_id} not found in database")
                return {
                    'success': False,
                    'error': f'Print job with ID {waybill_print_job_id} not found',
                    'data': None
                }
            
            app.logger.info(f"[SERVICE] Job found: {print_job.invoice_number}, status={print_job.status}")
            print(f"[SERVICE] Job found: {print_job.invoice_number}, status={print_job.status}")
            
            # Validate file has been downloaded
            app.logger.info(f"[SERVICE] Checking file: {print_job.file_path}")
            print(f"[SERVICE] Checking file: {print_job.file_path}")
            
            if not print_job.file_path:
                app.logger.error(f"[SERVICE] No file_path set")
                return {
                    'success': False,
                    'error': 'File not found or not downloaded yet',
                    'data': print_job
                }
            
            if not os.path.exists(print_job.file_path):
                app.logger.error(f"[SERVICE] File does not exist: {print_job.file_path}")
                return {
                    'success': False,
                    'error': 'File not found or not downloaded yet',
                    'data': print_job
                }
            
            app.logger.info(f"[SERVICE] File exists and is readable")
            
            # Validate job is not already completed
            if print_job.status == PrintJobStatus.COMPLETED.value:
                app.logger.warning(f"[SERVICE] Job already completed")
                return {
                    'success': False,
                    'error': 'This print job has already been completed',
                    'data': print_job
                }
            
            # Mark print as started
            app.logger.info(f"[SERVICE] Marking print_started_at")
            print_job.print_started_at = utcnow_without_microseconds()
            db.session.commit()
            
            log_message = (
                f"Printing: Job ID {print_job.id}, "
                f"Invoice: {print_job.invoice_number}, "
                f"File: {print_job.file_path}"
            )
            app.logger.info(f"[SERVICE] {log_message}")
            print(f"[SERVICE] {log_message}")
            
            # Get printer name from config
            printer_config = PrinterConfig.load()
            friendly_printer_name = printer_config.get('printer_name', 'default')
            app.logger.info(f"[SERVICE] Friendly printer name from config: {friendly_printer_name}")
            
            # Resolve to actual CUPS printer name
            actual_printer_name = self._get_cups_printer_name(friendly_printer_name, app)
            app.logger.info(f"[SERVICE] Resolved printer name: {actual_printer_name}")
            
            # Try to print with simple command
            app.logger.info(f"[SERVICE] Calling _execute_print()")
            print_success = self._execute_print(print_job.file_path, actual_printer_name, app)
            
            app.logger.info(f"[SERVICE] Print execution result: success={print_success}")
            print(f"[SERVICE] Print execution result: success={print_success}")
            
            if print_success:
                # Print command succeeded - just log, don't update database
                app.logger.info(f"[SERVICE] [OK] Print job sent to queue - NO DATABASE CHANGES")
                print(f"[SERVICE] [OK] Print job sent to queue - NO DATABASE CHANGES")
            else:
                # Print command failed - update status to FAILED
                app.logger.error(f"[SERVICE] [FAIL] Print command failed - marking as FAILED")
                print(f"[SERVICE] [FAIL] Print command failed - marking as FAILED")
                print_job.status = PrintJobStatus.FAILED.value
                print_job.error_message = 'Print command failed'
                db.session.commit()
            
            return {
                'success': print_success,
                'error': None if print_success else 'Print command failed',
                'data': print_job
            }
        
        except Exception as e:
            error_message = f"Error: {str(e)}"
            app.logger.error(f"[SERVICE] Exception caught: {error_message}")
            print(f"[SERVICE] Exception caught: {error_message}")
            
            try:
                print_job = WaybillPrintJob.query.filter_by(id=waybill_print_job_id).first()
                if print_job:
                    print_job.status = PrintJobStatus.FAILED.value
                    print_job.error_message = error_message
                    db.session.commit()
            except:
                pass
            
            return {
                'success': False,
                'error': error_message,
                'data': None
            }
    
    def _execute_print(self, file_path, printer_name, app):
        """
        Execute print command - tries wslprint first (Windows), then lp (Linux CUPS).
        
        Args:
            file_path: Path to file to print
            printer_name: Name of printer to use
            app: Flask app for logging
            
        Returns:
            bool: True if print command succeeded
        """
        app.logger.info(f"[PRINT] Starting print execution for: {file_path}")
        print(f"[PRINT] Starting print execution for: {file_path}")
        app.logger.info(f"[PRINT] Using printer: {printer_name}")
        print(f"[PRINT] Using printer: {printer_name}")
        
        try:
            # Try wslprint first (WSL + Windows printer)
            # wslprint works with Windows printer names
            app.logger.info(f"[PRINT] Attempting wslprint (Windows printer)")
            print(f"[PRINT] Attempting wslprint (Windows printer)")
            try:
                # wslprint syntax: wslprint -p "Printer Name" file_path
                cmd = ['wslprint', '-p', printer_name, file_path]
                app.logger.info(f"[PRINT] Running command: {' '.join(cmd)}")
                print(f"[PRINT] Running command: {' '.join(cmd)}")
                
                result = subprocess.run(
                    cmd,
                    capture_output=True,
                    text=True,
                    timeout=15
                )
                
                app.logger.info(f"[PRINT] wslprint exit code: {result.returncode}")
                app.logger.info(f"[PRINT] wslprint stdout: {result.stdout}")
                app.logger.info(f"[PRINT] wslprint stderr: {result.stderr}")
                print(f"[PRINT] wslprint exit code: {result.returncode}")
                print(f"[PRINT] wslprint stdout: {result.stdout}")
                print(f"[PRINT] wslprint stderr: {result.stderr}")
                
                if result.returncode == 0:
                    app.logger.info(f"[PRINT] [OK] SUCCESS: wslprint succeeded")
                    print(f"[PRINT] [OK] SUCCESS: wslprint succeeded")
                    return True
                else:
                    app.logger.warning(f"[PRINT] wslprint failed with code {result.returncode}")
            except FileNotFoundError:
                app.logger.info(f"[PRINT] wslprint not found, trying lp (Linux CUPS)")
                print(f"[PRINT] wslprint not found, trying lp (Linux CUPS)")
            
            # Try lp command (CUPS) - for Linux/Raspberry Pi
            app.logger.info(f"[PRINT] Attempting lp command (Linux CUPS)")
            print(f"[PRINT] Attempting lp command (Linux CUPS)")
            try:
                # Detect image format and set appropriate options
                file_extension = os.path.splitext(file_path)[1].lower()
                if file_extension in ['.png', '.jpg', '.jpeg', '.gif', '.pdf']:
                    # For image files, use media and scaling options for proper CUPS processing
                    cmd = ['lp', '-d', printer_name, '-o', 'media=A4', '-o', 'fit-to-page', file_path]
                    app.logger.info(f"[PRINT] Using image format options (media=A4, fit-to-page)")
                else:
                    cmd = ['lp', '-d', printer_name, file_path]
                app.logger.info(f"[PRINT] Running command: {' '.join(cmd)}")
                print(f"[PRINT] Running command: {' '.join(cmd)}")
                
                result = subprocess.run(
                    cmd,
                    capture_output=True,
                    text=True,
                    timeout=15
                )
                
                app.logger.info(f"[PRINT] lp exit code: {result.returncode}")
                app.logger.info(f"[PRINT] lp stdout: {result.stdout}")
                app.logger.info(f"[PRINT] lp stderr: {result.stderr}")
                print(f"[PRINT] lp exit code: {result.returncode}")
                print(f"[PRINT] lp stdout: {result.stdout}")
                print(f"[PRINT] lp stderr: {result.stderr}")
                
                if result.returncode == 0:
                    app.logger.info(f"[PRINT] [OK] SUCCESS: lp succeeded")
                    print(f"[PRINT] [OK] SUCCESS: lp succeeded")
                    return True
                else:
                    app.logger.warning(f"[PRINT] lp failed with code {result.returncode}")
            except FileNotFoundError:
                app.logger.error(f"[PRINT] lp command not found")
                print(f"[PRINT] lp command not found")
            
            app.logger.error(f"[PRINT] Both wslprint and lp failed")
            return False
        
        except subprocess.TimeoutExpired:
            app.logger.error(f"[PRINT] Print command timeout")
            print(f"[PRINT] Print command timeout")
            return False
        except Exception as e:
            app.logger.error(f"[PRINT] Print execution error: {str(e)}")
            print(f"[PRINT] Print execution error: {str(e)}")
            return False
