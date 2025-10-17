from datetime import datetime
from models import db
from utils import utcnow_without_microseconds


class WaybillPrintJob(db.Model):
    """
    WaybillPrintJob model representing a waybill print job.
    Tracks print jobs for waybill documents with their processing status.
    """
    __tablename__ = 'waybill_print_jobs'
    
    # Constraints
    __table_args__ = (
        db.UniqueConstraint('tenant_id', 'invoice_number', 'waybill_url', name='uq_waybill_print_jobs_tenant_invoice_url'),
    )
    
    # Primary Key
    id = db.Column(db.Integer, primary_key=True)
    
    # Required Fields
    tenant_id = db.Column(db.String(255), nullable=False, index=True)
    invoice_number = db.Column(db.String(255), nullable=False, index=True)
    waybill_url = db.Column(db.String(500), nullable=False)
    
    # Status and Timestamps
    status = db.Column(db.String(50), default='pending', nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=utcnow_without_microseconds, nullable=False)
    updated_at = db.Column(db.DateTime, default=utcnow_without_microseconds, onupdate=utcnow_without_microseconds, nullable=False)
    
    # File Tracking Fields
    file_path = db.Column(db.String(500), nullable=True)
    file_size = db.Column(db.Integer, nullable=True)
    download_started_at = db.Column(db.DateTime, nullable=True)
    download_completed_at = db.Column(db.DateTime, nullable=True)
    error_message = db.Column(db.Text, nullable=True)
    
    def __repr__(self):
        return f'<WaybillPrintJob {self.id} - {self.invoice_number}>'
    
    def to_dict(self):
        """
        Convert WaybillPrintJob instance to dictionary for JSON serialization.
        Timestamps are formatted in MySQL format (YYYY-MM-DD HH:MM:SS) without microseconds.
        
        Returns:
            dict: WaybillPrintJob data as dictionary
        """
        def format_datetime(dt):
            """Format datetime to MySQL format: YYYY-MM-DD HH:MM:SS"""
            if dt is None:
                return None
            return dt.strftime("%Y-%m-%d %H:%M:%S")
        
        return {
            'id': self.id,
            'invoice_number': self.invoice_number,
            'waybill_url': self.waybill_url,
            'status': self.status,
            'file_path': self.file_path,
            'file_size': self.file_size,
            'error_message': self.error_message,
            'created_at': format_datetime(self.created_at),
            'updated_at': format_datetime(self.updated_at),
            'download_started_at': format_datetime(self.download_started_at),
            'download_completed_at': format_datetime(self.download_completed_at),
            'tenant_id': self.tenant_id,
        }
