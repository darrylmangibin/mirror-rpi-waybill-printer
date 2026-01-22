#!/bin/bash
# Startup script for RPI Waybill Printer Backend

ENVIRONMENT=${ENVIRONMENT:-development}

echo "Starting application in $ENVIRONMENT mode..."

if [ "$ENVIRONMENT" = "development" ]; then
    echo "Using Flask development server with hot-reload..."
    exec flask --app run.py run --debug --host=$HOST --port=$PORT
else
    echo "Using production server..."
    exec python run.py
fi
