import dbConnect from '@/lib/mongodb';
import Feedback from '@/models/Feedback';
import { verifyAuth, isAdmin } from '@/lib/auth';

export async function GET(req) {
  try {
    await dbConnect();
    const user = await verifyAuth(req);
    
    if (!user || !isAdmin(user)) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const rating = searchParams.get('rating');

    let query = {};
    if (category) query.category = category;
    if (rating) query.rating = parseInt(rating);

    const feedbacks = await Feedback.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    return new Response(JSON.stringify({ success: true, data: feedbacks }), { status: 200 });
  } catch (error) {
    console.error('Admin feedback fetch error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Server Error' }), { status: 500 });
  }
}
