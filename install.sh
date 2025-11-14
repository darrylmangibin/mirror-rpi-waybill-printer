#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Installing RPI Waybill Printer (Backend + Frontend)${NC}\n"

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${YELLOW}Python 3 not found. Installing Python 3...${NC}"
    sudo apt update
    sudo apt install -y python3 python3-pip
    echo -e "${GREEN}✅ Python 3 installed${NC}"
fi

# Install system dependencies for PDF processing and printing
echo -e "${YELLOW}Installing system dependencies (CUPS, Ghostscript for PDF conversion)...${NC}"
sudo apt update
sudo apt install -y cups cups-client python3-cups ghostscript poppler-utils printer-driver-all

# Start and enable CUPS
sudo systemctl start cups
sudo systemctl enable cups
echo -e "${GREEN}✅ System dependencies installed${NC}"

# Configure CUPS and detect printers
echo -e "${YELLOW}Configuring CUPS for thermal printer...${NC}"
# Give current user access to CUPS without sudo
sudo usermod -a -G lpadmin pi
echo -e "${GREEN}✅ User added to lpadmin group${NC}"

# Setup printer (XPrinter XP-410B thermal printer)
echo -e "${YELLOW}Setting up XPrinter XP-410B thermal printer...${NC}"

# Install XPrinter official Linux SDK and drivers
echo -e "${YELLOW}Installing XPrinter Linux SDK and drivers...${NC}"
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"

# Download XPrinter Linux SDK
echo -e "${YELLOW}Downloading XPrinter Linux SDK...${NC}"
# Try to download from XPrinter official site
if wget -q -O linux_sdk.tar.gz "https://www.xprintertech.com/download" 2>/dev/null || \
   curl -L -o linux_sdk.tar.gz "https://www.xprintertech.com/download" 2>/dev/null; then
    
    echo -e "${YELLOW}Extracting XPrinter SDK...${NC}"
    tar -xzf linux_sdk.tar.gz
    
    # Find and run the installation script
    SDK_DIR=$(find . -maxdepth 2 -name "install.sh" -type f | head -1 | xargs dirname)
    if [ -n "$SDK_DIR" ] && [ -f "$SDK_DIR/install.sh" ]; then
        echo -e "${YELLOW}Running XPrinter installation...${NC}"
        cd "$SDK_DIR"
        sudo bash ./install.sh
        echo -e "${GREEN}✅ XPrinter SDK installed${NC}"
    else
        echo -e "${YELLOW}⚠️  XPrinter SDK installation script not found${NC}"
        echo -e "${YELLOW}Manual installation may be required${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Could not download XPrinter Linux SDK${NC}"
    echo -e "${YELLOW}Please download manually from: https://www.xprintertech.com/download${NC}"
fi

cd - > /dev/null
rm -rf "$TEMP_DIR"

# Wait for printer to be detected
sleep 2

# Remove any existing XPrinter configuration
sudo lpadmin -x XP-410B 2>/dev/null || true

# Detect XPrinter device
PRINTER_DEVICE=$(lpinfo -v 2>/dev/null | grep -i xprinter | grep usb | head -1 | awk '{print $2}')

if [ -z "$PRINTER_DEVICE" ]; then
    echo -e "${YELLOW}⚠️  XPrinter not auto-detected. Please ensure:${NC}"
    echo -e "${BLUE}   1. Printer is connected via USB${NC}"
    echo -e "${BLUE}   2. Printer is powered on${NC}"
    echo -e "${BLUE}   3. Run: sudo lpinfo -v | grep -i xprinter${NC}"
else
    echo -e "${YELLOW}Found XPrinter at: $PRINTER_DEVICE${NC}"
    
    # Find available XPrinter driver from SDK
    XPRINTER_DRIVER=$(lpinfo -m 2>/dev/null | grep -i xprinter | head -1 | awk '{print $1}')
    
    if [ -z "$XPRINTER_DRIVER" ]; then
        # Fallback to generic driver if XPrinter specific not found
        echo -e "${YELLOW}Using generic driver (XPrinter-specific driver not found)${NC}"
        XPRINTER_DRIVER="drv:///sample.drv/generic.ppd"
    fi
    
    # Add printer with detected driver
    sudo lpadmin -p XP-410B -v "$PRINTER_DEVICE" -E -m "$XPRINTER_DRIVER"
    
    # Set as default
    sudo lpadmin -d XP-410B
    echo -e "${GREEN}✅ XPrinter XP-410B configured with driver: $XPRINTER_DRIVER${NC}"
fi

# Verify printer setup
echo -e "${YELLOW}Printer status:${NC}"
lpstat -p -d

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating Python virtual environment...${NC}"
    # Use --system-site-packages to allow access to system-installed packages like python3-cups
    python3 -m venv --system-site-packages venv
fi

# Activate virtual environment
echo -e "${YELLOW}Activating Python virtual environment...${NC}"
source venv/bin/activate

# Upgrade pip to latest version
echo -e "${YELLOW}Upgrading pip...${NC}"
pip install --upgrade pip setuptools wheel

# Install Python dependencies
echo -e "${YELLOW}Installing Python dependencies...${NC}"
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install Python dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Python dependencies installed${NC}"

# Initialize database migrations (one-time setup)
echo -e "${YELLOW}Initializing database migrations...${NC}"
export FLASK_APP=run:app

# Create app/instance directory for database
mkdir -p app/instance

# Setup environment configuration
echo -e "${YELLOW}Setting up environment configuration...${NC}"
if [ ! -f "app/.env" ]; then
    if [ -f "app/.env.example" ]; then
        cp app/.env.example app/.env
        echo -e "${GREEN}✅ Created app/.env from app/.env.example${NC}"
        echo -e "${YELLOW}⚠️  Please edit app/.env and set your PRINTER_NAME${NC}"
    fi
else
    echo -e "${GREEN}✅ app/.env already exists${NC}"
fi

# Only run flask db init if migrations directory doesn't exist
if [ ! -d "app/migrations" ]; then
    flask db init
    echo -e "${GREEN}✅ Database migrations initialized${NC}"
else
    echo -e "${GREEN}✅ Database migrations already exist${NC}"
fi

# Apply migrations to create database tables
echo -e "${YELLOW}Creating database tables...${NC}"
flask db upgrade
echo -e "${GREEN}✅ Database tables created${NC}"

# Install frontend dependencies
echo -e "${YELLOW}Installing frontend dependencies...${NC}"
cd frontend

# Check if Node.js is installed
if ! command -v npm &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js/npm not found. Please install Node.js first:${NC}"
    echo -e "${BLUE}   Ubuntu/Debian: sudo apt install nodejs npm${NC}"
    echo -e "${BLUE}   Or visit: https://nodejs.org/${NC}"
    exit 1
fi

# Install frontend packages
npm install

# Return to root directory
cd ..

echo -e "\n${GREEN}✅ Installation complete!${NC}"
echo -e "${BLUE}Backend dependencies: Installed${NC}"
echo -e "${BLUE}Frontend dependencies: Installed${NC}"
echo -e "${BLUE}Database: Initialized${NC}"
echo -e "\n${YELLOW}You can now run:${NC}"
echo -e "${GREEN}  ./run.sh     - Start backend only${NC}"
echo -e "${GREEN}  ./dev.sh     - Start both backend + frontend${NC}"
