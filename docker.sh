#!/bin/bash
# Docker startup script with dynamic IP detection and auto-installation

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting RPI Waybill Printer with Docker${NC}\n"

# ======================================
# Helper function to run commands with privilege escalation
# ======================================
run_privileged() {
    if [ "$EUID" -eq 0 ]; then
        # Already running as root
        "$@"
    elif command -v sudo &> /dev/null; then
        # sudo is available
        sudo "$@"
    elif command -v su &> /dev/null; then
        # No sudo, try su -c
        echo -e "${YELLOW}sudo not found, using su -c...${NC}"
        su -c "$*"
    else
        # Neither sudo nor su available
        echo -e "${RED}❌ Error: Neither sudo nor su command found${NC}"
        echo -e "${YELLOW}Please run this script as root or install sudo/su:${NC}"
        echo -e "  As root: su - root"
        echo -e "  Then run: ./docker.sh $*"
        echo ""
        echo -e "${YELLOW}Or install sudo first:${NC}"
        if command -v dnf &> /dev/null; then
            echo -e "  dnf install sudo  # (as root)"
        elif command -v apt-get &> /dev/null; then
            echo -e "  apt-get install sudo  # (as root)"
        fi
        exit 1
    fi
}

# ======================================
# Detect Linux distribution
# ======================================
detect_distro() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        echo "$ID"
    elif [ -f /etc/fedora-release ]; then
        echo "fedora"
    elif [ -f /etc/debian_version ]; then
        echo "debian"
    else
        echo "unknown"
    fi
}

DISTRO=$(detect_distro)

# ======================================
# Check and Install Docker if needed
# ======================================
echo -e "${BLUE}🐳 Checking Docker installation...${NC}"

DOCKER_JUST_INSTALLED=false

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker not found. Installing Docker...${NC}"
    echo -e "${YELLOW}This may take a few minutes...${NC}"
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Install Docker on Linux using official script
        curl -fsSL https://get.docker.com -o get-docker.sh
        run_privileged sh get-docker.sh
        run_privileged rm get-docker.sh
        
        # Add current user to docker group
        ACTUAL_USER=${SUDO_USER:-$(whoami)}
        run_privileged usermod -aG docker "$ACTUAL_USER"
        
        DOCKER_JUST_INSTALLED=true
        
        echo -e "${GREEN}✅ Docker installed${NC}"
    else
        echo -e "${RED}❌ Docker installation only supported on Linux${NC}"
        echo -e "${YELLOW}Please install Docker Desktop manually on macOS/Windows${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Docker already installed${NC}"
fi

# Check if Docker Compose is installed
if ! command -v docker compose &> /dev/null && ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}Docker Compose not found. Installing...${NC}"
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Install based on distribution
        case "$DISTRO" in
            fedora|rhel|centos)
                echo -e "${BLUE}Detected Fedora/RHEL-based system${NC}"
                run_privileged dnf install -y docker-compose-plugin
                ;;
            debian|ubuntu|raspbian)
                echo -e "${BLUE}Detected Debian/Ubuntu-based system${NC}"
                run_privileged apt-get update -qq
                run_privileged apt-get install -y docker-compose-plugin
                ;;
            *)
                echo -e "${YELLOW}Unknown distribution, using Docker's install script...${NC}"
                # Docker Compose plugin should be installed with Docker
                ;;
        esac
        echo -e "${GREEN}✅ Docker Compose installed${NC}"
    else
        echo -e "${RED}❌ Docker Compose installation only supported on Linux${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Docker Compose already installed${NC}"
fi

# Enable Docker service to start on boot (Linux only)
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo -e "${YELLOW}Enabling Docker service to start on boot...${NC}"
    run_privileged systemctl enable docker 2>/dev/null || true
    run_privileged systemctl start docker 2>/dev/null || true
    echo -e "${GREEN}✅ Docker service enabled${NC}"
fi

