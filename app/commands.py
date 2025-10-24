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
