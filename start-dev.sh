#!/bin/bash

echo "🚀 Starting MeoGli Stack..."
echo ""

# Check if running in correct directory
if [ ! -d "backend" ] || [ ! -d "frontend" ] || [ ! -d "remotion" ]; then
    echo "❌ Please run this script from the MeoGli root directory"
    exit 1
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Start Backend
echo -e "${YELLOW}Starting Backend (FastAPI)...${NC}"
cd backend
python -m pip install -q fastapi uvicorn python-multipart 2>/dev/null || pip install -q fastapi uvicorn python-multipart
python -m uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID) on http://localhost:8000${NC}"
cd ..
sleep 2

# Start Frontend
echo -e "${YELLOW}Starting Frontend (Next.js)...${NC}"
cd frontend
npm install -q 2>/dev/null
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID) on http://localhost:3000${NC}"
cd ..
sleep 3

echo ""
echo -e "${GREEN}🎉 MeoGli Stack is running!${NC}"
echo ""
echo "📍 Services:"
echo "  - Frontend:  ${GREEN}http://localhost:3000${NC}"
echo "  - Backend:   ${GREEN}http://localhost:8000${NC}"
echo "  - API Docs:  ${GREEN}http://localhost:8000/docs${NC}"
echo ""
echo "📝 To stop, press Ctrl+C"
echo ""

# Keep script running
wait
