#!/bin/bash

# OTB Chess Analyzer - Development Startup Script
# This script starts all services for local development

set -e

echo "========================================"
echo "OTB Chess Analyzer - Development Mode"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down services...${NC}"
    kill $CHESSCOG_PID 2>/dev/null || true
    kill $BACKEND_PID 2>/dev/null || true
    echo -e "${GREEN}Services stopped.${NC}"
}

trap cleanup EXIT

# Start Chesscog Service
echo -e "\n${GREEN}Starting Chesscog Detection Service (port 8001)...${NC}"
cd "$SCRIPT_DIR/chesscog-service"
if [ ! -d "venv" ]; then
    echo -e "${RED}Error: Virtual environment not found. Please run setup first.${NC}"
    exit 1
fi
source venv/bin/activate
python api.py &
CHESSCOG_PID=$!
echo "Chesscog PID: $CHESSCOG_PID"

# Wait for chesscog to start
sleep 3

# Start Main Backend
echo -e "\n${GREEN}Starting Main Backend (port 8000)...${NC}"
cd "$SCRIPT_DIR/backend"
if [ ! -d "venv" ]; then
    echo -e "${RED}Error: Backend virtual environment not found. Please run setup first.${NC}"
    exit 1
fi
source venv/bin/activate
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to start
sleep 2

echo -e "\n${GREEN}========================================"
echo "All services started!"
echo "========================================"
echo -e "${NC}"
echo "Services:"
echo "  - Main Backend:    http://localhost:8000"
echo "  - Chesscog:        http://localhost:8001"
echo ""
echo "API Documentation:"
echo "  - Backend Docs:    http://localhost:8000/docs"
echo "  - Chesscog Docs:   http://localhost:8001/docs"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for user to stop
wait
