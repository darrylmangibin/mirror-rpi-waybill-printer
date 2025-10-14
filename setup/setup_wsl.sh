#!/bin/bash

# 🖨️ Waybill Printer - WSL Setup Script
# This script sets up the development environment on Windows WSL

set -e  # Exit on any error

echo "🚀 Starting Waybill Printer WSL Setup..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running on WSL
if ! grep -q "microsoft" /proc/version 2>/dev/null; then
    print_warning "This script is designed for Windows WSL. Continuing anyway..."
fi

# Step 1: Check Python version
print_status "Checking Python installation..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    print_success "Python3 found: $PYTHON_VERSION"
else
    print_error "Python3 not found. Please install Python 3.9+ first."
    exit 1
fi

# Step 2: Update system packages
print_status "Updating system packages..."
sudo apt update -qq

# Step 3: Install required system packages
print_status "Installing system dependencies..."
sudo apt install -y python3.12-venv python3-pip curl git

# Step 4: Check if we're in the right directory
if [ ! -f "backend/app.py" ]; then
    print_error "backend/app.py not found. Make sure you're in the project root directory."
    print_status "Current directory: $(pwd)"
    print_status "Expected files: backend/app.py, backend/requirements.txt"
    exit 1
fi

# Step 5: Create virtual environment
print_status "Creating Python virtual environment..."
cd backend

if [ -d "venv" ]; then
    print_warning "Virtual environment already exists. Removing old one..."
    rm -rf venv
fi

python3 -m venv venv
print_success "Virtual environment created"

# Step 6: Activate virtual environment and install dependencies
print_status "Installing Python dependencies..."
source venv/bin/activate

if [ ! -f "requirements.txt" ]; then
    print_error "requirements.txt not found in backend directory"
    exit 1
fi

pip install --upgrade pip
pip install -r requirements.txt
print_success "Python dependencies installed"

# Step 7: Create environment file
print_status "Setting up configuration..."
if [ ! -f ".env" ]; then
    if [ -f "env.example" ]; then
        cp env.example .env
        print_success "Environment file created from template"
    else
        # Create basic .env file
        cat > .env << EOF
# Flask Configuration
DEBUG=True
SECRET_KEY=dev-secret-key-change-in-production

# Database Configuration
DATABASE_PATH=waybill_printer.db

# Print Configuration
PDF_CACHE_DIR=/tmp/waybills
MAX_RETRY_COUNT=3

# Server Configuration
HOST=0.0.0.0
PORT=5000
EOF
        print_success "Basic environment file created"
    fi
else
    print_warning "Environment file already exists"
fi

# Step 8: Create PDF cache directory
print_status "Creating PDF cache directory..."
mkdir -p /tmp/waybills
chmod 755 /tmp/waybills
print_success "PDF cache directory created"

# Step 9: Create run script
print_status "Creating run script..."
cat > run.sh << 'EOF'
#!/bin/bash
# Simple script to start the Flask app

cd "$(dirname "$0")"
source venv/bin/activate
python3 app.py
EOF

chmod +x run.sh
print_success "Run script created"

# Step 10: Test the installation
print_status "Testing installation..."
source venv/bin/activate

# Quick test - try to import Flask
if python3 -c "import flask; print('Flask version:', flask.__version__)" 2>/dev/null; then
    print_success "Flask installation verified"
else
    print_error "Flask installation failed"
    exit 1
fi

# Step 11: Display success message and next steps
echo ""
echo "🎉 WSL Setup Complete!"
echo "======================"
print_success "Virtual environment created in backend/venv"
print_success "Dependencies installed"
print_success "Configuration files created"
print_success "Run script created"

echo ""
echo "📋 Next Steps:"
echo "-------------"
echo "1. Start the Flask app:"
echo "   cd backend"
echo "   ./run.sh"
echo ""
echo "2. Test in browser:"
echo "   http://localhost:5000"
echo ""
echo "3. Test with curl:"
echo "   curl http://localhost:5000"
echo ""
echo "4. Create a test print job:"
echo "   curl -X POST http://localhost:5000/api/jobs \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"invoice_number\": \"TEST-001\", \"pdf_url\": \"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf\"}'"
echo ""

print_status "Setup completed successfully! 🚀"
