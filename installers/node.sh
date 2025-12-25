#!/bin/bash

# Colors for output (assuming these are defined in the main script or will be sourced)
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Checking and installing Node.js and npm...${NC}"

# Function to install/update Node.js
install_nodejs() {
    echo -e "${YELLOW}Node.js needs to be installed or updated to version 20+. Attempting to install the latest LTS version.${NC}"
    
    # Remove any existing nodejs and npm packages
    echo -e "${BLUE}Attempting to remove existing nodejs and npm packages...${NC}"
    sudo apt remove nodejs npm -y &> /dev/null # Suppress output for clean output
    sudo apt autoremove -y &> /dev/null # Clean up dependencies

    # Add NodeSource LTS repository and install Node.js
    echo -e "${BLUE}Adding NodeSource LTS repository and installing Node.js...${NC}"
    # Use setup_lts.x to get the latest LTS version (currently Node.js 20 or higher)
    curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
    sudo apt install nodejs -y

    if command -v node &> /dev/null; then
        echo -e "${GREEN}Node.js installation successful.${NC}"
        node_version=$(node -v)
        echo -e "${BLUE}Node.js version: $node_version${NC}"
    else
        echo -e "${RED}Failed to install Node.js. Please check for errors.${NC}"
        exit 1
    fi
}

# Check for Node.js
if command -v node &> /dev/null; then
    node_version=$(node -v)
    # Extract major version number (e.g., from v12.22.9 get 12)
    major_version=$(echo "$node_version" | sed 's/^v//' | cut -d'.' -f1)

    if (( major_version < 20 )); then
        echo -e "${YELLOW}Node.js version $node_version is older than 20. Updating to the latest LTS version.${NC}"
        install_nodejs
    else
        echo -e "${GREEN}Node.js is installed and meets the version 20+ requirement.${NC}"
        echo -e "${BLUE}Node.js version: $node_version${NC}"
    fi
else
    echo -e "${YELLOW}Node.js is NOT installed.${NC}"
    install_nodejs
fi

# Check for npm (npm is usually bundled with nodejs from NodeSource)
if command -v npm &> /dev/null; then
    echo -e "${GREEN}npm is installed and available.${NC}"
    npm_version=$(npm -v)
    echo -e "${BLUE}npm version: $npm_version${NC}"
else
    # If npm is not found here, it means the nodejs installation likely failed or npm is not in PATH.
    # This scenario is less likely if nodejs installation was reported successful.
    echo -e "${RED}npm is NOT installed. Node.js installation might have failed or npm is not in PATH.${NC}"
    exit 1
fi

echo -e "${GREEN}Node.js and npm check/installation complete.${NC}"

# --- Section to install frontend dependencies and build ---
echo -e "${YELLOW}Installing frontend dependencies and building the project...${NC}"

# The frontend directory is a direct subdirectory from the current working directory (project root)
# This assumes the 'installers/node.sh' script is sourced from 'install.sh',
# and 'install.sh' is executed from the project root.
FRONTEND_DIR="frontend"

# Check if the frontend directory exists
if [ -d "$FRONTEND_DIR" ]; then
    echo -e "${BLUE}Temporarily changing directory to $FRONTEND_DIR${NC}"
    # Use pushd to save the current directory (project root) and then change to FRONTEND_DIR
    pushd "$FRONTEND_DIR" || { echo -e "${RED}Failed to change to frontend directory ($FRONTEND_DIR). Exiting.${NC}"; exit 1; }

    echo -e "${BLUE}Running npm install...${NC}"
    # Use npm install to get all dependencies, including devDependencies for the build
    # Ensure npm install runs as the actual user to avoid permission issues
    sudo -u "$ACTUAL_USER" npm install --omit=dev
    # Install typescript needed for the build as the actual user
    sudo -u "$ACTUAL_USER" npm install typescript

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}npm install completed successfully.${NC}"
        # Clean up any existing frontend/dist directory to avoid permission issues
        echo -e "${BLUE}Cleaning up existing frontend/dist directory...${NC}"
        sudo rm -rf "$FRONTEND_DIR/dist"
        
        echo -e "${BLUE}Running npm run build...${NC}"
        # Ensure npm run build runs as the actual user
        sudo -u "$ACTUAL_USER" npm run build
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}Frontend project built successfully.${NC}"
        else
            echo -e "${RED}Failed to build the frontend project. Please check for errors.${NC}"
            # Ensure we pop the directory even on failure before exiting
            popd > /dev/null
            exit 1
        fi
    else
        echo -e "${RED}npm install failed. Please check for errors.${NC}"
        # Ensure we pop the directory even on failure before exiting
        popd > /dev/null
        exit 1
    fi

    # Use popd to return to the original directory (project root)
    echo -e "${BLUE}Returning to the original directory.${NC}"
    popd > /dev/null # Suppress popd output

else
    echo -e "${RED}Frontend directory ($FRONTEND_DIR) not found. Skipping frontend dependency installation and build.${NC}"
    exit 1
fi

echo -e "${GREEN}Frontend setup complete.${NC}"