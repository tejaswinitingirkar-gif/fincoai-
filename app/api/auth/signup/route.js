import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { sendEmail } from '@/lib/email';

export async function POST(req) {
  try {
    await dbConnect();
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'Please provide all fields' }, { status: 400 });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json({ success: false, error: 'User already exists' }, { status: 400 });
    }

    // Role will be defaulted by schema to 'Other' initially
    const user = await User.create({ name, email, password });

    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_for_dev_only_change_in_prod';

    // Create user token
    const token = jwt.sign({ id: user._id, role: user.role }, jwtSecret, {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    });

    // Send signup welcome email
    try {
      await sendEmail({
        to: user.email,
        subject: 'Welcome to Finco AI!',
        html: `
        <div style="font-family: 'Inter', Arial, sans-serif; background-color: #0F172A; color: #F8FAFC; padding: 40px; text-align: center; border-radius: 16px; max-width: 500px; margin: auto; border: 1px solid rgba(255,255,255,0.1);">
          <h1 style="color: #4F46E5; font-size: 28px; margin-bottom: 10px;">Welcome to Finco AI 🚀</h1>
          <p style="color: #94A3B8; font-size: 16px; margin-bottom: 25px; line-height: 1.5;">Hello <b>${user.name}</b>, your account has been created successfully. Welcome to the future of finance.</p>
          <div style="background-color: rgba(255,255,255,0.05); padding: 25px; border-radius: 12px; text-align: left; border: 1px solid rgba(255,255,255,0.1);">
            <h3 style="color: #F8FAFC; font-size: 16px; margin-top: 0;">What's next?</h3>
            <ul style="color: #94A3B8; font-size: 14px; padding-left: 20px; margin-bottom: 0;">
              <li style="margin-bottom: 10px;">Configure your behavioral profile</li>
              <li style="margin-bottom: 10px;">Sync your first transactions</li>
              <li>Setup biometric Face ID login</li>
            </ul>
          </div>
          <br>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" style="display: inline-block; background: linear-gradient(to right, #4F46E5, #06B6D4); color: white; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; margin-top: 10px; box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.4);">Enter Dashboard</a>
        </div>
        `
      });
    } catch (emailError) {
      console.error('Failed to send signup email:', emailError);
    }

    return NextResponse.json({ 
      success: true, 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role 
      } 
    }, { status: 201 });
  } catch (error) {
    console.error("Signup API Error:", error);
    return NextResponse.json({ success: false, error: 'Signup failed', details: error.message }, { status: 500 });
  }
}
