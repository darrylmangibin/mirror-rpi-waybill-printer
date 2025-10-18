# RPI Waybill Printer

A Flask-based REST API for managing waybill print jobs on Raspberry Pi with SQLAlchemy ORM and automated database migrations.

## Installation

### On Raspberry Pi 5

1. Clone the repository
2. Open file manager
3. Right-click `install.sh` → **Execute**

Done! The installer runs automatically.

### On WSL / Development Machine (Your Own PC)

Run this command in your terminal:

```bash
./install.sh
```

That's it!

## How to Run

To start the API server, run:

```bash
./run_api.sh
```

## Printer Setup (For Epson L120 Users)

### What is CUPS?

**CUPS** (Common Unix Printing System) is a system that manages printers on Linux.

Think of it like: **Windows Printer Settings** → but for Linux/WSL

It lets your code talk to the printer by name instead of dealing with USB cables directly.

### When Do I Need CUPS?

- ✅ **If you have an Epson L120 printer** → Install CUPS
- ❌ **If you're just testing (mock mode)** → Skip this
- ❌ **If you have XPrinter (for Raspberry Pi later)** → Different setup

### Installing CUPS on WSL / Development Machine

**Step 1:** Install CUPS

```bash
sudo apt-get install cups
```

This downloads and installs CUPS on your system.

**Step 2:** Start the printer system

```bash
sudo service cups start
```

**Step 3:** Access printer settings

Open your browser and go to:

```
http://localhost:631
```

Then:
- Click **"Administration"**
- Click **"Add Printer"**
- Select your **Epson L120**
- Follow the setup wizard

**Step 4:** Find your printer name

```bash
lpstat -p -d
```

You'll see your printer name (e.g., `Epson-L120`)

**Step 5:** Update configuration

Edit `backend/.env` and set:

```env
PRINTER_MODE=cups
PRINTER_NAME=Epson-L120
PRINT_ENABLED=true
```

Replace `Epson-L120` with the exact name from Step 4.

**Step 6:** Restart the application

```bash
./run_api.sh
```

Now your printer is ready to use! 🖨️

## Updating Dependencies

If new Python libraries are added to the project:

**On Raspberry Pi 5:** Right-click `install.sh` → **Execute**

**On Your PC:** Run in terminal:

```bash
./install.sh
```

The installer will update all dependencies automatically. No need to manually reinstall anything!
