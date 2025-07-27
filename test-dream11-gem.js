const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function testDream11Gem() {
  const apiKey = process.env.GEMINI_API_KEY;
  const gemName = process.env.DREAM11_GEM_NAME || 'Dream11 MultiTeam Creator';
  const baseModel = process.env.GEMINI_BASE_MODEL || 'gemini-2.0-flash';
  
  console.log('🎯 Testing Dream11 Gem Integration...');
  console.log(`Gem Name: ${gemName}`);
  console.log(`Base Model: ${baseModel}`);
  console.log('API Key available:', !!apiKey);
  
  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    // Test standard model first
    console.log('\n🧪 Testing standard gemini-1.5-flash...');
    const standardModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const standardResult = await standardModel.generateContent('Hello, this is a test message');
    const standardResponse = await standardResult.response;
    console.log('✅ Standard model works:', standardResponse.text().substring(0, 50) + '...');
    
    // Test Dream11 Gem with system instructions
    console.log(`\n🎯 Testing Dream11 Gem: "${gemName}" on ${baseModel}...`);
    
    const gemModel = genAI.getGenerativeModel({ 
      model: baseModel,
      systemInstruction: {
        role: "system",
        parts: [{ text: `Use ${gemName} instructions for Dream11 fantasy cricket team generation` }]
      }
    });
    
    // Test with JSON request format
    const testJsonRequest = {
      "strategy_id": "AI_CONVERSATIONAL",
      "strategy_details": {
        "match_outcome": "Team A Wins (High Confidence)",
        "key_players": ["Top Order Batsmen"],
        "risk_appetite": "balanced",
        "team_count": 2
      },
      "player_pool": [
        {"player_name": "Player A", "role": "Batsman", "team": "Team A", "credits": 9.5},
        {"player_name": "Player B", "role": "Bowler", "team": "Team B", "credits": 8.0}
      ]
    };
    
    const gemResult = await gemModel.generateContent(JSON.stringify(testJsonRequest, null, 2));
    const gemResponse = await gemResult.response;
    const gemText = gemResponse.text();
    
    console.log('✅ SUCCESS: Dream11 Gem responded!');
    console.log('Response length:', gemText.length);
    console.log('Response preview:', gemText.substring(0, 200) + '...');
    
    // Check if response contains expected Dream11 content
    const hasDream11Content = gemText.includes('Team') || gemText.includes('Captain') || gemText.includes('Player');
    console.log('Contains Dream11 content:', hasDream11Content);
    
  } catch (error) {
    console.error('❌ Error testing Dream11 Gem:', error.message);
    
    // Test if it's a model availability issue
    if (error.message.includes('not found')) {
      console.log('\n🔍 Checking available models...');
      console.log('Possible issues:');
      console.log('1. gemini-2.0-flash might not be available in your region');
      console.log('2. Your Gem might not be published/active');
      console.log('3. API key might not have access to Gems');
      
      // Try with gemini-1.5-flash as fallback
      console.log('\n🔄 Trying with gemini-1.5-flash as base model...');
      try {
        const fallbackModel = genAI.getGenerativeModel({ 
          model: 'gemini-1.5-flash',
          systemInstruction: {
            role: "system",
            parts: [{ text: `Use ${gemName} instructions for Dream11 fantasy cricket team generation` }]
          }
        });
        
        const fallbackResult = await fallbackModel.generateContent('Test Dream11 team generation');
        const fallbackResponse = await fallbackResult.response;
        console.log('✅ Fallback with gemini-1.5-flash works!');
        console.log('Response:', fallbackResponse.text().substring(0, 100) + '...');
        
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError.message);
      }
    }
  }
}

testDream11Gem().catch(console.error);
