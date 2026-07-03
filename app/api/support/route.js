import dbConnect from '@/lib/mongodb';
import SupportTicket from '@/models/SupportTicket';
import { verifyAuth } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { getSupportConfirmationTemplate, getAdminSupportNotification } from '@/lib/emailTemplates';

export async function POST(req) {
  try {
    await dbConnect();
    const user = await verifyAuth(req);
    
    if (!user) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
    }

    const { name, email, subject, message } = await req.json();

    // Validation
    if (!name || !email || !subject || !message) {
      return new Response(JSON.stringify({ success: false, error: 'Please fill all fields' }), { status: 400 });
    }

    // Rate limiting (simple: prevent more than 3 tickets in 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentTickets = await SupportTicket.countDocuments({
      user: user._id,
      createdAt: { $gte: fiveMinutesAgo }
    });

    if (recentTickets >= 3) {
      return new Response(JSON.stringify({ success: false, error: 'Too many requests. Please try again later.' }), { status: 429 });
    }

    const ticket = await SupportTicket.create({
      user: user._id,
      name,
      email,
      subject,
      message
    });

    // Send notifications (Non-blocking)
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    
    // 1. Send confirmation to User
    sendEmail({
      to: email,
      subject: `Support Ticket Received: ${subject}`,
      html: getSupportConfirmationTemplate({ name, ticketId: ticket._id, subject, message })
    }).catch(err => console.error('SUPPORT_EMAIL_ERROR: User confirmation failed', err));

    // 2. Send notification to Admin
    if (adminEmail) {
      sendEmail({
        to: adminEmail,
        subject: `[NEW TICKET] ${subject} - ${name}`,
        html: getAdminSupportNotification({ name, email, subject, message, ticketId: ticket._id })
      }).catch(err => console.error('SUPPORT_EMAIL_ERROR: Admin notification failed', err));
    }

    return new Response(JSON.stringify({ success: true, data: ticket }), { status: 201 });
  } catch (error) {
    console.error('Support submission error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Server Error' }), { status: 500 });
  }
}
