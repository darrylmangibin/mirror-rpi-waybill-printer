#!/bin/bash

# Docker Setup for Raspberry Pi
# This script installs Docker and configures it to auto-start containers on boot

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🐳 Setting up Docker for RPI Waybill Printer${NC}\n"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker not found. Installing Docker...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo rm get-docker.sh
    echo -e "${GREEN}✅ Docker installed${NC}"
else
    echo -e "${GREEN}✅ Docker already installed${NC}"
fi

# Check if Docker Compose is installed
if ! command -v docker compose &> /dev/null; then
    echo -e "${YELLOW}Docker Compose plugin not found. Installing...${NC}"
    sudo apt-get update
    sudo apt-get install -y docker-compose-plugin
    echo -e "${GREEN}✅ Docker Compose installed${NC}"
else
    echo -e "${GREEN}✅ Docker Compose already installed${NC}"
fi

# Add current user to docker group
ACTUAL_USER=${SUDO_USER:-$(whoami)}
echo -e "${YELLOW}Adding user $ACTUAL_USER to docker group...${NC}"
sudo usermod -aG docker "$ACTUAL_USER"
echo -e "${GREEN}✅ User added to docker group (logout required to take effect)${NC}"

# Enable Docker service to start on boot
echo -e "${YELLOW}Enabling Docker service to start on boot...${NC}"
sudo systemctl enable docker
sudo systemctl start docker
echo -e "${GREEN}✅ Docker service enabled and started${NC}"

# Project directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo -e "\n${BLUE}📝 Docker Auto-start Configuration${NC}"
echo -e "${YELLOW}Your docker-compose.yml already has 'restart: unless-stopped'${NC}"
echo -e "${YELLOW}This means containers will automatically restart on boot.${NC}\n"

echo -e "${GREEN}✅ Docker setup complete!${NC}\n"

echo -e "${BLUE}Next Steps:${NC}"
echo -e "  1. Logout and login again (for docker group to take effect)"
echo -e "  2. Navigate to project: cd $PROJECT_DIR"
echo -e "  3. Build and start containers:"
echo -e "     ${YELLOW}docker compose up -d --build${NC}"
echo -e ""
echo -e "${BLUE}Container Management:${NC}"
echo -e "  • Start: ${YELLOW}docker compose up -d${NC}"
echo -e "  • Stop: ${YELLOW}docker compose down${NC}"
echo -e "  • View logs: ${YELLOW}docker compose logs -f${NC}"
echo -e "  • Restart: ${YELLOW}docker compose restart${NC}"
echo -e "  • Status: ${YELLOW}docker compose ps${NC}"
