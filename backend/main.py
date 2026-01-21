from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense

# ================= SETTINGS FROM PricePred.py =================
LOOKBACK = 60
CONFIDENCE_LIMIT = 90
MIN_MOVE_PCT = 0.30

app = FastAPI()

# Allow React frontend to communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= HELPER FUNCTIONS =================

def calculate_indicators(df):
    """Add SMA and RSI for dashboard visualization"""
    df['SMA_20'] = df['Close'].rolling(window=20).mean()
    
    # RSI Calculation
    delta = df['Close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    df['RSI'] = 100 - (100 / (1 + rs))
    return df.fillna(0) # Handle initial NaNs

def prepare_data(data):
    """Adapted from PricePred.py"""
    scaler = MinMaxScaler()
    scaled = scaler.fit_transform(data)
    X, y = [], []
    for i in range(LOOKBACK, len(scaled)):
        X.append(scaled[i-LOOKBACK:i])
        y.append(scaled[i])
    return np.array(X), np.array(y), scaler

def build_model(shape):
    """Adapted from PricePred.py"""
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
    print(f"Fetching data for {symbol}...")
    
    # Fetch 5 days of 1-minute data
    df = yf.download(symbol, period="5d", interval="1m", progress=False)
    
    if df is None or df.empty:
        raise HTTPException(status_code=404, detail="Symbol not found or no data available")

    # Add indicators for the frontend charts
    df = calculate_indicators(df)
    
    # Prepare data for LSTM (using only Close price as per original logic)
    close_data = df[['Close']].values
    X, y, scaler = prepare_data(close_data)
    
    if len(X) == 0:
        raise HTTPException(status_code=400, detail="Not enough data to train model")

    # Train Model (In production, load a pre-trained model instead of training on every request)
    model = build_model((X.shape[1], 1))
    model.fit(X, y, epochs=3, batch_size=32, verbose=0) # Reduced epochs for speed

    # Prediction Logic from PricePred.py
    last_sequence = close_data[-LOOKBACK:]
    last_scaled = scaler.transform(last_sequence)
    X_pred = np.reshape(last_scaled, (1, LOOKBACK, 1))
    pred_scaled = model.predict(X_pred, verbose=0)
    
    predicted_price = float(scaler.inverse_transform(pred_scaled)[0][0])
    current_price = float(close_data[-1][0])
    
    move_pct = abs(predicted_price - current_price) / current_price * 100
    confidence = min(100, move_pct * 50)
    direction = "BUY" if predicted_price > current_price else "SELL"
    
    # Determine Final Signal based on PricePred.py logic
    is_strong_signal = (confidence >= CONFIDENCE_LIMIT and move_pct >= MIN_MOVE_PCT)

    # Format historical data for React Charts (Sending last 100 points to keep payload small)
    history_subset = df.tail(100).reset_index()
    chart_data = []
    for _, row in history_subset.iterrows():
        chart_data.append({
            "time": str(row['Datetime']), # yfinance uses 'Datetime' index for intraday
            "price": float(row['Close']),
            "sma": float(row['SMA_20']),
            "rsi": float(row['RSI'])
        })

    return {
        "symbol": symbol.upper(),
        "current_price": current_price,
        "predicted_price": predicted_price,
        "direction": direction,
        "confidence": confidence,
        "move_pct": move_pct,
        "is_strong_signal": is_strong_signal,
        "chart_data": chart_data
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)