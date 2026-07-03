import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const protect = async (req) => {
  let token;
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer')) {
    token = authHeader.split(' ')[1];
  }
  if (!token) throw new Error('Not authorized');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) throw new Error('User not found');
    return user;
  } catch (error) {
    throw new Error('Not authorized');
  }
};

export async function POST(req) {
  try {
    await dbConnect();

    // 1. AUTH & USER SETTINGS CHECK
    const user = await protect(req);

    if (!user.scan_auto_expense_enabled) {
      return new Response(JSON.stringify({
        success: false,
        error: "Scan disabled in profile"
      }), { status: 403 });
    }

    // 2. BODY PARSE
    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64) {
      return new Response(JSON.stringify({
        success: false,
        error: "No image data provided"
      }), { status: 400 });
    }

    // 3. API KEY CHECK
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_api_key_here') {
      console.error("GEMINI API KEY MISSING OR PLACEHOLDER");
      return new Response(JSON.stringify({
        success: false,
        error: "AI not configured"
      }), { status: 500 });
    }

    // 4. GEMINI CALL — using direct REST API (v1)
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro-vision:generateContent?key=" + process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    mime_type: mimeType || "image/jpeg",
                    data: imageBase64,
                  },
                },
                {
                  text: "Extract only the rupee amount from this payment image. Return only number.",
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("FULL ERROR:", data);
      return Response.json({
        success: false,
        error: "Gemini API failed",
        details: JSON.stringify(data),
      }, { status: 500 });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log("Gemini raw response:", text);

    // 5. SAFE EXTRACTION — handles commas like ₹1,200
    const match = text.match(/(\d[\d,]*)/);

    if (!match) {
      return Response.json({
        success: false,
        error: "No amount detected in image"
      }, { status: 400 });
    }

    const amount = parseInt(match[1].replace(/,/g, ""));
    console.log("Extracted amount:", amount);

    // 7. SUCCESS
    return Response.json({
      success: true,
      amount,
    }, { status: 200 });

  } catch (error) {
    console.error("FULL ERROR:", error);
    return Response.json({
      success: false,
      error: "AI processing failed",
      details: error.message || "Unknown error"
    }, { status: error.message === 'Not authorized' ? 401 : 500 });
  }
}
