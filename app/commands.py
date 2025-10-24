"""
Custom Flask CLI commands (similar to Laravel Artisan).
"""

import click
from flask.cli import with_appcontext
from flask import current_app
import subprocess
import os


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
        result = subprocess.run([
            'flask', 'db', 'migrate', '-m', message
        ], capture_output=True, text=True, cwd=current_app.root_path + '/..')
        
        if result.returncode == 0:
            click.echo(f"✅ Migration created: {message}")
            click.echo(result.stdout)
        else:
            click.echo(f"❌ Migration failed: {result.stderr}")
    except Exception as e:
        click.echo(f"❌ Error: {e}")


@db.command()
@with_appcontext
def upgrade():
    """Apply migrations to database (like: flask db:upgrade)."""
    try:
        result = subprocess.run([
            'flask', 'db', 'upgrade'
        ], capture_output=True, text=True, cwd=current_app.root_path + '/..')
        
        if result.returncode == 0:
            click.echo("✅ Database upgraded successfully")
            click.echo(result.stdout)
        else:
            click.echo(f"❌ Upgrade failed: {result.stderr}")
    except Exception as e:
        click.echo(f"❌ Error: {e}")


@db.command()
@with_appcontext
def rollback():
    """Rollback last migration (like: flask db:rollback)."""
    try:
        result = subprocess.run([
            'flask', 'db', 'downgrade'
        ], capture_output=True, text=True, cwd=current_app.root_path + '/..')
        
        if result.returncode == 0:
            click.echo("✅ Database rolled back successfully")
            click.echo(result.stdout)
        else:
            click.echo(f"❌ Rollback failed: {result.stderr}")
    except Exception as e:
        click.echo(f"❌ Error: {e}")


@db.command()
@with_appcontext
def status():
    """Show migration status (like: flask db:status)."""
    try:
        result = subprocess.run([
            'flask', 'db', 'history'
        ], capture_output=True, text=True, cwd=current_app.root_path + '/..')
        
        if result.returncode == 0:
            click.echo("📋 Migration History:")
            click.echo(result.stdout)
        else:
            click.echo(f"❌ Status check failed: {result.stderr}")
    except Exception as e:
        click.echo(f"❌ Error: {e}")


@db.command()
@click.argument('message')
@with_appcontext
def fresh(message):
    """Create and apply migration in one command (like: flask db:fresh "Add models")."""
    try:
        # Create migration
        result1 = subprocess.run([
            'flask', 'db', 'migrate', '-m', message
        ], capture_output=True, text=True, cwd=current_app.root_path + '/..')
        
        if result1.returncode != 0:
            click.echo(f"❌ Migration creation failed: {result1.stderr}")
            return
        
        click.echo(f"✅ Migration created: {message}")
        
        # Apply migration
        result2 = subprocess.run([
            'flask', 'db', 'upgrade'
        ], capture_output=True, text=True, cwd=current_app.root_path + '/..')
        
        if result2.returncode == 0:
            click.echo("✅ Migration applied successfully")
            click.echo("🚀 Database is up to date!")
        else:
            click.echo(f"❌ Migration apply failed: {result2.stderr}")
            
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
