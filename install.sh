#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Installing Prerequisites${NC}\n"

# Install prerequisites
echo -e "${YELLOW}📦 Installing Python 3.11${NC}"
sudo apt install -y python3 python3-pip python3-venv

sudo apt install -y python3 python3-pip python3-venv

# Get the directory where this script is located (works from any directory)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

# Create virtual environment if it doesn't exist
echo -e "${YELLOW}Setting up Python environment...${NC}"
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating Python virtual environment...${NC}"
    # Use --system-site-packages to allow access to system-installed packages like python3-cups
    # assuming ACTUAL_USER is defined earlier
    sudo -u "$ACTUAL_USER" python3 -m venv --system-site-packages venv
fi

# Install Python dependencies using the venv's pip
echo -e "${YELLOW}Installing Python dependencies...${NC}"
# Activate and install in one go
sudo -u "$ACTUAL_USER" bash -c "source venv/bin/activate && pip install -r requirements.txt"
echo -e "${GREEN}✅ Python dependencies installed${NC}"