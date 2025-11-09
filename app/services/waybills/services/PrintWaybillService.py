import os
from datetime import datetime
from app.utils.loggers import get_logger
from app.database import db
from app.services.waybills.enums.WaybillPrintStatuses import WaybillPrintStatuses

logger = get_logger(__name__)


class PrintWaybillService:
    """
    Service for printing waybill files.
    Similar to Laravel Service pattern for business logic separation.
    Handles file validation, status management, and printing process.
    """
    
    def __init__(self):
        """Initialize the service."""
        pass
    
    def print_waybill(self, waybill_print) -> dict:
        """
        Print a waybill file.
        Validates local file path exists before processing.
        Updates status to "for printing" and handles errors.
        
        Args:
            waybill_print: WaybillPrint model instance
        
        Returns:
            dict: {
                'status': 'success' or 'error',
                'message': str,
                'data': {
                    'waybill_id': int,
                    'invoice_number': str,
                    'local_file_path': str (if successful)
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
            
            # Update status to "for printing" before processing
            waybill_print.status = WaybillPrintStatuses.FOR_PRINTING.value
            db.session.commit()
            
            logger.info(f"Waybill status updated to 'for printing' - Invoice: {invoice_number}")
            
            # TODO: Add actual printing logic here
            # This is where you would integrate with the printer driver
            
            return {
                'status': 'success',
                'message': 'Waybill sent to printer',
                'data': {
                    'waybill_id': waybill_print.id,
                    'invoice_number': invoice_number,
                    'local_file_path': local_file_path
                }
            }
        
        except FileNotFoundError as e:
            error_msg = str(e)
            logger.error(f"File not found for Invoice: {waybill_print.invoice_number} - {error_msg}")
            
            # Update database with error status
            try:
                waybill_print.status = WaybillPrintStatuses.FAILED.value
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
                waybill_print.status = WaybillPrintStatuses.FAILED.value
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

