#!/bin/bash
# Printer USB Detection Diagnostic Script

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🔍 Printer USB Detection Diagnostics${NC}"
echo ""

# Check if running with privileges
if [ "$EUID" -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Some checks require root privileges. Please run with sudo:${NC}"
    echo -e "  sudo bash diagnose-printer.sh"
    echo ""
    USE_SUDO=true
else
    USE_SUDO=false
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}1. Checking USB Devices (Kernel Level)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if command -v lsusb &> /dev/null; then
    echo ""
    lsusb | grep -i "printer\|zebra\|epson\|canon\|hp\|brother\|xprinter" --color=always || echo -e "${YELLOW}No printer-like USB devices found${NC}"
    echo ""
    echo -e "${BLUE}All USB devices:${NC}"
    lsusb
else
    echo -e "${RED}❌ lsusb command not found. Install usbutils package${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}2. Checking USB Device Files${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

USB_LP_DEVICES=$(ls -la /dev/usb/lp* 2>/dev/null)
if [ -n "$USB_LP_DEVICES" ]; then
    echo -e "${GREEN}✅ USB printer device files found:${NC}"
    echo "$USB_LP_DEVICES"
else
    echo -e "${YELLOW}⚠️  No /dev/usb/lp* devices found${NC}"
fi

echo ""
USB_BUS=$(ls -la /dev/bus/usb/*/*** 2>/dev/null | head -10)
if [ -n "$USB_BUS" ]; then
    echo -e "${GREEN}✅ USB bus devices found:${NC}"
    echo "$USB_BUS"
    echo "..."
else
    echo -e "${RED}❌ No /dev/bus/usb devices found${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}3. Checking CUPS Service Status${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if command -v systemctl &> /dev/null; then
    if [ "$USE_SUDO" = true ]; then
        sudo systemctl status cups --no-pager | head -15
    else
        systemctl status cups --no-pager | head -15
    fi
else
    echo -e "${YELLOW}systemctl not available, checking if cupsd is running...${NC}"
    ps aux | grep cupsd | grep -v grep
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}4. Checking CUPS USB Backend${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ "$USE_SUDO" = true ]; then
    echo -e "${BLUE}USB devices visible to CUPS (requires sudo):${NC}"
    USB_CUPS=$(sudo lpinfo -v 2>/dev/null | grep "usb://")
else
    echo -e "${BLUE}USB devices visible to CUPS:${NC}"
    USB_CUPS=$(lpinfo -v 2>/dev/null | grep "usb://")
fi

if [ -n "$USB_CUPS" ]; then
    echo -e "${GREEN}✅ CUPS can see USB printers:${NC}"
    echo "$USB_CUPS"
else
    echo -e "${RED}❌ CUPS cannot see any USB printers${NC}"
    echo ""
    echo -e "${YELLOW}Checking USB backend status...${NC}"
    
    USB_BACKEND="/usr/lib/cups/backend/usb"
    if [ -f "$USB_BACKEND" ]; then
        echo -e "${GREEN}✅ USB backend exists: $USB_BACKEND${NC}"
        ls -la "$USB_BACKEND"
        
        # Check if it's executable
        if [ -x "$USB_BACKEND" ]; then
            echo -e "${GREEN}✅ USB backend is executable${NC}"
        else
            echo -e "${RED}❌ USB backend is NOT executable${NC}"
            echo -e "${YELLOW}Fix: sudo chmod +x $USB_BACKEND${NC}"
        fi
    else
        echo -e "${RED}❌ USB backend not found at: $USB_BACKEND${NC}"
        echo -e "${YELLOW}Try alternate location: /usr/libexec/cups/backend/usb${NC}"
        
        ALT_BACKEND="/usr/libexec/cups/backend/usb"
        if [ -f "$ALT_BACKEND" ]; then
            echo -e "${GREEN}✅ Found at: $ALT_BACKEND${NC}"
            ls -la "$ALT_BACKEND"
        fi
    fi
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}5. Checking Configured Printers in CUPS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

CONFIGURED=$(lpstat -p 2>/dev/null)
if [ -n "$CONFIGURED" ]; then
    echo -e "${GREEN}✅ Configured printers:${NC}"
    echo "$CONFIGURED"
    echo ""
    echo -e "${BLUE}Printer URIs:${NC}"
    lpstat -v
else
    echo -e "${YELLOW}⚠️  No printers configured in CUPS yet${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}6. Checking Recent CUPS Logs${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

ERROR_LOG="/var/log/cups/error_log"
if [ -f "$ERROR_LOG" ]; then
    echo -e "${BLUE}Recent CUPS errors (last 20 lines):${NC}"
    if [ "$USE_SUDO" = true ]; then
        sudo tail -20 "$ERROR_LOG" | grep -i "usb\|error\|fail" --color=always || echo "No USB-related errors"
    else
        tail -20 "$ERROR_LOG" 2>/dev/null | grep -i "usb\|error\|fail" --color=always || echo "No USB-related errors (may need sudo for full access)"
    fi
else
    echo -e "${YELLOW}⚠️  CUPS error log not found at: $ERROR_LOG${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}7. Testing USB Backend Directly${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ -f "/usr/lib/cups/backend/usb" ]; then
    echo -e "${BLUE}Running USB backend discovery mode...${NC}"
    if [ "$USE_SUDO" = true ]; then
        sudo /usr/lib/cups/backend/usb 2>/dev/null || echo "Backend returned non-zero exit"
    else
        /usr/lib/cups/backend/usb 2>/dev/null || echo "Backend returned non-zero exit (may need sudo)"
    fi
elif [ -f "/usr/libexec/cups/backend/usb" ]; then
    echo -e "${BLUE}Running USB backend discovery mode...${NC}"
    if [ "$USE_SUDO" = true ]; then
        sudo /usr/libexec/cups/backend/usb 2>/dev/null || echo "Backend returned non-zero exit"
    else
        /usr/libexec/cups/backend/usb 2>/dev/null || echo "Backend returned non-zero exit (may need sudo)"
    fi
else
    echo -e "${RED}❌ USB backend executable not found${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📋 Recommended Actions${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ -z "$USB_CUPS" ]; then
    echo -e "${YELLOW}CUPS cannot detect your USB printer. Try these steps:${NC}"
    echo ""
    echo -e "1. ${BLUE}Restart CUPS service:${NC}"
    echo -e "   sudo systemctl restart cups"
    echo ""
    echo -e "2. ${BLUE}Unplug and replug the USB printer${NC}"
    echo -e "   Wait 5 seconds after plugging in"
    echo ""
    echo -e "3. ${BLUE}Check kernel messages for USB events:${NC}"
    echo -e "   sudo dmesg | tail -20"
    echo ""
    echo -e "4. ${BLUE}Ensure your user is in the lp group:${NC}"
    echo -e "   sudo usermod -aG lp \$(whoami)"
    echo -e "   sudo usermod -aG lpadmin \$(whoami)"
    echo -e "   (Then logout and login)"
    echo ""
    echo -e "5. ${BLUE}Check USB permissions:${NC}"
    echo -e "   ls -la /dev/bus/usb/*/* | grep -v root"
    echo ""
    echo -e "6. ${BLUE}Verify USB backend has correct permissions:${NC}"
    echo -e "   sudo chmod 0700 /usr/lib/cups/backend/usb"
    echo -e "   sudo chown root:root /usr/lib/cups/backend/usb"
    echo ""
    echo -e "7. ${BLUE}If in a VM, ensure USB passthrough is enabled${NC}"
else
    echo -e "${GREEN}✅ CUPS can detect USB printers!${NC}"
    echo ""
    echo -e "${BLUE}To add the printer to CUPS:${NC}"
    echo -e "1. Run the docker.sh script again"
    echo -e "2. Or manually configure via CUPS web interface: http://localhost:631"
    echo -e "3. Or use command line: sudo lpadmin -p MyPrinter -E -v <URI>"
fi

echo ""
