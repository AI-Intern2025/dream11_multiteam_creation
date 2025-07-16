import { AIService } from './lib/ai-service-enhanced';

// Simple test without external dependencies
async function testStrategy8() {
  console.log('🧪 Testing Strategy 8: Base Team + Rule-Based Edits');
  
  const aiService = new AIService();
  
  // Mock base team data with more realistic players for a larger available pool
  const mockBaseTeam = [
    { id: 1, name: 'Virat Kohli', full_name: 'Virat Kohli', player_role: 'BAT', credits: 10.5, points: 89, dream_team_percentage: 35, selection_percentage: 45, team_name: 'India', is_playing_today: true, country: 'IND', batting_style: 'RHB', bowling_style: 'N/A' },
    { id: 2, name: 'Rohit Sharma', full_name: 'Rohit Sharma', player_role: 'BAT', credits: 10.0, points: 85, dream_team_percentage: 30, selection_percentage: 42, team_name: 'India', is_playing_today: true, country: 'IND', batting_style: 'RHB', bowling_style: 'N/A' },
    { id: 3, name: 'Alex Carey', full_name: 'Alex Carey', player_role: 'WK', credits: 8.5, points: 52, dream_team_percentage: 20, selection_percentage: 25, team_name: 'Australia', is_playing_today: true, country: 'AUS', batting_style: 'LHB', bowling_style: 'N/A' },
    { id: 4, name: 'Glenn Maxwell', full_name: 'Glenn Maxwell', player_role: 'AR', credits: 9.0, points: 65, dream_team_percentage: 25, selection_percentage: 32, team_name: 'Australia', is_playing_today: true, country: 'AUS', batting_style: 'RHB', bowling_style: 'OS' },
    { id: 5, name: 'Hardik Pandya', full_name: 'Hardik Pandya', player_role: 'AR', credits: 9.5, points: 78, dream_team_percentage: 28, selection_percentage: 38, team_name: 'India', is_playing_today: true, country: 'IND', batting_style: 'RHB', bowling_style: 'RF' },
    { id: 6, name: 'Mitchell Starc', full_name: 'Mitchell Starc', player_role: 'BWL', credits: 9.0, points: 55, dream_team_percentage: 22, selection_percentage: 28, team_name: 'Australia', is_playing_today: true, country: 'AUS', batting_style: 'LHB', bowling_style: 'LF' },
    { id: 7, name: 'Jasprit Bumrah', full_name: 'Jasprit Bumrah', player_role: 'BWL', credits: 9.5, points: 68, dream_team_percentage: 32, selection_percentage: 35, team_name: 'India', is_playing_today: true, country: 'IND', batting_style: 'RHB', bowling_style: 'RF' },
    { id: 8, name: 'Ravichandran Ashwin', full_name: 'Ravichandran Ashwin', player_role: 'BWL', credits: 8.5, points: 45, dream_team_percentage: 18, selection_percentage: 22, team_name: 'India', is_playing_today: true, country: 'IND', batting_style: 'RHB', bowling_style: 'OS' },
    { id: 9, name: 'Travis Head', full_name: 'Travis Head', player_role: 'BAT', credits: 8.5, points: 58, dream_team_percentage: 24, selection_percentage: 29, team_name: 'Australia', is_playing_today: true, country: 'AUS', batting_style: 'LHB', bowling_style: 'OS' },
    { id: 10, name: 'Steve Smith', full_name: 'Steve Smith', player_role: 'BAT', credits: 10.0, points: 82, dream_team_percentage: 29, selection_percentage: 40, team_name: 'Australia', is_playing_today: true, country: 'AUS', batting_style: 'RHB', bowling_style: 'LBG' },
    { id: 11, name: 'Pat Cummins', full_name: 'Pat Cummins', player_role: 'BWL', credits: 9.0, points: 62, dream_team_percentage: 26, selection_percentage: 31, team_name: 'Australia', is_playing_today: true, country: 'AUS', batting_style: 'RHB', bowling_style: 'RF' }
  ];

  const mockOptimizationRules = {
    primaryParameter: 'dreamTeamPercentage' as const,
    editIntensity: 'moderate' as const,
    guardrails: {
      maxPerRole: { batsmen: 6, bowlers: 5, allRounders: 4, wicketKeepers: 2 },
      maxPerTeam: { teamA: 7, teamB: 7 },
      minCredits: 95,
      maxCredits: 100
    },
    preferences: {
      bowlingStyle: 'balanced' as const,
      battingOrder: 'balanced' as const,
      riskTolerance: 'medium' as const
    }
  };

  const request = {
    strategy: 'base-team-edits' as const,
    matchId: 1,
    teamCount: 5, // Generate 5 teams to test diversity
    userPreferences: {
      baseTeam: mockBaseTeam,
      optimizationRules: mockOptimizationRules,
      teamNames: { teamA: 'India', teamB: 'Australia' }
    }
  };
  
  try {
    console.log('📋 Base team:', mockBaseTeam.map(p => p.name).join(', '));
    console.log('⚙️  Rules:', JSON.stringify(mockOptimizationRules, null, 2));
    
    console.log('🚀 Starting team generation...');
    const result = await Promise.race([
      aiService.generateBaseTeamVariations(request),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout after 30 seconds')), 30000))
    ]) as any[];
    
    console.log('📊 Results:');
    const teamComparisons: Array<{
      index: number;
      players: string[];
      captain: string | undefined;
      viceCaptain: string | undefined;
      changedCount: number;
    }> = [];
    
    result.forEach((team, i) => {
      console.log(`\n🏏 Team ${i + 1}:`);
      console.log(`  Players: ${team.players.map(p => p.name).join(', ')}`);
      console.log(`  Captain: ${team.captain?.name}, Vice: ${team.viceCaptain?.name}`);
      
      // Validate captain and vice-captain
      if (team.captain && team.viceCaptain) {
        if (team.captain.id === team.viceCaptain.id) {
          console.log(`  ❌ ERROR: Captain and Vice-Captain are the same player (${team.captain.name})`);
        } else {
          console.log(`  ✅ Captain and Vice-Captain are different players`);
        }
      } else {
        console.log(`  ❌ ERROR: Missing captain or vice-captain`);
      }
      
      console.log(`  Total Credits: ${team.players.reduce((sum, p) => sum + (p.credits || 0), 0).toFixed(1)}`);
      console.log(`  Reasoning: ${team.reasoning || 'No reasoning provided'}`);
      
      // Check if this team is different from base team
      const changedPlayers = team.players.filter(p => !mockBaseTeam.find(bp => bp.id === p.id));
      console.log(`  Changes: ${changedPlayers.length} players (${changedPlayers.map(p => p.name).join(', ')})`);
      
      // Store for comparison
      teamComparisons.push({
        index: i + 1,
        players: team.players.map(p => p.name).sort(),
        captain: team.captain?.name,
        viceCaptain: team.viceCaptain?.name,
        changedCount: changedPlayers.length
      });
    });
    
    // Compare teams to check for diversity
    console.log('\n🔍 Team Diversity Analysis:');
    for (let i = 0; i < teamComparisons.length; i++) {
      for (let j = i + 1; j < teamComparisons.length; j++) {
        const team1 = teamComparisons[i];
        const team2 = teamComparisons[j];
        
        // Check if player lists are identical
        const playersIdentical = JSON.stringify(team1.players) === JSON.stringify(team2.players);
        const captainIdentical = team1.captain === team2.captain && team1.viceCaptain === team2.viceCaptain;
        
        if (playersIdentical && captainIdentical) {
          console.log(`❌ Team ${team1.index} and Team ${team2.index} are IDENTICAL`);
        } else if (playersIdentical) {
          console.log(`⚠️  Team ${team1.index} and Team ${team2.index} have same players, different C/VC`);
        } else {
          console.log(`✅ Team ${team1.index} and Team ${team2.index} are DIFFERENT`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing Strategy 8:', error);
  }
}

testStrategy8();
