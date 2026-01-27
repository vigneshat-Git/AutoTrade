# AutoTrade Startup Script - Windows PowerShell
# This script starts both the backend (Python) and frontend (Node.js) services

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AUTOTRADE - Startup Script v2.1" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
node --version | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Node.js found: $(node --version)" -ForegroundColor Green

# Check if Python is installed
Write-Host "Checking Python installation..." -ForegroundColor Yellow
python --version | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Python is not installed or not in PATH" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Python found: $(python --version)" -ForegroundColor Green

# Check if concurrently is installed
Write-Host "Checking concurrently installation..." -ForegroundColor Yellow
npm list -g concurrently | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Installing concurrently globally..." -ForegroundColor Yellow
    npm install -g concurrently
}
Write-Host "✓ Concurrently is ready" -ForegroundColor Green
Write-Host ""

# Display startup info
Write-Host "Starting AutoTrade Services:" -ForegroundColor Cyan
Write-Host "  → Backend: http://localhost:8000" -ForegroundColor Yellow
Write-Host "  → Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Yellow
Write-Host ""

# Start both services
Write-Host "Launching services..." -ForegroundColor Green
Write-Host ""

npm start
