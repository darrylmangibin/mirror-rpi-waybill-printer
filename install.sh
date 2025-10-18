#!/bin/bash

# Setup script for RPI Waybill Printer Backend
# This script performs a one-time setup of the project
# Works on both Raspberry Pi and development machines

set -e  # Exit on error

echo "═══════════════════════════════════════════════════════════════"
echo "  RPI Waybill Printer - Setup Script"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Step 1: Check if Python is installed
echo "📍 Step 1: Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.8 or higher."
    exit 1
fi
echo "✓ Python 3 found: $(python3 --version)"
echo ""

# Step 1.5: Check and install CUPS (for printer support)
echo "📍 Step 1.5: Setting up CUPS (printer system)..."
if command -v cups-config &> /dev/null; then
    echo "✓ CUPS already installed"
else
    echo "  → Installing CUPS..."
    sudo apt-get update > /dev/null 2>&1
    sudo apt-get install -y cups > /dev/null 2>&1
    echo "  ✓ CUPS installed"
fi

# Enable CUPS auto-start
echo "  → Enabling CUPS auto-start..."
sudo systemctl enable cups > /dev/null 2>&1
sudo service cups start > /dev/null 2>&1
echo "  ✓ CUPS enabled and started"

# Configure CUPS for local access without password
echo "  → Configuring CUPS (no password required)..."
sudo cupsctl --share-printers --user-cancel-any --remote-admin > /dev/null 2>&1
sudo service cups restart > /dev/null 2>&1
echo "  ✓ CUPS configured for password-free local access"
echo ""

# Step 2: Create virtual environment if it doesn't exist
echo "📍 Step 2: Setting up virtual environment..."
if [ -d "backend/venv" ]; then
    echo "✓ Virtual environment already exists"
else
    cd backend
    python3 -m venv venv
    cd ..
    echo "✓ Virtual environment created"
fi
echo ""

# Step 3: Activate virtual environment and install dependencies
echo "📍 Step 3: Installing dependencies..."
cd backend
source venv/bin/activate
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt
echo "✓ Dependencies installed"
echo ""

# Step 4: Initialize Flask-Migrate if needed
echo "📍 Step 4: Initializing database..."
if [ ! -d "migrations" ]; then
    echo "  → Initializing Flask-Migrate..."
    flask db init --quiet
    echo "  ✓ Flask-Migrate initialized"
fi
echo ""

# Step 5: Apply migrations
echo "📍 Step 5: Applying database migrations..."
flask db upgrade
echo "✓ Database migrations applied"
echo ""

# Step 6: Verify setup with verification script
echo "📍 Step 6: Verifying setup..."
python3 verify_setup.py
echo ""

cd ..

# Step 7: Setup Nginx Reverse Proxy (on Raspberry Pi only)
echo "📍 Step 7: Setting up Nginx reverse proxy..."
IS_RPI=false
if [ "$(hostname)" = "raspberrypi" ] || [ "$(hostname)" = "rpi-printer" ]; then
    IS_RPI=true
    echo "  → Installing Nginx..."
    sudo apt-get update > /dev/null 2>&1
    sudo apt-get install -y nginx > /dev/null 2>&1
    
    # Create Nginx config
    echo "  → Configuring Nginx..."
    sudo tee /etc/nginx/sites-available/rpi-waybill > /dev/null << 'NGINX_EOF'
server {
    listen 80;
    listen [::]:80;

    server_name raspberrypi.local;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX_EOF
    
    # Remove default site and enable the new site
    sudo rm -f /etc/nginx/sites-enabled/default
    sudo ln -sf /etc/nginx/sites-available/rpi-waybill /etc/nginx/sites-enabled/rpi-waybill
    
    # Test and reload Nginx
    sudo nginx -t > /dev/null 2>&1
    sudo systemctl enable nginx > /dev/null 2>&1
    sudo systemctl restart nginx > /dev/null 2>&1
    
    echo "  ✓ Nginx configured and started"
else
    echo "  ⓘ Nginx setup skipped (not on Raspberry Pi)"
fi
echo ""

# Step 8: Setup Systemd Service (on Raspberry Pi only)
echo "📍 Step 8: Setting up systemd service..."
if [ "$IS_RPI" = true ]; then
    echo "  → Creating systemd service file..."
    
    CURRENT_USER=$(whoami)
    PROJECT_PATH=$(pwd)
    VENV_PATH="$PROJECT_PATH/backend/venv/bin/python3"
    
    sudo tee /etc/systemd/system/rpi-waybill-printer.service > /dev/null << SERVICE_EOF
[Unit]
Description=RPI Waybill Printer Flask API
After=network.target

[Service]
Type=simple
User=$CURRENT_USER
WorkingDirectory=$PROJECT_PATH/backend
ExecStart=$VENV_PATH app.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
SERVICE_EOF
    
    # Reload systemd
    sudo systemctl daemon-reload
    sudo systemctl enable rpi-waybill-printer.service > /dev/null 2>&1
    
    echo "  ✓ Systemd service created and enabled"
    echo "  → Starting Flask API service..."
    sudo systemctl start rpi-waybill-printer.service
    sleep 2
    
    if sudo systemctl is-active --quiet rpi-waybill-printer.service; then
        echo "  ✓ Flask API is running"
    else
        echo "  ⚠ Flask API failed to start. Check logs with: sudo journalctl -u rpi-waybill-printer.service -f"
    fi
else
    echo "  ⓘ Systemd service setup skipped (not on Raspberry Pi)"
fi
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo "✅ Setup completed successfully!"
echo ""
if [ "$IS_RPI" = true ]; then
    HOSTNAME=$(hostname)
    echo "🎉 Raspberry Pi Setup Complete!"
    echo ""
    echo "Access your API at:"
    echo "  ✓ Browser: http://$HOSTNAME.local"
    echo "  ✓ API Endpoint: http://$HOSTNAME.local/api/waybills/prints"
    echo ""
    echo "Management Commands:"
    echo "  • View logs: sudo journalctl -u rpi-waybill-printer.service -f"
    echo "  • Restart service: sudo systemctl restart rpi-waybill-printer.service"
    echo "  • Check status: sudo systemctl status rpi-waybill-printer.service"
    echo ""
    echo "The service will auto-start on reboot."
else
    echo "💻 Development Machine Setup Complete!"
    echo ""
    echo "Start the API with:"
    echo "  ./run_api.sh"
    echo ""
    echo "Access at: http://127.0.0.1:5000"
fi
echo ""
echo "═══════════════════════════════════════════════════════════════"
