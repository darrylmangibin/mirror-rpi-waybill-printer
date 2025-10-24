from app.database import db
from datetime import datetime


class WaybillPrint(db.Model):
    """
    WaybillPrint Model
    """
    __tablename__ = 'waybill_prints'
    
    # Primary Key
    id = db.Column(db.Integer, primary_key=True)
    
    # Timestamps (automatically managed - uses server local time)
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)
    
    # Fields
    invoice_number = db.Column(db.String, nullable=True)
    waybill_url = db.Column(db.Text, nullable=True)
    
    def __repr__(self):
        return f'<WaybillPrint {self.id}>'
    
    def to_dict(self):
        """Convert model to dictionary for JSON responses."""
        return {
            'id': self.id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'invoice_number': self.invoice_number,
            'waybill_url': self.waybill_url,
        }
