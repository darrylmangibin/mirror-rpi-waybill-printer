# RPI Waybill Printer

A local printing solution using Flask backend and React frontend for Raspberry Pi 5.

## Project Structure

```text
rpi-waybill-printer/
├── app/           # Backend API (Flask)
├── frontend/      # Frontend app (React)
├── requirements.txt  # Python dependencies
├── run.py            # Flask entrypoint
├── run.sh            # Script to start backend server
├── install.sh        # One-time install/setup script
├── dev.sh            # Script for dev server/workflow
├── artisan.sh        # Helper script for DB and dev commands
└── README.md         # Project docs
```

## Getting Started

### Installation

Run the one-time installation script to set up both backend and frontend:

```bash
./install.sh
```

**What `install.sh` does:**

- **Backend Setup:**
  - Creates Python virtual environment (`venv/`)
  - Installs Flask and all Python dependencies from `requirements.txt`
  - Initializes database migrations
  - Creates necessary directories (`app/instance/`)

- **Frontend Setup:**
  - Checks for Node.js/npm availability
  - Installs all React dependencies from `frontend/package.json`
  - Sets up the complete development environment

- **Verification:**
  - Provides clear status updates with colored output
  - Shows next steps for running the application

**Prerequisites:**
- Python 3.x
- Node.js and npm (will prompt for installation if missing)

### Running the Application

After installation, you can start the services:

```bash
# Start backend only (Flask API on port 5000)
./run.sh

# Start both backend + frontend (development mode)
./dev.sh
```

The `dev.sh` script runs:
- Backend: http://localhost:5000
- Frontend: http://localhost:5173
