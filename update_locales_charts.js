const fs = require('fs');
const path = require('path');

const locales = ['en.json', 'hi.json', 'te.json'];

const additionalKeysEn = {
  dash_charts: {
    overview: "Financial Overview",
    total_savings: "Total Savings",
    avail_balance: "Available balance",
    total_income: "Total Income",
    total_expenses: "Total Expenses",
    expenses: "Expenses",
    no_expenses_logged: "No expenses logged this month yet.",
    current_vs_last: "Current vs Last Month Expenses",
    spending_trend: "Spending Trend",
    savings_vs_expenses: "Savings vs Expenses Comparison",
    add_first: "Add your first income or expense to see visualizations!",
    no_prev: "No previous month data",
    more_than_last: "more than last month",
    less_than_last: "less than last month",
    same_as_last: "Same as last month",
    no_expenses_last: "No expenses last month"
  }
};

const additionalKeysHi = {
  dash_charts: {
    overview: "वित्तीय अवलोकन",
    total_savings: "कुल बचत",
    avail_balance: "उपलब्ध राशि",
    total_income: "कुल आय",
    total_expenses: "कुल व्यय",
    expenses: "खर्च",
    no_expenses_logged: "इस महीने अभी तक कोई खर्च लॉग नहीं किया गया है।",
    current_vs_last: "वर्तमान बनाम पिछले महीने का खर्च",
    spending_trend: "खर्च की प्रवृत्ति",
    savings_vs_expenses: "बचत बनाम व्यय की तुलना",
    add_first: "विज़ुअलाइज़ेशन देखने के लिए अपनी पहली आय या व्यय जोड़ें!",
    no_prev: "पिछले महीने का कोई डेटा नहीं",
    more_than_last: "पिछले महीने से अधिक",
    less_than_last: "पिछले महीने से कम",
    same_as_last: "पिछले महीने के समान",
    no_expenses_last: "पिछले महीने कोई खर्च नहीं"
  }
};

const additionalKeysTe = {
  dash_charts: {
    overview: "ఆర్థిక అవలోకనం",
    total_savings: "మొత్తం పొదుపులు",
    avail_balance: "అందుబాటులో ఉన్న బ్యాలెన్స్",
    total_income: "మొత్తం ఆదాయం",
    total_expenses: "మొత్తం ఖర్చులు",
    expenses: "ఖర్చులు",
    no_expenses_logged: "ఈ నెలలో ఇంకా ఖర్చులేమీ నమోదు కాలేదు.",
    current_vs_last: "ప్రస్తుత vs గత నెల వలసలు ఖర్చులు",
    spending_trend: "ఖర్చుల సరళి",
    savings_vs_expenses: "పొదుపులు vs ఖర్చుల పోలిక",
    add_first: "విజువలైజేషన్‌లను చూడటానికి మీ మొదటి ఆదాయం లేదా ఖర్చును జోడించండి!",
    no_prev: "గత నెల డేటా లేదు",
    more_than_last: "గత నెల కంటే ఎక్కువ",
    less_than_last: "గత నెల కంటే తక్కువ",
    same_as_last: "గత నెల లాగానే",
    no_expenses_last: "గత నెలలో ఖర్చులు లేవు"
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
