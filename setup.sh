#!/bin/bash

# OTB Chess Analyzer - First Time Setup Script

set -e

echo "========================================"
echo "OTB Chess Analyzer - Setup"
echo "========================================"

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Setup Chesscog Service
echo -e "\n${GREEN}[1/4] Setting up Chesscog Service...${NC}"
cd "$SCRIPT_DIR/chesscog-service"

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install --upgrade pip
pip install .
pip install fastapi uvicorn python-multipart pydantic

# Download models if not present
if [ ! -d "models/occupancy_classifier" ]; then
    echo "Downloading occupancy classifier model..."
    python -m chesscog.occupancy_classifier.download_model
fi

if [ ! -d "models/piece_classifier" ]; then
    echo "Downloading piece classifier model..."
    python -m chesscog.piece_classifier.download_model
fi

deactivate

# 2. Setup Backend
echo -e "\n${GREEN}[2/4] Setting up Main Backend...${NC}"
cd "$SCRIPT_DIR/backend"

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate

# 3. Setup Frontend
echo -e "\n${GREEN}[3/4] Setting up Frontend...${NC}"
cd "$SCRIPT_DIR/frontend"
npm install

# 4. Done
echo -e "\n${GREEN}========================================"
echo "Setup Complete!"
echo "========================================"
echo -e "${NC}"
echo "To start development:"
echo "  1. Run ./start-dev.sh to start the backend services"
echo "  2. In another terminal, run: cd frontend && npx expo start"
echo ""
echo "Services will be available at:"
echo "  - Main Backend:    http://localhost:8000"
echo "  - Chesscog:        http://localhost:8001"
echo "  - Expo Dev Server: http://localhost:8081"
echo ""
