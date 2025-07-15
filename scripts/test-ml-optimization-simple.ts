import { mlOptimizationService } from '../lib/ml-optimization';
import { Player } from '../lib/neon-db';

// Simplified mock players for testing ML optimization
const mockPlayers: Player[] = [
  {
    id: 1,
    name: 'Virat Kohli',
    full_name: 'Virat Kohli',
    player_role: 'BAT',
    credits: 11.5,
    points: 85,
    dream_team_percentage: 75,
    selection_percentage: 65,
    team_name: 'RCB',
    country: 'India',
    is_playing_today: true,
    batting_style: 'Right-hand bat',
    bowling_style: 'Right-arm medium',
    recent_form_rating: 0.88,
    consistency_score: 0.82,
    versatility_score: 0.78,
    injury_risk_score: 8,
    venue_performance: 0.85,
    pitch_suitability: 0.90,
    weather_adaptability: 0.75,
    opposition_strength: 0.80,
    head_to_head_record: 0.85,
    captain_potential: 0.95,
    ownership_projection: 65,
    price_efficiency: 0.72,
    upset_potential: 0.25
  },
  {
    id: 2,
    name: 'Rohit Sharma',
    full_name: 'Rohit Sharma',
    player_role: 'BAT',
    credits: 11.0,
    points: 78,
    dream_team_percentage: 68,
    selection_percentage: 58,
    team_name: 'MI',
    country: 'India',
    is_playing_today: true,
    batting_style: 'Right-hand bat',
    bowling_style: 'Right-arm off-break',
    recent_form_rating: 0.85,
    consistency_score: 0.88,
    versatility_score: 0.75,
    injury_risk_score: 7,
    venue_performance: 0.82,
    pitch_suitability: 0.88,
    weather_adaptability: 0.78,
    opposition_strength: 0.78,
    head_to_head_record: 0.82,
    captain_potential: 0.92,
    ownership_projection: 58,
    price_efficiency: 0.71,
    upset_potential: 0.20
  },
  {
    id: 3,
    name: 'Jasprit Bumrah',
    full_name: 'Jasprit Bumrah',
    player_role: 'BWL',
    credits: 11.0,
    points: 88,
    dream_team_percentage: 82,
    selection_percentage: 78,
    team_name: 'MI',
    country: 'India',
    is_playing_today: true,
    batting_style: 'Right-hand bat',
    bowling_style: 'Right-arm fast',
    recent_form_rating: 0.92,
    consistency_score: 0.85,
    versatility_score: 0.65,
    injury_risk_score: 6,
    venue_performance: 0.90,
    pitch_suitability: 0.85,
    weather_adaptability: 0.80,
    opposition_strength: 0.88,
    head_to_head_record: 0.85,
    captain_potential: 0.75,
    ownership_projection: 78,
    price_efficiency: 0.80,
    upset_potential: 0.15
  },
  {
    id: 4,
    name: 'Hardik Pandya',
    full_name: 'Hardik Pandya',
    player_role: 'AR',
    credits: 10.5,
    points: 72,
    dream_team_percentage: 58,
    selection_percentage: 48,
    team_name: 'MI',
    country: 'India',
    is_playing_today: true,
    batting_style: 'Right-hand bat',
    bowling_style: 'Right-arm fast-medium',
    recent_form_rating: 0.75,
    consistency_score: 0.62,
    versatility_score: 0.95,
    injury_risk_score: 5,
    venue_performance: 0.70,
    pitch_suitability: 0.78,
    weather_adaptability: 0.85,
    opposition_strength: 0.75,
    head_to_head_record: 0.70,
    captain_potential: 0.80,
    ownership_projection: 48,
    price_efficiency: 0.69,
    upset_potential: 0.40
  },
  {
    id: 5,
    name: 'MS Dhoni',
    full_name: 'MS Dhoni',
    player_role: 'WK',
    credits: 10.0,
    points: 55,
    dream_team_percentage: 40,
    selection_percentage: 30,
    team_name: 'CSK',
    country: 'India',
    is_playing_today: true,
    batting_style: 'Right-hand bat',
    bowling_style: 'Right-arm medium',
    recent_form_rating: 0.60,
    consistency_score: 0.90,
    versatility_score: 0.85,
    injury_risk_score: 7,
    venue_performance: 0.65,
    pitch_suitability: 0.70,
    weather_adaptability: 0.90,
    opposition_strength: 0.70,
    head_to_head_record: 0.75,
    captain_potential: 1.0,
    ownership_projection: 30,
    price_efficiency: 0.55,
    upset_potential: 0.60
  },
  {
    id: 6,
    name: 'Rashid Khan',
    full_name: 'Rashid Khan',
    player_role: 'BWL',
    credits: 9.0,
    points: 68,
    dream_team_percentage: 52,
    selection_percentage: 42,
    team_name: 'GT',
    country: 'Afghanistan',
    is_playing_today: true,
    batting_style: 'Right-hand bat',
    bowling_style: 'Right-arm leg-break',
    recent_form_rating: 0.82,
    consistency_score: 0.78,
    versatility_score: 0.70,
    injury_risk_score: 8,
    venue_performance: 0.75,
    pitch_suitability: 0.88,
    weather_adaptability: 0.65,
    opposition_strength: 0.72,
    head_to_head_record: 0.70,
    captain_potential: 0.65,
    ownership_projection: 42,
    price_efficiency: 0.76,
    upset_potential: 0.35
  },
  {
    id: 7,
    name: 'KL Rahul',
    full_name: 'KL Rahul',
    player_role: 'WK',
    credits: 10.5,
    points: 70,
    dream_team_percentage: 55,
    selection_percentage: 45,
    team_name: 'LSG',
    country: 'India',
    is_playing_today: true,
    batting_style: 'Right-hand bat',
    bowling_style: 'Right-arm off-break',
    recent_form_rating: 0.72,
    consistency_score: 0.75,
    versatility_score: 0.80,
    injury_risk_score: 8,
    venue_performance: 0.78,
    pitch_suitability: 0.85,
    weather_adaptability: 0.75,
    opposition_strength: 0.75,
    head_to_head_record: 0.72,
    captain_potential: 0.85,
    ownership_projection: 45,
    price_efficiency: 0.67,
    upset_potential: 0.30
  },
  {
    id: 8,
    name: 'Ravindra Jadeja',
    full_name: 'Ravindra Jadeja',
    player_role: 'AR',
    credits: 9.5,
    points: 65,
    dream_team_percentage: 48,
    selection_percentage: 38,
    team_name: 'CSK',
    country: 'India',
    is_playing_today: true,
    batting_style: 'Left-hand bat',
    bowling_style: 'Slow left-arm orthodox',
    recent_form_rating: 0.78,
    consistency_score: 0.82,
    versatility_score: 0.88,
    injury_risk_score: 7,
    venue_performance: 0.72,
    pitch_suitability: 0.80,
    weather_adaptability: 0.85,
    opposition_strength: 0.75,
    head_to_head_record: 0.78,
    captain_potential: 0.75,
    ownership_projection: 38,
    price_efficiency: 0.68,
    upset_potential: 0.42
  },
  {
    id: 9,
    name: 'Yuzvendra Chahal',
    full_name: 'Yuzvendra Chahal',
    player_role: 'BWL',
    credits: 8.5,
    points: 58,
    dream_team_percentage: 42,
    selection_percentage: 32,
    team_name: 'RR',
    country: 'India',
    is_playing_today: true,
    batting_style: 'Right-hand bat',
    bowling_style: 'Right-arm leg-break',
    recent_form_rating: 0.68,
    consistency_score: 0.65,
    versatility_score: 0.60,
    injury_risk_score: 9,
    venue_performance: 0.65,
    pitch_suitability: 0.75,
    weather_adaptability: 0.70,
    opposition_strength: 0.68,
    head_to_head_record: 0.65,
    captain_potential: 0.55,
    ownership_projection: 32,
    price_efficiency: 0.68,
    upset_potential: 0.45
  },
  {
    id: 10,
    name: 'David Warner',
    full_name: 'David Warner',
    player_role: 'BAT',
    credits: 10.0,
    points: 75,
    dream_team_percentage: 62,
    selection_percentage: 52,
    team_name: 'DD',
    country: 'Australia',
    is_playing_today: true,
    batting_style: 'Left-hand bat',
    bowling_style: 'Right-arm leg-break',
    recent_form_rating: 0.85,
    consistency_score: 0.78,
    versatility_score: 0.72,
    injury_risk_score: 8,
    venue_performance: 0.82,
    pitch_suitability: 0.88,
    weather_adaptability: 0.80,
    opposition_strength: 0.78,
    head_to_head_record: 0.75,
    captain_potential: 0.82,
    ownership_projection: 52,
    price_efficiency: 0.75,
    upset_potential: 0.25
  },
  {
    id: 11,
    name: 'Trent Boult',
    full_name: 'Trent Boult',
    player_role: 'BWL',
    credits: 9.0,
    points: 62,
    dream_team_percentage: 45,
    selection_percentage: 35,
    team_name: 'RR',
    country: 'New Zealand',
    is_playing_today: true,
    batting_style: 'Left-hand bat',
    bowling_style: 'Left-arm fast-medium',
    recent_form_rating: 0.75,
    consistency_score: 0.72,
    versatility_score: 0.65,
    injury_risk_score: 7,
    venue_performance: 0.70,
    pitch_suitability: 0.82,
    weather_adaptability: 0.88,
    opposition_strength: 0.72,
    head_to_head_record: 0.68,
    captain_potential: 0.60,
    ownership_projection: 35,
    price_efficiency: 0.69,
    upset_potential: 0.40
  },
  {
    id: 12,
    name: 'Marcus Stoinis',
    full_name: 'Marcus Stoinis',
    player_role: 'AR',
    credits: 8.5,
    points: 58,
    dream_team_percentage: 38,
    selection_percentage: 28,
    team_name: 'LSG',
    country: 'Australia',
    is_playing_today: true,
    batting_style: 'Right-hand bat',
    bowling_style: 'Right-arm fast-medium',
    recent_form_rating: 0.65,
    consistency_score: 0.58,
    versatility_score: 0.85,
    injury_risk_score: 8,
    venue_performance: 0.62,
    pitch_suitability: 0.75,
    weather_adaptability: 0.82,
    opposition_strength: 0.65,
    head_to_head_record: 0.60,
    captain_potential: 0.65,
    ownership_projection: 28,
    price_efficiency: 0.68,
    upset_potential: 0.55
  },
  {
    id: 13,
    name: 'Shubman Gill',
    full_name: 'Shubman Gill',
    player_role: 'BAT',
    credits: 9.5,
    points: 65,
    dream_team_percentage: 45,
    selection_percentage: 35,
    team_name: 'GT',
    country: 'India',
    is_playing_today: true,
    batting_style: 'Right-hand bat',
    bowling_style: 'Right-arm off-break',
    recent_form_rating: 0.78,
    consistency_score: 0.65,
    versatility_score: 0.70,
    injury_risk_score: 9,
    venue_performance: 0.75,
    pitch_suitability: 0.82,
    weather_adaptability: 0.72,
    opposition_strength: 0.72,
    head_to_head_record: 0.68,
    captain_potential: 0.70,
    ownership_projection: 35,
    price_efficiency: 0.68,
    upset_potential: 0.45
  },
  {
    id: 14,
    name: 'Quinton de Kock',
    full_name: 'Quinton de Kock',
    player_role: 'WK',
    credits: 9.5,
    points: 68,
    dream_team_percentage: 48,
    selection_percentage: 38,
    team_name: 'LSG',
    country: 'South Africa',
    is_playing_today: true,
    batting_style: 'Left-hand bat',
    bowling_style: 'Right-arm medium',
    recent_form_rating: 0.78,
    consistency_score: 0.72,
    versatility_score: 0.70,
    injury_risk_score: 8,
    venue_performance: 0.75,
    pitch_suitability: 0.80,
    weather_adaptability: 0.75,
    opposition_strength: 0.72,
    head_to_head_record: 0.70,
    captain_potential: 0.75,
    ownership_projection: 38,
    price_efficiency: 0.72,
    upset_potential: 0.38
  },
  {
    id: 15,
    name: 'Faf du Plessis',
    full_name: 'Faf du Plessis',
    player_role: 'BAT',
    credits: 9.0,
    points: 62,
    dream_team_percentage: 42,
    selection_percentage: 32,
    team_name: 'RCB',
    country: 'South Africa',
    is_playing_today: true,
    batting_style: 'Right-hand bat',
    bowling_style: 'Right-arm medium',
    recent_form_rating: 0.72,
    consistency_score: 0.78,
    versatility_score: 0.68,
    injury_risk_score: 7,
    venue_performance: 0.68,
    pitch_suitability: 0.85,
    weather_adaptability: 0.80,
    opposition_strength: 0.70,
    head_to_head_record: 0.68,
    captain_potential: 0.88,
    ownership_projection: 32,
    price_efficiency: 0.69,
    upset_potential: 0.42
  }
];

