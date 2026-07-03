import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import jwt from 'jsonwebtoken';

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

export async function POST(req) {
  try {
    await dbConnect();
    const userId = protect(req);

    const { transactions } = await req.json();

    if (!transactions || !Array.isArray(transactions)) {
      return Response.json({ success: false, error: "Invalid data format. Expected an array of transactions." }, { status: 400 });
    }

    const results = {
      successful: 0,
      failed: [],
      duplicates: 0,
    };

    const savedTransactions = [];

    for (const txData of transactions) {
      try {
        // Validation
        const amount = parseFloat(txData.amount);
        const date = new Date(txData.date);
        const description = txData.description || '';
        const category = txData.category || 'Uncategorized';
        const type = txData.type || 'Expense';

        if (isNaN(amount)) {
          results.failed.push({ data: txData, reason: "Invalid amount" });
          continue;
        }

        if (isNaN(date.getTime())) {
          results.failed.push({ data: txData, reason: "Invalid date" });
          continue;
        }

        // Duplicate detection
        const existing = await Transaction.findOne({
          user: userId,
          amount,
          date: {
            $gte: new Date(date.setHours(0, 0, 0, 0)),
            $lte: new Date(date.setHours(23, 59, 59, 999))
          },
          description,
          type
        });

        if (existing) {
          results.duplicates++;
          continue;
        }

        const newTx = await Transaction.create({
          user: userId,
          amount,
          date,
          description,
          category,
          type
        });

        savedTransactions.push(newTx);
        results.successful++;
      } catch (err) {
        results.failed.push({ data: txData, reason: err.message });
      }
    }

    // Trigger ML training if any new transactions were added
    if (savedTransactions.length > 0) {
      const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';
      fetch(`${ML_SERVICE_URL}/train`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      }).catch(err => console.error("ML train trigger error:", err.message));
    }

    return Response.json({ 
      success: true, 
      summary: results 
    }, { status: 200 });

  } catch (error) {
    console.error("UPLOAD_ERROR:", error);
    return Response.json({ success: false, error: "Upload failed", details: error.message }, { status: 401 });
  }
}
