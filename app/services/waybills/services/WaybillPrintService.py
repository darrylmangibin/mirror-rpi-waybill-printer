import os
from app.utils.loggers import get_logger
from app.database import db
from app.services.waybills.models.WaybillPrint import WaybillPrint
from app.services.waybills.enums.WaybillPrintStatuses import WaybillPrintStatuses

logger = get_logger(__name__)


class WaybillPrintService:
    """
    Service for handling WaybillPrint model operations.
    Similar to Laravel Service pattern for business logic separation.
    """
    
    @staticmethod
    def create(data: dict) -> WaybillPrint:
        """
        Create and save a new WaybillPrint record to the database.
        
        Args:
            data (dict): Dictionary containing:
                - invoice_number (str): Invoice number for the waybill
                - waybill_url (str): URL of the waybill to print
                - marketplace (str): Marketplace identifier (optional)
                - tenant_id (int): Tenant ID for the waybill
                - auto_print (bool): Whether to auto-print after download (optional, default: False)
        
        Returns:
            WaybillPrint: The created model instance
            
        Raises:
            Exception: If database save fails
            
        Example:
            >>> data = {'invoice_number': 'INV-001', 'waybill_url': 'https://...', 'marketplace': 'amazon', 'tenant_id': 1}
            >>> waybill = WaybillPrintService.create(data)
            >>> print(waybill.id)
        """
        try:
            # Extract data with defaults
            invoice_number = data.get('invoice_number')
            waybill_url = data.get('waybill_url')
            marketplace = data.get('marketplace')
            tenant_id = data.get('tenant_id')
            auto_print = data.get('auto_print', False)  # Default to False if not provided
            
            # Create model instance
            waybill_print = WaybillPrint(
                invoice_number=invoice_number,
                waybill_url=waybill_url,
                marketplace=marketplace,
                tenant_id=tenant_id,
                auto_print=auto_print  # Pass the auto_print flag
            )
            
            # Save to database
            db.session.add(waybill_print)
            db.session.commit()
            
            return waybill_print
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error creating WaybillPrint: {str(e)}", exc_info=True)
            raise
    
    @staticmethod
    def update(waybill_print: WaybillPrint, data: dict) -> WaybillPrint:
        """
        Update a WaybillPrint record with new data.
        
        Args:
            waybill_print (WaybillPrint): The waybill print instance to update
            data (dict): Dictionary containing fields to update:
                - invoice_number (str, optional): New invoice number
                - waybill_url (str, optional): New waybill URL
                - marketplace (str, optional): New marketplace identifier
                - tenant_id (int, optional): New tenant ID
        
        Returns:
            WaybillPrint: The updated waybill print instance
            
        Raises:
            Exception: If database update fails
            
        Example:
            >>> waybill = WaybillPrint.query.get(1)
            >>> data = {'invoice_number': 'INV-002', 'waybill_url': 'https://new-url'}
            >>> updated = WaybillPrintService.update(waybill, data)
        """
        try:
            # Update only provided fields
            if 'invoice_number' in data:
                waybill_print.invoice_number = data.get('invoice_number')
            if 'waybill_url' in data:
                waybill_print.waybill_url = data.get('waybill_url')
            if 'marketplace' in data:
                waybill_print.marketplace = data.get('marketplace')
            if 'tenant_id' in data:
                waybill_print.tenant_id = data.get('tenant_id')
            
            # Commit changes
            db.session.commit()
            
            return waybill_print
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error updating WaybillPrint: {str(e)}", exc_info=True)
            raise
    
    @staticmethod
    def destroy(waybill_print: WaybillPrint) -> bool:
        """Delete a WaybillPrint record and clean up associated local file."""
        try:
            # Delete local file if it exists
            if waybill_print.local_file_path and os.path.exists(waybill_print.local_file_path):
                try:
                    os.remove(waybill_print.local_file_path)
                except Exception as e:
                    logger.warning(f"Failed to delete local file {waybill_print.local_file_path}: {str(e)}")
            
            # Delete database record
            db.session.delete(waybill_print)
            db.session.commit()
            return True
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error deleting WaybillPrint: {str(e)}", exc_info=True)
            raise
    
    @staticmethod
    def change_status(waybill_print: WaybillPrint, status: str) -> WaybillPrint:
        """
        Change the status of a WaybillPrint record.
        Validates status against WaybillPrintStatuses enum.
        
        Args:
            waybill_print (WaybillPrint): The waybill print instance to update
            status (str): New status value from WaybillPrintStatuses enum
        
        Returns:
            WaybillPrint: The updated waybill print instance
            
        Raises:
            ValueError: If status is not a valid enum value
            Exception: If database update fails
            
        Example:
            >>> waybill = WaybillPrint.query.get(1)
            >>> updated = WaybillPrintService.change_status(waybill, WaybillPrintStatuses.DOWNLOADED.value)
        """
        try:
            # Validate status against enum values
            valid_statuses = [s.value for s in WaybillPrintStatuses]
            if status not in valid_statuses:
                raise ValueError(f"Invalid status: {status}. Must be one of {valid_statuses}")
            
            # Update status
            waybill_print.status = status
            db.session.commit()
            
            return waybill_print
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error changing WaybillPrint status: {str(e)}", exc_info=True)
            raise
