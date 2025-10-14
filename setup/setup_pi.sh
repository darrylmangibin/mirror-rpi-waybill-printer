#!/bin/bash

# 🖨️ Waybill Printer - Raspberry Pi Setup Script
# This script sets up the production environment on Raspberry Pi

set -e  # Exit on any error

echo "🍓 Starting Waybill Printer Raspberry Pi Setup..."
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root for system operations
if [ "$EUID" -ne 0 ]; then
    print_error "Please run this script with sudo: sudo ./setup_pi.sh"
    exit 1
fi

# Get the actual user (not root)
ACTUAL_USER=${SUDO_USER:-$USER}
USER_HOME=$(eval echo ~$ACTUAL_USER)

print_status "Setting up for user: $ACTUAL_USER"
print_status "User home directory: $USER_HOME"

# Step 1: Update system
print_status "Updating system packages..."
apt update && apt upgrade -y

# Step 2: Install system dependencies
print_status "Installing system dependencies..."
apt install -y \
    python3.12-venv \
    python3-pip \
    curl \
    git \
    cups \
    cups-client \
    chromium-browser \
    xdotool \
    unclutter

# Step 3: Setup CUPS (printing system)
print_status "Configuring CUPS printing system..."
systemctl enable cups
systemctl start cups

# Add user to lpadmin group
usermod -a -G lpadmin $ACTUAL_USER
print_success "User $ACTUAL_USER added to lpadmin group"

# Enable CUPS web interface
cupsctl --remote-admin --remote-any --share-printers
print_success "CUPS web interface enabled at http://localhost:631"

# Step 4: Check project files
PROJECT_DIR="$USER_HOME/rpi-waybill-printer"
if [ ! -d "$PROJECT_DIR" ]; then
    print_error "Project directory not found: $PROJECT_DIR"
    print_status "Please clone the repository first:"
    print_status "git clone https://github.com/komento-sideprojects/rpi-waybill-printer.git"
    exit 1
fi

cd "$PROJECT_DIR"

if [ ! -f "backend/app.py" ]; then
    print_error "backend/app.py not found. Invalid project structure."
    exit 1
fi

# Step 5: Setup Python environment (as actual user)
print_status "Setting up Python environment..."
cd backend

# Remove existing venv if present
if [ -d "venv" ]; then
    print_warning "Removing existing virtual environment..."
    rm -rf venv
fi

# Create venv as actual user
sudo -u $ACTUAL_USER python3 -m venv venv
print_success "Virtual environment created"

# Install dependencies as actual user
print_status "Installing Python dependencies..."
sudo -u $ACTUAL_USER bash -c "source venv/bin/activate && pip install --upgrade pip && pip install -r requirements.txt"
print_success "Python dependencies installed"

# Step 6: Create environment file
print_status "Setting up configuration..."
if [ ! -f ".env" ]; then
    sudo -u $ACTUAL_USER bash -c "cat > .env << 'EOF'
# Flask Configuration
DEBUG=False
SECRET_KEY=pi-production-secret-$(openssl rand -hex 16)

# Database Configuration
DATABASE_PATH=$USER_HOME/rpi-waybill-printer/backend/waybill_printer.db

# Print Configuration
PDF_CACHE_DIR=/tmp/waybills
MAX_RETRY_COUNT=3

# Server Configuration
HOST=0.0.0.0
PORT=5000
EOF"
    print_success "Production environment file created"
else
    print_warning "Environment file already exists"
fi

# Step 7: Create PDF cache directory
print_status "Creating PDF cache directory..."
mkdir -p /tmp/waybills
chmod 777 /tmp/waybills
print_success "PDF cache directory created"

# Step 8: Create systemd service
print_status "Creating systemd service..."
cat > /etc/systemd/system/waybill-printer.service << EOF
[Unit]
Description=Waybill Printer API
After=network.target

[Service]
Type=simple
User=$ACTUAL_USER
WorkingDirectory=$PROJECT_DIR/backend
ExecStart=$PROJECT_DIR/backend/venv/bin/python app.py
Restart=always
RestartSec=3
Environment=PATH=$PROJECT_DIR/backend/venv/bin

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable service
systemctl daemon-reload
systemctl enable waybill-printer
print_success "Systemd service created and enabled"

# Step 9: Setup desktop auto-start (kiosk mode)
print_status "Setting up desktop auto-start..."

# Create autostart directory
sudo -u $ACTUAL_USER mkdir -p "$USER_HOME/.config/autostart"

