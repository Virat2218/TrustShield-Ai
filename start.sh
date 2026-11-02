#!/bin/bash
# TrustShield AI Quick Start Script

set -e

echo "🛡️  Starting TrustShield AI..."

# Check directories
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Please run this script from the TrustShield AI root directory."
    exit 1
fi

# Function to kill child processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down TrustShield AI..."
    kill $(jobs -p) 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 1. Start Backend
echo "🚀 [1/2] Starting FastAPI Backend on http://localhost:8000..."
cd backend
if [ ! -d "venv" ]; then
    echo "Setting up Python virtual environment..."
    /usr/bin/python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

if [ ! -f ".env" ]; then
    cp .env.example .env
fi

uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# Wait for backend to be responsive
sleep 2

# 2. Start Frontend
echo "💻 [2/2] Starting Vite Frontend on http://localhost:5173..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing frontend npm packages..."
    npm install
fi

npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ TrustShield AI is running!"
echo "   🌐 Frontend: http://localhost:5173"
echo "   📡 Backend:  http://localhost:8000"
echo "   📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers."

wait

