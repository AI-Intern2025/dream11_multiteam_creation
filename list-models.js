const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function listAvailableModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  console.log('🔍 Testing available models...');
  console.log('API Key available:', !!apiKey);
  
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Test common Gemini models
  const commonModels = [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro',
    'gemini-1.0-pro'
  ];
  
  for (const modelName of commonModels) {
    try {
      console.log(`\n🧪 Testing model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Hello, this is a test message');
      const response = await result.response;
      const text = response.text();
      
      console.log(`✅ SUCCESS with model: ${modelName}`);
      console.log(`Response: ${text.substring(0, 100)}...`);
      
      // If we found a working model, let's test your custom model name
      console.log('\n🎯 Now testing your custom model name...');
      
      const customFormats = [
        'Dream11 MultiTeam Creator',
        'dream11-multiteam-creator',
        'tunedModels/Dream11 MultiTeam Creator',
        `tunedModels/dream11-multiteam-creator`
      ];
      
      for (const customName of customFormats) {
        try {
          console.log(`🧪 Testing custom format: "${customName}"`);
          const customModel = genAI.getGenerativeModel({ model: customName });
          const customResult = await customModel.generateContent('Test custom model');
          const customResponse = await customResult.response;
          const customText = customResponse.text();
          
          console.log(`✅ CUSTOM MODEL SUCCESS: "${customName}"`);
          console.log(`Response: ${customText.substring(0, 100)}...`);
          return; // Exit if custom model works
          
        } catch (customError) {
          console.log(`❌ Custom model failed: "${customName}" - ${customError.message}`);
        }
      }
      
      return; // Exit after testing custom models
      
    } catch (error) {
      console.log(`❌ FAILED with model: ${modelName} - ${error.message}`);
    }
  }
}

listAvailableModels().catch(console.error);
