#!/bin/bash
# Printer USB reconnection monitor
# Runs in background and automatically restarts CUPS when printer reconnects

# ⚠️  DOCKER LIMITATION: USB hotplug events don't propagate into containers
# This script has LIMITED effectiveness inside Docker containers
# For automatic USB reconnection, use printer-monitor-host.sh on the HOST

MONITOR_INTERVAL=15  # Check every 15 seconds
PRINTER_WAS_ONLINE=false

echo "[PRINTER MONITOR] Starting USB printer reconnection monitor (Docker)..."
echo "[PRINTER MONITOR] ⚠️  Note: USB hotplug detection is limited in Docker"
echo "[PRINTER MONITOR] For automatic reconnection, run printer-monitor-host.sh on the host"
echo "[PRINTER MONITOR] Checking every ${MONITOR_INTERVAL} seconds"

# Wait for initial CUPS startup
sleep 5

# Log configuration once at startup
if [ -n "$PRINTER_NAME" ] && [ -n "$PRINTER_URI" ]; then
    echo "[PRINTER MONITOR] Monitoring printer: $PRINTER_NAME"
    echo "[PRINTER MONITOR] URI: $PRINTER_URI"
    echo "[PRINTER MONITOR] Driver: ${PRINTER_DRIVER:-drv:///sample.drv/zebra.ppd}"
else
    echo "[PRINTER MONITOR] ⚠️  No printer configuration found in environment variables"
fi

while true; do
    # Check if CUPS is running
    if ! pgrep -x "cupsd" > /dev/null; then
        echo "[PRINTER MONITOR] CUPS not running, skipping check"
        sleep $MONITOR_INTERVAL
        continue
    fi
    
    # Get printer info from environment
    if [ -z "$PRINTER_NAME" ] || [ -z "$PRINTER_URI" ]; then
        # No printer configured, nothing to monitor
        sleep $MONITOR_INTERVAL
        continue
    fi
    
    # Extract URI type (usb://, socket://, etc.)
    URI_TYPE=$(echo "$PRINTER_URI" | cut -d: -f1)
    
    # Check printer connection based on URI type
    PRINTER_ONLINE=false
    
    case "$URI_TYPE" in
        usb)
            # For USB printers, check if USB device exists
            # Method 1: Check /dev/bus/usb for any connected devices
            USB_DEVICES_COUNT=$(find /dev/bus/usb -type c 2>/dev/null | wc -l)
            
            # Method 2: Extract manufacturer/model from URI and check with lpinfo
            MANUFACTURER=$(echo "$PRINTER_URI" | sed -n 's|usb://\([^/]*\)/.*|\1|p')
            
            # Check if any USB device from this manufacturer is present
            if [ -n "$MANUFACTURER" ]; then
                USB_CHECK=$(lpinfo -v 2>/dev/null | grep "usb://" | grep -i "$MANUFACTURER")
            else
                # Fallback: check if exact URI exists
                USB_CHECK=$(lpinfo -v 2>/dev/null | grep -F "$PRINTER_URI")
            fi
            
            # Method 3: Check if printer shows up in lsusb (if available)
            if command -v lsusb &> /dev/null && [ -n "$MANUFACTURER" ]; then
                LSUSB_CHECK=$(lsusb 2>/dev/null | grep -i "$MANUFACTURER")
            else
                LSUSB_CHECK=""
            fi
            
            # Consider printer online if either method detects it
            if [ -n "$USB_CHECK" ] || [ -n "$LSUSB_CHECK" ]; then
                PRINTER_ONLINE=true
                echo "[PRINTER MONITOR] DEBUG: USB device detected"
                [ -n "$USB_CHECK" ] && echo "[PRINTER MONITOR] DEBUG: lpinfo found: $USB_CHECK"
                [ -n "$LSUSB_CHECK" ] && echo "[PRINTER MONITOR] DEBUG: lsusb found: $LSUSB_CHECK"
            else
                echo "[PRINTER MONITOR] DEBUG: USB device NOT detected - Looking for: $MANUFACTURER"
                echo "[PRINTER MONITOR] DEBUG: USB devices in /dev/bus/usb: $USB_DEVICES_COUNT"
                echo "[PRINTER MONITOR] DEBUG: lpinfo output:"
                lpinfo -v 2>/dev/null | grep "usb://" || echo "  (none)"
                if command -v lsusb &> /dev/null; then
                    echo "[PRINTER MONITOR] DEBUG: lsusb output:"
                    lsusb 2>/dev/null || echo "  (none)"
                fi
            fi
            ;;
        socket|ipp|http|https)
            # For network printers, check if printer responds
            if lpstat -p "$PRINTER_NAME" 2>/dev/null | grep -q "idle\|processing"; then
                PRINTER_ONLINE=true
            fi
            ;;
        *)
            # Unknown URI type, assume online if lpstat shows it
            if lpstat -p "$PRINTER_NAME" 2>/dev/null | grep -q "idle\|processing"; then
                PRINTER_ONLINE=true
            fi
            ;;
    esac
    
    # State machine: detect disconnect → reconnect
    if [ "$PRINTER_ONLINE" = true ]; then
        if [ "$PRINTER_WAS_ONLINE" = false ]; then
            # Printer just came back online!
            echo "[PRINTER MONITOR] ✅ Printer reconnected: $PRINTER_NAME"
            echo "[PRINTER MONITOR] USB device: $PRINTER_URI"
            
            # Remove old printer (might be in error state)
            echo "[PRINTER MONITOR] Removing old printer configuration..."
            lpadmin -x "$PRINTER_NAME" 2>/dev/null || true
            
            sleep 1
            
            # Re-add printer with original configuration
            DRIVER="${PRINTER_DRIVER:-drv:///sample.drv/zebra.ppd}"
            echo "[PRINTER MONITOR] Re-adding printer with driver: $DRIVER"
            
            if lpadmin -p "$PRINTER_NAME" -E -v "$PRINTER_URI" -m "$DRIVER" 2>&1; then
                echo "[PRINTER MONITOR] ✅ Printer re-added successfully"
                
                # Set as default
                lpadmin -d "$PRINTER_NAME" 2>/dev/null || true
                
                # Restart CUPS to ensure clean state
                echo "[PRINTER MONITOR] Restarting CUPS..."
                pkill -HUP cupsd 2>/dev/null || true
                sleep 2
                
                echo "[PRINTER MONITOR] ✅ Printer fully restored"
                lpstat -p -d 2>/dev/null || true
            else
                echo "[PRINTER MONITOR] ❌ Failed to re-add printer"
            fi
        else
            # Printer still online (no change)
            echo "[PRINTER MONITOR] DEBUG: Printer still online"
        fi
        PRINTER_WAS_ONLINE=true
    else
        if [ "$PRINTER_WAS_ONLINE" = true ]; then
            # Printer just went offline
            echo "[PRINTER MONITOR] ⚠️  Printer disconnected: $PRINTER_NAME"
            echo "[PRINTER MONITOR] Waiting for reconnection..."
        else
            # Printer still offline
            echo "[PRINTER MONITOR] DEBUG: Printer still offline"
        fi
        PRINTER_WAS_ONLINE=false
    fi
    
    sleep $MONITOR_INTERVAL
done
