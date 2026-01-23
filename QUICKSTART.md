# 🚀 Quick Start Guide - AutoTrade

## Installation & Running

### Step 1: Backend Setup (Python)
```bash
# Navigate to backend
cd backend

# Install dependencies (if not already installed)
pip install fastapi uvicorn yfinance pandas numpy scikit-learn tensorflow

# Run backend server
python main.py
```
✅ Backend will run on: `http://localhost:8000`

### Step 2: Frontend Setup (Node.js/React)
```bash
# Navigate to frontend (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```
✅ Frontend will run on: `http://localhost:3000`

### Step 3: Access the App
Open your browser and go to:
```
http://localhost:3000
```

---

## 🎯 First Time Usage

### Landing Page
1. See default watchlist (AAPL, GOOGL, MSFT, TSLA)
2. Click any stock to view its chart
3. Or search for a different stock symbol

### View a Stock
1. Type a stock symbol (e.g., "AAPL")
2. Click "Search"
3. See the candlestick chart
4. Check the trading signal on the right
5. Add/remove from watchlist with ⭐ button

### Check Your Portfolio
1. Click "📊 Portfolio" button
2. See all your stocks in a table
3. View summary stats (Buy/Sell signals, confidence)
4. Sort by different columns
5. Click "View" on any stock for details

### Toggle Dark Mode
- Click the 🌙 or ☀️ button in the top-right
- Your preference is saved automatically

---

## 📊 Understanding the Trading Signal

### Signal Card Explanation
```
Direction: BUY ⬆️ or SELL ⬇️
├─ BUY (Green)  → AI predicts price will go UP
├─ SELL (Red)   → AI predicts price will go DOWN
└─ Based on 60-minute LSTM neural network

Current Price: $150.25
└─ What the stock trades for right now

Predicted Price: $151.50
└─ What the AI thinks it will be next hour

Expected Move: 0.833%
└─ How much the price might change (%)

Confidence: 85%
└─ How sure the AI is about this prediction
├─ Green (≥70%)   → Strong signal 💪
├─ Amber (50-69%) → Moderate signal ⚡
└─ Red (<50%)     → Weak signal ⚠️

Status:
├─ 🔥 FINAL SIGNAL: 90% CONFIRMED → Ready to trade!
└─ ⏳ WAIT - No strong confirmation → Not yet confident
```

---

## ⚙️ Key Features Explained

### Dark Mode
- Toggle anytime with the 🌙/☀️ button
- Saves your preference automatically
- Works across all pages

### Watchlist
- **Automatic saving**: Every search is added
- **One-click removal**: Click ✕ on any stock card
- **Always available**: Access from landing page

### Portfolio Dashboard
- **Quick overview**: See all stocks at once
- **Sorting options**: Symbol, Confidence, Move %, Direction
- **Summary stats**: Total stocks, buy/sell signals, avg confidence
- **Fast access**: Click "View" to see detailed chart

### Chart Page
- **Interactive chart**: Scroll, zoom, download
- **Real-time data**: Updates from Yahoo Finance
- **Refresh timer**: Shows when next update happens (60 mins)
- **Signal detail**: Full breakdown of prediction

---

## 💡 Tips & Tricks

1. **Add Multiple Stocks Quickly**
   - Search and view each one
   - They're automatically added to watchlist
   - Access all at once from Portfolio page

2. **Watch Strong Signals**
   - Look for 🔥 FIRE signals in portfolio
   - Confidence ≥70% = strong prediction
   - Green bar = higher confidence

3. **Monitor Trends**
   - Check portfolio daily
   - Sort by "Confidence" to see strongest signals
   - Compare current vs predicted prices

4. **Use Dark Mode for Extended Viewing**
   - Easier on eyes during long sessions
   - Preference is saved automatically

5. **Understand Limitations**
   - AI predicts based on historical patterns
   - Not guaranteed (use for research only)
   - Always verify with other indicators

---

## 🔍 Troubleshooting

### "Failed to fetch data"
- Check if backend is running on `localhost:8000`
- Verify internet connection (needs Yahoo Finance)
- Try different stock symbol

### "Portfolio is empty"
- Search for stocks on landing page first
- They auto-add to watchlist
- Watchlist saves in your browser

### Dark mode not saving
- Browser might have private/incognito mode
- LocalStorage is disabled
- Try regular browsing mode

### Charts not loading
- Wait a few seconds for data fetch
- Check browser console for errors
- Refresh page if needed

---

## 📱 Mobile/Tablet Usage

AutoTrade is responsive and works great on mobile!
- Single column layout on small screens
- Touch-friendly buttons
- Scrollable tables on narrow screens
- All features fully available

---

## 🎓 Learning Resources

### About LSTM (AI Model Used)
- Long Short-Term Memory neural networks
- Great for time-series predictions
- Learns patterns from historical data
- Used for stock price forecasting

### About Trading Signals
- **BUY Signal** = Price predicted to increase
- **SELL Signal** = Price predicted to decrease
- **Confidence** = How sure the model is
- Use with other analysis tools!

### About Candlestick Charts
- Each "candle" represents a time period
- Green = Price went up (bullish)
- Red = Price went down (bearish)
- Shows Open, High, Low, Close (OHLC) prices

---

## ⚠️ Important Disclaimers

### Not Financial Advice
- This app is for **educational purposes only**
- AI predictions are NOT guaranteed
- Do your own research before trading
- Consult a financial advisor if unsure

### Risk Warning
- Trading stocks involves risk
- You can lose money
- Past performance ≠ future results
- Never invest money you can't afford to lose

---

## 📞 Support / Questions

For issues or questions:
1. Check troubleshooting section above
2. Verify backend is running (`python main.py`)
3. Check browser console for error messages
4. Restart both backend and frontend if needed

---

## 🎉 Enjoy Trading!

You're all set! Start exploring stocks and building your portfolio.

**Remember**: This is a learning tool. Use it wisely! 📚✨
