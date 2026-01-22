# Dynamic IP Configuration for Docker

This setup automatically detects your machine's IP address and configures the frontend to use it.

## How It Works

The `docker-start-dynamic.sh` script:

1. Detects your machine's local IP (e.g., `192.168.100.44`)
2. Generates `frontend/.env` with that IP
3. Starts Docker containers with the correct configuration

## Usage

### Development Mode

```bash
./docker-start-dynamic.sh dev
```

### Production Mode

```bash
./docker-start-dynamic.sh prod
```

### With Rebuild

```bash
./docker-start-dynamic.sh dev --build
./docker-start-dynamic.sh prod --build
```

## What Gets Generated

The script creates `frontend/.env`:

```env
VITE_API_URL=http://192.168.100.44:5000
VITE_BASE_URL=http://192.168.100.44:5000
```

## Access Your Application

After starting:

- **Frontend**: `http://192.168.100.44:5173`
- **Backend**: `http://192.168.100.44:5000`

(Replace with your actual IP)

## Why This Matters

**Without dynamic IP:**

- ❌ Must manually edit `.env` on each network change
- ❌ Hardcoded IPs break on different networks
- ❌ Other devices can't access using localhost

**With dynamic IP:**

- ✅ Automatically uses correct IP
- ✅ Works on any network
- ✅ Other devices can access: `http://192.168.100.44:5173`
- ✅ No manual configuration needed

## Raspberry Pi Deployment

```bash
# SSH into Raspberry Pi
ssh pi@raspberrypi.local

# Navigate to project
cd ~/rpi-waybill-printer

# Start with dynamic IP
./docker-start-dynamic.sh prod --build

# Access from any device on network
# Frontend: http://<pi-ip>:5173
# Backend:  http://<pi-ip>:5000
```

## Manual Override

If you need a specific IP, edit `frontend/.env` directly before running Docker:

```bash
# Edit manually
nano frontend/.env

# Then start Docker normally
docker compose -f docker-compose.dev.yml up -d
```

## Troubleshooting

**IP not detected:**

```bash
# Manually check your IP
hostname -I        # Linux
ifconfig           # macOS/Linux
ip addr show       # Linux alternative
```

**Wrong IP detected:**
Edit the script to specify interface:

```bash
# In docker-start-dynamic.sh, modify:
LOCAL_IP=$(ip addr show eth0 | grep "inet " | awk '{print $2}' | cut -d/ -f1)
```
