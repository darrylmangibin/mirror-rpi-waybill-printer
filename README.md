# RPI Waybill Printer

A Flask-based REST API for managing waybill print jobs with SQLAlchemy ORM and automated database migrations.

## Quick Start (2 Steps)

### Step 1: Setup (One-time)

```bash
./setup.sh
```

This will:

- Create a Python virtual environment
- Install all dependencies from `requirements.txt`
- Initialize the database with Flask-Migrate
- Verify everything is configured correctly

### Step 2: Run the API

```bash
./run_api.sh
```

The API will be running at: `http://127.0.0.1:5000`

## Accessing the API

### From Windows (WSL)

Use `http://127.0.0.1:5000` in Postman or your browser.

### Example API Endpoint

```json
POST http://127.0.0.1:5000/api/waybills/prints
Content-Type: application/json

{
  "invoice_number": "INV-12345",
  "waybill_url": "https://example.com/waybill.pdf"
}
```

## Technologies

- **Framework**: Flask
- **ORM**: SQLAlchemy with Flask-SQLAlchemy
- **Database**: SQLite with automated migrations
- **Migrations**: Flask-Migrate (Alembic-based)

## Project Structure

```text
rpi-waybill-printer/
├── setup.sh              # One-time setup script
├── run_api.sh            # Run the API server
├── README.md             # This file
├── .gitignore            # Git exclusions
└── backend/
    ├── app.py            # Flask application
    ├── requirements.txt   # Python dependencies
    ├── models/           # SQLAlchemy models
    │   ├── __init__.py
    │   └── print_job.py
    ├── migrations/       # Database migrations
    ├── routes/           # API routes
    ├── domains/          # Domain logic
    └── venv/             # Virtual environment (created by setup.sh)
```

## Database Migrations

When you modify the PrintJob model, create a new migration:

```bash
cd backend
source venv/bin/activate
flask db migrate -m "description of change"
flask db upgrade
```

View current migration version:

```bash
flask db current
```

## Troubleshooting

### "Virtual environment not found"

Run `./setup.sh` first

### "Database not initialized"

The `run_api.sh` script will automatically initialize it

### Python interpreter not recognized in IDE

1. Press `F1` → "Python: Select Interpreter"
2. Choose the venv: `path_to_project/backend/venv/bin/python`
3. Restart your IDE

### Dependencies import errors

Make sure you're in the virtual environment:

```bash
cd backend
source venv/bin/activate
```

## Development

### Install additional dependencies

```bash
cd backend
source venv/bin/activate
pip install <package_name>
pip freeze > requirements.txt
```

### Verify database setup

```bash
cd backend
source venv/bin/activate
python3 verify_setup.py
```

## References

- [Flask Documentation](https://flask.palletsprojects.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Flask-Migrate Documentation](https://flask-migrate.readthedocs.io/)

## License

Proprietary - RPI Waybill Printer Project
