import argparse
import time
from datetime import datetime

import yfinance as yf


def get_latest_price(ticker: yf.Ticker):
    df = ticker.history(period="1d", interval="1m")
    if df is None or df.empty:
        return None
    last_row = df.tail(1)
    ts = last_row.index[0]
    price = float(last_row["Close"].iloc[0])
    if getattr(ts, "to_pydatetime", None) is not None:
        ts = ts.to_pydatetime()
    return ts, price


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--symbol", default="TATAGOLD.NS")
    parser.add_argument("--refresh", type=float, default=5.0)
    args = parser.parse_known_args()[0]

    ticker = yf.Ticker(args.symbol)
    print(f"Live price for {args.symbol} (Ctrl+C to stop)")

    try:
        while True:
            try:
                latest = get_latest_price(ticker)
                if latest is None:
                    line = f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} | no data"
                else:
                    ts, price = latest
                    line = f"{ts.strftime('%Y-%m-%d %H:%M:%S')} | {price:.2f}"
                print("\r" + line + " " * 10, end="", flush=True)
            except Exception as e:
                print("\r" + f"error: {e}" + " " * 10, end="", flush=True)

            time.sleep(max(0.5, args.refresh))
    except KeyboardInterrupt:
        print("\nStopped.")
        return 0


if __name__ == "__main__":
    raise SystemExit(main())