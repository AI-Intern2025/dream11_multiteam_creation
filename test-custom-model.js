const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function testCustomModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  const customModelName = process.env.GEMINI_CUSTOM_MODEL_NAME;
  
  console.log('🔍 Testing custom model configurations...');
  console.log('API Key available:', !!apiKey);
  console.log('Custom model name:', customModelName);
  
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Test different model name formats
  const testFormats = [
    customModelName,
    'gemini-pro',
    `models/${customModelName}`,
    `tunedModels/${customModelName}`,
    `projects/your-project-id/locations/us-central1/models/${customModelName}`
  ];
  
  for (const format of testFormats) {
    try {
      console.log(`\n🧪 Testing format: "${format}"`);
      const model = genAI.getGenerativeModel({ model: format });
      
      const result = await model.generateContent('Hello, test message');
      const response = await result.response;
      const text = response.text();
      
      console.log(`✅ SUCCESS with format: "${format}"`);
      console.log(`Response: ${text.substring(0, 100)}...`);
      break;
      
    } catch (error) {
      console.log(`❌ FAILED with format: "${format}"`);
      console.log(`Error: ${error.message}`);
    }
  }
}

testCustomModel().catch(console.error);
