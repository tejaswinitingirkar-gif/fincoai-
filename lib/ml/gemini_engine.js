/**
 * Gemini Insights Engine for natural language financial advice.
 * Uses Google Gemini 1.5 Flash via direct REST API for intelligent insights.
 */

console.log("AI ENGINE: API KEY EXISTS:", !!process.env.GEMINI_API_KEY);

/**
 * Generates financial insights using the Financial Guardian AI model.
 * @param {Object} predictionContext - Context including budget status and behavior.
 * @param {String} role - User role.
 * @param {Number} confidence - Confidence score.
 */
export async function generateInsights(predictionContext, role, confidence, language = 'en') {
  console.log("AI INSIGHTS REQUEST RECEIVED");
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_api_key_here') {
      console.warn("AI ENGINE: GEMINI_API_KEY not configured.");
      return fallbackInsights(predictionContext, role, language);
  }

  const { 
    budget_status, 
    behavior_profile, 
    predictions, 
    current_month_data 
  } = predictionContext;

  const prompt = `
    You are the "Financial Guardian AI," an advanced production-ready financial advisor.
    Your goal is to provide real-time guidance, alerts, and optimization based on deep behavioral analysis and LSTM forecasts.

    Today's Date: ${new Date().toLocaleDateString()}
    User Role: ${role}

    CURRENT FINANCIAL STATUS (THIS MONTH):
    - Income: ₹${current_month_data.income.toFixed(2)}
    - Actual Expenses: ₹${current_month_data.expenses.toFixed(2)}
    - Actual Balance: ₹${current_month_data.balance.toFixed(2)}
    - Safe Spending Limit (Monthly): ₹${budget_status.safeLimit.toFixed(2)}
    - Remaining Safe Balance: ₹${budget_status.remainingBalance.toFixed(2)}
    - Status: ${budget_status.status} (${budget_status.usagePercentage.toFixed(1)}% used)
    - RECOMMENDED DAILY SAFE SPEND: ₹${budget_status.dailySafeSpend.toFixed(2)}

    BEHAVIORAL INSIGHTS:
    - Financial Health Score: ${behavior_profile.healthScore}/100
    - MoM Growth Rate: ${behavior_profile.growthRate.toFixed(1)}%
    - Savings Rate: ${behavior_profile.savingsRate.toFixed(1)}%
    - Anomalies Detected: ${JSON.stringify(behavior_profile.anomalies)}
    - Prediction Confidence: ${(confidence * 100).toFixed(0)}%

    Tasks:
    1. Explain the current status (Are they on track?).
    2. Warn explicitly if overspending or if burn rate is too high.
    3. Suggest exact money-saving actions (₹ savings improvements).
    4. Provide actionable advice for the next 24-48 hours.
    5. Recommend category-level limits for the next month.
    6. Predict 12-month long-term impact of current habits.

    CRITICAL: You MUST respond in the language corresponding to this ISO 639-1 code: "${language}". 
    The values of the JSON object MUST be in "${language}".
    Keep the JSON keys exactly as specified in English.

    Return the response ONLY in a valid JSON format with the following keys:
    {
      "guardian_summary": string,
      "risk_level": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
      "action_plan": [string],
      "risk_alerts": [string],
      "savings_opportunities": [string],
      "category_limits": [{ "category": string, "limit": number }],
      "long_term_forecast": string,
      "explanation": string
    }
  `;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      }
    );

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const jsonStr = text.replace(/```json|```/g, '').trim();
    console.log("GEMINI INSIGHTS RESPONSE RECEIVED (JSON)");
    try {
      return JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Invalid JSON from Gemini (Insights):", jsonStr);
      return fallbackInsights(predictionContext, role, language);
    }
  } catch (error) {
    console.error("Gemini API Error (Insights):", error);
    return fallbackInsights(predictionContext, role, language);
  }
}

/**
 * Enhanced fallback if Gemini API fails.
 */
