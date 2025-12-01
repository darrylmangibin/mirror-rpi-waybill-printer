#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Setting up RPI Waybill Printer Systemd Services${NC}\n"

# Check if running as sudo
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ This script must be run with sudo${NC}"
    echo -e "${YELLOW}Usage: sudo ./setup-systemd.sh${NC}"
    exit 1
fi

# Get the actual user (when running with sudo)
ACTUAL_USER=${SUDO_USER:-$(whoami)}

# Try to determine project directory
# First, try using the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/run.py" ] && [ -f "$SCRIPT_DIR/requirements.txt" ]; then
    PROJECT_DIR="$SCRIPT_DIR"
else
    # Fallback: assume standard location
    HOME_DIR=$(eval echo ~$ACTUAL_USER)
    PROJECT_DIR="$HOME_DIR/inspire-projects/rpi-waybill-printer"
fi

echo -e "${GREEN}✅ User: $ACTUAL_USER${NC}"
echo -e "${GREEN}✅ Project: $PROJECT_DIR${NC}\n"

# Verify project directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ Project directory not found: $PROJECT_DIR${NC}"
    echo -e "${YELLOW}Please run this script from the project root directory.${NC}"
    exit 1
fi

# Verify it's the correct project
if [ ! -f "$PROJECT_DIR/run.py" ] || [ ! -f "$PROJECT_DIR/requirements.txt" ]; then
    echo -e "${RED}❌ This doesn't appear to be the rpi-waybill-printer project${NC}"
    echo -e "${YELLOW}Missing run.py or requirements.txt${NC}"
    exit 1
fi

# Verify systemd service files exist
if [ ! -f "$PROJECT_DIR/rpi-waybill-printer-backend.service" ]; then
    echo -e "${RED}❌ Backend service file not found${NC}"
    echo -e "${YELLOW}Expected: $PROJECT_DIR/rpi-waybill-printer-backend.service${NC}"
    exit 1
fi

if [ ! -f "$PROJECT_DIR/rpi-waybill-printer-frontend.service" ]; then
    echo -e "${RED}❌ Frontend service file not found${NC}"
    echo -e "${YELLOW}Expected: $PROJECT_DIR/rpi-waybill-printer-frontend.service${NC}"
    exit 1
fi

# Create systemd service files with user substitution
echo -e "${YELLOW}📋 Installing systemd service files...${NC}"

# Backend service
BACKEND_SERVICE_CONTENT=$(cat "$PROJECT_DIR/rpi-waybill-printer-backend.service" | sed "s/%i/$ACTUAL_USER/g")
echo "$BACKEND_SERVICE_CONTENT" > /etc/systemd/system/rpi-waybill-printer-backend.service
echo -e "${GREEN}✅ Backend service installed${NC}"

# Frontend service
FRONTEND_SERVICE_CONTENT=$(cat "$PROJECT_DIR/rpi-waybill-printer-frontend.service" | sed "s/%i/$ACTUAL_USER/g")
echo "$FRONTEND_SERVICE_CONTENT" > /etc/systemd/system/rpi-waybill-printer-frontend.service
echo -e "${GREEN}✅ Frontend service installed${NC}"

# Reload systemd daemon
echo -e "${YELLOW}🔄 Reloading systemd daemon...${NC}"
systemctl daemon-reload
echo -e "${GREEN}✅ Systemd daemon reloaded${NC}"

# Enable services
echo -e "${YELLOW}⚙️  Enabling services to start on boot...${NC}"
systemctl enable rpi-waybill-printer-backend.service
echo -e "${GREEN}✅ Backend service enabled${NC}"

systemctl enable rpi-waybill-printer-frontend.service
echo -e "${GREEN}✅ Frontend service enabled${NC}"

# Optional: Start services now
echo -e "\n${BLUE}Services are now configured for auto-start on boot.${NC}"
read -p "Would you like to start the services now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Starting services...${NC}"
    systemctl start rpi-waybill-printer-backend.service
    sleep 2
    systemctl start rpi-waybill-printer-frontend.service
    sleep 2
    
    echo -e "${BLUE}Service Status:${NC}"
    systemctl status rpi-waybill-printer-backend.service --no-pager
    echo ""
    systemctl status rpi-waybill-printer-frontend.service --no-pager
else
    echo -e "${YELLOW}Services will start on next reboot.${NC}"
fi

echo -e "\n${GREEN}✅ Systemd setup complete!${NC}"
echo -e "\n${BLUE}Useful Commands:${NC}"
echo -e "${YELLOW}View service status:${NC}"
echo -e "  sudo systemctl status rpi-waybill-printer-backend.service"
echo -e "  sudo systemctl status rpi-waybill-printer-frontend.service"
echo -e "\n${YELLOW}View logs:${NC}"
echo -e "  sudo journalctl -u rpi-waybill-printer-backend.service -f"
echo -e "  sudo journalctl -u rpi-waybill-printer-frontend.service -f"
echo -e "\n${YELLOW}Manual service control:${NC}"
echo -e "  sudo systemctl start rpi-waybill-printer-backend.service"
echo -e "  sudo systemctl stop rpi-waybill-printer-backend.service"
echo -e "  sudo systemctl restart rpi-waybill-printer-backend.service"
echo -e "\n${BLUE}Access the application:${NC}"
echo -e "  Backend:  http://<pi-ip>:5000"
echo -e "  Frontend: http://<pi-ip>:5173"
echo -e "\n"

