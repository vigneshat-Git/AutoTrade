# AutoTrade - AI-Powered Stock Trading Signals

AutoTrade is a web platform that provides live AI-powered trading signals using neural networks and real-time market data.

## App link: [AutoTrade](https://autotrade-1-yvaj.onrender.com/)

## Demo video: [YouTube-link](https://youtu.be/wAVOFlBGslM?si=swsc04tkzzyW647j)

## Features

- **AI Price Predictions**: Uses LSTM neural networks to forecast stock prices
- **Real-time Charts**: Interactive candlestick charts with ApexCharts
- **Trading Signals**: Get clear BUY/SELL signals with confidence levels
- **Live Data**: Fetches data from Yahoo Finance API
- **Hourly Updates**: Automatic cache management to prevent rate limits

## Tech Stack

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

### Screenshot
**1.Dashboard of the page looks like this**
<img width="1366" height="768" alt="Screenshot 2026-01-27 234832" src="https://github.com/user-attachments/assets/5ca30f36-8c28-446f-b427-78c234a52c59" />

**2.Top 50 stocks list**
<img width="1323" height="424" alt="top50" src="https://github.com/user-attachments/assets/ce450b50-21e4-4c30-bf64-4c0c77a38eb8" />

**3.Portfolio Page**
<img width="1366" height="768" alt="portfolio" src="https://github.com/user-attachments/assets/9f173df2-cefb-4f9f-b102-f4d20ead476f" />

**4.Charts page**
<img width="1366" height="768" alt="charts" src="https://github.com/user-attachments/assets/ee70c398-e925-4d03-8555-696e7b1283ea" />
