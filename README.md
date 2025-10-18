# RPI Waybill Printer

A Flask-based REST API for managing waybill print jobs on Raspberry Pi with SQLAlchemy ORM and automated database migrations.

## 🚀 Quick Start

### On Raspberry Pi

```bash
cd ~/Desktop/rpi-waybill-printer
bash install.sh
```

Done! The installation script automatically sets up:

- Python virtual environment
- CUPS printer system
- SQLite database
- Nginx reverse proxy (clean URLs, no port number)
- Systemd service (auto-start on boot)

### On Development Machine (WSL/Linux)

```bash
cd ~/Desktop/rpi-waybill-printer
bash install.sh
```

Then start the API:

```bash
./run_api.sh
```

Access at: `http://127.0.0.1:5000`

---

## 🌐 Access Your API

### From Development Machine

```text
http://raspberrypi.local/api/waybills/prints
```

### Home Page (Shows Server Info)

```text
http://raspberrypi.local
```

### Direct IP (Fallback)

```text
http://192.168.100.38/api/waybills/prints
```

**No port number needed!** Nginx handles the routing transparently.

---

## 📖 Full Installation Guide

For detailed setup instructions, troubleshooting, and management commands:

👉 **See [`INSTALLATION.md`](./INSTALLATION.md)**

---

## 🛠️ Managing the Service

```bash
# Check status
sudo systemctl status rpi-waybill-printer.service

# View live logs
sudo journalctl -u rpi-waybill-printer.service -f

# Restart service
sudo systemctl restart rpi-waybill-printer.service

# Stop service
sudo systemctl stop rpi-waybill-printer.service
```

---

## 📚 Printer Setup (Optional)

### For Epson L120 Printer

**Step 1:** After installation, access CUPS:

```text
http://localhost:631
```

**Step 2:** Add your printer:

- Click **"Administration"**
- Click **"Add Printer"**
- Select **Epson L120**
- Follow wizard

**Step 3:** Get printer name

```bash
lpstat -p -d
```

**Step 4:** Update configuration

Edit `backend/.env`:

```env
PRINTER_MODE=cups
PRINTER_NAME=Epson-L120
PRINT_ENABLED=true
```

**Step 5:** Restart service

```bash
sudo systemctl restart rpi-waybill-printer.service
```

---

## 🔄 Updating Dependencies

If new Python libraries are added:

```bash
bash install.sh
```

The installer automatically updates all dependencies and restarts the service.

---

## 📁 Project Structure

```text
rpi-waybill-printer/
├── backend/                 # Flask API
│   ├── venv/               # Virtual environment
│   ├── domains/            # Domain-specific code
│   ├── app.py              # Main Flask app
│   ├── requirements.txt    # Python dependencies
│   └── storage/            # Downloaded waybill files
├── install.sh              # Installation script
├── run_api.sh              # Development server runner
├── README.md               # This file
├── INSTALLATION.md         # Detailed installation guide
└── RaspberryPi_WaybillPrinter_Plan.md  # Project architecture
```

---

## 🎯 Key Features

✅ Auto-start on boot (systemd service)
✅ Auto-restart on crash
✅ Clean URLs without port numbers (Nginx)
✅ Server info displayed on home page
✅ QR code for mobile device scanning
✅ Waybill file type validation (PDF, PNG, JPEG, JPG only)
✅ Unique filename generation with timestamp
✅ Real-time job status tracking

---

## 🔗 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/` | GET | Home page with server info & QR code |
| `/health` | GET | Health check |
| `/api/hostname` | GET | Get system hostname |
| `/api/server-info` | GET | Get full server information |
| `/api/waybills/prints` | POST | Create print job |

---

## 📋 System Requirements

- **Raspberry Pi** 4 or 5
- **OS:** Raspberry Pi OS (Debian-based)
- **Python:** 3.8+
- **Network:** WiFi or Ethernet
- **Optional:** Printer (for actual printing)

---

## 📚 Additional Resources

- See **`INSTALLATION.md`** for:
  - Detailed troubleshooting
  - Testing procedures
  - Management commands
  - Security notes

- **Project Architecture:** `RaspberryPi_WaybillPrinter_Plan.md`

---

## ✨ Ready to Print

Your Raspberry Pi Waybill Printer is ready! 🖨️

Access it at: **`http://raspberrypi.local`**
