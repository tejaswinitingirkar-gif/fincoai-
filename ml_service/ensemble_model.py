import numpy as np
import pandas as pd
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
import joblib
import os
from datetime import timedelta

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
os.makedirs(MODEL_DIR, exist_ok=True)

class EnsembleFinanceModel:
    def __init__(self, user_id):
        self.user_id = user_id
        self.rf_model_path = os.path.join(MODEL_DIR, f'rf_ensemble_{user_id}.joblib')
        self.gb_model_path = os.path.join(MODEL_DIR, f'gb_cat_{user_id}.joblib')
        self.rf_model = None
        self.gb_model = None

    def _extract_time_features(self, df):
        """Extract features for Random Forest based on date"""
        df_feats = df.copy()
        df_feats['day_of_week'] = df_feats['date'].dt.dayofweek
        df_feats['day_of_month'] = df_feats['date'].dt.day
        df_feats['is_weekend'] = df_feats['day_of_week'].isin([5, 6]).astype(int)
        df_feats['week_of_month'] = (df_feats['date'].dt.day - 1) // 7 + 1
        
        # Add rolling averages if enough data
        if len(df_feats) >= 7:
            df_feats['rolling_7'] = df_feats['amount'].rolling(window=7, min_periods=1).mean()
        else:
            df_feats['rolling_7'] = df_feats['amount'].mean()
            
        return df_feats

    def train(self, daily_df):
        """Trains the Random Forest model on historical data"""
        if len(daily_df) < 7:
            return False
            
        try:
            df_feats = self._extract_time_features(daily_df)
            
            # Features for RF
            features = ['day_of_week', 'day_of_month', 'is_weekend', 'week_of_month', 'rolling_7']
            X = df_feats[features].fillna(0)
            y = df_feats['amount']
            
            self.rf_model = RandomForestRegressor(n_estimators=50, max_depth=5, random_state=42)
            self.rf_model.fit(X, y)
            joblib.dump(self.rf_model, self.rf_model_path)
            return True
        except Exception as e:
            print(f"Error training RF Ensemble for {self.user_id}: {e}")
            return False

    def train_category_model(self, expenses_df, top_category):
        """Trains a GradientBoosting model for the top spending category"""
        cat_df = expenses_df[expenses_df['category'] == top_category].copy()
        if len(cat_df) < 10:
            return False
            
        try:
            cat_daily = cat_df.groupby(cat_df['date'].dt.date)['amount'].sum().reset_index()
            cat_daily['date'] = pd.to_datetime(cat_daily['date'])
            df_feats = self._extract_time_features(cat_daily)
            
            features = ['day_of_week', 'day_of_month', 'is_weekend', 'week_of_month']
            X = df_feats[features].fillna(0)
            y = df_feats['amount']
            
            self.gb_model = GradientBoostingRegressor(n_estimators=50, learning_rate=0.1, max_depth=3, random_state=42)
            self.gb_model.fit(X, y)
            joblib.dump(self.gb_model, self.gb_model_path)
            return True
        except Exception as e:
            print(f"Error training GB Category model for {self.user_id}: {e}")
            return False

    def predict_holt_winters(self, daily_df, forecast_days=30):
        """Uses Exponential Smoothing to predict trends (Replacement for Prophet)"""
        if len(daily_df) < 14:
            # Need at least 2 weeks for basic smoothing
            avg = float(daily_df['amount'].mean())
            return [avg] * forecast_days
            
        try:
            # Try to detect if there's enough data for weekly seasonality
            seasonal_periods = 7 if len(daily_df) >= 21 else None
            trend = 'add'
            seasonal = 'add' if seasonal_periods else None
            
            # Add small epsilon to avoid zeros causing issues with multiplicative models if we ever use them
            series = daily_df['amount'].values + 0.01 
            
            model = ExponentialSmoothing(
                series, 
                trend=trend, 
                seasonal=seasonal, 
                seasonal_periods=seasonal_periods,
                initialization_method="estimated"
            )
            fit_model = model.fit()
            forecast = fit_model.forecast(forecast_days)
            return [float(max(0, val)) for val in forecast]
        except Exception as e:
            print(f"Error in Holt-Winters for {self.user_id}: {e}")
            avg = float(daily_df['amount'].tail(14).mean())
            return [avg] * forecast_days

    def predict_random_forest(self, daily_df, forecast_days=30):
        """Predicts future days based on extracted calendar features"""
        if self.rf_model is None:
            if os.path.exists(self.rf_model_path):
                self.rf_model = joblib.load(self.rf_model_path)
            else:
                success = self.train(daily_df)
                if not success:
                    return [float(daily_df['amount'].mean())] * forecast_days
        
        try:
            last_date = daily_df['date'].max()
            future_dates = [last_date + timedelta(days=x+1) for x in range(forecast_days)]
            
            future_df = pd.DataFrame({'date': pd.to_datetime(future_dates)})
            future_df['amount'] = 0 # Placeholder
            future_df = self._extract_time_features(future_df)
            
            # Carry over the last rolling_7 value as a naive feature for future
            last_rolling = daily_df['amount'].tail(7).mean()
            future_df['rolling_7'] = last_rolling
            
            features = ['day_of_week', 'day_of_month', 'is_weekend', 'week_of_month', 'rolling_7']
            X_future = future_df[features].fillna(0)
            
            preds = self.rf_model.predict(X_future)
            return [float(max(0, p)) for p in preds]
        except Exception as e:
            print(f"Error in RF predict for {self.user_id}: {e}")
            avg = float(daily_df['amount'].tail(14).mean())
            return [avg] * forecast_days

    def generate_explainability(self, expenses_df):
        """Generates deep analytical strings about the user's data"""
        if expenses_df.empty or len(expenses_df) < 5:
            return []
            
        explanations = []
        
        # 1. Weekend vs Weekday
        expenses_df['day_of_week'] = expenses_df['date'].dt.dayofweek
        weekend_exp = expenses_df[expenses_df['day_of_week'].isin([5, 6])]['amount'].sum()
        weekday_exp = expenses_df[~expenses_df['day_of_week'].isin([5, 6])]['amount'].sum()
        
        weekend_avg = weekend_exp / max(1, len(expenses_df[expenses_df['day_of_week'].isin([5, 6])]['date'].unique()))
        weekday_avg = weekday_exp / max(1, len(expenses_df[~expenses_df['day_of_week'].isin([5, 6])]['date'].unique()))
        
        if weekend_avg > weekday_avg * 1.5:
            percent_higher = int(((weekend_avg / max(1, weekday_avg)) - 1) * 100)
            explanations.append(f"Weekend expenses are typically {percent_higher}% higher than weekdays.")
            
        # 2. Category Growth (Last 30 days vs Previous 30 days)
        max_date = expenses_df['date'].max()
        last_30 = expenses_df[expenses_df['date'] >= (max_date - timedelta(days=30))]
        prev_30 = expenses_df[(expenses_df['date'] < (max_date - timedelta(days=30))) & (expenses_df['date'] >= (max_date - timedelta(days=60)))]
        
        if not prev_30.empty:
            cat_last = last_30.groupby('category')['amount'].sum()
            cat_prev = prev_30.groupby('category')['amount'].sum()
            
            for cat in cat_last.index:
                if cat in cat_prev and cat_prev[cat] > 0:
                    growth = ((cat_last[cat] - cat_prev[cat]) / cat_prev[cat]) * 100
                    if growth > 20 and cat_last[cat] > 500: # Only report significant growths
                        explanations.append(f"Spending on {cat} increased {int(growth)}% in the last 30 days.")
                        
        # 3. Recurring Expense Detection
        amounts = expenses_df['amount'].value_counts()
        recurring_candidates = amounts[amounts >= 3].index.tolist() # Values that appear 3+ times
        if recurring_candidates:
            # Pick the largest recurring
            largest_recurring = max(recurring_candidates)
            if largest_recurring > 100:
                cat = expenses_df[expenses_df['amount'] == largest_recurring]['category'].iloc[0]
                explanations.append(f"Detected recurring subscription/payment of ₹{largest_recurring} for {cat}.")

        # 4. Gradient Boosting (XGBoost alternative) Category Forecast
        cat_totals = expenses_df.groupby('category')['amount'].sum().sort_values(ascending=False)
        if len(cat_totals) > 0:
            top_category = cat_totals.index[0]
            success = self.train_category_model(expenses_df, top_category)
            if success and self.gb_model is not None:
                # Predict next 30 days for this category
                future_dates = [max_date + timedelta(days=x+1) for x in range(30)]
                future_df = pd.DataFrame({'date': pd.to_datetime(future_dates)})
                future_df['amount'] = 0
                df_feats = self._extract_time_features(future_df)
                features = ['day_of_week', 'day_of_month', 'is_weekend', 'week_of_month']
                X_future = df_feats[features].fillna(0)
                preds = self.gb_model.predict(X_future)
                total_cat_forecast = sum([max(0, p) for p in preds])
                if total_cat_forecast > 0:
                    explanations.append(f"AI Category Forecast: {top_category} is projected to hit ₹{int(total_cat_forecast):,} next month.")

        return explanations

