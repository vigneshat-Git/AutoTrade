# 🚀 AutoTrade - AI-Powered Stock Trading Signals

AutoTrade is a modern web platform that provides live AI-powered trading signals using neural networks and real-time market data. Get buy/sell predictions, confidence scores, and portfolio tracking all in one place.

## ✨ Features

### 🎯 Core Features
- **AI Price Predictions**: Uses LSTM neural networks to forecast stock prices
- **Real-time Charts**: Interactive candlestick charts with ApexCharts
- **Trading Signals**: Get clear BUY/SELL signals with confidence levels
- **Live Data**: Fetches data from Yahoo Finance API
- **Hourly Updates**: Automatic cache management to prevent rate limits

### 💎 New Premium Features (Recently Added!)
- **Dark Mode Support**: Toggle between light and dark themes
- **📊 Portfolio Dashboard**: Track multiple stocks in one unified view
- **Watchlist Management**: Save and organize your favorite stocks
- **Signal Summary**: View aggregated BUY/SELL signals across your portfolio
- **Smart Sorting**: Sort by symbol, confidence, move percentage, or direction
- **Responsive Design**: Beautiful UI that works on desktop, tablet, and mobile
- **Modern UI/UX**: Gradient backgrounds, smooth animations, and glass-morphism effects

## 🛠️ Tech Stack

### Frontend
- React 19 with Hooks
- React Router v7 for navigation
- ApexCharts for advanced charting
- Modern CSS with animations and responsive design
- LocalStorage for persistent user preferences

### Backend
- FastAPI (Python)
- scikit-learn for data preprocessing
- TensorFlow/Keras for LSTM neural networks
- yfinance for real-time market data
- Pandas & NumPy for data manipulation

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Installation & Setup

**1. Backend Setup**
```bash
cd backend
pip install -r requirements.txt  # Create if needed
python main.py
```
Backend runs on `http://localhost:8000`

**2. Frontend Setup**
```bash
cd frontend
npm install
npm start
```
Frontend runs on `http://localhost:3000`

## 📱 Pages & Navigation

### Landing Page (`/`)
- Search for any stock symbol
- View quick-add watchlist with default stocks (AAPL, GOOGL, MSFT, TSLA)
- See feature highlights
- Dark mode toggle

### Chart Page (`/chart/:symbol`)
- Full candlestick chart with trading tools
- Real-time trading signal card
- Current vs. predicted price
- Expected move percentage
- Confidence level with visual progress bar
- Status indicator (FIRE signal or waiting)
- Add/remove from watchlist
- Next refresh countdown timer

### Portfolio Page (`/portfolio`)
- View all stocks in your watchlist at once
- Summary statistics:
  - Total stocks tracked
  - Buy signals count
  - Sell signals count
  - Average confidence
- Sortable table:
  - Current & predicted prices
  - Expected move %
  - Direction & confidence
  - Quick view button for each stock

## 🔧 API Endpoints

```
GET  /api/predict/{symbol}       - Get prediction & signal for a stock
GET  /api/health                 - Health check endpoint
POST /api/portfolio/batch        - Get predictions for multiple stocks
```

## 📊 Key Settings

Located in `backend/main.py`:
```python
LOOKBACK = 60              # Minutes of historical data for prediction
CONFIDENCE_LIMIT = 90      # Confidence threshold for FIRE signal
MIN_MOVE_PCT = 0.30        # Minimum price move % to consider
CACHE_DURATION_SECONDS = 3600  # Cache validity (1 hour)
```

## 💾 Data Persistence

- **Watchlist**: Saved to browser LocalStorage
- **Dark Mode Preference**: Saved to browser LocalStorage
- **Server Cache**: 1-hour cache to prevent API rate limiting

## 🎨 UI/UX Highlights

✅ **Dark Mode**: Toggleable with theme persistence
✅ **Gradient Backgrounds**: Modern purple and blue gradients
✅ **Smooth Animations**: Fade-in, slide-in, and pulse effects
✅ **Glass-Morphism Cards**: Semi-transparent modern card design
✅ **Responsive Grid**: Auto-adapting layout for all screen sizes
✅ **Trading Signal Colors**: Green (BUY) and Red (SELL)
✅ **Confidence Visualization**: Color-coded progress bars

## ⚠️ Disclaimer

This platform is for **educational purposes only**. The trading signals are AI-generated predictions and should not be considered financial advice. Always do your own research and consult with a financial advisor before making trading decisions.

## 📈 Future Enhancements

- [ ] Alert notifications for strong signals
- [ ] Multiple prediction models comparison
- [ ] Technical indicators overlay (RSI, SMA)
- [ ] Price alerts & webhook notifications
- [ ] Historical performance tracking
- [ ] User accounts & cloud sync
- [ ] Mobile app version