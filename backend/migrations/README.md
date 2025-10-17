# Database Migrations Guide

## 📚 How Alembic Tracks Migrations

Alembic uses a **migration tracking system** to ensure migrations are applied in the correct order, exactly once. Here's how it works:

## Migration Tracking Mechanism

### Step 1: Revision IDs

- Each migration file has a **unique revision ID** (e.g., `e9d032604bab`)
- This ID is **independent of the filename** - Alembic tracks by revision, not filename
- Enables safe file renaming and prevents conflicts

### Step 2: Revision Chain

- Each migration specifies its `down_revision` (parent migration)
- Alembic builds a **linear chain** of migrations
- Ensures migrations run in chronological order

```text
Initial Migration
    ↓ (down_revision = None)
Migration 2
    ↓ (down_revision = 'migration_1_id')
Migration 3
    ↓ (down_revision = 'migration_2_id')
```

### Step 3: Tracking Database

- Alembic creates `alembic_version` table in the database
- Stores the **current revision ID** (latest applied migration)
- Prevents re-applying migrations
- Enables safe downgrades

```sql
CREATE TABLE alembic_version (
    version_num VARCHAR(32) NOT NULL,
    PRIMARY KEY (version_num)
);

-- After running migrations
INSERT INTO alembic_version VALUES ('e9d032604bab');
INSERT INTO alembic_version VALUES ('migration_2_id');
```

---

## 🛠️ Creating Migrations

### Method 1: Auto-Generate from Model Changes (Recommended)

```bash
# From backend directory
flask db migrate -m "Add new feature"
```

**What it does:**

1. Compares current models with database schema
2. Generates migration file with changes
3. Places in `migrations/versions/`
4. Assigns new revision ID automatically

**Example output:**

```text
INFO  [alembic.runtime.migration] Context impl SQLiteImpl.
INFO  [alembic.ddl.impl] Detect collection of events from Target.MetaData.
Generating /home/roei/inspire-projects/rpi-waybill-printer/backend/migrations/versions/abc123def456_add_new_feature.py
```

### Method 2: Manual Migration Script

```bash
# Create empty migration
flask db revision -m "Manual description"
```

Then edit the generated file with `upgrade()` and `downgrade()` functions.

### Method 3: Custom SQL Migration

```python
# In your migration file
def upgrade():
    op.execute("CREATE INDEX idx_custom ON table(column)")

def downgrade():
    op.execute("DROP INDEX idx_custom")
```

---

## 📋 Our Current Migration Chain

```text
e9d032604bab_create_waybill_print_jobs_table.py (Initial)
    └─ Creates table with all fields:
       - id (Primary Key)
       - tenant_id (Tenant Identification)
       - invoice_number
       - waybill_url
       - status
       - created_at, updated_at
       - file_path, file_size
       - download_started_at, download_completed_at
       - error_message
       - Constraints: UNIQUE(tenant_id, invoice_number, waybill_url)
       - Indexes: tenant_id, invoice_number, status
```

---

## ⚡ Common Commands

### View Migration Status

```bash
# See applied migrations
flask db current

# See migration history
flask db history
```

### Apply Migrations

```bash
# Apply all pending migrations
flask db upgrade

# Apply specific migration
flask db upgrade abc123def456
```

### Revert Migrations

```bash
# Revert to previous migration
flask db downgrade

# Revert all the way
flask db downgrade base

# Revert to specific migration
flask db downgrade abc123def456
```

---

## 🔧 Development Workflow

### Fresh Database Setup

```bash
# 1. Delete old database
rm backend/instance/raspberry_pi.db

# 2. Apply migrations
flask db upgrade

# 3. Database is ready with latest schema
```

### Adding New Feature

```bash
# 1. Update model in domains/
# 2. Generate migration
flask db migrate -m "Add feature description"

# 3. Review generated migration file (auto-generated usually works)
# 4. Apply migration
flask db upgrade

# 5. Test changes
```

### Fix Migration

```bash
# If you made a mistake before pushing:

# 1. Revert migration
flask db downgrade

# 2. Delete the migration file
rm backend/migrations/versions/bad_migration.py

# 3. Fix your model
# 4. Generate correct migration
flask db migrate -m "Correct description"

# 5. Apply
flask db upgrade
```

---

## 📝 Migration File Structure

```python
"""Description of what this migration does

Revision ID: abc123def456      # Unique identifier (auto-generated)
Revises: xyz789                # Parent migration ID (auto-chain)
Create Date: 2025-10-17 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = 'abc123def456'
down_revision = 'xyz789'
branch_labels = None
depends_on = None


def upgrade():
    """Apply the migration"""
    # Your schema changes here
    op.add_column('table_name', sa.Column('new_column', sa.String(255)))


def downgrade():
    """Revert the migration"""
    # Reverse the changes
    op.drop_column('table_name', 'new_column')
```

---

## ⚠️ Best Practices

### DO

- ✅ Always create migrations when schema changes
- ✅ Write descriptive migration names: `add_tenant_id_field`
- ✅ Test migrations on development database first
- ✅ Keep migrations small and focused
- ✅ Review auto-generated migrations before applying

### DON'T

- ❌ Manually edit database (use migrations instead)
- ❌ Modify applied migrations (create new ones)
- ❌ Skip migrations in development
- ❌ Share uncommitted migrations between branches

---

## 🔄 Alembic Configuration

Configuration is in `alembic.ini` and `env.py`. Key settings:

```ini
# alembic.ini
sqlalchemy.url = driver://user:password@localhost/dbname
```

```python
# env.py handles migration execution and targets
```

---

## 📚 Resources

- [Alembic Docs](https://alembic.sqlalchemy.org)
- [Flask-Migrate Docs](https://flask-migrate.readthedocs.io)
- [SQLAlchemy Docs](https://docs.sqlalchemy.org)
