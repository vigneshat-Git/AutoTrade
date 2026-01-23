from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
import random
from datetime import datetime, timedelta

# ================= SETTINGS =================
LOOKBACK = 60
CONFIDENCE_LIMIT = 90
MIN_MOVE_PCT = 0.30

# UPDATED: Cache for 1 Hour (3600 Seconds)
DATA_CACHE = {} 
CACHE_DURATION_SECONDS = 3600 

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= HELPER FUNCTIONS =================

def generate_mock_data(symbol):
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
        LSTM(50, return_sequences=True, input_shape=shape),
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
    
    # Track when the data was actually fetched
    data_timestamp = datetime.now()

    # 1. CHECK CACHE
    now = datetime.now()
    if symbol in DATA_CACHE:
        cached_df, timestamp = DATA_CACHE[symbol]
        if (now - timestamp).total_seconds() < CACHE_DURATION_SECONDS:
            print(f"✅ CACHE HIT: {symbol} (Last fetch: {timestamp.strftime('%H:%M:%S')})")
            df = cached_df
            data_source = "CACHE"
            data_timestamp = timestamp

    # 2. FETCH REAL DATA
    if df is None:
        try:
            print(f"🌍 FETCHING NEW DATA: {symbol}...")
            # We still fetch 5 days to ensure the model has enough history to learn patterns
            fetched_df = yf.download(symbol, period="5d", interval="1m", progress=False)
            
            if fetched_df is not None and not fetched_df.empty:
                if isinstance(fetched_df.columns, pd.MultiIndex):
                    fetched_df.columns = fetched_df.columns.get_level_values(0)
                
                required_cols = ['Open', 'High', 'Low', 'Close']
                if all(col in fetched_df.columns for col in required_cols):
                    df = fetched_df
                    DATA_CACHE[symbol] = (df, now)
                    data_timestamp = now
                else:
                    raise Exception("Missing Columns")
            else:
                raise Exception("Symbol Not Found")
                
        except Exception as e:
            print(f"❌ FETCH ERROR: {e}")
            df = generate_mock_data(symbol)
            data_source = "MOCK"
            error_reason = str(e)

    # 3. FALLBACK
    if df is None or df.empty:
        df = generate_mock_data(symbol)
        data_source = "MOCK"

    # --- PROCESS ---
    df = calculate_indicators(df)
    close_data = df[['Close']].values
    
    if len(close_data) < LOOKBACK + 1:
         df = generate_mock_data(symbol)
         df = calculate_indicators(df)
         close_data = df[['Close']].values
         data_source = "MOCK"

    X, y, scaler = prepare_data(close_data)
    
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
    
    # Standardize column name
    if 'Date' in history_subset.columns:
        history_subset = history_subset.rename(columns={'Date': 'Datetime'})
    elif 'index' in history_subset.columns:
        history_subset = history_subset.rename(columns={'index': 'Datetime'})

    chart_data = []
    for _, row in history_subset.iterrows():
        # Get the timestamp
        ts = row.get('Datetime', row.name)
        
        # Ensure it's a pandas Timestamp object
        if isinstance(ts, str):
            ts = pd.to_datetime(ts)
        
        # --- THE FIX: Convert to Local System Time ---
        # If the timestamp has timezone info (like UTC), convert it to your local time.
        if ts.tzinfo is not None:
            ts = ts.astimezone() 
            # .astimezone() with no arguments converts to the system's local timezone
            
        # Remove timezone info after conversion so it's just a "naive" local time string
        ts = ts.tz_localize(None)

        # Format as string
        ts_str = ts.strftime('%Y-%m-%d %H:%M:%S')

        chart_data.append({
            "x": ts_str,
            "y": [
                float(row['Open']), 
                float(row['High']), 
                float(row['Low']), 
                float(row['Close'])
            ]
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
        "last_updated": str(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    }

# ================= HEALTH CHECK ENDPOINT =================
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": str(datetime.now().strftime("%Y-%m-%d %H:%M:%S")),
        "cache_size": len(DATA_CACHE)
    }

# ================= PORTFOLIO ENDPOINT =================
@app.post("/api/portfolio/batch")
async def get_portfolio_batch(symbols: list):
    """
    Fetch prediction data for multiple symbols at once
    """
    results = []
    for symbol in symbols:
        try:
            # Reuse the existing prediction logic
            response = await get_prediction(symbol)
            results.append(response)
        except Exception as e:
            print(f"Error fetching {symbol}: {e}")
            continue
    
    return {
        "portfolio": results,
        "total_stocks": len(results),
        "timestamp": str(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)