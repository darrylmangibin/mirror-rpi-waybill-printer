"""
Database configuration and utilities.
Simple SQLite setup without global models.
"""

from flask_sqlalchemy import SQLAlchemy

# Global database instance
db = SQLAlchemy()


def init_db(app):
    """Initialize database with Flask app."""
    db.init_app(app)


def get_db():
    """Get database instance for use in services."""
    return db
