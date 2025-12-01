#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Installing RPI Waybill Printer (Backend + Frontend)${NC}\n"

# Pull latest changes from git
echo -e "${YELLOW}📥 Pulling latest changes from git...${NC}"
git pull origin main
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Git pull successful${NC}\n"
else
    echo -e "${YELLOW}⚠️  Git pull failed (continuing with installation)${NC}\n"
fi

# Function to check if script is run with sudo (admin level)
check_root() {
    if [[ $EUID -ne 0 ]]; then
        echo -e "${RED}❌ This script must be run with sudo (admin level)${NC}"
        echo -e "${YELLOW}Please run: sudo ./install.sh${NC}"
        exit 1
    fi
}

check_root

# Get the actual user (when running with sudo)
ACTUAL_USER=${SUDO_USER:-$(whoami)}
echo -e "${GREEN}✅ Running with admin privileges as user: $ACTUAL_USER${NC}\n"

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${YELLOW}Python 3 not found. Installing Python 3...${NC}"
    apt update
    apt install -y python3 python3-pip python3-venv
    echo -e "${GREEN}✅ Python 3 installed${NC}"
else
    echo -e "${GREEN}✅ Python 3 found${NC}"
    if ! dpkg -l | grep -q python3-venv; then
        echo -e "${YELLOW}Installing Python3 venv...${NC}"
        apt update
        apt install -y python3-venv
    fi
fi

# Install CUPS for printing functionality with Zebra support
echo -e "${YELLOW}Installing CUPS (Common Unix Printing System) with Zebra printer support...${NC}"
if ! command -v lpstat &> /dev/null; then
    apt update
    apt install -y cups cups-client cups-bsd cups-filters python3-cups libcups2-dev ghostscript printer-driver-zebra
    echo -e "${GREEN}✅ CUPS packages installed with Zebra support${NC}"
else
    echo -e "${GREEN}✅ CUPS already installed${NC}"
    if ! dpkg -l | grep -q python3-cups; then
        echo -e "${YELLOW}Installing Python3 CUPS bindings and Zebra drivers...${NC}"
        apt update
        apt install -y python3-cups libcups2-dev cups-filters ghostscript printer-driver-zebra
        echo -e "${GREEN}✅ Python3 CUPS bindings and Zebra support installed${NC}"
    fi
fi

# Start and enable CUPS service
echo -e "${YELLOW}Starting CUPS service...${NC}"
systemctl start cups
systemctl enable cups
echo -e "${GREEN}✅ CUPS service started and enabled${NC}"

# Configure CUPS daemon for admin-level access
echo -e "${YELLOW}Configuring CUPS daemon for admin-level access...${NC}"
if [ ! -f /etc/cups/cupsd.conf.backup ]; then
    cp /etc/cups/cupsd.conf /etc/cups/cupsd.conf.backup
    echo -e "${GREEN}✅ Backed up original cupsd.conf${NC}"
fi

# Ensure admin access is configured
if ! grep -q "Allow local administration" /etc/cups/cupsd.conf; then
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
    echo -e "${GREEN}✅ CUPS admin configuration added${NC}"
fi

chmod 755 /etc/cups
chmod 644 /etc/cups/cupsd.conf
systemctl restart cups
echo -e "${GREEN}✅ CUPS daemon configured with admin-level access${NC}"

# Add current user to CUPS administrative groups
echo -e "${YELLOW}Adding $ACTUAL_USER to lpadmin and lp groups for admin access...${NC}"
usermod -aG lpadmin "$ACTUAL_USER"
usermod -aG lp "$ACTUAL_USER"
echo -e "${GREEN}✅ User added to lpadmin and lp groups (admin level)${NC}"

# Enable CUPS remote access
echo -e "${YELLOW}Enabling CUPS remote access...${NC}"
cupsctl --remote-any
systemctl restart cups
echo -e "${GREEN}✅ CUPS remote access enabled${NC}"

# Discover and list available printers
echo -e "${YELLOW}Discovering available printer connections...${NC}"
echo -e "${BLUE}Available printer URIs:${NC}"
lpinfo -v
echo ""

