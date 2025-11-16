from flask import request
from datetime import datetime, timedelta
from app.utils.loggers import get_logger
from app.utils.pagination import format_pagination
from app.services.waybills.services.WaybillPrintService import WaybillPrintService
from app.services.waybills.models.WaybillPrint import WaybillPrint

logger = get_logger(__name__)


class WaybillPrintController:
    """Controller for handling waybill printing operations."""
    
    def index(self) -> dict:
        """
        Retrieve all waybill prints with pagination, search, and filtering.
        
        Returns:
            dict: Response with status, paginated data, and pagination metadata
        
        Query Parameters:
            - page: Current page number (default: 1)
            - per_page: Items per page (default: 15)
            - search: Search by invoice number (partial match)
            - status: Filter by status (can be comma-separated: pending,failed or multiple: ?status=pending&status=failed)
            - from: Filter by created_at start date (YYYY-MM-DD format, default: Jan 1st of current year)
            - to: Filter by created_at end date (YYYY-MM-DD format, default: today)
        """
        try:
            page = request.args.get('page', 1, type=int)
            per_page = request.args.get('per_page', 15, type=int)
            
            # Start with base query
            query = WaybillPrint.query
            
            # Search filter - invoice number
            search = request.args.get('search', '').strip()
            if search:
                query = query.filter(WaybillPrint.invoice_number.ilike(f'%{search}%'))
            
            # Status filter - can be multiple values
            status_param = request.args.get('status', '').strip()
            if status_param:
                # Handle both comma-separated and multiple query params
                statuses = [s.strip() for s in status_param.split(',') if s.strip()]
                if not statuses:
                    # Try to get multiple status params (?status=pending&status=failed)
                    statuses = request.args.getlist('status')
                
                if statuses:
                    query = query.filter(WaybillPrint.status.in_(statuses))
            
            # Date range filter - created_at
            created_at_from = request.args.get('from', '').strip()
            if created_at_from:
                try:
                    from_date = datetime.strptime(created_at_from, '%Y-%m-%d')
                    query = query.filter(WaybillPrint.created_at >= from_date)
                except ValueError:
                    pass
            else:
                # Default: from first day of current year
                today = datetime.now()
                year_start = datetime(today.year, 1, 1)
                query = query.filter(WaybillPrint.created_at >= year_start)
            
            created_at_to = request.args.get('to', '').strip()
            if created_at_to:
                try:
                    to_date = datetime.strptime(created_at_to, '%Y-%m-%d') + timedelta(days=1)
                    query = query.filter(WaybillPrint.created_at < to_date)
                except ValueError:
                    pass
            else:
                # Default: up to today (end of current day)
                today = datetime.now()
                end_of_today = datetime(today.year, today.month, today.day) + timedelta(days=1)
                query = query.filter(WaybillPrint.created_at < end_of_today)
            
            # Sort by created_at in descending order (newest first)
            query = query.order_by(WaybillPrint.created_at.desc())
            
            # Apply pagination
            paginated = query.paginate(page=page, per_page=per_page, error_out=False)
            
            return format_pagination(paginated, message="Waybill prints retrieved successfully")
            
        except Exception as e:
            logger.error(f"Error retrieving waybill prints: {str(e)}", exc_info=True)
            return {
                "status": "error",
                "message": str(e)
            }
    
    def store(self, data: dict) -> dict:
        """
        Store/create a waybill print request.
        
        Args:
            data: Validated request data dictionary containing:
                - invoice_number: Invoice number for the waybill
                - waybill_url: URL of the waybill to print
            
        Returns:
            dict: Response with status and message
        """
        try:
            invoice_number = data.get('invoice_number')
            waybill_url = data.get('waybill_url')
            
            # Call service method to create and save waybill
            waybill_print = WaybillPrintService.create(data)
            
            return {
                "status": "success",
                "message": "Waybill print request stored",
                "data": waybill_print.to_dict()
            }
            
        except Exception as e:
            logger.error(f"Error storing waybill: {str(e)}", exc_info=True)
            return {
                "status": "error",
                "message": str(e)
            }
    
    def update(self, waybill_print: WaybillPrint, data: dict) -> dict:
        """
        Update a waybill print.
        
        Args:
            waybill_print: WaybillPrint model instance to update
            data: Dictionary with fields to update
            
        Returns:
            dict: Response with status and updated waybill data
        """
        try:
            # Call service method to update waybill
            updated_waybill = WaybillPrintService.update(waybill_print, data)
            
            return {
                "status": "success",
                "message": "Waybill updated successfully",
                "data": updated_waybill.to_dict()
            }
            
        except Exception as e:
            logger.error(f"Error updating waybill: {str(e)}", exc_info=True)
            return {
                "status": "error",
                "message": str(e)
            }
    
    def destroy(self, waybill_print: WaybillPrint) -> dict:
        """
        Delete a waybill print.
        
        Args:
            waybill_print: WaybillPrint model instance to delete
            
        Returns:
            dict: Response with status and message
        """
        try:
            waybill_id = waybill_print.id
            
            # Call service method to delete waybill
            WaybillPrintService.destroy(waybill_print)
            
            return {
                "status": "success",
                "message": "Waybill print deleted successfully"
            }
            
        except Exception as e:
            logger.error(f"Error deleting waybill: {str(e)}", exc_info=True)
            return {
                "status": "error",
                "message": str(e)
            }
    
    def change_status(self, waybill_print: WaybillPrint, status: str) -> dict:
        """
        Change the status of a waybill print.
        
        Args:
            waybill_print: WaybillPrint model instance to update
            status: New status value ('pending', 'downloaded', 'failed')
            
        Returns:
            dict: Response with status and updated waybill data
        """
        try:
            # Call service method to change status
            updated_waybill = WaybillPrintService.change_status(waybill_print, status)
            
            return {
                "status": "success",
                "message": f"Waybill status updated to '{status}' successfully",
                "data": updated_waybill.to_dict()
            }
            
        except ValueError as e:
            return {
                "status": "error",
                "message": str(e)
            }
        except Exception as e:
            logger.error(f"Error updating waybill status: {str(e)}", exc_info=True)
            return {
                "status": "error",
                "message": str(e)
            }