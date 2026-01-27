# 🚀 AutoTrade - One-Command Startup Guide

## Quick Start

### Option 1: Using NPM (Recommended)
Run both frontend and backend with a single command:

```bash
npm start
```

Or alternatively:
```bash
npm run dev
```

### Option 2: Windows Users - Using Batch Script
Double-click the batch file:
```
start.bat
```

Or run from command prompt:
```cmd
start.bat
```

### Option 3: Windows Users - Using PowerShell Script
Run from PowerShell:
```powershell
.\start.ps1
```

### Option 4: Unix/Linux/Mac Users - Using Shell Script
Run from terminal:
```bash
chmod +x start.sh
./start.sh
```

---

## Initial Setup (First Time Only)

### Step 1: Install Dependencies
```bash
npm run install-all
```

This will:
- Install root dependencies
- Install frontend dependencies
- Install Python backend dependencies (if needed)

### Step 2: Start the Project
```bash
npm start
```

---

## What Happens When You Run `npm start`

✅ **Both services start automatically:**
1. **Backend** (Python Flask/FastAPI)
   - Starts on: `http://localhost:8000`
   - Handles AI predictions and trading signals
   - Provides API endpoints

2. **Frontend** (React)
   - Starts on: `http://localhost:3000`
   - Interactive UI and dashboard
   - Real-time stock data visualization

---

## Manual Startup (If Needed)

### Start Backend Only
```bash
npm run start:backend
```

### Start Frontend Only
```bash
npm run start:frontend
```

---

## Available NPM Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start both backend and frontend |
| `npm run dev` | Development mode (same as start) |
| `npm run start:backend` | Start backend only |
| `npm run start:frontend` | Start frontend only |
| `npm run install-all` | Install all dependencies |
| `npm run build` | Build frontend for production |

---

## Requirements

### Prerequisites
- **Node.js** v14+ ([Download](https://nodejs.org))
- **Python** 3.8+ ([Download](https://www.python.org))
- **npm** (comes with Node.js)

### Verify Installation
```bash
node --version
npm --version
python --version
```

---

## Troubleshooting

### Port Already in Use
If port 3000 or 8000 is already in use:

**For Frontend (Port 3000):**
```bash
# Windows: Find and kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Unix/Mac:
lsof -ti:3000 | xargs kill -9
```

**For Backend (Port 8000):**
```bash
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Unix/Mac:
lsof -ti:8000 | xargs kill -9
```

### Node Modules Issues
```bash
# Clear and reinstall
rm -rf node_modules frontend/node_modules
npm run install-all
npm start
```

### Python Virtual Environment
The backend uses a virtual environment at `.venv`:
```bash
# Manually activate (if needed)
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Unix/Mac
```

---

## Deployment

### Building for Production

1. **Build frontend:**
   ```bash
   npm run build
   ```

2. **Backend is production-ready** (no build needed)

3. **Deploy:**
   - Frontend: Deploy `frontend/build` folder to hosting service
   - Backend: Keep running on your server

### Using Environment Variables

Create `.env` file in root:
```env
REACT_APP_API_URL=http://localhost:8000
PYTHON_ENV=production
```

---

## Architecture

```
AutoTrade/
├── frontend/              # React UI
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/               # Python API
│   ├── main.py
│   └── requirements.txt
├── start.bat             # Windows batch script
├── start.ps1             # Windows PowerShell script
├── start.sh              # Unix/Linux/Mac script
└── package.json          # Root npm config
```

---

## Features

✨ **Dashboard Console**
- Top gainers/losers with filters
- Real-time stock data table
- Search functionality
- Multi-exchange support (NSE, BSE)

📊 **Chart View**
- Interactive candlestick charts
- Multiple time intervals (1m to 1day)
- Trading signals with confidence scores
- AI predictions

📈 **Portfolio Tracking**
- Monitor multiple stocks
- Custom watchlist
- Real-time updates
- Performance analytics

🌓 **Dark/Light Mode**
- Persistent theme preference
- Eye-friendly color schemes
- Smooth transitions

---

## Performance Tips

1. **First run will be slower** (dependencies installing)
2. **Keep browser dev tools closed** for better performance
3. **Use Chrome/Edge** for best compatibility
4. **Close unused tabs** to reduce memory usage

---

## Support & Issues

For issues or feature requests:
1. Check the console logs (Ctrl+Shift+J in browser)
2. Verify both services are running (check localhost URLs)
3. Try restarting with `npm start`
4. Check network connectivity

---

## License

MIT License - See LICENSE file for details

---

**AutoTrade v2.1** | AI-Powered Stock Trading Signals | 2026
