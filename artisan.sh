#!/bin/bash

# Activate environment
source venv/bin/activate
export FLASK_APP=run:app

# Handle special commands
case "$1" in
    "init")
        echo "✅ Flask environment activated!"
        echo "💡 Now use: flask db migrate, flask db upgrade, etc."
        exec "$SHELL"
        ;;
    "migrate")
        flask db migrate -m "$2"
        ;;
    "upgrade")
        flask db upgrade
        ;;
    "rollback")
        flask db downgrade
        ;;
    "status")
        flask db history
        ;;
    "routes")
        flask routes
        ;;
    *)
        # Pass everything else to flask
        flask "$@"
        ;;
esac