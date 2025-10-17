const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Test Gemini API Key
async function testGeminiAPI() {
  console.log('🧪 Testing Gemini API Key...\n');
  
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in .env file');
    process.exit(1);
  }
  
  console.log('✅ API Key found:', apiKey.substring(0, 20) + '...');
  console.log('📝 Testing with model: gemini-2.0-flash-exp\n');
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    console.log('⏳ Sending test prompt...');
    const startTime = Date.now();
    
    const result = await model.generateContent('Say "Hello! I am working correctly." in a friendly way.');
    const response = result.response;
    const text = response.text();
    const endTime = Date.now();
    
    console.log('\n✅ SUCCESS! Gemini API is working!\n');
    console.log('📊 Response Time:', (endTime - startTime) + 'ms');
    console.log('🤖 AI Response:', text);
    console.log('\n✨ Your Gemini API key is valid and ready to use!');
    
  } catch (error) {
    console.error('\n❌ ERROR: Gemini API test failed');
    console.error('Error details:', error.message);
    
    if (error.message.includes('API_KEY_INVALID')) {
      console.error('\n🔑 Your API key appears to be invalid.');
      console.error('Please check: https://makersuite.google.com/app/apikey');
    } else if (error.message.includes('quota')) {
      console.error('\n📊 API quota exceeded. Check your usage limits.');
    } else if (error.message.includes('PERMISSION_DENIED')) {
      console.error('\n🚫 Permission denied. Ensure API is enabled in Google Cloud Console.');
    }
    
    process.exit(1);
  }
}

testGeminiAPI();
