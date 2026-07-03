from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import traceback
import os
import joblib
import time
import uuid

# Import local modules
from utils import preprocess_data, detect_anomalies, get_category_insights
from dl_model import get_model_prediction, train_lstm

app = FastAPI(title="Financial Guardian AI Service")

# 1. Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Add Health Check Route
@app.get("/health")
async def health_check():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

class PredictRequest(BaseModel):
    user_id: str
    month: Optional[int] = None
    year: Optional[int] = None

@app.post("/predict")
async def predict(request: PredictRequest):
    print(f"[{datetime.now()}] Incoming request for user: {request.user_id}, month: {request.month}, year: {request.year}")
    try:
        user_id = request.user_id
        month = request.month
        year = request.year
        
        from db import get_user_transactions
        df = get_user_transactions(user_id, month=month, year=year)
        if df.empty:
             raise HTTPException(status_code=400, detail="Insufficient expense data for prediction.")
             
        transactions_dict = df.to_dict('records')
        
        print(f"Processing {len(transactions_dict)} transactions from DB...")
        daily_df, total_income, expenses_df = preprocess_data(transactions_dict)
        
        if daily_df.empty:
            raise HTTPException(status_code=400, detail="Insufficient expense data for prediction.")

        days_count = len(daily_df)

        # 2. Anomaly Detection
        daily_df, anomaly_detected = detect_anomalies(daily_df)

        # 3. Model Prediction (Ensemble: HW + RF + LSTM)
        from ensemble_model import get_ensemble_prediction
        predicted_daily_expenses, model_used, explainability_metrics = get_ensemble_prediction(daily_df, expenses_df, user_id, days_count)
        
        # Calculate sum for the next 7 days for overall status
        total_predicted_7_days = sum(predicted_daily_expenses[:7]) if predicted_daily_expenses else 0
        # Approximate 30-day predicted expense from the forecast
        prediction_val_30 = sum(predicted_daily_expenses[:30]) if predicted_daily_expenses else 0

        # Create structured output for chart
        last_date = daily_df['date'].max()
        daily_predictions = []
        for i, val in enumerate(predicted_daily_expenses[:7]): # Keep UI sending 7 days for the chart
            next_date = last_date + timedelta(days=i+1)
            daily_predictions.append({
                "date": next_date.strftime("%Y-%m-%d"),
                "amount": round(val, 2)
            })

        # 4. Confidence Level
        if days_count < 14 or anomaly_detected:
            confidence = "LOW"
        elif 14 <= days_count <= 30:
            confidence = "MEDIUM"
        else:
            confidence = "HIGH"

        # 5. Warning & Reasoning
        warning = ""
        if anomaly_detected:
            warning = "Unusual spending detected (possible emergency). Prediction adjusted."
        
        reasoning = []
        reasoning.append(f"Model used: {model_used} predicting next 30 days based on {days_count} days of history.")
        reasoning.append(f"Total historical income processed: {total_income:.2f}")

        # 6. Budget Logic
        recommended_budget = prediction_val_30 * 0.9
        
        budget_status = "SAFE"
        if total_income > 0:
            if prediction_val_30 > total_income:
                budget_status = "OVERSPENDING"
            elif prediction_val_30 > total_income * 0.8:
                budget_status = "RISK"
        
        # 7. Insights & Saving Plan
        insights, saving_plan = get_category_insights(expenses_df)
        
        # Additional insights
        avg_daily = daily_df['amount'].mean()
        if daily_df.iloc[-1]['amount'] > avg_daily * 2:
            insights.append("Your daily spending today is more than double your average.")

        return {
            "predicted_expense": round(prediction_val_30, 2), # Maintain backward compatibility with 30-day format
            "predicted_daily_expenses": daily_predictions, # New field for trends
            "confidence": confidence,
            "anomaly_detected": bool(anomaly_detected),
            "warning": warning,
            "recommended_budget": round(recommended_budget, 2),
            "budget_status": budget_status,
            "insights": insights,
            "saving_plan": saving_plan,
            "reasoning": reasoning,
            "explainability": explainability_metrics # Send back advanced explainability
        }

    except Exception as e:
        error_msg = str(e)
        print(f"[{datetime.now()}] ERROR in /predict: {error_msg}")
        print(traceback.format_exc())
        
        # Graceful fallback instead of 500 error
        return {
            "error": error_msg,
            "predicted_expense": 0,
            "predicted_daily_expenses": [],
            "confidence": "LOW",
            "anomaly_detected": False,
            "warning": "Prediction service encountered an error. Showing default values.",
            "recommended_budget": 0,
            "budget_status": "UNKNOWN",
            "insights": ["Error processing prediction"],
            "saving_plan": ["Please try again later"],
            "reasoning": [f"Exception: {error_msg}"],
            "explainability": []
        }

