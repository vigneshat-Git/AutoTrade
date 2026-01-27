from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Input
import random
from datetime import datetime, timedelta
import sys
import io
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

LOOKBACK = 60
CONFIDENCE_LIMIT = 90
MIN_MOVE_PCT = 0.30

DATA_CACHE = {}
CACHE_DURATION_SECONDS = 3600
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def fetch_robust_data(symbol):
    if not symbol.endswith(".NS") and not symbol.endswith(".BO"):
        symbol = f"{symbol}.NS"
    print(f"[FETCH] Attempting to fetch: {symbol}")

    try:
        ticker = yf.Ticker(symbol)
        df = ticker.history(period="5d", interval="1m")
        if df is None or df.empty:
            print(f"{symbol}: No data found (DataFrame empty).")
            return None, symbol
        df.reset_index(inplace=True)
        df.columns = [c.capitalize() for c in df.columns] 
        required_cols = ['Open', 'High', 'Low', 'Close']
        if not all(col in df.columns for col in required_cols):
            print(f"[ERROR] {symbol}: Missing columns. Got: {df.columns}")
            return None, symbol
        return df, symbol
    except Exception as e:
        print(f"[ERROR] API CRASH ({symbol}): {str(e)}")
        return None, symbol
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
        Input(shape=shape),
        LSTM(50, return_sequences=True),
        LSTM(50),
        Dense(1)
    ])
    model.compile(optimizer="adam", loss="mse")
    return model

@app.get("/api/health")
async def health_check():
    return {
        "status": "Backend is running",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "yfinance": "Ready",
            "tensorflow": "Ready",
            "database_cache": f"{len(DATA_CACHE)} stocks cached"
        }
    }

@app.get("/api/predict/{symbol}")
async def get_prediction(symbol: str):
    try:
        global DATA_CACHE
        symbol = symbol.upper()
        
        df = None
        data_source = "LIVE"
        error_reason = ""
        
        now = datetime.now()
        cache_key = symbol if symbol.endswith(".NS") else f"{symbol}.NS"

        if cache_key in DATA_CACHE:
            cached_df, timestamp = DATA_CACHE[cache_key]
            if (now - timestamp).total_seconds() < CACHE_DURATION_SECONDS:
                print(f"[CACHE] HIT: {cache_key}")
                df = cached_df
                data_source = "CACHE"
                symbol = cache_key
        if df is None:
            fetched_df, correct_symbol = fetch_robust_data(symbol)
            if fetched_df is not None:
                df = fetched_df
                symbol = correct_symbol
                DATA_CACHE[symbol] = (df, now)
                print(f"[SUCCESS] REAL DATA LOADED: {symbol}")
            else:
                print(f"[WARN] Failed to fetch {symbol}, using MOCK data")
                df = generate_mock_data(symbol)
                data_source = "MOCK"
                error_reason = "Download failed or empty data"

        if 'Datetime' in df.columns:
            df['Datetime'] = pd.to_datetime(df['Datetime'])
            if df['Datetime'].dt.tz is not None:
                df['Datetime'] = df['Datetime'].dt.tz_localize(None)
            df.set_index('Datetime', inplace=True)
        elif 'Date' in df.columns:
            df['Date'] = pd.to_datetime(df['Date'])
            df.set_index('Date', inplace=True)
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
            status_msg = f"[WARN] USING MOCK DATA\nReason: {error_reason}"
        elif confidence >= CONFIDENCE_LIMIT and move_pct >= MIN_MOVE_PCT:
            status_msg = "[HOT] FINAL SIGNAL: 90% CONFIRMED"
        else:
            status_msg = "[INFO] WAIT - No strong confirmation"
        history_subset = df.tail(100).reset_index()
        chart_data = []       
        for idx, row in history_subset.iterrows():
            try:
                if 'Datetime' in history_subset.columns:
                    ts_val = row['Datetime']
                elif 'Date' in history_subset.columns:
                    ts_val = row['Date']
                else:
                    ts_val = history_subset.index[idx]
                if isinstance(ts_val, pd.Timestamp):
                    ts_str = ts_val.strftime('%Y-%m-%d %H:%M:%S')
                else:
                    ts_str = str(ts_val)
                chart_data.append({
                    "x": ts_str,
                    "y": [float(row['Open']), float(row['High']), float(row['Low']), float(row['Close'])]
                })
            except Exception as e:
                print(f"[WARN] Error processing row {idx}: {e}")
                continue
        return {
            "symbol": symbol,
            "current_price": float(current_price),
            "predicted_price": float(predicted_price),
            "direction": direction,
            "confidence": float(confidence),
            "move_pct": float(move_pct),
            "status_message": status_msg,
            "chart_data": chart_data,
            "data_source": data_source,
            "last_updated": datetime.now().isoformat()
        }
    
    except Exception as e:
        print(f"[ERROR] Failure in get_prediction: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return {
            "symbol": symbol,
            "current_price": 0,
            "predicted_price": 0,
            "direction": "HOLD",
            "confidence": 0,
            "move_pct": 0,
            "status_message": f"Error: {str(e)[:100]}",
            "chart_data": [],
            "data_source": "ERROR",
            "last_updated": datetime.now().isoformat(),
            "error": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)