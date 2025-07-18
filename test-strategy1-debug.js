// Quick test script to debug Strategy 1 AI-guided team generation
const { aiService } = require('./lib/ai-service-enhanced.ts');

async function testStrategy1() {
  console.log('🧪 Testing Strategy 1 AI-Guided Team Generation');
  
  const testRequest = {
    matchId: 1,
    strategy: 'ai-guided',
    teamCount: 3,
    userInsights: {
      matchWinner: 'Team A',
      scoreRange: 'High-scoring (180-210)',
      backedPlayers: ['Top Order Focus', 'All-rounders'],
      matchNarrative: 'Batters dominate from start',
      riskAppetite: 'Balanced Approach',
      customInputs: []
    },
    conversationHistory: [
      { sender: 'user', text: 'Team A', timestamp: new Date() },
      { sender: 'user', text: 'High-scoring (180-210)', timestamp: new Date() }
    ],
    captainDistribution: [
      { captain: 'Top Order Batsman', viceCaptain: 'All-rounder', percentage: 60 },
      { captain: 'All-rounder', viceCaptain: 'Top Order Batsman', percentage: 40 }
    ]
  };
  
  try {
    console.log('📤 Sending request:', JSON.stringify(testRequest, null, 2));
    
    const teams = await aiService.generateTeamsWithAIStrategy(testRequest);
    
    console.log('✅ Generated teams:', teams.length);
    teams.forEach((team, index) => {
      console.log(`Team ${index + 1}:`, {
        playersCount: team.players.length,
        captain: team.captain.name || team.captain.player_name || 'Unknown',
        viceCaptain: team.viceCaptain.name || team.viceCaptain.player_name || 'Unknown',
        totalCredits: team.totalCredits,
        confidence: team.confidence
      });
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testStrategy1();
