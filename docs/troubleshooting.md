# Troubleshooting Guide

Common issues and their solutions.

## Setup Issues

### Virtual environment not found

**Error:** `command not found: source` or `venv directory not found`

**Solution:**

Run the setup script first:

```bash
./setup.sh
```

This creates the virtual environment and installs all dependencies.

---

### Setup script fails

**Error:** `Permission denied` when running `./setup.sh`

**Solution:**

Make the script executable:

```bash
chmod +x setup.sh
chmod +x run_api.sh
./setup.sh
```

---

## Python & Dependencies

### Python interpreter not recognized in IDE

**Error:** IDE shows "Python not found" or import errors

**Solution:**

1. Press `F1` → "Python: Select Interpreter"
2. Choose the venv: `path_to_project/backend/venv/bin/python`
3. Restart your IDE

---

### Dependencies import errors

**Error:** `ModuleNotFoundError: No module named 'flask'`

**Solution:**

Make sure you're in the virtual environment:

```bash
cd backend
source venv/bin/activate
```

Then install/update dependencies:

```bash
pip install -r requirements.txt
```

---

### Pip install fails on Raspberry Pi

**Error:** `externally-managed-environment` or permission errors

**Solution:**

Use the venv instead of system Python:

```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

Never use `sudo pip` - always use the virtual environment.

---

## Database Issues

### Database not initialized

**Error:** `OperationalError: no such table: waybill_print_jobs`

**Solution:**

Run the migrations:

```bash
cd backend
source venv/bin/activate
flask db upgrade
```

The `run_api.sh` script should handle this automatically, but if it fails, run the command manually.

---

### Migrations out of sync

**Error:** `MigrationError` or `RuntimeError` during startup

**Solution:**

Reset to the current migration:

```bash
cd backend
source venv/bin/activate
flask db stamp head
flask db migrate -m "Sync schema"
flask db upgrade
```

---

### Database locked error

**Error:** `database is locked` when running migrations or app

**Solution:**

The SQLite database might be in use by another process.

1. Stop any running instances of the app
2. Wait a few seconds
3. Try again

For Raspberry Pi, ensure only one instance of `run_api.sh` is running:

```bash
ps aux | grep run_api.sh
# Kill any extra processes if needed
```

---

## Runtime Issues

### API won't start

**Error:** `Address already in use` or `Port 5000 is in use`

**Solution:**

Kill the process using port 5000:

```bash
# Find process on port 5000
lsof -i :5000

# Kill it (replace PID with the process ID)
kill -9 <PID>

# Start the API again
./run_api.sh
```

Or use a different port:

```bash
PORT=5001 ./run_api.sh
```

---

### API crashes on startup

**Error:** `ImportError` or `SyntaxError` when running `./run_api.sh`

**Solution:**

1. Check for syntax errors in your modified files
2. Verify all dependencies are installed:
   ```bash
   cd backend
   source venv/bin/activate
   pip install -r requirements.txt
   ```
3. Check the logs for detailed error messages:
   ```bash
   tail -f backend/storage/logs/$(date +%m_%d_%Y).log
   ```

---

## Network & Access Issues

### Cannot connect to API from mobile

**Error:** `Connection refused` or timeout when accessing from another device

**Solution:**

1. Ensure both devices are on the same WiFi network
2. Check Raspberry Pi's IP address:
   ```bash
   hostname -I
   ```
3. Use the IP address instead of `raspberrypi.local`:
   ```
   http://192.168.1.100:5000
   ```
4. Make sure the firewall allows port 5000

---

### QR code won't scan

**Error:** QR code generated but won't scan or leads to wrong URL

**Solution:**

1. Check the QR code endpoint is accessible:
   ```bash
   curl http://127.0.0.1:5000/api/qrcode -o test.png
   ```
2. Verify hostname resolution:
   ```bash
   curl http://127.0.0.1:5000/api/hostname
   ```
3. Try regenerating the QR code by refreshing the page

---

### mDNS hostname not resolving

**Error:** `raspberrypi.local` doesn't work, but IP address works

**Solution:**

1. Check if mDNS is configured properly on Raspberry Pi
2. Use the IP address instead:
   ```bash
   ssh roei@192.168.1.100
   ```
3. See `/setup/HOSTNAME_SETUP.md` for mDNS configuration

---

## Log Issues

### Logs not appearing

**Error:** No log files in `backend/storage/logs/`

**Solution:**

Logs are created lazily - they only appear when something is actually logged. If nothing is logged, no file is created. Try:

```bash
./run_api.sh
# Make an API request
curl http://127.0.0.1:5000/health
# Now check for logs
ls backend/storage/logs/
```

---

### Cleanup script fails

**Error:** `Permission denied` when running `python3 cleanup_logs.py`

**Solution:**

Make sure you're in the project root:

```bash
cd /home/roei/inspire-projects/rpi-waybill-printer
python3 cleanup_logs.py
```

If permission issues persist:

```bash
chmod +x cleanup_logs.py
python3 cleanup_logs.py
```

---

## SSH & Deployment Issues

### SSH connection refused

**Error:** `Connection refused` when SSHing to Raspberry Pi

**Solution:**

1. Verify the Pi is on and connected to network
2. Check the correct IP address:
   ```bash
   arp -a  # On your computer
   ```
3. Try with username:
   ```bash
   ssh roei@192.168.1.100
   ```

---

### File permissions after SSH copy

**Error:** `Permission denied` when running scripts on Raspberry Pi

**Solution:**

After copying files via SCP, make scripts executable:

```bash
ssh roei@raspberrypi.local
cd Desktop/rpi-waybill-printer
chmod +x setup.sh run_api.sh cleanup_logs.py
./setup.sh
```

---

## General Debugging

### Enable verbose logging

To see more detailed logs during development:

```bash
# View logs in real-time
tail -f backend/storage/logs/$(date +%m_%d_%Y).log

# Search for errors
grep "ERROR" backend/storage/logs/$(date +%m_%d_%Y).log

# View last 100 lines
tail -100 backend/storage/logs/$(date +%m_%d_%Y).log
```

---

### Verify setup

Run the verification script:

```bash
cd backend
source venv/bin/activate
python3 verify_setup.py
```

This checks:
- Python version
- Virtual environment
- Dependencies installed
- Database connection
- Required directories

---

### Still having issues?

1. Check the logs: `backend/storage/logs/`
2. Verify virtual environment is active: `which python`
3. Confirm database exists: `ls backend/instance/`
4. Run verify script: `python3 verify_setup.py`
5. Try fresh setup: `./setup.sh` (it's safe to run multiple times)
