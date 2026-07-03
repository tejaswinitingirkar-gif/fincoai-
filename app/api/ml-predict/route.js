import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import jwt from 'jsonwebtoken';

const protect = (req) => {
  let token;
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer')) {
    token = authHeader.split(' ')[1];
  }
  if (!token) throw new Error('Not authorized');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch (error) {
    throw new Error('Not authorized');
  }
};

export async function GET(req) {
  try {
    await dbConnect();
    const userId = protect(req);

    const transactions = await Transaction.find({ user: userId });
    
    // Calculate features
    let totalIncome = 0;
    let totalExpense = 0;
    
    transactions.forEach(t => {
      if (t.type === 'Income') totalIncome += t.amount;
      else if (t.type === 'Expense') totalExpense += t.amount;
    });

    // Determine how many months of data we have to get monthly averages
    const months = new Set(transactions.map(t => new Date(t.date).toISOString().substring(0, 7))).size;
    const numMonths = Math.max(1, months);

    let monthlyIncome = totalIncome / numMonths;
    let monthlyExpenses = totalExpense / numMonths;

    // If no data, return error instead of fallbacks
    if (transactions.length < 5) {
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Insufficient financial data",
            message: "Add at least 5 transactions to unlock your AI prediction."
        }), { status: 400 });
    }

    const savingsAmount = monthlyIncome - monthlyExpenses;
    const savingsRatio = monthlyIncome > 0 ? savingsAmount / monthlyIncome : 0;
    const expenseRatio = monthlyIncome > 0 ? monthlyExpenses / monthlyIncome : 1;
    
    // Standard Deviation Helper
    const stdDev = (arr) => {
        if (arr.length <= 1) return 0;
        const mean = arr.reduce((a,b) => a+b, 0) / arr.length;
        const variance = arr.reduce((a,b) => a + Math.pow(b - mean, 2), 0) / (arr.length - 1);
        return Math.sqrt(variance);
    };

    // Calculate advanced metrics for ML input
    const incomeArr = [];
    const expenseArr = [];
    const savingsArr = [];
    const monthlyData = {};

    transactions.forEach(t => {
      const monthKey = new Date(t.date).toISOString().substring(0, 7);
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expense: 0, discretionary: 0 };
      }
      if (t.type === 'Income') monthlyData[monthKey].income += t.amount;
      else {
        monthlyData[monthKey].expense += t.amount;
        if (!['Rent / Housing', 'Groceries', 'Utility Bills', 'Insurance', 'Taxes', 'EMI / Loans'].includes(t.category)) {
          monthlyData[monthKey].discretionary += t.amount;
        }
      }
    });

    Object.values(monthlyData).forEach(d => {
      incomeArr.push(d.income);
      expenseArr.push(d.expense);
      savingsArr.push(d.income - d.expense);
    });

    const totalDiscretionary = Object.values(monthlyData).reduce((sum, d) => sum + d.discretionary, 0);
    const spendingRiskScore = totalExpense > 0 ? totalDiscretionary / totalExpense : 0;

    const incomeStdDev = stdDev(incomeArr);
    const expenseStdDev = stdDev(expenseArr);
    const savingsStdDev = stdDev(savingsArr);

    const incomeStability = monthlyIncome > 0 ? Math.max(0, 1 - (incomeStdDev / monthlyIncome)) : 0;
    const expenseVolatility = monthlyExpenses > 0 ? Math.min(1, (expenseStdDev / monthlyExpenses)) : 0;
    const consistencyScore = Math.abs(savingsAmount) > 0 ? Math.max(0, 1 - (savingsStdDev / Math.abs(savingsAmount))) : 0;

    let suddenChange = 0;
    if (numMonths >= 2) {
      const monthsSorted = Object.keys(monthlyData).sort();
      const current = monthlyData[monthsSorted[numMonths - 1]];
      const prev = monthlyData[monthsSorted[numMonths - 2]];
      const prevIncome = prev.income || 1;
      const prevExpense = prev.expense || 1;
      const incomeChangePct = Math.abs((current.income - prev.income) / prevIncome);
      const expenseChangePct = Math.abs((current.expense - prev.expense) / prevExpense);
      if (incomeChangePct > 0.3 || expenseChangePct > 0.3) suddenChange = 1;
    }

    const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

    // Call ML Python Service
    const mlPayload = {
      monthly_income: monthlyIncome,
      monthly_expenses: monthlyExpenses,
      savings: savingsAmount,
      savings_ratio: savingsRatio,
      expense_ratio: expenseRatio,
      income_stability: incomeStability,
      expense_volatility: expenseVolatility,
      consistency_score: consistencyScore,
      months_active: numMonths,
      spending_risk_score: spendingRiskScore,
      sudden_change_indicators: suddenChange
    };

    const pyResponse = await fetch(`${ML_SERVICE_URL}/predict-finance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mlPayload)
    });

    if (!pyResponse.ok) {
        throw new Error('Failed to get prediction from ML service');
    }

    const predictionData = await pyResponse.json();

    return new Response(JSON.stringify({ 
        success: true, 
        data: predictionData,
        features_used: mlPayload
    }), { status: 200 });

  } catch (error) {
    console.error("ML Predict API Error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
