from flask_sqlalchemy import SQLAlchemy

# Initialize SQLAlchemy
db = SQLAlchemy()


def init_models(app):
    """
    Initialize models with Flask app context.
    This function ensures all models are properly registered with SQLAlchemy.
    """
    # Import models here to register them with SQLAlchemy
    from models.print_job import PrintJob
    
    return db


# Export db and models for use in other modules
__all__ = ['db', 'init_models']
