import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { sendEmail } from '@/lib/email';

export async function POST(req) {
  try {
    await dbConnect();
    const { email } = await req.json();

    const user = await User.findOne({ email });
    if (!user) {
      return new Response(JSON.stringify({ success: false, error: 'User with that email does not exist' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP and expiration (10 minutes)
    user.resetPasswordOtp = otp;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    // Send email
    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset OTP - Finco',
        html: `
        <div style="font-family: 'Inter', Arial, sans-serif; background-color: #fca5a5; padding: 40px 20px; text-align: center; border-radius: 12px; max-width: 500px; margin: auto;">
          <h2 style="color: #450a0a; font-size: 24px; margin-bottom: 10px;">Security Verification</h2>
          <p style="color: #7f1d1d; font-size: 16px; margin-bottom: 30px;">You have requested to reset your password. Use the OTP below to authenticate your request.</p>
          <div style="background-color: white; padding: 20px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #b91c1c; display: inline-block; margin-bottom: 30px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            ${otp}
          </div>
          <p style="color: #991b1b; font-size: 14px;">This code expires in <b>10 minutes</b>. If you did not request this, please ignore this email.</p>
        </div>
        `,
      });
      return new Response(JSON.stringify({ success: true, message: 'OTP sent to email' }), { status: 200 });
    } catch (err) {
      user.resetPasswordOtp = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return new Response(JSON.stringify({ success: false, error: 'Email could not be sent' }), { status: 500 });
    }
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