async function testMLOptimization() {
  console.log('🤖 Testing ML-Based Optimization for Strategy 5');
  console.log('=' .repeat(60));

  // Test 1: ML Player Scoring
  console.log('\n📊 Test 1: ML Player Scoring');
  try {
    const matchContext = {
      matchId: 123,
      venue: 'Wankhede Stadium',
      pitchType: 'batting' as const,
      weatherCondition: 'clear' as const,
      team1: 'MI',
      team2: 'CSK',
      matchFormat: 'T20' as const,
      recentHead2Head: []
    };

    const mlScores = await mlOptimizationService.generateMLPlayerScores(mockPlayers, matchContext);
    console.log(`✅ Generated ML scores for ${mlScores.length} players`);
    
    // Show top 5 players by ML predicted points
    const topPlayers = mlScores.slice(0, 5);
    console.log('\n🏆 Top 5 Players by ML Predicted Points:');
    topPlayers.forEach((score, index) => {
      const player = mockPlayers.find(p => p.id === score.playerId);
      console.log(`${index + 1}. ${player?.name}: ${score.predictedPoints.toFixed(1)} points (confidence: ${(score.confidence * 100).toFixed(1)}%)`);
    });

  } catch (error) {
    console.error('❌ Test 1 failed:', error);
  }

  // Test 2: Genetic Algorithm Optimization
  console.log('\n🧬 Test 2: Genetic Algorithm Optimization');
  try {
    const matchContext = {
      matchId: 123,
      venue: 'Test Venue',
      pitchType: 'balanced' as const,
      weatherCondition: 'clear' as const,
      team1: 'Team A',
      team2: 'Team B',
      matchFormat: 'T20' as const,
      recentHead2Head: []
    };

    const mlScores = await mlOptimizationService.generateMLPlayerScores(mockPlayers, matchContext);
    
    const optimizedTeam = await mlOptimizationService.optimizeTeamWithGeneticAlgorithm(
      mockPlayers,
      mlScores,
      { riskProfile: 'balanced' },
      10, // Reduced for testing
      20  // Reduced for testing
    );

    console.log(`✅ Genetic Algorithm Optimization completed successfully`);
    console.log(`✅ Team size: ${optimizedTeam.teamComposition.length} players`);
    console.log(`✅ Expected Points: ${optimizedTeam.expectedPoints.toFixed(1)}`);
    console.log(`✅ Risk Score: ${(optimizedTeam.riskScore * 100).toFixed(1)}%`);
    console.log(`✅ Diversity Score: ${(optimizedTeam.diversityScore * 100).toFixed(1)}%`);
    console.log(`✅ Confidence Score: ${(optimizedTeam.confidenceScore * 100).toFixed(1)}%`);
    
    console.log('\n🎯 Optimized Team Composition:');
    optimizedTeam.teamComposition.forEach((player, index) => {
      console.log(`${index + 1}. ${player.name} (${player.player_role}) - ${player.credits} credits`);
    });

  } catch (error) {
    console.error('❌ Test 2 failed:', error);
  }

  // Test 3: Risk Profile Comparison
  console.log('\n⚖️ Test 3: Risk Profile Comparison');
  try {
    const matchContext = {
      matchId: 123,
      venue: 'Test Venue',
      pitchType: 'balanced' as const,
      weatherCondition: 'clear' as const,
      team1: 'Team A',
      team2: 'Team B',
      matchFormat: 'T20' as const,
      recentHead2Head: []
    };

    const mlScores = await mlOptimizationService.generateMLPlayerScores(mockPlayers, matchContext);
    
    const riskProfiles = ['conservative', 'balanced', 'aggressive'];
    const results = [];
    
    for (const riskProfile of riskProfiles) {
      const optimizedTeam = await mlOptimizationService.optimizeTeamWithGeneticAlgorithm(
        mockPlayers,
        mlScores,
        { riskProfile },
        5, // Very reduced for testing
        10
      );
      
      results.push({
        riskProfile,
        expectedPoints: optimizedTeam.expectedPoints,
        riskScore: optimizedTeam.riskScore * 100,
        diversityScore: optimizedTeam.diversityScore * 100,
        confidenceScore: optimizedTeam.confidenceScore * 100
      });
    }

    console.log('\n📈 Risk Profile Comparison:');
    results.forEach(result => {
      console.log(`${result.riskProfile.toUpperCase()}:`);
      console.log(`  Expected Points: ${result.expectedPoints.toFixed(1)}`);
      console.log(`  Risk Score: ${result.riskScore.toFixed(1)}%`);
      console.log(`  Diversity: ${result.diversityScore.toFixed(1)}%`);
      console.log(`  Confidence: ${result.confidenceScore.toFixed(1)}%`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Test 3 failed:', error);
  }

  // Test 4: Multiple Team Generation
  console.log('\n🏊 Test 4: Multiple Team Generation for Diversity');
  try {
    const matchContext = {
      matchId: 123,
      venue: 'Test Venue',
      pitchType: 'balanced' as const,
      weatherCondition: 'clear' as const,
      team1: 'Team A',
      team2: 'Team B',
      matchFormat: 'T20' as const,
      recentHead2Head: []
    };

    const mlScores = await mlOptimizationService.generateMLPlayerScores(mockPlayers, matchContext);
    
    const teams = [];
    for (let i = 0; i < 3; i++) {
      const team = await mlOptimizationService.optimizeTeamWithGeneticAlgorithm(
        mockPlayers,
        mlScores,
        { riskProfile: 'balanced' },
        5,
        10
      );
      teams.push(team);
    }

    // Analyze diversity
    const playerUsage: Record<number, number> = {};
    teams.forEach(team => {
      team.teamComposition.forEach(player => {
        playerUsage[player.id] = (playerUsage[player.id] || 0) + 1;
      });
    });

    const uniquePlayers = Object.keys(playerUsage).length;
    const totalSelections = Object.values(playerUsage).reduce((sum, count) => sum + count, 0);
    
    console.log(`✅ Generated ${teams.length} teams`);
    console.log(`✅ Unique players used: ${uniquePlayers}`);
    console.log(`✅ Total selections: ${totalSelections}`);
    console.log(`✅ Average usage per player: ${(totalSelections / uniquePlayers).toFixed(1)}`);
    console.log(`✅ Player pool utilization: ${((uniquePlayers / mockPlayers.length) * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('❌ Test 4 failed:', error);
  }

  console.log('\n🎉 ML Optimization Tests Completed!');
  console.log('=' .repeat(60));
}

// Run the tests
testMLOptimization().catch(console.error);
