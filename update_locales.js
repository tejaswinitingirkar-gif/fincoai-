const fs = require('fs');
const path = require('path');

const locales = ['en.json', 'hi.json', 'te.json'];

const additionalKeysEn = {
  ai_planner: {
    title: "AI Intelligence Module",
    refresh: "Refresh Analysis",
    analyzing: "Analyzing...",
    no_transactions_title: "AI Financial Planner",
    no_transactions: "Add some expense records to get personalized AI predictions for next month!",
    subtitle_start: "Based on your recent spending habits as a ",
    subtitle_end: ", here is your AI-generated financial plan:",
    est_spending: "Estimated Spending Next Month",
    savings_target: "Suggested Savings Target",
    recommended_limits: "Recommended Spending Limits",
    limit: "Limit",
    log_more: "Log more expenses to generate category limits.",
    financial_insights: "Financial Insights",
    running: "Running AI Analysis...",
    no_prediction: "No prediction generated yet."
  }
};

const additionalKeysHi = {
  ai_planner: {
    title: "एआई इंटेलिजेंस मॉड्यूल",
    refresh: "विश्लेषण रीफ्रेश करें",
    analyzing: "विश्लेषण कर रहा है...",
    no_transactions_title: "एआई वित्तीय योजनाकार",
    no_transactions: "अगले महीने के लिए व्यक्तिगत एआई भविष्यवाणियां प्राप्त करने के लिए कुछ व्यय रिकॉर्ड जोड़ें!",
    subtitle_start: "एक ",
    subtitle_end: " के रूप में आपकी हालिया खर्च करने की आदतों के आधार पर, यहाँ आपकी एआई-जनित वित्तीय योजना है:",
    est_spending: "अगले महीने का अनुमानित खर्च",
    savings_target: "सुझाए गए बचत लक्ष्य",
    recommended_limits: "अनुशंसित खर्च सीमाएं",
    limit: "सीमा",
    log_more: "श्रेणी सीमाएं उत्पन्न करने के लिए अधिक खर्च लॉग करें।",
    financial_insights: "वित्तीय अंतर्दृष्टि",
    running: "एआई विश्लेषण चल रहा है...",
    no_prediction: "अभी तक कोई भविष्यवाणी उत्पन्न नहीं हुई।"
  }
};

const additionalKeysTe = {
  ai_planner: {
    title: "AI ఇంటెలిజెన్స్ మాడ్యూల్",
    refresh: "విశ్లేషణను రిఫ్రెష్ చేయండి",
    analyzing: "విశ్లేషిస్తోంది...",
    no_transactions_title: "AI ప్లానర్",
    no_transactions: "వచ్చే నెలలో AI అంచనాలను పొందడానికి కొన్ని ఖర్చుల రికార్డులను జోడించండి!",
    subtitle_start: "ఒక ",
    subtitle_end: " గా మీ ఇటీవలి ఖర్చుల అలవాట్ల ఆధారంగా, మీ AI ఆర్థిక ప్రణాళిక ఇక్కడ ఉంది:",
    est_spending: "తదుపరి నెల అంచనా ఖర్చు",
    savings_target: "సూచించబడిన పొదుపు లక్ష్యం",
    recommended_limits: "సిఫార్సు చేయబడిన ఖర్చుల పరిమితులు",
    limit: "పరిమితి",
    log_more: "వర్గం పరిమితులను సృష్టించడానికి మరిన్ని ఖర్చులను లాగ్ చేయండి.",
    financial_insights: "ఆర్థిక అంతర్దృష్టులు",
    running: "AI విశ్లేషణ నడుస్తోంది...",
    no_prediction: "ఇంకా అంచనా సృష్టించబడలేదు."
  }
};

const allAdditions = {
  'en.json': additionalKeysEn,
  'hi.json': additionalKeysHi,
  'te.json': additionalKeysTe
};

locales.forEach(file => {
  const filePath = path.join(__dirname, 'locales', file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const merged = { ...data, ...allAdditions[file] };
  fs.writeFileSync(filePath, JSON.stringify(merged, null, 2));
  console.log(`Updated ${file}`);
});
