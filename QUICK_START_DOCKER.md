# Quick Start: Docker One-Command Setup

## Raspberry Pi / Chromebook Linux

**Complete setup in ONE command:**

```bash
./docker-start-dynamic.sh prod --build
```

**What it does:**

- ✅ Detects your network IP
- ✅ Finds your USB printer
- ✅ Configures everything
- ✅ Starts Docker containers
- ✅ **Ready to print!**

**First run prompts:**

```
🖨️  Detecting Printer Configuration
✅ Detected printer: usb://Xprinter/XP-410B?serial=410BBE235170626
Suggested printer name: Xprinter

Save this configuration? (y/n)
> y

✅ Saved printer configuration to .env.printer
```

**Next runs:** Just works automatically, no prompts!

## What Gets Created

**Files generated:**

- `frontend/.env` - Network configuration (regenerated each run)
- `.env.printer` - Printer configuration (saved once, reused forever)

## Access Your Application

After running the script:

```
✅ Containers started!
Access the application at:
  Frontend: http://192.168.100.44:5173
  Backend:  http://192.168.100.44:5000
```

Access from **any device** on your network!

## No Printer? No Problem!

If no printer detected or on macOS:

```
⚠️  No USB printer detected
You can configure manually later or create .env.printer
```

Everything else still works - just no printing.

## Manual Printer Configuration

If auto-detection doesn't work, create `.env.printer` manually:

```bash
cat > .env.printer <<EOF
export PRINTER_NAME=XP410B
export PRINTER_URI=usb://Xprinter/XP-410B?serial=410BBE235170626
EOF

./docker-start-dynamic.sh prod
```

## Reconfigure Printer

Want to change printer?

```bash
# Delete saved config
rm .env.printer

# Run again - will detect and prompt
./docker-start-dynamic.sh prod
```

## Development vs Production

**Development (hot-reload):**

```bash
./docker-start-dynamic.sh dev
```

**Production (optimized):**

```bash
./docker-start-dynamic.sh prod
```

## Summary

**Traditional way (multiple steps):**

1. Edit docker-compose.yml
2. Set PRINTER_NAME manually
3. Set PRINTER_URI manually
4. Set VITE_API_URL manually
5. docker compose up

**New way (one command):**

```bash
./docker-start-dynamic.sh prod --build
```

**Everything configured automatically!** 🚀
