import os
import numpy as np
import pandas as pd
import joblib
from datetime import timedelta

try:
    import tensorflow as tf
    from tensorflow.keras.models import Sequential, load_model
    from tensorflow.keras.layers import LSTM, Dense, Dropout
    from tensorflow.keras.callbacks import EarlyStopping
    HAS_TF = True
except ImportError:
    print("WARNING: TensorFlow not found. DL Models disabled. Using Baseline Fallback.")
    HAS_TF = False

from sklearn.preprocessing import MinMaxScaler

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
os.makedirs(MODEL_DIR, exist_ok=True)

WINDOW_SIZE = 14  # We use the past 14 days to predict the next
FORECAST_DAYS = 7 # Predict next 7 days

def train_baseline(daily_df):
    """Fallback: Average of the last few days."""
    if daily_df is None or daily_df.empty:
        return [0.0] * FORECAST_DAYS
    
    recent_data = daily_df.tail(WINDOW_SIZE)['amount']
    avg = float(recent_data.mean())
    if np.isnan(avg):
        avg = 0.0
        
    return [avg] * FORECAST_DAYS

def _create_sequences(data, window_size):
    X, y = [], []
    for i in range(window_size, len(data)):
        X.append(data[i-window_size:i, 0])
        y.append(data[i, 0])
    X = np.array(X)
    X = np.reshape(X, (X.shape[0], X.shape[1], 1))
    return X, np.array(y)

def train_lstm(daily_df, user_id, incremental=False):
    if not HAS_TF: return False
    if len(daily_df) < WINDOW_SIZE + 2:
        return False # Not enough data
        
    data = daily_df['amount'].values.reshape(-1, 1)
    model_path = os.path.join(MODEL_DIR, f'lstm_{user_id}.h5')
    scaler_path = os.path.join(MODEL_DIR, f'scaler_{user_id}.joblib')
    
    if incremental and os.path.exists(model_path) and os.path.exists(scaler_path):
        try:
            model = load_model(model_path)
            scaler = joblib.load(scaler_path)
            scaled_data = scaler.fit_transform(data)
            X, y = _create_sequences(scaled_data, WINDOW_SIZE)
            model.fit(X, y, epochs=2, batch_size=16, verbose=0)
            model.save(model_path)
            joblib.dump(scaler, scaler_path)
            return True
        except Exception as e:
            print(f"Incremental training failed for {user_id}: {e}")
            incremental = False

    # Full Retrain
    try:
        split_idx = int(len(data) * 0.8)
        train_data = data[:split_idx]
        val_data = data[split_idx:]
        
        if len(train_data) == 0:
            train_data = data
            val_data = data
            
        scaler = MinMaxScaler(feature_range=(0, 1))
        scaled_train = scaler.fit_transform(train_data)
        scaled_val = scaler.transform(val_data)
        
        scaled_data = np.concatenate((scaled_train, scaled_val), axis=0)
        X, y = _create_sequences(scaled_data, WINDOW_SIZE)
        
        if len(X) == 0: return False
            
        split_X_idx = int(len(X) * 0.8)
        X_train, y_train = X[:split_X_idx], y[:split_X_idx]
        X_val, y_val = X[split_X_idx:], y[split_X_idx:]
        
        model = Sequential([
            LSTM(units=50, return_sequences=True, input_shape=(WINDOW_SIZE, 1)),
            Dropout(0.2),
            LSTM(units=50, return_sequences=False),
            Dropout(0.2),
            Dense(units=1)
        ])
        
        model.compile(optimizer='adam', loss='mean_squared_error')
        early_stop = EarlyStopping(monitor='val_loss', patience=3, restore_best_weights=True)
        callbacks = [early_stop] if len(X_val) > 0 and not np.array_equal(X_train, X_val) else []
        
        model.fit(X_train, y_train, validation_data=(X_val, y_val) if len(X_val) > 0 else None,
                  epochs=20, batch_size=16, callbacks=callbacks, verbose=0)
        
        model.save(model_path)
        joblib.dump(scaler, scaler_path)
        return True
    except Exception as e:
        print(f"Full training failed: {e}")
        return False

def predict_lstm(daily_df, user_id):
    if not HAS_TF: return train_baseline(daily_df)
    
    model_path = os.path.join(MODEL_DIR, f'lstm_{user_id}.h5')
    scaler_path = os.path.join(MODEL_DIR, f'scaler_{user_id}.joblib')
    
    if not os.path.exists(model_path) or not os.path.exists(scaler_path):
        return train_baseline(daily_df)
        
    try:
        model = load_model(model_path)
        scaler = joblib.load(scaler_path)
        data = daily_df['amount'].values.reshape(-1, 1)
        if len(data) < WINDOW_SIZE:
            return train_baseline(daily_df)
            
        scaled_data = scaler.transform(data)
        last_window = scaled_data[-WINDOW_SIZE:]
        
        preds = []
        current_batch = last_window.reshape((1, WINDOW_SIZE, 1))
        
        for _ in range(FORECAST_DAYS):
            next_val = model.predict(current_batch, verbose=0)[0]
            preds.append(next_val)
            current_batch = np.append(current_batch[:, 1:, :], [[next_val]], axis=1)
            
        preds = scaler.inverse_transform(np.array(preds).reshape(-1, 1))
        return [float(max(0, p[0])) for p in preds]
    except Exception as e:
        print(f"Error in predict_lstm: {e}")
        return train_baseline(daily_df)

def get_model_prediction(daily_df, user_id, days_count):
    if not HAS_TF or days_count < WINDOW_SIZE:
        return train_baseline(daily_df), "BASELINE"
    else:
        model_path = os.path.join(MODEL_DIR, f'lstm_{user_id}.h5')
        if not os.path.exists(model_path):
            success = train_lstm(daily_df, user_id)
            if not success:
                return train_baseline(daily_df), "BASELINE"
        
        preds = predict_lstm(daily_df, user_id)
        return preds, "LSTM"
