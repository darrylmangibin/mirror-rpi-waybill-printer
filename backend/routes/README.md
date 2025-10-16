# API Routes

This directory contains Flask Blueprints that organize application routes.

## Structure

- **api.py** - Contains the main API routes blueprint (`/api` prefix)

## Adding New Routes

To add new routes, either:
1. Add them to `api.py` for the main API
2. Create a new blueprint file for a separate route group (e.g., `admin.py`)

## Blueprint Registration

All blueprints are registered in `app.py` using `app.register_blueprint()`.
