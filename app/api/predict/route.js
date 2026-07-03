import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import jwt from 'jsonwebtoken';
import { generateInsights } from '@/lib/ml/gemini_engine';

const protect = (req) => {
  let token;
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer')) token = authHeader.split(' ')[1];
  if (!token) throw new Error('Not authorized');
  return jwt.verify(token, process.env.JWT_SECRET);
};

const translatePythonInsights = (insights, language) => {
  if (!insights) return [];
  return insights.map(ins => {
    const match = ins.match(/High spending detected in (.+?) \(Total: (.+?)\)/);
    if (match) {
      const cat = match[1];
      const total = parseFloat(match[2]).toLocaleString('en-IN');
      const categoryTranslations = {
        hi: {
            'Rent / Housing': 'किराया / आवास',
            'Groceries': 'किराना',
            'Food / Dining': 'भोजन / डाइनिंग',
            'Utility Bills': 'उपयोगिता बिल',
            'Insurance': 'बीमा',
            'EMI / Loans': 'ईएमआई / ऋण',
            'Shopping': 'खरीदारी',
            'Healthcare': 'स्वास्थ्य सेवा',
            'Entertainment': 'मनोरंजन',
            'Miscellaneous': 'विविध',
            'Personal Care': 'व्यक्तिगत देखभाल'
        },
        te: {
            'Rent / Housing': 'ఇంటి అద్దె / గృహం',
            'Groceries': 'కిరాణా సరుకులు',
            'Food / Dining': 'ఆహారం / డైనింగ్',
            'Utility Bills': 'ఉపయోగిత బిల్లులు',
            'Insurance': 'భీమా',
            'EMI / Loans': 'EMI / రుణాలు',
            'Shopping': 'షాపింగ్',
            'Healthcare': 'ఆరోగ్య సంరక్షణ',
            'Entertainment': 'వినోదం',
            'Miscellaneous': 'ఇతరములు',
            'Personal Care': 'వ్యక్తిగత సంరక్షణ'
        }
      };
      const translatedCat = categoryTranslations[language]?.[cat] || cat;
      if (language === 'hi') {
        return `'${translatedCat}' में उच्च व्यय का पता चला (कुल: ₹${total})`;
      } else if (language === 'te') {
        return `'${translatedCat}' లో అధిక వ్యయం గుర్తించబడింది (మొత్తం: ₹${total})`;
      } else {
        return `High spending detected in '${translatedCat}' (Total: ₹${total})`;
      }
    }
    return ins;
  });
};

const translatePythonSavingPlan = (savingPlan, language) => {
  if (!savingPlan) return [];
  return savingPlan.map(plan => {
    const match = plan.match(/Reduce (.+?) expenses by 15-20% to save approximately (.+?)/);
    if (match) {
      const cat = match[1];
      const savings = parseFloat(match[2]).toLocaleString('en-IN');
      const categoryTranslations = {
        hi: {
            'Rent / Housing': 'किराया / आवास',
            'Groceries': 'किराना',
            'Food / Dining': 'भोजन / डाइनिंग',
            'Utility Bills': 'उपयोगिता बिल',
            'Insurance': 'बीमा',
            'EMI / Loans': 'ईएमआई / ऋण',
            'Shopping': 'खरीदारी',
            'Healthcare': 'स्वास्थ्य सेवा',
            'Entertainment': 'मनोरंजन',
            'Miscellaneous': 'विविध',
            'Personal Care': 'व्यक्तिगत देखभाल'
        },
        te: {
            'Rent / Housing': 'ఇంటి అద్దె / గృహం',
            'Groceries': 'కిరాణా సరుకులు',
            'Food / Dining': 'ఆహారం / డైనింగ్',
            'Utility Bills': 'ఉపయోగిత బిల్లులు',
            'Insurance': 'భీమా',
            'EMI / Loans': 'EMI / రుణాలు',
            'Shopping': 'షాపింగ్',
            'Healthcare': 'ఆరోగ్య సంరక్షణ',
            'Entertainment': 'వినోదం',
            'Miscellaneous': 'ఇతరములు',
            'Personal Care': 'వ్యక్తిగత సంరక్షణ'
        }
      };
      const translatedCat = categoryTranslations[language]?.[cat] || cat;
      if (language === 'hi') {
        return `लगभग ₹${savings} बचाने के लिए '${translatedCat}' खर्चों में 15-20% की कटौती करें`;
      } else if (language === 'te') {
        return `సుమారు ₹${savings} ఆదా చేయడానికి '${translatedCat}' ఖర్చులను 15-20% తగ్గించండి`;
      } else {
        return `Reduce '${translatedCat}' expenses by 15-20% to save approximately ₹${savings}`;
      }
    }
    return plan;
  });
};

