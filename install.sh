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

    ## Python Installation
    echo -e "${YELLOW}📦 Installing Python 3.x${NC}"
    if ! dpkg -s python3 &> /dev/null; then
        sudo apt install -y python3
    else
        echo -e "${GREEN}Python 3.x is already installed. Skipping installation.${NC}"
    fi

    if ! dpkg -s python3-pip &> /dev/null; then
        echo -e "${YELLOW}📦 Installing Python 3-pip${NC}"
        sudo apt install -y python3-pip
    else
        echo -e "${GREEN}Python 3-pip is already installed. Skipping installation.${NC}"
    fi

    if ! dpkg -s python3-venv &> /dev/null; then
        echo -e "${YELLOW}📦 Installing Python 3-venv${NC}"
        sudo apt install -y python3-venv
    else
        echo -e "${GREEN}Python 3-venv is already installed. Skipping installation.${NC}"
    fi

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

# ... the rest of your install.sh script would continue here, after prerequisites are handled.
# E.g., setting up virtual environment, installing pip dependencies, systemd services, etc.

