const https = require('https');
require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error('❌ No GEMINI_API_KEY found in .env.local');
  process.exit(1);
}

const options = {
  hostname: 'generativelanguage.googleapis.com',
  path: `/v1/models?key=${API_KEY}`,
  method: 'GET',
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      const response = JSON.parse(data);
      if (response.models && response.models.length > 0) {
        console.log('✅ Success! Your API Key is working.');
        console.log('\\nAvailable Models for your API Key:');
        console.log('-----------------------------------');
        response.models.forEach(model => {
             console.log(`- ${model.name}`);
        });
        console.log('-----------------------------------');
        console.log('\\n👉 Please choose a model from the list above (e.g. models/gemini-1.5-flash) and update the exact model name in your code.');
      } else {
        console.log('⚠️ Your API key is valid, but no models are associated with this project.');
      }
    } else {
      console.error(`❌ API Error (${res.statusCode}):`, data);
      console.error('\\nYour API key might be invalid, or your project lacks model access. Please create a new key at https://aistudio.google.com/app/apikey');
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request error:', e);
});

req.end();
