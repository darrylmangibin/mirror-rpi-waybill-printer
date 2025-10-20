# RPI Waybill Printer

A local printing solution using Flask backend and React frontend for Raspberry Pi 5.

## Project Structure

```
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

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run Flask app
python run.py
```

The API will be available at `http://localhost:5000`

### Frontend Setup

See `frontend/README.md` for React setup instructions.

## API Endpoints

- `POST /api/jobs` - Create a new print job
- `GET /api/jobs` - List all jobs
- `GET /api/jobs/<id>` - Get a specific job
- `GET /api/stats` - Get job statistics
