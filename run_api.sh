#!/bin/bash

# Change to the backend directory
cd backend

# Activate the virtual environment
source venv/bin/activate

# Set the Flask application file
export FLASK_APP=app.py

# Run the Flask application
flask run --host 0.0.0.0
