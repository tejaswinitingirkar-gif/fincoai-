const fs = require('fs');
const path = require('path');

const locales = ['en.json', 'hi.json', 'te.json'];

const generalEn = {
  dash: {
    employee_details: "Employee Financial Details",
    freelancer_details: "Freelancer Financial Details",
    student_details: "Student Financial Details",
    homemaker_details: "Homemaker Financial Details",
    other_details: "Financial Details",
    log_desc: "Log your income and expenses to track your financial health.",
    income_details: "Income Details",
    expense_details: "Expense Details",
    income_category: "Income Category",
    expense_category: "Expense Category",
    amount: "Amount",
    date: "Date",
    description: "Description (Optional)",
    save_income: "Save Income",
    save_expense: "Save Expense",
    saving: "Saving...",
    recent_transactions: "Recent Transactions:",
    no_transactions_month: "No transactions logged for this month.",
    table_type: "Type",
    table_category: "Category",
    table_amount: "Amount",
    table_date: "Date",
    table_desc: "Description",
    table_action: "Action"
  }
};

const generalHi = {
  dash: {
    employee_details: "कर्मचारी वित्तीय विवरण",
    freelancer_details: "फ्रीलांसर वित्तीय विवरण",
    student_details: "छात्र वित्तीय विवरण",
    homemaker_details: "गृहिणी वित्तीय विवरण",
    other_details: "वित्तीय विवरण",
    log_desc: "अपने वित्तीय स्वास्थ्य को ट्रैक करने के लिए अपनी आय और व्यय को लॉग करें।",
    income_details: "आय विवरण",
    expense_details: "व्यय विवरण",
    income_category: "आय श्रेणी",
    expense_category: "व्यय श्रेणी",
    amount: "राशि",
    date: "तारीख",
    description: "विवरण (वैकल्पिक)",
    save_income: "आय सहेजें",
    save_expense: "व्यय सहेजें",
    saving: "सहेजा जा रहा है...",
    recent_transactions: "हाल के लेनदेन:",
    no_transactions_month: "इस महीने के लिए कोई लेनदेन लॉग नहीं किया गया।",
    table_type: "प्रकार",
    table_category: "श्रेणी",
    table_amount: "राशि",
    table_date: "तारीख",
    table_desc: "विवरण",
    table_action: "कार्रवाई"
  }
};

const generalTe = {
  dash: {
    employee_details: "ఉద్యోగి ఆర్థిక వివరాలు",
    freelancer_details: "ఫ్రీలాన్సర్ ఆర్థిక వివరాలు",
    student_details: "విద్యార్థి ఆర్థిక వివరాలు",
    homemaker_details: "గృహిణి ఆర్థిక వివరాలు",
    other_details: "ఆర్థిక వివరాలు",
    log_desc: "మీ ఆర్థిక పరిస్థితిని పర్యవేక్షించడానికి మీ ఆదాయం మరియు ఖర్చులను లాగ్ చేయండి.",
    income_details: "ఆదాయ వివరాలు",
    expense_details: "ఖర్చు వివరాలు",
    income_category: "ఆదాయ వర్గం",
    expense_category: "ఖర్చు వర్గం",
    amount: "మొత్తం",
    date: "తేదీ",
    description: "వివరణ (ఐచ్ఛికం)",
    save_income: "ఆదాయాన్ని సేవ్ చేయండి",
    save_expense: "ఖర్చును సేవ్ చేయండి",
    saving: "సేవ్ చేస్తోంది...",
    recent_transactions: "ఇటీవలి లావాదేవీలు:",
    no_transactions_month: "ఈ నెలకు ఎటువంటి లావాదేవీలు నమోదు చేయబడలేదు.",
    table_type: "రకం",
    table_category: "వర్గం",
    table_amount: "మొత్తం",
    table_date: "తేదీ",
    table_desc: "వివరణ",
    table_action: "చర్య"
  }
};

const allAdditions = {
  'en.json': generalEn,
  'hi.json': generalHi,
  'te.json': generalTe
};

locales.forEach(file => {
  const filePath = path.join(__dirname, 'locales', file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  // Merge the new 'dash' fields safely!
  if(allAdditions[file].dash) {
    data.dash = { ...data.dash, ...allAdditions[file].dash };
  }
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Updated dash keys in ${file}`);
});
