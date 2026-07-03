import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

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

export async function POST(req) {
  try {
    await dbConnect();
    const userId = protect(req);
    const { targetAmount, name } = await req.json();

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 1. Fetch Real Transaction Data
    const summary = await Transaction.aggregate([
      { $match: { user: userObjectId } },
      { 
        $group: { 
          _id: "$type", 
          total: { $sum: "$amount" } 
        } 
      }
    ]);

    let totalIncome = 0;
    let totalExpense = 0;
    summary.forEach(item => {
      if (item._id === 'Income') totalIncome = item.total;
      else if (item._id === 'Expense') totalExpense = item.total;
    });

    const transactions = await Transaction.find({ user: userId });
    const monthsSet = new Set();
    const categoryExpenses = {};

    transactions.forEach(t => {
      const monthKey = new Date(t.date).toISOString().substring(0, 7);
      monthsSet.add(monthKey);
      if (t.type === 'Expense') {
        categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + t.amount;
      }
    });

    const numMonths = Math.max(monthsSet.size, 1);
    const avgMonthlyIncome = totalIncome / numMonths;
    const avgMonthlyExpense = totalExpense / numMonths;
    const avgMonthlySavings = avgMonthlyIncome - avgMonthlyExpense;

    // 2. Forecasting Logic
    let monthsRemaining = Infinity;
    let isFeasible = false;
    let completionDate = null;
    let requiredMonthly = targetAmount; // Default if no time specified, but here we estimate time based on current savings

    if (avgMonthlySavings > 0) {
      monthsRemaining = Math.ceil(targetAmount / avgMonthlySavings);
      isFeasible = true;
      const d = new Date();
      d.setMonth(d.getMonth() + monthsRemaining);
      completionDate = d.toISOString().split('T')[0];
    }

    // 3. AI Insights & Adjustments
    const insights = [];
    const adjustments = [];
    let successProbability = avgMonthlySavings > 0 ? Math.min(95, (avgMonthlySavings / (targetAmount / 12)) * 100) : 5; // Simple heuristic for prob

    if (!isFeasible || monthsRemaining > 60) {
      insights.push(`Your current savings rate (₹${avgMonthlySavings.toFixed(0)}/mo) makes reaching this goal difficult in the short term.`);
      successProbability = Math.max(successProbability - 30, 10);
    } else {
      insights.push(`On track! Based on your last ${numMonths} months of behavior.`);
    }

    // Discretionary Spending Analysis
    const discretionaryCategories = ['Entertainment', 'Shopping', 'Personal Care', 'Food / Dining', 'Miscellaneous'];
    let totalDiscretionary = 0;
    discretionaryCategories.forEach(cat => {
      if (categoryExpenses[cat]) totalDiscretionary += categoryExpenses[cat];
    });

    const avgDiscretionary = totalDiscretionary / numMonths;
    if (avgDiscretionary > 0) {
      const savingPotential = avgDiscretionary * 0.3;
      adjustments.push(`Reducing discretionary spending by 30% could save you an extra ₹${savingPotential.toFixed(0)} monthly.`);
      
      if (!isFeasible || monthsRemaining > 24) {
          const newSavings = avgMonthlySavings + savingPotential;
          const newMonths = Math.ceil(targetAmount / newSavings);
          insights.push(`If you follow the recommendations, you could reach this goal in ${newMonths} months instead of ${monthsRemaining}.`);
      }
    }

    return Response.json({
      success: true,
      data: {
        avgMonthlySavings,
        avgMonthlyIncome,
        avgMonthlyExpense,
        monthsRemaining: isFinite(monthsRemaining) ? monthsRemaining : '---',
        completionDate,
        isFeasible,
        requiredMonthly: (targetAmount / (monthsRemaining === Infinity ? 12 : monthsRemaining)).toFixed(0),
        successProbability: successProbability.toFixed(0),
        insights,
        adjustments
      }
    }, { status: 200 });

  } catch (error) {
    console.error("GOAL_PREDICTION_ERROR:", error);
    return Response.json({ success: false, error: error.message }, { status: 400 });
  }
}
