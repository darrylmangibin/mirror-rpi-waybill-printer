from app.database import db
from datetime import datetime
from sqlalchemy import event
from app.utils.loggers import get_logger

logger = get_logger(__name__)


class WaybillPrint(db.Model):
    """
    WaybillPrint Model
    """
    __tablename__ = 'waybill_prints'
    
    # Primary Key
    id = db.Column(db.Integer, primary_key=True)
    
    # Timestamps (automatically managed - uses server local time)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now().replace(microsecond=0))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now().replace(microsecond=0), onupdate=lambda: datetime.now().replace(microsecond=0))
    
    # Tenant relationship
    tenant_id = db.Column(db.Integer, nullable=False)
    
    # Fields
    invoice_number = db.Column(db.String, nullable=True)
    waybill_url = db.Column(db.Text, nullable=True)
    marketplace = db.Column(db.String, nullable=True)  # Marketplace name/identifier
    
    # Download Management
    status = db.Column(db.String, default='pending')  # 'pending', 'downloaded', 'failed'
    local_file_path = db.Column(db.Text, nullable=True)  # Path where file is stored
    error_message = db.Column(db.Text, nullable=True)  # Error details if download fails
    downloaded_at = db.Column(db.DateTime, nullable=True)  # When download completed
    
    # Print Management (NEW)
    print_status = db.Column(db.String, default='idle')  # 'idle', 'pending', 'printing', 'completed', 'error'
    cups_job_id = db.Column(db.Integer, nullable=True)  # CUPS job ID for tracking
    printer_name = db.Column(db.String, nullable=True)  # Printer used for this job
    print_error = db.Column(db.Text, nullable=True)  # Error details if print fails
    print_completed_at = db.Column(db.DateTime, nullable=True)  # When printing actually completed
    auto_print = db.Column(db.Boolean, default=True)  # Auto-print after download completes
    
    def __repr__(self):
        return f'<WaybillPrint {self.id}>'
    
    def to_dict(self):
        """Convert model to dictionary for JSON responses."""
        return {
            'id': self.id,
            'tenant_id': self.tenant_id,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
            'updated_at': self.updated_at.strftime('%Y-%m-%d %H:%M:%S') if self.updated_at else None,
            'invoice_number': self.invoice_number,
            'waybill_url': self.waybill_url,
            'marketplace': self.marketplace,
            'status': self.status,
            'local_file_path': self.local_file_path,
            'error_message': self.error_message,
            'downloaded_at': self.downloaded_at.strftime('%Y-%m-%d %H:%M:%S') if self.downloaded_at else None,
            # Print-related fields (NEW)
            'print_status': self.print_status,
            'cups_job_id': self.cups_job_id,
            'printer_name': self.printer_name,
            'print_error': self.print_error,
            'print_completed_at': self.print_completed_at.strftime('%Y-%m-%d %H:%M:%S') if self.print_completed_at else None,
            'auto_print': self.auto_print,  # Include auto_print flag in responses
        }


@event.listens_for(WaybillPrint, 'after_insert', propagate=True)
def auto_queue_download(mapper, connection, target):
    """
    Automatically queue download when new WaybillPrint is created.
    Non-blocking: returns immediately, background worker processes download.
    If no URL is provided, fallback will be used.
    Requires: invoice_number and tenant_id
    """
    if target.invoice_number and target.tenant_id:
        try:
            from app.services.waybills.jobs.download_waybill_job import queue_download
            queue_download(target.id)
            url_status = "with URL" if target.waybill_url else "without URL (fallback pending)"
            logger.info(f"[EVENT] Download queued for Invoice: {target.invoice_number} (ID: {target.id}) Tenant: {target.tenant_id} {url_status}")
        except Exception as e:
            logger.error(f"Failed to queue download for Invoice {target.invoice_number}: {str(e)}", exc_info=True)
    else:
        logger.warning(f"[EVENT] No download queued - Missing Invoice Number or Tenant ID. Invoice: {target.invoice_number}, Tenant: {target.tenant_id}, (ID: {target.id})")
