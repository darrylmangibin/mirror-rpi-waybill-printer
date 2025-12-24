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

This guide will walk you through setting up the RPI Waybill Printer. There are two modes of installation: Online and Offline.

### Preparation for installation

To prepare `install.sh` we need to enter this on the terminal. Then bash the `install.sh` with sudo. Make sure you are on the rpi-waybill-printer root.

``` text
chmod +x install.sh
sudo ./install.sh
```

### Steps of installation

You will be prompted by what mode of installation offline or online.

``` text
Please select installation mode:
  1) Online Installation (requires internet access to download packages)
  2) Offline Installation (requires pre-downloaded .deb packages in a 'debs/' folder)
Enter your choice (1 or 2): 1
```

#### Chronological order of installation

Checks the library if installed, if not, installs it.

1. `python3`

2. `python3-pip`

3. `python3-venv`

### Running the Application

You have two options for running the application:

#### Option 1: Manual Start (Development Mode)

```bash
# Start backend only (Flask API on port 5000)
./run.sh

# Start both backend + frontend (development mode)
./dev.sh
```

The `dev.sh` script runs:

- Backend: [http://localhost:5000](http://localhost:5000)
- Frontend: [http://localhost:5173](http://localhost:5173)

#### Option 2: Auto-Start with Systemd (Production)

To run the services automatically on system boot:

```bash
# First-time setup: Install and enable systemd services
sudo ./setup-systemd.sh

# Then you can use systemctl to manage services
systemctl status rpi-waybill-printer-backend.service
systemctl status rpi-waybill-printer-frontend.service
```

**Note:** After running `setup-systemd.sh`, the services will auto-start on boot and you can access them at:

- Backend: http://[pi-ip]:5000
- Frontend: http://[pi-ip]:5173

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

## Checking Service Logs

The application uses two logging systems:

### 1. Application Logs (app/logs/app.log)

The Flask application writes detailed logs to `app/logs/app.log`:

```bash
# View application logs in real-time
tail -f app/logs/app.log

# View last 100 lines of application logs
tail -n 100 app/logs/app.log

# Search for specific errors in logs
grep "ERROR" app/logs/app.log

# Search for CRON job logs
grep "MONITOR CRON" app/logs/app.log

# Search for CUPS-related logs
grep "CUPS" app/logs/app.log

# Count log entries by level
grep "INFO" app/logs/app.log | wc -l
grep "ERROR" app/logs/app.log | wc -l

# View logs from the last 10 minutes (Linux only)
find app/logs/app.log -mmin -10 -exec tail -n 50 {} \;
```

**Log file location:** `/home/pi/rpi-waybill-printer/app/logs/app.log`

**Log levels:**

- **DEBUG**: Detailed diagnostic information
- **INFO**: General information (startup messages, job completions)
- **WARNING**: Warning messages
- **ERROR**: Error messages and failures

### 2. Systemd Journal Logs

When running as systemd services, both backend and frontend also log to systemd journal. Use `journalctl` to view:

#### Quick Reference - Most Used Commands

```bash
# Watch backend logs in real-time (MOST USEFUL)
journalctl -u rpi-waybill-printer-backend.service -f

# Watch frontend logs in real-time
journalctl -u rpi-waybill-printer-frontend.service -f

# View last 50 lines of backend logs
journalctl -u rpi-waybill-printer-backend.service -n 50

# View last 50 lines of frontend logs
journalctl -u rpi-waybill-printer-frontend.service -n 50
```

#### Detailed Log Viewing Options

##### View Backend Service Logs

```bash
# View last 50 lines of backend logs
journalctl -u rpi-waybill-printer-backend.service -n 50

# Follow backend logs in real-time
journalctl -u rpi-waybill-printer-backend.service -f

# View logs from the last hour
journalctl -u rpi-waybill-printer-backend.service --since "1 hour ago"

# View logs with timestamps and priority levels
journalctl -u rpi-waybill-printer-backend.service -o short-precise
```

##### View Frontend Service Logs

```bash
# View last 50 lines of frontend logs
journalctl -u rpi-waybill-printer-frontend.service -n 50

# Follow frontend logs in real-time
journalctl -u rpi-waybill-printer-frontend.service -f

# View logs from the last hour
journalctl -u rpi-waybill-printer-frontend.service --since "1 hour ago"
```

##### View Both Services Together

```bash
# View all application logs (both services) in real-time
journalctl -u rpi-waybill-printer-backend.service -u rpi-waybill-printer-frontend.service -f

# View all logs from the last 30 minutes
journalctl -u rpi-waybill-printer-backend.service -u rpi-waybill-printer-frontend.service --since "30 minutes ago"
```

### Service Status and Control

```bash
# Check service status
systemctl status rpi-waybill-printer-backend.service
systemctl status rpi-waybill-printer-frontend.service

# Restart a service
systemctl restart rpi-waybill-printer-backend.service
systemctl restart rpi-waybill-printer-frontend.service

# Stop a service
systemctl stop rpi-waybill-printer-backend.service
systemctl stop rpi-waybill-printer-frontend.service

# Start a service
systemctl start rpi-waybill-printer-backend.service
systemctl start rpi-waybill-printer-frontend.service

# View service is enabled
systemctl is-enabled rpi-waybill-printer-backend.service
systemctl is-enabled rpi-waybill-printer-frontend.service
```

### Clearing and Managing Logs

#### Managing Application Logs (app/logs/app.log)

```bash
# View current size of application log
du -h app/logs/app.log

# Clear application log (archive first if needed)
> app/logs/app.log

# Or backup then clear
cp app/logs/app.log app/logs/app.log.backup
> app/logs/app.log

# Rotate logs (keep backup, start fresh)
mv app/logs/app.log app/logs/app.log.$(date +%Y%m%d_%H%M%S)
```

#### Managing Systemd Journal Logs

To maintain disk space and keep logs manageable on the RPi:

```bash
# Show how much space journal is using
sudo journalctl --disk-usage

# View logs from the last 7 days
journalctl --since "7 days ago"

# Clear all systemd journal logs from more than 1 day ago
sudo journalctl --vacuum-time=1d

# Completely clear all logs (CAUTION: deletes everything)
sudo journalctl --vacuum-size=0

# Clear logs for specific service only
sudo journalctl -u rpi-waybill-printer-backend.service --vacuum-time=1d

# Limit journal to max size (e.g., 100MB)
sudo journalctl --vacuum-size=100M
```

**Recommended maintenance routine:**

```bash
# Weekly: Keep only last 7 days of systemd logs
sudo journalctl --vacuum-time=7d

# Or: Keep systemd logs under 500MB
sudo journalctl --vacuum-size=500M

# Clear application log weekly (keep one backup)
cd /home/pi/rpi-waybill-printer
mv app/logs/app.log app/logs/app.log.backup
touch app/logs/app.log

# Check disk usage after cleanup
du -h app/logs/
sudo journalctl --disk-usage
```
