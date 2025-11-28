#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Updating RPI Waybill Printer${NC}\n"

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

# Get the actual user (when running with sudo)
ACTUAL_USER=${SUDO_USER:-$(whoami)}

# 1. Pull latest changes from git
echo -e "${YELLOW}📥 Pulling latest changes from git...${NC}"
git pull origin main
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Git pull successful${NC}\n"
else
    echo -e "${RED}❌ Git pull failed${NC}\n"
    exit 1
fi

# 2. Update Python dependencies
echo -e "${YELLOW}📦 Updating Python dependencies...${NC}"
if [ -d "venv" ]; then
    ./venv/bin/pip install -r requirements.txt
    echo -e "${GREEN}✅ Python dependencies updated${NC}\n"
else
    echo -e "${YELLOW}⚠️  Virtual environment not found. Skipping Python update.${NC}"
    echo -e "${YELLOW}   Run Installer.desktop first for full setup.${NC}\n"
fi

# 3. Apply database migrations (if any new ones were added)
echo -e "${YELLOW}🗄️  Checking for database migrations...${NC}"
if [ -d "venv" ]; then
    export FLASK_APP=run:app
    ./venv/bin/flask db upgrade
    echo -e "${GREEN}✅ Database migrations applied${NC}\n"
fi

# 4. Update frontend dependencies
echo -e "${YELLOW}📦 Updating frontend dependencies...${NC}"
cd frontend

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ Node.js/npm not found${NC}"
    echo -e "${YELLOW}   Run Installer.desktop first for full setup.${NC}"
    exit 1
fi

sudo -u "$ACTUAL_USER" npm install
echo -e "${GREEN}✅ Frontend dependencies updated${NC}\n"

# Return to root directory
cd ..

echo -e "${GREEN}✅ Update complete!${NC}"
echo -e "${BLUE}Latest code: Pulled${NC}"
echo -e "${BLUE}Backend dependencies: Updated${NC}"
echo -e "${BLUE}Frontend dependencies: Updated${NC}"
echo -e "${BLUE}Database: Migrated${NC}"
echo -e "\n${YELLOW}Next step:${NC}"
echo -e "${BLUE}  Click 'Waybill-Auto-Run' to restart the service${NC}"

