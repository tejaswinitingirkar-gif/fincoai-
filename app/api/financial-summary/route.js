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

export async function GET(req) {
  try {
    await dbConnect();
    const userId = protect(req);
    const userObjectId = new mongoose.Types.ObjectId(userId);

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

    return Response.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        netSavings: totalIncome - totalExpense
      }
    }, { status: 200, headers: { 'Cache-Control': 'no-store' } });

  } catch (error) {
    console.error("FINANCIAL_SUMMARY_ERROR:", error);
    return Response.json({ success: false, error: "Failed to fetch summary" }, { status: 401 });
  }
}
