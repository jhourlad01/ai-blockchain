import requests
import pandas as pd
import numpy as np
from ta.momentum import RSIIndicator

def fetch_historical_data(coin_id, vs_currency='usd', days=90):
    url = f'https://api.coingecko.com/api/v3/coins/{coin_id}/market_chart'
    params = {'vs_currency': vs_currency, 'days': days}
    res = requests.get(url, params=params)
    res.raise_for_status()
    data = res.json()

    # Convert timestamps and price data to DataFrame
    prices = pd.DataFrame(data['prices'], columns=['timestamp', 'price'])
    volumes = pd.DataFrame(data['total_volumes'], columns=['timestamp', 'volume'])

    # Convert to datetime
    prices['date'] = pd.to_datetime(prices['timestamp'], unit='ms')
    volumes['date'] = pd.to_datetime(volumes['timestamp'], unit='ms')

    # Merge price and volume by date
    df = pd.merge(prices[['date', 'price']], volumes[['date', 'volume']], on='date')
    df.set_index('date', inplace=True)
    return df

def add_technical_indicators(df):
    # Simple Moving Averages
    df['SMA_10'] = df['price'].rolling(window=10).mean()
    df['SMA_30'] = df['price'].rolling(window=30).mean()

    # Exponential Moving Average
    df['EMA_10'] = df['price'].ewm(span=10, adjust=False).mean()

    # RSI
    rsi_indicator = RSIIndicator(close=df['price'], window=14)
    df['RSI_14'] = rsi_indicator.rsi()

    # Volatility (Rolling Std Dev)
    df['Volatility_10'] = df['price'].rolling(window=10).std()

    # Price Returns
    df['Returns'] = df['price'].pct_change()

    return df

def detect_trend(df):
    """
    Detect price trend by comparing short and long SMAs and recent returns
    """
    if df['SMA_10'].iloc[-1] > df['SMA_30'].iloc[-1]:
        if df['Returns'].iloc[-5:].mean() > 0:
            return 'Uptrend'
    if df['SMA_10'].iloc[-1] < df['SMA_30'].iloc[-1]:
        if df['Returns'].iloc[-5:].mean() < 0:
            return 'Downtrend'
    return 'Sideways'

def main():
    coin_id = 'bitcoin'
    print(f'Fetching data for {coin_id}...')
    df = fetch_historical_data(coin_id, days=90)
    df = add_technical_indicators(df)
    trend = detect_trend(df)

    print(f"Latest price: ${df['price'].iloc[-1]:.2f}")
    print(f"RSI (14): {df['RSI_14'].iloc[-1]:.2f}")
    print(f"Volatility (10-day std): {df['Volatility_10'].iloc[-1]:.4f}")
    print(f"Detected Trend: {trend}")

    # Optional: show last few rows
    print("\nRecent data sample:")
    print(df.tail())

if __name__ == '__main__':
    main()
