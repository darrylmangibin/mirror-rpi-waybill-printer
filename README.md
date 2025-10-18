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

## Updating Dependencies

If new Python libraries are added to the project:

**On Raspberry Pi 5:** Right-click `install.sh` → **Execute**

**On Your PC:** Run in terminal:

```bash
./install.sh
```

The installer will update all dependencies automatically. No need to manually reinstall anything!
