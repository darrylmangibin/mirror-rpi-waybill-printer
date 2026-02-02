#!/bin/bash
# Development environment setup - Install dependencies locally for IDE support
# Run this once before starting development: ./dev-setup.sh

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🔧 Setting up development environment${NC}\n"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is required but not installed${NC}"
    exit 1
fi

# Check Node
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is required but not installed${NC}"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | awk '{print $2}')
NODE_VERSION=$(node --version)

echo -e "${GREEN}✅ Python ${PYTHON_VERSION}${NC}"
echo -e "${GREEN}✅ Node ${NODE_VERSION}${NC}"
echo ""

# Create Python virtual environment
echo -e "${YELLOW}📦 Installing Python dependencies...${NC}"
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✅ Created venv/${NC}"
fi

source venv/bin/activate
pip install --upgrade pip > /dev/null 2>&1
pip install -r requirements.txt
deactivate

echo -e "${GREEN}✅ Python dependencies installed${NC}"

# Install Node dependencies
echo -e "${YELLOW}📦 Installing Node dependencies...${NC}"
cd frontend
npm install
cd ..
echo -e "${GREEN}✅ Node dependencies installed${NC}"

echo ""
echo -e "${GREEN}✅ Development environment ready!${NC}"
echo ""
echo -e "${BLUE}Your IDE can now see:${NC}"
echo -e "  • Python: ./venv/bin/python"
echo -e "  • TypeScript: ./frontend/node_modules"
echo ""
echo -e "${BLUE}To start development:${NC}"
echo -e "  ./docker.sh dev --build"
echo ""