function fallbackInsights(predictionContext, role, language = 'en') {
  const { budget_status, behavior_profile } = predictionContext;
  
  const translations = {
    en: {
      summary: `Your financial health score is ${behavior_profile.healthScore}/100. Currently in ${budget_status.status} mode.`,
      keep_spending: `Keep daily spending below ₹${budget_status.dailySafeSpend.toFixed(2)} to stay within budget.`,
      review_category: "Review your highest expense category for potential savings.",
      spike: (cat, amt) => `Unusual spike detected in ${cat} (₹${amt})`,
      automate: "Automate a portion of your income to a high-yield savings account.",
      cut_down: "Cut down on non-essential subscriptions.",
      long_term: "If current patterns persist, your savings rate suggests steady long-term growth."
    },
    hi: {
      summary: `आपका वित्तीय स्वास्थ्य स्कोर ${behavior_profile.healthScore}/100 है। वर्तमान में ${budget_status.status} मोड में है।`,
      keep_spending: `बजट के भीतर रहने के लिए दैनिक खर्च को ₹${budget_status.dailySafeSpend.toFixed(2)} से कम रखें।`,
      review_category: "संभावित बचत के लिए अपनी उच्चतम व्यय श्रेणी की समीक्षा करें।",
      spike: (cat, amt) => `${cat} (₹${amt}) में असामान्य वृद्धि का पता चला`,
      automate: "अपनी आय के एक हिस्से को उच्च-उपज वाले बचत खाते में स्वचालित करें।",
      cut_down: "अनावश्यक सब्सक्रिप्शन में कटौती करें।",
      long_term: "यदि वर्तमान पैटर्न बना रहता है, तो आपकी बचत दर स्थिर दीर्घकालिक वृद्धि का सुझाव देती है।"
    },
    te: {
      summary: `మీ ఆర్థిక ఆరోగ్య స్కోరు ${behavior_profile.healthScore}/100. ప్రస్తుతం ${budget_status.status} మోడ్‌లో ఉంది.`,
      keep_spending: `బడ్జెట్‌లో ఉండటానికి రోజువారీ ఖర్చును ₹${budget_status.dailySafeSpend.toFixed(2)} లోపు ఉంచండి.`,
      review_category: "సంభావ్య పొదుపుల కోసం మీ అత్యధిక ఖర్చు వర్గాన్ని సమీక్షించండి.",
      spike: (cat, amt) => `${cat} (₹${amt}) లో అసాధారణ పెరుగుదల కనుగొనబడింది`,
      automate: "మీ ఆదాయంలో కొంత భాగాన్ని అధిక-దిగుబడి పొదుపు ఖాతాకు ఆటోమేట్ చేయండి.",
      cut_down: "అనవసరమైన సబ్‌స్క్రిప్షన్‌లను తగ్గించండి.",
      long_term: "ప్రస్తుత నమూనాలు కొనసాగితే, మీ పొదుపు రేటు స్థిరమైన దీర్ఘకాలిక వృద్ధిని సూచిస్తుంది."
    }
  };

  const t = translations[language] || translations['en'];

  return {
    guardian_summary: t.summary,
    risk_level: behavior_profile.riskScore,
    action_plan: [
      t.keep_spending,
      t.review_category
    ],
    risk_alerts: behavior_profile.anomalies.map(a => t.spike(a.category, a.amount)),
    savings_opportunities: [
      t.automate,
      t.cut_down
    ],
    category_limits: [],
    long_term_forecast: t.long_term,
  };
}

/**
 * Scans a payment receipt image and extracts expense details.
 * @param {String} base64Image - Base64 encoded image data.
 * @param {String} mimeType - MIME type of the image.
 */
export async function scanExpenseFromImage(base64Image, mimeType = 'image/jpeg') {
  console.log("SCAN ENGINE: REQUEST RECEIVED");
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_api_key_here') {
      console.warn("AI ENGINE: GEMINI_API_KEY not configured.");
      throw new Error('AI feature not configured. Contact admin.');
  }

  // Prompt based on user requirements for specific receipt types (UPI/GPay/PhonePe/Paytm)
  const prompt = `
    Analyze the uploaded image (UPI / Google Pay / PhonePe / Paytm receipt).
    1. Identify if it is a valid payment confirmation screen.
    2. Detect the transaction amount:
       - Look for ₹ symbol (Indian Rupees).
       - Usually large, bold, and centered.
    3. Extract ONLY the numeric value (e.g., ₹1,200 -> 1200).
    4. Ignore: Transaction IDs, phone numbers, UPI IDs, bank account numbers.
    5. If multiple ₹ values exist, choose the MAIN transaction amount.
    6. Extract optional data: Receiver name, date (YYYY-MM-DD), time (HH:MM), payment app name.

    Return the response ONLY in a valid JSON format with the following keys:
    {
      "amount": number,
      "currency": "INR",
      "type": "expense",
      "source": "scanner",
      "receiver": "string or null",
      "date": "YYYY-MM-DD or null",
      "time": "HH:MM or null",
      "confidence": "high" | "medium" | "low",
      "app": "string or null"
    }

    If no ₹ amount found or it is not a payment screenshot, return:
    { "error": "No expense detected" }
  `;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inline_data: { mime_type: mimeType || "image/jpeg", data: base64Image } },
              { text: prompt }
            ]
          }],
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      }
    );

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const jsonStr = text.replace(/```json|```/g, '').trim();
    
    try {
      return JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Invalid JSON from Gemini Scan:", jsonStr);
      const amtMatch = text.match(/[\u20B9₹]?\s*(\d+[\d,]*\.?\d*)/);
      const amount = amtMatch ? parseFloat(amtMatch[1].replace(/,/g, '')) : 0;
      return {
        amount: amount,
        currency: "INR",
        type: "expense",
        source: "scanner",
        receiver: "Unknown Merchant",
        date: new Date().toISOString().split('T')[0],
        time: "12:00",
        confidence: "low",
        app: "Fallback AI"
      };
    }
  } catch (error) {
    console.error("Gemini Scan Error:", error);
    return { 
      amount: 0,
      currency: "INR",
      type: "expense",
      source: "scanner",
      receiver: "Error Output",
      date: new Date().toISOString().split('T')[0],
      error: "Scanning failed due to API error" 
    };
  }
}

