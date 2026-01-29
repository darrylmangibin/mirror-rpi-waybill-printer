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
        
        # Verify driver exists
        if lpinfo -m | grep -q "$DRIVER"; then
            echo "✅ Driver found: $DRIVER"
        else
            echo "⚠️  Warning: Driver '$DRIVER' not found in CUPS database"
            echo "Available drivers matching pattern:"
            lpinfo -m | grep -i "$(echo $DRIVER | sed 's/.*\///;s/\.ppd//')" | head -5
        fi
        
        # Add printer with detailed error output
        echo "Adding printer to CUPS..."
        lpadmin -p "$PRINTER_NAME" -E -v "$PRINTER_URI" -m "$DRIVER" 2>&1
        ADD_PRINTER_EXIT=$?
        
        if [ $ADD_PRINTER_EXIT -eq 0 ]; then
            echo "✅ Printer added successfully"
            
            # Wait a moment for CUPS to register the printer
            sleep 1
            
            # Verify printer was added
            if lpstat -p "$PRINTER_NAME" >/dev/null 2>&1; then
                echo "✅ Printer verified in CUPS"
                
                # Set as default
                lpadmin -d "$PRINTER_NAME" 2>&1
                SET_DEFAULT_EXIT=$?
                
                if [ $SET_DEFAULT_EXIT -eq 0 ]; then
                    echo "✅ Printer set as default"
                else
                    echo "⚠️  Could not set as default (exit code: $SET_DEFAULT_EXIT)"
                    echo "Printer may still work, but won't be the default"
                fi
                
                # Show printer status
                echo ""
                lpstat -p -d 2>/dev/null || true
            else
                echo "❌ Printer was not registered in CUPS"
                echo "Current printers:"
                lpstat -p -d 2>/dev/null || echo "No printers found"
            fi
        else
            echo "❌ Failed to add printer (exit code: $ADD_PRINTER_EXIT)"
            echo ""
            echo "Troubleshooting:"
            echo "  1. Check if printer is connected: lpinfo -v | grep usb"
            echo "  2. Verify driver exists: lpinfo -m | grep -i zebra"
            echo "  3. Manual setup: http://localhost:631"
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
# Start USB Printer Reconnection Monitor
# ======================================
if [ -n "$PRINTER_NAME" ] && [ -n "$PRINTER_URI" ]; then
    echo "Starting USB printer reconnection monitor..."
    if [ -f "/app/printer-monitor.sh" ]; then
        chmod +x /app/printer-monitor.sh
        /app/printer-monitor.sh &
        MONITOR_PID=$!
        echo "✅ Printer monitor started (PID: $MONITOR_PID)"
        echo "   Monitors USB connection and auto-reconnects if disconnected"
    else
        echo "⚠️  Printer monitor script not found, skipping"
    fi
fi
echo ""

# ======================================
# Wait for Printer Configuration (Setup Mode)
# ======================================
if [ ! -f "/app/.printer_ready" ]; then
    echo "⏳ Waiting for printer configuration to complete..."
    echo "   (This happens during initial setup)"
    WAIT_COUNT=0
    while [ ! -f "/app/.printer_ready" ] && [ $WAIT_COUNT -lt 120 ]; do
        sleep 1
        WAIT_COUNT=$((WAIT_COUNT + 1))
    done
    
    if [ -f "/app/.printer_ready" ]; then
        echo "✅ Printer configuration complete, starting application..."
    else
        echo "⚠️  Timeout waiting for printer configuration (120s)"
        echo "   Starting application anyway..."
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
