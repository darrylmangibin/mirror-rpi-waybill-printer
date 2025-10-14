#!/bin/bash
# Simple script to start the Flask app

cd "$(dirname "$0")"
source venv/bin/activate
python3 app.py