/**
 * Categorize a raw transaction string using NLP.
 */
export async function categorizeExpense(description, amount) {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_api_key_here') {
      return "Miscellaneous";
  }

  const prompt = `
    You are an AI financial categorizer.
    Categorize the following transaction into exactly one of these categories:
    [Rent / Housing, Groceries, Food / Dining, Utility Bills, Insurance, EMI / Loans, Shopping, Healthcare, Travel, Entertainment, Miscellaneous]
    
    Description: "${description}"
    Amount: ₹${amount}
    
    Return ONLY the category name as a plain string, nothing else.
  `;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    );
    const data = await response.json();
    let category = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Miscellaneous";
    return category.trim();
  } catch (error) {
    return "Miscellaneous";
  }
}

/**
 * Handle conversational queries for the AI Chat Assistant.
 */
export async function chatWithFinancialAdvisor(messages, userContext, language = 'en') {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_api_key_here') {
      return "I'm sorry, my AI engine is currently offline. Please configure the GEMINI_API_KEY.";
  }

  const systemPrompt = `
    You are the "AI Financial Guardian," a friendly, intelligent, and conversational mini-ChatGPT financial advisor for the Finco AI platform.
    Your tone is extremely warm, helpful, encouraging, and highly personalized.

    CORE KNOWLEDGE BASE (THE APP):
    - Dashboard: Overview of income, expenses, and savings with real-time charts.
    - AI Prediction: Uses machine learning (LSTM) to forecast future spending. Confidence score indicates accuracy based on data volume.
    - Goal Planner: Users set targets (e.g., buying a car) and track progress via savings and manual contributions.
    - Smart Scanner: Scan receipts (UPI, GPay, Paytm) to log expenses automatically using OCR.
    - CSV Upload: Bulk import transactions via CSV for comprehensive history.
    - Savings Calculation: Total Income - Total Expenses.
    - Financial Health Score: A 0-100 metric based on spending habits vs income.

    USER FINANCIAL CONTEXT:
    - User Name: ${userContext.name}
    - User Role: ${userContext.role}
    - User Income: ₹${userContext.income}
    - Total Expenses: ₹${userContext.expenses}
    - Current Balance: ₹${userContext.balance}
    - Top Spending Categories: ${JSON.stringify(userContext.topCategories)}
    - Active Goals: ${JSON.stringify(userContext.goals)}
    - Recent Transactions: ${JSON.stringify(userContext.recentTransactions)}

    INSTRUCTIONS:
    1. If the user just says "Hi", "Hello", or a casual greeting, respond back enthusiastically like a friendly chat bot! Do not dump complex financial data unless asked.
    2. Address the user by their name (${userContext.name}) occasionally to build rapport.
    3. Acknowledge their role (${userContext.role}) when giving budgeting advice.
    4. Answer questions about the app features using the CORE KNOWLEDGE BASE.
    5. If asked about their finances, intelligently analyze the USER FINANCIAL CONTEXT to give specific advice.
    6. Be conversational but concise. Use bullet points for lists when needed.
    7. Do NOT use markdown outside of bolding and bullet points.
    8. If data is missing or query is unrelated, provide general expert financial advice warmly.
    9. CRITICAL: You MUST respond in the language corresponding to this ISO 639-1 code: "${language}". Do not use any other language.
  `;

  const rawMessages = [
    { role: "user", parts: [{ text: systemPrompt }] },
    { role: "model", parts: [{ text: "Understood. I am ready to advise." }] },
    ...messages.map(m => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }]
    }))
  ];

  // Merge consecutive messages of the same role to prevent Gemini API 400 Bad Request
  const geminiMessages = [];
  let currentRole = null;

  for (const msg of rawMessages) {
    if (msg.role === currentRole) {
      geminiMessages[geminiMessages.length - 1].parts[0].text += "\n\n" + msg.parts[0].text;
    } else {
      geminiMessages.push(msg);
      currentRole = msg.role;
    }
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: geminiMessages })
      }
    );
    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "I am currently analyzing your data. Please try again in a moment.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I am experiencing network issues and cannot answer right now.";
  }
}
