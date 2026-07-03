import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const protect = (req) => {
  let token;
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer')) token = authHeader.split(' ')[1];
  if (!token) throw new Error('Not authorized');
  
  const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_for_dev_only_change_in_prod';
  return jwt.verify(token, jwtSecret);
};

export async function POST(req) {
  try {
    await dbConnect();
    const decoded = protect(req);
    
    const { role } = await req.json();

    if (!['Employee', 'Homemaker', 'Student', 'Freelancer / Self-Employed', 'Other'].includes(role)) {
       return NextResponse.json({ success: false, error: 'Invalid role selected' }, { status: 400 });
    }

    const user = await User.findById(decoded.id);
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    user.role = role;
    await user.save();

    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_for_dev_only_change_in_prod';

    // Create a new token with the updated role
    const token = jwt.sign({ id: user._id, role: user.role }, jwtSecret, {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    });

    return NextResponse.json({ 
      success: true, 
      token, 
      user: { id: user._id, name: user.name, role: user.role } 
    }, { status: 200 });
  } catch (error) {
    console.error("Update Role Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 401 });
  }
}
