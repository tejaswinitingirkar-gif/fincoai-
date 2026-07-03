import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Cibil from '@/models/Cibil';
import Transaction from '@/models/Transaction';
import jwt from 'jsonwebtoken';

// Helper to safely extract user from JWT
const getUserId = (req) => {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch (err) {
    console.warn("Auth check failed:", err.message);
    return null;
  }
};

export async function GET(req) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] CIBIL GET: Fetching credit score`);

  try {
    await dbConnect();
    
    // Get userId from Query Params or JWT
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || getUserId(req);

    if (!userId) {
      console.warn(`[${timestamp}] CIBIL ERROR: Missing userId`);
      return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 });
    }

    // Fetch user transactions
    const transactions = await Transaction.find({ user: userId });
    console.log(`[${timestamp}] DATA_FETCH: Found ${transactions?.length || 0} transactions for user ${userId}`);

    // If no transactions, check if a score already exists in DB
    const existingCibil = await Cibil.findOne({ user: userId });

    if (!transactions || transactions.length < 5) {
      if (existingCibil) {
        return NextResponse.json({ 
          success: true, 
          data: {
            creditScore: existingCibil.score,
            category: existingCibil.score >= 750 ? 'Excellent' : existingCibil.score >= 650 ? 'Good' : existingCibil.score >= 550 ? 'Average' : 'Poor',
            lastUpdated: existingCibil.lastUpdated
          }
        }, { status: 200 });
      }
      return NextResponse.json({ 
        success: false, 
        message: 'Insufficient financial data for credit assessment. Please log at least 5 transactions.' 
      }, { status: 404 });
    }

    // Calculate Income and Expenses safely
    let income = 0;
    let expenses = 0;

    transactions.forEach(t => {
      const amount = Number(t.amount) || 0;
      if (t.type === 'Income') income += amount;
      else if (t.type === 'Expense') expenses += amount;
    });

    console.log(`[${timestamp}] USER DATA: income=${income}, expenses=${expenses}`);

    // Robust CIBIL Calculation (Safe defaults)
    // Formula: 300 + Math.min(550, Math.floor((income - expenses) / 100))
    const savings = income - expenses;
    let calculatedScore = 300 + Math.min(550, Math.floor(savings / 100));
    
    // Ensure score is within valid CIBIL range (300 - 900)
    calculatedScore = Math.max(300, Math.min(900, calculatedScore));

    // Handle NaN
    if (isNaN(calculatedScore)) {
        return NextResponse.json({ success: false, message: 'Could not calculate score from current data' }, { status: 400 });
    }

    console.log(`[${timestamp}] CIBIL SUCCESS: Calculated Score = ${calculatedScore}`);

    return NextResponse.json({
      success: true,
      data: {
        creditScore: calculatedScore,
        category: calculatedScore >= 750 ? 'Excellent' : calculatedScore >= 650 ? 'Good' : calculatedScore >= 550 ? 'Average' : 'Poor',
        lastUpdated: new Date().toISOString()
      }
    }, { status: 200 });

  } catch (error) {
    console.error(`[${timestamp}] CIBIL ERROR:`, error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

export async function POST(req) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] CIBIL POST: Updating/Creating credit score`);

  try {
    await dbConnect();

    let body;
    try {
      body = await req.json();
      console.log(`[${timestamp}] CIBIL REQUEST:`, body);
    } catch (e) {
      return NextResponse.json({ success: false, message: 'Invalid JSON body' }, { status: 400 });
    }

    const { userId, score, creditLimit, creditUsed } = body;

    if (!userId) {
      return NextResponse.json({ success: false, message: 'userId is required' }, { status: 400 });
    }

    // Update or Create CIBIL record
    const updatedCibil = await Cibil.findOneAndUpdate(
      { user: userId },
      { 
        score: score, 
        creditLimit: creditLimit, 
        creditUsed: creditUsed,
        lastUpdated: new Date()
      },
      { upsert: true, new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      data: {
        creditScore: updatedCibil.score,
        category: updatedCibil.score >= 750 ? 'Excellent' : updatedCibil.score >= 650 ? 'Good' : updatedCibil.score >= 550 ? 'Average' : 'Poor',
        lastUpdated: updatedCibil.lastUpdated
      }
    }, { status: 200 });

  } catch (error) {
    console.error(`[${timestamp}] CIBIL ERROR:`, error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to update credit score',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