def get_ensemble_prediction(daily_df, expenses_df, user_id, days_count, forecast_days=30):
    """Orchestrates the ensemble model"""
    ensemble = EnsembleFinanceModel(user_id)
    
    if days_count < 14:
        # Not enough data for complex modeling
        avg = float(daily_df['amount'].mean())
        preds_30 = [avg] * forecast_days
        explanations = ["Using historical average due to limited data (< 14 days)."]
        model_name = "Mathematical Average"
    else:
        # Train incrementally
        ensemble.train(daily_df)
        
        # Get Predictions
        hw_preds = ensemble.predict_holt_winters(daily_df, forecast_days)
        rf_preds = ensemble.predict_random_forest(daily_df, forecast_days)
        
        # We also need LSTM preds if available from dl_model
        try:
            from dl_model import get_model_prediction
            # dl_model returns 7 day forecast usually, so we let it handle that
            lstm_preds_7, _ = get_model_prediction(daily_df, user_id, days_count)
            # Extrapolate LSTM to 30 days roughly by repeating
            if lstm_preds_7:
                lstm_preds_30 = []
                for i in range(forecast_days):
                    lstm_preds_30.append(lstm_preds_7[i % len(lstm_preds_7)])
            else:
                lstm_preds_30 = hw_preds
        except Exception:
            lstm_preds_30 = hw_preds
            
        # Ensemble Blending
        # 40% Holt-Winters (Trend), 30% Random Forest (Calendar Patterns), 30% LSTM (Non-linear sequences)
        final_preds = []
        for i in range(forecast_days):
            blended = (hw_preds[i] * 0.4) + (rf_preds[i] * 0.3) + (lstm_preds_30[i] * 0.3)
            final_preds.append(blended)
            
        preds_30 = final_preds
        model_name = "HW-RF-LSTM Ensemble"
        explanations = ensemble.generate_explainability(expenses_df)
        
    return preds_30, model_name, explanations