export async function POST(req) {
  try {
    await dbConnect();
    const user = protect(req);
    const { role, month, year, language } = await req.json();

    // Fetch user transactions from MongoDB
    let filter = { user: user.id };
    if (month && year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
        filter.date = { $gte: startDate, $lte: endDate };
    }
    const transactions = await Transaction.find(filter);

    if (!transactions || transactions.length < 5) {
      return Response.json({ 
        success: false, 
        error: 'Insufficient data for AI Financial Guardian',
        details: 'Please log at least 5 transactions for the selected period.' 
      }, { status: 400 });
    }

    console.log("INSIGHTS API: REQUEST RECEIVED FROM USER:", user.id, "PERIOD:", month, year);
    console.log("API KEY EXISTS:", !!process.env.GEMINI_API_KEY);

    // Build context for Gemini based on real transaction data
    const expenses = transactions.filter(t => t.type === 'Expense');
    const incomes = transactions.filter(t => t.type === 'Income');
    
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate real mathematical averages based on days of data for strict fallback
    let fallbackPredictedExpense = 0;
    let daysDiff = 1;
    let monthsOfData = 1;
    
    if (expenses.length > 0) {
        const sortedExpenses = [...expenses].sort((a, b) => new Date(a.date) - new Date(b.date));
        const firstDate = new Date(sortedExpenses[0].date);
        const lastDate = new Date(sortedExpenses[sortedExpenses.length - 1].date);
        daysDiff = Math.max(1, Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24)));
        monthsOfData = Math.max(1, Math.round(daysDiff / 30));
        const dailyAverage = totalExpenses / daysDiff;
        fallbackPredictedExpense = dailyAverage * 30; // 30-day projection based on real historical average
    }

    // Simple heuristic for safe limit if not provided
    const safeLimit = totalIncome > 0 ? totalIncome * 0.8 : totalExpenses * 1.2;

    let fallbackDailyExpenses = [];
    if (expenses.length > 0) {
       const dailyAverage = fallbackPredictedExpense / 30;
       for (let i = 1; i <= 7; i++) {
           let d = new Date();
           d.setDate(d.getDate() + i);
           // add some slight randomness to the projection
           let amt = dailyAverage * (0.8 + Math.random() * 0.4);
           fallbackDailyExpenses.push({
               date: d.toISOString().split('T')[0],
               amount: Math.round(amt)
           });
       }
    }

    // Call the FastAPI ML Service
    const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';
    
    const mlPredictionPromise = fetch(`${ML_SERVICE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: user.id,
        month: month ? parseInt(month) : null,
        year: year ? parseInt(year) : null
      }),
    });

    // Timeout protection for ML Service
    const mlTimeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('ML service is currently unavailable or timed out')), 5000)
    );

    let mlResult = null;
    try {
      const mlResponse = await Promise.race([mlPredictionPromise, mlTimeoutPromise]);
      if (mlResponse.ok) {
        mlResult = await mlResponse.json();
      } else {
        console.warn("ML Service error response:", await mlResponse.text());
      }
    } catch (mlError) {
      console.warn("ML Service unavailable, falling back to real mathematical projection:", mlError.message);
    }

    const predictedExpense = mlResult?.predicted_expense || fallbackPredictedExpense;
    
    // Dynamic real confidence scoring (0-100)
    const txVolumeScore = Math.min(50, (transactions.length / 100) * 50); // Up to 50 points for volume
    const timeframeScore = Math.min(45, (monthsOfData / 6) * 45); // Up to 45 points for history length
    const confidencePercentage = Math.round(txVolumeScore + timeframeScore);
    
    let confidence = "LOW";
    if (confidencePercentage >= 75) confidence = "HIGH";
    else if (confidencePercentage >= 40) confidence = "MEDIUM";

    const anomalyDetected = mlResult?.anomaly_detected || false;
    const modelUsedEngine = mlResult?.reasoning ? mlResult.reasoning[0] : "Historical Mathematical Average (Fallback)";
    const mlWarning = mlResult?.warning || "";
    const explainability = mlResult?.explainability || [];

    const predictionContext = {
      budget_status: {
        safeLimit: safeLimit,
        remainingBalance: safeLimit - predictedExpense,
        status: predictedExpense > safeLimit ? "OVERSPENDING" : "SAFE",
        usagePercentage: (predictedExpense / safeLimit) * 100,
        dailySafeSpend: safeLimit / 30
      },
      behavior_profile: {
        healthScore: Math.min(100, Math.max(0, (totalIncome - predictedExpense) / (totalIncome || 1) * 100)),
        growthRate: 0, // Reset to 0 as we don't have enough history for real trend in a single request
        savingsRate: totalIncome > 0 ? ((totalIncome - predictedExpense) / totalIncome * 100) : 0,
        anomalies: anomalyDetected ? ["Unusual spending detected by ML model"] : [],
        riskScore: predictedExpense > safeLimit ? "MEDIUM" : "LOW",
        explanations: explainability
      },
      current_month_data: {
        income: totalIncome,
        expenses: totalExpenses,
        balance: totalIncome - totalExpenses
      }
    };

    // Timeout protection for Gemini
    const geminiTimeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI service is currently unavailable or timed out')), 15000)
    );

    try {
      const insightsPromise = generateInsights(predictionContext, role || "User", 0.9, language);
      const aiResult = await Promise.race([insightsPromise, geminiTimeoutPromise]);
      
      console.log("INSIGHTS API: GEMINI RESPONSE RECEIVED");

      return Response.json({ 
        success: true, 
        data: {
            predicted_expense: predictedExpense,
            predicted_daily_expenses: mlResult?.predicted_daily_expenses || fallbackDailyExpenses,
            confidence: confidence,
            anomaly_detected: anomalyDetected,
            warning: mlWarning || aiResult.risk_alerts?.[0] || "",
            recommended_budget: mlResult?.recommended_budget || safeLimit,
            budget_status: predictionContext.budget_status.status,
            health_score: Math.round(predictionContext.behavior_profile.healthScore),
            insights: mlResult?.insights ? [...translatePythonInsights(mlResult.insights, language), ...(aiResult.action_plan || [])] : (aiResult.action_plan || []),
            saving_plan: mlResult?.saving_plan ? [...translatePythonSavingPlan(mlResult.saving_plan, language), ...(aiResult.savings_opportunities || [])] : (aiResult.savings_opportunities || []),
            explainability: explainability,
            transparency_panel: {
              total_transactions: transactions.length,
              months_history: monthsOfData,
              last_refresh: new Date().toISOString(),
              confidence_score: confidencePercentage,
              data_quality: confidencePercentage >= 75 ? "Excellent" : confidencePercentage >= 40 ? "Good" : "Needs More Data",
              model_engine: modelUsedEngine
            },
            reasoning: [
               aiResult.guardian_summary,
               `Scan confidence: ${confidencePercentage}% based on data volume`,
               `Prediction Engine: ${modelUsedEngine}`,
               `Prediction generated from ${transactions.length} real transactions over the last ${monthsOfData} months.`
            ],
            last_updated: new Date().toISOString()
        }
      }, { status: 200 });

    } catch (aiError) {
      console.error("GEMINI ERROR:", aiError);
      
      // If Gemini fails but ML service succeeded, still return ML data
      if (mlResult) {
          return Response.json({
              success: true,
              data: {
                  ...mlResult,
                  reasoning: mlResult.reasoning || ["ML Prediction Successful, Insights AI failed"],
                  warning: "AI insights generation failed. Displaying core prediction models.",
                  last_updated: new Date().toISOString()
              }
          }, { status: 200 });
      }

      return Response.json({ 
        success: false, 
        error: 'AI analysis failed',
        details: aiError.message.includes('timeout') ? 'AI service timed out. Try again.' : aiError.message
      }, { status: aiError.message.includes('timeout') ? 504 : 500 });
    }

  } catch (error) {
    console.error("FULL ERROR:", error);
    return Response.json({ 
      success: false, 
      error: 'Internal system error during prediction',
      details: error.message 
    }, { status: 500 });
  }
}
