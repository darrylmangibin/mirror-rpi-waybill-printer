#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🐳 RPI Waybill Printer - Docker Quick Start${NC}\n"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo -e "${YELLOW}Please install Docker Desktop from: https://www.docker.com/products/docker-desktop${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    echo -e "${YELLOW}Please install Docker Compose${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker is installed${NC}"
echo -e "${GREEN}✅ Docker Compose is installed${NC}\n"

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker daemon is not running${NC}"
    echo -e "${YELLOW}Please start Docker Desktop or Docker service${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker daemon is running${NC}\n"

# Determine which docker-compose command to use
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    DOCKER_COMPOSE="docker compose"
fi

echo -e "${BLUE}Starting RPI Waybill Printer...${NC}\n"

# Start the services
$DOCKER_COMPOSE up --build -d

# Wait a moment for services to start
sleep 3

echo -e "\n${GREEN}✅ Services are starting!${NC}\n"

# Show status
$DOCKER_COMPOSE ps

echo -e "\n${BLUE}📊 Access the application:${NC}"
echo -e "  Frontend:  ${GREEN}http://localhost:5173${NC}"
echo -e "  Backend:   ${GREEN}http://localhost:5000${NC}"
echo -e "  Health:    ${GREEN}http://localhost:5000/api/health${NC}"

echo -e "\n${BLUE}📝 Useful commands:${NC}"
echo -e "  View logs:     ${YELLOW}$DOCKER_COMPOSE logs -f${NC}"
echo -e "  Stop:          ${YELLOW}$DOCKER_COMPOSE down${NC}"
echo -e "  Restart:       ${YELLOW}$DOCKER_COMPOSE restart${NC}"
echo -e "  Rebuild:       ${YELLOW}$DOCKER_COMPOSE up --build${NC}"

echo -e "\n${BLUE}For more details, see: ${YELLOW}DOCKER_README.md${NC}\n"
