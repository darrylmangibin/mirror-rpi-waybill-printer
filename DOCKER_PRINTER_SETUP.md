# Printer Configuration in Docker

Docker now includes the same printer setup functionality as [installers/cups.sh](installers/cups.sh).

## What's Included

✅ All CUPS packages and drivers (matches cups.sh)  
✅ Printer discovery (`lpinfo -v`)  
✅ Auto-configuration via environment variables  
✅ Zebra PPD driver for thermal printers  
✅ CUPS web interface access

## Auto-Configure Printer

### Option 1: Edit docker-compose file

**Production ([docker-compose.prod.yml](docker-compose.prod.yml)):**

```yaml
environment:
  - PRINTER_NAME=XP410B
  - PRINTER_URI=usb://Xprinter/XP-410B?serial=410BBE235170626
```

**Development ([docker-compose.dev.yml](docker-compose.dev.yml)):**

```yaml
environment:
  - PRINTER_NAME=XP410B
  - PRINTER_URI=usb://Xprinter/XP-410B?serial=410BBE235170626
```

### Option 2: Command line

```bash
PRINTER_NAME=XP410B PRINTER_URI="usb://Xprinter/XP-410B?serial=410BBE235170626" \
  docker compose -f docker-compose.prod.yml up -d
```

## Find Your Printer URI

### Method 1: Check container logs

```bash
docker compose -f docker-compose.prod.yml logs backend | grep "Available printer URIs"
```

The startup script automatically runs `lpinfo -v` and shows available printers.

### Method 2: Run lpinfo manually

```bash
# Enter container
docker exec -it rpi-waybill-printer-backend-prod bash

# List printers
lpinfo -v

# Example output:
# direct usb://Xprinter/XP-410B?serial=410BBE235170626
# network socket://192.168.1.100:9100
```

### Method 3: Check on host (if printer connected)

```bash
# On Raspberry Pi/Linux host
lpinfo -v
```

## Manual Configuration via CUPS Web Interface

If you prefer manual configuration or environment variables aren't set:

1. **Access CUPS web interface:**

   ```
   http://localhost:631          # From Raspberry Pi
   http://192.168.100.44:631     # From another device
   ```

2. **Navigate to Administration → Add Printer**

3. **Select your printer from the list**

4. **Choose driver:** Generic → Zebra EPL Label Printer

5. **Set as default printer**

## Printer Configuration Examples

### XPrinter Thermal Printer (USB)

```yaml
- PRINTER_NAME=XP410B
- PRINTER_URI=usb://Xprinter/XP-410B?serial=410BBE235170626
```

### Zebra Thermal Printer (USB)

```yaml
- PRINTER_NAME=ZebraLP2844
- PRINTER_URI=usb://Zebra%20Technologies/ZTC%20LP%202844
```

### Network Printer

```yaml
- PRINTER_NAME=NetworkPrinter
- PRINTER_URI=socket://192.168.1.100:9100
```

### Parallel Port

```yaml
- PRINTER_NAME=ParallelPrinter
- PRINTER_URI=parallel:/dev/lp0
```

## Check Printer Status

```bash
# View logs
docker compose -f docker-compose.prod.yml logs backend | grep -i printer

# Enter container and check status
docker exec -it rpi-waybill-printer-backend-prod bash
lpstat -p -d
```

## Troubleshooting

### Printer not detected

**Check if printer is connected:**

```bash
# On host
lsusb

# Should show something like:
# Bus 001 Device 003: ID 0fe6:811e ICS Advent XP-410B
```

**Check container has access to CUPS socket:**

```yaml
volumes:
  - /var/run/cups/cups.sock:/var/run/cups/cups.sock # Must be present
```

### Permission denied errors

**Docker container needs privileged mode:**

```yaml
privileged: true # Required for CUPS access
```

### Printer URI format issues

**URI must be URL-encoded:**

```bash
# Wrong
usb://Xprinter/XP-410B?serial=410BBE235170626

# Correct (spaces encoded)
usb://Xprinter/XP-410B?serial=410BBE235170626
```

### Printer added but not working

**Check printer is enabled and accepting jobs:**

```bash
docker exec -it rpi-waybill-printer-backend-prod bash
cupsenable XP410B
cupsaccept XP410B
lpstat -p -d
```

## Differences from cups.sh

| Feature                 | cups.sh       | Docker                 |
| ----------------------- | ------------- | ---------------------- |
| **Interactive prompts** | ✅ Yes        | ❌ No (uses env vars)  |
| **Auto-discovery**      | ✅ lpinfo -v  | ✅ lpinfo -v (in logs) |
| **User groups**         | ✅ lpadmin/lp | ❌ Runs as root        |
| **systemctl**           | ✅ Yes        | ⚠️ Fallback methods    |
| **CUPS config**         | ✅ Full       | ✅ Full                |
| **Printer drivers**     | ✅ All        | ✅ All                 |

## Comparison with Manual Setup

**Manual (cups.sh):**

- ✅ Interactive setup
- ✅ Step-by-step guidance
- ❌ Requires SSH/terminal access

**Docker (automatic):**

- ✅ Set once in docker-compose
- ✅ Auto-configures on every container restart
- ✅ Infrastructure as code
- ❌ No interactive prompts

Both methods result in the same functional printer setup!
