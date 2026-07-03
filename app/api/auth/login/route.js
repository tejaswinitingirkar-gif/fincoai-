import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("LOGIN_REQUEST_BODY:", { ...body, password: '***' });

    const { email, password } = body;

    // A. Validate Input
    if (!email || !password) {
      console.warn("LOGIN_FAILURE: Missing email or password");
      return NextResponse.json({ 
        success: false, 
        error: 'Please provide both email and password' 
      }, { status: 400 });
    }

    // B. Database Connection
    await dbConnect();

    // C. User Lookup
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.warn("LOGIN_FAILURE: User not found:", email);
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid credentials' 
      }, { status: 401 });
    }

    // D. Password Check
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.warn("LOGIN_FAILURE: Incorrect password for:", email);
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid credentials' 
      }, { status: 401 });
    }

    // E. JWT Creation
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("LOGIN_ERROR: JWT_SECRET is missing from .env");
      throw new Error('Server configuration error: JWT_SECRET is missing');
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // F. Response Format
    console.log("LOGIN_SUCCESS: User authenticated:", email);
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }, { status: 200 });

  } catch (error) {
    // G. Error Handling
    console.error("LOGIN ERROR:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'An unexpected error occurred'
    }, { status: 500 });
  }
}
