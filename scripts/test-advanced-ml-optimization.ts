import { aiService } from '../lib/ai-service-enhanced';
import { mlOptimizationService } from '../lib/ml-optimization';
import { Player } from '../lib/neon-db';

// Mock advanced player data for testing
const mockAdvancedPlayers: Player[] = [
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
    // Advanced stats
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
    player_role: 'BAT',
    credits: 11.0,
    points: 78,
    dream_team_percentage: 68,
    selection_percentage: 58,
    team_name: 'MI',
    country: 'India',
    is_playing_today: true,
    // Advanced stats
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
    name: 'Shubman Gill',
    player_role: 'BAT',
    credits: 9.5,
    points: 65,
    dream_team_percentage: 45,
    selection_percentage: 35,
    team_name: 'GT',
    country: 'India',
    is_playing_today: true,
    // Advanced stats
    recent_form: 78,
    consistency_score: 65,
    versatility_score: 70,
    injury_risk: 9,
    venue_performance: 75,
    pitch_suitability: 82,
    weather_adaptability: 72,
    opposition_strength: 72,
    head_to_head_record: 68,
    captain_potential: 70,
    ownership_projection: 35,
    price_efficiency: 6.8,
    upset_potential: 45,
    ml_predicted_points: 42.8,
    ml_confidence_score: 75,
    performance_volatility: 35
  },
  {
    id: 4,
    name: 'Jasprit Bumrah',
    player_role: 'BWL',
    credits: 11.0,
    points: 88,
    dream_team_percentage: 82,
    selection_percentage: 78,
    team_name: 'MI',
    country: 'India',
    is_playing_today: true,
    // Advanced stats
    recent_form: 92,
    consistency_score: 85,
    versatility_score: 65,
    injury_risk: 6,
    venue_performance: 90,
    pitch_suitability: 85,
    weather_adaptability: 80,
    opposition_strength: 88,
    head_to_head_record: 85,
    captain_potential: 75,
    ownership_projection: 78,
    price_efficiency: 8.0,
    upset_potential: 15,
    ml_predicted_points: 48.2,
    ml_confidence_score: 90,
    performance_volatility: 18
  },
  {
    id: 5,
    name: 'Hardik Pandya',
    player_role: 'AR',
    credits: 10.5,
    points: 72,
    dream_team_percentage: 58,
    selection_percentage: 48,
    team_name: 'MI',
    country: 'India',
    is_playing_today: true,
    // Advanced stats
    recent_form: 75,
    consistency_score: 62,
    versatility_score: 95,
    injury_risk: 5,
    venue_performance: 70,
    pitch_suitability: 78,
    weather_adaptability: 85,
    opposition_strength: 75,
    head_to_head_record: 70,
    captain_potential: 80,
    ownership_projection: 48,
    price_efficiency: 6.9,
    upset_potential: 40,
    ml_predicted_points: 45.5,
    ml_confidence_score: 68,
    performance_volatility: 42
  },
  {
    id: 6,
    name: 'MS Dhoni',
    player_role: 'WK',
    credits: 10.0,
    points: 55,
    dream_team_percentage: 40,
    selection_percentage: 30,
    team_name: 'CSK',
    country: 'India',
    is_playing_today: true,
    // Advanced stats
    recent_form: 60,
    consistency_score: 90,
    versatility_score: 85,
    injury_risk: 7,
    venue_performance: 65,
    pitch_suitability: 70,
    weather_adaptability: 90,
    opposition_strength: 70,
    head_to_head_record: 75,
    captain_potential: 100,
    ownership_projection: 30,
    price_efficiency: 5.5,
    upset_potential: 60,
    ml_predicted_points: 32.8,
    ml_confidence_score: 78,
    performance_volatility: 38
  },
  // Add more players to reach 15+ for ML optimization
  {
    id: 7,
    name: 'Rashid Khan',
    player_role: 'BWL',
    credits: 9.0,
    points: 68,
    dream_team_percentage: 52,
    selection_percentage: 42,
    team_name: 'GT',
    country: 'Afghanistan',
    is_playing_today: true,
    recent_form: 82,
    consistency_score: 78,
    versatility_score: 70,
    injury_risk: 8,
    venue_performance: 75,
    pitch_suitability: 88,
    weather_adaptability: 65,
    opposition_strength: 72,
    head_to_head_record: 70,
    captain_potential: 65,
    ownership_projection: 42,
    price_efficiency: 7.6,
    upset_potential: 35,
    ml_predicted_points: 40.2,
    ml_confidence_score: 82,
    performance_volatility: 28
  },
  // Add more players to test different roles and stats
  {
    id: 8,
    name: 'KL Rahul',
    player_role: 'WK',
    credits: 10.5,
    points: 70,
    dream_team_percentage: 55,
    selection_percentage: 45,
    team_name: 'LSG',
    country: 'India',
    is_playing_today: true,
    recent_form: 72,
    consistency_score: 75,
    versatility_score: 80,
    injury_risk: 8,
    venue_performance: 78,
    pitch_suitability: 85,
    weather_adaptability: 75,
    opposition_strength: 75,
    head_to_head_record: 72,
    captain_potential: 85,
    ownership_projection: 45,
    price_efficiency: 6.7,
    upset_potential: 30,
    ml_predicted_points: 45.8,
    ml_confidence_score: 78,
    performance_volatility: 32
  },
  {
    id: 9,
    name: 'Ravindra Jadeja',
    player_role: 'AR',
    credits: 9.5,
    points: 65,
    dream_team_percentage: 48,
    selection_percentage: 38,
    team_name: 'CSK',
    country: 'India',
    is_playing_today: true,
    recent_form: 78,
    consistency_score: 82,
    versatility_score: 88,
    injury_risk: 7,
    venue_performance: 72,
    pitch_suitability: 80,
    weather_adaptability: 85,
    opposition_strength: 75,
    head_to_head_record: 78,
    captain_potential: 75,
    ownership_projection: 38,
    price_efficiency: 6.8,
    upset_potential: 42,
    ml_predicted_points: 42.5,
    ml_confidence_score: 80,
    performance_volatility: 30
  },
  {
    id: 10,
    name: 'Yuzvendra Chahal',
    player_role: 'BWL',
    credits: 8.5,
    points: 58,
    dream_team_percentage: 42,
    selection_percentage: 32,
    team_name: 'RR',
    country: 'India',
    is_playing_today: true,
    recent_form: 68,
    consistency_score: 65,
    versatility_score: 60,
    injury_risk: 9,
    venue_performance: 65,
    pitch_suitability: 75,
    weather_adaptability: 70,
    opposition_strength: 68,
    head_to_head_record: 65,
    captain_potential: 55,
    ownership_projection: 32,
    price_efficiency: 6.8,
    upset_potential: 45,
    ml_predicted_points: 35.2,
    ml_confidence_score: 72,
    performance_volatility: 38
  },
  // Add more players for comprehensive testing
  {
    id: 11,
    name: 'David Warner',
    player_role: 'BAT',
    credits: 10.0,
    points: 75,
    dream_team_percentage: 62,
    selection_percentage: 52,
    team_name: 'DD',
    country: 'Australia',
    is_playing_today: true,
    recent_form: 85,
    consistency_score: 78,
    versatility_score: 72,
    injury_risk: 8,
    venue_performance: 82,
    pitch_suitability: 88,
    weather_adaptability: 80,
    opposition_strength: 78,
    head_to_head_record: 75,
    captain_potential: 82,
    ownership_projection: 52,
    price_efficiency: 7.5,
    upset_potential: 25,
    ml_predicted_points: 48.5,
    ml_confidence_score: 82,
    performance_volatility: 28
  },
  {
    id: 12,
    name: 'Trent Boult',
    player_role: 'BWL',
    credits: 9.0,
    points: 62,
    dream_team_percentage: 45,
    selection_percentage: 35,
    team_name: 'RR',
    country: 'New Zealand',
    is_playing_today: true,
    recent_form: 75,
    consistency_score: 72,
    versatility_score: 65,
    injury_risk: 7,
    venue_performance: 70,
    pitch_suitability: 82,
    weather_adaptability: 88,
    opposition_strength: 72,
    head_to_head_record: 68,
    captain_potential: 60,
    ownership_projection: 35,
    price_efficiency: 6.9,
    upset_potential: 40,
    ml_predicted_points: 38.8,
    ml_confidence_score: 75,
    performance_volatility: 32
  },
  {
    id: 13,
    name: 'Marcus Stoinis',
    player_role: 'AR',
    credits: 8.5,
    points: 58,
    dream_team_percentage: 38,
    selection_percentage: 28,
    team_name: 'LSG',
    country: 'Australia',
    is_playing_today: true,
    recent_form: 65,
    consistency_score: 58,
    versatility_score: 85,
    injury_risk: 8,
    venue_performance: 62,
    pitch_suitability: 75,
    weather_adaptability: 82,
    opposition_strength: 65,
    head_to_head_record: 60,
    captain_potential: 65,
    ownership_projection: 28,
    price_efficiency: 6.8,
    upset_potential: 55,
    ml_predicted_points: 36.8,
    ml_confidence_score: 68,
    performance_volatility: 45
  },
  {
    id: 14,
    name: 'Quinton de Kock',
    player_role: 'WK',
    credits: 9.5,
    points: 68,
    dream_team_percentage: 48,
    selection_percentage: 38,
    team_name: 'LSG',
    country: 'South Africa',
    is_playing_today: true,
    recent_form: 78,
    consistency_score: 72,
    versatility_score: 70,
    injury_risk: 8,
    venue_performance: 75,
    pitch_suitability: 80,
    weather_adaptability: 75,
    opposition_strength: 72,
    head_to_head_record: 70,
    captain_potential: 75,
    ownership_projection: 38,
    price_efficiency: 7.2,
    upset_potential: 38,
    ml_predicted_points: 42.8,
    ml_confidence_score: 75,
    performance_volatility: 35
  },
  {
    id: 15,
    name: 'Faf du Plessis',
    player_role: 'BAT',
    credits: 9.0,
    points: 62,
    dream_team_percentage: 42,
    selection_percentage: 32,
    team_name: 'RCB',
    country: 'South Africa',
    is_playing_today: true,
    recent_form: 72,
    consistency_score: 78,
    versatility_score: 68,
    injury_risk: 7,
    venue_performance: 68,
    pitch_suitability: 85,
    weather_adaptability: 80,
    opposition_strength: 70,
    head_to_head_record: 68,
    captain_potential: 88,
    ownership_projection: 32,
    price_efficiency: 6.9,
    upset_potential: 42,
    ml_predicted_points: 38.5,
    ml_confidence_score: 78,
    performance_volatility: 32
  }
];

