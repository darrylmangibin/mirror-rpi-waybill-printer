#!/bin/bash

# Setup script for RPI Waybill Printer Backend
# This script performs a one-time setup of the project

set -e  # Exit on error

echo "═══════════════════════════════════════════════════════════════"
echo "  RPI Waybill Printer - Setup Script"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Step 1: Check if Python is installed
echo "📍 Step 1: Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.8 or higher."
    exit 1
fi
echo "✓ Python 3 found: $(python3 --version)"
echo ""

# Step 1.5: Check and install CUPS (for printer support)
echo "📍 Step 1.5: Setting up CUPS (printer system)..."
if command -v cups-config &> /dev/null; then
    echo "✓ CUPS already installed"
else
    echo "  → Installing CUPS..."
    sudo apt-get update > /dev/null 2>&1
    sudo apt-get install -y cups > /dev/null 2>&1
    echo "  ✓ CUPS installed"
fi

# Enable CUPS auto-start
echo "  → Enabling CUPS auto-start..."
sudo systemctl enable cups > /dev/null 2>&1
sudo service cups start > /dev/null 2>&1
echo "  ✓ CUPS enabled and started"

# Configure CUPS for local access without password
echo "  → Configuring CUPS (no password required)..."
sudo cupsctl --share-printers --user-cancel-any --remote-admin > /dev/null 2>&1
sudo service cups restart > /dev/null 2>&1
echo "  ✓ CUPS configured for password-free local access"
echo ""

# Step 2: Create virtual environment if it doesn't exist
echo "📍 Step 2: Setting up virtual environment..."
if [ -d "backend/venv" ]; then
    echo "✓ Virtual environment already exists"
else
    cd backend
    python3 -m venv venv
    cd ..
    echo "✓ Virtual environment created"
fi
echo ""

# Step 3: Activate virtual environment and install dependencies
echo "📍 Step 3: Installing dependencies..."
cd backend
source venv/bin/activate
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt
echo "✓ Dependencies installed"
echo ""

# Step 4: Initialize Flask-Migrate if needed
echo "📍 Step 4: Initializing database..."
if [ ! -d "migrations" ]; then
    echo "  → Initializing Flask-Migrate..."
    flask db init --quiet
    echo "  ✓ Flask-Migrate initialized"
fi
echo ""

# Step 5: Apply migrations
echo "📍 Step 5: Applying database migrations..."
flask db upgrade
echo "✓ Database migrations applied"
echo ""

# Step 6: Verify setup with verification script
echo "📍 Step 6: Verifying setup..."
python3 verify_setup.py
echo ""

cd ..

echo "═══════════════════════════════════════════════════════════════"
echo "✅ Setup completed successfully!"
echo ""
echo "Next steps:"
echo "  1. Run: ./run_api.sh"
echo "  2. Access API at: http://127.0.0.1:5000/api/waybills/prints"
echo ""
echo "═══════════════════════════════════════════════════════════════"
