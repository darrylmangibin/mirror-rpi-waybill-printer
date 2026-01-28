#!/bin/bash
# Printer USB reconnection monitor
# Runs in background and automatically restarts CUPS when printer reconnects

MONITOR_INTERVAL=15  # Check every 15 seconds
PRINTER_WAS_ONLINE=false

echo "[PRINTER MONITOR] Starting USB printer reconnection monitor..."
echo "[PRINTER MONITOR] Checking every ${MONITOR_INTERVAL} seconds"

# Wait for initial CUPS startup
sleep 5

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
    
    # Check if printer exists in CUPS
    PRINTER_EXISTS=$(lpstat -p "$PRINTER_NAME" 2>/dev/null)
    
    if [ -z "$PRINTER_EXISTS" ]; then
        # Printer not in CUPS at all
        PRINTER_WAS_ONLINE=false
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
            USB_DEVICE=$(echo "$PRINTER_URI" | sed 's/usb:\/\///')
            USB_PRESENT=$(lpinfo -v 2>/dev/null | grep -F "$USB_DEVICE")
            
            if [ -n "$USB_PRESENT" ]; then
                PRINTER_ONLINE=true
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
        fi
        PRINTER_WAS_ONLINE=true
    else
        if [ "$PRINTER_WAS_ONLINE" = true ]; then
            # Printer just went offline
            echo "[PRINTER MONITOR] ⚠️  Printer disconnected: $PRINTER_NAME"
            echo "[PRINTER MONITOR] Waiting for reconnection..."
        fi
        PRINTER_WAS_ONLINE=false
    fi
    
    sleep $MONITOR_INTERVAL
done
