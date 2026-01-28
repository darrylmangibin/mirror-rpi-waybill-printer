# Docker Deployment Guide - RPI Waybill Printer

Complete guide for deploying the RPI Waybill Printer using Docker on Raspberry Pi, Linux, or development machines.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Installation Methods](#installation-methods)
4. [Printer Configuration](#printer-configuration)
5. [Network Configuration](#network-configuration)
6. [Development vs Production](#development-vs-production)
7. [Debugging & Troubleshooting](#debugging--troubleshooting)
8. [Docker Commands Reference](#docker-commands-reference)
9. [Log Analysis](#log-analysis)
10. [Common Issues](#common-issues)

---

## Quick Start

### One-Command Setup (Recommended)

For fresh installations on Raspberry Pi or Linux systems:

```bash
# Production mode (recommended for deployment)
./docker.sh prod --build

# Development mode (for active development)
./docker.sh dev
```

**Note:** You must specify either `prod` or `dev` mode. There is no default mode to prevent accidental misconfiguration.

**What it does automatically:**

1. ✅ Installs Docker & Docker Compose (if not present)
2. ✅ Installs CUPS (if not present) for printer detection
3. ✅ Enables Docker and CUPS services on boot
4. ✅ Detects your network IP address
5. ✅ Discovers USB printers automatically (with sudo/su handling)
6. ✅ Auto-configures printer in CUPS using lpadmin
7. ✅ Configures printer and network settings
8. ✅ Starts Docker containers
9. ✅ Displays QR code for easy mobile access
10. ✅ Starts printer reconnection monitor
11. ✅ Shows live startup logs
12. ✅ Ready to use!

**No manual configuration needed!**

### First Run Example

```
🚀 Starting RPI Waybill Printer with Docker

🐳 Checking Docker installation...
Docker not found. Installing Docker...
✅ Docker installed
✅ Docker Compose installed
✅ Docker service enabled

Detecting local IP address...
✅ Detected IP: 192.168.100.44

🖨️  Detecting Printer Configuration

⚠️  CUPS not installed on host
Would you like to install CUPS for printer detection? (y/n)
> y
Installing CUPS...
✅ CUPS installed

Scanning for printers...
Checking for USB devices...
✅ USB printer(s) detected:
usb://Xprinter/XP-410B?serial=410BBE235170626

⚠️  No printer configured in CUPS yet

Would you like to configure the printer now? (y/n)
> y
Enter printer name (default: XP-410B):
Available USB printers:
 1. usb://Xprinter/XP-410B?serial=410BBE235170626

Select printer number (default: 1):

Configuring printer in CUPS...
Name: XP-410B
URI:  usb://Xprinter/XP-410B?serial=410BBE235170626
✅ Printer configured in CUPS successfully
printer XP-410B is idle.  enabled since Tue 28 Jan 2026
system default destination: XP-410B

Would you like to select a printer driver? (y/n)
> y
1. Search by manufacturer (recommended)
2. Browse generic drivers
3. Enter driver path manually

Select option (1-3):
> 1
Enter manufacturer name (e.g., 'zebra', 'epson', 'hp', 'xprinter'):
> zebra

Searching for 'zebra' drivers...
Found 15 driver(s)

 1. drv:///sample.drv/zebra.ppd
 2. drv:///zebra/ZPL2.ppd
...

Enter driver number:
> 1
✅ Selected driver: drv:///sample.drv/zebra.ppd

Save this configuration? (y/n)
> y

✅ Saved printer configuration to .env.printer
✅ Containers started!

Access the application at:
  Frontend: http://192.168.100.44:5173
  Backend:  http://192.168.100.44:5000
```

---

## Prerequisites

### For Production (Raspberry Pi / Linux)

- **OS**: Ubuntu 20.04+, Raspberry Pi OS, Debian, Fedora
- **Architecture**: ARM64 (Raspberry Pi) or x86_64 (PC)
- **USB Printer** (optional): Thermal label printer
- **Network**: WiFi or Ethernet connection

**No Docker required** - the script installs it automatically!

### For Development (macOS / Windows)

- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Git

### Fedora / Systems Without sudo

If you encounter "sudo not found":

```bash
# Become root
su -

# Install sudo
dnf install sudo          # Fedora/RHEL
apt-get install sudo      # Debian/Ubuntu

# Add your user to sudo/wheel group
usermod -aG wheel yourusername    # Fedora
usermod -aG sudo yourusername     # Ubuntu

# Exit and log out/in
exit
```

---

## Installation Methods

### Method 1: Automatic Setup Script (Recommended)

**Production deployment:**

```bash
git clone <repository-url>
cd rpi-waybill-printer
./docker.sh prod --build
```

**Development with hot-reload:**

```bash
./docker.sh dev
```

**Requirements:**

- Mode selection is **mandatory**: `prod` or `dev`
- Use `--build` flag to rebuild containers

**Mode Differences:**

- `prod` - Production mode (optimized builds, no source mounting, production frontend)
- `dev` - Development mode (hot-reload, source mounted, dev server with Vite HMR)
- `--build` - Force rebuild of containers (required for first run or after dependency changes)

### Method 2: Manual Docker Compose

**Start services:**

```bash
# Production
docker compose -f docker-compose.prod.yml up -d

# Development
docker compose -f docker-compose.dev.yml up -d

# Default
docker compose up -d
```

**Stop services:**

```bash
docker compose -f docker-compose.prod.yml down
```

### Method 3: Fresh Installation Without sudo

```bash
# 1. Become root
su - root

# 2. Navigate to project
cd /path/to/rpi-waybill-printer

# 3. Run as root
./docker.sh prod --build

# 4. After first run, logout and login again
exit
logout
```

---

## Printer Configuration

### Auto-Detection and Configuration (Recommended)

The script automatically handles complete printer setup on fresh Linux systems:

```bash
./docker.sh prod --build
```

**What happens:**

1. **CUPS Installation Check**
   - Detects if CUPS is installed (`lpstat` command)
   - If missing, prompts to install CUPS
   - Installs CUPS via `dnf` (Fedora/RHEL) or `apt-get` (Debian/Ubuntu)
   - Enables and starts CUPS service

2. **USB Printer Detection**
   - Scans for USB printers using `lpinfo -v` (with sudo/su privilege)
   - Shows detected USB printers with full URIs
   - Displays troubleshooting tips if no printers found

3. **CUPS Configuration**
   - Checks if printer already configured in CUPS (`lpstat -p`)
   - If not configured, prompts to configure now
   - Shows numbered list of detected USB printers
   - Prompts for printer name (suggests model name)
   - Runs `lpadmin -p NAME -E -v URI -m DRIVER` to add printer
   - Sets as default printer with `lpadmin -d NAME`
   - Verifies configuration with `lpstat -p -d`

4. **Driver Selection**
   - Prompts to select a printer driver
   - Options: search by manufacturer, browse generic drivers, or enter manually
   - Supports searching CUPS driver database
   - Shows up to 30 matching drivers

5. **Configuration Saved**
   - Saves PRINTER_NAME, PRINTER_URI, PRINTER_DRIVER to `.env.printer`
   - Docker containers load these via `env_file` directive
   - Container startup script configures CUPS inside container

**Configuration saved to:** `.env.printer`

**Example .env.printer:**

```bash
# Printer Configuration - Auto-detected by docker.sh
# Generated at: Tue 28 Jan 2026
export PRINTER_NAME=XP-410B
export PRINTER_URI=usb://Xprinter/XP-410B?serial=410BBE235170626
export PRINTER_DRIVER=drv:///sample.drv/zebra.ppd
```

### Privilege Handling

The script automatically handles privilege escalation for CUPS commands:

- **Always uses sudo/su for CUPS**: Commands like `lpinfo -v` and `lpadmin` always need root access
- **Fallback chain**: Tries `sudo` → `su -c` → root (if already root) → error with instructions
- **Works on systems without sudo**: Handles Fedora and minimal Linux installations
- **Separate from Docker privileges**: Docker privilege flag only for Docker commands

**No printer detected?**

1. Check USB connection and printer power
2. Run manually: `sudo lpinfo -v | grep usb`
3. Check CUPS is running: `systemctl status cups`
4. Try CUPS web interface: `http://localhost:631`

### Manual Configuration

Create `.env.printer` file:

```bash
cat > .env.printer <<EOF
export PRINTER_NAME=XP410B
export PRINTER_URI=usb://Xprinter/XP-410B?serial=410BBE235170626
EOF
```

**Common printer URIs:**

```bash
# XPrinter USB
usb://Xprinter/XP-410B?serial=410BBE235170626

# Zebra USB
usb://Zebra%20Technologies/ZTC%20LP%202844

# Network printer
socket://192.168.1.100:9100

# Parallel port
parallel:/dev/lp0
```

### Find Your Printer URI

**Method 1: Check container logs**

```bash
docker logs rpi-waybill-printer-backend-prod | grep "Available printer URIs"
```

**Method 2: Inside container**

```bash
docker exec -it rpi-waybill-printer-backend-prod bash
lpinfo -v
```

**Method 3: On host (if CUPS installed)**

```bash
# Start CUPS
sudo systemctl start cups

# List printers
lpstat -p -d
lpstat -v

# Discover USB printers
sudo lpinfo -v | grep usb
```

### Reconfigure Printer

```bash
# Delete saved configuration
rm .env.printer

# Run script again - will detect and prompt
./docker.sh prod
```

### Verify Printer Inside Container

```bash
# Enter container
docker exec -it rpi-waybill-printer-backend-prod bash

# Check CUPS is running
ps aux | grep cups

# Check printer status
lpstat -p -d

# List all print jobs
lpstat -o

# Check printer URI
lpstat -v
```

---

## Network Configuration

### Automatic IP Detection

The script automatically detects your network IP and configures:

**Frontend config** (`frontend/.env`):

```bash
VITE_API_URL=http://192.168.100.44:5000
VITE_BASE_URL=http://192.168.100.44:5000
```

This file is **regenerated on every run** to ensure correct IP.

### Manual Network Configuration

Edit `frontend/.env`:

```bash
VITE_API_URL=http://YOUR_IP_HERE:5000
VITE_BASE_URL=http://YOUR_IP_HERE:5000
```

Then restart:

```bash
docker compose -f docker-compose.prod.yml restart
```

### Access Points

After deployment:

- **Frontend**: `http://<your-ip>:5173`
- **Backend API**: `http://<your-ip>:5000`
- **Health Check**: `http://<your-ip>:5000/api/health`
- **CUPS Web Interface**: `http://<your-ip>:631` (inside container)

Access from **any device on your network**!

---

## Development vs Production

### Production Mode

**Features:**

- Optimized builds
- No source code mounted
- Smaller container size
- Production-ready

**Start:**

```bash
./docker.sh prod --build
```

**Or manually:**

```bash
docker compose -f docker-compose.prod.yml up -d
```

### Development Mode

**Features:**

- Hot-reload for backend (Flask)
- Hot-reload for frontend (Vite)
- Source code mounted as volumes
- Debug mode enabled

**Start:**

```bash
./docker.sh dev
```

**Or manually:**

```bash
docker compose -f docker-compose.dev.yml up -d
```

**Hot Reload:**

- Backend: Edit files in `app/` → Flask reloads automatically
- Frontend: Edit files in `frontend/src/` → Browser reloads automatically

---

## Debugging & Troubleshooting

### Check Container Status

```bash
# List running containers
docker ps

# Check specific container
docker ps | grep waybill

# View container resource usage
docker stats
```

### View Logs

**All logs:**

```bash
docker compose -f docker-compose.prod.yml logs -f
```

**Backend logs only:**

```bash
docker logs -f rpi-waybill-printer-backend-prod

# Or with compose
docker compose -f docker-compose.prod.yml logs -f backend
```

**Frontend logs only:**

```bash
docker logs -f rpi-waybill-printer-frontend-prod
```

**Filter logs:**

```bash
# Print-related logs
docker logs rpi-waybill-printer-backend-prod | grep -i "print\|cups\|job"

# Error logs only
docker logs rpi-waybill-printer-backend-prod | grep -i "error\|fail"

# CUPS logs
docker exec rpi-waybill-printer-backend-prod tail -50 /var/log/cups/error_log
```

### CUPS Debugging

**Check CUPS status inside container:**

```bash
# Enter container
docker exec -it rpi-waybill-printer-backend-prod bash

# Check CUPS process
ps aux | grep cupsd

# Check CUPS status
lpstat -r

# List printers
lpstat -p -d

# View print queue
lpstat -o

# Check CUPS error log
tail -50 /var/log/cups/error_log

# Check CUPS access log
tail -50 /var/log/cups/access_log
```

**CUPS Web Interface:**

```bash
# Forward port to access from browser
# Access: http://localhost:631
docker exec -it rpi-waybill-printer-backend-prod bash
```

Then open browser to: `http://<raspberry-pi-ip>:631`

**Common CUPS errors:**

```bash
# "Unable to communicate with avahi-daemon"
# This is normal in Docker - avahi not needed for USB printers

# "Scheduler is not running"
# CUPS didn't start properly
docker restart rpi-waybill-printer-backend-prod

# "No destinations added"
# Printer not configured - check PRINTER_NAME/PRINTER_URI env vars
docker exec rpi-waybill-printer-backend-prod env | grep PRINTER
```

### Application Logs

**Inside container:**

```bash
docker exec -it rpi-waybill-printer-backend-prod bash

# View application logs
tail -100 /app/app/logs/app.log

# Follow logs in real-time
tail -f /app/app/logs/app.log

# Filter for specific issues
grep -i "error" /app/app/logs/app.log
grep -i "cups\|print" /app/app/logs/app.log
```

**From host:**

```bash
# Application logs are persisted in mounted volume
tail -f app/logs/app.log
```

### USB Printer Access

**Check USB devices:**

```bash
# On host
lsusb

# Should show printer:
# Bus 001 Device 003: ID 0fe6:811e ICS Advent XP-410B
```

**Check USB passthrough to container:**

```bash
# Verify devices are mounted
docker exec rpi-waybill-printer-backend-prod ls -la /dev/bus/usb/

# Check if container is privileged
docker inspect rpi-waybill-printer-backend-prod | grep -i privileged
```

**Verify USB permissions:**

```bash
# On host
ls -la /dev/bus/usb/*/*

# All should be readable/writable
# If not, add user to 'lp' group:
sudo usermod -aG lp $USER
```

### Database Debugging

```bash
# Enter container
docker exec -it rpi-waybill-printer-backend-prod bash

# Access database
cd /app
python3 << 'EOF'
from app import create_app
from app.database import db
from app.services.waybills.models.WaybillPrint import WaybillPrint

app, _ = create_app()
with app.app_context():
    # Check recent waybills
    waybills = WaybillPrint.query.order_by(WaybillPrint.created_at.desc()).limit(10).all()
    for w in waybills:
        print(f"ID: {w.id}, Invoice: {w.invoice_number}, Status: {w.status}, Print Status: {w.print_status}, CUPS Job: {w.cups_job_id}")
EOF
```

### Network Debugging

```bash
# Test backend from inside container
docker exec rpi-waybill-printer-backend-prod curl http://localhost:5000/api/health

# Test from another container
docker exec rpi-waybill-printer-frontend-prod curl http://backend:5000/api/health

# Check if ports are exposed
docker port rpi-waybill-printer-backend-prod
```

---

## Docker Commands Reference

### Container Management

```bash
# Start containers
docker compose -f docker-compose.prod.yml up -d

# Stop containers
docker compose -f docker-compose.prod.yml down

# Restart containers
docker compose -f docker-compose.prod.yml restart

# Restart specific service
docker compose -f docker-compose.prod.yml restart backend

# Rebuild and start
docker compose -f docker-compose.prod.yml up -d --build

# Force rebuild (no cache)
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
```

### Logs & Monitoring

```bash
# View logs (all services)
docker compose -f docker-compose.prod.yml logs -f

# View logs (specific service)
docker compose -f docker-compose.prod.yml logs -f backend

# Last 100 lines
docker compose -f docker-compose.prod.yml logs --tail=100

# Container stats
docker stats

# Container processes
docker top rpi-waybill-printer-backend-prod
```

### Execute Commands

```bash
# Interactive shell
docker exec -it rpi-waybill-printer-backend-prod bash

# Run single command
docker exec rpi-waybill-printer-backend-prod lpstat -p -d

# Run as root
docker exec -u root -it rpi-waybill-printer-backend-prod bash
```

### Volume & Data Management

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect rpi-waybill-printer_backend-data

# Remove all volumes (WARNING: deletes data)
docker compose -f docker-compose.prod.yml down -v

# Backup database
docker exec rpi-waybill-printer-backend-prod \
  cp /app/app/instance/fusion_printer.db /app/backup.db
docker cp rpi-waybill-printer-backend-prod:/app/backup.db ./backup.db
```

### Cleanup

```bash
# Remove containers only
docker compose -f docker-compose.prod.yml down

# Remove containers and volumes
docker compose -f docker-compose.prod.yml down -v

# Remove unused images
docker image prune -a

# Remove everything (nuclear option)
docker system prune -a --volumes
```

---

## Log Analysis

### Check Application Startup

```bash
docker logs rpi-waybill-printer-backend-prod | head -50
```

Look for:

```
Starting application in production mode...
✅ CUPS service started
✅ CUPS configured and restarted
Available printer URIs:
```

### Monitor Print Jobs

```bash
docker logs -f rpi-waybill-printer-backend-prod | grep -i "print\|cups\|job"
```

Look for:

```
Print job submitted to CUPS - JobID: 123
Waybill status updated to 'printing'
```

### Check Download Issues

```bash
docker logs rpi-waybill-printer-backend-prod | grep -i "download"
```

Look for:

```
[DOWNLOAD COMPLETE] Invoice: 1234567890
Download task queued for waybill ID: 1
```

### CUPS Error Patterns

```bash
docker exec rpi-waybill-printer-backend-prod tail -100 /var/log/cups/error_log
```

**Common warnings (safe to ignore):**

```
W [Date] Duplicate <Location /> on line 136
E [Date] Unable to communicate with avahi-daemon: Daemon not running
```

**Real errors to investigate:**

```
E [Date] Unable to open device "usb://..."
E [Date] Printer not responding
```

---

## Common Issues

### 1. "docker command not found"

**Cause:** Docker just installed, session not refreshed

**Solution:**

```bash
# Option 1: Logout and login
logout

# Option 2: Use newgrp (in same session)
newgrp docker
./docker.sh prod --build

# Option 3: Run with sudo temporarily
sudo ./docker.sh prod --build
```

### 2. "sudo not found" (Fedora)

**Solution:**

```bash
su -
dnf install sudo
usermod -aG wheel yourusername
exit
logout
```

### 3. No USB Printers Detected

**Symptoms:**

```bash
⚠️  No USB printers detected by CUPS
```

**Causes and Solutions:**

1. **CUPS not installed**

```bash
# Check if CUPS is installed
command -v lpstat

# If not found, the script will prompt to install
# Or install manually:
sudo apt-get install cups cups-client  # Debian/Ubuntu
sudo dnf install cups cups-client      # Fedora/RHEL
sudo systemctl enable cups && sudo systemctl start cups
```

2. **lpinfo needs privilege**

The script automatically uses `sudo`/`su` for `lpinfo -v`, but verify:

```bash
# Run manually to test
sudo lpinfo -v | grep usb

# If you see USB printers here but script doesn't detect them,
# delete .env.printer and run again:
rm .env.printer
./docker.sh prod --build
```

3. **Printer not powered on or connected**

```bash
# Check USB connection
lsusb

# Should show your printer
# Example: Bus 001 Device 003: ID 0fe6:811e ICS Advent XP-410B
```

4. **CUPS not running**

```bash
# Check CUPS service
sudo systemctl status cups

# Start CUPS if stopped
sudo systemctl start cups
```

5. **Empty .env.printer file exists**

```bash
# The script checks if printer is properly configured
# If .env.printer exists but is empty or missing variables, it will reconfigure

# To force reconfiguration:
rm .env.printer
./docker.sh prod --build
```

**Manual verification:**

```bash
# Run these commands to debug:
sudo lpinfo -v                    # List all devices
sudo lpinfo -v | grep usb         # USB printers only
lpstat -p -d                      # Configured printers
lpstat -v                         # Printer URIs
```

### 3. No CUPS Job ID / Print Not Working

### 4. "lpadmin: Bad device-uri" or "Printer not added"

**Symptoms:**

```bash
❌ Failed to configure printer in CUPS
lpadmin: Bad device-uri "usb://..."
```

**Causes and Solutions:**

1. **lpadmin needs privilege**

The script always uses `sudo`/`su` for `lpadmin` commands. If it still fails:

```bash
# Verify you can run lpadmin manually
sudo lpadmin -p TestPrinter -E -v usb://your/printer/uri -m drv:///sample.drv/zebra.ppd

# If successful, delete .env.printer and run script again
rm .env.printer
./docker.sh prod --build
```

2. **Invalid USB URI format**

```bash
# Check the URI format from lpinfo
sudo lpinfo -v | grep usb

# Should be like: usb://Manufacturer/Model?serial=123456
# NOT: usb:// (missing parts)
```

3. **Printer already exists in CUPS**

```bash
# Remove existing printer first
sudo lpadmin -x PrinterName

# Then run script again
./docker.sh prod --build
```

### 5. No CUPS Job ID / Print Not Working

1. **CUPS not running inside container**

```bash
docker exec rpi-waybill-printer-backend-prod ps aux | grep cupsd
# If not running:
docker restart rpi-waybill-printer-backend-prod
```

2. **Printer not configured**

```bash
docker exec rpi-waybill-printer-backend-prod env | grep PRINTER
# Should show PRINTER_NAME and PRINTER_URI
```

3. **USB device not accessible**

```bash
# Check on host
lsusb

# Check in docker-compose file
devices:
  - /dev/bus/usb:/dev/bus/usb
```

4. **Download failed - no file to print**

```bash
# Check logs for download errors
docker logs rpi-waybill-printer-backend-prod | grep "DOWNLOAD ERROR"
```

### 6. "Worker fatal error: 'tuple' object has no attribute 'app_context'"

**Cause:** Background workers not unpacking `create_app()` tuple correctly

**Fixed in latest version** - ensure you have the latest code

**Verify fix:**

```bash
grep "app, _ = create_app()" app/services/waybills/jobs/download_waybill_job.py
```

Should show: `app, _ = create_app()` (not `app = create_app()`)

### 7. Frontend Can't Connect to Backend

**Check backend health:**

```bash
curl http://<your-ip>:5000/api/health
```

**Check frontend .env:**

```bash
cat frontend/.env
```

Should contain your correct IP address.

**Regenerate config:**

```bash
./docker.sh prod
```

### 8. Port Already in Use

```bash
# Error: bind: address already in use
```

**Solution:**

```bash
# Find process using port 5000
sudo lsof -i :5000
sudo netstat -tulpn | grep 5000

# Kill the process
sudo kill -9 <PID>

# Or change ports in docker-compose.yml
ports:
  - "5001:5000"  # Use different host port
```

### 9. Permission Denied on USB Device

```bash
# Add user to lp and dialout groups
sudo usermod -aG lp,dialout $USER

# Restart Docker
sudo systemctl restart docker

# Rebuild containers
./docker.sh prod --build
```

### 10. Duplicate CUPS Configuration Warnings

```bash
W [Date] Duplicate <Location /> on line 136
```

**Cause:** Fixed in latest `start.sh`

**Verify fix:**

```bash
grep "RPI-Waybill-Printer CUPS Config" start.sh
```

Should exist - this prevents duplicate configs.

### 11. Container Exits Immediately

```bash
# Check exit code and reason
docker ps -a | grep waybill

# View last logs
docker logs rpi-waybill-printer-backend-prod
```

Common causes:

- Syntax error in Python code
- Missing environment variables
- Port conflict

---

## Files Generated

### `.env.printer`

**Location:** Project root  
**Purpose:** Stores printer configuration  
**Persistence:** Created once, reused forever

```bash
export PRINTER_NAME=XP410B
export PRINTER_URI=usb://Xprinter/XP-410B?serial=410BBE235170626
```

### `frontend/.env`

**Location:** `frontend/` directory  
**Purpose:** Frontend API URL configuration  
**Persistence:** Regenerated on every run

```bash
VITE_API_URL=http://192.168.100.44:5000
VITE_BASE_URL=http://192.168.100.44:5000
```

### Persistent Data

**Database:** `app/instance/fusion_printer.db`  
**Logs:** `app/logs/app.log`  
**Storage:** `app/storage/` (downloaded waybills)

These are mounted as volumes and persist across container restarts.

---

## Summary

### Quick Commands

```bash
# Fresh install
./docker.sh prod --build

# Start
./docker.sh prod

# Logs
docker logs -f rpi-waybill-printer-backend-prod

# Shell
docker exec -it rpi-waybill-printer-backend-prod bash

# Restart
docker restart rpi-waybill-printer-backend-prod

# Stop
docker compose -f docker-compose.prod.yml down
```

### What Happens Automatically

✅ Docker installation  
✅ IP detection  
✅ Printer discovery  
✅ Configuration generation  
✅ CUPS setup inside container  
✅ USB device passthrough  
✅ Network configuration  
✅ Container startup

### What You Need to Do

1. Clone the repo
2. Run the script
3. Confirm printer (if found)
4. Access the app!

That's it! 🚀

---

## Recent Improvements

### January 2026 Updates

**Mandatory Mode Selection**

- `docker.sh` now requires either `dev` or `prod` mode to be specified
- Prevents accidental deployment with incorrect configuration
- Clear usage instructions displayed when mode is missing

```bash
# ✅ Correct usage
./docker.sh prod --build
./docker.sh dev

# ❌ No longer works (no default mode)
./docker.sh
```

**QR Code Display**

- Terminal QR code displayed after successful setup (like React Native Expo)
- Enables easy mobile access - just scan and connect
- Multiple fallback methods (Python qrcode → qrencode → styled URL)
- Auto-cleanup with no leftover temp files
- Works in both prod and dev modes

**Printer Auto-Reconnection**

- Background monitor daemon (`printer-monitor.sh`) automatically detects USB disconnections
- Auto-restores printer configuration when reconnected (no manual intervention needed)
- Monitors every 15 seconds without impacting performance
- Logs all reconnection events for debugging
- Works transparently in background

**Enhanced Exit Code Validation**

- Separate exit code tracking for `lpadmin` add printer vs set default operations
- Prevents "default printer not set on first run" issue
- Proper error reporting for each step of printer configuration
- More reliable CUPS configuration process

**Live Startup Logs**

- Real-time log display during `docker.sh` execution
- 10-second timeout window to view CUPS configuration and printer setup
- Better visibility into what's happening during initialization
- Helps debug startup issues immediately

**Privilege Handling Improvements**

- CUPS commands always use privilege escalation (sudo/su) regardless of Docker state
- Fixed USB printer detection (`lpinfo -v` always runs with privilege)
- Better handling of systems without sudo (automatic su -c fallback)
- More reliable on fresh Linux installations

**Fresh Linux Support**

- Zero-config setup on brand new Linux systems
- Auto-detects missing CUPS and offers installation
- Distribution-aware (Fedora/RHEL/Debian/Ubuntu support)
- Enables CUPS and Docker services on boot automatically

**What's Automated:**

1. ✅ Docker & Docker Compose installation
2. ✅ CUPS installation and service enablement
3. ✅ USB printer detection with proper privileges
4. ✅ Printer auto-configuration in CUPS via lpadmin
5. ✅ Network IP detection
6. ✅ Environment file generation
7. ✅ Container startup and health monitoring
8. ✅ QR code display for easy access
9. ✅ Background printer reconnection monitoring

**Configuration Files:**

- `.env.printer` - Stores PRINTER_NAME, PRINTER_URI, PRINTER_DRIVER
- `frontend/.env` - Auto-generated with detected IP for VITE_API_URL and VITE_BASE_URL
- `printer-monitor.sh` - Background daemon for USB reconnection (inside container)
- `generate-qr.sh` - QR code generator with multiple fallback methods

**Key Features:**

- **No manual steps required** - fully automated setup from fresh system to running application
- **Mobile-friendly** - QR code for instant access from phones
- **Resilient** - automatic reconnection when printer disconnects/reconnects
- **Developer-friendly** - real-time logs and clear error messages
- **Production-ready** - proper exit code validation and error handling

---

## Support

**Check logs first:**

```bash
docker logs rpi-waybill-printer-backend-prod | tail -100
```

**Common log locations:**

- Application: `/app/app/logs/app.log` (inside container)
- CUPS: `/var/log/cups/error_log` (inside container)
- Docker: `docker logs <container-name>`
- Printer Monitor: `docker logs -f <container-name> | grep "PRINTER MONITOR"`

**Need help?** Include:

1. Docker logs output
2. CUPS error log
3. Output of `docker ps -a`
4. Output of `lsusb` (if printer issue)
5. Contents of `.env.printer` file
