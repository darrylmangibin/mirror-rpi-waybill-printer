#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🖨️  Auto-configuring CUPS from .env${NC}"

# Path to your project's .env file
ENV_FILE="/home/roei/inspire-projects/rpi-waybill-printer/.env"

# Check if .env exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠️  .env file not found at $ENV_FILE${NC}"
    echo -e "${YELLOW}Skipping automatic CUPS configuration${NC}"
    exit 0
fi

# Source the .env file
source "$ENV_FILE"

# Validate required variables
if [ -z "$PRINTER_NAME" ] || [ -z "$PRINTER_URI" ]; then
    echo -e "${YELLOW}⚠️  PRINTER_NAME or PRINTER_URI not set in .env${NC}"
    echo -e "${YELLOW}Skipping automatic CUPS configuration${NC}"
    exit 0
fi

echo -e "${BLUE}Configuring printer: $PRINTER_NAME${NC}"
echo -e "${BLUE}URI: $PRINTER_URI${NC}"

# Check if printer already exists
EXISTING_PRINTER=$(lpstat -p 2>/dev/null | grep -oP 'printer \K[^ ]+' | head -1)

if [ "$EXISTING_PRINTER" = "$PRINTER_NAME" ]; then
    # Update existing printer
    echo -e "${YELLOW}Updating existing printer configuration...${NC}"
    lpadmin -p "$PRINTER_NAME" -E -v "$PRINTER_URI" -m drv:///sample.drv/zebra.ppd
else
    # Add new printer
    echo -e "${YELLOW}Adding new printer...${NC}"
    lpadmin -p "$PRINTER_NAME" -E -v "$PRINTER_URI" -m drv:///sample.drv/zebra.ppd
    
    # Set as default
    lpadmin -d "$PRINTER_NAME"
    echo -e "${GREEN}✅ Printer set as default${NC}"
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ CUPS auto-configuration completed successfully${NC}"
    echo -e "${BLUE}Current printer status:${NC}"
    lpstat -p -d
else
    echo -e "${RED}❌ Failed to configure printer${NC}"
    exit 1
fi

