#!/bin/bash

# Colors for output (assuming these are defined in the main script or will be sourced)
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# The ACTUAL_USER variable is passed from the main install.sh script.
# Ensure it is defined in the calling script.

echo -e "${YELLOW}Installing CUPS (Common Unix Printing System) with Zebra printer support...${NC}"

# ✅ SKIP if already installed
CUPS_ALREADY_INSTALLED=false
if command -v lpstat &> /dev/null; then
    echo -e "${GREEN}✅ CUPS already installed${NC}"
    CUPS_ALREADY_INSTALLED=true
else
    echo -e "${YELLOW}📦 Installing CUPS packages...${NC}"
    # Removed 'printer-driver-zebra' from the list
    apt install -y cups cups-client cups-bsd cups-filters python3-cups libcups2-dev ghostscript
    echo -e "${GREEN}✅ CUPS packages installed with basic support${NC}"
fi

# Check for python3-cups if CUPS was already installed
if [ "$CUPS_ALREADY_INSTALLED" = true ]; then
    if ! dpkg -l | grep -q python3-cups; then
        echo -e "${YELLOW}Installing Python3 CUPS bindings...${NC}"
        apt install -y python3-cups libcups2-dev cups-filters ghostscript
        echo -e "${GREEN}✅ Python3 CUPS bindings installed${NC}"
    else
        echo -e "${GREEN}✅ Python3 CUPS bindings already installed${NC}"
    fi
fi

# Start and enable CUPS service
echo -e "${YELLOW}Starting CUPS service...${NC}"
systemctl start cups
systemctl enable cups
echo -e "${GREEN}✅ CUPS service started and enabled${NC}"

# ✅ SKIP daemon config if already done
echo -e "${YELLOW}Configuring CUPS daemon for admin-level access...${NC}"
if [ ! -f /etc/cups/cupsd.conf.backup ]; then
    cp /etc/cups/cupsd.conf /etc/cups/cupsd.conf.backup
    echo -e "${GREEN}✅ Backed up original cupsd.conf${NC}"
else
    echo -e "${GREEN}✅ CUPS config already backed up${NC}"
fi

# Ensure admin access is configured
if ! grep -q "Allow local administration" /etc/cups/cupsd.conf; then
    cat >> /etc/cups/cupsd.conf << 'CUPS_CONFIG'

# Allow local administration
<Location />
  Order allow,deny
  Allow localhost
  Allow 127.0.0.1
</Location>

<Location /admin>
  Order allow,deny
  Allow localhost
  Allow 127.0.0.1
</Location>

<Location /admin/conf>
  Order allow,deny
  Allow localhost
  Allow 127.0.0.1
</Location>
CUPS_CONFIG
    echo -e "${GREEN}✅ CUPS admin configuration added${NC}"
else
    echo -e "${GREEN}✅ CUPS admin configuration already exists${NC}"
fi

chmod 755 /etc/cups
chmod 644 /etc/cups/cupsd.conf
systemctl restart cups
echo -e "${GREEN}✅ CUPS daemon configured with admin-level access${NC}"

# ✅ SKIP user groups if already added
echo -e "${YELLOW}Checking CUPS user permissions...${NC}"
if groups "$ACTUAL_USER" | grep -q lpadmin; then
    echo -e "${GREEN}✅ User already in lpadmin group${NC}"
else
    echo -e "${YELLOW}Adding $ACTUAL_USER to lpadmin and lp groups for admin access...${NC}"
    usermod -aG lpadmin "$ACTUAL_USER"
    usermod -aG lp "$ACTUAL_USER"
    echo -e "${GREEN}✅ User added to lpadmin and lp groups (admin level)${NC}"
fi

# Enable CUPS remote access (always safe to re-run)
echo -e "${YELLOW}Enabling CUPS remote access...${NC}"
cupsctl --remote-any
systemctl restart cups
echo -e "${GREEN}✅ CUPS remote access enabled${NC}"

# Discover and list available printers
echo -e "${YELLOW}Discovering available printer connections...${NC}"
echo -e "${BLUE}Available printer URIs:${NC}"
lpinfo -v
echo ""

# Check if printer is already configured
echo -e "${YELLOW}Checking for existing printer configuration...${NC}"
EXISTING_PRINTER=$(lpstat -p -d 2>/dev/null | grep -oP 'printer \K[^ ]+' | head -1)

