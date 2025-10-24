from app.database import db
from datetime import datetime


class WaybillPrint(db.Model):
    """
    WaybillPrint Model
    
    Table: waybill_prints
    Location: app/models/WaybillPrint.py
    
    To move this to a service folder, change location to:
    - app/services/orders/models/WaybillPrint.py
    - app/orders/models/WaybillPrint.py
    - Or any other structure you prefer
    
    Then update the import in app/__init__.py accordingly.
    """
    __tablename__ = 'waybill_prints'
    
    # Primary Key
    id = db.Column(db.Integer, primary_key=True)
    
    # Timestamps (automatically managed)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # ============================================
    # 🚀 START: EDIT YOUR CUSTOM FIELDS HERE 🚀
    # ============================================
    # Example fields (uncomment or modify as needed):
    # name = db.Column(db.String(255), nullable=False)
    # email = db.Column(db.String(255), unique=True, nullable=False)
    # status = db.Column(db.String(50), default='active')
    # amount = db.Column(db.Float, default=0.0)
    # is_active = db.Column(db.Boolean, default=True)
    # description = db.Column(db.Text, nullable=True)
    # ============================================
    # 🏁 END: CUSTOM FIELDS SECTION 🏁
    # ============================================
    
    def __repr__(self):
        return f'<WaybillPrint {self.id}>'
    
    def to_dict(self):
        """Convert model to dictionary for JSON responses."""
        return {
            'id': self.id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            # ============================================
            # 🚀 ADD YOUR CUSTOM FIELDS HERE TOO 🚀
            # ============================================
            # 'name': self.name,
            # 'email': self.email,
            # 'status': self.status,
            # ============================================
        }
