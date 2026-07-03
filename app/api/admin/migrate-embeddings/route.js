import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

// Admin-only migration endpoint to clear all non-512-d embeddings
export async function POST(req) {
  try {
    await dbConnect();

    // Find all users with face embeddings
    const users = await User.find({ faceEmbeddings: { $exists: true, $not: { $size: 0 } } })
      .select('name email faceEmbeddings faceRecognitionEnabled');

    let migrated = 0;
    let alreadyValid = 0;

    for (const user of users) {
      if (!user.faceEmbeddings || user.faceEmbeddings.length === 0) continue;

      if (user.faceEmbeddings.length !== 512) {
        // Clear invalid embedding and disable face recognition
        await User.findByIdAndUpdate(user._id, {
          $unset: { faceEmbeddings: '' },
          faceRecognitionEnabled: false,
        });
        migrated++;
        console.log(`[Migration] Cleared stale ${user.faceEmbeddings.length}-d embedding for ${user.email}`);
      } else {
        alreadyValid++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Migration complete. ${migrated} stale embeddings cleared. ${alreadyValid} already valid (512-d).`,
      cleared: migrated,
      valid: alreadyValid,
    });
  } catch (error) {
    console.error('[Migration] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await dbConnect();
    const users = await User.find({ faceEmbeddings: { $exists: true, $not: { $size: 0 } } })
      .select('name email faceRecognitionEnabled faceEmbeddings');

    const report = users.map(u => ({
      email: u.email,
      faceEnabled: u.faceRecognitionEnabled,
      embeddingDim: u.faceEmbeddings?.length ?? 0,
      valid: u.faceEmbeddings?.length === 512,
    }));

    return NextResponse.json({ success: true, users: report });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
