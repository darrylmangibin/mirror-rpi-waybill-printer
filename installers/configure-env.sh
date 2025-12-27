#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the project root directory (parent of the installers directory)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_ENV_EXAMPLE="$PROJECT_ROOT/.env.example"
BACKEND_ENV_FILE="$PROJECT_ROOT/.env"
FRONTEND_ENV_EXAMPLE="$PROJECT_ROOT/frontend/.env.example"
FRONTEND_ENV_FILE="$PROJECT_ROOT/frontend/.env"

# Function to validate IP address
validate_ip() {
    local ip=$1
    # Basic IPv4 validation: 0-255 for each octet
    if [[ $ip =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}$ ]]; then
        # Check if each octet is between 0-255
        local IFS=.
        read -ra octets <<< "$ip"
        for octet in "${octets[@]}"; do
            if ((octet > 255)); then
                return 1
            fi
        done
        return 0
    fi
    return 1
}

# Function to validate URL format
validate_url() {
    local url=$1
    # Check if URL starts with http:// or https://
    if [[ $url =~ ^https?://[^/]+:?[0-9]*$ ]]; then
        return 0
    fi
    return 1
}

# Function to display file contents
display_file_contents() {
    local file=$1
    local label=$2
    
    if [ -f "$file" ]; then
        echo -e "${YELLOW}📄 Current $label:${NC}"
        cat "$file" | sed 's/^/  /'  # Indent for readability
        echo
    fi
}

# Function to configure .env file
configure_env_file() {
    local env_file=$1
    local env_example=$2
    local file_label=$3
    
    echo -e "${BLUE}🔧 Configuring $file_label${NC}\n"
    
    if [ -f "$env_file" ]; then
        echo -e "${YELLOW}⚠️  $file_label already exists!${NC}\n"
        display_file_contents "$env_file" "$file_label"
        
        read -p "Do you want to overwrite it with the example? (y/n): " -n 1 -r
        echo
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cp "$env_example" "$env_file"
            echo -e "${GREEN}✅ $file_label overwritten with example${NC}\n"
        else
            echo -e "${GREEN}✅ Keeping existing $file_label${NC}\n"
            return
        fi
    else
        if [ ! -f "$env_example" ]; then
            echo -e "${RED}❌ Error: $env_example does not exist${NC}"
            exit 1
        fi
        
        cp "$env_example" "$env_file"
        echo -e "${GREEN}✅ $file_label created from example${NC}\n"
    fi
}

# Main configuration logic
echo -e "${BLUE}🚀 Environment Configuration${NC}\n"

# Configure Backend .env
configure_env_file "$BACKEND_ENV_FILE" "$BACKEND_ENV_EXAMPLE" "backend/.env"

# Configure Frontend .env
configure_env_file "$FRONTEND_ENV_FILE" "$FRONTEND_ENV_EXAMPLE" "frontend/.env"

# Configure VITE_BASE_URL
echo -e "${BLUE}🔧 Configuring VITE_BASE_URL${NC}\n"

# Get current VITE_BASE_URL
CURRENT_VITE_BASE_URL=$(grep "^VITE_BASE_URL=" "$FRONTEND_ENV_FILE" 2>/dev/null | cut -d= -f2)

if [ -n "$CURRENT_VITE_BASE_URL" ]; then
    echo -e "${YELLOW}Current VITE_BASE_URL: ${GREEN}${CURRENT_VITE_BASE_URL}${NC}"
    read -p "Do you want to update it? (y/n): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${GREEN}✅ Keeping current VITE_BASE_URL${NC}\n"
        return
    fi
else
    echo -e "${YELLOW}No VITE_BASE_URL found in $FRONTEND_ENV_FILE${NC}"
fi

# Prompt user for IP address
DEFAULT_FULL_IP="192.168.110.1"
echo -e "\n${YELLOW}Enter the IP address for VITE_BASE_URL${NC}"
read -p "Enter the full IP address (e.g., '${DEFAULT_FULL_IP}', where the last part often changes): " -i "${DEFAULT_FULL_IP}" IP_ADDRESS_INPUT

# Use the default if the user just presses enter
IP_ADDRESS_INPUT=${IP_ADDRESS_INPUT:-$DEFAULT_FULL_IP}

# Validate IP address
if ! validate_ip "$IP_ADDRESS_INPUT"; then
    echo -e "${RED}❌ Invalid IP address: ${IP_ADDRESS_INPUT}${NC}"
    echo -e "${YELLOW}Please ensure the IP address is in the format: xxx.xxx.xxx.xxx${NC}"
    return
fi

# Construct the VITE_BASE_URL
VITE_BASE_URL_VALUE="http://${IP_ADDRESS_INPUT}:5000"

# Validate the constructed URL
if ! validate_url "$VITE_BASE_URL_VALUE"; then
    echo -e "${RED}❌ Invalid URL constructed: ${VITE_BASE_URL_VALUE}${NC}"
    return
fi

# Display the new value for confirmation
echo -e "\n${YELLOW}New VITE_BASE_URL: ${GREEN}${VITE_BASE_URL_VALUE}${NC}"
read -p "Confirm update? (y/n): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⏸️  Update cancelled${NC}\n"
    return
fi

# Update or add VITE_BASE_URL in the .env file
if grep -q "VITE_BASE_URL=" "$FRONTEND_ENV_FILE"; then
    sed -i "s|VITE_BASE_URL=.*|VITE_BASE_URL=${VITE_BASE_URL_VALUE}|" "$FRONTEND_ENV_FILE"
    echo -e "${GREEN}✅ VITE_BASE_URL updated in frontend/.env${NC}"
else
    echo "VITE_BASE_URL=${VITE_BASE_URL_VALUE}" >> "$FRONTEND_ENV_FILE"
    echo -e "${GREEN}✅ VITE_BASE_URL added to frontend/.env${NC}"
fi

echo -e "${GREEN}✅ VITE_BASE_URL successfully set to: ${VITE_BASE_URL_VALUE}${NC}\n"

# Configure Printer Settings
echo -e "${BLUE}🖨️  Configuring Printer Settings${NC}\n"

# Get current printer settings
CURRENT_PRINTER_NAME=$(grep "^PRINTER_NAME=" "$BACKEND_ENV_FILE" 2>/dev/null | cut -d= -f2)
CURRENT_PRINTER_URI=$(grep "^PRINTER_URI=" "$BACKEND_ENV_FILE" 2>/dev/null | cut -d= -f2)

if [ -n "$CURRENT_PRINTER_NAME" ] && [ -n "$CURRENT_PRINTER_URI" ]; then
    echo -e "${YELLOW}Current Printer Configuration:${NC}"
    echo -e "  Name: ${GREEN}${CURRENT_PRINTER_NAME}${NC}"
    echo -e "  URI:  ${GREEN}${CURRENT_PRINTER_URI}${NC}\n"
    
    read -p "Do you want to update the printer configuration? (y/n): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${GREEN}✅ Keeping current printer configuration${NC}\n"
        return
    fi
else
    echo -e "${YELLOW}No printer configuration found in $BACKEND_ENV_FILE${NC}\n"
fi

# Prompt for printer name
DEFAULT_PRINTER_NAME=${CURRENT_PRINTER_NAME:-"XP410B"}
read -p "Enter printer name (default: ${DEFAULT_PRINTER_NAME}): " -r PRINTER_NAME
PRINTER_NAME=${PRINTER_NAME:-$DEFAULT_PRINTER_NAME}

echo ""
echo -e "${YELLOW}For PRINTER_URI, you need the USB serial number.${NC}"
echo -e "${BLUE}To find it, run: lpinfo -v${NC}\n"

# Prompt for printer URI
echo -e "${YELLOW}Printer URI format:${NC}"
echo -e "  ${BLUE}usb://Xprinter/XP-410B?serial=410BBE235170626${NC}"
echo -e "  ${BLUE}usb://Brother/HL-L2350DW?serial=XXXXX${NC}\n"

read -p "Enter the full PRINTER_URI (or just the serial if using Xprinter): " -r PRINTER_URI_INPUT

# Handle shorthand for Xprinter (just serial number)
if [[ ! "$PRINTER_URI_INPUT" =~ ^usb:// ]]; then
    # User likely entered just the serial number
    PRINTER_URI="usb://Xprinter/XP-410B?serial=${PRINTER_URI_INPUT}"
    echo -e "${YELLOW}Constructing URI from serial: ${PRINTER_URI}${NC}"
else
    PRINTER_URI="$PRINTER_URI_INPUT"
fi

echo ""
echo -e "${YELLOW}New Printer Configuration:${NC}"
echo -e "  Name: ${GREEN}${PRINTER_NAME}${NC}"
echo -e "  URI:  ${GREEN}${PRINTER_URI}${NC}\n"

read -p "Confirm update? (y/n): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⏸️  Update cancelled${NC}\n"
    return
fi

# Update or add printer settings in the .env file
if grep -q "PRINTER_NAME=" "$BACKEND_ENV_FILE"; then
    sed -i "s|PRINTER_NAME=.*|PRINTER_NAME=${PRINTER_NAME}|" "$BACKEND_ENV_FILE"
else
    echo "PRINTER_NAME=${PRINTER_NAME}" >> "$BACKEND_ENV_FILE"
fi

if grep -q "PRINTER_URI=" "$BACKEND_ENV_FILE"; then
    sed -i "s|PRINTER_URI=.*|PRINTER_URI=${PRINTER_URI}|" "$BACKEND_ENV_FILE"
else
    echo "PRINTER_URI=${PRINTER_URI}" >> "$BACKEND_ENV_FILE"
fi

echo -e "${GREEN}✅ Printer configuration successfully set${NC}\n"

