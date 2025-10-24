# RPI Waybill Printer

A local printing solution using Flask backend and React frontend for Raspberry Pi 5.

## Project Structure

```text
rpi-waybill-printer/
├── app/           # Backend API (Flask)
├── frontend/      # Frontend app (React)
├── requirements.txt  # Python dependencies
├── run.py            # Flask entrypoint
├── run.sh            # Script to start backend server
├── install.sh        # One-time install/setup script
├── dev.sh            # Script for dev server/workflow
└── README.md         # Project docs
```

## Getting Started

### Installation

Run the one-time installation script to set up both backend and frontend:

```bash
./install.sh
```

**What `install.sh` does:**

- **Backend Setup:**
  - Creates Python virtual environment (`venv/`)
  - Installs Flask and all Python dependencies from `requirements.txt`
  - Initializes database migrations
  - Creates necessary directories (`app/instance/`)

- **Frontend Setup:**
  - Checks for Node.js/npm availability
  - Installs all React dependencies from `frontend/package.json`
  - Sets up the complete development environment

- **Verification:**
  - Provides clear status updates with colored output
  - Shows next steps for running the application

**Prerequisites:**

- Python 3.x
- Node.js and npm (will prompt for installation if missing)

### Running the Application

After installation, you can start the services:

```bash
# Start backend only (Flask API on port 5000)
./run.sh

# Start both backend + frontend (development mode)
./dev.sh
```

The `dev.sh` script runs:

- Backend: [http://localhost:5000](http://localhost:5000)
- Frontend: [http://localhost:5173](http://localhost:5173)

## Database Migrations

This project uses Flask-Migrate with Laravel-style commands for database management.

### Available Migration Commands

```bash
# Create a new migration
flask db migrate "Create waybills table"

# Apply pending migrations to database
flask db upgrade

# Rollback the last migration
flask db rollback

# Check current migration status
flask db status

# Create and apply migration in one command
flask db fresh "Add new models"
```

### Migration Workflow

1. **Create Models** - Define your SQLAlchemy models in `app/services/*/models.py`
2. **Import Models** - Make sure models are imported in `app/__init__.py`
3. **Generate Migration** - Run `flask db migrate "Description"`
4. **Apply Migration** - Run `flask db upgrade`

### Example: Creating Your First Migration

```bash
# 1. Create a migration for your models
flask db migrate "Create waybills table"

# 2. Apply the migration to database
flask db upgrade

# 3. Check migration status
flask db status
```

**Note:** Make sure to activate your virtual environment first:

```bash
source venv/bin/activate
export FLASK_APP=run:app
```
