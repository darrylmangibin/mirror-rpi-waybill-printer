"""
Custom Flask CLI commands (similar to Laravel Artisan).
"""

import click
from flask.cli import with_appcontext
from flask import current_app
import subprocess
import os
from flask_migrate import migrate as flask_migrate, upgrade as flask_upgrade, downgrade as flask_downgrade, current as flask_current


def pluralize(word):
    """Simple pluralization (you can expand this for edge cases)."""
    if word.endswith('y'):
        return word[:-1] + 'ies'
    elif word.endswith(('s', 'x', 'z', 'ch', 'sh')):
        return word + 'es'
    else:
        return word + 's'


def singularize(word):
    """Simple singularization."""
    if word.endswith('ies'):
        return word[:-3] + 'y'
    elif word.endswith('es'):
        # Check if it's actually plural
        base = word[:-2]
        if base.endswith(('s', 'x', 'z', 'ch', 'sh')):
            return base
        return word[:-1]
    elif word.endswith('s'):
        return word[:-1]
    return word


def to_snake_case(name):
    """Convert PascalCase to snake_case."""
    import re
    # Insert underscore before uppercase letters
    name = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    # Insert underscore before uppercase letters followed by lowercase
    name = re.sub('([a-z0-9])([A-Z])', r'\1_\2', name)
    return name.lower()


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
        # Ensure model name is singular
        model_name = singularize(name) if name.endswith('s') else name
        
        # Determine table name (always plural and snake_case)
        if not table:
            # Convert PascalCase to snake_case, then pluralize
            snake_case_name = to_snake_case(model_name)
            table = pluralize(snake_case_name)
        
        # Create models directory
        models_dir = os.path.join(current_app.root_path, 'models')
        os.makedirs(models_dir, exist_ok=True)
        
        # Create model file with PascalCase name
        model_file = os.path.join(models_dir, f'{model_name}.py')
        
        # Model template
        model_content = f'''from app.database import db
from datetime import datetime


class {model_name}(db.Model):
    """
    {model_name} Model
    
    Table: {table}
    Location: app/models/{model_name}.py
    
    To move this to a service folder, change location to:
    - app/services/orders/models/{model_name}.py
    - app/orders/models/{model_name}.py
    - Or any other structure you prefer
    
    Then update the import in app/__init__.py accordingly.
    """
    __tablename__ = '{table}'
    
    # Primary Key
    id = db.Column(db.Integer, primary_key=True)
    
    # Timestamps (automatically managed - uses server local time)
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)
    
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
        return f'<{model_name} {{self.id}}>'
    
    def to_dict(self):
        """Convert model to dictionary for JSON responses."""
        return {{
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
        }}
'''
        
        # Write model file
        with open(model_file, 'w') as f:
            f.write(model_content)
        
        click.echo(f"✅ Model {model_name} created at: {model_file}")
        click.echo(f"📋 Table name: {table}")
        
        # Auto-add import to __init__.py
        init_file = os.path.join(current_app.root_path, '__init__.py')
        import_statement = f"from app.models.{model_name} import {model_name}"
        
        try:
            with open(init_file, 'r') as f:
                init_content = f.read()
            
            # Check if import already exists
            if import_statement not in init_content:
                # Find the line with "# Register CLI commands" and add import before it
                if '# Register CLI commands' in init_content:
                    init_content = init_content.replace(
                        '# Register CLI commands',
                        f'# Import models\n    {import_statement}\n    \n    # Register CLI commands'
                    )
                else:
                    # If that comment doesn't exist, add after db initialization
                    init_content = init_content.replace(
                        'migrate = Migrate(app, db, directory',
                        f'{import_statement}\n    migrate = Migrate(app, db, directory'
                    )
                
                with open(init_file, 'w') as f:
                    f.write(init_content)
                click.echo(f"📝 Auto-imported in app/__init__.py")
            else:
                click.echo(f"ℹ️  Import already exists in app/__init__.py")
        except Exception as e:
            click.echo(f"⚠️  Could not auto-import: {e}")
            click.echo(f"   Please add manually: {import_statement}")
        
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
            # Ensure model name is singular
            model_name = singularize(model) if model.endswith('s') else model
            
            # Determine table name (always plural and snake_case)
            if not table:
                # Extract from message or convert PascalCase to snake_case and pluralize
                if 'create_' in message.lower() and '_table' in message.lower():
                    table = message.lower().replace('create_', '').replace('_table', '')
                else:
                    snake_case_name = to_snake_case(model_name)
                    table = pluralize(snake_case_name)
            
            # Create models directory
            models_dir = os.path.join(current_app.root_path, 'models')
            os.makedirs(models_dir, exist_ok=True)
            
            # Create model file with PascalCase name
            model_file = os.path.join(models_dir, f'{model_name}.py')
            
            # Model template
            model_content = f'''from app.database import db
from datetime import datetime


class {model_name}(db.Model):
    """
    {model_name} Model
    
    Table: {table}
    Location: app/models/{model_name}.py
    
    To move this to a service folder, change location to:
    - app/services/orders/models/{model_name}.py
    - app/orders/models/{model_name}.py
    - Or any other structure you prefer
    
    Then update the import in app/__init__.py accordingly.
    """
    __tablename__ = '{table}'
    
    # Primary Key
    id = db.Column(db.Integer, primary_key=True)
    
    # Timestamps (automatically managed - uses server local time)
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)
    
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
        return f'<{model_name} {{self.id}}>'
    
    def to_dict(self):
        """Convert model to dictionary for JSON responses."""
        return {{
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
        }}
'''
            
            # Write model file
            with open(model_file, 'w') as f:
                f.write(model_content)
            
            click.echo(f"✅ Model {model_name} created at: {model_file}")
            click.echo(f"📋 Table name: {table}")
            
            # Import the model dynamically so migration can detect it
            import importlib.util
            spec = importlib.util.spec_from_file_location(f"{model_name}", model_file)
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            
            # Auto-add import to __init__.py
            init_file = os.path.join(current_app.root_path, '__init__.py')
            import_statement = f"from app.models.{model_name} import {model_name}"
            
            try:
                with open(init_file, 'r') as f:
                    init_content = f.read()
                
                # Check if import already exists
                if import_statement not in init_content:
                    # Find the line with "# Register CLI commands" and add import before it
                    if '# Register CLI commands' in init_content:
                        init_content = init_content.replace(
                            '# Register CLI commands',
                            f'# Import models\n    {import_statement}\n    \n    # Register CLI commands'
                        )
                    else:
                        # If that comment doesn't exist, add after db initialization
                        init_content = init_content.replace(
                            'migrate = Migrate(app, db, directory',
                            f'{import_statement}\n    migrate = Migrate(app, db, directory'
                        )
                    
                    with open(init_file, 'w') as f:
                        f.write(init_content)
                    click.echo(f"📝 Auto-imported in app/__init__.py")
            except Exception as e:
                click.echo(f"⚠️  Could not auto-import: {e}")
                click.echo(f"   Please add manually: {import_statement}")
        
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
