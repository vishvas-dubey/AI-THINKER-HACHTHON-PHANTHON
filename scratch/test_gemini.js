const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function testKey() {
  const key = process.env.GEMINI_API_KEY;
  console.log("Testing Key:", key ? "Exists (starts with " + key.substring(0, 5) + ")" : "Missing");
  
  if (!key) return;

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const result = await model.generateContent("Hello, say 'Key Working'");
    console.log("Response:", result.response.text());
  } catch (err) {
    console.error("API Error:", err.message);
    if (err.response) {
      console.error("Status:", err.response.status);
    }
  }
}

testKey();
