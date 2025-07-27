const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function testStrategy2SameXIDiffCaptains() {
  const apiKey = process.env.GEMINI_API_KEY;
  const gemName = process.env.DREAM11_GEM_NAME || 'Dream11 MultiTeam Creator';
  const baseModel = process.env.GEMINI_BASE_MODEL || 'gemini-2.0-flash';
  
  console.log('🏏 Testing Dream11 Gem - Strategy 2: SAME_XI_DIFF_C_VC');
  console.log('📋 Match: India vs Australia');
  console.log('🎯 Strategy: Same XI with Different Captains/Vice-Captains');
  console.log('📊 Teams to Generate: 5');
  console.log(`🤖 Using Gem: "${gemName}" on ${baseModel}\n`);
  
  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    // Initialize Dream11 Gem with system instructions
    console.log('🔧 Initializing Dream11 Gem...');
    const gemModel = genAI.getGenerativeModel({ 
      model: baseModel,
      systemInstruction: {
        role: "system",
        parts: [{ text: `Use ${gemName} instructions for Dream11 fantasy cricket team generation` }]
      }
    });
    console.log('✅ Gem initialized successfully!\n');
    
    // Strategy 2: SAME_XI_DIFF_C_VC Request
    const strategy2Request = {
      "strategy_id": "SAME_XI_DIFF_C_VC",
      "strategy_details": {
        "match_type": "T20I",
        "team_count": 5,
        "base_team_preference": "balanced",
        "captain_rotation": {
          "primary_captains": ["Virat Kohli", "Steve Smith", "Rohit Sharma", "David Warner"],
          "vice_captain_options": ["Hardik Pandya", "Glenn Maxwell", "Pat Cummins", "Jasprit Bumrah"],
          "distribution_strategy": "even_spread"
        },
        "team_constraints": {
          "max_credits": 100,
          "min_players_per_team": 4,
          "max_players_per_team": 7,
          "role_distribution": {
            "wicket_keepers": "1-2",
            "batsmen": "3-5", 
            "all_rounders": "2-4",
            "bowlers": "3-5"
          }
        }
      },
      "player_pool": [
        // India Players
        {"player_name": "Virat Kohli", "role": "Batsman", "team": "India", "credits": 11.0},
        {"player_name": "Rohit Sharma", "role": "Batsman", "team": "India", "credits": 10.5},
        {"player_name": "KL Rahul", "role": "Wicket-keeper", "team": "India", "credits": 9.5},
        {"player_name": "Hardik Pandya", "role": "All-rounder", "team": "India", "credits": 10.0},
        {"player_name": "Ravindra Jadeja", "role": "All-rounder", "team": "India", "credits": 9.0},
        {"player_name": "Jasprit Bumrah", "role": "Bowler", "team": "India", "credits": 9.5},
        {"player_name": "Mohammed Shami", "role": "Bowler", "team": "India", "credits": 8.5},
        {"player_name": "Yuzvendra Chahal", "role": "Bowler", "team": "India", "credits": 8.0},
        {"player_name": "Shubman Gill", "role": "Batsman", "team": "India", "credits": 9.0},
        {"player_name": "Rishabh Pant", "role": "Wicket-keeper", "team": "India", "credits": 9.5},
        {"player_name": "Ravichandran Ashwin", "role": "All-rounder", "team": "India", "credits": 8.5},
        
        // Australia Players  
        {"player_name": "Steve Smith", "role": "Batsman", "team": "Australia", "credits": 10.5},
        {"player_name": "David Warner", "role": "Batsman", "team": "Australia", "credits": 10.0},
        {"player_name": "Glenn Maxwell", "role": "All-rounder", "team": "Australia", "credits": 9.5},
        {"player_name": "Pat Cummins", "role": "Bowler", "team": "Australia", "credits": 9.5},
        {"player_name": "Mitchell Starc", "role": "Bowler", "team": "Australia", "credits": 9.0},
        {"player_name": "Josh Hazlewood", "role": "Bowler", "team": "Australia", "credits": 8.5},
        {"player_name": "Alex Carey", "role": "Wicket-keeper", "team": "Australia", "credits": 8.5},
        {"player_name": "Marcus Stoinis", "role": "All-rounder", "team": "Australia", "credits": 8.5},
        {"player_name": "Adam Zampa", "role": "Bowler", "team": "Australia", "credits": 8.0},
        {"player_name": "Travis Head", "role": "Batsman", "team": "Australia", "credits": 9.0},
        {"player_name": "Cameron Green", "role": "All-rounder", "team": "Australia", "credits": 8.5}
      ]
    };
    
    console.log('📤 Sending Strategy 2 request to Dream11 Gem...');
    console.log('🔄 Processing request (this may take a moment)...\n');
    
    // Send request to Dream11 Gem
    const startTime = Date.now();
    const result = await gemModel.generateContent(JSON.stringify(strategy2Request, null, 2));
    const response = await result.response;
    const gemResponse = response.text();
    const endTime = Date.now();
    
    console.log(`⏱️  Response received in ${endTime - startTime}ms`);
    console.log(`📏 Response length: ${gemResponse.length} characters\n`);
    
    // Display the response
    console.log('🎯 DREAM11 GEM RESPONSE:');
    console.log('=' + '='.repeat(80));
    console.log(gemResponse);
    console.log('=' + '='.repeat(80));
    
    // Analyze the response content
    console.log('\n🔍 RESPONSE ANALYSIS:');
    const hasTeams = gemResponse.toLowerCase().includes('team');
    const hasCaptains = gemResponse.toLowerCase().includes('captain');
    const hasViceCaptains = gemResponse.toLowerCase().includes('vice');
    const hasPlayers = gemResponse.toLowerCase().includes('player');
    const hasCredits = gemResponse.toLowerCase().includes('credit');
    const hasStrategy = gemResponse.toLowerCase().includes('strategy') || gemResponse.toLowerCase().includes('same');
    
    console.log(`✅ Contains Teams: ${hasTeams}`);
    console.log(`✅ Contains Captains: ${hasCaptains}`);
    console.log(`✅ Contains Vice-Captains: ${hasViceCaptains}`);
    console.log(`✅ Contains Players: ${hasPlayers}`);
    console.log(`✅ Contains Credits: ${hasCredits}`);
    console.log(`✅ Contains Strategy Info: ${hasStrategy}`);
    
    // Check for team count
    const teamMatches = gemResponse.match(/team\s*[1-5]/gi);
    const teamCount = teamMatches ? teamMatches.length : 0;
    console.log(`📊 Detected Teams: ${teamCount}/5 requested`);
    
    // Success metrics
    const successScore = [hasTeams, hasCaptains, hasViceCaptains, hasPlayers, hasCredits, hasStrategy].filter(Boolean).length;
    console.log(`🏆 Success Score: ${successScore}/6`);
    
    if (successScore >= 4) {
      console.log('🎉 SUCCESS: Dream11 Gem generated Strategy 2 teams successfully!');
    } else {
      console.log('⚠️  WARNING: Response may not contain complete team data');
    }
    
  } catch (error) {
    console.error('❌ ERROR: Failed to test Strategy 2 with Dream11 Gem');
    console.error('Error message:', error.message);
    
    if (error.message.includes('not found')) {
      console.log('\n💡 TROUBLESHOOTING SUGGESTIONS:');
      console.log('1. Verify your Dream11 Gem is published and active');
      console.log('2. Check if gemini-2.0-flash is available in your region');
      console.log('3. Ensure your API key has access to Gems');
      console.log('4. Try testing in AI Studio first');
    }
  }
}

console.log('🚀 Starting Strategy 2 Test: Same XI with Different Captains\n');
testStrategy2SameXIDiffCaptains().catch(console.error);