# Create desktop autostart file
sudo -u $ACTUAL_USER bash -c "cat > '$USER_HOME/.config/autostart/waybill-dashboard.desktop' << 'EOF'
[Desktop Entry]
Type=Application
Name=Waybill Dashboard
Exec=chromium-browser --start-fullscreen --app=http://localhost:5000 --disable-infobars --disable-session-crashed-bubble --disable-restore-session-state
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
EOF"

print_success "Desktop autostart configured"

# Step 10: Configure auto-login (optional)
print_status "Configuring auto-login..."
raspi-config nonint do_boot_behaviour B4  # Desktop autologin
print_success "Auto-login configured"

# Step 11: Create useful scripts
print_status "Creating management scripts..."

# Create start script
sudo -u $ACTUAL_USER bash -c "cat > '$PROJECT_DIR/start.sh' << 'EOF'
#!/bin/bash
cd \"$(dirname \"\$0\")/backend\"
source venv/bin/activate
python3 app.py
EOF"

# Create status script
sudo -u $ACTUAL_USER bash -c "cat > '$PROJECT_DIR/status.sh' << 'EOF'
#!/bin/bash
echo \"🖨️ Waybill Printer Status\"
echo \"========================\"
echo \"Service Status:\"
sudo systemctl status waybill-printer --no-pager -l
echo \"\"
echo \"CUPS Status:\"
sudo systemctl status cups --no-pager -l
echo \"\"
echo \"Network Info:\"
hostname -I
echo \"\"
echo \"Printer Status:\"
lpstat -p -d 2>/dev/null || echo \"No printers configured\"
EOF"

# Create logs script
sudo -u $ACTUAL_USER bash -c "cat > '$PROJECT_DIR/logs.sh' << 'EOF'
#!/bin/bash
echo \"📋 Viewing Waybill Printer Logs (Press Ctrl+C to exit)\"
echo \"=====================================================\"
sudo journalctl -u waybill-printer -f
EOF"

# Make scripts executable
chmod +x "$PROJECT_DIR/start.sh"
chmod +x "$PROJECT_DIR/status.sh" 
chmod +x "$PROJECT_DIR/logs.sh"

print_success "Management scripts created"

# Step 12: Test the installation
print_status "Testing installation..."
cd "$PROJECT_DIR/backend"

# Test Python environment
if sudo -u $ACTUAL_USER bash -c "source venv/bin/activate && python3 -c 'import flask; print(\"Flask version:\", flask.__version__)'" 2>/dev/null; then
    print_success "Flask installation verified"
else
    print_error "Flask installation test failed"
    exit 1
fi

# Step 13: Start the service
print_status "Starting waybill-printer service..."
systemctl start waybill-printer
sleep 3

if systemctl is-active --quiet waybill-printer; then
    print_success "Waybill printer service is running"
else
    print_error "Failed to start waybill-printer service"
    print_status "Check logs with: journalctl -u waybill-printer"
    exit 1
fi

# Step 14: Display network information
print_status "Getting network information..."
IP_ADDRESS=$(hostname -I | awk '{print $1}')
print_success "Pi IP Address: $IP_ADDRESS"

# Step 15: Display completion message
echo ""
echo "🎉 Raspberry Pi Setup Complete!"
echo "==============================="
print_success "System packages installed"
print_success "CUPS printing system configured"
print_success "Python environment created"
print_success "Waybill printer service running"
print_success "Desktop auto-start configured"

echo ""
echo "📋 Important Information:"
echo "------------------------"
echo "🌐 Local Access: http://localhost:5000"
echo "📱 Network Access: http://$IP_ADDRESS:5000"
echo "🖨️ CUPS Web Interface: http://localhost:631"
echo ""
echo "📱 Mobile API Endpoint:"
echo "POST http://$IP_ADDRESS:5000/api/jobs"
echo ""
echo "🛠️ Management Commands:"
echo "./status.sh    - Check service status"
echo "./logs.sh      - View live logs"
echo "./start.sh     - Start manually (if needed)"
echo ""
echo "🔧 System Commands:"
echo "sudo systemctl status waybill-printer  - Check service"
echo "sudo systemctl restart waybill-printer - Restart service"
echo "lpstat -p -d                          - Check printers"
echo ""

print_warning "IMPORTANT: Reboot the Pi to enable auto-start and kiosk mode"
echo "sudo reboot"
echo ""

print_status "Setup completed successfully! 🚀"
print_status "After reboot, the dashboard will open automatically in full-screen mode."
