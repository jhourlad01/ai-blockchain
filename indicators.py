import numpy as np

def calculate_ema(prices, period):
    prices = np.array(prices)
    if len(prices) < period:
        return prices.tolist()  # Return original prices if not enough data

    k = 2 / (period + 1)
    ema = [np.mean(prices[:period])]
    for price in prices[period:]:
        ema.append(price * k + ema[-1] * (1 - k))
    return ema

def calculate_macd(prices, short_period=12, long_period=26, signal_period=9):
    if len(prices) < long_period:
        return {"macdLine": 0, "signalLine": 0, "histogram": 0}

    ema_short = calculate_ema(prices, short_period)
    ema_long = calculate_ema(prices, long_period)
    macd_line = [ema_short[i] - ema_long[i] for i in range(len(ema_long))]
    signal_line = calculate_ema(macd_line, signal_period)
    histogram = [macd_line[i] - signal_line[i] for i in range(len(signal_line))]

    return {"macdLine": macd_line[-1], "signalLine": signal_line[-1], "histogram": histogram[-1]}

def calculate_rsi(prices, period=14):
    if len(prices) < period + 1:
        return 50

    changes = np.diff(prices)
    gains = np.where(changes > 0, changes, 0)
    losses = np.where(changes < 0, -changes, 0)
    avg_gain = np.mean(gains[:period])
    avg_loss = np.mean(losses[:period])

    for i in range(period, len(gains)):
        avg_gain = (avg_gain * (period - 1) + gains[i]) / period
        avg_loss = (avg_loss * (period - 1) + losses[i]) / period

    rs = avg_gain / avg_loss if avg_loss != 0 else float('inf')
    return 100 - (100 / (1 + rs))

def calculate_bollinger_bands(prices, period=20, std_dev_multiplier=2):
    if len(prices) < period:
        return {"upper": 0, "middle": 0, "lower": 0}

    middle = np.mean(prices[-period:])  # Use SMA for middle band
    std_dev = np.std(prices[-period:])
    return {
        "upper": middle + std_dev_multiplier * std_dev,
        "middle": middle,
        "lower": middle - std_dev_multiplier * std_dev
    }

def calculate_atr(highs, lows, closes, period=14):
    if len(highs) < period or len(lows) < period or len(closes) < period:
        return 0

    trs = [max(highs[i] - lows[i], abs(highs[i] - closes[i - 1]), abs(lows[i] - closes[i - 1])) for i in range(1, len(highs))]
    return np.mean(trs[-period:])

def calculate_indicators(prices):
    return {
        "macd": calculate_macd(prices),
        "rsi": calculate_rsi(prices),
        "ema12": calculate_ema(prices, 12)[-1],
        "ema26": calculate_ema(prices, 26)[-1],
        "bollinger": calculate_bollinger_bands(prices),
        "currentPrice": prices[-1],
    }
