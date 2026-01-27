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
    else
        # No sudo, try su -c
        echo -e "${YELLOW}sudo not found, using su -c...${NC}"
        su -c "$*"
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
# Frontend Configuration - Auto-generated by docker-start-dynamic.sh
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

# Check if printer environment variables are already set in a .env file
if [ -f ".env.printer" ]; then
    echo -e "${GREEN}✅ Found existing .env.printer${NC}"
    source .env.printer
else
    # Try to detect printer automatically (Linux/Raspberry Pi only)
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo -e "${YELLOW}Scanning for USB printers...${NC}"
        
        # Check if lpinfo is available (CUPS installed on host)
        if command -v lpinfo &> /dev/null; then
            # Get USB printer URIs
            DETECTED_URI=$(lpinfo -v 2>/dev/null | grep "usb://" | head -1 | awk '{print $2}')
            
            if [ -n "$DETECTED_URI" ]; then
                echo -e "${GREEN}✅ Detected printer: $DETECTED_URI${NC}"
                
                # Extract printer model from URI for default name
                PRINTER_MODEL=$(echo "$DETECTED_URI" | sed -n 's/.*\/\/\([^\/]*\)\/.*/\1/p')
                DEFAULT_PRINTER_NAME="${PRINTER_MODEL:-XP410B}"
                
                echo -e "${YELLOW}Suggested printer name: $DEFAULT_PRINTER_NAME${NC}"
                echo ""
                echo -e "${BLUE}Save this configuration? (y/n)${NC}"
                read -p "> " -n 1 -r
                echo
                
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    # Create .env.printer file
                    cat > .env.printer <<EOF
# Printer Configuration - Auto-detected by docker-start-dynamic.sh
# Generated at: $(date)
export PRINTER_NAME=$DEFAULT_PRINTER_NAME
export PRINTER_URI=$DETECTED_URI
EOF
                    echo -e "${GREEN}✅ Saved printer configuration to .env.printer${NC}"
                    export PRINTER_NAME=$DEFAULT_PRINTER_NAME
                    export PRINTER_URI=$DETECTED_URI
                else
                    echo -e "${YELLOW}⏭️  Skipping printer configuration${NC}"
                fi
            else
                echo -e "${YELLOW}⚠️  No USB printer detected${NC}"
                echo -e "${BLUE}You can configure manually later or create .env.printer:${NC}"
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

# Determine which compose file to use
COMPOSE_FILE="docker-compose.yml"
if [ "$1" == "dev" ]; then
    COMPOSE_FILE="docker-compose.dev.yml"
    echo -e "${BLUE}Using development configuration${NC}"
elif [ "$1" == "prod" ]; then
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
