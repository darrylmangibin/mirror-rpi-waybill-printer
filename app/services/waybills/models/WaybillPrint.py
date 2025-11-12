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
    
    # Fields
    invoice_number = db.Column(db.String, nullable=True)
    waybill_url = db.Column(db.Text, nullable=True)
    
    # Download Management
    status = db.Column(db.String, default='pending')  # 'pending', 'downloaded', 'failed'
    local_file_path = db.Column(db.Text, nullable=True)  # Path where file is stored
    error_message = db.Column(db.Text, nullable=True)  # Error details if download fails
    downloaded_at = db.Column(db.DateTime, nullable=True)  # When download completed
    
    def __repr__(self):
        return f'<WaybillPrint {self.id}>'
    
    def to_dict(self):
        """Convert model to dictionary for JSON responses."""
        return {
            'id': self.id,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
            'updated_at': self.updated_at.strftime('%Y-%m-%d %H:%M:%S') if self.updated_at else None,
            'invoice_number': self.invoice_number,
            'waybill_url': self.waybill_url,
            'status': self.status,
            'local_file_path': self.local_file_path,
            'error_message': self.error_message,
            'downloaded_at': self.downloaded_at.strftime('%Y-%m-%d %H:%M:%S') if self.downloaded_at else None,
        }


@event.listens_for(WaybillPrint, 'after_insert', propagate=True)
def auto_queue_download(mapper, connection, target):
    """
    Automatically queue download when new WaybillPrint is created.
    Non-blocking: returns immediately, background worker processes download.
    """
    if target.waybill_url and target.invoice_number:
        try:
            from app.services.waybills.jobs.download_waybill_job import queue_download
            queue_download(target.id)
            logger.info(f"[EVENT] Download queued for Invoice: {target.invoice_number} (ID: {target.id})")
        except Exception as e:
            logger.error(f"Failed to queue download for Invoice {target.invoice_number}: {str(e)}", exc_info=True)
