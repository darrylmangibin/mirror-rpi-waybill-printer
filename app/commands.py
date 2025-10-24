"""
Custom Flask CLI commands (similar to Laravel Artisan).
"""

import click
from flask.cli import with_appcontext
from flask import current_app
import subprocess
import os
from flask_migrate import migrate as flask_migrate, upgrade as flask_upgrade, downgrade as flask_downgrade, current as flask_current


@click.group()
def db():
    """Database commands."""
    pass


@db.command()
@click.argument('message')
@with_appcontext
def migrate(message):
    """Create a new migration (like: flask db:migrate "Add waybill models")."""
    try:
        flask_migrate(message=message)
        click.echo(f"✅ Migration created: {message}")
    except Exception as e:
        click.echo(f"❌ Migration failed: {e}")


@db.command()
@with_appcontext
def upgrade():
    """Apply migrations to database (like: flask db:upgrade)."""
    try:
        flask_upgrade()
        click.echo("✅ Database upgraded successfully")
    except Exception as e:
        click.echo(f"❌ Upgrade failed: {e}")


@db.command()
@with_appcontext
def rollback():
    """Rollback last migration (like: flask db:rollback)."""
    try:
        flask_downgrade()
        click.echo("✅ Database rolled back successfully")
    except Exception as e:
        click.echo(f"❌ Rollback failed: {e}")


@db.command()
@with_appcontext
def status():
    """Show migration status (like: flask db:status)."""
    try:
        current_revision = flask_current()
        click.echo("📋 Current Migration:")
        click.echo(current_revision if current_revision else "No migrations applied")
    except Exception as e:
        click.echo(f"❌ Status check failed: {e}")


@db.command()
@click.argument('message')
@with_appcontext
def fresh(message):
    """Create and apply migration in one command (like: flask db:fresh "Add models")."""
    try:
        # Create migration
        flask_migrate(message=message)
        click.echo(f"✅ Migration created: {message}")
        
        # Apply migration
        flask_upgrade()
        click.echo("✅ Migration applied successfully")
        click.echo("🚀 Database is up to date!")
            
    except Exception as e:
        click.echo(f"❌ Error: {e}")


@db.command('make:model')
@click.argument('name')
@click.option('--table', '-t', help='Specify table name (default: pluralized model name)')
@with_appcontext
def make_model(name, table):
    """Create a new model (like: flask db make:model User --table users)."""
    try:
        # Determine table name
        if not table:
            # Simple pluralization (you can make this more sophisticated)
            table = name.lower() + 's'
        
        # Determine file path
        model_dir = os.path.join(current_app.root_path, 'services', name.lower() + 's')
        os.makedirs(model_dir, exist_ok=True)
        
        model_file = os.path.join(model_dir, 'models.py')
        
        # Model template
        model_content = f'''from app.database import db
from datetime import datetime


class {name}(db.Model):
    __tablename__ = '{table}'
    
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<{name} {{self.id}}>'
    
    def to_dict(self):
        return {{
            'id': self.id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }}
'''
        
        # Write model file
        with open(model_file, 'w') as f:
            f.write(model_content)
        
        click.echo(f"✅ Model {name} created at: {model_file}")
        click.echo(f"📋 Table name: {table}")
        click.echo(f"💡 Don't forget to import it in app/__init__.py:")
        click.echo(f"   from app.services.{name.lower()}s.models import {name}")
        
    except Exception as e:
        click.echo(f"❌ Model creation failed: {e}")


@db.command('make:migration')
@click.argument('message')
@click.option('--model', '-m', help='Also create a model with this migration')
@click.option('--table', '-t', help='Specify table name for the model')
@with_appcontext
def make_migration(message, model, table):
    """Create migration and optionally model (like: flask db make:migration "create_users_table" -m User)."""
    try:
        # Create model first if requested
        if model:
            # Determine table name
            if not table:
                # Extract table name from message or use model name
                if 'create_' in message.lower() and '_table' in message.lower():
                    table = message.lower().replace('create_', '').replace('_table', '')
                else:
                    table = model.lower() + 's'
            
            # Create model directory and file
            model_dir = os.path.join(current_app.root_path, 'services', model.lower() + 's')
            os.makedirs(model_dir, exist_ok=True)
            
            model_file = os.path.join(model_dir, 'models.py')
            
            # Model template
            model_content = f'''from app.database import db
from datetime import datetime


class {model}(db.Model):
    __tablename__ = '{table}'
    
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<{model} {{self.id}}>'
    
    def to_dict(self):
        return {{
            'id': self.id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }}
'''
            
            # Write model file
            with open(model_file, 'w') as f:
                f.write(model_content)
            
            click.echo(f"✅ Model {model} created at: {model_file}")
            click.echo(f"📋 Table name: {table}")
            
            # Import the model dynamically so migration can detect it
            import importlib.util
            spec = importlib.util.spec_from_file_location(f"{model}", model_file)
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            
            click.echo(f"💡 Don't forget to import it in app/__init__.py:")
            click.echo(f"   from app.services.{model.lower()}s.models import {model}")
        
        # Create migration
        flask_migrate(message=message)
        click.echo(f"✅ Migration created: {message}")
        
    except Exception as e:
        click.echo(f"❌ Error: {e}")


# Additional utility commands
@click.command()
@with_appcontext
def routes():
    """Show all registered routes (like: flask routes)."""
    try:
        result = subprocess.run([
            'flask', 'routes'
        ], capture_output=True, text=True, cwd=current_app.root_path + '/..')
        
        if result.returncode == 0:
            click.echo("🛣️  Available Routes:")
            click.echo(result.stdout)
        else:
            click.echo(f"❌ Routes command failed: {result.stderr}")
    except Exception as e:
        click.echo(f"❌ Error: {e}")
