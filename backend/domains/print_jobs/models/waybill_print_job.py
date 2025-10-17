from datetime import datetime
from models import db


class WaybillPrintJob(db.Model):
    """
    WaybillPrintJob model representing a waybill print job.
    Tracks print jobs for waybill documents with their processing status.
    """
    __tablename__ = 'waybill_print_jobs'
    
    # Primary Key
    id = db.Column(db.Integer, primary_key=True)
    
    # Required Fields
    invoice_number = db.Column(db.String(255), nullable=False, index=True)
    waybill_url = db.Column(db.String(500), nullable=False)
    
    # Status and Timestamps
    status = db.Column(db.String(50), default='pending', nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # File Tracking Fields
    file_path = db.Column(db.String(500), nullable=True)
    file_size = db.Column(db.Integer, nullable=True)
    download_started_at = db.Column(db.DateTime, nullable=True)
    error_message = db.Column(db.Text, nullable=True)
    
    def __repr__(self):
        return f'<WaybillPrintJob {self.id} - {self.invoice_number}>'
    
    def to_dict(self):
        """
        Convert WaybillPrintJob instance to dictionary for JSON serialization.
        
        Returns:
            dict: WaybillPrintJob data as dictionary
        """
        return {
            'id': self.id,
            'invoice_number': self.invoice_number,
            'waybill_url': self.waybill_url,
            'status': self.status,
            'file_path': self.file_path,
            'file_size': self.file_size,
            'error_message': self.error_message,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'download_started_at': self.download_started_at.isoformat() if self.download_started_at else None,
        }