# Check if printer is already configured
echo -e "${YELLOW}Checking for existing printer configuration...${NC}"
EXISTING_PRINTER=$(lpstat -p -d 2>/dev/null | grep -oP 'printer \K[^ ]+' | head -1)

if [ -z "$EXISTING_PRINTER" ]; then
    # No printer found, ask to configure one
    echo -e "${YELLOW}No printer currently configured.${NC}"
    read -p "Do you want to configure your thermal printer now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter printer name (default: XP410B): " PRINTER_NAME
        PRINTER_NAME=${PRINTER_NAME:-XP410B}
        
        read -p "Enter printer USB URI (e.g., usb://Xprinter/XP-410B?serial=410BBE235170626): " PRINTER_URI
        
        if [ -z "$PRINTER_URI" ]; then
            echo -e "${RED}❌ Printer URI cannot be empty${NC}"
            echo -e "${YELLOW}Run 'lpinfo -v' manually to find your printer URI${NC}"
        else
            echo -e "${YELLOW}Adding thermal printer: $PRINTER_NAME at $PRINTER_URI${NC}"
            
            # Show the command being used so user can copy-paste if needed
            echo -e "${BLUE}Command: lpadmin -p $PRINTER_NAME -E -v '$PRINTER_URI' -m drv:///sample.drv/zebra.ppd${NC}"
            echo -e "${YELLOW}PPD Driver Flag: -m drv:///sample.drv/zebra.ppd${NC}"
            echo ""
            
            # Add printer with Zebra PPD driver (compatible with XPrinter thermal printers)
            lpadmin -p "$PRINTER_NAME" -E -v "$PRINTER_URI" -m drv:///sample.drv/zebra.ppd
            
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ Thermal printer added successfully${NC}"
                # Set as default
                lpadmin -d "$PRINTER_NAME"
                echo -e "${GREEN}✅ Printer set as default${NC}"
                echo -e "${BLUE}Current printer status:${NC}"
                lpstat -p -d
            else
                echo -e "${RED}❌ Failed to add printer${NC}"
                echo -e "${YELLOW}Try running manually with admin access:${NC}"
                echo -e "${BLUE}  sudo lpadmin -p $PRINTER_NAME -E -v '$PRINTER_URI' -m drv:///sample.drv/zebra.ppd${NC}"
            fi
        fi
    fi
else
    # Printer already configured
    echo -e "${GREEN}✅ Printer already configured: $EXISTING_PRINTER${NC}"
    echo -e "${BLUE}Current printer configuration:${NC}"
    lpstat -p -d
    echo -e "${YELLOW}⏭️  Skipping printer setup (already installed)${NC}"
fi

# Install additional printer drivers and utilities
echo -e "${YELLOW}Installing additional printer drivers and utilities...${NC}"
apt update
apt install -y printer-driver-all imagemagick
echo -e "${GREEN}✅ Printer drivers and utilities installed${NC}"

# Create virtual environment if it doesn't exist
echo -e "${YELLOW}Setting up Python environment...${NC}"

# Get the directory where this script is located (works from any directory)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating Python virtual environment...${NC}"
    # Use --system-site-packages to allow access to system-installed packages like python3-cups
    sudo -u "$ACTUAL_USER" python3 -m venv --system-site-packages venv
fi

# Install Python dependencies using the venv's pip
echo -e "${YELLOW}Installing Python dependencies...${NC}"
sudo -u "$ACTUAL_USER" ./venv/bin/pip install -r requirements.txt
echo -e "${GREEN}✅ Python dependencies installed${NC}"

# Install Playwright browser dependencies for HTML-to-PDF conversion
echo -e "${YELLOW}Installing Playwright browser dependencies...${NC}"
echo -e "${BLUE}This enables HTML webpage-to-PDF conversion for waybill downloads${NC}"
apt update
apt install -y \
    libasound2t64 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6
echo -e "${GREEN}✅ Playwright dependencies installed${NC}"