if [ -z "$EXISTING_PRINTER" ]; then
    # FIRST TIME SETUP - No printer found, ask to configure one
    echo -e "${YELLOW}No printer currently configured.${NC}"
    read -p "Do you want to configure your thermal printer now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter printer name (default: XP410B): " PRINTER_NAME
        PRINTER_NAME=${PRINTER_NAME:-XP410B}
        
        read -p "Do you want to set up the PRINTER_URI now? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            read -p "Enter printer USB URI (e.g., usb://Xprinter/XP-410B?serial=410BBE235170626): " PRINTER_URI
            
            if [ -z "$PRINTER_URI" ]; then
                echo -e "${RED}❌ Printer URI cannot be empty${NC}"
                echo -e "${YELLOW}Run 'lpinfo -v' manually to find your printer URI${NC}"
            else
                echo -e "${YELLOW}Adding thermal printer: $PRINTER_NAME at $PRINTER_URI${NC}"
                
                # Show the command being used so user can copy-paste if needed
                echo -e "${BLUE}Command: lpadmin -p $PRINTER_NAME -E -v '$PRINTER_URI' -m drv:///sample.drv/zebra.ppd${NC}"
                echo -e "${YELLOW}PPD Driver Flag: -m drv:///sample.drv/zebra.ppd${NC}"
                echo ""
                
                # Add printer with Zebra PPD driver (compatible with XPrinter thermal printers)
                lpadmin -p "$PRINTER_NAME" -E -v "$PRINTER_URI" -m drv:///sample.drv/zebra.ppd
                
                if [ $? -eq 0 ]; then
                    echo -e "${GREEN}✅ Thermal printer added successfully${NC}"
                    # Set as default
                    lpadmin -d "$PRINTER_NAME"
                    echo -e "${GREEN}✅ Printer set as default${NC}"
                    echo -e "${BLUE}Current printer status:${NC}"
                    lpstat -p -d
                else
                    echo -e "${RED}❌ Failed to add printer${NC}"
                    echo -e "${YELLOW}Try running manually with admin access:${NC}"
                    echo -e "${BLUE}  sudo lpadmin -p $PRINTER_NAME -E -v '$PRINTER_URI' -m drv:///sample.drv/zebra.ppd${NC}"
                fi
            fi
        else
            echo -e "${YELLOW}⏭️  Skipping PRINTER_URI setup for now${NC}"
            echo -e "${YELLOW}You can set it up later when running the installer again${NC}"
        fi
    fi
else
    # PRINTER ALREADY EXISTS - Show current config and offer to update
    echo -e "${GREEN}✅ Printer already configured: $EXISTING_PRINTER${NC}"
    echo -e "${BLUE}Current printer configuration:${NC}"
    lpstat -p -d
    echo ""
    read -p "Do you want to change the printer setup? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter new printer name (current: $EXISTING_PRINTER): " NEW_PRINTER_NAME
        NEW_PRINTER_NAME=${NEW_PRINTER_NAME:-$EXISTING_PRINTER}
        
        read -p "Do you want to change the PRINTER_URI? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            read -p "Enter new printer USB URI: " PRINTER_URI
            if [ -z "$PRINTER_URI" ]; then
                echo -e "${RED}❌ Printer URI cannot be empty${NC}"
            else
                echo -e "${YELLOW}Updating printer configuration...${NC}"
                lpadmin -p "$NEW_PRINTER_NAME" -E -v "$PRINTER_URI" -m drv:///sample.drv/zebra.ppd
                if [ $? -eq 0 ]; then
                    echo -e "${GREEN}✅ Printer updated successfully${NC}"
                    lpstat -p -d
                else
                    echo -e "${RED}❌ Failed to update printer${NC}"
                fi
            fi
        else
            echo -e "${YELLOW}⏭️  Keeping existing PRINTER_URI${NC}"
        fi
    else
        echo -e "${YELLOW}⏭️  Keeping existing printer setup${NC}"
    fi
fi

# ✅ SKIP printer-driver-all if already installed
echo -e "${YELLOW}Checking printer drivers and utilities...${NC}"
if dpkg -l | grep -q printer-driver-all; then
    echo -e "${GREEN}✅ Printer drivers already installed${NC}"
else
    echo -e "${YELLOW}Installing additional printer drivers and utilities...${NC}"
    apt install -y printer-driver-all imagemagick
    echo -e "${GREEN}✅ Printer drivers and utilities installed${NC}"
fi
