import dbConnect from '@/lib/mongodb';
import SupportTicket from '@/models/SupportTicket';
import { verifyAuth, isAdmin } from '@/lib/auth';

export async function PATCH(req, { params }) {
  try {
    await dbConnect();
    const user = await verifyAuth(req);
    
    if (!user || !isAdmin(user)) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
    }

    const { id } = params;
    const { status, priority } = await req.json();

    const ticket = await SupportTicket.findByIdAndUpdate(
      id,
      { status, priority },
      { new: true, runValidators: true }
    );

    if (!ticket) {
      return new Response(JSON.stringify({ success: false, error: 'Ticket not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, data: ticket }), { status: 200 });
  } catch (error) {
    console.error('Admin support update error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Server Error' }), { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const user = await verifyAuth(req);
    
    if (!user || !isAdmin(user)) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
    }

    const { id } = params;
    const ticket = await SupportTicket.findByIdAndDelete(id);

    if (!ticket) {
      return new Response(JSON.stringify({ success: false, error: 'Ticket not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, message: 'Ticket deleted' }), { status: 200 });
  } catch (error) {
    console.error('Admin support delete error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Server Error' }), { status: 500 });
  }
}