# Install Playwright browser binaries
echo -e "${YELLOW}Installing Playwright Chromium browser...${NC}"
sudo -u "$ACTUAL_USER" ./venv/bin/python3 -m playwright install chromium
echo -e "${GREEN}✅ Playwright Chromium installed${NC}"

# Initialize database migrations (one-time setup)
echo -e "${YELLOW}Initializing database migrations...${NC}"
export FLASK_APP=run:app

# Create app/instance directory for database
mkdir -p app/instance
chown "$ACTUAL_USER:$ACTUAL_USER" app/instance

# Only run flask db init if migrations directory doesn't exist
if [ ! -d "app/migrations" ]; then
    sudo -u "$ACTUAL_USER" ./venv/bin/flask db init
    echo -e "${GREEN}✅ Database migrations initialized${NC}"
else
    echo -e "${GREEN}✅ Database migrations already exist${NC}"
fi

# Apply migrations to create database tables
echo -e "${YELLOW}Creating database tables...${NC}"
sudo -u "$ACTUAL_USER" ./venv/bin/flask db upgrade
echo -e "${GREEN}✅ Database tables created${NC}"

# Install frontend dependencies
echo -e "${YELLOW}Installing frontend dependencies...${NC}"
cd frontend

# Check if Node.js is installed
if ! command -v npm &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js/npm not found. Installing Node.js...${NC}"
    apt update
    apt install -y nodejs npm
    echo -e "${GREEN}✅ Node.js installed${NC}"
else
    echo -e "${GREEN}✅ Node.js/npm found${NC}"
fi

# Install frontend packages as the actual user
echo -e "${YELLOW}Installing npm packages...${NC}"
sudo -u "$ACTUAL_USER" npm install
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"

# Return to root directory
cd ..

echo -e "\n${GREEN}✅ Installation complete!${NC}"
echo -e "${BLUE}Backend dependencies: Installed${NC}"
echo -e "${BLUE}Frontend dependencies: Installed${NC}"
echo -e "${BLUE}Database: Initialized${NC}"
echo -e "${BLUE}CUPS: Configured with thermal printer support${NC}"
echo -e "${BLUE}Playwright: Installed for HTML-to-PDF conversion${NC}"
echo -e "\n${YELLOW}CUPS & Thermal Printer Configuration (Admin Level):${NC}"
echo -e "${BLUE}• $ACTUAL_USER has admin access to lpadmin group${NC}"
echo -e "${BLUE}• Thermal printer drivers installed (Zebra PPD compatible)${NC}"
echo -e "${BLUE}• CUPS configured for admin-level printer management${NC}"
echo -e "${BLUE}• CUPS web interface: http://localhost:631${NC}"
echo -e "${BLUE}• PNG-to-PDF conversion enabled for printing${NC}"
echo -e "\n${YELLOW}Waybill PDF Conversion (Playwright):${NC}"
echo -e "${BLUE}• HTML webpage-to-PDF conversion enabled${NC}"
echo -e "${BLUE}• Chromium headless browser installed${NC}"
echo -e "${BLUE}• Automatic conversion when API returns HTML${NC}"
echo -e "\n${YELLOW}View configured printers:${NC}"
echo -e "${BLUE}  lpstat -p -d${NC}"
echo -e "\n${YELLOW}To manually add/configure thermal printer (XPrinter) with admin access:${NC}"
echo -e "${BLUE}  1. Run: lpinfo -v  (to find USB URI)${NC}"
echo -e "${BLUE}  2. Run: sudo lpadmin -p PRINTER_NAME -E -v 'usb://Xprinter/XP-410B?serial=XXX' -m drv:///sample.drv/zebra.ppd${NC}"
echo -e "${BLUE}  3. Set default: sudo lpadmin -d PRINTER_NAME${NC}"
echo -e "\n${YELLOW}Important - Log out and log back in for group changes:${NC}"
echo -e "${BLUE}  Or run: newgrp lpadmin${NC}"
echo -e "\n${YELLOW}Start the application:${NC}"
echo -e "${GREEN}  ./run.sh     - Start backend only${NC}"
echo -e "${GREEN}  ./dev.sh     - Start both backend + frontend${NC}"

