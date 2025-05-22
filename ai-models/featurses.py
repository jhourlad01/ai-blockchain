import pandas as pd

def add_technical_indicators(df):
    df['SMA_10'] = df['price'].rolling(window=10).mean()
    df['EMA_10'] = df['price'].ewm(span=10, adjust=False).mean()
    df['RSI_14'] = compute_rsi(df['price'], window=14)
    df['Volatility_10'] = df['price'].rolling(window=10).std()
    df['Returns'] = df['price'].pct_change()
    df.dropna(inplace=True)
    return df

def compute_rsi(series, window=14):
    delta = series.diff()
    gain = delta.where(delta > 0, 0)
    loss = -delta.where(delta < 0, 0)
    avg_gain = gain.rolling(window=window).mean()
    avg_loss = loss.rolling(window=window).mean()
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    return rsi
