import { aiService } from '../lib/ai-service-enhanced';

// Mock player data with dream_team_percentage for testing
const mockPlayers = [
  // India players
  { id: 1, name: 'V Kohli', full_name: 'Virat Kohli', team_name: 'India', player_role: 'BAT', credits: 11.5, selection_percentage: 85.2, points: 58, is_playing_today: true, country: 'India', batting_style: 'RH', bowling_style: 'RH', dream_team_percentage: 78.5 },
  { id: 2, name: 'R Sharma', full_name: 'Rohit Sharma', team_name: 'India', player_role: 'BAT', credits: 11.0, selection_percentage: 78.5, points: 52, is_playing_today: true, country: 'India', batting_style: 'RH', bowling_style: 'RH', dream_team_percentage: 72.3 },
  { id: 3, name: 'J Bumrah', full_name: 'Jasprit Bumrah', team_name: 'India', player_role: 'BWL', credits: 10.5, selection_percentage: 72.3, points: 45, is_playing_today: true, country: 'India', batting_style: 'RH', bowling_style: 'RH', dream_team_percentage: 65.8 },
  { id: 4, name: 'R Pant', full_name: 'Rishabh Pant', team_name: 'India', player_role: 'WK', credits: 10.0, selection_percentage: 68.7, points: 41, is_playing_today: true, country: 'India', batting_style: 'LH', bowling_style: 'RH', dream_team_percentage: 58.9 },
  { id: 5, name: 'H Pandya', full_name: 'Hardik Pandya', team_name: 'India', player_role: 'AR', credits: 9.5, selection_percentage: 65.1, points: 38, is_playing_today: true, country: 'India', batting_style: 'RH', bowling_style: 'RH', dream_team_percentage: 52.4 },
  { id: 6, name: 'K Rahul', full_name: 'KL Rahul', team_name: 'India', player_role: 'WK', credits: 9.0, selection_percentage: 58.9, points: 35, is_playing_today: true, country: 'India', batting_style: 'RH', bowling_style: 'RH', dream_team_percentage: 46.7 },
  { id: 7, name: 'R Ashwin', full_name: 'Ravichandran Ashwin', team_name: 'India', player_role: 'BWL', credits: 8.5, selection_percentage: 45.6, points: 32, is_playing_today: true, country: 'India', batting_style: 'RH', bowling_style: 'RH', dream_team_percentage: 38.2 },
  { id: 8, name: 'S Gill', full_name: 'Shubman Gill', team_name: 'India', player_role: 'BAT', credits: 8.0, selection_percentage: 42.3, points: 28, is_playing_today: true, country: 'India', batting_style: 'RH', bowling_style: 'RH', dream_team_percentage: 35.6 },
  { id: 9, name: 'Y Chahal', full_name: 'Yuzvendra Chahal', team_name: 'India', player_role: 'BWL', credits: 7.5, selection_percentage: 38.7, points: 25, is_playing_today: true, country: 'India', batting_style: 'RH', bowling_style: 'LH', dream_team_percentage: 29.8 },
  { id: 10, name: 'M Shami', full_name: 'Mohammed Shami', team_name: 'India', player_role: 'BWL', credits: 7.0, selection_percentage: 35.2, points: 22, is_playing_today: true, country: 'India', batting_style: 'RH', bowling_style: 'RH', dream_team_percentage: 25.4 },
  { id: 11, name: 'R Jadeja', full_name: 'Ravindra Jadeja', team_name: 'India', player_role: 'AR', credits: 8.5, selection_percentage: 48.9, points: 30, is_playing_today: true, country: 'India', batting_style: 'LH', bowling_style: 'LH', dream_team_percentage: 41.3 },
  
  // Australia players
  { id: 12, name: 'S Smith', full_name: 'Steven Smith', team_name: 'Australia', player_role: 'BAT', credits: 11.0, selection_percentage: 82.1, points: 55, is_playing_today: true, country: 'Australia', batting_style: 'RH', bowling_style: 'LH', dream_team_percentage: 75.6 },
  { id: 13, name: 'D Warner', full_name: 'David Warner', team_name: 'Australia', player_role: 'BAT', credits: 10.5, selection_percentage: 76.8, points: 48, is_playing_today: true, country: 'Australia', batting_style: 'LH', bowling_style: 'RH', dream_team_percentage: 68.9 },
  { id: 14, name: 'P Cummins', full_name: 'Pat Cummins', team_name: 'Australia', player_role: 'BWL', credits: 10.0, selection_percentage: 69.5, points: 42, is_playing_today: true, country: 'Australia', batting_style: 'RH', bowling_style: 'RH', dream_team_percentage: 62.3 },
  { id: 15, name: 'A Carey', full_name: 'Alex Carey', team_name: 'Australia', player_role: 'WK', credits: 8.5, selection_percentage: 52.3, points: 33, is_playing_today: true, country: 'Australia', batting_style: 'LH', bowling_style: 'RH', dream_team_percentage: 44.8 },
  { id: 16, name: 'G Maxwell', full_name: 'Glenn Maxwell', team_name: 'Australia', player_role: 'AR', credits: 9.0, selection_percentage: 58.7, points: 36, is_playing_today: true, country: 'Australia', batting_style: 'RH', bowling_style: 'RH', dream_team_percentage: 48.2 },
  { id: 17, name: 'M Labuschagne', full_name: 'Marnus Labuschagne', team_name: 'Australia', player_role: 'BAT', credits: 9.5, selection_percentage: 61.2, points: 39, is_playing_today: true, country: 'Australia', batting_style: 'RH', bowling_style: 'LH', dream_team_percentage: 51.6 },
  { id: 18, name: 'J Hazlewood', full_name: 'Josh Hazlewood', team_name: 'Australia', player_role: 'BWL', credits: 8.0, selection_percentage: 44.7, points: 28, is_playing_today: true, country: 'Australia', batting_style: 'RH', bowling_style: 'RH', dream_team_percentage: 34.2 },
  { id: 19, name: 'M Stoinis', full_name: 'Marcus Stoinis', team_name: 'Australia', player_role: 'AR', credits: 7.5, selection_percentage: 38.2, points: 24, is_playing_today: true, country: 'Australia', batting_style: 'RH', bowling_style: 'RH', dream_team_percentage: 28.6 },
  { id: 20, name: 'A Zampa', full_name: 'Adam Zampa', team_name: 'Australia', player_role: 'BWL', credits: 7.0, selection_percentage: 32.8, points: 20, is_playing_today: true, country: 'Australia', batting_style: 'RH', bowling_style: 'RH', dream_team_percentage: 23.4 },
  { id: 21, name: 'T Head', full_name: 'Travis Head', team_name: 'Australia', player_role: 'BAT', credits: 8.5, selection_percentage: 49.3, points: 31, is_playing_today: true, country: 'Australia', batting_style: 'LH', bowling_style: 'RH', dream_team_percentage: 39.7 },
  { id: 22, name: 'M Marsh', full_name: 'Mitchell Marsh', team_name: 'Australia', player_role: 'AR', credits: 8.0, selection_percentage: 42.6, points: 26, is_playing_today: true, country: 'Australia', batting_style: 'RH', bowling_style: 'RH', dream_team_percentage: 32.1 }
];

