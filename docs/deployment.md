# Raspberry Pi Deployment Guide

Step-by-step guide to deploy the RPI Waybill Printer to a Raspberry Pi.

## Prerequisites

- Raspberry Pi 4 or 5 (recommended)
- Raspbian OS (Debian-based)
- SSH access configured
- Same WiFi network as your development machine
- Python 3.9+ installed on Pi

## Step 1: Find Your Raspberry Pi

### Get the IP Address

On the Raspberry Pi or from your network:

```bash
hostname -I
```

Example output: `192.168.1.100`

### Verify SSH is enabled

```bash
ssh roei@192.168.1.100
```

If this works, SSH is enabled. If not, enable it in raspi-config:

```bash
sudo raspi-config
# Go to Interface Options → SSH → Enable
```

---

## Step 2: Copy Project to Raspberry Pi

From your development machine, copy the entire project:

```bash
scp -r ~/inspire-projects/rpi-waybill-printer roei@raspberrypi.local:~/Desktop/
```

Or use IP address:

```bash
scp -r ~/inspire-projects/rpi-waybill-printer roei@192.168.1.100:~/Desktop/
```

This creates: `~/Desktop/rpi-waybill-printer/` on the Pi

---

## Step 3: Connect via SSH

```bash
ssh roei@raspberrypi.local
```

Or with IP:

```bash
ssh roei@192.168.1.100
```

---

## Step 4: Navigate to Project

```bash
cd Desktop/rpi-waybill-printer
```

---

## Step 5: Run Setup

This installs all dependencies and initializes the database:

```bash
./setup.sh
```

**What this does:**
- Creates Python virtual environment
- Installs all dependencies from requirements.txt
- Initializes the SQLite database
- Runs database migrations
- Verifies everything is configured

This takes 2-3 minutes on Raspberry Pi 5.

---

## Step 6: Start the API

```bash
./run_api.sh
```

You should see:

```
✅ Setup verification passed
✅ Running Waybill Printer API
* Serving Flask app 'app'
* Running on http://0.0.0.0:5000
```

**Note:** The process will run in foreground. Keep this terminal open, or use `nohup` to run in background:

```bash
nohup ./run_api.sh > api.log 2>&1 &
```

---

## Step 7: Access from Mobile

### Option A: Using QR Code (Recommended)

1. Open browser on your phone/tablet: `http://raspberrypi.local:5000/`
2. Scan the QR code displayed on the page
3. Use the scanned endpoint to submit print jobs

### Option B: Using IP Address

On mobile browser:

```
http://192.168.1.100:5000/
```

### Option C: Using Hostname

If mDNS is working:

```
http://raspberrypi.local:5000/
```

---

## Step 8: Test the API

### From your phone/computer on the same network

```bash
curl http://raspberrypi.local:5000/health
```

Should return:

```json
{
  "status": "healthy",
  "message": "API is running and ready to accept requests"
}
```

### Test print job submission

```bash
curl -X POST http://raspberrypi.local:5000/api/waybills/prints \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "test_company",
    "invoice_number": "INV-001",
    "waybill_url": "https://example.com/waybill.pdf"
  }'
```

---

## Running in Background (Optional)

To run the API as a background service:

### Using nohup

```bash
cd ~/Desktop/rpi-waybill-printer
nohup ./run_api.sh > api.log 2>&1 &
```

View logs:

```bash
tail -f api.log
```

---

## Running on Boot with Systemd (Optional)

To run automatically when Raspberry Pi starts:

### Create systemd service file

```bash
sudo nano /etc/systemd/system/waybill-printer.service
```

Add the following content:

```ini
[Unit]
Description=RPI Waybill Printer API
After=network.target

[Service]
Type=simple
User=roei
WorkingDirectory=/home/roei/Desktop/rpi-waybill-printer
ExecStart=/home/roei/Desktop/rpi-waybill-printer/run_api.sh
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Enable and start the service

```bash
sudo systemctl daemon-reload
sudo systemctl enable waybill-printer
sudo systemctl start waybill-printer
```

### Check service status

```bash
sudo systemctl status waybill-printer
```

### View service logs

```bash
sudo journalctl -u waybill-printer -f
```

---

## Stopping the Service

### If running in foreground

Press `Ctrl+C` in the terminal

### If running with nohup

```bash
pkill -f "run_api.sh"
```

### If running as systemd service

```bash
sudo systemctl stop waybill-printer
```

---

## Maintenance

### View application logs

```bash
tail -f ~/Desktop/rpi-waybill-printer/backend/storage/logs/$(date +%m_%d_%Y).log
```

### Clean up old logs

```bash
cd ~/Desktop/rpi-waybill-printer
python3 cleanup_logs.py --days 7
```

### Database backups

Backup the database regularly:

```bash
cp ~/Desktop/rpi-waybill-printer/backend/instance/raspberry_pi.db ~/backups/db_$(date +%Y%m%d_%H%M%S).db
```

### Update dependencies

If you add new dependencies, update on the Pi:

```bash
cd ~/Desktop/rpi-waybill-printer/backend
source venv/bin/activate
pip install -r requirements.txt
```

---

## Troubleshooting Deployment

### Cannot connect to Pi

```bash
# Check if Pi is on the network
ping raspberrypi.local

# Use IP address instead
ping 192.168.1.100
```

### API won't start

```bash
# Check Python version
python3 --version  # Should be 3.9+

# Check setup script was run
ls backend/venv/  # Should exist

# View error logs
tail -f backend/storage/logs/$(date +%m_%d_%Y).log
```

### Port 5000 already in use

```bash
# Find what's using port 5000
sudo lsof -i :5000

# Kill the process
sudo kill -9 <PID>
```

### Database issues

```bash
# Reinitialize database
cd backend
source venv/bin/activate
flask db downgrade base
flask db upgrade
```

---

## Monitoring

### Check if API is running

```bash
curl http://raspberrypi.local:5000/health
```

### Monitor in real-time

Open two SSH sessions:

**Session 1 - Run API:**
```bash
cd ~/Desktop/rpi-waybill-printer
./run_api.sh
```

**Session 2 - View logs:**
```bash
tail -f ~/Desktop/rpi-waybill-printer/backend/storage/logs/$(date +%m_%d_%Y).log
```

---

## Performance Tips for Raspberry Pi 5

- Use **Raspberry Pi 5** or higher (better CPU/RAM)
- Monitor disk space: `df -h`
- Regular log cleanup: `python3 cleanup_logs.py --days 7`
- Monitor database size: `ls -lh backend/instance/raspberry_pi.db`
- Consider running on SSD for better performance

---

## Next Steps

1. Test the API from your mobile device
2. Configure automated log cleanup if needed
3. Set up systemd service for auto-start (optional)
4. Monitor logs for any issues

For API endpoint reference, see [`docs/backend/routes.md`](./backend/routes.md)
