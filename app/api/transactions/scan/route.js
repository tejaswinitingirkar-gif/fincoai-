import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { scanExpenseFromImage } from '@/lib/ml/gemini_engine';

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

    // 1. Check user settings
    const user = await User.findById(userId);
    if (!user) {
      return new Response(JSON.stringify({ success: false, error: 'User not found' }), { status: 404 });
    }

    if (user.scan_auto_expense_enabled === false) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Auto expense scan is disabled for this user" 
      }), { status: 403 });
    }

    // 2. Extract image data
    const { image, mimeType } = await req.json();
    if (!image) {
      return new Response(JSON.stringify({ success: false, error: 'No image data provided' }), { status: 400 });
    }

    // 3. Call Gemini Engine
    const result = await scanExpenseFromImage(image, mimeType || 'image/jpeg');

    if (result.error) {
      return new Response(JSON.stringify({ success: false, error: result.error }), { status: 200 });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      data: result 
    }), { status: 200 });

  } catch (error) {
    console.error("Scan API Error:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Internal Server Error' 
    }), { status: error.message === 'Not authorized' ? 401 : 500 });
  }
}
