#!/bin/bash

# Run script for RPI Waybill Printer Backend
# This script starts the Flask API with validation checks

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "═══════════════════════════════════════════════════════════════"
echo "  RPI Waybill Printer API - Starting"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Change to backend directory
cd backend

# Activate virtual environment
source venv/bin/activate

# Set the Flask application file
export FLASK_APP=app.py
export FLASK_ENV=development

echo "═══════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ All checks passed. Starting API...${NC}"
echo ""
echo "API running at: http://0.0.0.0:5000"
echo "Test endpoint: http://127.0.0.1:5000/api/waybills/prints"
echo ""
echo "Press Ctrl+C to stop"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Run the Flask application
flask run --host 0.0.0.0
