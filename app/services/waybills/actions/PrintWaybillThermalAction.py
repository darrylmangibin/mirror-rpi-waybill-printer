"""
Thermal Printer Action - Direct ESC/POS Printing

Uses python-escpos library for direct thermal printer communication.
No CUPS drivers required - works with any 80mm thermal printer via USB.
"""

from app.utils.loggers import get_logger
from app.services.waybills.models.WaybillPrint import WaybillPrint
from app.services.waybills.services.ThermalPrintService import ThermalPrintService

logger = get_logger(__name__)


class PrintWaybillThermalAction:
    """
    Action for printing waybills directly to thermal printer using ESC/POS.
    Bypasses CUPS - direct USB communication to thermal printer.
    """
    
    def __init__(self, vendor_id=None, product_id=None):
        """
        Initialize thermal printing action.
        
        Args:
            vendor_id: USB vendor ID (default: XPrinter 0x2D37)
            product_id: USB product ID (default: XPrinter 0x8327)
        """
        self.thermal_service = ThermalPrintService(vendor_id, product_id)
    
    def __call__(self, waybill_print: WaybillPrint) -> dict:
        """
        Print a waybill using thermal printer.
        
        Args:
            waybill_print (WaybillPrint): The waybill to print
            
        Returns:
            dict: Result of print operation
        """
        try:
            invoice_number = waybill_print.invoice_number
            
            logger.info(f"PrintWaybillThermalAction executing - Invoice: {invoice_number}")
            
            # Delegate to thermal service
            return self.thermal_service.print_waybill(waybill_print)
        
        except Exception as e:
            logger.error(f"Error in PrintWaybillThermalAction: {str(e)}", exc_info=True)
            return {
                "status": "error",
                "message": str(e),
                "data": {
                    "waybill_id": waybill_print.id,
                    "invoice_number": waybill_print.invoice_number
                }
            }

