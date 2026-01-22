# Docker Development Setup

This guide explains how to run the RPI Waybill Printer using Docker on any platform (Linux, macOS, Windows).

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) (macOS/Windows) or Docker Engine (Linux)
- [Docker Compose](https://docs.docker.com/compose/install/) (usually included with Docker Desktop)

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd rpi-waybill-printer
```

### 2. Start the Application

```bash
docker-compose up
```

That's it! The application will build and start automatically.

### 3. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## Development Workflow

### Start Services (Foreground)

```bash
docker-compose up
```

Logs will be displayed in your terminal. Press `Ctrl+C` to stop.

### Start Services (Background)

```bash
docker-compose up -d
```

Services run in the background.

### View Logs

```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose logs -f frontend
```

### Stop Services

```bash
docker-compose down
```

### Restart Services

```bash
docker-compose restart
```

### Rebuild After Dependency Changes

If you modify `requirements.txt` or `package.json`:

```bash
docker-compose up --build
```

### Clean Rebuild (Fresh Start)

```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

## Hot Reload

Both frontend and backend support hot reload:

- **Backend**: Changes to Python files in `app/` will automatically reload the Flask server
- **Frontend**: Changes to React/TypeScript files in `frontend/src/` will automatically reload the browser

## Printer Access (Linux Only)

The Docker setup mounts the CUPS socket for printer access:

```yaml
volumes:
  - /var/run/cups/cups.sock:/var/run/cups/cups.sock
```

This works on Linux (including Raspberry Pi and Chromebook). On macOS/Windows, you'll need to configure printer sharing differently or test without actual printing.

## Database

The SQLite database is stored in `app/instance/` and is persisted via Docker volumes. Your data will remain even after stopping containers.

## Logs

Application logs are stored in `app/logs/` and are accessible both from the container and your host machine.

## Common Issues

### Port Already in Use

If ports 5000 or 5173 are already in use:

**Option 1**: Stop the conflicting service

```bash
# On Linux/macOS
lsof -ti:5000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

**Option 2**: Change ports in `docker-compose.yml`

```yaml
ports:
  - "5001:5000" # Use 5001 on host instead of 5000
```

### Permission Issues (Linux)

If you get permission errors:

```bash
sudo chown -R $USER:$USER app/instance app/logs app/storage
```

### Container Won't Start

View detailed logs:

```bash
docker-compose logs backend
docker-compose logs frontend
```

### Changes Not Reflecting

Ensure volumes are mounted correctly and rebuild:

```bash
docker-compose down
docker-compose up --build
```

## Environment Variables

Environment variables are set in `docker-compose.yml`. To override:

1. Create a `.env` file in the project root
2. Add your variables:

```env
DEBUG=True
PORT=5000
CLEANUP_INTERVAL_MINUTES=30
```

Docker Compose will automatically load them.

## Production Deployment

For production on Raspberry Pi or Chromebook:

### Option A: Docker (Recommended)

```bash
# Use production docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

### Option B: Traditional systemd (Existing Method)

Use the existing installer scripts:

```bash
sudo bash install.sh
```

## Useful Commands

### Access Backend Container Shell

```bash
docker-compose exec backend bash
```

### Access Frontend Container Shell

```bash
docker-compose exec frontend sh
```

### View Running Containers

```bash
docker-compose ps
```

### Remove All Data (Clean Slate)

```bash
docker-compose down -v
rm -rf app/instance/*.db app/logs/*.log
docker-compose up --build
```

### Check Docker Resource Usage

```bash
docker stats
```

## Multi-Platform Support

This Docker setup works identically on:

- ✅ **Linux** (Ubuntu, Debian, Raspberry Pi OS, etc.)
- ✅ **macOS** (Intel and Apple Silicon)
- ✅ **Windows** (with WSL2)

No platform-specific setup required!

## Troubleshooting

### Backend won't connect to frontend

Ensure both services are on the same network (defined in `docker-compose.yml`).

### Database locked errors

Stop all containers and restart:

```bash
docker-compose down
docker-compose up
```

### Playwright installation fails

If building on ARM devices (Raspberry Pi), Playwright might have issues. The Dockerfile includes `--with-deps` flag for better compatibility.

## Need Help?

- Check container logs: `docker-compose logs -f`
- Inspect container: `docker-compose exec backend bash`
- View network: `docker network inspect rpi-waybill-printer_waybill-network`

## Next Steps

- Read [API_ROUTES.md](API_ROUTES.md) for API documentation
- Check [README.md](README.md) for application features
- Modify `.env.docker` for custom configuration
