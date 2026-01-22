#!/bin/bash
# Startup script for RPI Waybill Printer Backend

ENVIRONMENT=${ENVIRONMENT:-development}

echo "Starting application in $ENVIRONMENT mode..."

# Run database migrations
echo "Running database migrations..."
export FLASK_APP=run:app

# Create app/instance directory for database if it doesn't exist
mkdir -p app/instance

# Check if migrations directory exists, if not initialize it
if [ ! -d "app/migrations" ]; then
    echo "Initializing database migrations..."
    flask db init
    echo "✅ Database migrations initialized"
fi

# Apply any pending migrations
echo "Applying database migrations..."
flask db upgrade
echo "✅ Database migrations applied"

# Start the application
if [ "$ENVIRONMENT" = "development" ]; then
    echo "Using Flask development server with hot-reload..."
    exec flask --app run.py run --debug --host=$HOST --port=$PORT
else
    echo "Using production server..."
    exec python run.py
fi