// Mock match data
const mockMatch = {
  id: 1,
  team_name: 'India vs Australia',
  match_venue: 'Wankhede Stadium, Mumbai',
  match_date: new Date('2025-07-15'),
  match_format: 'T20',
  is_active: true,
  start_time: '19:30',
  end_time: '23:00',
  is_upcoming: true,
  status: 'Scheduled',
  venue_condition: 'Dry',
  pitch_condition: 'Flat',
  weather_condition: 'Clear'
};

// Mock the data integration service
const originalDataIntegration = require('../lib/data-integration');
const mockDataIntegration = {
  getMatchData: async (matchId: number) => {
    console.log(`🔍 Mock: Getting match data for ${matchId}`);
    return {
      match: mockMatch,
      players: mockPlayers
    };
  },
  
  getPlayersForMatch: async (matchId: number) => {
    console.log(`🔍 Mock: Getting players for match ${matchId}`);
    return mockPlayers;
  }
};

// Replace the data integration service temporarily
originalDataIntegration.dataIntegrationService = mockDataIntegration;

async function testStrategy5() {
  console.log('🚀 Testing Strategy 5 with Stats-Driven Guardrails...\n');
  
  // Test case 1: Basic filtering with varied team generation
  console.log('=== Test Case 1: Basic filtering ===');
  const testPreferences1 = {
    filters: {
      dreamTeamPercentage: { min: 30, max: 100 },
      selectionPercentage: { min: 40, max: 100 },
      averagePoints: { min: 20, max: 100 },
      playerRoles: {
        batsmen: { min: 3, max: 5 },
        bowlers: { min: 3, max: 5 },
        allRounders: { min: 1, max: 3 },
        wicketKeepers: { min: 1, max: 2 }
      }
    }
  };
  
  try {
    const teams1 = await aiService.generateTeamsWithAIStrategy({
      matchId: 1,
      strategy: 'stats-driven-guardrails',
      teamCount: 5,
      userPreferences: testPreferences1
    });
    
    console.log(`✅ Generated ${teams1.length} teams`);
    
    // Analyze team variations
    const captains = teams1.map(team => team.captain?.name || 'Unknown');
    const viceCaptains = teams1.map(team => team.viceCaptain?.name || 'Unknown');
    
    console.log('Captains:', captains);
    console.log('Vice Captains:', viceCaptains);
    
    // Check for unique captains and vice captains
    const uniqueCaptains = new Set(captains);
    const uniqueViceCaptains = new Set(viceCaptains);
    
    console.log(`Unique Captains: ${uniqueCaptains.size}/${teams1.length}`);
    console.log(`Unique Vice Captains: ${uniqueViceCaptains.size}/${teams1.length}`);
    
    // Analyze player overlap between teams
    const playerSets = teams1.map(team => 
      new Set(team.players.map(p => p.name))
    );
    
    console.log('\\nTeam Composition Analysis:');
    for (let i = 0; i < teams1.length; i++) {
      const team = teams1[i];
      const roleCounts = team.players.reduce((acc, p) => {
        acc[p.player_role] = (acc[p.player_role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.log(`Team ${i + 1}: ${JSON.stringify(roleCounts)}, Credits: ${team.totalCredits.toFixed(1)}`);
    }
    
    // Check overlap between teams
    console.log('\\nTeam Overlap Analysis:');
    for (let i = 0; i < teams1.length - 1; i++) {
      for (let j = i + 1; j < teams1.length; j++) {
        const intersection = Array.from(playerSets[i]).filter(x => playerSets[j].has(x));
        console.log(`Teams ${i + 1} vs ${j + 1}: ${intersection.length}/11 common players`);
      }
    }
    
  } catch (error) {
    console.error('❌ Test Case 1 failed:', error);
  }
  
  console.log('\\n=== Test Case 2: Strict filtering ===');
  const testPreferences2 = {
    filters: {
      dreamTeamPercentage: { min: 50, max: 100 },
      selectionPercentage: { min: 60, max: 100 },
      averagePoints: { min: 35, max: 100 },
      playerRoles: {
        batsmen: { min: 3, max: 5 },
        bowlers: { min: 3, max: 5 },
        allRounders: { min: 1, max: 3 },
        wicketKeepers: { min: 1, max: 2 }
      }
    }
  };
  
  try {
    const teams2 = await aiService.generateTeamsWithAIStrategy({
      matchId: 1,
      strategy: 'stats-driven-guardrails',
      teamCount: 3,
      userPreferences: testPreferences2
    });
    
    console.log(`✅ Generated ${teams2.length} teams with strict filtering`);
    
    // Show filtered player pool
    console.log('\\nFiltered Player Pool:');
    teams2.forEach((team, index) => {
      console.log(`Team ${index + 1}:`, team.players.map(p => 
        `${p.name} (${p.player_role}, ${p.credits}c, DT:${p.dream_team_percentage}%)`
      ).join(', '));
    });
    
  } catch (error) {
    console.error('❌ Test Case 2 failed:', error);
  }
  
  console.log('\\n🎯 Strategy 5 testing completed!');
}

// Run the test
testStrategy5().catch(console.error);
