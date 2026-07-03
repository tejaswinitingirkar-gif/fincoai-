import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import Tesseract from 'tesseract.js';

// Protect routes middleware
const protect = async (req) => {
  let token;
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer')) {
    token = authHeader.split(' ')[1];
  }
  if (!token) throw new Error('Not authorized');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch (error) {
    throw new Error('Not authorized');
  }
};

export async function POST(req) {
  try {
    await dbConnect();
    const userId = await protect(req);

    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64) {
      return new Response(JSON.stringify({ success: false, error: "No image data provided" }), { status: 400 });
    }

    const imageUri = `data:${mimeType || 'image/jpeg'};base64,${imageBase64}`;

    // STEP 1: USE TESSERACT OCR
    console.log("Starting Tesseract OCR...");
    const { data: { text: rawText } } = await Tesseract.recognize(imageUri, 'eng');

    // STEP 2: CLEAN OCR TEXT
    const text = rawText.replace(/\s+/g, " ");

    // STEP 8: DEBUG LOGGING
    console.log("OCR TEXT:", text);

    // STEP 3: STRONG AMOUNT DETECTION
    function extractAmount(text) {
      const matches = text.match(/₹\s?\d+[.,]?\d*/g);

      if (matches && matches.length > 0) {
        return Math.max(
          ...matches.map(m =>
            parseFloat(m.replace(/[^\d.]/g, ""))
          )
        );
      }

      // fallback: any number
      const nums = text.match(/\d+[.,]?\d*/g);
      if (!nums) return 0;

      return Math.max(...nums.map(n => parseFloat(n)));
    }

    // STEP 4: DATE EXTRACTION
    function extractDate(text) {
      const match = text.match(/\d{1,2}[\s\/-]\w{3}[\s\/-]\d{2,4}/);
      return match ? match[0] : new Date().toISOString().split('T')[0];
    }

    // STEP 5: MERCHANT EXTRACTION
    function extractMerchant(text, raw) {
      if (text.includes("Google Pay")) return "Google Pay";
      if (text.includes("UPI")) return "UPI Payment";
      if (text.includes("State Bank")) return "SBI";

      const lines = raw.split("\n").map(l => l.trim()).filter(l => l.length > 3);
      return lines[0] || "Unknown";
    }

    const amount = extractAmount(text);
    const date = extractDate(text);
    const merchant = extractMerchant(text, rawText);
    const parsed = { amount, date, merchant };

    console.log("AMOUNT:", amount);

    // STEP 7 & 9: If amount = 0, DO NOT SAVE. Return error.
    if (amount === 0 || isNaN(amount)) {
       console.log("Failed to detect amount. Returning error without saving.");
       return new Response(JSON.stringify({ 
         success: false, 
         error: "Could not detect amount",
         parsed: parsed
       }), { status: 400 });
    }

    // 🔥 SAVE TO DATABASE ONLY IF amount > 0
    const transaction = await Transaction.create({
      user: userId,
      type: 'Expense',
      amount: amount,
      category: 'Miscellaneous',
      description: merchant,
      date: date.length > 15 ? date.split('T')[0] : date
    });

    // Fire off non-blocking training update for the LSTM model
    const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';
    fetch(`${ML_SERVICE_URL}/train`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId })
    }).catch(err => console.error("ML train trigger error:", err.message));

    return new Response(JSON.stringify({
      success: true,
      data: parsed,
      transaction: transaction
    }), { status: 200 });

  } catch (error) {
    console.error("Receipt Scan Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error", details: error.message }), 
      { status: error.message === 'Not authorized' ? 401 : 500 }
    );
  }
}
