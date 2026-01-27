#!/bin/bash
# Startup script for RPI Waybill Printer Backend

ENVIRONMENT=${ENVIRONMENT:-development}

echo "Starting application in $ENVIRONMENT mode..."

# ======================================
# CUPS Configuration (matches installers/cups.sh)
# ======================================
echo "Configuring CUPS (Common Unix Printing System)..."

# Start CUPS service (Docker-compatible, no systemd)
echo "Starting CUPS service..."
# Start cupsd in the background (systemd doesn't work in Docker)
cupsd 2>/dev/null || true

# Wait for CUPS to be ready
sleep 2

# Verify CUPS is running
if pgrep -x "cupsd" > /dev/null; then
    echo "✅ CUPS service started"
else
    echo "⚠️  Warning: CUPS may not have started properly"
fi

# Configure CUPS daemon for admin-level access
echo "Configuring CUPS daemon for admin access..."
if [ -f /etc/cups/cupsd.conf ]; then
    # Backup original if not already done
    if [ ! -f /etc/cups/cupsd.conf.backup ]; then
        cp /etc/cups/cupsd.conf /etc/cups/cupsd.conf.backup 2>/dev/null || true
    fi
    
    # Check if we already modified the config (look for our specific marker)
    if ! grep -q "# RPI-Waybill-Printer CUPS Config" /etc/cups/cupsd.conf 2>/dev/null; then
        # Remove any duplicate Location blocks first
        sed -i '/<Location \/>/,/<\/Location>/d' /etc/cups/cupsd.conf 2>/dev/null || true
        sed -i '/<Location \/admin>/,/<\/Location>/d' /etc/cups/cupsd.conf 2>/dev/null || true
        sed -i '/<Location \/admin\/conf>/,/<\/Location>/d' /etc/cups/cupsd.conf 2>/dev/null || true
        
        # Add our configuration with a marker
        cat >> /etc/cups/cupsd.conf << 'CUPS_CONFIG'

# RPI-Waybill-Printer CUPS Config
<Location />
  Order allow,deny
  Allow localhost
  Allow 127.0.0.1
</Location>

<Location /admin>
  Order allow,deny
  Allow localhost
  Allow 127.0.0.1
</Location>

<Location /admin/conf>
  Order allow,deny
  Allow localhost
  Allow 127.0.0.1
</Location>
CUPS_CONFIG
        echo "✅ CUPS admin configuration added"
    else
        echo "✅ CUPS admin configuration already exists"
    fi
    
    # Set permissions
    chmod 755 /etc/cups 2>/dev/null || true
    chmod 644 /etc/cups/cupsd.conf 2>/dev/null || true
fi

# Enable CUPS remote access
echo "Enabling CUPS remote access..."
cupsctl --remote-any 2>/dev/null || true
echo "✅ CUPS remote access enabled"

# Restart CUPS to apply configuration (Docker-compatible)
echo "Restarting CUPS to apply configuration..."
pkill -HUP cupsd 2>/dev/null || cupsd 2>/dev/null || true
sleep 2
echo "✅ CUPS configured and restarted"

# ======================================
# Printer Discovery and Configuration
# ======================================
echo "Discovering available printers..."
echo "Available printer URIs:"
lpinfo -v 2>/dev/null || echo "(lpinfo not available)"
echo ""

# Check if printer is already configured
echo "Checking for existing printer configuration..."
EXISTING_PRINTER=$(lpstat -p -d 2>/dev/null | grep -oP 'printer \K[^ ]+' | head -1)

if [ -n "$EXISTING_PRINTER" ]; then
    echo "✅ Printer already configured: $EXISTING_PRINTER"
    lpstat -p -d 2>/dev/null || true
else
    echo "No printer currently configured."
    
    # Auto-configure printer if environment variables are provided
    if [ -n "$PRINTER_NAME" ] && [ -n "$PRINTER_URI" ]; then
        echo "Auto-configuring printer from environment variables..."
        echo "Printer Name: $PRINTER_NAME"
        echo "Printer URI: $PRINTER_URI"
        
        # Use specified driver or default to Zebra (compatible with XPrinter thermal printers)
        DRIVER="${PRINTER_DRIVER:-drv:///sample.drv/zebra.ppd}"
        echo "Printer Driver: $DRIVER"
        
        # Add printer
        lpadmin -p "$PRINTER_NAME" -E -v "$PRINTER_URI" -m "$DRIVER" 2>/dev/null
        
        if [ $? -eq 0 ]; then
            echo "✅ Thermal printer added successfully"
            # Set as default
            lpadmin -d "$PRINTER_NAME" 2>/dev/null || true
            echo "✅ Printer set as default"
            lpstat -p -d 2>/dev/null || true
        else
            echo "⚠️  Failed to add printer automatically"
            echo "You can configure it manually using CUPS web interface at http://localhost:631"
        fi
    else
        echo "ℹ️  No printer configured. Set PRINTER_NAME and PRINTER_URI environment variables to auto-configure."
        echo "Example:"
        echo "  PRINTER_NAME=XP410B"
        echo "  PRINTER_URI=usb://Xprinter/XP-410B?serial=410BBE235170626"
        echo "Or configure manually via CUPS web interface at http://localhost:631"
    fi
fi
echo ""

# ======================================
# Database Migrations
# ======================================
echo "Running database migrations..."
export FLASK_APP=run:app

# Create app/instance directory for database if it doesn't exist
mkdir -p app/instance

# Check if migrations directory exists, if not initialize it
if [ ! -d "app/migrations" ]; then
    echo "Initializing database migrations..."
    flask db init
    echo "✅ Database migrations initialized"
fi

# Apply any pending migrations
echo "Applying database migrations..."
flask db upgrade
echo "✅ Database migrations applied"

# Start the application
if [ "$ENVIRONMENT" = "development" ]; then
    echo "Using Flask development server with hot-reload..."
    exec flask --app run.py run --debug --host=$HOST --port=$PORT
else
    echo "Using production server..."
    exec python run.py
fi
