#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Installing RPI Waybill Printer (Backend + Frontend)${NC}\n"

# ============================================
# PRINTING SETUP FOR RASPBERRY PI
# ============================================

echo -e "${BLUE}📢 Setting up Printing System for Raspberry Pi${NC}\n"

# Step 1: Check and Install CUPS
echo -e "${YELLOW}Step 1: Checking CUPS installation...${NC}"
if ! command -v lpstat &> /dev/null; then
    echo -e "${YELLOW}  CUPS not found. Installing CUPS...${NC}"
    sudo apt update
    sudo apt install -y cups
    echo -e "${GREEN}  ✅ CUPS installed${NC}"
else
    echo -e "${GREEN}  ✅ CUPS already installed${NC}"
fi

# Step 2: Add current user to lpadmin group
echo -e "${YELLOW}Step 2: Adding current user to lpadmin group...${NC}"
CURRENT_USER=$SUDO_USER
if [ -z "$CURRENT_USER" ]; then
    CURRENT_USER=$(whoami)
fi
sudo usermod -aG lpadmin $CURRENT_USER
echo -e "${GREEN}  ✅ User '$CURRENT_USER' added to lpadmin group${NC}"

# Step 3: Start and enable CUPS service
echo -e "${YELLOW}Step 3: Starting CUPS service...${NC}"
sudo systemctl start cups
sudo systemctl enable cups
echo -e "${GREEN}  ✅ CUPS service started and enabled on boot${NC}"

# Step 4: Install optional printer drivers
echo -e "${YELLOW}Step 4: Installing printer drivers...${NC}"
sudo apt install -y printer-driver-gutenprint
echo -e "${GREEN}  ✅ Printer drivers installed${NC}"

# Step 5: Configure CUPS for network access
echo -e "${YELLOW}Step 5: Configuring CUPS for network access...${NC}"
sudo sed -i 's/Listen localhost:631/Port 631/g' /etc/cups/cupsd.conf
sudo systemctl restart cups
echo -e "${GREEN}  ✅ CUPS configured for network access${NC}"

# Step 6: Verify CUPS is working
echo -e "${YELLOW}Step 6: Verifying CUPS installation...${NC}"
if sudo systemctl is-active --quiet cups; then
    echo -e "${GREEN}  ✅ CUPS service is running${NC}"
else
    echo -e "${YELLOW}  ⚠️  CUPS service is not running. Try: sudo systemctl restart cups${NC}"
fi

echo -e "${GREEN}  ✅ Printing system setup complete!${NC}\n"

# ============================================
# PYTHON AND BACKEND SETUP
# ============================================

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${YELLOW}Python 3 not found. Installing Python 3...${NC}"
    sudo apt update
    sudo apt install -y python3 python3-pip
    echo -e "${GREEN}✅ Python 3 installed${NC}"
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating Python virtual environment...${NC}"
    python3 -m venv venv
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

# ============================================
# INSTALLATION COMPLETE
# ============================================

echo -e "\n${GREEN}✅ Installation complete!${NC}\n"

echo -e "${BLUE}📦 Installed Components:${NC}"
echo -e "  ${GREEN}✓${NC} CUPS Printing System"
echo -e "  ${GREEN}✓${NC} Printer Drivers (Gutenprint)"
echo -e "  ${GREEN}✓${NC} Python Backend Dependencies"
echo -e "  ${GREEN}✓${NC} Frontend Dependencies"
echo -e "  ${GREEN}✓${NC} Database Initialized"

echo -e "\n${BLUE}🖨️  Printer Setup Instructions:${NC}"
echo -e "  1. Get your Raspberry Pi IP address:"
echo -e "     ${YELLOW}hostname -I${NC}"
echo -e "\n  2. Open your web browser and navigate to:"
echo -e "     ${YELLOW}https://<your-pi-ip>:631${NC}"
echo -e "\n  3. Go to ${YELLOW}Administration${NC} → ${YELLOW}Add Printer${NC}"
echo -e "\n  4. Select your printer:"
echo -e "     • USB Printers: Listed directly"
echo -e "     • Network Printers: Auto-discovered or add manually"
echo -e "\n  5. Set as default printer (optional)"
echo -e "\n  6. Test print from command line:"
echo -e "     ${YELLOW}lp -o media=A4 /path/to/test.pdf${NC}"

echo -e "\n${BLUE}🚀 Quick Start Commands:${NC}"
echo -e "  ${GREEN}./run.sh${NC}     - Start backend only"
echo -e "  ${GREEN}./dev.sh${NC}     - Start both backend + frontend"

echo -e "\n${BLUE}📝 Useful Printer Commands:${NC}"
echo -e "  ${YELLOW}lpstat -p${NC}              - List all printers"
echo -e "  ${YELLOW}lpstat -d${NC}              - Show default printer"
echo -e "  ${YELLOW}lpadmin -d <name>{{NC}}     - Set default printer"
echo -e "  ${YELLOW}lpstat -o{{NC}}             - Show print queue"
echo -e "  ${YELLOW}cancel <job-id>{{NC}}       - Cancel print job"

echo -e "\n${YELLOW}⚠️  Important Note:${NC}"
echo -e "  You may need to ${YELLOW}log out and log back in{{NC}} for group changes to take effect."
echo -e "  Or run: ${YELLOW}newgrp lpadmin{{NC}}\n"
