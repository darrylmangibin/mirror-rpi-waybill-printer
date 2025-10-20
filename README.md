# RPI Waybill Printer

A local printing solution using Flask backend and React frontend for Raspberry Pi 5.

## Project Structure

```text
rpi-waybill-printer/
├── app/
│   └── __init__.py         # Flask app with basic hello world
├── frontend/               # React dashboard (coming soon)
│   └── README.md
├── requirements.txt        # Python dependencies
├── run.py                  # Entry point
└── README.md
```

## Getting Started

### Backend Setup

#### One-Time Setup

Run these commands **only the first time** you set up the project:

```bash
cd /path-to-project/rpi-waybill-printer

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

#### Every Time You Work

After the first setup, activate the virtual environment and run:

```bash
cd /path-to-project/rpi-waybill-printer
source venv/bin/activate  # On Windows: venv\Scripts\activate
python run.py
```

The API will be available at `http://localhost:5000`

### Frontend Setup

See `frontend/README.md` for React setup instructions.
