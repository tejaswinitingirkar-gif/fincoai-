import dbConnect from '@/lib/mongodb';
import SupportTicket from '@/models/SupportTicket';
import { verifyAuth, isAdmin } from '@/lib/auth';

export async function GET(req) {
  try {
    await dbConnect();
    const user = await verifyAuth(req);
    
    if (!user || !isAdmin(user)) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    let query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const tickets = await SupportTicket.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    return new Response(JSON.stringify({ success: true, data: tickets }), { status: 200 });
  } catch (error) {
    console.error('Admin support fetch error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Server Error' }), { status: 500 });
  }
}
