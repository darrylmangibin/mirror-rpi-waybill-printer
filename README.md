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

## Mobile Access via QR Code

Once deployed on your Raspberry Pi, the home page displays a **QR code** that encodes the full API endpoint URL.

### How It Works

1. **Home page loads** and displays the QR code
2. **QR code encodes**: `http://{current-origin}/api/waybills/prints`
3. **Mobile device scans the QR code** on the Raspberry Pi home page
4. **Mobile app receives the endpoint** and can immediately submit waybill print jobs

### Home Page Features

- **QR Code**: Shows the endpoint to scan
- **Endpoint URL**: Displays below QR code for reference
- **Clean Interface**: Simple, intuitive design with Tailwind CSS
- **Mobile-Responsive**: Works on all screen sizes

## Accessing the API

### From Windows (WSL)

Use `http://127.0.0.1:5000` in Postman or your browser.

## Connecting to Raspberry Pi via SSH

To access your Raspberry Pi remotely, use SSH with password authentication:

```bash
ssh roei@raspberrypi.local
```

When prompted, enter your Raspberry Pi password.

### If Hostname Doesn't Resolve

If `raspberrypi.local` doesn't work, find your Pi's IP address and use:

```bash
ssh roei@192.168.1.100
```

Replace `192.168.1.100` with your actual Pi IP address.

### Find Your Pi's IP Address

On the Raspberry Pi itself, run:

```bash
hostname -I
```

This will display your Pi's IP address on the network.

## Connecting to Raspberry Pi over Same Network

Connect directly to the project directory on your Raspberry Pi:

```bash
ssh roei@raspberrypi.local "cd Desktop/rpi-waybill-printer"
```

Then run:

```bash
./setup.sh
./run_api.sh
```

## Deploying to Raspberry Pi

### Step 1: Copy Project to Raspberry Pi

From your development machine, copy the project:

```bash
scp -r ~/inspire-projects/rpi-waybill-printer roei@raspberrypi.local:~/Desktop/
```

### Step 2: Connect via SSH and Navigate

Connect to the Raspberry Pi and navigate to the project:

```bash
ssh roei@raspberrypi.local "cd Desktop/rpi-waybill-printer"
```

### Step 3: Run Setup

Install dependencies:

```bash
./setup.sh
```

### Step 4: Start the API

Run the Waybill Printer API:

```bash
./run_api.sh
```

The API will be running at: `http://raspberrypi.local:5000/`

### Step 5: Access from Mobile

1. On a mobile device connected to the same WiFi
2. Visit: `http://raspberrypi.local:5000/`
3. Scan the QR code to get the full endpoint
4. Start submitting waybill print jobs!

## Example API Endpoint

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
- **QR Code**: qrcode.js library (CDN-based, frontend generation)

## Project Structure

```text
rpi-waybill-printer/
├── setup.sh              # One-time setup script
├── run_api.sh            # Run the API server
├── README.md             # This file
├── .gitignore            # Git exclusions
├── setup/
│   └── HOSTNAME_SETUP.md # mDNS hostname configuration guide
└── backend/
    ├── app.py            # Flask application
    ├── requirements.txt   # Python dependencies
    ├── models/           # SQLAlchemy models
    │   ├── __init__.py
    │   └── print_job.py
    ├── migrations/       # Database migrations
    ├── routes/           # API routes
    ├── templates/        # HTML templates
    │   └── index.html    # Home page with QR code
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

### Update dependencies (when new packages are added)

When new dependencies are added to `requirements.txt` (similar to `composer update`):

```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

This will:
- Install any new packages added to `requirements.txt`
- Update existing packages to match pinned versions
- Keep your virtual environment synchronized

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
