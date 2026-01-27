#!/bin/bash

# AutoTrade Startup Script - Unix/Linux/Mac
# This script starts both the backend (Python) and frontend (Node.js) services

echo "========================================"
echo "  AUTOTRADE - Startup Script v2.1"
echo "========================================"
echo ""

# Check if Node.js is installed
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    exit 1
fi
NODE_VER=$(node --version)
echo "✓ Node.js found: $NODE_VER"

# Check if Python is installed
echo "Checking Python installation..."
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "ERROR: Python is not installed or not in PATH"
    exit 1
fi
PYTHON_VER=$(python3 --version 2>&1 || python --version)
echo "✓ Python found: $PYTHON_VER"

# Check if concurrently is installed
echo "Checking concurrently installation..."
if ! npm list -g concurrently &> /dev/null; then
    echo "Installing concurrently globally..."
    npm install -g concurrently
fi
echo "✓ Concurrently is ready"
echo ""

# Display startup info
echo "Starting AutoTrade Services:"
echo "  → Backend: http://localhost:8000"
echo "  → Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Start both services
echo "Launching services..."
echo ""

npm start
