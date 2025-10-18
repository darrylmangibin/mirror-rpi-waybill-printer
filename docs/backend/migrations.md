# Database Migrations

This project uses **Flask-Migrate** (based on Alembic) for database schema management.

## Setup

First, activate the virtual environment:

```bash
cd backend
source venv/bin/activate
```

## Common Commands

### Run all pending migrations

```bash
flask db upgrade
```

Applies all migrations that haven't been executed yet to the database.

### Rollback the last migration

```bash
flask db downgrade
```

Reverts the most recent migration.

### Create a new migration

When you modify SQLAlchemy models, create a migration:

```bash
flask db migrate -m "description of change"
flask db upgrade
```

Example:

```bash
flask db migrate -m "Add download_completed_at field"
flask db upgrade
```

### View current migration version

```bash
flask db current
```

Shows the current migration revision applied to the database.

### View migration history

```bash
flask db history
```

Lists all migrations in chronological order.

### Show SQL without executing

```bash
flask db upgrade --sql
```

Preview the SQL changes before applying migrations.

## Migration Files Location

All migrations are stored in:

```
backend/migrations/versions/
```

Migration files follow the pattern:

```
REVISION_ID_description.py
```

## Current Migrations

The project includes the following migration:

1. `b6fda062bdbf` - Create waybill_print_jobs table
   - Tenant identification (tenant_id)
   - Core fields (invoice_number, waybill_url)
   - Status tracking
   - File tracking (file_path, file_size, download_started_at, download_completed_at)
   - Error handling (error_message)
   - Metadata storage (meta_data as JSON)
   - Constraints: UNIQUE(tenant_id, invoice_number, waybill_url)

## Command Reference

| Task | Command |
|------|---------|
| Run pending migrations | `flask db upgrade` |
| Rollback last migration | `flask db downgrade` |
| Create migration | `flask db migrate -m "description"` |
| View current version | `flask db current` |
| View migration history | `flask db history` |
| Show SQL (no execute) | `flask db upgrade --sql` |

## Automatic Migrations

Migrations are automatically applied in these cases:

- During `./setup.sh` initial setup
- During normal app startup via Flask-SQLAlchemy initialization

## Development Workflow

1. **Modify your model** in `backend/models/print_job.py`
2. **Create a migration** with `flask db migrate -m "Your description"`
3. **Review the migration file** in `backend/migrations/versions/`
4. **Apply it** with `flask db upgrade`
5. **Test your changes** with the app running

## Troubleshooting

### Migrations out of sync

If migrations don't match your models, regenerate:

```bash
flask db stamp head
flask db migrate -m "Fix schema"
flask db upgrade
```

### Need to undo everything

Reset to a clean state:

```bash
flask db downgrade base
```
