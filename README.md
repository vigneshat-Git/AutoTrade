# AutoTrade - AI-Powered Stock Trading Signals

AutoTrade is a web platform that provides live AI-powered trading signals using neural networks and real-time market data.

## App link: [AutoTrade](https://autotrade-1-yvaj.onrender.com/)

## Demo video: [Drive-link]()

## ✨ Features

- **AI Price Predictions**: Uses LSTM neural networks to forecast stock prices
- **Real-time Charts**: Interactive candlestick charts with ApexCharts
- **Trading Signals**: Get clear BUY/SELL signals with confidence levels
- **Live Data**: Fetches data from Yahoo Finance API
- **Hourly Updates**: Automatic cache management to prevent rate limits

## 🛠️ Tech Stack

### Frontend
- React 19 with Hooks
- React Router v7 for navigation
- ApexCharts for advanced charting
- Modern CSS with animations and responsive design

### Backend
- FastAPI (Python)
- scikit-learn for data preprocessing
- TensorFlow/Keras for LSTM neural networks
- yfinance for real-time market data
- Pandas & NumPy for data manipulation

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Installation & Setup

**1. Backend Setup**
```bash
cd backend
pip install -r requirements.txt
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