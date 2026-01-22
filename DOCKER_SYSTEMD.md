# Docker Deployment Guide for Raspberry Pi

This guide explains how Docker replaces systemd for the RPI Waybill Printer.

## Systemd vs Docker Comparison

| Feature                  | Systemd (Old)          | Docker (New)         |
| ------------------------ | ---------------------- | -------------------- |
| **Auto-restart**         | `Restart=on-failure`   | `restart: always` ✅ |
| **Start on boot**        | `systemctl enable`     | Docker auto-start ✅ |
| **Process management**   | systemd                | Docker daemon ✅     |
| **Logging**              | journalctl             | `docker logs` ✅     |
| **Service dependencies** | `After=network.target` | `depends_on:` ✅     |
| **Resource isolation**   | cgroups                | Docker containers ✅ |

## Installation on Raspberry Pi

### 1. Install Docker

```bash
cd /path/to/rpi-waybill-printer
sudo ./installers/docker.sh
```

This script:

- Installs Docker and Docker Compose
- Adds your user to docker group
- Enables Docker to start on boot
- Configures container auto-start

### 2. Logout and Login

Required for docker group membership to take effect:

```bash
logout
# Then SSH back in or restart terminal
```

### 3. Deploy Application

**Production deployment:**

```bash
cd /path/to/rpi-waybill-printer
docker compose -f docker-compose.prod.yml up -d --build
```

**Development deployment (with hot-reload):**

```bash
docker compose -f docker-compose.yml up -d --build
```

## Container Management Commands

### Start Containers

```bash
docker compose -f docker-compose.prod.yml up -d
```

### Stop Containers

```bash
docker compose -f docker-compose.prod.yml down
```

### Restart Containers

```bash
docker compose -f docker-compose.prod.yml restart
```

### View Logs

```bash
# All containers
docker compose -f docker-compose.prod.yml logs -f

# Backend only
docker logs -f rpi-waybill-printer-backend-prod

# Frontend only
docker logs -f rpi-waybill-printer-frontend-prod
```

### Check Status

```bash
docker compose -f docker-compose.prod.yml ps
```

### Rebuild After Code Changes

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

## Auto-start Configuration

The `restart: always` policy in docker-compose.prod.yml ensures:

1. ✅ Containers start automatically when Docker daemon starts
2. ✅ Docker daemon starts automatically on boot (via systemd)
3. ✅ Containers restart automatically if they crash
4. ✅ Containers restart after system reboot

## Migration from Systemd to Docker

### Old Systemd Commands → New Docker Commands

| Systemd                                              | Docker Equivalent                                 |
| ---------------------------------------------------- | ------------------------------------------------- |
| `sudo systemctl start rpi-waybill-printer-backend`   | `docker compose up -d backend`                    |
| `sudo systemctl stop rpi-waybill-printer-backend`    | `docker compose stop backend`                     |
| `sudo systemctl restart rpi-waybill-printer-backend` | `docker compose restart backend`                  |
| `sudo systemctl status rpi-waybill-printer-backend`  | `docker compose ps backend`                       |
| `sudo journalctl -u rpi-waybill-printer-backend -f`  | `docker logs -f rpi-waybill-printer-backend-prod` |
| `sudo systemctl enable rpi-waybill-printer-backend`  | Already configured via `restart: always`          |

### Removing Old Systemd Services (Optional)

If you previously installed with systemd:

```bash
# Stop and disable old services
sudo systemctl stop rpi-waybill-printer-backend
sudo systemctl stop rpi-waybill-printer-frontend
sudo systemctl disable rpi-waybill-printer-backend
sudo systemctl disable rpi-waybill-printer-frontend

# Remove service files
sudo rm /etc/systemd/system/rpi-waybill-printer-backend.service
sudo rm /etc/systemd/system/rpi-waybill-printer-frontend.service
sudo systemctl daemon-reload
```

## Benefits of Docker over Systemd

1. **Consistency**: Same environment on Mac, Raspberry Pi, or any Linux system
2. **Isolation**: Dependencies contained within images
3. **Easy updates**: `docker compose pull && docker compose up -d`
4. **Rollback**: Keep old images for quick rollback
5. **Portability**: Deploy anywhere Docker runs
6. **Development/Production parity**: Use same containers for dev and prod

## Troubleshooting

### Check if Docker is running

```bash
sudo systemctl status docker
```

### Check if containers are running

```bash
docker ps
```

### View container resource usage

```bash
docker stats
```

### Access container shell for debugging

```bash
# Backend
docker exec -it rpi-waybill-printer-backend-prod bash

# Frontend
docker exec -it rpi-waybill-printer-frontend-prod sh
```

### Rebuild from scratch

```bash
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --build --force-recreate
```

## Architecture Compatibility

Docker images are built for the architecture you're running on:

- **Raspberry Pi**: ARM64/ARMv7 images
- **Development Mac/PC**: x86_64 images

Base images (`python:3.11-slim`, `node:18-alpine`) support multiple architectures automatically.

## Notes

- The `privileged: true` flag is required for CUPS printer access
- CUPS socket mount (`/var/run/cups/cups.sock`) only works on Raspberry Pi/Linux
- Use `docker-compose.dev.yml` for local development (macOS/Windows)
- Use `docker-compose.prod.yml` for Raspberry Pi deployment