# Ask about HTTPS setup
echo -e "\n${BLUE}════════════════════════════════════════════════════════════════${NC}"
read -p "Do you want to set up HTTPS for production? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}🔒 Setting up HTTPS (Nginx reverse proxy on port 443)${NC}\n"
    
    # Install nginx and certbot
    echo -e "${YELLOW}Installing nginx and certbot...${NC}"
    apt update
    apt install -y nginx certbot python3-certbot-nginx
    echo -e "${GREEN}✅ Nginx and Certbot installed${NC}\n"
    
    # Setup nginx configuration
    echo -e "${YELLOW}Configuring nginx...${NC}"
    mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled
    cp nginx/waybill-printer.conf /etc/nginx/sites-available/waybill-printer.conf
    
    if [ -L /etc/nginx/sites-enabled/waybill-printer.conf ]; then
        rm /etc/nginx/sites-enabled/waybill-printer.conf
    fi
    ln -s /etc/nginx/sites-available/waybill-printer.conf /etc/nginx/sites-enabled/waybill-printer.conf
    
    if [ -L /etc/nginx/sites-enabled/default ]; then
        rm /etc/nginx/sites-enabled/default
    fi
    
    if nginx -t; then
        echo -e "${GREEN}✅ Nginx configuration valid${NC}\n"
    else
        echo -e "${RED}❌ Nginx configuration error${NC}"
        exit 1
    fi
    
    # Generate self-signed certificate
    echo -e "${YELLOW}Generating self-signed SSL certificate...${NC}"
    RPI_IP=$(hostname -I | awk '{print $1}')
    mkdir -p /etc/letsencrypt/live/rpi-waybill-printer
    openssl req -x509 -nodes -days 365 \
        -newkey rsa:2048 \
        -keyout /etc/letsencrypt/live/rpi-waybill-printer/privkey.pem \
        -out /etc/letsencrypt/live/rpi-waybill-printer/fullchain.pem \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=$RPI_IP" 2>/dev/null
    echo -e "${GREEN}✅ SSL certificate generated${NC}\n"
    
    # Install systemd services
    echo -e "${YELLOW}Installing systemd services...${NC}"
    cp systemd/rpi-waybill-printer.service /etc/systemd/system/
    cp systemd/rpi-waybill-printer-frontend.service /etc/systemd/system/
    cp systemd/nginx.service /etc/systemd/system/
    
    systemctl daemon-reload
    echo -e "${GREEN}✅ Systemd services installed${NC}\n"
    
    # Enable and start services
    echo -e "${YELLOW}Starting HTTPS services...${NC}"
    systemctl enable nginx
    systemctl enable rpi-waybill-printer-frontend.service
    systemctl enable rpi-waybill-printer.service
    
    systemctl start nginx
    sleep 1
    systemctl start rpi-waybill-printer-frontend.service
    sleep 2
    systemctl start rpi-waybill-printer.service
    
    echo -e "${GREEN}✅ HTTPS services started${NC}\n"
    
    # Verify
    if systemctl is-active --quiet nginx && \
       systemctl is-active --quiet rpi-waybill-printer.service; then
        echo -e "${GREEN}✅ HTTPS Setup Complete!${NC}"
        echo -e "${BLUE}Access: https://$RPI_IP${NC}"
        echo -e "${YELLOW}Note: Browser may warn about certificate (normal for self-signed)${NC}"
        echo -e "${YELLOW}      Click 'Advanced' → 'Proceed anyway' to continue${NC}"
    else
        echo -e "${RED}❌ Some services failed to start${NC}"
        echo -e "${YELLOW}Check with: sudo systemctl status nginx${NC}"
    fi
else
    echo -e "${YELLOW}⏭️  Skipping HTTPS setup${NC}"
    echo -e "${BLUE}You can set it up later by running: sudo bash setup-https.sh${NC}"
fi
