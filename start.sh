#!/bin/bash
# Startup script for RPI Waybill Printer Backend

ENVIRONMENT=${ENVIRONMENT:-development}

echo "Starting application in $ENVIRONMENT mode..."

# ======================================
# CUPS Configuration (matches installers/cups.sh)
# ======================================
echo "Configuring CUPS (Common Unix Printing System)..."

# Start CUPS service
echo "Starting CUPS service..."
if command -v systemctl &> /dev/null; then
    systemctl start cups 2>/dev/null || service cups start 2>/dev/null || cupsd 2>/dev/null || true
else
    service cups start 2>/dev/null || cupsd 2>/dev/null || true
fi
echo "✅ CUPS service started"

# Configure CUPS daemon for admin-level access
echo "Configuring CUPS daemon for admin access..."
if [ -f /etc/cups/cupsd.conf ]; then
    # Backup original if not already done
    if [ ! -f /etc/cups/cupsd.conf.backup ]; then
        cp /etc/cups/cupsd.conf /etc/cups/cupsd.conf.backup 2>/dev/null || true
    fi
    
    # Add admin configuration if not already present
    if ! grep -q "Allow local administration" /etc/cups/cupsd.conf 2>/dev/null; then
        cat >> /etc/cups/cupsd.conf << 'CUPS_CONFIG'

# Allow local administration
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

# Restart CUPS to apply configuration
if command -v systemctl &> /dev/null; then
    systemctl restart cups 2>/dev/null || service cups restart 2>/dev/null || true
else
    service cups restart 2>/dev/null || true
fi
echo "✅ CUPS configured and restarted"

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
