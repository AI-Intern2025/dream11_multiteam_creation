import { mlOptimizationService } from '../lib/ml-optimization';
import { Player } from '../lib/neon-db';

// Quick test with minimal players for faster execution
const quickTestPlayers: Player[] = [
  {
    id: 1,
    name: 'Virat Kohli',
    full_name: 'Virat Kohli',
    player_role: 'BAT',
    credits: 11.5,
    points: 85,
    dream_team_percentage: 75,
    selection_percentage: 65,
    team_name: 'India',
    country: 'India',
    is_playing_today: true,
    batting_style: 'Right-hand bat',
    bowling_style: 'Right-arm medium',
    recent_form_rating: 0.88,
    consistency_score: 0.82,
    versatility_score: 0.78,
    injury_risk_score: 8,
    venue_performance: 0.85,
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
    team_name: 'India',
    country: 'India',
    is_playing_today: true,
    batting_style: 'Right-hand bat',
    bowling_style: 'Right-arm off-break',
    recent_form_rating: 0.85,
    consistency_score: 0.88,
    versatility_score: 0.75,
    injury_risk_score: 7,
    venue_performance: 0.82,
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
    team_name: 'India',
    country: 'India',
    is_playing_today: true,
    batting_style: 'Right-hand bat',
    bowling_style: 'Right-arm fast',
    recent_form_rating: 0.92,
    consistency_score: 0.85,
    versatility_score: 0.65,
    injury_risk_score: 6,
    venue_performance: 0.90,
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
    team_name: 'India',
    country: 'India',
    is_playing_today: true,
    batting_style: 'Right-hand bat',
    bowling_style: 'Right-arm fast-medium',
    recent_form_rating: 0.75,
    consistency_score: 0.62,
    versatility_score: 0.95,
    injury_risk_score: 5,
    venue_performance: 0.70,
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
    team_name: 'India',
    country: 'India',
    is_playing_today: true,
    batting_style: 'Right-hand bat',
    bowling_style: 'Right-arm medium',
    recent_form_rating: 0.60,
    consistency_score: 0.90,
    versatility_score: 0.85,
    injury_risk_score: 7,
    venue_performance: 0.65,
    captain_potential: 1.0,
    ownership_projection: 30,
    price_efficiency: 0.55,
    upset_potential: 0.60
  },
  {
    id: 6,
    name: 'David Warner',
    full_name: 'David Warner',
    player_role: 'BAT',
    credits: 10.0,
    points: 75,
    dream_team_percentage: 62,
    selection_percentage: 52,
    team_name: 'Australia',
    country: 'Australia',
    is_playing_today: true,
    batting_style: 'Left-hand bat',
    bowling_style: 'Right-arm leg-break',
    recent_form_rating: 0.85,
    consistency_score: 0.78,
    versatility_score: 0.72,
    injury_risk_score: 8,
    venue_performance: 0.82,
    captain_potential: 0.82,
    ownership_projection: 52,
    price_efficiency: 0.75,
    upset_potential: 0.25
  },
  {
    id: 7,
    name: 'Pat Cummins',
    full_name: 'Pat Cummins',
    player_role: 'BWL',
    credits: 10.5,
    points: 80,
    dream_team_percentage: 70,
    selection_percentage: 60,
    team_name: 'Australia',
    country: 'Australia',
    is_playing_today: true,
    batting_style: 'Right-hand bat',
    bowling_style: 'Right-arm fast',
    recent_form_rating: 0.87,
    consistency_score: 0.80,
    versatility_score: 0.70,
    injury_risk_score: 7,
    venue_performance: 0.85,
    captain_potential: 0.85,
    ownership_projection: 60,
    price_efficiency: 0.76,
    upset_potential: 0.20
  },
  {
    id: 8,
    name: 'Glenn Maxwell',
    full_name: 'Glenn Maxwell',
    player_role: 'AR',
    credits: 9.5,
    points: 68,
    dream_team_percentage: 50,
    selection_percentage: 40,
    team_name: 'Australia',
    country: 'Australia',
    is_playing_today: true,
    batting_style: 'Right-hand bat',
    bowling_style: 'Right-arm off-break',
    recent_form_rating: 0.72,
    consistency_score: 0.58,
    versatility_score: 0.90,
    injury_risk_score: 6,
    venue_performance: 0.68,
    captain_potential: 0.70,
    ownership_projection: 40,
    price_efficiency: 0.72,
    upset_potential: 0.50
  },
  {
    id: 9,
    name: 'Alex Carey',
    full_name: 'Alex Carey',
    player_role: 'WK',
    credits: 9.0,
    points: 60,
    dream_team_percentage: 45,
    selection_percentage: 35,
    team_name: 'Australia',
    country: 'Australia',
    is_playing_today: true,
    batting_style: 'Left-hand bat',
    bowling_style: 'Right-arm medium',
    recent_form_rating: 0.68,
    consistency_score: 0.75,
    versatility_score: 0.65,
    injury_risk_score: 8,
    venue_performance: 0.70,
    captain_potential: 0.65,
    ownership_projection: 35,
    price_efficiency: 0.67,
    upset_potential: 0.35
  },
  {
    id: 10,
    name: 'Mitchell Starc',
    full_name: 'Mitchell Starc',
    player_role: 'BWL',
    credits: 10.0,
    points: 75,
    dream_team_percentage: 65,
    selection_percentage: 55,
    team_name: 'Australia',
    country: 'Australia',
    is_playing_today: true,
    batting_style: 'Left-hand bat',
    bowling_style: 'Left-arm fast',
    recent_form_rating: 0.82,
    consistency_score: 0.72,
    versatility_score: 0.68,
    injury_risk_score: 6,
    venue_performance: 0.78,
    captain_potential: 0.60,
    ownership_projection: 55,
    price_efficiency: 0.75,
    upset_potential: 0.30
  },
  {
    id: 11,
    name: 'Steve Smith',
    full_name: 'Steve Smith',
    player_role: 'BAT',
    credits: 10.5,
    points: 82,
    dream_team_percentage: 72,
    selection_percentage: 62,
    team_name: 'Australia',
    country: 'Australia',
    is_playing_today: true,
    batting_style: 'Right-hand bat',
    bowling_style: 'Right-arm leg-break',
    recent_form_rating: 0.86,
    consistency_score: 0.85,
    versatility_score: 0.78,
    injury_risk_score: 7,
    venue_performance: 0.88,
    captain_potential: 0.88,
    ownership_projection: 62,
    price_efficiency: 0.78,
    upset_potential: 0.22
  }
];

