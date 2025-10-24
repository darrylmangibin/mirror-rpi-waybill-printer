#!/bin/bash

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip3 install -r requirements.txt

# Initialize database migrations (one-time setup)
echo "Initializing database migrations..."
export FLASK_APP=run:app

# Create app/instance directory for database
mkdir -p app/instance

# Only run flask db init if migrations directory doesn't exist
if [ ! -d "app/migrations" ]; then
    flask db init
    echo "✅ Database migrations initialized"
else
    echo "✅ Database migrations already exist"
fi

echo "✅ Installation complete! You can now run './run.sh' to start the server."
