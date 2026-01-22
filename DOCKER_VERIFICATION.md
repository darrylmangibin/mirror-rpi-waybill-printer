# Docker Setup Verification Guide

This guide helps you verify that your Docker setup is working correctly.

## Prerequisites Check

### 1. Docker Installation

```bash
docker --version
# Expected: Docker version 20.x.x or higher
```

### 2. Docker Compose

```bash
docker-compose --version
# OR
docker compose version
# Expected: Docker Compose version 2.x.x or higher
```

### 3. Docker Daemon Running

```bash
docker info
# Should show Docker system information without errors
```

## Quick Start Test

### 1. Start the Application

```bash
# Using the convenience script
./docker-start.sh

# OR manually
docker-compose up --build
```

**Expected output:**

- Building images (first time takes 3-5 minutes)
- Both containers starting
- No error messages

### 2. Verify Containers Are Running

```bash
docker-compose ps
```

**Expected output:**

```
NAME                                  STATUS              PORTS
rpi-waybill-printer-backend          running (healthy)   0.0.0.0:5000->5000/tcp
rpi-waybill-printer-frontend         running             0.0.0.0:5173->5173/tcp
```

### 3. Check Backend Health

```bash
curl http://localhost:5000/api/health
```

**Expected response:**

```json
{
  "status": "healthy",
  "timestamp": "...",
  "environment": "development"
}
```

### 4. Check Frontend

Open your browser and visit:

- http://localhost:5173

**Expected:** React app loads without errors

### 5. Check Backend API

Open your browser and visit:

- http://localhost:5000/api/hello

**Expected:** JSON response from Flask

## Detailed Verification

### Container Logs

#### Backend Logs

```bash
docker-compose logs backend
```

**Look for:**

- ✅ "Running on http://0.0.0.0:5000"
- ✅ No Python errors
- ✅ SocketIO initialization messages

#### Frontend Logs

```bash
docker-compose logs frontend
```

**Look for:**

- ✅ "VITE v..." message
- ✅ "Local: http://localhost:5173"
- ✅ No build errors

### Volume Mounts

Check that files are being synced:

```bash
# Make a change to any file in app/
# Check backend logs - should see:
# "Restarting with stat"

# Make a change to any file in frontend/src/
# Browser should auto-refresh
```

### Network Connectivity

```bash
# From backend container, ping frontend
docker-compose exec backend ping -c 3 frontend

# From frontend container, test backend API
docker-compose exec frontend wget -O- http://backend:5000/api/health
```

### Database Persistence

```bash
# Stop containers
docker-compose down

# Start again
docker-compose up -d

# Check if database still exists
ls -la app/instance/

# Should see .db files
```

## Common Issues and Solutions

### Issue: Port Already in Use

**Error:**

```
Error: bind: address already in use
```

**Solution:**

```bash
# Find process using the port
lsof -i :5000
lsof -i :5173

# Kill the process
kill -9 <PID>

# OR change ports in docker-compose.yml
```

### Issue: Containers Won't Start

**Check:**

```bash
# View detailed logs
docker-compose logs

# Check Docker daemon
docker info

# Remove old containers
docker-compose down -v
docker-compose up --build
```

### Issue: Frontend Can't Connect to Backend

**Check:**

1. Both containers on same network:

```bash
docker network inspect rpi-waybill-printer_waybill-network
```

2. Environment variable is set:

```bash
docker-compose exec frontend env | grep VITE_API_URL
# Should show: VITE_API_URL=http://localhost:5000
```

### Issue: Hot Reload Not Working

**Check volumes:**

```bash
docker-compose ps -a
# Verify volumes are mounted

# Restart containers
docker-compose restart
```

### Issue: Permission Denied (Linux)

```bash
# Fix ownership
sudo chown -R $USER:$USER app/instance app/logs app/storage

# Or run with sudo
sudo docker-compose up
```

### Issue: Playwright/Chromium Fails

**ARM devices (Raspberry Pi):**

```bash
# Playwright might not have ARM builds
# Check alternatives or run without playwright
```

## Performance Tests

### 1. Backend Response Time

```bash
time curl http://localhost:5000/api/health
# Should be < 100ms
```

### 2. Frontend Load Time

Open browser developer tools (F12) → Network tab
Visit http://localhost:5173
**Initial load should be < 2s**

### 3. Container Resource Usage

```bash
docker stats
# Check CPU and memory usage
```

## Production Readiness Checklist

Before deploying to production:

- [ ] Environment variables set correctly
- [ ] Database persists after container restart
- [ ] Logs are accessible
- [ ] Health checks pass
- [ ] Printer access works (Linux)
- [ ] All API endpoints respond correctly
- [ ] Frontend builds successfully
- [ ] No errors in container logs

## Success Criteria

Your Docker setup is working correctly if:

1. ✅ Both containers start without errors
2. ✅ Backend responds to http://localhost:5000/api/health
3. ✅ Frontend loads at http://localhost:5173
4. ✅ Hot reload works for both backend and frontend
5. ✅ Database persists after `docker-compose down` & `up`
6. ✅ Logs are accessible via `docker-compose logs`
7. ✅ Containers restart automatically (in production mode)

## Next Steps

Once verification is complete:

1. **Development**: Continue coding with hot reload
2. **Testing**: Test all API endpoints
3. **Production**: Use `docker-compose.prod.yml` for deployment

## Need Help?

If issues persist:

1. Check all logs: `docker-compose logs -f`
2. Verify Docker installation: `docker info`
3. Clean start: `docker-compose down -v && docker-compose up --build`
4. Check [DOCKER_README.md](DOCKER_README.md) troubleshooting section

## Useful Commands Reference

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Restart
docker-compose restart

# Logs
docker-compose logs -f

# Shell access
docker-compose exec backend bash
docker-compose exec frontend sh

# Clean everything
docker-compose down -v
docker system prune -a

# Rebuild
docker-compose up --build

# Status
docker-compose ps
docker stats
```
