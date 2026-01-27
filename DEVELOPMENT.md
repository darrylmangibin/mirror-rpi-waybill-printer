# Development Setup

This guide explains how to set up your local development environment with IDE support (linters, autocomplete) while running the application in Docker.

## Overview

**Development approach:**

- ✅ **Dependencies installed locally** (for IDE/linter)
- ✅ **Application runs in Docker** (consistent environment)
- ✅ **Source code mounted** (changes reflect immediately)
- ✅ **Hot-reload enabled** (no restarts needed)

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) (macOS/Windows) or Docker Engine (Linux)
- Python 3.11+ (for local IDE support)
- Node.js 18+ (for local IDE support)

---

## Initial Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd rpi-waybill-printer
```

### 2. Install Backend Dependencies Locally

**For IDE support (linting, autocomplete):**

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt
```

**Your IDE will now recognize Python packages!**

### 3. Install Frontend Dependencies Locally

**For IDE support (linting, autocomplete, React):**

```bash
cd frontend
npm install
cd ..
```

**Your IDE will now recognize React and TypeScript!**

### 4. Start Development Environment

```bash
./docker.sh dev
```

**That's it!** The application is now running in Docker with hot-reload enabled.

---

## Development Workflow

### Backend Development

**Edit Python files:**

```bash
# Edit any file in app/
# Example: app/services/waybills/routes/api.py
```

**Changes are detected automatically:**

- Flask reloader detects changes
- Server restarts automatically
- No manual restart needed

**Verify changes:**

```bash
# Watch logs
docker logs -f rpi-waybill-printer-backend
```

### Frontend Development

**Edit React/TypeScript files:**

```bash
# Edit any file in frontend/src/
# Example: frontend/src/App.tsx
```

**Changes are detected automatically:**

- Vite detects changes
- Browser refreshes automatically
- No manual restart needed

**Verify changes:**

```bash
# Watch logs
docker logs -f rpi-waybill-printer-frontend
```

---

## IDE Configuration

### VS Code

**Python (Backend):**

1. Install Python extension
2. Select interpreter: `Ctrl+Shift+P` → "Python: Select Interpreter"
3. Choose `./venv/bin/python`

**TypeScript/React (Frontend):**

1. Install ESLint extension
2. Install Prettier extension
3. Open `frontend/` folder
4. TypeScript will automatically detect `tsconfig.json`

### PyCharm / WebStorm

**PyCharm (Backend):**

1. Open project
2. Settings → Project Interpreter
3. Add → Existing Environment
4. Select `./venv/bin/python`

**WebStorm (Frontend):**

1. Open `frontend/` folder
2. Right-click `package.json` → Show npm Scripts
3. Enable TypeScript service

---

## Package Management

### Adding Backend Dependencies

```bash
# Activate venv
source venv/bin/activate

# Install new package locally
pip install new-package

# Update requirements.txt
pip freeze > requirements.txt

# Rebuild Docker to include new package
./docker.sh dev --build
```

### Adding Frontend Dependencies

```bash
cd frontend

# Install new package locally
npm install new-package

# Exit frontend directory
cd ..

# Rebuild Docker to include new package
./docker.sh dev --build
```

**Note:** Local install keeps IDE happy, Docker rebuild ensures container has the package.

---

## Common Development Tasks

### View Logs

```bash
# All services
docker compose -f docker-compose.dev.yml logs -f

# Backend only
docker logs -f rpi-waybill-printer-backend

# Frontend only
docker logs -f rpi-waybill-printer-frontend
```

### Restart Services

```bash
# Restart all
docker compose -f docker-compose.dev.yml restart

# Restart backend only
docker restart rpi-waybill-printer-backend

# Restart frontend only
docker restart rpi-waybill-printer-frontend
```

### Run Database Migrations

```bash
# Enter backend container
docker exec -it rpi-waybill-printer-backend bash

# Run migration
flask db upgrade

# Or create new migration
flask db migrate -m "description"
```

### Access Python Shell

```bash
# Enter backend container
docker exec -it rpi-waybill-printer-backend bash

# Start Python shell with app context
python3
>>> from app import create_app
>>> from app.database import db
>>> app, _ = create_app()
>>> with app.app_context():
...     # Your code here
...     from app.services.waybills.models.WaybillPrint import WaybillPrint
...     waybills = WaybillPrint.query.all()
```

### Clear Database

```bash
# Delete database file
rm -rf app/instance/fusion_printer.db

# Restart to recreate
docker restart rpi-waybill-printer-backend
```

---

## Troubleshooting

### Backend: "Module not found"

**Cause:** Package installed in Docker but not locally

**Solution:**

```bash
source venv/bin/activate
pip install -r requirements.txt
```

### Frontend: "Cannot find module 'react'"

**Cause:** npm packages not installed locally

**Solution:**

```bash
cd frontend
npm install
```

### IDE not detecting venv

**VS Code:**

```bash
# Select interpreter manually
Ctrl+Shift+P → "Python: Select Interpreter" → ./venv/bin/python
```

**PyCharm:**

```
File → Settings → Project Interpreter → Add → Existing Environment → ./venv/bin/python
```

### Changes not reflecting

**Solution:**

```bash
# Check if hot-reload is working
docker logs -f rpi-waybill-printer-backend
# Should show "Restarting with stat" when files change

# If not, restart
docker restart rpi-waybill-printer-backend
```

### Port already in use

**Solution:**

```bash
# Find process using port
lsof -i :5000  # Backend
lsof -i :5173  # Frontend

# Kill the process
kill -9 <PID>

# Or change port in docker-compose.dev.yml
```

---

## Environment Variables

### Backend (.env in root)

```bash
# Not needed for development - defaults are used
# But you can create .env for custom values
ENVIRONMENT=development
DEBUG=True
HOST=0.0.0.0
PORT=5000
```

### Frontend (frontend/.env)

**Auto-generated by docker.sh:**

```bash
VITE_API_URL=http://192.168.100.44:5000
VITE_BASE_URL=http://192.168.100.44:5000
```

**For localhost development:**

```bash
# Edit frontend/.env
VITE_API_URL=http://localhost:5000
VITE_BASE_URL=http://localhost:5000
```

---

## Production Deployment

When ready to deploy:

```bash
# Stop development
docker compose -f docker-compose.dev.yml down

# Deploy to production
./docker.sh prod --build
```

See [DOCKER_GUIDE.md](DOCKER_GUIDE.md) for production deployment.

---

## Summary

**Local setup (once):**

```bash
# Backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Frontend
cd frontend && npm install && cd ..
```

**Daily development:**

```bash
# Start Docker
./docker.sh dev

# Edit files locally (IDE has full support)
# Changes auto-reload in Docker
# No restarts needed!
```

**Happy coding!** 🚀