async function testAdvancedStatsFiltersAndMLOptimization() {
  console.log('🧪 Testing Advanced Statistical Filters and ML Optimization');
  console.log('=' .repeat(60));

  // Test 1: Basic Advanced Filter Test
  console.log('\n📊 Test 1: Basic Advanced Filter Test');
  const basicRequest = {
    matchId: 123,
    strategy: 'stats-driven',
    teamCount: 3,
    userPreferences: {
      strategy: 'stats-driven',
      riskProfile: 'balanced',
      filters: {
        dreamTeamPercentage: { min: 40, max: 80 },
        selectionPercentage: { min: 25, max: 70 },
        averagePoints: { min: 30, max: 90 },
        recentForm: { min: 65, max: 95 },
        consistencyScore: { min: 60, max: 90 },
        versatilityScore: { min: 50, max: 100 },
        injuryRisk: { min: 6, max: 10 },
        venuePerformance: { min: 60, max: 95 },
        mlPredictedPoints: { min: 30, max: 70 },
        mlConfidenceScore: { min: 70, max: 95 },
        playerRoles: {
          batsmen: { min: 3, max: 5 },
          bowlers: { min: 3, max: 5 },
          allRounders: { min: 2, max: 4 },
          wicketKeepers: { min: 1, max: 2 }
        }
      }
    }
  };

  try {
    // Mock the AI service methods for testing
    const mockRecommendations = mockAdvancedPlayers.map(player => ({
      player,
      confidence: 0.8,
      reason: 'Advanced stats-driven selection',
      role: 'core' as const
    }));

    console.log(`✅ Generated ${mockRecommendations.length} player recommendations`);
    console.log(`✅ Players with advanced stats: ${mockAdvancedPlayers.length}`);
    
    // Test advanced filtering
    const passesAdvancedFilters = mockAdvancedPlayers.filter(player => {
      const filters = basicRequest.userPreferences.filters;
      return (
        player.dream_team_percentage >= filters.dreamTeamPercentage.min &&
        player.dream_team_percentage <= filters.dreamTeamPercentage.max &&
        player.recent_form >= filters.recentForm.min &&
        player.recent_form <= filters.recentForm.max &&
        player.consistency_score >= filters.consistencyScore.min &&
        player.consistency_score <= filters.consistencyScore.max &&
        player.ml_predicted_points >= filters.mlPredictedPoints.min &&
        player.ml_predicted_points <= filters.mlPredictedPoints.max &&
        player.ml_confidence_score >= filters.mlConfidenceScore.min &&
        player.ml_confidence_score <= filters.mlConfidenceScore.max
      );
    });

    console.log(`✅ Players passing advanced filters: ${passesAdvancedFilters.length}`);
    console.log(`✅ Filter success rate: ${((passesAdvancedFilters.length / mockAdvancedPlayers.length) * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('❌ Test 1 failed:', error);
  }

  // Test 2: ML Optimization Test
  console.log('\n🤖 Test 2: ML Optimization Test');
  try {
    const mlContext = {
      matchId: 123,
      venue: 'Wankhede Stadium',
      pitchType: 'batting' as const,
      weatherCondition: 'clear' as const,
      team1: 'MI',
      team2: 'CSK',
      matchFormat: 'T20' as const,
      recentHead2Head: []
    };

    // Generate ML scores
    const mlScores = await mlOptimizationService.generateMLPlayerScores(mockAdvancedPlayers, mlContext);
    console.log(`✅ Generated ML scores for ${mlScores.length} players`);
    
    // Test genetic algorithm optimization
    const optimizedTeam = await mlOptimizationService.optimizeTeamWithGeneticAlgorithm(
      mockAdvancedPlayers,
      mlScores,
      { riskProfile: 'balanced' },
      10, // Reduced generations for testing
      20   // Reduced population for testing
    );

    console.log(`✅ ML Optimization completed successfully`);
    console.log(`✅ Expected Points: ${optimizedTeam.expectedPoints.toFixed(1)}`);
    console.log(`✅ Risk Score: ${(optimizedTeam.riskScore * 100).toFixed(1)}%`);
    console.log(`✅ Diversity Score: ${(optimizedTeam.diversityScore * 100).toFixed(1)}%`);
    console.log(`✅ Confidence Score: ${(optimizedTeam.confidenceScore * 100).toFixed(1)}%`);
    console.log(`✅ Team composition: ${optimizedTeam.teamComposition.length} players`);
    console.log(`✅ Top 3 players: ${optimizedTeam.teamComposition.slice(0, 3).map(p => p.name).join(', ')}`);

  } catch (error) {
    console.error('❌ Test 2 failed:', error);
  }

  // Test 3: Risk Profile Test
  console.log('\n⚖️ Test 3: Risk Profile Test');
  try {
    const riskProfiles = ['conservative', 'balanced', 'aggressive'];
    
    for (const riskProfile of riskProfiles) {
      console.log(`\n🎯 Testing ${riskProfile} risk profile:`);
      
      const mlScores = await mlOptimizationService.generateMLPlayerScores(mockAdvancedPlayers, {
        matchId: 123,
        venue: 'Test Venue',
        pitchType: 'balanced',
        weatherCondition: 'clear',
        team1: 'Team A',
        team2: 'Team B',
        matchFormat: 'T20',
        recentHead2Head: []
      });

      const optimizedTeam = await mlOptimizationService.optimizeTeamWithGeneticAlgorithm(
        mockAdvancedPlayers,
        mlScores,
        { riskProfile },
        5, // Very reduced for testing
        10
      );

      console.log(`  ✅ ${riskProfile} optimization: Risk ${(optimizedTeam.riskScore * 100).toFixed(1)}%, Expected ${optimizedTeam.expectedPoints.toFixed(1)} points`);
    }

  } catch (error) {
    console.error('❌ Test 3 failed:', error);
  }

  // Test 4: Player Pool Utilization Test
  console.log('\n🏊 Test 4: Player Pool Utilization Test');
  try {
    const multipleTeams = [];
    const mlScores = await mlOptimizationService.generateMLPlayerScores(mockAdvancedPlayers, {
      matchId: 123,
      venue: 'Test Venue',
      pitchType: 'balanced',
      weatherCondition: 'clear',
      team1: 'Team A',
      team2: 'Team B',
      matchFormat: 'T20',
      recentHead2Head: []
    });

    // Generate 5 teams to test diversity
    for (let i = 0; i < 5; i++) {
      const team = await mlOptimizationService.optimizeTeamWithGeneticAlgorithm(
        mockAdvancedPlayers,
        mlScores,
        { riskProfile: 'balanced' },
        5,
        10
      );
      multipleTeams.push(team);
    }

    // Analyze player usage
    const playerUsage: Record<number, number> = {};
    multipleTeams.forEach(team => {
      team.teamComposition.forEach(player => {
        playerUsage[player.id] = (playerUsage[player.id] || 0) + 1;
      });
    });

    const uniquePlayers = Object.keys(playerUsage).length;
    const totalSelections = Object.values(playerUsage).reduce((sum, count) => sum + count, 0);
    const avgUsage = totalSelections / uniquePlayers;

    console.log(`✅ Generated ${multipleTeams.length} teams`);
    console.log(`✅ Unique players used: ${uniquePlayers}`);
    console.log(`✅ Average usage per player: ${avgUsage.toFixed(1)}`);
    console.log(`✅ Player diversity: ${((uniquePlayers / mockAdvancedPlayers.length) * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('❌ Test 4 failed:', error);
  }

  console.log('\n🎉 Advanced Statistical Filters and ML Optimization Tests Completed!');
  console.log('=' .repeat(60));
}

// Run the tests
testAdvancedStatsFiltersAndMLOptimization().catch(console.error);
