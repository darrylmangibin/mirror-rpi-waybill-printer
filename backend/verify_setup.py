#!/usr/bin/env python3
"""
Verification script to ensure Flask-SQLAlchemy and migrations are properly configured.
"""
import sys
from app import app
from models import db
from models.print_job import PrintJob

try:
    with app.app_context():
        # Check database tables
        inspector = db.inspect(db.engine)
        tables = inspector.get_table_names()
        
        print("✓ Flask app initialized successfully")
        print(f"✓ Database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
        print(f"✓ Tables in database: {tables}")
        
        if 'waybill_print_jobs' in tables:
            print("✓ waybill_print_jobs table exists")
            columns = inspector.get_columns('waybill_print_jobs')
            print(f"✓ Columns: {[col['name'] for col in columns]}")
        else:
            print("✗ waybill_print_jobs table not found")
            sys.exit(1)
        
        # Check migration history
        try:
            result = db.session.execute(db.text("SELECT * FROM alembic_version"))
            version = result.fetchone()
            print(f"✓ Current migration version: {version[0]}")
        except Exception as e:
            print(f"✗ Could not retrieve migration version: {e}")
        
        print("\n✅ Setup verification completed successfully!")
        
except Exception as e:
    print(f"✗ Error during verification: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
