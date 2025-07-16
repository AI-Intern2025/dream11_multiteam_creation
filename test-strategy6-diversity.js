// Test script to verify Strategy 6 diversity implementation
const { presetStrategyService } = require('./lib/preset-strategy-service');

async function testDiversityImplementation() {
  console.log('🧪 Testing Strategy 6 Diversity Implementation...\n');
  
  try {
    // Test with a sample request
    const testRequest = {
      matchId: 1,
      presetId: 'balanced-roles',
      teamCount: 5,
      teamNames: {
        teamA: 'India',
        teamB: 'Australia'
      }
    };
    
    console.log('📝 Test Request:', JSON.stringify(testRequest, null, 2));
    
    // Generate teams
    const teams = await presetStrategyService.generatePresetTeams(testRequest);
    
    console.log(`\n✅ Generated ${teams.length} teams successfully!\n`);
    
    // Check diversity between teams
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        const team1 = teams[i];
        const team2 = teams[j];
        
        const team1Players = new Set(team1.players.map(p => p.id));
        const team2Players = new Set(team2.players.map(p => p.id));
        
        const commonPlayers = Array.from(team1Players).filter(id => team2Players.has(id));
        const differentPlayers = Array.from(team1Players).filter(id => !team2Players.has(id));
        
        const diversityPercentage = (differentPlayers.length / 11) * 100;
        
        console.log(`🔍 Team ${i + 1} vs Team ${j + 1}:`);
        console.log(`   Common players: ${commonPlayers.length}/11 (${((commonPlayers.length / 11) * 100).toFixed(1)}%)`);
        console.log(`   Different players: ${differentPlayers.length}/11 (${diversityPercentage.toFixed(1)}%)`);
        console.log(`   Diversity requirement: ${diversityPercentage >= 25 ? '✅ PASSED' : '❌ FAILED'} (need ≥25%)\n`);
      }
    }
    
    // Display team summaries
    console.log('📊 Team Summaries:');
    teams.forEach((team, index) => {
      console.log(`\n🏏 Team ${index + 1}:`);
      console.log(`   Captain: ${team.captain.name} (${team.captain.player_role})`);
      console.log(`   Vice Captain: ${team.viceCaptain.name} (${team.viceCaptain.player_role})`);
      console.log(`   Players: ${team.players.map(p => `${p.name} (${p.player_role})`).join(', ')}`);
      console.log(`   Expected Points: ${team.expectedPoints}`);
      console.log(`   Risk Score: ${team.riskScore}`);
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testDiversityImplementation().catch(console.error);
