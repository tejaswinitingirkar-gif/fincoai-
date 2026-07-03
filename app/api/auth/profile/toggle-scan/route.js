import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
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

export async function POST(req) {
  try {
    await dbConnect();
    const userId = protect(req);

    const { enabled } = await req.json();
    if (typeof enabled !== 'boolean') {
      return Response.json({ success: false, error: 'Invalid Input', details: 'Enabled status must be boolean' }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(userId, { scan_auto_expense_enabled: enabled }, { new: true });

    if (!user) {
      return Response.json({ success: false, error: 'User not found', details: 'Profile could not be updated.' }, { status: 404 });
    }

    return Response.json({ 
      success: true, 
      enabled: user.scan_auto_expense_enabled 
    }, { status: 200 });

  } catch (error) {
    console.error("FULL ERROR:", error);
    return Response.json({ 
      success: false, 
      error: 'Profile toggle failed',
      details: error.message 
    }, { status: error.message === 'Not authorized' ? 401 : 500 });
  }
}
