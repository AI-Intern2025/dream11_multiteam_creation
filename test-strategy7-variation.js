// Test Strategy 7 Core + Variation System
async function testStrategy7Variation() {
  console.log('🧪 Testing Strategy 7 Core + Variation System');
  console.log('=' .repeat(60));

  try {
    console.log('📊 Strategy 7 Core + Variation Algorithm Test');
    console.log('- Strategy: role-split (Strategy 7)');
    console.log('- Teams to Generate: 5');
    console.log('- Target: 25%+ team diversity');
    console.log('- Method: Core players + systematic variation');
    console.log('');

    // Test the core + variation logic directly
    const mockConfig = {
      preset: 'balanced',
      name: 'Balanced Performance',
      wicketKeepers: 1,
      topOrderBatsmen: 3,
      middleOrderBatsmen: 2,
      allRounders: 2,
      spinners: 1,
      pacers: 2,
      strategicPriority: 'balanced_performance',
      riskProfile: 'medium'
    };

    // Create mock player pools by role
    const playersByRole = generateMockPlayersByRole();
    
    console.log('🎯 Mock Player Pool:');
    console.log(`- WK: ${playersByRole.WK.length} players`);
    console.log(`- BAT: ${playersByRole.BAT.length} players`); 
    console.log(`- AR: ${playersByRole.AR.length} players`);
    console.log(`- BWL: ${playersByRole.BWL.length} players`);
    console.log('');

    // Simulate the core + variation algorithm
    const teams = [];
    const targetTeams = 5;

    console.log('⚡ Simulating core + variation team generation...');
    
    for (let teamIndex = 0; teamIndex < targetTeams; teamIndex++) {
      const team = simulateCoreVariationSelection(playersByRole, mockConfig, teamIndex);
      teams.push(team);
      console.log(`✅ Team ${teamIndex + 1}: Generated ${team.players.length} players`);
    }

    console.log('');

    // Analyze team diversity
    console.log('🔍 TEAM DIVERSITY ANALYSIS');
    console.log('=' .repeat(40));

    const diversityAnalysis = analyzeTeamDiversity(teams);
    
    console.log(`📈 Average Diversity Score: ${diversityAnalysis.averageDiversity.toFixed(1)}%`);
    console.log(`🎯 Target Achievement: ${diversityAnalysis.averageDiversity >= 25 ? '✅ PASSED' : '❌ FAILED'} (Target: 25%+)`);
    console.log('');

    // Show detailed breakdown
    for (let i = 0; i < teams.length; i++) {
      const team = teams[i];
      console.log(`Team ${i + 1}:`);
      console.log(`  Players: ${team.players.map(p => `${p.name}(${p.role})`).join(', ')}`);
      
      if (i > 0) {
        const diversity = calculateDiversityBetweenTeams(teams[0], team);
        console.log(`  Diversity vs Team 1: ${diversity.toFixed(1)}% (${diversity >= 25 ? '✅' : '❌'})`);
      }
      console.log('');
    }

    // Core + Variation breakdown
    console.log('🎲 CORE + VARIATION BREAKDOWN');
    console.log('=' .repeat(40));
    
    if (teams.length >= 2) {
      const corePlayersAnalysis = analyzeCorePlayersPattern(teams);
      console.log(`Core Players (appear in most teams): ${corePlayersAnalysis.coreCount}`);
      console.log(`Variation Players (swapped between teams): ${corePlayersAnalysis.variationCount}`);
      console.log(`Core Consistency: ${corePlayersAnalysis.corePercentage.toFixed(1)}%`);
      console.log('');
      
      console.log('Core Players:');
      corePlayersAnalysis.corePlayers.forEach(player => {
        console.log(`  - ${player.name} (${player.role}) - appears in ${player.frequency}/${teams.length} teams`);
      });
    }

    console.log('');
    console.log('🎉 Strategy 7 Core + Variation Test Complete!');
    console.log(`📊 Final Result: ${diversityAnalysis.averageDiversity >= 25 ? 'SUCCESS - Teams have 25%+ variation as requested' : 'NEEDS IMPROVEMENT - Teams below 25% variation target'}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

function generateMockPlayersByRole() {
  // Generate players organized by role for Strategy 7 testing
  const playersByRole = {
    WK: [],
    BAT: [],
    AR: [],
    BWL: []
  };

  let playerId = 1;

  // Generate Wicket Keepers (4 players)
  const wkNames = ['MS Dhoni', 'Rishabh Pant', 'KL Rahul', 'Sanju Samson'];
  wkNames.forEach((name, index) => {
    playersByRole.WK.push({
      id: playerId++,
      name,
      role: 'WK',
      team: index % 2 === 0 ? 'Team A' : 'Team B',
      credits: 9.5 - (index * 0.5),
      formScore: 85 - (index * 5)
    });
  });

  // Generate Batsmen (8 players)
  const batNames = ['Virat Kohli', 'Rohit Sharma', 'Shikhar Dhawan', 'Shreyas Iyer', 
                   'Suryakumar Yadav', 'Ishan Kishan', 'Ruturaj Gaikwad', 'Prithvi Shaw'];
  batNames.forEach((name, index) => {
    playersByRole.BAT.push({
      id: playerId++,
      name,
      role: 'BAT',
      team: index % 2 === 0 ? 'Team A' : 'Team B',
      credits: 10.5 - (index * 0.3),
      formScore: 90 - (index * 3)
    });
  });

  // Generate All-rounders (6 players)
  const arNames = ['Hardik Pandya', 'Ravindra Jadeja', 'Washington Sundar', 
                  'Krunal Pandya', 'Shivam Dube', 'Venkatesh Iyer'];
  arNames.forEach((name, index) => {
    playersByRole.AR.push({
      id: playerId++,
      name,
      role: 'AR',
      team: index % 2 === 0 ? 'Team A' : 'Team B',
      credits: 9.0 - (index * 0.4),
      formScore: 88 - (index * 4)
    });
  });

  // Generate Bowlers (7 players)
  const bowlNames = ['Jasprit Bumrah', 'Mohammed Shami', 'Yuzvendra Chahal', 
                    'Rashid Khan', 'Trent Boult', 'Kagiso Rabada', 'Bhuvneshwar Kumar'];
  bowlNames.forEach((name, index) => {
    playersByRole.BWL.push({
      id: playerId++,
      name,
      role: 'BWL',
      team: index % 2 === 0 ? 'Team A' : 'Team B',
      credits: 8.5 - (index * 0.3),
      formScore: 86 - (index * 3)
    });
  });

  // Sort each role by form score (descending) to simulate AI scoring
  Object.keys(playersByRole).forEach(role => {
    playersByRole[role].sort((a, b) => b.formScore - a.formScore);
  });

  return playersByRole;
}

function simulateCoreVariationSelection(playersByRole, config, teamIndex) {
  console.log(`  🎯 Generating team ${teamIndex + 1} with core+variation logic`);
  
  const selectedPlayers = [];
  
  // Role requirements based on config
  const roleRequirements = {
    'WK': config.wicketKeepers || 1,
    'BAT': (config.topOrderBatsmen || 0) + (config.middleOrderBatsmen || 0),
    'AR': config.allRounders || 1,
    'BWL': (config.spinners || 0) + (config.pacers || 0)
  };

  // Ensure total equals 11
  const total = Object.values(roleRequirements).reduce((sum, count) => sum + count, 0);
  if (total !== 11) {
    roleRequirements['BAT'] += (11 - total); // Adjust batsmen count
  }

  for (const [role, requiredCount] of Object.entries(roleRequirements)) {
    if (requiredCount === 0) continue;
    
    const availablePlayers = playersByRole[role] || [];
    if (availablePlayers.length === 0) continue;
    
    console.log(`    📊 ${role}: Need ${requiredCount}, Available ${availablePlayers.length}`);
    
    // For Team 1 (teamIndex 0): Select top players as "core"
    if (teamIndex === 0) {
      const coreSelections = availablePlayers.slice(0, requiredCount);
      selectedPlayers.push(...coreSelections);
      console.log(`    🎯 Team 1 Core: Selected top ${coreSelections.length} ${role} players`);
    } else {
      // For subsequent teams: Mix core players with variations
      const coreCount = Math.max(1, requiredCount - Math.ceil(requiredCount * 0.4)); // Keep 60% as core
      const variationCount = requiredCount - coreCount;
      
      // Select core players (top performers)
      const coreSelections = availablePlayers.slice(0, coreCount);
      selectedPlayers.push(...coreSelections);
      
      // Create variation pool from remaining qualified players
      const variationPool = availablePlayers.slice(coreCount);
      
      if (variationPool.length > 0 && variationCount > 0) {
        // Systematic variation based on team index
        const variationSelections = selectVariationPlayers(
          variationPool,
          variationCount,
          teamIndex,
          role
        );
        selectedPlayers.push(...variationSelections);
        
        console.log(`    🔄 Team ${teamIndex + 1}: ${coreCount} core + ${variationSelections.length} variation ${role} players`);
      } else {
        // Not enough variation pool, take remaining from top
        const fallbackSelections = availablePlayers.slice(coreCount, requiredCount);
        selectedPlayers.push(...fallbackSelections);
        console.log(`    ⚠️ Team ${teamIndex + 1}: Limited variation pool for ${role}, using fallback`);
      }
    }
  }

  return {
    players: selectedPlayers,
    teamIndex: teamIndex
  };
}

function selectVariationPlayers(variationPool, count, teamIndex, role) {
  if (variationPool.length === 0 || count === 0) return [];
  
  const selections = [];
  
  // Create deterministic but varied selection based on team index
  for (let i = 0; i < count && i < variationPool.length; i++) {
    // Use different algorithms for each role to ensure variety
    let selectionIndex;
    
    if (role === 'WK') {
      // For WK, simple rotation since usually limited pool
      selectionIndex = (teamIndex - 1) % variationPool.length;
    } else if (role === 'BAT') {
      // For batsmen, use preset-specific variation patterns
      selectionIndex = ((teamIndex - 1) * 2 + i * 2) % variationPool.length;
    } else if (role === 'AR') {
      // For all-rounders, weighted towards versatility
      selectionIndex = ((teamIndex - 1) * 2 + i) % variationPool.length;
    } else if (role === 'BWL') {
      // For bowlers, consider bowling conditions
      selectionIndex = ((teamIndex - 1) * 3 + i) % variationPool.length;
    } else {
      // Default variation
      selectionIndex = ((teamIndex - 1) + i) % variationPool.length;
    }
    
    // Ensure we don't select the same player twice
    while (selections.some(p => p.id === variationPool[selectionIndex].id) && 
           selections.length < variationPool.length) {
      selectionIndex = (selectionIndex + 1) % variationPool.length;
    }
    
    selections.push(variationPool[selectionIndex]);
  }
  
  return selections;
}

function analyzeTeamDiversity(teams) {
  if (teams.length < 2) return { averageDiversity: 0 };

  let totalDiversity = 0;
  let comparisons = 0;

  // Compare each team with the first team (baseline)
  for (let i = 1; i < teams.length; i++) {
    const diversity = calculateDiversityBetweenTeams(teams[0], teams[i]);
    totalDiversity += diversity;
    comparisons++;
  }

  return {
    averageDiversity: comparisons > 0 ? totalDiversity / comparisons : 0
  };
}

function calculateDiversityBetweenTeams(team1, team2) {
  if (!team1.players || !team2.players) return 0;

  const team1PlayerIds = new Set(team1.players.map(p => p.id));
  const team2PlayerIds = new Set(team2.players.map(p => p.id));
  
  const intersection = new Set([...team1PlayerIds].filter(id => team2PlayerIds.has(id)));
  
  const commonPlayers = intersection.size;
  const totalPlayers = 11; // Each team has 11 players
  
  const diversityPercentage = ((totalPlayers - commonPlayers) / totalPlayers) * 100;
  return diversityPercentage;
}

function analyzeCorePlayersPattern(teams) {
  const playerFrequency = new Map();
  
  // Count frequency of each player across all teams
  teams.forEach(team => {
    team.players.forEach(player => {
      const key = `${player.id}_${player.name}`;
      playerFrequency.set(key, (playerFrequency.get(key) || 0) + 1);
    });
  });

  // Identify core players (appear in majority of teams)
  const majorityThreshold = Math.ceil(teams.length * 0.6); // 60% of teams
  const corePlayers = [];
  const variationPlayers = [];

  playerFrequency.forEach((frequency, playerKey) => {
    const [id, ...nameParts] = playerKey.split('_');
    const name = nameParts.join('_');
    const player = teams[0].players.find(p => p.id === parseInt(id)) || { name, role: 'Unknown' };
    
    if (frequency >= majorityThreshold) {
      corePlayers.push({ ...player, frequency });
    } else {
      variationPlayers.push({ ...player, frequency });
    }
  });

  return {
    coreCount: corePlayers.length,
    variationCount: variationPlayers.length,
    corePercentage: (corePlayers.length / 11) * 100,
    corePlayers: corePlayers.sort((a, b) => b.frequency - a.frequency)
  };
}

// Run the test
testStrategy7Variation().catch(console.error);

function analyzeTeamDiversity(teams) {
  if (teams.length < 2) return { averageDiversity: 0 };

  let totalDiversity = 0;
  let comparisons = 0;

  // Compare each team with the first team (baseline)
  for (let i = 1; i < teams.length; i++) {
    const diversity = calculateDiversityBetweenTeams(teams[0], teams[i]);
    totalDiversity += diversity;
    comparisons++;
  }

  return {
    averageDiversity: comparisons > 0 ? totalDiversity / comparisons : 0
  };
}

function calculateDiversityBetweenTeams(team1, team2) {
  if (!team1.players || !team2.players) return 0;

  const team1PlayerIds = new Set(team1.players.map(p => p.id));
  const team2PlayerIds = new Set(team2.players.map(p => p.id));
  
  const intersection = new Set([...team1PlayerIds].filter(id => team2PlayerIds.has(id)));
  const union = new Set([...team1PlayerIds, ...team2PlayerIds]);
  
  const commonPlayers = intersection.size;
  const totalPlayers = 11; // Each team has 11 players
  
  const diversityPercentage = ((totalPlayers - commonPlayers) / totalPlayers) * 100;
  return diversityPercentage;
}

function analyzeCorePlayersPattern(teams) {
  const playerFrequency = new Map();
  
  // Count frequency of each player across all teams
  teams.forEach(team => {
    team.players.forEach(player => {
      const key = `${player.id}_${player.name}`;
      playerFrequency.set(key, (playerFrequency.get(key) || 0) + 1);
    });
  });

  // Identify core players (appear in majority of teams)
  const majorityThreshold = Math.ceil(teams.length * 0.6); // 60% of teams
  const corePlayers = [];
  const variationPlayers = [];

  playerFrequency.forEach((frequency, playerKey) => {
    const [id, ...nameParts] = playerKey.split('_');
    const name = nameParts.join('_');
    const player = teams[0].players.find(p => p.id === parseInt(id)) || { name, role: 'Unknown' };
    
    if (frequency >= majorityThreshold) {
      corePlayers.push({ ...player, frequency });
    } else {
      variationPlayers.push({ ...player, frequency });
    }
  });

  return {
    coreCount: corePlayers.length,
    variationCount: variationPlayers.length,
    corePercentage: (corePlayers.length / 11) * 100,
    corePlayers: corePlayers.sort((a, b) => b.frequency - a.frequency)
  };
}

// Run the test
testStrategy7Variation().catch(console.error);
