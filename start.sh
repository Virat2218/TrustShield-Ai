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
BACKEND_HOST=${HOST:-127.0.0.1}
BACKEND_PORT=${PORT:-8000}
echo "🚀 [1/2] Starting FastAPI Backend on http://${BACKEND_HOST}:${BACKEND_PORT}..."
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
    echo "Creating backend .env with cryptographically random JWT_SECRET_KEY..."
    cp .env.example .env
    RANDOM_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))" 2>/dev/null || openssl rand -base64 32 2>/dev/null || echo "")
    if [ -n "$RANDOM_KEY" ]; then
        sed -i '' "s|^JWT_SECRET_KEY=.*$|JWT_SECRET_KEY=${RANDOM_KEY}|" .env 2>/dev/null || sed -i "s|^JWT_SECRET_KEY=.*$|JWT_SECRET_KEY=${RANDOM_KEY}|" .env 2>/dev/null || true
    fi
fi

uvicorn main:app --reload --host "$BACKEND_HOST" --port "$BACKEND_PORT" &
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
echo "   📡 Backend:  http://${BACKEND_HOST}:${BACKEND_PORT}"
echo "   📚 API Docs: http://${BACKEND_HOST}:${BACKEND_PORT}/docs"
echo "   🛡️  First Admin Setup: cd backend && source venv/bin/activate && python bootstrap_admin.py --email <your-registered-email>"
echo ""
echo "Press Ctrl+C to stop both servers."

wait

