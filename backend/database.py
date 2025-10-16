import sqlite3
import os
import re
from pathlib import Path
from contextlib import contextmanager
from datetime import datetime


class Database:
    """
    SQLite database connection manager with automatic migration runner.
    Handles database initialization, connection pooling, and migration tracking.
    """
    
    def __init__(self, db_path=None):
        """
        Initialize database manager.
        
        Args:
            db_path (str): Path to SQLite database file. 
                          Defaults to backend/raspberry_pi.db
        """
        if db_path is None:
            db_path = os.path.join(os.path.dirname(__file__), 'raspberry_pi.db')
        
        self.db_path = db_path
        self.migrations_dir = os.path.join(os.path.dirname(__file__), 'migrations')
    
    def get_connection(self):
        """
        Get a new database connection.
        
        Returns:
            sqlite3.Connection: Database connection with row factory
        """
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    @contextmanager
    def get_db(self):
        """
        Context manager for database connections.
        Ensures proper connection cleanup.
        
        Yields:
            sqlite3.Connection: Database connection
        """
        conn = self.get_connection()
        try:
            yield conn
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
    
    def _configure_pragmas(self, conn):
        """
        Configure SQLite pragmas for optimal performance and safety.
        
        Args:
            conn (sqlite3.Connection): Database connection
        """
        pragmas = [
            "PRAGMA journal_mode = WAL;",          # Write-Ahead Logging for concurrent access
            "PRAGMA foreign_keys = ON;",            # Enable foreign key constraints
            "PRAGMA busy_timeout = 5000;",          # 5 second timeout for busy database
            "PRAGMA auto_vacuum = INCREMENTAL;",    # Optimize for small databases
            "PRAGMA synchronous = NORMAL;",         # Balance speed and safety
        ]
        
        for pragma in pragmas:
            conn.execute(pragma)
        conn.commit()
    
    def _create_migrations_table(self, conn):
        """
        Create the migrations_applied table to track executed migrations.
        
        Args:
            conn (sqlite3.Connection): Database connection
        """
        conn.execute("""
            CREATE TABLE IF NOT EXISTS migrations_applied (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                migration_name TEXT NOT NULL UNIQUE,
                executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()
    
    def _get_executed_migrations(self, conn):
        """
        Get list of migrations that have already been executed.
        
        Args:
            conn (sqlite3.Connection): Database connection
            
        Returns:
            set: Set of migration names that have been executed
        """
        cursor = conn.execute(
            "SELECT migration_name FROM migrations_applied ORDER BY executed_at"
        )
        return {row[0] for row in cursor.fetchall()}
    
    def _get_migration_files(self):
        """
        Get all migration files from migrations directory.
        Files must follow pattern: YYYY_MM_DD_HHMMSS_description.sql
        
        Returns:
            list: Sorted list of (filename, filepath) tuples
        """
        if not os.path.exists(self.migrations_dir):
            return []
        
        migrations = []
        pattern = re.compile(r'^\d{4}_\d{2}_\d{2}_\d{6}_.*\.sql$')
        
        for filename in os.listdir(self.migrations_dir):
            if pattern.match(filename):
                filepath = os.path.join(self.migrations_dir, filename)
                migrations.append((filename, filepath))
        
        # Sort by filename (which includes timestamp)
        migrations.sort(key=lambda x: x[0])
        return migrations
    
    def _execute_migration(self, conn, migration_name, migration_path):
        """
        Execute a single migration file.
        
        Args:
            conn (sqlite3.Connection): Database connection
            migration_name (str): Name of migration file
            migration_path (str): Full path to migration file
            
        Raises:
            Exception: If migration execution fails
        """
        try:
            with open(migration_path, 'r') as f:
                sql = f.read()
            
            # Execute the migration SQL
            conn.executescript(sql)
            
            # Record migration as executed
            conn.execute(
                "INSERT INTO migrations_applied (migration_name) VALUES (?)",
                (migration_name,)
            )
            conn.commit()
            print(f"✓ Executed migration: {migration_name}")
        except Exception as e:
            conn.rollback()
            raise Exception(f"Migration failed for {migration_name}: {str(e)}")
    
    def migrate(self):
        """
        Run all pending migrations in chronological order.
        Skips migrations that have already been executed.
        
        Returns:
            dict: Migration results with executed and skipped counts
        """
        with self.get_db() as conn:
            # Setup migration tracking
            self._create_migrations_table(conn)
            
            # Get list of executed migrations
            executed = self._get_executed_migrations(conn)
            
            # Get all migration files
            migration_files = self._get_migration_files()
            
            executed_count = 0
            skipped_count = 0
            
            # Execute pending migrations
            for migration_name, migration_path in migration_files:
                if migration_name not in executed:
                    self._execute_migration(conn, migration_name, migration_path)
                    executed_count += 1
                else:
                    print(f"⊘ Skipped migration (already executed): {migration_name}")
                    skipped_count += 1
            
            return {
                'executed': executed_count,
                'skipped': skipped_count,
                'total': len(migration_files)
            }
    
    def init_db(self):
        """
        Initialize the database on application startup.
        - Creates database file if it doesn't exist
        - Configures pragmas
        - Runs all pending migrations
        """
        print(f"Initializing database at: {self.db_path}")
        
        # Create database file if it doesn't exist
        if not os.path.exists(self.db_path):
            print(f"Creating new database file: {self.db_path}")
        
        # Configure pragmas
        with self.get_db() as conn:
            self._configure_pragmas(conn)
        
        # Run migrations
        print("Running migrations...")
        results = self.migrate()
        print(f"Migration summary: {results['executed']} executed, {results['skipped']} skipped")
        print("Database initialization complete!")
    
    def reset_db(self):
        """
        Dangerous: Delete the database file and migrations_applied table.
        Use for development/testing only.
        """
        if os.path.exists(self.db_path):
            os.remove(self.db_path)
            print(f"Database file deleted: {self.db_path}")
        else:
            print("Database file does not exist")


# Global database instance
_db = None


def get_database():
    """
    Get the global database instance.
    
    Returns:
        Database: Global database manager instance
    """
    global _db
    if _db is None:
        _db = Database()
    return _db


def init_app(app):
    """
    Initialize database for Flask application.
    Should be called from app.py during application factory.
    
    Args:
        app: Flask application instance
    """
    db = get_database()
    db.init_db()
    
    # Optional: Register cleanup function
    @app.teardown_appcontext
    def close_db(error):
        pass
