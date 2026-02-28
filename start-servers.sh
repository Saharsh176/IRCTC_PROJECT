#!/bin/bash
# 🚀 Rail Connect - Complete Setup & Run Script

echo "=========================================="
echo "       Rail Connect - Full Stack App"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PROJECT_ROOT="/Users/harshul/Rail_Connect"

# Function to check if a port is in use
is_port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
    return $?
}

# Function to kill process on port
kill_port() {
    echo -e "${YELLOW}Clearing port $1...${NC}"
    lsof -i :$1 | grep -v COMMAND | awk '{print $2}' | xargs kill -9 2>/dev/null || true
    sleep 1
}

# Check if ports are in use
echo "Checking ports..."
if is_port_in_use 3001; then
    echo -e "${YELLOW}Port 3001 is in use${NC}"
    kill_port 3001
fi

if is_port_in_use 5173; then
    echo -e "${YELLOW}Port 5173 is in use${NC}"
    kill_port 5173
fi

echo -e "${GREEN}✓ Ports cleared${NC}"
echo ""

# Check if node_modules exist
echo "Checking dependencies..."
if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    cd "$PROJECT_ROOT"
    npm install
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
fi

if [ ! -d "$PROJECT_ROOT/backend/node_modules" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    cd "$PROJECT_ROOT/backend"
    npm install
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
fi

echo ""
echo "=========================================="
echo "        Starting Servers..."
echo "=========================================="
echo ""

# Start backend
echo -e "${YELLOW}Starting Backend Server on Port 3001...${NC}"
cd "$PROJECT_ROOT/backend"
node server.js &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
sleep 3

# Start frontend
echo ""
echo -e "${YELLOW}Starting Frontend Dev Server on Port 5173...${NC}"
cd "$PROJECT_ROOT"
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"
sleep 3

echo ""
echo "=========================================="
echo "        Servers Running! ✨"
echo "=========================================="
echo ""
echo -e "${GREEN}Frontend:${NC}  http://localhost:5173"
echo -e "${GREEN}Backend API:${NC} http://localhost:3001/api"
echo ""
echo "Backend PIDs: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "To stop the servers, press Ctrl+C or run:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "=========================================="
echo ""

# Keep the script running
wait
