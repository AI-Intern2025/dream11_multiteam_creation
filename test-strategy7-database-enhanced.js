const { neonDB } = require('./lib/neon-db');

async function testEnhancedStrategy7() {
  console.log('🧪 Testing Enhanced Strategy 7 with Database Stats Integration...\n');

  try {
    // Test database connection and get sample data
    console.log('📡 Testing database connection...');
    const matches = await neonDB.getUpcomingMatches();
    
    if (matches.length === 0) {
      console.log('⚠️ No matches found in database');
      return;
    }

    const testMatch = matches[0];
    console.log(`🏏 Using test match: ${testMatch.team_name} (ID: ${testMatch.id})`);

    // Get players with their advanced stats
    const players = await neonDB.getPlayingPlayersForMatch(testMatch.id);
    console.log(`👥 Found ${players.length} players for the match`);

    if (players.length < 11) {
      console.log('⚠️ Not enough players to create teams');
      return;
    }

    // Analyze player stats availability
    console.log('\n📊 Analyzing player stats availability:');
    let statsAvailable = {
      recent_form_rating: 0,
      consistency_score: 0,
      versatility_score: 0,
      venue_performance: 0,
      pitch_suitability: 0,
      weather_adaptability: 0
    };

    players.forEach(player => {
      if (player.recent_form_rating !== undefined) statsAvailable.recent_form_rating++;
      if (player.consistency_score !== undefined) statsAvailable.consistency_score++;
      if (player.versatility_score !== undefined) statsAvailable.versatility_score++;
      if (player.venue_performance !== undefined) statsAvailable.venue_performance++;
      if (player.pitch_suitability !== undefined) statsAvailable.pitch_suitability++;
      if (player.weather_adaptability !== undefined) statsAvailable.weather_adaptability++;
    });

    Object.entries(statsAvailable).forEach(([stat, count]) => {
      const percentage = ((count / players.length) * 100).toFixed(1);
      console.log(`  ${stat}: ${count}/${players.length} players (${percentage}%)`);
    });

    // Test preset configurations
    const testPresets = [
      {
        name: 'High Differentials Strategy',
        preset: 'high-differential',
        config: {
          topOrderBatsmen: 2,
          middleOrderBatsmen: 3,
          lowerOrderBatsmen: 1,
          spinners: 2,
          pacers: 2,
          wicketKeepers: 1,
          allRounders: 1,
          differentialFocus: true,
          ownershipThreshold: 20,
          preset: 'high-differential',
          teamCount: 5,
          enforceVariation: true
        }
      },
      {
        name: 'All-Rounder Heavy Lineup',
        preset: 'all-rounder-heavy',
        config: {
          topOrderBatsmen: 2,
          middleOrderBatsmen: 1,
          lowerOrderBatsmen: 1,
          spinners: 1,
          pacers: 2,
          wicketKeepers: 1,
          allRounders: 4,
          versatilityFocus: true,
          preset: 'all-rounder-heavy',
          teamCount: 5,
          enforceVariation: true
        }
      }
    ];

    // Test AI Service URL
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:3000';
    console.log(`\n🤖 Testing Enhanced Strategy 7 at: ${aiServiceUrl}/api/teams/generate`);

    for (const testPreset of testPresets) {
      console.log(`\n🎯 Testing preset: ${testPreset.name}`);
      
      try {
        const testRequest = {
          matchId: testMatch.id,
          strategy: 'role-split',
          teamCount: testPreset.config.teamCount,
          userPreferences: {
            strategy: 'role-split',
            roleSplitConfig: testPreset.config,
            teamNames: { 
              teamA: testMatch.team_name?.split(' vs ')[0] || 'Team A', 
              teamB: testMatch.team_name?.split(' vs ')[1] || 'Team B' 
            },
            matchConditions: {
              pitch: testMatch.pitch_condition,
              weather: testMatch.weather_condition,
              venue: testMatch.venue_condition
            }
          }
        };

        const response = await fetch(`${aiServiceUrl}/api/teams/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(testRequest)
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`✅ ${testPreset.name}: Generated ${result.data?.teams?.length || 0} teams`);
          
          if (result.data?.teams && result.data.teams.length > 0) {
            const teams = result.data.teams;
            
            // Analyze team diversity
            const diversityScores = [];
            const captainVariety = new Set();
            const playerVariety = new Set();
            
            teams.forEach((team, index) => {
              if (team.players && team.players.length > 0) {
                console.log(`   🏏 Team ${index + 1}: ${team.players.length} players, Captain: ${team.captain || 'N/A'}, VC: ${team.viceCaptain || 'N/A'}`);
                
                // Track captain variety
                captainVariety.add(team.captain);
                
                // Track unique players across teams
                team.players.forEach(player => {
                  playerVariety.add(player.name || player.id);
                });
                
                // Calculate diversity vs first team
                if (index > 0) {
                  const firstTeamPlayers = new Set(teams[0].players.map(p => p.name || p.id));
                  const currentTeamPlayers = new Set(team.players.map(p => p.name || p.id));
                  const differentPlayers = Array.from(currentTeamPlayers).filter(p => !firstTeamPlayers.has(p)).length;
                  const diversityPercent = (differentPlayers / 11) * 100;
                  diversityScores.push(diversityPercent);
                  console.log(`     📊 Diversity vs Team 1: ${diversityPercent.toFixed(1)}% (${differentPlayers}/11 different players)`);
                }
              }
            });
            
            const avgDiversity = diversityScores.length > 0 ? 
              (diversityScores.reduce((a, b) => a + b, 0) / diversityScores.length).toFixed(1) : 'N/A';
            
            console.log(`   📈 Summary: ${captainVariety.size} unique captains, ${playerVariety.size} unique players used, Avg diversity: ${avgDiversity}%`);
            
            if (diversityScores.length > 0 && diversityScores.every(score => score === 0)) {
              console.log(`   ⚠️ ISSUE: All teams have 0% diversity - identical players being selected!`);
            } else if (parseFloat(avgDiversity) > 25) {
              console.log(`   ✅ GOOD: Teams show meaningful diversity (>25%)`);
            } else {
              console.log(`   ⚠️ LOW: Teams show limited diversity (<25%)`);
            }
          }
        } else {
          const errorResult = await response.json();
          console.log(`❌ ${testPreset.name}: API Error - ${response.status}: ${errorResult.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.log(`❌ ${testPreset.name}: Request failed - ${error.message}`);
      }
    }

    console.log('\n🎉 Enhanced Strategy 7 testing completed!');
    console.log('\n📋 Expected Results:');
    console.log('✅ Teams should use database stats (form, consistency, venue performance)');
    console.log('✅ Preset strategies should create different team compositions'); 
    console.log('✅ Diversity scores should be >25% between teams');
    console.log('✅ Different captains should be selected across teams');
    console.log('✅ Player selection should vary based on preset strategy');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the enhanced test
testEnhancedStrategy7().catch(console.error);
