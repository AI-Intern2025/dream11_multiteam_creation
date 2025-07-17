const { neonDB } = require('./lib/neon-db');

async function testStrategy7Presets() {
  console.log('🧪 Testing Enhanced Strategy 7 Preset Configurations...\n');

  try {
    // Test database connection
    console.log('📡 Testing database connection...');
    const matches = await neonDB.getUpcomingMatches();
    
    if (matches.length === 0) {
      console.log('⚠️ No matches found in database');
      return;
    }

    const testMatch = matches[0];
    console.log(`🏏 Using test match: ${testMatch.team_name} (ID: ${testMatch.id})`);

    // Get players for the match
    const players = await neonDB.getPlayingPlayersForMatch(testMatch.id);
    console.log(`👥 Found ${players.length} players for the match`);

    if (players.length < 11) {
      console.log('⚠️ Not enough players to create teams');
      return;
    }

    // Test preset configurations
    const presetConfigs = [
      {
        name: 'Team A High Total, Team B Collapse',
        preset: 'team-a-bias',
        wicketKeepers: 1,
        batsmen: 4,
        allRounders: 2,
        bowlers: 4,
        teamCount: 3
      },
      {
        name: 'High Differentials Strategy',
        preset: 'high-differential',
        wicketKeepers: 1,
        batsmen: 3,
        allRounders: 3,
        bowlers: 4,
        teamCount: 3
      },
      {
        name: 'All-Rounder Heavy Lineup',
        preset: 'all-rounder-heavy',
        wicketKeepers: 1,
        batsmen: 2,
        allRounders: 4,
        bowlers: 4,
        teamCount: 3
      },
      {
        name: 'Top Order Batting Stack',
        preset: 'top-order-stack',
        wicketKeepers: 1,
        batsmen: 5,
        allRounders: 2,
        bowlers: 3,
        teamCount: 3
      },
      {
        name: 'Bowling Pitch Special',
        preset: 'bowling-special',
        wicketKeepers: 1,
        batsmen: 3,
        allRounders: 2,
        bowlers: 5,
        teamCount: 3
      }
    ];

    // Test AI Service URL
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:3001';
    console.log(`🤖 Testing AI Service at: ${aiServiceUrl}/api/ai-analysis`);

    for (const config of presetConfigs) {
      console.log(`\n🎯 Testing preset: ${config.name}`);
      
      try {
        const testRequest = {
          matchId: testMatch.id,
          strategy: 'role-split',
          teamCount: config.teamCount,
          userPreferences: {
            roleSplitConfig: config,
            teamNames: testMatch.team_name?.split(' vs ') || ['Team A', 'Team B']
          }
        };

        const response = await fetch(`${aiServiceUrl}/api/ai-analysis`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(testRequest)
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`✅ ${config.name}: Generated ${result.teams?.length || 0} teams`);
          
          if (result.teams && result.teams.length > 0) {
            const team = result.teams[0];
            console.log(`   📊 Sample team: ${team.players?.length || 0} players, Captain: ${team.captain?.name || 'N/A'}`);
            console.log(`   🎲 Reasoning: ${team.reasoning?.substring(0, 100) || 'N/A'}...`);
          }
        } else {
          console.log(`❌ ${config.name}: API Error - ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ ${config.name}: Request failed - ${error.message}`);
      }
    }

    console.log('\n🎉 Strategy 7 preset testing completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testStrategy7Presets().catch(console.error);
