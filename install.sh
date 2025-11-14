#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Installing RPI Waybill Printer (Backend + Frontend)${NC}\n"

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${YELLOW}Python 3 not found. Installing Python 3...${NC}"
    sudo apt update
    sudo apt install -y python3 python3-pip
    echo -e "${GREEN}✅ Python 3 installed${NC}"
fi

# Install CUPS for printing functionality
echo -e "${YELLOW}Installing CUPS (Common Unix Printing System)...${NC}"
if ! command -v lpstat &> /dev/null; then
    sudo apt update
    sudo apt install -y cups cups-client python3-cups
    sudo systemctl start cups
    sudo systemctl enable cups
    echo -e "${GREEN}✅ CUPS installed and enabled${NC}"
else
    echo -e "${GREEN}✅ CUPS already installed${NC}"
    # Ensure Python3 CUPS bindings are installed
    if ! dpkg -l | grep -q python3-cups; then
        echo -e "${YELLOW}Installing Python3 CUPS bindings...${NC}"
        sudo apt update
        sudo apt install -y python3-cups
        echo -e "${GREEN}✅ Python3 CUPS bindings installed${NC}"
    fi
fi

# Install printer drivers and utilities
echo -e "${YELLOW}Installing printer drivers and utilities...${NC}"
sudo apt update
sudo apt install -y printer-driver-all imagemagick ghostscript
echo -e "${GREEN}✅ Printer drivers and utilities installed${NC}"

# Add current user to lpadmin group for printer management
echo -e "${YELLOW}Adding current user to lpadmin group...${NC}"
sudo usermod -aG lpadmin $(whoami)
echo -e "${GREEN}✅ User added to lpadmin group${NC}"

# Enable CUPS remote access
echo -e "${YELLOW}Enabling CUPS remote access...${NC}"
sudo cupsctl --remote-any
sudo systemctl restart cups
echo -e "${GREEN}✅ CUPS remote access enabled${NC}"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating Python virtual environment...${NC}"
    # Use --system-site-packages to allow access to system-installed packages like python3-cups
    python3 -m venv --system-site-packages venv
fi

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
echo -e "${YELLOW}Installing Python dependencies...${NC}"
pip3 install -r requirements.txt

# Initialize database migrations (one-time setup)
echo -e "${YELLOW}Initializing database migrations...${NC}"
export FLASK_APP=run:app

# Create app/instance directory for database
mkdir -p app/instance

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
echo -e "${BLUE}Printer utilities: Installed${NC}"
echo -e "\n${YELLOW}Next steps for printer setup:${NC}"
echo -e "${BLUE}1. Physically connect your XB-410B printer to the Raspberry Pi (USB/Network)${NC}"
echo -e "${BLUE}2. Open http://<your-pi-ip>:631 in your browser${NC}"
echo -e "${BLUE}3. Navigate to Administration → Add Printer${NC}"
echo -e "${BLUE}4. Select your XB-410B from the list${NC}"
echo -e "${BLUE}5. Choose a driver (generic thermal driver works)${NC}"
echo -e "${BLUE}6. Configure label size and settings, then set as default${NC}"
echo -e "\n${YELLOW}You can now run:${NC}"
echo -e "${GREEN}  ./run.sh     - Start backend only${NC}"
echo -e "${GREEN}  ./dev.sh     - Start both backend + frontend${NC}"
