#!/bin/bash

# 🖨️ Waybill Printer - Simple Start Script
# This script starts the Flask app with proper environment

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Waybill Printer...${NC}"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${RED}❌ Virtual environment not found!${NC}"
    echo "Please run the setup script first:"
    echo "  chmod +x ../setup/setup_wsl.sh"
    echo "  ../setup/setup_wsl.sh"
    exit 1
fi

# Check if app.py exists
if [ ! -f "app.py" ]; then
    echo -e "${RED}❌ app.py not found!${NC}"
    echo "Make sure you're in the backend directory"
    exit 1
fi

# Activate virtual environment
echo -e "${BLUE}📦 Activating virtual environment...${NC}"
source venv/bin/activate

# Check if Flask is installed
if ! python3 -c "import flask" 2>/dev/null; then
    echo -e "${RED}❌ Flask not installed!${NC}"
    echo "Installing dependencies..."
    pip install -r requirements.txt
fi

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${BLUE}⚙️ Creating environment file...${NC}"
    cp env.example .env 2>/dev/null || cat > .env << 'EOF'
DEBUG=True
SECRET_KEY=dev-secret-key
DATABASE_PATH=waybill_printer.db
PDF_CACHE_DIR=/tmp/waybills
MAX_RETRY_COUNT=3
HOST=0.0.0.0
PORT=5000
EOF
fi

# Create PDF cache directory
mkdir -p /tmp/waybills 2>/dev/null

# Kill any existing Flask processes on port 5000
echo -e "${BLUE}🔄 Checking for existing Flask processes...${NC}"
if lsof -ti:5000 >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️ Port 5000 is busy, stopping existing processes...${NC}"
    lsof -ti:5000 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

echo -e "${GREEN}✅ Environment ready!${NC}"
echo -e "${BLUE}🌐 Starting Flask app...${NC}"
echo ""

# Start the Flask app
python3 app.py
