#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Installing RPI Waybill Printer (Backend + Frontend)${NC}\n"

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

# Ask user for printer setup
read -p "Do you want to configure your Zebra printer now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter printer name (default: XB-410B): " PRINTER_NAME
    PRINTER_NAME=${PRINTER_NAME:-XB-410B}
    
    read -p "Enter printer USB URI (e.g., usb:///dev/usb/lp0): " PRINTER_URI
    
    if [ -z "$PRINTER_URI" ]; then
        echo -e "${RED}❌ Printer URI cannot be empty${NC}"
        echo -e "${YELLOW}Run 'lpinfo -v' manually to find your printer URI${NC}"
    else
        echo -e "${YELLOW}Adding Zebra printer: $PRINTER_NAME at $PRINTER_URI${NC}"
        
        # Add printer with Zebra PPD driver at admin level
        lpadmin -p "$PRINTER_NAME" -E -v "$PRINTER_URI" -m drv:///sample.drv/zebra.ppd
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Zebra printer added successfully${NC}"
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

# Install additional printer drivers and utilities
echo -e "${YELLOW}Installing additional printer drivers and utilities...${NC}"
apt update
apt install -y printer-driver-all imagemagick
echo -e "${GREEN}✅ Printer drivers and utilities installed${NC}"

# Create virtual environment if it doesn't exist
echo -e "${YELLOW}Setting up Python environment...${NC}"
cd /home/"$ACTUAL_USER"/inspire-projects/rpi-waybill-printer || exit 1

if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating Python virtual environment...${NC}"
    # Use --system-site-packages to allow access to system-installed packages like python3-cups
    sudo -u "$ACTUAL_USER" python3 -m venv --system-site-packages venv
fi

source venv/bin/activate

# Install Python dependencies as the actual user
echo -e "${YELLOW}Installing Python dependencies...${NC}"
sudo -u "$ACTUAL_USER" pip3 install -r requirements.txt
echo -e "${GREEN}✅ Python dependencies installed${NC}"

# Initialize database migrations (one-time setup)
echo -e "${YELLOW}Initializing database migrations...${NC}"
export FLASK_APP=run:app

# Create app/instance directory for database
mkdir -p app/instance
chown "$ACTUAL_USER:$ACTUAL_USER" app/instance

# Only run flask db init if migrations directory doesn't exist
if [ ! -d "app/migrations" ]; then
    sudo -u "$ACTUAL_USER" flask db init
    echo -e "${GREEN}✅ Database migrations initialized${NC}"
else
    echo -e "${GREEN}✅ Database migrations already exist${NC}"
fi

# Apply migrations to create database tables
echo -e "${YELLOW}Creating database tables...${NC}"
sudo -u "$ACTUAL_USER" flask db upgrade
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
echo -e "${BLUE}CUPS: Configured with admin-level Zebra printer support${NC}"
echo -e "\n${YELLOW}CUPS & Zebra Printer Configuration (Admin Level):${NC}"
echo -e "${BLUE}• $ACTUAL_USER has admin access to lpadmin group${NC}"
echo -e "${BLUE}• Zebra printer drivers installed${NC}"
echo -e "${BLUE}• CUPS configured for admin-level printer management${NC}"
echo -e "${BLUE}• CUPS web interface: http://localhost:631${NC}"
echo -e "\n${YELLOW}View configured printers:${NC}"
echo -e "${BLUE}  lpstat -p -d${NC}"
echo -e "\n${YELLOW}To manually add/configure Zebra printer with admin access:${NC}"
echo -e "${BLUE}  1. Run: lpinfo -v  (to find USB URI)${NC}"
echo -e "${BLUE}  2. Run: sudo lpadmin -p PRINTER_NAME -E -v '<USB_URI>' -m drv:///sample.drv/zebra.ppd${NC}"
echo -e "${BLUE}  3. Set default: sudo lpadmin -d PRINTER_NAME${NC}"
echo -e "\n${YELLOW}Important - Log out and log back in for group changes:${NC}"
echo -e "${BLUE}  Or run: newgrp lpadmin${NC}"
echo -e "\n${YELLOW}Start the application:${NC}"
echo -e "${GREEN}  ./run.sh     - Start backend only${NC}"
echo -e "${GREEN}  ./dev.sh     - Start both backend + frontend${NC}"