# If Docker was just installed, we need to handle group permissions
if [ "$DOCKER_JUST_INSTALLED" = true ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Docker was just installed. Activating docker group...${NC}"
    echo -e "${BLUE}Continuing setup with privileged docker commands...${NC}"
    # Set a flag to use privileged docker commands
    USE_PRIVILEGED=true
else
    # Check if user can run docker without privilege escalation
    if docker ps &> /dev/null; then
        USE_PRIVILEGED=false
    else
        echo -e "${YELLOW}⚠️  Docker requires privilege escalation. Using privileged commands...${NC}"
        USE_PRIVILEGED=true
    fi
fi

echo ""

# ======================================
# Detect Local IP Address
# ======================================
echo -e "${YELLOW}Detecting local IP address...${NC}"

if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux/Raspberry Pi
    LOCAL_IP=$(hostname -I | awk '{print $1}')
else
    LOCAL_IP="localhost"
fi

if [ -z "$LOCAL_IP" ]; then
    echo -e "${YELLOW}⚠️  Could not detect IP, using localhost${NC}"
    LOCAL_IP="localhost"
else
    echo -e "${GREEN}✅ Detected IP: $LOCAL_IP${NC}"
fi

# Generate frontend .env file with detected IP
echo -e "${YELLOW}Generating frontend/.env with detected IP...${NC}"
cat > frontend/.env <<EOF
# Frontend Configuration - Auto-generated by docker.sh
# API URL for the React frontend
# Generated at: $(date)
VITE_API_URL=http://${LOCAL_IP}:5000
VITE_BASE_URL=http://${LOCAL_IP}:5000
EOF

echo -e "${GREEN}✅ Generated frontend/.env:${NC}"
cat frontend/.env
echo ""

# ======================================
# Auto-detect Printer Configuration
# ======================================
echo -e "${BLUE}🖨️  Detecting Printer Configuration${NC}"

# Check if printer is already properly configured
PRINTER_CONFIGURED=false
if [ -f ".env.printer" ]; then
    source .env.printer
    if [ -n "$PRINTER_NAME" ] && [ -n "$PRINTER_URI" ] && [ -n "$PRINTER_DRIVER" ]; then
        PRINTER_CONFIGURED=true
        echo -e "${GREEN}✅ Printer already configured: $PRINTER_NAME (Driver: $PRINTER_DRIVER)${NC}"
    fi
fi

if [ "$PRINTER_CONFIGURED" = false ]; then
    # Try to detect printer automatically (Linux/Raspberry Pi only)
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Check if CUPS is installed, if not offer to install
        if ! command -v lpstat &> /dev/null; then
            echo -e "${YELLOW}⚠️  CUPS not installed on host${NC}"
            echo -e "${BLUE}Would you like to install CUPS for printer detection? (y/n)${NC}"
            read -p "> " -n 1 -r
            echo
            
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                echo -e "${YELLOW}Installing CUPS...${NC}"
                
                case "$DISTRO" in
                    fedora|rhel|centos)
                        run_privileged dnf install -y cups cups-client
                        run_privileged systemctl enable cups
                        run_privileged systemctl start cups
                        ;;
                    debian|ubuntu|raspbian)
                        run_privileged apt-get update -qq
                        run_privileged apt-get install -y cups cups-client
                        run_privileged systemctl enable cups
                        run_privileged systemctl start cups
                        ;;
                    *)
                        echo -e "${YELLOW}Unknown distribution, attempting generic installation...${NC}"
                        run_privileged apt-get update -qq 2>/dev/null || run_privileged dnf update -y 2>/dev/null
                        run_privileged apt-get install -y cups cups-client 2>/dev/null || run_privileged dnf install -y cups cups-client 2>/dev/null
                        run_privileged systemctl enable cups 2>/dev/null || true
                        run_privileged systemctl start cups 2>/dev/null || true
                        ;;
                esac
                
                sleep 2
                
                if command -v lpstat &> /dev/null; then
                    echo -e "${GREEN}✅ CUPS installed${NC}"
                else
                    echo -e "${RED}❌ CUPS installation failed${NC}"
                fi
                echo ""
            fi
        fi
        
        echo -e "${YELLOW}Scanning for printers...${NC}"
        
        # Check if CUPS is available (CUPS installed on host)
        if command -v lpstat &> /dev/null; then
            DETECTED_URI=""
            PRINTER_NAME=""
            
            # First, check what USB devices CUPS can see
            echo -e "${BLUE}Checking for USB devices...${NC}"
            if [ "$USE_PRIVILEGED" = true ]; then
                USB_DEVICES=$(run_privileged lpinfo -v 2>/dev/null)
            else
                echo "TESTASDASDASDASDASDASDASDASDASDASDASDASDASD"
                USB_DEVICES=$(lpinfo -v 2>/dev/null)
            fi
            
            USB_PRINTERS=$(echo "$USB_DEVICES" | grep "usb://")
            
            if [ -n "$USB_PRINTERS" ]; then
                echo -e "${GREEN}✅ USB printer(s) detected:${NC}"
                echo "$USB_PRINTERS"
                echo ""
            else
                echo -e "${YELLOW}⚠️  No USB printers detected by CUPS${NC}"
                echo -e "${BLUE}Troubleshooting:${NC}"
                echo -e "  1. Is the printer connected via USB and powered on?"
                echo -e "  2. Try manually: sudo lpinfo -v | grep usb"
                echo ""
            fi
            
            # Check if printer is already configured in CUPS
            EXISTING_PRINTER=$(lpstat -p 2>/dev/null | head -1 | awk '{print $2}')
            
            if [ -n "$EXISTING_PRINTER" ]; then
                echo -e "${GREEN}✅ Found configured printer in CUPS: $EXISTING_PRINTER${NC}"
                
                # Get the URI for the existing printer
                DETECTED_URI=$(lpstat -v "$EXISTING_PRINTER" 2>/dev/null | sed -n "s/.*device for $EXISTING_PRINTER: //p")
                PRINTER_NAME="$EXISTING_PRINTER"
            else
                echo -e "${YELLOW}⚠️  No printer configured in CUPS yet${NC}"
                
                # If we have USB printers detected, offer to auto-configure
                if [ -n "$USB_PRINTERS" ]; then
                    echo ""
                    echo -e "${BLUE}Would you like to configure the printer now? (y/n)${NC}"
                    read -p "> " -n 1 -r
                    echo
                    
                    if [[ $REPLY =~ ^[Yy]$ ]]; then
                        # Get first USB printer URI
                        FIRST_USB=$(echo "$USB_PRINTERS" | head -1 | awk '{print $2}')
                        
                        # Extract printer model for default name
                        PRINTER_MODEL=$(echo "$FIRST_USB" | sed -n 's/.*\/\/\([^\/]*\)\/.*/\1/p')
                        DEFAULT_NAME="${PRINTER_MODEL:-XP410B}"
                        
                        read -p "Enter printer name (default: $DEFAULT_NAME): " PRINTER_NAME
                        PRINTER_NAME=${PRINTER_NAME:-$DEFAULT_NAME}
                        
                        echo -e "${BLUE}Available USB printers:${NC}"
                        echo "$USB_PRINTERS" | nl -w2 -s'. '
                        echo ""
                        read -p "Select printer number (default: 1): " PRINTER_CHOICE
                        PRINTER_CHOICE=${PRINTER_CHOICE:-1}
                        
                        DETECTED_URI=$(echo "$USB_PRINTERS" | sed -n "${PRINTER_CHOICE}p" | awk '{print $2}')
                        
                        echo ""
                        echo -e "${YELLOW}Configuring printer in CUPS...${NC}"
                        echo -e "${BLUE}Name: $PRINTER_NAME${NC}"
                        echo -e "${BLUE}URI:  $DETECTED_URI${NC}"
                        
                        # Add printer to CUPS with Zebra driver (always needs privilege)
                        run_privileged lpadmin -p "$PRINTER_NAME" -E -v "$DETECTED_URI" -m drv:///sample.drv/zebra.ppd
                        run_privileged lpadmin -d "$PRINTER_NAME"
                        
                        if [ $? -eq 0 ]; then
                            echo -e "${GREEN}✅ Printer configured in CUPS successfully${NC}"
                            lpstat -p -d 2>/dev/null
                        else
                            echo -e "${RED}❌ Failed to configure printer in CUPS${NC}"
                            DETECTED_URI=""
                            PRINTER_NAME=""
                        fi
                    fi
                else
                    echo ""
                    echo -e "${BLUE}📋 Please configure your printer in CUPS first:${NC}"
                    echo ""
                    echo -e "${YELLOW}Web Interface: http://localhost:631${NC}"
                    echo -e "  Administration → Add Printer → Select USB printer → Choose driver"
                    echo ""
                    echo -e "${BLUE}After configuring, press Enter to continue...${NC}"
                    read -r
                    
                    # Re-check after user configuration
                    EXISTING_PRINTER=$(lpstat -p 2>/dev/null | head -1 | awk '{print $2}')
                    if [ -n "$EXISTING_PRINTER" ]; then
                        echo -e "${GREEN}✅ Found configured printer: $EXISTING_PRINTER${NC}"
                        DETECTED_URI=$(lpstat -v "$EXISTING_PRINTER" 2>/dev/null | sed -n "s/.*device for $EXISTING_PRINTER: //p")
                        PRINTER_NAME="$EXISTING_PRINTER"
                    fi
                fi
            fi
            
            # If we found a printer, ask to select driver and save configuration
            if [ -n "$DETECTED_URI" ]; then
                echo ""
                echo -e "${BLUE}Printer configuration:${NC}"
                echo -e "  Name: $PRINTER_NAME"
                echo -e "  URI:  $DETECTED_URI"
                echo ""
                
                # Ask if user wants to select a driver
                echo -e "${BLUE}Would you like to select a printer driver? (y/n)${NC}"
                read -p "> " -n 1 -r
                echo
                
                PRINTER_DRIVER=""
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    echo -e "${YELLOW}Fetching available printer drivers...${NC}"
                    
                    # Get full list of available drivers from CUPS
                    if [ "$USE_PRIVILEGED" = true ]; then
                        ALL_DRIVERS=$(run_privileged lpinfo -m 2>/dev/null)
                    else
                        ALL_DRIVERS=$(lpinfo -m 2>/dev/null)
                    fi
                    
                    if [ -n "$ALL_DRIVERS" ]; then
                        echo ""
                        echo -e "${BLUE}Driver Selection Options:${NC}"
                        echo -e "  1. Search by manufacturer (recommended)"
                        echo -e "  2. Browse generic drivers"
                        echo -e "  3. Enter driver path manually"
                        echo ""
                        echo -e "${BLUE}Select option (1-3):${NC}"
                        read -p "> " SELECTION_METHOD
                        
                        case "$SELECTION_METHOD" in
                            1)
                                echo -e "${BLUE}Enter manufacturer name (e.g., 'zebra', 'epson', 'hp', 'xprinter'):${NC}"
                                read -p "> " SEARCH_TERM
                                
                                if [ -n "$SEARCH_TERM" ]; then
                                    echo ""
                                    echo -e "${YELLOW}Searching for '$SEARCH_TERM' drivers...${NC}"
                                    
                                    SEARCH_RESULTS=$(echo "$ALL_DRIVERS" | grep -i "$SEARCH_TERM")
                                    
                                    if [ -n "$SEARCH_RESULTS" ]; then
                                        RESULT_COUNT=$(echo "$SEARCH_RESULTS" | wc -l)
                                        echo -e "${GREEN}Found $RESULT_COUNT driver(s)${NC}"
                                        echo ""
                                        
                                        # Show first 30 results
                                        echo "$SEARCH_RESULTS" | head -30 | nl -w2 -s'. '
                                        
                                        if [ "$RESULT_COUNT" -gt 30 ]; then
                                            echo ""
                                            echo -e "${YELLOW}Showing first 30 of $RESULT_COUNT results${NC}"
                                        fi
                                        
                                        echo ""
                                        echo -e "${BLUE}Enter driver number:${NC}"
                                        read -p "> " DRIVER_CHOICE
                                        
                                        if [ -n "$DRIVER_CHOICE" ]; then
                                            PRINTER_DRIVER=$(echo "$SEARCH_RESULTS" | sed -n "${DRIVER_CHOICE}p" | awk '{print $1}')
                                            echo -e "${GREEN}✅ Selected driver: $PRINTER_DRIVER${NC}"
                                        fi
                                    else
                                        echo -e "${YELLOW}⚠️  No drivers found matching '$SEARCH_TERM'${NC}"
                                        echo -e "${BLUE}Try another search term or select option 3 to enter manually${NC}"
                                    fi
                                fi
                                ;;
                            2)
                                echo ""
                                GENERIC_DRIVERS=$(echo "$ALL_DRIVERS" | grep -i "generic\|raw")
                                
                                if [ -n "$GENERIC_DRIVERS" ]; then
                                    echo -e "${BLUE}Generic drivers:${NC}"
                                    echo "$GENERIC_DRIVERS" | nl -w2 -s'. '
                                    echo ""
                                    echo -e "${BLUE}Enter driver number:${NC}"
                                    read -p "> " DRIVER_CHOICE
                                    
                                    if [ -n "$DRIVER_CHOICE" ]; then
                                        PRINTER_DRIVER=$(echo "$GENERIC_DRIVERS" | sed -n "${DRIVER_CHOICE}p" | awk '{print $1}')
                                        echo -e "${GREEN}✅ Selected driver: $PRINTER_DRIVER${NC}"
                                    fi
                                else
                                    echo -e "${YELLOW}⚠️  No generic drivers found${NC}"
                                fi
                                ;;
                            3)
                                echo -e "${BLUE}Enter driver PPD path (e.g., drv:///sample.drv/zebra.ppd):${NC}"
                                read -p "> " PRINTER_DRIVER
                                
                                if [ -n "$PRINTER_DRIVER" ]; then
                                    echo -e "${GREEN}✅ Using driver: $PRINTER_DRIVER${NC}"
                                fi
                                ;;
                            *)
                                echo -e "${YELLOW}Invalid selection${NC}"
                                ;;
                        esac
                    else
                        echo -e "${YELLOW}⚠️  Could not fetch driver list${NC}"
                    fi
                fi
                
                echo ""
                echo -e "${BLUE}Save this configuration? (y/n)${NC}"
                read -p "> " -n 1 -r
                echo
                
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    # Create .env.printer file
                    cat > .env.printer <<EOF
