from datetime import datetime
from models import db


class PrintJob(db.Model):
    """
    PrintJob model representing a waybill print job.
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
    
    def __repr__(self):
        return f'<PrintJob {self.id} - {self.invoice_number}>'
    
    def to_dict(self):
        """
        Convert PrintJob instance to dictionary for JSON serialization.
        
        Returns:
            dict: PrintJob data as dictionary
        """
        return {
            'id': self.id,
            'invoice_number': self.invoice_number,
            'waybill_url': self.waybill_url,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
