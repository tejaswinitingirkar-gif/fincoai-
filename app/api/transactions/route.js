import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import jwt from 'jsonwebtoken';
import { categorizeExpense } from '@/lib/ml/gemini_engine';

// Protect routes middleware manually
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

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const pastMonths = searchParams.get('pastMonths'); // For AI prediction logic

    let query = { user: userId };
    if (type) query.type = type;
    if (pastMonths) {
      const d = new Date();
      d.setMonth(d.getMonth() - parseInt(pastMonths));
      query.date = { $gte: d };
    }

    const transactions = await Transaction.find(query).sort({ date: -1 });

    return Response.json({ success: true, data: transactions }, { status: 200 });
  } catch (error) {
    console.error("FULL ERROR:", error);
    return Response.json({ success: false, error: "Failed to fetch transactions", details: error.message }, { status: 401 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const userId = protect(req);

    const data = await req.json();
    data.user = userId;

    // Intelligent Automation: NLP Auto-Categorization
    if (data.type === 'Expense' && (!data.category || data.category === 'Miscellaneous' || data.category === 'Other')) {
      try {
        const aiCategory = await categorizeExpense(data.description || data.name, data.amount);
        if (aiCategory && aiCategory !== "Miscellaneous") {
          data.category = aiCategory;
          console.log(`AI Auto-Categorized "${data.description}" as ${aiCategory}`);
        }
      } catch (err) {
        console.warn("AI categorization skipped:", err.message);
      }
    }

    const transaction = await Transaction.create(data);

    // Fire off non-blocking training update for the LSTM model
    const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';
    fetch(`${ML_SERVICE_URL}/train`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId })
    }).catch(err => console.error("ML train trigger error:", err.message));

    return Response.json({ success: true, data: transaction }, { status: 201 });
  } catch (error) {
    console.error("FULL ERROR:", error);
    return Response.json({ success: false, error: "Failed to create transaction", details: error.message }, { status: 401 });
  }
}

export async function PUT(req) {
  try {
    await dbConnect();
    const userId = protect(req);

    const data = await req.json();
    const id = data._id;
    if (!id) return Response.json({ success: false, error: 'Cannot update without ID' }, { status: 400 });
    
    // Don't allow user id to be overridden
    delete data.user;

    const transaction = await Transaction.findOneAndUpdate({ _id: id, user: userId }, data, { new: true });

    if (!transaction) return Response.json({ success: false, error: 'Transaction not found' }, { status: 404 });

    // Trigger ML training
    const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';
    fetch(`${ML_SERVICE_URL}/train`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId })
    }).catch(err => console.error("ML train trigger error:", err.message));

    return Response.json({ success: true, data: transaction }, { status: 200 });
  } catch (error) {
    console.error("FULL ERROR:", error);
    return Response.json({ success: false, error: "Failed to update transaction", details: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await dbConnect();
    const userId = protect(req);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return Response.json({ success: false, error: 'Cannot delete without ID' }, { status: 400 });

    const transaction = await Transaction.findOneAndDelete({ _id: id, user: userId });

    if (!transaction) return Response.json({ success: false, error: 'Transaction not found' }, { status: 404 });

    // Trigger ML training
    const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';
    fetch(`${ML_SERVICE_URL}/train`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId })
    }).catch(err => console.error("ML train trigger error:", err.message));

    return Response.json({ success: true, data: {} }, { status: 200 });
  } catch (error) {
    console.error("FULL ERROR:", error);
    return Response.json({ success: false, error: "Failed to delete transaction", details: error.message }, { status: 500 });
  }
}
