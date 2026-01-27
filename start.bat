@echo off
REM AutoTrade Startup Script - Windows Batch
REM This script starts both the backend (Python) and frontend (Node.js) services

color 0B
cls

echo ========================================
echo   AUTOTRADE - Startup Script v2.1
echo ========================================
echo.

REM Check if Node.js is installed
echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    color 0C
    echo ERROR: Node.js is not installed or not in PATH
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
echo ✓ Node.js found: %NODE_VER%

REM Check if Python is installed
echo Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    color 0C
    echo ERROR: Python is not installed or not in PATH
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('python --version') do set PYTHON_VER=%%i
echo ✓ Python found: %PYTHON_VER%

REM Check if concurrently is installed
echo Checking concurrently installation...
npm list -g concurrently >nul 2>&1
if errorlevel 1 (
    echo Installing concurrently globally...
    call npm install -g concurrently
)
echo ✓ Concurrently is ready
echo.

REM Display startup info
echo Starting AutoTrade Services:
echo   - Backend: http://localhost:8000
echo   - Frontend: http://localhost:3000
echo.
echo Press Ctrl+C to stop all services
echo.

REM Start both services
echo Launching services...
echo.

call npm start

pause
