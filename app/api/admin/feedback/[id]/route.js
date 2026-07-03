import dbConnect from '@/lib/mongodb';
import Feedback from '@/models/Feedback';
import { verifyAuth, isAdmin } from '@/lib/auth';

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const user = await verifyAuth(req);
    
    if (!user || !isAdmin(user)) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
    }

    const { id } = params;
    const feedback = await Feedback.findByIdAndDelete(id);

    if (!feedback) {
      return new Response(JSON.stringify({ success: false, error: 'Feedback not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, message: 'Feedback deleted' }), { status: 200 });
  } catch (error) {
    console.error('Admin feedback delete error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Server Error' }), { status: 500 });
  }
}
