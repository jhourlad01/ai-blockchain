import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler

def load_and_preprocess(data: pd.DataFrame, feature_col='price'):
    """
    Prepare data for modeling: fill missing, scale features.
    """
    df = data.copy()
    df = df.sort_index()
    df[feature_col].fillna(method='ffill', inplace=True)

    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled = scaler.fit_transform(df[[feature_col]])
    return df, scaled, scaler

def create_sequences(data, seq_length=60):
    """
    Generate sequences for LSTM: X (seq_length timesteps), y (next value)
    """
    xs, ys = [], []
    for i in range(len(data) - seq_length):
        x = data[i:(i+seq_length)]
        y = data[i+seq_length]
        xs.append(x)
        ys.append(y)
    return np.array(xs), np.array(ys)
