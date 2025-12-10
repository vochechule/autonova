#!/bin/bash

echo "========================================"
echo "  Carta Autobazar - Local Startup"
echo "========================================"
echo ""

# Install dependencies if needed
if [ ! -d "backend/node_modules" ]; then
  echo "Installing backend dependencies..."
  cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
  echo "Installing frontend dependencies..."
  cd frontend && npm install && cd ..
fi

echo "Starting Backend..."
cd backend
npm run start:dev &
BACKEND_PID=$!
cd ..

echo "Waiting for backend to start..."
sleep 5

echo ""
echo "Starting Frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "========================================"
echo "  Application Started!"
echo "========================================"
echo ""
echo "Backend:  http://localhost:3000"
echo "Frontend: http://localhost:3001"
echo ""
echo "Login credentials:"
echo "  admin@carta.cz / demo123"
echo "  dealer@carta.cz / demo123"
echo "  user@carta.cz / demo123"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
