require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY;
console.log('API Key present:', !!apiKey, apiKey ? apiKey.slice(0, 10) + '...' : '');

async function listModels() {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.models) {
      console.log('Available models for your API key:');
      data.models.forEach((m) => {
        if (m.supportedGenerationMethods?.includes('generateContent')) {
          console.log(`- Name: ${m.name} (DisplayName: ${m.displayName})`);
        }
      });
    } else {
      console.log('Error listing models:', data);
    }
  } catch (e) {
    console.error('List models error:', e);
  }
}

listModels();
