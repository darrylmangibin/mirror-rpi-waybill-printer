#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 RPI Waybill Printer - Auto Run Script${NC}\n"

# Check if running as sudo for systemctl
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ This script must be run with sudo${NC}"
    echo -e "${YELLOW}Usage: sudo ./auto_run.sh${NC}"
    exit 1
fi

SERVICE_NAME="rpi-waybill-printer.service"

# Function to check service status
check_status() {
    if systemctl is-active --quiet $SERVICE_NAME; then
        echo -e "${GREEN}✅ Service is running${NC}"
        return 0
    else
        echo -e "${RED}❌ Service is not running${NC}"
        return 1
    fi
}

# Function to restart service
restart_service() {
    echo -e "${YELLOW}🔄 Restarting service...${NC}"
    systemctl restart $SERVICE_NAME
    sleep 2
    
    if systemctl is-active --quiet $SERVICE_NAME; then
        echo -e "${GREEN}✅ Service restarted successfully!${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to restart service${NC}"
        return 1
    fi
}

# Function to show logs
show_logs() {
    echo -e "${BLUE}📋 Showing service logs (Press Ctrl+C to exit)...${NC}\n"
    journalctl -u $SERVICE_NAME -f --no-pager
}

# Main logic
echo -e "${BLUE}Current Service Status:${NC}"
check_status
SERVICE_RUNNING=$?

if [ $SERVICE_RUNNING -eq 0 ]; then
    echo -e "\n${BLUE}Service is already running.${NC}"
    echo -e "${YELLOW}Options:${NC}"
    echo "1) Restart service"
    echo "2) Show logs"
    echo "3) Exit"
    read -p "Enter choice (1-3): " choice
    
    case $choice in
        1)
            restart_service
            ;;
        2)
            show_logs
            ;;
        3)
            echo -e "${BLUE}Exiting...${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid choice${NC}"
            exit 1
            ;;
    esac
else
    echo -e "\n${YELLOW}Service is not running. Starting it now...${NC}"
    systemctl start $SERVICE_NAME
    sleep 2
    
    if systemctl is-active --quiet $SERVICE_NAME; then
        echo -e "${GREEN}✅ Service started successfully!${NC}"
    else
        echo -e "${RED}❌ Failed to start service${NC}"
        echo -e "${YELLOW}Showing error logs:${NC}"
        journalctl -u $SERVICE_NAME -n 20 --no-pager
        exit 1
    fi
fi

echo -e "\n${GREEN}✅ Done!${NC}"
echo -e "${BLUE}Backend:  http://<your-pi-ip>:5000${NC}"
echo -e "${BLUE}Frontend: http://<your-pi-ip>:5173${NC}"

