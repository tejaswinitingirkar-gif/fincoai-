import os
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, accuracy_score
from db import get_user_transactions

MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models')
os.makedirs(MODELS_DIR, exist_ok=True)

def load_real_data():
    """
    Loads real financial data from MongoDB.
    """
    print("Fetching real transaction data from database for training...")
    df_transactions = get_user_transactions(None)
    
    if df_transactions.empty:
        print("❌ No real transaction data found in database. Cannot train models.")
        return pd.DataFrame()
        
    print(f"✅ Found {len(df_transactions)} real transactions. Extracting features per user...")
    
    # Extract features per user
    user_features = []
    
    users = df_transactions['user'].unique()
    for user in users:
        user_tx = df_transactions[df_transactions['user'] == user]
        incomes = user_tx[user_tx['type'] == 'Income']['amount'].sum()
        expenses = user_tx[user_tx['type'] == 'Expense']['amount'].sum()
        
        # Simplified real features
        monthly_income = max(incomes, 1) # prevent div by zero
        monthly_expenses = expenses
        savings = incomes - expenses
        savings_ratio = savings / monthly_income
        expense_ratio = expenses / monthly_income
        
        income_stability = 0.8 if incomes > 0 else 0.2
        expense_volatility = 0.5
        consistency_score = 0.7
        months_active = max(1, len(user_tx['date'].dt.to_period('M').unique()))
        spending_risk_score = min(1.0, max(0.0, expense_ratio))
        sudden_change_indicators = 0
        
        # Heuristic targets based on real data
        credit_score = int(np.clip(600 + (savings_ratio * 100) - (expense_ratio * 50), 300, 850))
        goal_achievable = int(savings > 0)
        optimal_savings = max(0, savings * 1.1)

        user_features.append({
            'monthly_income': monthly_income,
            'monthly_expenses': monthly_expenses,
            'savings': savings,
            'savings_ratio': savings_ratio,
            'expense_ratio': expense_ratio,
            'income_stability': income_stability,
            'expense_volatility': expense_volatility,
            'consistency_score': consistency_score,
            'months_active': months_active,
            'spending_risk_score': spending_risk_score,
            'sudden_change_indicators': sudden_change_indicators,
            'credit_score': credit_score,
            'goal_achievable': goal_achievable,
            'optimal_savings': optimal_savings
        })
        
    return pd.DataFrame(user_features)

def train_models():
    df = load_real_data()
    
    if df.empty or len(df) < 5:
        print("Not enough real users to train global models. Skipping training. The system will use mathematical fallbacks.")
        return
        
    features = [
        'monthly_income', 'monthly_expenses', 'savings', 'savings_ratio', 
        'expense_ratio', 'income_stability', 'expense_volatility', 
        'consistency_score', 'months_active', 'spending_risk_score', 
        'sudden_change_indicators'
    ]
    
    X = df[features]
    
    y_cibil = df['credit_score']
    y_goal_class = df['goal_achievable']
    y_goal_reg = df['optimal_savings']
    
    # We can't really split if data is too small, but we try
    test_size = 0.2 if len(X) >= 10 else 0.0
    
    if test_size > 0:
        X_train, X_test, yc_train, yc_test, yg_train, yg_test, yr_train, yr_test = train_test_split(
            X, y_cibil, y_goal_class, y_goal_reg, test_size=test_size, random_state=42
        )
    else:
        X_train, X_test = X, X
        yc_train, yc_test = y_cibil, y_cibil
        yg_train, yg_test = y_goal_class, y_goal_class
        yr_train, yr_test = y_goal_reg, y_goal_reg
    
    print("Scaling features...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    if test_size > 0:
        X_test_scaled = scaler.transform(X_test)
    else:
        X_test_scaled = X_train_scaled
    
    print("1. Training Realistic CIBIL Model (RandomForestRegressor)...")
    cibil_model = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1)
    cibil_model.fit(X_train_scaled, yc_train)
    print(f"   CIBIL RMSE: {np.sqrt(mean_squared_error(yc_test, cibil_model.predict(X_test_scaled))):.2f}")
    
    print("2. Training Goal Feasibility Model (RandomForestClassifier)...")
    goal_class_model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1)
    goal_class_model.fit(X_train_scaled, yg_train)
    print(f"   Goal Accuracy: {accuracy_score(yg_test, goal_class_model.predict(X_test_scaled)):.2f}")
    
    print("3. Training Optimal Savings Model (RandomForestRegressor)...")
    goal_reg_model = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1)
    goal_reg_model.fit(X_train_scaled, yr_train)
    print(f"   Savings RMSE: {np.sqrt(mean_squared_error(yr_test, goal_reg_model.predict(X_test_scaled))):.2f}")
    
    print(f"Saving models to {MODELS_DIR}...")
    joblib.dump(scaler, os.path.join(MODELS_DIR, 'finance_scaler.joblib'))
    joblib.dump(cibil_model, os.path.join(MODELS_DIR, 'realistic_cibil_model.joblib'))
    joblib.dump(goal_class_model, os.path.join(MODELS_DIR, 'goal_class_model.joblib'))
    joblib.dump(goal_reg_model, os.path.join(MODELS_DIR, 'goal_reg_model.joblib'))
    print("All models saved successfully using ONLY real user data.")

if __name__ == "__main__":
    train_models()
