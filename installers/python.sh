#!/bin/bash

# Colors for output (assuming these are defined in the main script or will be sourced)
# You might want to pass these as arguments or define them here if python.sh runs independently.
# For now, I'll assume they're available or you'll add them.
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

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