@app.post("/train")
async def train_model(request: PredictRequest, background_tasks: BackgroundTasks):
    """
    Triggers incremental training or full training for a user's DL model.
    Runs as a background task to not block the API.
    """
    def _train_task(uid: str):
        print(f"[{datetime.now()}] Starting background training for user: {uid}")
        try:
            from db import get_user_transactions
            df = get_user_transactions(uid)
            if df.empty: return
            
            daily_df, _, _ = preprocess_data(df.to_dict('records'))
            # Call train_lstm incrementally
            success = train_lstm(daily_df, uid, incremental=True)
            if success:
                print(f"[{datetime.now()}] Successfully trained LSTM model for {uid}")
            else:
                print(f"[{datetime.now()}] Training skipped/failed for {uid}")
        except Exception as e:
            print(f"[{datetime.now()}] ERROR in background training for {uid}: {e}")
            
    background_tasks.add_task(_train_task, request.user_id)
    return {"status": "training_started", "user_id": request.user_id}

class RealisticCibilRequest(BaseModel):
    monthly_income: float
    monthly_expenses: float
    savings: float
    savings_ratio: float
    expense_ratio: float
    income_stability: float
    expense_volatility: float
    consistency_score: float
    months_active: int
    spending_risk_score: float
    sudden_change_indicators: int

@app.post("/predict-finance")
async def predict_finance(request: RealisticCibilRequest):
    try:
        models_dir = os.path.join(os.path.dirname(__file__), 'models')
        scaler = joblib.load(os.path.join(models_dir, 'finance_scaler.joblib'))
        cibil_model = joblib.load(os.path.join(models_dir, 'realistic_cibil_model.joblib'))
        goal_class_model = joblib.load(os.path.join(models_dir, 'goal_class_model.joblib'))
        goal_reg_model = joblib.load(os.path.join(models_dir, 'goal_reg_model.joblib'))
        
        features = np.array([[
            request.monthly_income,
            request.monthly_expenses,
            request.savings,
            request.savings_ratio,
            request.expense_ratio,
            request.income_stability,
            request.expense_volatility,
            request.consistency_score,
            request.months_active,
            request.spending_risk_score,
            request.sudden_change_indicators
        ]])
        
        features_scaled = scaler.transform(features)
        
        predicted_score = int(cibil_model.predict(features_scaled)[0])
        
        # Predict Goal Feasibility & Recommended Savings
        goal_achievable = bool(goal_class_model.predict(features_scaled)[0])
        goal_class_prob = float(goal_class_model.predict_proba(features_scaled)[0].max())
        recommended_savings = float(goal_reg_model.predict(features_scaled)[0])
        
        return {
            "predicted_score": predicted_score,
            "goalAchievable": goal_achievable,
            "recommendedSavings": recommended_savings,
            "confidence": goal_class_prob
        }
    except Exception as e:
        print(f"Error in /predict-finance: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

class FaceVerifyRequest(BaseModel):
    frames: List[str]
    reference_embedding: Optional[List[float]] = None

@app.post("/face-verify")
async def verify_face(request: FaceVerifyRequest):
    try:
        from face_api import process_frames, compare_embeddings, SIMILARITY_THRESHOLD

        # Generate live embedding from submitted frames
        current_embedding = process_frames(request.frames)

        if request.reference_embedding:
            ref = request.reference_embedding

            # Dimension validation — force re-registration if mismatch
            if len(ref) != 512 or len(current_embedding) != 512:
                return {
                    "verified": False,
                    "needs_reregistration": True,
                    "error": "Biometric data is outdated. Please re-register your Face ID.",
                    "similarity": 0.0,
                }

            similarity = compare_embeddings(current_embedding, ref)
            verified = similarity >= SIMILARITY_THRESHOLD

            print(f"[FaceVerify] Similarity: {similarity:.4f} | Threshold: {SIMILARITY_THRESHOLD} | Verified: {verified}")

            return {
                "verified": verified,
                "similarity": round(similarity, 4),
                "confidence": round(similarity, 4),
                "embedding": current_embedding,
                "needs_reregistration": False,
            }
        else:
            # Registration mode — just return the embedding
            return {
                "verified": False,
                "similarity": 0.0,
                "confidence": 1.0,
                "embedding": current_embedding,
                "needs_reregistration": False,
            }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except ImportError as ie:
        raise HTTPException(status_code=503, detail=f"Face recognition service unavailable: {str(ie)}")
    except Exception as e:
        print(f"Error in /face-verify: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

class FaceRegisterRequest(BaseModel):
    frames: List[str]

@app.post("/face-register")
async def register_face(request: FaceRegisterRequest):
    try:
        from face_api import process_frames, EMBEDDING_DIM
        embedding = process_frames(request.frames)

        if len(embedding) != EMBEDDING_DIM:
            raise HTTPException(
                status_code=500,
                detail=f"Model returned {len(embedding)}-d embedding. Expected {EMBEDDING_DIM}-d."
            )

        return {
            "success": True,
            "embedding": embedding,
            "dimensions": len(embedding),
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except ImportError as ie:
        raise HTTPException(status_code=503, detail=f"Face recognition service unavailable: {str(ie)}")
    except Exception as e:
        print(f"Error in /face-register: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
