#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Installing Playwright browser dependencies...${NC}"
echo -e "${BLUE}This enables HTML webpage-to-PDF conversion for waybill downloads${NC}"

# Try installing libasound2t64 first, if it fails, try libasound2
echo -e "${YELLOW}Attempting to install libasound2t64 (for newer systems)...${NC}"
sudo apt install -y libasound2t64
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}libasound2t64 not found, attempting to install libasound2 (for broader compatibility)...${NC}"
    sudo apt install -y libasound2
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install libasound2 or libasound2t64. Please check your system's package availability.${NC}"
        # You might want to exit here or handle this failure more gracefully
    else
        echo -e "${GREEN}✅ libasound2 installed successfully.${NC}"
    fi
else
    echo -e "${GREEN}✅ libasound2t64 installed successfully.${NC}"
fi

# Install the rest of the Playwright dependencies
sudo apt install -y \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6
echo -e "${GREEN}✅ Other Playwright dependencies installed${NC}"

# Install system Chromium for RPi (Playwright bundles don't support ARM)
echo -e "${YELLOW}Installing system Chromium browser...${NC}"
if ! command -v chromium &> /dev/null && ! command -v chromium-browser &> /dev/null; then
    # Changed 'chromium' to 'chromium-browser'
    sudo apt install -y chromium-browser
    echo -e "${GREEN}✅ System Chromium installed${NC}"
else
    echo -e "${GREEN}✅ Chromium already installed${NC}"
fi