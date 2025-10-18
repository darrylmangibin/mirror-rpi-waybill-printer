# RPI Waybill Printer - Installation Guide

Complete setup instructions for Raspberry Pi and development machines.

---

## Prerequisites

- **Raspberry Pi** (4 or 5 recommended)
- **Internet connection** for package downloads
- **SSH access** to the Pi
- **Local network** (WiFi recommended)

---

## Quick Setup (One Command)

On your **Raspberry Pi**:

```bash
cd ~/Desktop/rpi-waybill-printer
bash install.sh
```

That's it! The script will automatically:

- ✅ Install Python dependencies
- ✅ Setup CUPS printer system
- ✅ Initialize database
- ✅ Configure Nginx reverse proxy
- ✅ Setup systemd service (auto-start on boot)

---

## What Gets Installed

### Step 1: Python & Virtual Environment

- Creates isolated Python environment
- Installs all required packages

### Step 2: CUPS (Printer System)

- Installs Common Unix Printing System
- Configures password-free printing
- Auto-starts on boot

### Step 3: Database

- Initializes Flask-Migrate
- Creates SQLite database
- Runs all migrations

### Step 4: Nginx Reverse Proxy (Raspberry Pi only)

- Installs Nginx web server
- Configures reverse proxy to Flask
- Removes default Nginx site

### Step 5: Systemd Service

- Creates auto-start service
- Flask runs automatically on boot
- Auto-restarts if crashed

---

## Access Your API

After installation completes, access at:

**From your development machine:**

```text
http://raspberrypi.local/api/waybills/prints
```

**Home page / Dashboard:**

```text
http://raspberrypi.local
```

**Direct IP (if .local doesn't work):**

```text
http://192.168.100.38/api/waybills/prints
```

No port number needed! (Nginx handles port 80 → 5000 internally)

---

## Viewing Server Information

Visit the home page to see:

- **Hostname:** `raspberrypi.local`
- **IP Address:** `192.168.100.38` (or your Pi's IP)
- **Port:** 5000 (hidden by Nginx)
- **QR Code:** For mobile device scanning

---

## Management Commands

### Check Service Status

```bash
sudo systemctl status rpi-waybill-printer.service
```

### View Live Logs

```bash
sudo journalctl -u rpi-waybill-printer.service -f
```

### Restart Service

```bash
sudo systemctl restart rpi-waybill-printer.service
```

### Stop Service

```bash
sudo systemctl stop rpi-waybill-printer.service
```

### View Nginx Status

```bash
sudo systemctl status nginx
```

---

## Testing

### From your development machine

```bash
# Test API endpoint
curl http://raspberrypi.local/api/waybills/prints

# Test with POST request
curl -X POST http://raspberrypi.local/api/waybills/prints \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "etaily",
    "invoice_number": "TEST-001",
    "waybill_url": "https://s3.ap-southeast-1.amazonaws.com/your-file.png"
  }'
```

### From Raspberry Pi (via SSH)

```bash
curl http://localhost:5000/api/waybills/prints
```

---

## Network Discovery

The Pi automatically broadcasts its hostname via **mDNS** (Multicast DNS).

From your network, you can access:

- `http://raspberrypi.local` ✅ (Recommended - auto-resolves IP)
- `http://192.168.100.38` ✅ (Direct IP)
- `ping raspberrypi.local` ✅ (Check connectivity)

---

## File Locations

| Item | Location |
|------|----------|
| **Flask App** | `/home/roei/Desktop/rpi-waybill-printer/backend/` |
| **Database** | `/home/roei/Desktop/rpi-waybill-printer/backend/instance/raspberry_pi.db` |
| **Waybill Storage** | `/home/roei/Desktop/rpi-waybill-printer/backend/storage/waybills/` |
| **Systemd Service** | `/etc/systemd/system/rpi-waybill-printer.service` |
| **Nginx Config** | `/etc/nginx/sites-available/rpi-waybill` |

---

## Troubleshooting

### Service Won't Start

```bash
sudo journalctl -u rpi-waybill-printer.service -f
# Check what error appears
```

### Nginx Shows "Welcome to nginx"

```bash
# Check Nginx is routing correctly
sudo curl http://127.0.0.1:5000
# Should show Waybill Printer home page

# Reload Nginx config
sudo nginx -t
sudo systemctl reload nginx
```

### Can't Access raspberrypi.local

```bash
# Check mDNS is working
ping raspberrypi.local

# Use IP address instead
ping 192.168.100.38
```

### Port 5000 Still Showing

```bash
# Force Nginx reload
sudo systemctl restart nginx

# Check Nginx is listening on port 80
sudo netstat -tuln | grep :80
```

---

## Reboot Test

After setup, test that everything auto-starts:

```bash
# On the Pi
sudo reboot

# Wait 30 seconds for Pi to boot, then:
ping raspberrypi.local
curl http://raspberrypi.local
```

Should work without manually running any scripts!

---

## Mobile Device Setup

1. Visit `http://raspberrypi.local` on any phone on the same WiFi
2. Scan QR code from the home page
3. Submit waybill URL to print

---

## Security Notes

- ✅ API runs on localhost (port 5000) - not exposed to network
- ✅ Nginx reverse proxy handles network traffic on port 80
- ⚠️ No authentication required (local network only)
- ⚠️ For production, add firewall rules

---

## Additional Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [CUPS Documentation](https://www.cups.org/)
- [Nginx Documentation](https://nginx.org/)
- [SQLite](https://www.sqlite.org/)

---

## Success

Your Raspberry Pi Waybill Printer is ready to print! 🖨️

Access it at: **[http://raspberrypi.local](http://raspberrypi.local)**