# Printer Configuration - Auto-detected by docker.sh
# Generated at: $(date)
export PRINTER_NAME=$PRINTER_NAME
export PRINTER_URI=$DETECTED_URI
EOF
                    
                    # Add driver if selected
                    if [ -n "$PRINTER_DRIVER" ]; then
                        echo "export PRINTER_DRIVER=$PRINTER_DRIVER" >> .env.printer
                        export PRINTER_DRIVER=$PRINTER_DRIVER
                    fi
                    
                    echo -e "${GREEN}✅ Saved printer configuration to .env.printer${NC}"
                    export PRINTER_NAME=$PRINTER_NAME
                    export PRINTER_URI=$DETECTED_URI
                else
                    echo -e "${YELLOW}⏭️  Skipping printer configuration${NC}"
                fi
            else
                echo -e "${YELLOW}⚠️  No printer detected${NC}"
                echo -e "${BLUE}You can configure manually later by creating .env.printer:${NC}"
                echo -e "  export PRINTER_NAME=XP410B"
                echo -e "  export PRINTER_URI=usb://Xprinter/XP-410B?serial=410BBE235170626"
            fi
        else
            echo -e "${YELLOW}⚠️  CUPS not installed on host, skipping printer detection${NC}"
            echo -e "${BLUE}Printer will be configured inside Docker container${NC}"
        fi
    else
        echo -e "${YELLOW}⏭️  Printer detection only available on Linux${NC}"
    fi
