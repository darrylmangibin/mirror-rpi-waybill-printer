#!/bin/bash
# QR Code generator for easy access to the application
# Displays QR code in terminal for quick scanning

URL=$1

if [ -z "$URL" ]; then
    echo "Usage: $0 <url>"
    exit 1
fi

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📱 Scan QR Code to Access Application${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Try Python qrcode library first (pure ASCII, no dependencies)
if command -v python3 &> /dev/null; then
    python3 << EOF 2>/dev/null
import sys
try:
    import qrcode
    qr = qrcode.QRCode()
    qr.add_data("$URL")
    qr.make()
    qr.print_ascii(invert=True)
    sys.exit(0)
except ImportError:
    sys.exit(1)
EOF
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${YELLOW}URL: $URL${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        return 0
    fi
fi

# Fallback: Try qrencode command (common on Linux)
if command -v qrencode &> /dev/null; then
    qrencode -t ANSIUTF8 "$URL"
    echo ""
    echo -e "${YELLOW}URL: $URL${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    return 0
fi

# Fallback: Generate PNG and show path (for systems with qrencode)
if command -v qrencode &> /dev/null; then
    TEMP_QR="/tmp/app-qr-$(date +%s).png"
    qrencode -o "$TEMP_QR" "$URL"
    
    echo -e "${GREEN}✅ QR Code generated: $TEMP_QR${NC}"
    echo -e "${YELLOW}URL: $URL${NC}"
    echo ""
    
    # Try to display if imgcat or similar is available
    if command -v imgcat &> /dev/null; then
        imgcat "$TEMP_QR"
    elif command -v kitty &> /dev/null && [ -n "$KITTY_WINDOW_ID" ]; then
        kitty +kitten icat "$TEMP_QR"
    fi
    
    # Clean up after 2 seconds
    (sleep 2 && rm -f "$TEMP_QR" 2>/dev/null) &
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    return 0
fi

# No QR code generator available - show styled URL instead
echo -e "${YELLOW}⚠️  QR code generator not available${NC}"
echo ""
echo -e "${GREEN}📱 Access the application at:${NC}"
echo -e "${BLUE}┌─────────────────────────────────────────────┐${NC}"
echo -e "${BLUE}│${NC}  ${YELLOW}$URL${NC}"
echo -e "${BLUE}└─────────────────────────────────────────────┘${NC}"
echo ""
echo -e "${BLUE}Install QR code support:${NC}"
echo -e "  ${YELLOW}pip3 install qrcode${NC}  (recommended)"
echo -e "  ${YELLOW}apt-get install qrencode${NC}  (alternative)"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
