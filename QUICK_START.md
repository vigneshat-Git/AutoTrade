# 🚀 AutoTrade Quick Start Card

## One-Command Startup

### Windows (Command Prompt or PowerShell)
```bash
npm start
```

### Or use startup scripts
```bash
start.bat           # Double-click or run in CMD
.\start.ps1         # Run in PowerShell
```

### Unix/Linux/Mac
```bash
npm start
# or
./start.sh
```

---

## What Gets Started

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:3000 | React UI Dashboard |
| **Backend** | http://localhost:8000 | Python API Server |

---

## Commands Reference

```bash
npm start               # Start both (RECOMMENDED)
npm run dev            # Development mode
npm run start:backend  # Backend only
npm run start:frontend # Frontend only
npm run build          # Build for production
npm run install-all    # Install all dependencies
```

---

## First Time Setup

```bash
# 1. Install everything
npm run install-all

# 2. Start the project
npm start

# 3. Open browser
# Frontend: http://localhost:3000
# Backend: http://localhost:8000/api/health
```

---

## Troubleshooting

**Port in use?**
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Kill process on port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Dependencies issue?**
```bash
npm run install-all
npm start
```

---

## Project Structure

```
AutoTrade/
├── frontend/       # React (Port 3000)
├── backend/        # Python (Port 8000)
├── start.bat      # Windows script
├── start.ps1      # PowerShell script
├── start.sh       # Unix/Mac script
└── package.json   # Root config (NEW)
```

---

## Key Features

✅ **Single Command Startup** - No more manual terminal management  
✅ **Automatic Error Checking** - Validates Node.js, Python installations  
✅ **Clean Shutdown** - Ctrl+C stops both services gracefully  
✅ **Cross-Platform** - Works on Windows, Mac, Linux  
✅ **Production Ready** - Deployment optimized  

---

**AutoTrade v2.1 | AI-Powered Trading | 2026**
