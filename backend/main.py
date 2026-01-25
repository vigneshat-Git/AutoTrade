from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import numpy as np
import pandas as pd
import requests
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Input
import random
from datetime import datetime, timedelta

# ================= SETTINGS =================
LOOKBACK = 60
CONFIDENCE_LIMIT = 90
MIN_MOVE_PCT = 0.30

# Cache duration
DATA_CACHE = {}
CACHE_DURATION_SECONDS = 3600

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= ROBUST DATA FETCHER (THE FIX) =================

# ================= ROBUST DATA FETCHER (CORRECTED) =================

def fetch_robust_data(symbol):
    """
    Fetches data using yfinance's internal handling (curl_cffi).
    Automatically adds .NS if missing for Indian context.
    """
    # 1. Auto-append .NS for Indian stocks if missing
    # (Yahoo Finance requires .NS for NSE stocks)
    if not symbol.endswith(".NS") and not symbol.endswith(".BO"):
        symbol = f"{symbol}.NS"

    print(f"🌍 Attempting to fetch: {symbol}")

    try:
        # 2. Use Ticker directly WITHOUT a custom session
        # The error explicitly said: "let YF handle"
        ticker = yf.Ticker(symbol)
        
        # Fetch 5 days of 1-minute data
        df = ticker.history(period="5d", interval="1m")

        if df is None or df.empty:
            print(f"❌ {symbol}: No data found (DataFrame empty).")
            return None, symbol

        # Reset index to make sure we have access to columns
        df.reset_index(inplace=True)
        
        # Standardize columns (Capitalize first letter)
        df.columns = [c.capitalize() for c in df.columns] 
        
        required_cols = ['Open', 'High', 'Low', 'Close']
        
        # Check if we have the data we need
        if not all(col in df.columns for col in required_cols):
            print(f"❌ {symbol}: Missing columns. Got: {df.columns}")
            return None, symbol

        return df, symbol

    except Exception as e:
        print(f"❌ API CRASH ({symbol}): {str(e)}")
        return None, symbol
    
# ================= HELPER FUNCTIONS =================

def generate_mock_data(symbol):
    # (Same as your previous code - kept for fallback)
    dates = [datetime.now() - timedelta(minutes=i) for i in range(1000)]
    dates.reverse()
    ohlc_data = []
    current_price = 150.0
    for _ in dates:
        move = random.uniform(-0.5, 0.5)
        open_p = current_price
        close_p = open_p + move
        wiggle_room = random.uniform(0.05, 0.3)
        high_p = max(open_p, close_p) + wiggle_room
        low_p = min(open_p, close_p) - wiggle_room
        ohlc_data.append([open_p, high_p, low_p, close_p])
        current_price = close_p
    df = pd.DataFrame(ohlc_data, index=dates, columns=['Open', 'High', 'Low', 'Close'])
    df['Volume'] = 100000
    return df

