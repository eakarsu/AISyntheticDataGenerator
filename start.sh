#!/bin/bash

# ============================================
# AI Synthetic Data Generator - Start Script
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

echo -e "${PURPLE}"
echo "╔═══════════════════════════════════════════════════╗"
echo "║     🧬 AI Synthetic Data Generator                ║"
echo "║     Powered by OpenRouter AI                      ║"
echo "╚═══════════════════════════════════════════════════╝"
echo -e "${NC}"

# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
  echo -e "${GREEN}✓ Loaded .env configuration${NC}"
else
  echo -e "${RED}✗ .env file not found! Please create one.${NC}"
  exit 1
fi

BACKEND_PORT=${BACKEND_PORT:-3001}
FRONTEND_PORT=${FRONTEND_PORT:-3000}

# ============================================
# Step 1: Clean up used ports
# ============================================
echo -e "\n${CYAN}[1/6] Cleaning up ports...${NC}"

cleanup_port() {
  local port=$1
  local pids=$(lsof -ti :$port 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo -e "${YELLOW}  Killing processes on port $port: $pids${NC}"
    echo "$pids" | xargs kill -9 2>/dev/null || true
    sleep 1
  else
    echo -e "${GREEN}  Port $port is available${NC}"
  fi
}

cleanup_port $BACKEND_PORT
cleanup_port $FRONTEND_PORT

# ============================================
# Step 2: Check PostgreSQL
# ============================================
echo -e "\n${CYAN}[2/6] Checking PostgreSQL...${NC}"

if command -v psql &>/dev/null; then
  echo -e "${GREEN}  ✓ PostgreSQL client found${NC}"
else
  echo -e "${RED}  ✗ PostgreSQL client not found. Please install PostgreSQL.${NC}"
  exit 1
fi

# Check if PostgreSQL is running
if pg_isready -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} &>/dev/null; then
  echo -e "${GREEN}  ✓ PostgreSQL is running${NC}"
else
  echo -e "${YELLOW}  Starting PostgreSQL...${NC}"
  if command -v brew &>/dev/null; then
    brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || true
  fi
  sleep 2
  if ! pg_isready -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} &>/dev/null; then
    echo -e "${RED}  ✗ Could not start PostgreSQL. Please start it manually.${NC}"
    exit 1
  fi
fi

# Create database if not exists
echo -e "${YELLOW}  Creating database '${DB_NAME}'...${NC}"
createdb -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} ${DB_NAME:-ai_synthetic_data} 2>/dev/null || echo -e "${GREEN}  ✓ Database already exists${NC}"

# ============================================
# Step 3: Install backend dependencies
# ============================================
echo -e "\n${CYAN}[3/6] Installing backend dependencies...${NC}"
cd "$PROJECT_DIR/backend"
npm install --silent 2>&1 | tail -1
echo -e "${GREEN}  ✓ Backend dependencies installed${NC}"

# ============================================
# Step 4: Install frontend dependencies
# ============================================
echo -e "\n${CYAN}[4/6] Installing frontend dependencies...${NC}"
cd "$PROJECT_DIR/frontend"
npm install --silent 2>&1 | tail -1
echo -e "${GREEN}  ✓ Frontend dependencies installed${NC}"

# ============================================
# Step 5: Seed database
# ============================================
echo -e "\n${CYAN}[5/6] Seeding database...${NC}"
cd "$PROJECT_DIR/backend"
node seed.js
echo -e "${GREEN}  ✓ Database seeded successfully${NC}"

# ============================================
# Step 6: Start services with hot reload
# ============================================
echo -e "\n${CYAN}[6/6] Starting services with hot reload...${NC}"

# Trap to clean up on exit
cleanup() {
  echo -e "\n${YELLOW}Shutting down services...${NC}"
  kill $(jobs -p) 2>/dev/null || true
  cleanup_port $BACKEND_PORT
  cleanup_port $FRONTEND_PORT
  echo -e "${GREEN}Services stopped.${NC}"
  exit 0
}
trap cleanup EXIT INT TERM

# Start backend with nodemon (hot reload)
cd "$PROJECT_DIR/backend"
echo -e "${BLUE}  Starting backend on port $BACKEND_PORT (with nodemon hot reload)...${NC}"
npx nodemon --watch . --ext js,json --ignore node_modules server.js &

# Wait for backend to be ready
sleep 3

# Start frontend with Vite (hot reload built-in)
cd "$PROJECT_DIR/frontend"
echo -e "${BLUE}  Starting frontend on port $FRONTEND_PORT (with Vite HMR)...${NC}"
npx vite --port $FRONTEND_PORT --host &

sleep 3

echo -e "\n${GREEN}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  🚀 Application is running!                       ║${NC}"
echo -e "${GREEN}║                                                   ║${NC}"
echo -e "${GREEN}║  Frontend:  http://localhost:${FRONTEND_PORT}                  ║${NC}"
echo -e "${GREEN}║  Backend:   http://localhost:${BACKEND_PORT}                  ║${NC}"
echo -e "${GREEN}║                                                   ║${NC}"
echo -e "${GREEN}║  Login: ${DEFAULT_EMAIL:-admin@synthdata.ai} / ${DEFAULT_PASSWORD:-admin123}        ║${NC}"
echo -e "${GREEN}║                                                   ║${NC}"
echo -e "${GREEN}║  Hot reload is enabled for both services.         ║${NC}"
echo -e "${GREEN}║  Press Ctrl+C to stop all services.               ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════╝${NC}"

# Wait for background processes
wait
