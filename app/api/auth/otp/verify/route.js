import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req) {
  try {
    await dbConnect();
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return new Response(JSON.stringify({ success: false, error: 'Please provide email and OTP' }), { status: 400 });
    }

    const user = await User.findOne({
      email,
      resetPasswordOtp: otp,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid or expired OTP' }), { status: 400 });
    }

    return new Response(JSON.stringify({ success: true, message: 'OTP verified successfully' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
