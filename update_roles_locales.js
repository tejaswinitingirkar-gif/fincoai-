const fs = require('fs');
const path = require('path');

const locales = ['en.json', 'hi.json', 'te.json'];

const roleKeysEn = {
  roles_page: {
    choose_profile: "Choose Your Profile",
    choose_desc: "Select the category that best describes you so we can tailor your financial dashboard.",
    setting_up: "Setting up your profile...",
    desc_employee: "Track salary, taxes, and standard living expenses.",
    desc_homemaker: "Manage household budgets, groceries, and family expenses.",
    desc_student: "Keep an eye on pocket money, tuition, and student life.",
    desc_freelancer: "Manage business tools, client meetings, and workspace rent.",
    desc_other: "Use a generalized layout for flexible financial tracking."
  }
};

const roleKeysHi = {
  roles_page: {
    choose_profile: "अपनी प्रोफ़ाइल चुनें",
    choose_desc: "उस श्रेणी का चयन करें जो आपका सबसे अच्छा वर्णन करती है ताकि हम आपके वित्तीय डैशबोर्ड को तैयार कर सकें।",
    setting_up: "आपकी प्रोफ़ाइल सेट की जा रही है...",
    desc_employee: "वेतन, करों और मानक रहने के खर्चों को ट्रैक करें।",
    desc_homemaker: "घरेलू बजट, किराने का सामान और परिवार के खर्चों का प्रबंधन करें।",
    desc_student: "पॉकेट मनी, ट्यूशन और छात्र जीवन पर नज़र रखें।",
    desc_freelancer: "व्यापार उपकरण, ग्राहक बैठकें, और कार्यक्षेत्र का किराया प्रबंधित करें।",
    desc_other: "लचीले वित्तीय ट्रैकिंग के लिए एक सामान्यीकृत लेआउट का उपयोग करें।"
  }
};

const roleKeysTe = {
  roles_page: {
    choose_profile: "మీ ప్రొఫైల్‌ను ఎంచుకోండి",
    choose_desc: "మేము మీ ఆర్థిక డాష్‌బోర్డ్‌ను రూపొందించడానికి మిమ్మల్ని ఉత్తమంగా వివరించే వర్గాన్ని ఎంచుకోండి.",
    setting_up: "మీ ప్రొఫైల్‌ను సెటప్ చేస్తోంది...",
    desc_employee: "జీతం, పన్నులు మరియు ప్రామాణిక జీవన ఖర్చులను ట్రాక్ చేయండి.",
    desc_homemaker: "గృహ బడ్జెట్‌లు, కిరాణా మరియు కుటుంబ ఖర్చులను నిర్వహించండి.",
    desc_student: "పాకెట్ మనీ, ట్యూషన్ మరియు విద్యార్థి జీవితంపై నిఘా ఉంచండి.",
    desc_freelancer: "వ్యాపార సాధనాలు, క్లయింట్ సమావేశాలు మరియు వర్క్‌స్పేస్ అద్దెలను నిర్వహించండి.",
    desc_other: "అనువైన ఆర్థిక ట్రాకింగ్ కోసం సాధారణ లేఅవుట్‌ను ఉపయోగించండి."
  }
};

const allAdditions = {
  'en.json': roleKeysEn,
  'hi.json': roleKeysHi,
  'te.json': roleKeysTe
};

locales.forEach(file => {
  const filePath = path.join(__dirname, 'locales', file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if(allAdditions[file].roles_page) {
    data.roles_page = { ...data.roles_page, ...allAdditions[file].roles_page };
  }
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Updated roles_page in ${file}`);
});