fi

echo ""

# Ensure .env.printer exists (create empty if missing) to prevent docker-compose errors
if [ ! -f ".env.printer" ]; then
    touch .env.printer
    echo -e "${BLUE}ℹ️  Created empty .env.printer${NC}"
fi

# Determine which compose file to use and handle special commands
COMPOSE_FILE="docker-compose.yml"
COMMAND=$1

# Handle dev and prod modes
if [ "$COMMAND" == "dev" ]; then
    COMPOSE_FILE="docker-compose.dev.yml"
    echo -e "${BLUE}Using development configuration${NC}"
    
    # Check if local dependencies exist, if not run dev-setup.sh
    if [ ! -d "venv" ] || [ ! -d "frontend/node_modules" ]; then
        echo ""
        echo -e "${YELLOW}📦 Local dependencies not found. Running dev-setup.sh...${NC}"
        chmod +x dev-setup.sh
        ./dev-setup.sh
        echo ""
    fi
elif [ "$COMMAND" == "prod" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
    echo -e "${BLUE}Using production configuration${NC}"
else
    echo -e "${BLUE}Using default configuration${NC}"
fi

# Start Docker containers
echo -e "${YELLOW}Starting Docker containers...${NC}"

# Pass printer environment variables if they exist
if [ -n "$PRINTER_NAME" ] && [ -n "$PRINTER_URI" ]; then
    echo -e "${BLUE}Using printer configuration:${NC}"
    echo -e "  Name: $PRINTER_NAME"
    echo -e "  URI:  $PRINTER_URI"
    echo ""
    
    # Export for docker-compose to use
    export PRINTER_NAME
    export PRINTER_URI
fi

if [ "$2" == "--build" ]; then
    if [ "$USE_PRIVILEGED" = true ]; then
        run_privileged docker compose -f $COMPOSE_FILE up -d --build
    else
        docker compose -f $COMPOSE_FILE up -d --build
    fi
else
    if [ "$USE_PRIVILEGED" = true ]; then
        run_privileged docker compose -f $COMPOSE_FILE up -d
    else
        docker compose -f $COMPOSE_FILE up -d
    fi
fi

echo ""
echo -e "${GREEN}✅ Containers started!${NC}"
echo -e "${BLUE}Access the application at:${NC}"
echo -e "  Frontend: http://${LOCAL_IP}:5173"
echo -e "  Backend:  http://${LOCAL_IP}:5000"
echo ""
echo -e "${BLUE}Commands:${NC}"
if [ "$USE_PRIVILEGED" = true ]; then
    if command -v sudo &> /dev/null; then
        echo -e "  View logs:    sudo docker compose -f $COMPOSE_FILE logs -f"
        echo -e "  Stop:         sudo docker compose -f $COMPOSE_FILE down"
        echo -e "  Restart:      sudo docker compose -f $COMPOSE_FILE restart"
    else
        echo -e "  View logs:    su -c 'docker compose -f $COMPOSE_FILE logs -f'"
        echo -e "  Stop:         su -c 'docker compose -f $COMPOSE_FILE down'"
        echo -e "  Restart:      su -c 'docker compose -f $COMPOSE_FILE restart'"
    fi
    echo ""
    echo -e "${YELLOW}ℹ️  Note: Docker commands require privilege escalation until you logout and login again${NC}"
else
    echo -e "  View logs:    docker compose -f $COMPOSE_FILE logs -f"
    echo -e "  Stop:         docker compose -f $COMPOSE_FILE down"
    echo -e "  Restart:      docker compose -f $COMPOSE_FILE restart"
fi