async function quickMLTest() {
  console.log('⚡ Quick ML Optimization Test');
  console.log('=' .repeat(40));

  try {
    // Test 1: Basic ML Scoring (should be fast)
    console.log('\n📊 Test 1: ML Player Scoring');
    const matchContext = {
      matchId: 1,
      venue: 'Wankhede Stadium',
      pitchType: 'batting' as const,
      weatherCondition: 'clear' as const,
      team1: 'India',
      team2: 'Australia',
      matchFormat: 'T20' as const,
      recentHead2Head: []
    };

    const startTime = Date.now();
    const mlScores = await mlOptimizationService.generateMLPlayerScores(quickTestPlayers, matchContext);
    const scoringTime = Date.now() - startTime;

    console.log(`✅ Generated ML scores for ${mlScores.length} players in ${scoringTime}ms`);
    
    // Show top 3 players with different scores
    const topPlayers = mlScores
      .sort((a, b) => b.predictedPoints - a.predictedPoints)
      .slice(0, 3);
    
    console.log('\n🏆 Top 3 Players by ML Predicted Points:');
    topPlayers.forEach((score, index) => {
      const player = quickTestPlayers.find(p => p.id === score.playerId);
      console.log(`${index + 1}. ${player?.name}: ${score.predictedPoints.toFixed(1)} points (confidence: ${(score.confidence * 100).toFixed(1)}%)`);
    });

    // Test 2: Fast Genetic Algorithm (reduced parameters)
    console.log('\n🧬 Test 2: Fast Genetic Algorithm');
    const gaStartTime = Date.now();
    
    const optimizedTeam = await mlOptimizationService.optimizeTeamWithGeneticAlgorithm(
      quickTestPlayers,
      mlScores,
      { riskProfile: 'balanced' },
      3,  // Only 3 generations
      10  // Only 10 population
    );
    
    const gaTime = Date.now() - gaStartTime;
    console.log(`✅ Genetic Algorithm completed in ${gaTime}ms`);
    console.log(`✅ Team size: ${optimizedTeam.teamComposition.length} players`);
    console.log(`✅ Expected Points: ${optimizedTeam.expectedPoints.toFixed(1)}`);
    console.log(`✅ Risk Score: ${(optimizedTeam.riskScore * 100).toFixed(1)}%`);
    
    // Test 3: Performance comparison
    console.log('\n⏱️ Performance Summary:');
    console.log(`• ML Scoring: ${scoringTime}ms`);
    console.log(`• Genetic Algorithm: ${gaTime}ms`);
    console.log(`• Total: ${scoringTime + gaTime}ms`);
    
    if (scoringTime + gaTime < 5000) {
      console.log('✅ Performance: GOOD (under 5 seconds)');
    } else {
      console.log('⚠️ Performance: SLOW (over 5 seconds)');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }

  console.log('\n🎉 Quick ML Test Completed!');
}

// Run the quick test
quickMLTest().catch(console.error);
