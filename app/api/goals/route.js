import dbConnect from '@/lib/mongodb';
import Goal from '@/models/Goal';
import Transaction from '@/models/Transaction';
import GoalContribution from '@/models/GoalContribution';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const protect = (req) => {
  let token;
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer')) {
    token = authHeader.split(' ')[1];
  }
  if (!token) throw new Error('Not authorized');
  if (!process.env.JWT_SECRET) throw new Error('FATAL: JWT_SECRET environment variable is missing.');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch (error) {
    throw new Error('Not authorized');
  }
};

const getMonthsBetween = (d1, d2) => {
    let months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
};

export async function GET(req) {
  try {
    await dbConnect();
    const userId = protect(req);
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const { searchParams } = new URL(req.url);
    const language = searchParams.get('lang') || 'en';

    // Fetch goals ordered by priority
    const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
    let goals = await Goal.find({ user: userId }).lean();
    goals.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    // Fetch transactions for AI savings calculation (Aggregation for performance)
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
    const categoryExpenses = {};
    const monthsSet = new Set();

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
    const avgMonthlySavings = (totalIncome - totalExpense) / numMonths;

    // Calculate last 3 months average for trend analysis
    const sortedServiceMonths = Array.from(monthsSet).sort().reverse();
    const last3Months = sortedServiceMonths.slice(0, 3);
    let last3Income = 0;
    let last3Expense = 0;
    
    transactions.forEach(t => {
      const mKey = new Date(t.date).toISOString().substring(0, 7);
      if (last3Months.includes(mKey)) {
        if (t.type === 'Income') last3Income += t.amount;
        else last3Expense += t.amount;
      }
    });
    
    const count3 = Math.max(last3Months.length, 1);
    const avgLast3MonthsSavings = (last3Income - last3Expense) / count3;

    // Sort categories to find discretionary spending recommendations
    const sortedCategories = Object.keys(categoryExpenses).sort((a, b) => categoryExpenses[b] - categoryExpenses[a]);
    const topDiscretionary = sortedCategories.find(c => ['Entertainment', 'Shopping', 'Personal Care', 'Food / Dining', 'Miscellaneous'].includes(c));

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

    const savingsRatio = avgMonthlyIncome > 0 ? avgMonthlySavings / avgMonthlyIncome : 0;
    const expenseRatio = avgMonthlyIncome > 0 ? avgMonthlyExpense / avgMonthlyIncome : 1;
    const totalDiscretionary = Object.values(monthlyData).reduce((sum, d) => sum + d.discretionary, 0);
    const spendingRiskScore = totalExpense > 0 ? totalDiscretionary / totalExpense : 0;

    const incomeStdDev = stdDev(incomeArr);
    const expenseStdDev = stdDev(expenseArr);
    const savingsStdDev = stdDev(savingsArr);

    const incomeStability = avgMonthlyIncome > 0 ? Math.max(0, 1 - (incomeStdDev / avgMonthlyIncome)) : 0;
    const expenseVolatility = avgMonthlyExpense > 0 ? Math.min(1, (expenseStdDev / avgMonthlyExpense)) : 0;
    const consistencyScore = Math.abs(avgMonthlySavings) > 0 ? Math.max(0, 1 - (savingsStdDev / Math.abs(avgMonthlySavings))) : 0;
    
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

    const mlPayload = {
        monthly_income: avgMonthlyIncome,
        monthly_expenses: avgMonthlyExpense,
        savings: avgMonthlySavings,
        savings_ratio: savingsRatio,
        expense_ratio: expenseRatio,
        income_stability: incomeStability,
        expense_volatility: expenseVolatility,
        consistency_score: consistencyScore,
        months_active: numMonths,
        spending_risk_score: spendingRiskScore,
        sudden_change_indicators: suddenChange
    };

    const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';
    let mlData = null;
    try {
        const pyResponse = await fetch(`${ML_SERVICE_URL}/predict-finance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mlPayload)
        });
        if (pyResponse.ok) {
            mlData = await pyResponse.json();
            console.log("Goal ML Data Generated:", mlData);
        }
    } catch (e) {
        console.error("ML Backend Unreachable:", e);
    }

    // Fetch all manual contributions for this user
    const contributions = await GoalContribution.aggregate([
        { $match: { user: userObjectId } },
        { $group: { _id: "$goal", total: { $sum: "$amount" } } }
    ]);
    const contributionMap = {};
    contributions.forEach(c => {
        contributionMap[c._id.toString()] = c.total;
    });

    const totalNetSavings = totalIncome - totalExpense;
    let remainingPool = Math.max(totalNetSavings, 0);

    const enrichedGoals = goals.map(goal => {
        const goalId = goal._id.toString();
        const manualSaved = contributionMap[goalId] || 0;

        const now = new Date();
        const targetDate = new Date(goal.targetDate);
        let monthsRemaining = getMonthsBetween(now, targetDate);
        if (monthsRemaining === 0) monthsRemaining = 1; 

        // Automated Savings Allocation based on Priority
        // Since goals are already sorted by priority (High -> Medium -> Low)
        const allocatedAmount = Math.min(remainingPool, Math.max(goal.targetAmount - manualSaved, 0));
        remainingPool -= allocatedAmount;

        const totalSaved = allocatedAmount + manualSaved;
        const amountRemaining = Math.max(goal.targetAmount - totalSaved, 0);
        
        let isRealistic = false;
        let requiredMonthly = amountRemaining / monthsRemaining;
        let recommendedSavings = requiredMonthly;
        let confidence = 0;
        
        if (mlData) {
            isRealistic = mlData.goalAchievable;
            recommendedSavings = mlData.recommendedSavings;
            confidence = mlData.confidence;
        } else {
            isRealistic = avgMonthlySavings >= requiredMonthly;
        }

        const alerts = [];
        const insights = [];

        const formattedRecSavings = new Intl.NumberFormat('en-IN').format(recommendedSavings);
        const formattedReqMonthly = new Intl.NumberFormat('en-IN').format(requiredMonthly);
        const formattedConfidence = (confidence * 100).toFixed(0);

        let translatedCategory = topDiscretionary;
        if (topDiscretionary) {
            const categoryTranslations = {
                hi: {
                    'Entertainment': 'मनोरंजन',
                    'Shopping': 'खरीदारी',
                    'Personal Care': 'व्यक्तिगत देखभाल',
                    'Food / Dining': 'भोजन / डाइनिंग',
                    'Miscellaneous': 'विविध'
                },
                te: {
                    'Entertainment': 'వినోదం',
                    'Shopping': 'షాపింగ్',
                    'Personal Care': 'వ్యక్తిగత సంరక్షణ',
                    'Food / Dining': 'ఆహారం / డైనింగ్',
                    'Miscellaneous': 'ఇతరాలు'
                }
            };
            translatedCategory = categoryTranslations[language]?.[topDiscretionary] || topDiscretionary;
        }

        if (amountRemaining === 0) {
            if (language === 'hi') {
                alerts.push(`🎉 आपने अपना लक्ष्य प्राप्त कर लिया है: ${goal.name}!`);
            } else if (language === 'te') {
                alerts.push(`🎉 మీరు మీ లక్ష్యాన్ని చేరుకున్నారు: ${goal.name}!`);
            } else {
                alerts.push(`🎉 You have reached your goal: ${goal.name}!`);
            }
        } else {
            if (language === 'hi') {
                insights.push(`ML मॉडल आपके वित्तीय व्यवहार के आधार पर प्रति माह ₹${formattedRecSavings} बचाने की सिफारिश करता है।`);
            } else if (language === 'te') {
                insights.push(`ML మోడల్ మీ ఆర్థిక ప్రవర్తన ఆధారంగా నెలకు ₹${formattedRecSavings} ఆదా చేయాలని సిఫార్సు చేస్తోంది.`);
            } else {
                insights.push(`ML Model recommends saving ₹${formattedRecSavings} per month based on your financial behavior.`);
            }
            
            if (isRealistic) {
                if (language === 'hi') {
                    alerts.push(`आप ${goal.name} प्राप्त करने की सही राह पर हैं! (AI विश्वास: ${formattedConfidence}%)`);
                } else if (language === 'te') {
                    alerts.push(`మీరు ${goal.name} సాధించే సరైన మార్గంలో ఉన్నారు! (AI విశ్వాసం: ${formattedConfidence}%)`);
                } else {
                    alerts.push(`You are on track to achieve ${goal.name}! (AI Confidence: ${formattedConfidence}%)`);
                }
            } else {
                if (language === 'hi') {
                    alerts.push(`आप ${goal.name} में पीछे चल रहे हैं। आपकी आवश्यक बचत (₹${formattedReqMonthly}) आपकी ML-अनुमानित क्षमता से अधिक है।`);
                } else if (language === 'te') {
                    alerts.push(`మీరు ${goal.name} లో వెనుకబడి ఉన్నారు. మీ అవసరమైన పొదుపు (₹${formattedReqMonthly}) మీ ML-అంచనా సామర్థ్యం కంటే ఎక్కువగా ఉంది.`);
                } else {
                    alerts.push(`You are falling behind on ${goal.name}. Your required savings (₹${formattedReqMonthly}) exceeds your ML-predicted capability.`);
                }
                
                if (topDiscretionary) {
                    const topAvg = categoryExpenses[topDiscretionary] / numMonths;
                    const formattedTopAvg = new Intl.NumberFormat('en-IN').format(topAvg);
                    if (language === 'hi') {
                        insights.push(`सुझाव: सही राह पर रहने के लिए अपने '${translatedCategory}' खर्च (वर्तमान में औसत ₹${formattedTopAvg}/माह) को कम करने का प्रयास करें।`);
                    } else if (language === 'te') {
                        insights.push(`చిట్కా: సరైన మార్గంలో ఉండటానికి మీ '${translatedCategory}' ఖర్చును (ప్రస్తుతం సగటున నెలకు ₹${formattedTopAvg}) తగ్గించడానికి ప్రయత్నించండి.`);
                    } else {
                        insights.push(`Tip: Try reducing your '${translatedCategory}' spending (currently averaging ₹${formattedTopAvg}/mo) to stay on track.`);
                    }
                }
            }
        }

        return {
            ...goal,
            savedAmount: totalSaved,
            autoSaved: allocatedAmount,
            manualSaved: manualSaved,
            progress: (totalSaved / goal.targetAmount) * 100,
            monthsRemaining,
            requiredMonthly,
            avgMonthlySavings,
            isRealistic,
            recommendedSavings,
            confidence,
            alerts,
            insights
        };
    });

    return new Response(JSON.stringify({ 
      success: true, 
      data: enrichedGoals, 
      avgMonthlySavings: Math.max(avgMonthlySavings, 0),
      avgLast3MonthsSavings,
      totalNetSavings: Math.max(totalNetSavings, 0)
    }), { status: 200 });
  } catch (error) {
    console.error("GOALS_GET_ERROR:", error);
    const status = error.message.includes('authorized') ? 401 : 500;
    return new Response(JSON.stringify({ success: false, error: error.message }), { status });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const userId = protect(req);
    const data = await req.json();
    data.user = userId;

    const goal = await Goal.create(data);
    return new Response(JSON.stringify({ success: true, data: goal }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 400 });
  }
}

export async function PUT(req) {
    try {
      await dbConnect();
      const userId = protect(req);
      const data = await req.json();
      
      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');
      if (!id) return new Response(JSON.stringify({ success: false, error: 'Missing ID' }), { status: 400 });

      // If user is adding manual contributions
      if (data.addContribution) {
          const goal = await Goal.findOne({ _id: id, user: userId });
          if (!goal) return new Response(JSON.stringify({ success: false, error: 'Goal not found' }), { status: 404 });
          
          await GoalContribution.create({
            user: userId,
            goal: id,
            amount: Number(data.addContribution),
            note: data.note || 'Manual contribution'
          });

          return new Response(JSON.stringify({ success: true }), { status: 200 });
      } else {
          // Standard update
          const goal = await Goal.findOneAndUpdate({ _id: id, user: userId }, data, { new: true });
          return new Response(JSON.stringify({ success: true, data: goal }), { status: 200 });
      }
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), { status: 400 });
    }
}

export async function DELETE(req) {
    try {
      await dbConnect();
      const userId = protect(req);
      
      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');
      if (!id) return new Response(JSON.stringify({ success: false, error: 'Missing ID' }), { status: 400 });
  
      await Goal.findOneAndDelete({ _id: id, user: userId });
      return new Response(JSON.stringify({ success: true, data: {} }), { status: 200 });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), { status: 400 });
    }
}
