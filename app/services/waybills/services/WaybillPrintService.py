from app.utils.loggers import get_logger
from app.database import db
from app.services.waybills.models.WaybillPrint import WaybillPrint

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
        
        Returns:
            WaybillPrint: The created model instance
            
        Raises:
            Exception: If database save fails
            
        Example:
            >>> data = {'invoice_number': 'INV-001', 'waybill_url': 'https://...'}
            >>> waybill = WaybillPrintService.create(data)
            >>> print(waybill.id)
        """
        try:
            # Extract data with defaults
            invoice_number = data.get('invoice_number')
            waybill_url = data.get('waybill_url')
            
            # Create model instance
            waybill_print = WaybillPrint(
                invoice_number=invoice_number,
                waybill_url=waybill_url
            )
            
            # Save to database
            db.session.add(waybill_print)
            db.session.commit()
            
            logger.info(f"WaybillPrint created successfully - ID: {waybill_print.id}, Invoice: {invoice_number}")
            
            return waybill_print
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error creating WaybillPrint: {str(e)}", exc_info=True)
            raise
    
    @staticmethod
    def destroy(waybill_print: WaybillPrint) -> bool:
        """Delete a WaybillPrint record."""
        try:
            db.session.delete(waybill_print)
            db.session.commit()
            logger.info(f"WaybillPrint deleted successfully - ID: {waybill_print.id}")
            return True
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error deleting WaybillPrint: {str(e)}", exc_info=True)
            raise
    # ============================================================================
    # SCALABILITY: Other CRUD operations (for future implementation)
    # ============================================================================
    
    # @staticmethod
    # def all() -> list:
    #     """Retrieve all WaybillPrint records."""
    #     try:
    #         return WaybillPrint.query.all()
    #     except Exception as e:
    #         logger.error(f"Error retrieving all WaybillPrints: {str(e)}", exc_info=True)
    #         raise
    
    # @staticmethod
    # def find(id: int) -> WaybillPrint:
    #     """Find a WaybillPrint record by ID."""
    #     try:
    #         waybill = WaybillPrint.query.get(id)
    #         if not waybill:
    #             raise ValueError(f"WaybillPrint with ID {id} not found")
    #         return waybill
    #     except Exception as e:
    #         logger.error(f"Error finding WaybillPrint: {str(e)}", exc_info=True)
    #         raise
    
    # @staticmethod
    # def find_by_invoice_number(invoice_number: str) -> WaybillPrint:
    #     """Find a WaybillPrint record by invoice number."""
    #     try:
    #         return WaybillPrint.query.filter_by(invoice_number=invoice_number).first()
    #     except Exception as e:
    #         logger.error(f"Error finding WaybillPrint by invoice: {str(e)}", exc_info=True)
    #         raise
    
    # @staticmethod
    # def update(id: int, data: dict) -> WaybillPrint:
    #     """Update an existing WaybillPrint record."""
    #     try:
    #         waybill = WaybillPrint.query.get(id)
    #         if not waybill:
    #             raise ValueError(f"WaybillPrint with ID {id} not found")
    #         
    #         # Update only provided fields
    #         if 'invoice_number' in data:
    #             waybill.invoice_number = data['invoice_number']
    #         if 'waybill_url' in data:
    #             waybill.waybill_url = data['waybill_url']
    #         
    #         db.session.commit()
    #         logger.info(f"WaybillPrint updated - ID: {id}")
    #         return waybill
    #     except Exception as e:
    #         db.session.rollback()
    #         logger.error(f"Error updating WaybillPrint: {str(e)}", exc_info=True)
    #         raise
    
    # @staticmethod
    # def delete(id: int) -> bool:
    #     """Delete a WaybillPrint record."""
    #     try:
    #         waybill = WaybillPrint.query.get(id)
    #         if not waybill:
    #             raise ValueError(f"WaybillPrint with ID {id} not found")
    #         
    #         db.session.delete(waybill)
    #         db.session.commit()
    #         logger.info(f"WaybillPrint deleted - ID: {id}")
    #         return True
    #     except Exception as e:
    #         db.session.rollback()
    #         logger.error(f"Error deleting WaybillPrint: {str(e)}", exc_info=True)
    #         raise