def calculate_indicators(df):
    df['SMA_20'] = df['Close'].rolling(window=20).mean()
    delta = df['Close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    df['RSI'] = 100 - (100 / (1 + rs))
    return df.fillna(0)

def prepare_data(data):
    scaler = MinMaxScaler()
    scaled = scaler.fit_transform(data)
    X, y = [], []
    for i in range(LOOKBACK, len(scaled)):
        X.append(scaled[i-LOOKBACK:i])
        y.append(scaled[i])
    return np.array(X), np.array(y), scaler

def build_model(shape):
    model = Sequential([
        Input(shape=shape), # Add this explicitly as the first layer
        LSTM(50, return_sequences=True), # Remove input_shape from here
        LSTM(50),
        Dense(1)
])
    model.compile(optimizer="adam", loss="mse")
    return model

# ================= API ENDPOINT =================

@app.get("/api/predict/{symbol}")
async def get_prediction(symbol: str):
    global DATA_CACHE
    symbol = symbol.upper()
    
    df = None
    data_source = "LIVE"
    error_reason = ""
    
    # 1. CHECK CACHE
    now = datetime.now()
    # Handle the .NS check for cache keys too
    cache_key = symbol if symbol.endswith(".NS") else f"{symbol}.NS"

    if cache_key in DATA_CACHE:
        cached_df, timestamp = DATA_CACHE[cache_key]
        if (now - timestamp).total_seconds() < CACHE_DURATION_SECONDS:
            print(f"✅ CACHE HIT: {cache_key}")
            df = cached_df
            data_source = "CACHE"
            symbol = cache_key # Ensure we use the correct .NS symbol

    # 2. FETCH REAL DATA (If not in cache)
    if df is None:
        fetched_df, correct_symbol = fetch_robust_data(symbol)
        
        if fetched_df is not None:
            df = fetched_df
            symbol = correct_symbol # Update symbol to the one that worked (e.g. INFY -> INFY.NS)
            DATA_CACHE[symbol] = (df, now)
            print(f"✅ REAL DATA LOADED: {symbol}")
        else:
            print(f"⚠️ Failed to fetch {symbol}, switching to MOCK.")
            df = generate_mock_data(symbol)
            data_source = "MOCK"
            error_reason = "Download failed or empty data"

    # --- PROCESS ---
    # Ensure Datetime is index for consistency
    if 'Datetime' in df.columns:
        df['Datetime'] = pd.to_datetime(df['Datetime'])
        if df['Datetime'].dt.tz is not None:
             df['Datetime'] = df['Datetime'].dt.tz_localize(None) # Remove TZ for cleaner JSON
        df.set_index('Datetime', inplace=True)
    elif 'Date' in df.columns:
         df['Date'] = pd.to_datetime(df['Date'])
         df.set_index('Date', inplace=True)

    df = calculate_indicators(df)
    close_data = df[['Close']].values
    
    # Validation
    if len(close_data) < LOOKBACK + 1:
         df = generate_mock_data(symbol)
         df = calculate_indicators(df)
         close_data = df[['Close']].values
         data_source = "MOCK"

    X, y, scaler = prepare_data(close_data)
    
    # Quick training (1 epoch for speed)
    model = build_model((X.shape[1], 1))
    model.fit(X, y, epochs=1, batch_size=32, verbose=0) 

    last_sequence = close_data[-LOOKBACK:]
    last_scaled = scaler.transform(last_sequence)
    X_pred = np.reshape(last_scaled, (1, LOOKBACK, 1))
    pred_scaled = model.predict(X_pred, verbose=0)
    
    predicted_price = float(scaler.inverse_transform(pred_scaled)[0][0])
    current_price = float(close_data[-1][0])
    move_pct = abs(predicted_price - current_price) / current_price * 100
    confidence = min(100, move_pct * 50)
    direction = "BUY" if predicted_price > current_price else "SELL"
    
    if data_source == "MOCK":
        status_msg = f"⚠️ USING MOCK DATA\nReason: {error_reason}"
    elif confidence >= CONFIDENCE_LIMIT and move_pct >= MIN_MOVE_PCT:
        status_msg = "🔥 FINAL SIGNAL: 90% CONFIRMED"
    else:
        status_msg = "⏳ WAIT - No strong confirmation"

    # Prepare Chart Data
    history_subset = df.tail(100).reset_index()
    chart_data = []
    
    for _, row in history_subset.iterrows():
        # Get timestamp from the index name we set earlier
        ts_val = row['Datetime'] if 'Datetime' in row else row.name
        if isinstance(ts_val, pd.Timestamp):
            ts_str = ts_val.strftime('%Y-%m-%d %H:%M:%S')
        else:
            ts_str = str(ts_val)

        chart_data.append({
            "x": ts_str,
            "y": [float(row['Open']), float(row['High']), float(row['Low']), float(row['Close'])]
        })

    return {
        "symbol": symbol,
        "current_price": current_price,
        "predicted_price": predicted_price,
        "direction": direction,
        "confidence": confidence,
        "move_pct": move_pct,
        "status_message": status_msg,
        "chart_data": chart_data,
        "data_source": data_source
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)