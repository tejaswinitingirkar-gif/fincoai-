import dbConnect from '@/lib/mongodb';
import Feedback from '@/models/Feedback';
import { verifyAuth } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { getAdminFeedbackNotification } from '@/lib/emailTemplates';

export async function POST(req) {
  try {
    await dbConnect();
    const user = await verifyAuth(req);
    
    if (!user) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
    }

    const { rating, category, message } = await req.json();

    // Validation
    if (!rating || !category || !message) {
      return new Response(JSON.stringify({ success: false, error: 'Please provide all feedback details' }), { status: 400 });
    }

    const feedback = await Feedback.create({
      user: user._id,
      rating,
      category,
      message
    });

    // Send Admin Notification (Non-blocking)
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    if (adminEmail) {
      sendEmail({
        to: adminEmail,
        subject: `[FEEDBACK] ${rating}/5 - ${category}`,
        html: getAdminFeedbackNotification({ 
          name: user.name, 
          email: user.email, 
          rating, 
          category, 
          message 
        })
      }).catch(err => console.error('FEEDBACK_EMAIL_ERROR: Admin notification failed', err));
    }

    return new Response(JSON.stringify({ success: true, data: feedback }), { status: 201 });
  } catch (error) {
    console.error('Feedback submission error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Server Error' }), { status: 500 });
  }
}
