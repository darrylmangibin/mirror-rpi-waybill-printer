#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 RPI Waybill Printer Installation${NC}\n"

# STEP #1: Ask user for installation mode
echo -e "${YELLOW}Please select installation mode:${NC}"
echo "  1) Online Installation (requires internet access to download packages)"
echo "  2) Offline Installation (requires pre-downloaded .deb packages in a 'debs/' folder)"
read -p "Enter your choice (1 or 2): " -n 1 -r
echo

INSTALL_MODE=""
if [[ "$REPLY" == "1" ]]; then
    INSTALL_MODE="online"
elif [[ "$REPLY" == "2" ]]; then
    INSTALL_MODE="offline"
else
    echo -e "${RED}Invalid choice. Exiting installation.${NC}"
    exit 1
fi

if [[ "$INSTALL_MODE" == "online" ]]; then
    echo -e "${BLUE}Proceeding with Online Installation...${NC}\n"

    # Existing online installation logic goes here:
    sudo apt update

    # Get the actual user (when running with sudo)
    # This is crucial for setting correct file permissions for venv, database, etc.
    ACTUAL_USER=${SUDO_USER:-$(whoami)}
    echo -e "${GREEN}✅ Running with admin privileges as user: $ACTUAL_USER${NC}\n"

    # Ensure the entire project directory has correct permissions for the actual user
    echo -e "${BLUE}Setting ownership and permissions for the entire rpi-waybill-printer project...${NC}"
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    sudo chown -R "$ACTUAL_USER:$ACTUAL_USER" "$SCRIPT_DIR" # SCRIPT_DIR is the project root
    sudo chmod -R u+w "$SCRIPT_DIR"
    echo -e "${GREEN}✅ Project directory permissions set${NC}"

    # Configure environment files (.env) and VITE_BASE_URL
    source ./installers/configure-env.sh

    ## Python Installation
    source ./installers/python.sh

    # Get the actual user (when running with sudo)
    # This is crucial for setting correct file permissions for venv, database, etc.
    ACTUAL_USER=${SUDO_USER:-$(whoami)}
    echo -e "${GREEN}✅ Running with admin privileges as user: $ACTUAL_USER${NC}\n"

    # Install CUPS for printing functionality with Zebra support
    source ./installers/cups.sh

    # Install Node.js and npm
    source ./installers/node.sh

    # Install Chromium for HTML-to-PDF conversion
    source ./installers/chromium.sh

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
    pwd # Add this to check the current working directory
    sudo -u "$ACTUAL_USER" ./venv/bin/pip install -r "$SCRIPT_DIR/requirements.txt"
    echo -e "${GREEN}✅ Python dependencies installed${NC}"

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

elif [[ "$INSTALL_MODE" == "offline" ]]; then
    echo -e "${BLUE}Proceeding with Offline Installation...${NC}\n"
    # TODO: Implement actual offline installation logic here.
    # This will involve installing .deb packages from a local 'debs/' directory.
    echo -e "${YELLOW}Offline installation chosen. This feature is not yet fully implemented.${NC}"
    echo -e "${YELLOW}Please ensure you have pre-downloaded .deb packages in the 'debs/' folder.${NC}"
    echo -e "${YELLOW}For now, you'll need to manually install them or proceed with online mode.${NC}"
    # No exit here, allowing the script to continue, but a robust offline mode
    # would likely install packages or provide clearer instructions.
fi

# Enable systemd services (includes CUPS auto-configuration)
source ./installers/setup-systemd.sh
