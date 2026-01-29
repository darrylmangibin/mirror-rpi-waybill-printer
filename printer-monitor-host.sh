#!/bin/bash
# Host-side USB printer monitor for Docker containers
# This script runs ON THE HOST and monitors USB hotplug events
# When a printer reconnects, it triggers CUPS restart inside the Docker container

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🖨️  Host-side USB Printer Monitor for Docker${NC}"
echo -e "${YELLOW}This script monitors USB changes on the host and restarts CUPS in Docker${NC}"
echo ""

# Determine which compose file and container name
if [ -f ".env.printer" ]; then
    source .env.printer
fi

# Try to detect which container is running
if docker ps --format '{{.Names}}' | grep -q "rpi-waybill-printer-backend-prod"; then
    CONTAINER_NAME="rpi-waybill-printer-backend-prod"
    COMPOSE_FILE="docker-compose.prod.yml"
elif docker ps --format '{{.Names}}' | grep -q "rpi-waybill-printer-backend-dev"; then
    CONTAINER_NAME="rpi-waybill-printer-backend-dev"
    COMPOSE_FILE="docker-compose.dev.yml"
else
    echo -e "${RED}❌ No running RPI Waybill Printer container found${NC}"
    echo -e "${YELLOW}Please start the Docker containers first:${NC}"
    echo -e "  ./docker.sh prod   # or dev"
    exit 1
fi

echo -e "${GREEN}✅ Found container: $CONTAINER_NAME${NC}"

# Check if we have printer configuration
if [ -z "$PRINTER_NAME" ] || [ -z "$PRINTER_URI" ]; then
    echo -e "${YELLOW}⚠️  No printer configuration found in .env.printer${NC}"
    echo -e "${BLUE}Monitoring all USB printer changes...${NC}"
else
    echo -e "${GREEN}✅ Monitoring printer: $PRINTER_NAME${NC}"
    echo -e "${BLUE}   URI: $PRINTER_URI${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Monitoring USB changes... (Press Ctrl+C to stop)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Store last known USB device list
LAST_USB_DEVICES=$(ls -1 /dev/bus/usb/*/* 2>/dev/null | sort)
PRINTER_WAS_CONNECTED=false

# Check if printer is currently connected
if [ -n "$PRINTER_URI" ]; then
    MANUFACTURER=$(echo "$PRINTER_URI" | sed -n 's|usb://\([^/]*\)/.*|\1|p')
    if lsusb 2>/dev/null | grep -qi "$MANUFACTURER"; then
        PRINTER_WAS_CONNECTED=true
        echo -e "${GREEN}[$(date '+%H:%M:%S')] Printer currently connected${NC}"
    else
        echo -e "${YELLOW}[$(date '+%H:%M:%S')] Printer not detected${NC}"
    fi
fi

# Monitor loop
while true; do
    sleep 2
    
    # Get current USB device list
    CURRENT_USB_DEVICES=$(ls -1 /dev/bus/usb/*/* 2>/dev/null | sort)
    
    # Check if there was a change
    if [ "$CURRENT_USB_DEVICES" != "$LAST_USB_DEVICES" ]; then
        echo -e "${YELLOW}[$(date '+%H:%M:%S')] USB device change detected!${NC}"
        
        # Check if it's the printer we're monitoring
        PRINTER_CURRENTLY_CONNECTED=false
        if [ -n "$PRINTER_URI" ]; then
            if lsusb 2>/dev/null | grep -qi "$MANUFACTURER"; then
                PRINTER_CURRENTLY_CONNECTED=true
            fi
        fi
        
        # Detect printer reconnection
        if [ "$PRINTER_WAS_CONNECTED" = false ] && [ "$PRINTER_CURRENTLY_CONNECTED" = true ]; then
            echo -e "${GREEN}[$(date '+%H:%M:%S')] ✅ Printer reconnected!${NC}"
            echo -e "${BLUE}[$(date '+%H:%M:%S')] Triggering CUPS restart in Docker container...${NC}"
            
            # Method 1: Restart CUPS inside the container
            docker exec "$CONTAINER_NAME" pkill -HUP cupsd 2>/dev/null || true
            sleep 1
            
            # Method 2: Re-add the printer
            if [ -n "$PRINTER_NAME" ] && [ -n "$PRINTER_URI" ]; then
                DRIVER="${PRINTER_DRIVER:-drv:///sample.drv/zebra.ppd}"
                
                echo -e "${BLUE}[$(date '+%H:%M:%S')] Reconfiguring printer in container...${NC}"
                
                # Remove old printer configuration
                docker exec "$CONTAINER_NAME" lpadmin -x "$PRINTER_NAME" 2>/dev/null || true
                sleep 1
                
                # Re-add printer
                docker exec "$CONTAINER_NAME" lpadmin -p "$PRINTER_NAME" -E -v "$PRINTER_URI" -m "$DRIVER" 2>&1 | \
                    sed "s/^/[$(date '+%H:%M:%S')] /"
                
                # Set as default
                docker exec "$CONTAINER_NAME" lpadmin -d "$PRINTER_NAME" 2>/dev/null || true
                
                # Verify
                echo -e "${BLUE}[$(date '+%H:%M:%S')] Verifying printer status:${NC}"
                docker exec "$CONTAINER_NAME" lpstat -p "$PRINTER_NAME" 2>&1 | \
                    sed "s/^/[$(date '+%H:%M:%S')] /"
                
                echo -e "${GREEN}[$(date '+%H:%M:%S')] ✅ Printer fully restored in Docker${NC}"
            else
                echo -e "${GREEN}[$(date '+%H:%M:%S')] ✅ CUPS restarted in Docker${NC}"
            fi
        elif [ "$PRINTER_WAS_CONNECTED" = true ] && [ "$PRINTER_CURRENTLY_CONNECTED" = false ]; then
            echo -e "${RED}[$(date '+%H:%M:%S')] ⚠️  Printer disconnected${NC}"
            echo -e "${YELLOW}[$(date '+%H:%M:%S')] Waiting for reconnection...${NC}"
        else
            # Some other USB device changed
            echo -e "${BLUE}[$(date '+%H:%M:%S')] Other USB device change (not the printer)${NC}"
        fi
        
        PRINTER_WAS_CONNECTED=$PRINTER_CURRENTLY_CONNECTED
        LAST_USB_DEVICES=$CURRENT_USB_DEVICES
    fi
done
