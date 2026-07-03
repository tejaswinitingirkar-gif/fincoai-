import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import Goal from '@/models/Goal';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { chatWithFinancialAdvisor } from '@/lib/ml/gemini_engine';

const protect = (req) => {
  let token;
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer')) token = authHeader.split(' ')[1];
  if (!token) throw new Error('Not authorized');
  return jwt.verify(token, process.env.JWT_SECRET);
};

export async function POST(req) {
  try {
    await dbConnect();
    const user = protect(req);
    const { messages, language } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ success: false, error: 'Invalid messages array' }, { status: 400 });
    }

    // Fetch user context
    const transactions = await Transaction.find({ user: user.id }).sort({ date: -1 });
    
    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryTotals = {};
    const recentTransactions = transactions.slice(0, 10).map(t => ({
      amount: t.amount,
      category: t.category,
      type: t.type,
      date: t.date.toISOString().split('T')[0]
    }));

    transactions.forEach(t => {
      if (t.type === 'Income') {
        totalIncome += t.amount;
      } else {
        totalExpenses += t.amount;
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      }
    });

    const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    const topCategories = sortedCategories.slice(0, 3).map(([cat, amt]) => `${cat} (₹${amt})`);

    // Fetch goals
    const goals = await Goal.find({ user: user.id });
    const activeGoals = goals.map(g => ({
      name: g.name,
      target: g.targetAmount,
      saved: g.savedAmount + g.manualContributions,
      remaining: g.targetAmount - (g.savedAmount + g.manualContributions),
      deadline: g.targetDate.toISOString().split('T')[0]
    }));
    
    // Fetch user details
    const dbUser = await User.findById(user.id);
    
    const userContext = {
      name: dbUser?.name || 'User',
      role: dbUser?.role || 'User',
      income: totalIncome,
      expenses: totalExpenses,
      balance: totalIncome - totalExpenses,
      topCategories: topCategories,
      recentTransactions: recentTransactions,
      goals: activeGoals
    };

    const reply = await chatWithFinancialAdvisor(messages, userContext, language);

    return Response.json({ success: true, reply }, { status: 200 });

  } catch (error) {
    console.error("Chat API Error:", error);
    return Response.json({ 
      success: false, 
      error: 'Failed to process chat query',
      details: error.message 
    }, { status: 500 });
  }
}
