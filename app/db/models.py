from datetime import datetime

from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()


class Waybill(db.Model):
    __tablename__ = 'waybills'
    id = db.Column(db.Integer, primary_key=True)
    invoice_number = db.Column(db.String(100), unique=True, nullable=False)
    waybill_url = db.Column(db.String(500), nullable=False)
    status = db.Column(db.String(20), default='pending', nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )


class PrintHistory(db.Model):
    __tablename__ = 'print_history'
    id = db.Column(db.Integer, primary_key=True)
    invoice_number = db.Column(
        db.String(100), db.ForeignKey('waybills.invoice_number'), nullable=False
    )
    printed_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)


