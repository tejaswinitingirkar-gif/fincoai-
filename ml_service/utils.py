import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from scipy import stats

def preprocess_data(transactions):
    if not transactions:
        return pd.DataFrame(), 0, False

    df = pd.DataFrame(transactions)
    df['date'] = pd.to_datetime(df['date'])
    df['amount'] = pd.to_numeric(df['amount'])
    
    # Separate expenses for prediction
    expenses_df = df[df['type'] == 'Expense'].copy()
    income_df = df[df['type'] == 'Income'].copy()
    
    total_income = income_df['amount'].sum() if not income_df.empty else 0

    if expenses_df.empty:
        return pd.DataFrame(), total_income, False

    # Standardize categories
    expenses_df['category'] = expenses_df['category'].fillna('Miscellaneous')

    # Daily aggregation
    daily_df = expenses_df.groupby(expenses_df['date'].dt.date)['amount'].sum().reset_index()
    daily_df.columns = ['date', 'amount']
    daily_df['date'] = pd.to_datetime(daily_df['date'])
    daily_df = daily_df.sort_values('date')

    # Feature Engineering
    daily_df['day_of_week'] = daily_df['date'].dt.dayofweek
    daily_df['week_of_month'] = (daily_df['date'].dt.day - 1) // 7 + 1
    
    # Fill gaps in dates if necessary (optional for RF, but good for rolling stats)
    all_dates = pd.date_range(start=daily_df['date'].min(), end=daily_df['date'].max(), freq='D')
    daily_df = daily_df.set_index('date').reindex(all_dates, fill_value=0).reset_index()
    daily_df.columns = ['date', 'amount', 'day_of_week', 'week_of_month']
    daily_df['day_of_week'] = daily_df['date'].dt.dayofweek
    daily_df['week_of_month'] = (daily_df['date'].dt.day - 1) // 7 + 1

    # Rolling averages
    daily_df['rolling_7'] = daily_df['amount'].rolling(window=7, min_periods=1).mean()
    daily_df['rolling_14'] = daily_df['amount'].rolling(window=14, min_periods=1).mean()

    return daily_df, total_income, expenses_df

def detect_anomalies(daily_df):
    if daily_df.empty:
        return daily_df, False

    # 1. Z-Score
    z_scores = np.abs(stats.zscore(daily_df['amount']))
    daily_df['z_score_anomaly'] = z_scores > 3

    # 2. Isolation Forest
    if len(daily_df) > 5:
        iso = IsolationForest(contamination=0.05, random_state=42)
        daily_df['iso_anomaly'] = iso.fit_predict(daily_df[['amount']]) == -1
    else:
        daily_df['iso_anomaly'] = False

    anomaly_detected = daily_df['z_score_anomaly'].any() or daily_df['iso_anomaly'].any()
    
    return daily_df, anomaly_detected

def get_category_insights(expenses_df):
    if expenses_df.empty:
        return [], []

    cat_totals = expenses_df.groupby('category')['amount'].sum().sort_values(ascending=False)
    top_categories = cat_totals.head(2).index.tolist()
    
    insights = []
    saving_plan = []
    
    for cat in top_categories:
        total = cat_totals[cat]
        insights.append(f"High spending detected in {cat} (Total: {total:.2f})")
        saving_plan.append(f"Reduce {cat} expenses by 15-20% to save approximately {(total * 0.15):.2f}")

    return insights, saving_plan
