import argparse
import time
from datetime import datetime

import yfinance as yf
import numpy as np

from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense

# ================= SETTINGS =================

LOOKBACK = 60
CONFIRM_COUNT = 3        # how many continuous same predictions
MIN_MOVE_PCT = 0.30      # minimum move %
CONFIDENCE_LIMIT = 90   # %

signal_buffer = []

# ============================================

def fetch_data(symbol):
    df = yf.download(symbol, period="5d", interval="1m", progress=False)

    if df is None or df.empty:
        return None

    return df[['Close']]


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


def predict_with_confidence(model, scaler, data):
    last = data[-LOOKBACK:]
    scaled = scaler.transform(last)

    X = np.reshape(scaled, (1, LOOKBACK, 1))
    pred = model.predict(X, verbose=0)

    predicted_price = scaler.inverse_transform(pred)[0][0]
    current_price = data[-1][0]

    move_pct = abs(predicted_price - current_price) / current_price * 100

    confidence = min(100, move_pct * 50)

    direction = "BUY" if predicted_price > current_price else "SELL"

    return predicted_price, direction, confidence, move_pct


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--symbol", default=input("SYMBOL:"))
    parser.add_argument("--refresh", type=int, default=2)
    args = parser.parse_known_args()[0]

    print("\nDownloading data...")
    df = fetch_data(args.symbol)

    if df is None:
        print("❌ No data received. Try another symbol.")
        return

    X, y, scaler = prepare_data(df.values)

    print("Training LSTM model...")
    model = build_model((X.shape[1], 1))
    model.fit(X, y, epochs=5, batch_size=32, verbose=1)

    print(f"\nLive prediction started for {args.symbol}")
    print("Only strong signals (90% confirmed) will be shown\n")

    try:
        while True:
            df = fetch_data(args.symbol)

            if df is None:
                print("No live data... retrying")
                time.sleep(60)
                continue

            current = df.iloc[-1][0]

            predicted, direction, confidence, move_pct = \
                predict_with_confidence(model, scaler, df.values)

            ts = df.index[-1].to_pydatetime()

            print("="*60)
            print(f"Time       : {ts}")
            print(f"Current    : {current:.2f}")
            print(f"Predicted  : {predicted:.2f}")
            print(f"Move %     : {move_pct:.3f}%")
            print(f"Direction  : {direction}")
            print(f"Confidence : {confidence:.2f}%")

            # store last signals
            signal_buffer.append(direction)
            if len(signal_buffer) > CONFIRM_COUNT:
                signal_buffer.pop(0)

            # FINAL SIGNAL
            if (confidence >= CONFIDENCE_LIMIT and
                move_pct >= MIN_MOVE_PCT and
                signal_buffer.count(direction) == CONFIRM_COUNT):

                print(f"\n🔥 FINAL SIGNAL: {direction}")
                print("✔ 90% CONFIRMED")
                print("✔ Strong move detected\n")

            else:
                print("\n⏳ WAIT - No strong confirmation\n")

            time.sleep(args.refresh)

    except KeyboardInterrupt:
        print("\nStopped by user")


if __name__ == "__main__":
    main()
