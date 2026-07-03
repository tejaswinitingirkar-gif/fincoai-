import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function GET(req) {
  try {
    await dbConnect();
    
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return new Response(JSON.stringify({ success: false, error: 'User not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ 
        success: true, 
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            scan_auto_expense_enabled: user.scan_auto_expense_enabled
        } 
    }), { status: 200 });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Server Error' }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { name, email } = await req.json();

    const user = await User.findById(decoded.id);
    if (!user) {
      return new Response(JSON.stringify({ success: false, error: 'User not found' }), { status: 404 });
    }

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    return new Response(JSON.stringify({ 
        success: true, 
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            scan_auto_expense_enabled: user.scan_auto_expense_enabled
        } 
    }), { status: 200 });
  } catch (error) {
    console.error('Profile update error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Server Error' }), { status: 500 });
  }
}
