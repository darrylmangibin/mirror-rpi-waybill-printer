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
    sudo apt install -y python3 python3-pip python3-venv
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
