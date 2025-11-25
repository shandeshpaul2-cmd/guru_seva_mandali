#!/bin/bash

# Certificate Generator Service Startup Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔥 Starting Certificate Generator Service${NC}"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment
echo -e "${YELLOW}Activating virtual environment...${NC}"
source venv/bin/activate

# Install dependencies if needed
if [ ! -f ".deps_installed" ]; then
    echo -e "${YELLOW}Installing Python dependencies...${NC}"
    pip install -r requirements.txt
    touch .deps_installed
fi

# Install Playwright browser if using Playwright engine
if [ "$PDF_ENGINE" = "playwright" ] || [ -z "$PDF_ENGINE" ]; then
    echo -e "${YELLOW}Installing Playwright browser (Chromium)...${NC}"
    python -m playwright install chromium
fi

# Create output directory
mkdir -p output

# Copy environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file from template...${NC}"
    cp .env.example .env
    echo -e "${RED}⚠️  Please edit .env file with your configuration${NC}"
fi

# Set default port if not specified
export CERTIFICATE_PORT=${CERTIFICATE_PORT:-5001}
export PDF_ENGINE=${PDF_ENGINE:-playwright}

echo -e "${GREEN}✅ Configuration complete!${NC}"
echo -e "${GREEN}🚀 Starting service on port $CERTIFICATE_PORT${NC}"
echo -e "${GREEN}📁 Output directory: $(pwd)/output${NC}"
echo -e "${GREEN}🌐 Health check: http://localhost:$CERTIFICATE_PORT/health${NC}"
echo -e "${GREEN}📖 API documentation: See README.md${NC}"
echo ""

# Start the Flask application
python app.py