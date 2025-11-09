#!/bin/bash

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting RPI Waybill Printer (Backend + Frontend)${NC}\n"

# Check if running on Raspberry Pi and get available memory
if [ -f /proc/meminfo ]; then
    AVAILABLE_MEM=$(grep MemAvailable /proc/meminfo | awk '{print $2}')
    if [ "$AVAILABLE_MEM" -lt 524288 ]; then  # Less than 512MB
        echo -e "${YELLOW}⚠️  Low available memory: $(( AVAILABLE_MEM / 1024 ))MB${NC}"
        echo -e "${YELLOW}This may cause issues. Consider closing other applications.${NC}\n"
    fi
fi

# Activate virtual environment with proper path handling
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Virtual environment not found. Creating...${NC}"
    python3 -m venv venv
fi

if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
else
    echo -e "${RED}❌ Virtual environment activation failed${NC}"
    exit 1
fi

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Stopping all services...${NC}"
    
    # Kill child processes gracefully
    if [ -n "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
        kill "$BACKEND_PID" 2>/dev/null || true
        sleep 1
    fi
    
    if [ -n "$FRONTEND_PID" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
        kill "$FRONTEND_PID" 2>/dev/null || true
        sleep 1
    fi
    
    echo -e "${GREEN}✅ All services stopped.${NC}"
    exit 0
}

# Set trap to cleanup on Ctrl+C
trap cleanup EXIT INT TERM

# Start Flask Backend in background
echo -e "${GREEN}📦 Starting Flask Backend (http://localhost:5000)${NC}"
if ! python3 run.py > /tmp/rpi_backend.log 2>&1 &
then
    echo -e "${RED}❌ Failed to start backend${NC}"
    exit 1
fi
BACKEND_PID=$!

# Wait a moment for backend to start and verify it's running
sleep 3

if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    echo -e "${RED}❌ Backend process died. Check logs:${NC}"
    cat /tmp/rpi_backend.log
    exit 1
fi

# Verify frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}📥 Installing frontend dependencies (this may take a few minutes on Raspberry Pi)...${NC}"
    cd frontend
    npm install --prefer-offline --no-audit
    cd ..
fi

# Start React Frontend in background with optimizations for Raspberry Pi
echo -e "${GREEN}⚛️  Starting React Frontend (http://localhost:5173)${NC}"
echo -e "${YELLOW}(First start may be slow on Raspberry Pi - please be patient)${NC}\n"

cd frontend

# Set environment variables for better Raspberry Pi performance
export NODE_OPTIONS="--max-old-space-size=512"

if ! npm run dev > /tmp/rpi_frontend.log 2>&1 &
then
    echo -e "${RED}❌ Failed to start frontend${NC}"
    exit 1
fi
FRONTEND_PID=$!

sleep 2

if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
    echo -e "${RED}❌ Frontend process died. Check logs:${NC}"
    cat /tmp/rpi_frontend.log
    exit 1
fi

# Back to root directory
cd ..

echo -e "\n${GREEN}✅ Both services are running!${NC}"
echo -e "${BLUE}Backend:  http://localhost:5000${NC}"
echo -e "${BLUE}Frontend: http://localhost:5173${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo -e "${YELLOW}Logs saved to: /tmp/rpi_backend.log and /tmp/rpi_frontend.log${NC}\n"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
