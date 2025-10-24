#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting RPI Waybill Printer (Backend + Frontend)${NC}\n"

# Activate virtual environment
source venv/bin/activate

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Stopping all services...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${YELLOW}All services stopped.${NC}"
    exit 0
}

# Set trap to cleanup on Ctrl+C
trap cleanup EXIT INT TERM

# Start Flask Backend in background
echo -e "${GREEN}📦 Starting Flask Backend (http://localhost:5000)${NC}"
python3 run.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start React Frontend in background
echo -e "${GREEN}⚛️  Starting React Frontend (http://localhost:5173)${NC}\n"
cd frontend
npm run dev &
FRONTEND_PID=$!

echo -e "\n${GREEN}✅ Both services are running!${NC}"
echo -e "${BLUE}Backend:  http://localhost:5000${NC}"
echo -e "${BLUE}Frontend: http://localhost:5173${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}\n"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
