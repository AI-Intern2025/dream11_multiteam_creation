import { config } from 'dotenv';
import { neonDB } from '../lib/neon-db';

// Load environment variables
config({ path: '.env.local' });

/**
 * Database Schema Migration Script
 * 
 * This script adds missing fields from the enhanced schema to existing tables:
 * 1. Adds new fields to matches table
 * 2. Adds extensive analytics fields to players table  
 * 3. Populates dummy data for all new fields
 */

async function migrateMatchesTable() {
  console.log('🔄 Migrating matches table...');
  
  const alterMatchesQueries = [
    // Add new JSONB and text fields for enhanced match analytics
    `ALTER TABLE matches ADD COLUMN IF NOT EXISTS predicted_score_range JSONB DEFAULT '{"min": 150, "max": 200}'`,
    `ALTER TABLE matches ADD COLUMN IF NOT EXISTS weather_prediction TEXT DEFAULT 'Clear'`,
    `ALTER TABLE matches ADD COLUMN IF NOT EXISTS pitch_condition_prediction TEXT DEFAULT 'Balanced'`,
    `ALTER TABLE matches ADD COLUMN IF NOT EXISTS toss_factor DECIMAL(3,2) DEFAULT 0.50`,
    `ALTER TABLE matches ADD COLUMN IF NOT EXISTS home_advantage DECIMAL(3,2) DEFAULT 0.00`,
    `ALTER TABLE matches ADD COLUMN IF NOT EXISTS recent_form_comparison JSONB DEFAULT '{"team_a": 0.75, "team_b": 0.70}'`,
    `ALTER TABLE matches ADD COLUMN IF NOT EXISTS key_player_impact JSONB DEFAULT '{"team_a": ["Player 1"], "team_b": ["Player 2"]}'`,
    `ALTER TABLE matches ADD COLUMN IF NOT EXISTS match_importance_factor DECIMAL(3,2) DEFAULT 0.75`,
    `ALTER TABLE matches ADD COLUMN IF NOT EXISTS crowd_factor DECIMAL(3,2) DEFAULT 0.60`,
    `ALTER TABLE matches ADD COLUMN IF NOT EXISTS broadcast_viewership_prediction INTEGER DEFAULT 1000000`,
    `ALTER TABLE matches ADD COLUMN IF NOT EXISTS fantasy_difficulty_rating DECIMAL(3,2) DEFAULT 0.70`,
    `ALTER TABLE matches ADD COLUMN IF NOT EXISTS injury_updates JSONB DEFAULT '{"confirmed": [], "doubtful": []}'`,
    `ALTER TABLE matches ADD COLUMN IF NOT EXISTS team_news JSONB DEFAULT '{"team_a": "No major changes", "team_b": "No major changes"}'`
  ];

  for (const query of alterMatchesQueries) {
    try {
      await neonDB.query(query);
      console.log('✅ Successfully added matches table field');
    } catch (error: any) {
      console.warn('⚠️ Field may already exist in matches table:', error.message);
    }
  }
}

async function migratePlayersTable() {
  console.log('🔄 Migrating players table...');
  
  const alterPlayersQueries = [
    // Analytics and Performance Fields
    `ALTER TABLE players ADD COLUMN IF NOT EXISTS dream_team_percentage DECIMAL(5,2) DEFAULT 45.0`,
    `ALTER TABLE players ADD COLUMN IF NOT EXISTS recent_form_rating DECIMAL(3,2) DEFAULT 0.75`,
    `ALTER TABLE players ADD COLUMN IF NOT EXISTS consistency_score DECIMAL(3,2) DEFAULT 0.70`,
    `ALTER TABLE players ADD COLUMN IF NOT EXISTS versatility_score DECIMAL(3,2) DEFAULT 0.65`,
    `ALTER TABLE players ADD COLUMN IF NOT EXISTS injury_risk_score INTEGER DEFAULT 8`,
    
    // Contextual Performance Fields
    `ALTER TABLE players ADD COLUMN IF NOT EXISTS venue_performance DECIMAL(3,2) DEFAULT 0.70`,
    `ALTER TABLE players ADD COLUMN IF NOT EXISTS pitch_suitability DECIMAL(3,2) DEFAULT 0.75`,
    `ALTER TABLE players ADD COLUMN IF NOT EXISTS weather_adaptability DECIMAL(3,2) DEFAULT 0.70`,
    `ALTER TABLE players ADD COLUMN IF NOT EXISTS opposition_strength DECIMAL(3,2) DEFAULT 0.75`,
    `ALTER TABLE players ADD COLUMN IF NOT EXISTS head_to_head_record DECIMAL(3,2) DEFAULT 0.70`,
    
    // Fantasy Specific Fields
    `ALTER TABLE players ADD COLUMN IF NOT EXISTS captain_potential DECIMAL(3,2) DEFAULT 0.60`,
    `ALTER TABLE players ADD COLUMN IF NOT EXISTS ownership_projection DECIMAL(5,2) DEFAULT 25.0`,
    `ALTER TABLE players ADD COLUMN IF NOT EXISTS price_efficiency DECIMAL(3,2) DEFAULT 0.65`,
    `ALTER TABLE players ADD COLUMN IF NOT EXISTS upset_potential DECIMAL(3,2) DEFAULT 0.50`,
    
    // Recent Performance Tracking
    `ALTER TABLE players ADD COLUMN IF NOT EXISTS recent_match_points JSONB DEFAULT '[25, 30, 20, 35, 28]'`,
    `ALTER TABLE players ADD COLUMN IF NOT EXISTS match_format_preference TEXT DEFAULT 'ODI'`,
    `ALTER TABLE players ADD COLUMN IF NOT EXISTS playing_conditions_preference TEXT DEFAULT 'Day'`,
    
    // Advanced Statistics (for Strategy 5 ML optimization)
    `ALTER TABLE players ADD COLUMN IF NOT EXISTS strike_rate DECIMAL(5,2) DEFAULT 120.0`,
    `ALTER TABLE players ADD COLUMN IF NOT EXISTS average DECIMAL(5,2) DEFAULT 35.0`,
    `ALTER TABLE players ADD COLUMN IF NOT EXISTS economy_rate DECIMAL(4,2) DEFAULT 7.5`,
    `ALTER TABLE players ADD COLUMN IF NOT EXISTS bowling_average DECIMAL(5,2) DEFAULT 28.0`,
    `ALTER TABLE players ADD COLUMN IF NOT EXISTS wickets_per_match DECIMAL(3,2) DEFAULT 1.2`,
    `ALTER TABLE players ADD COLUMN IF NOT EXISTS catches_per_match DECIMAL(3,2) DEFAULT 0.8`,
    `ALTER TABLE players ADD COLUMN IF NOT EXISTS run_outs_per_match DECIMAL(3,2) DEFAULT 0.1`,
    `ALTER TABLE players ADD COLUMN IF NOT EXISTS boundaries_per_match DECIMAL(3,2) DEFAULT 4.5`,
    `ALTER TABLE players ADD COLUMN IF NOT EXISTS sixes_per_match DECIMAL(3,2) DEFAULT 1.2`,
    
    // Team Dynamics and Context
    `ALTER TABLE players ADD COLUMN IF NOT EXISTS team_dependency_score DECIMAL(3,2) DEFAULT 0.70`,
    `ALTER TABLE players ADD COLUMN IF NOT EXISTS pressure_performance DECIMAL(3,2) DEFAULT 0.65`,
    `ALTER TABLE players ADD COLUMN IF NOT EXISTS clutch_factor DECIMAL(3,2) DEFAULT 0.60`,
    
    // Historical Performance Patterns
    `ALTER TABLE players ADD COLUMN IF NOT EXISTS last_5_matches_avg DECIMAL(5,2) DEFAULT 30.0`,
    `ALTER TABLE players ADD COLUMN IF NOT EXISTS season_trend TEXT DEFAULT 'Stable'`,
    `ALTER TABLE players ADD COLUMN IF NOT EXISTS peak_performance_month TEXT DEFAULT 'March'`
  ];

  for (const query of alterPlayersQueries) {
    try {
      await neonDB.query(query);
      console.log('✅ Successfully added players table field');
    } catch (error: any) {
      console.warn('⚠️ Field may already exist in players table:', error.message);
    }
  }
}

async function populateEnhancedMatchData() {
  console.log('📊 Populating enhanced match data...');
  
  try {
    const matches = await neonDB.getAllMatches();
    
    for (const match of matches) {
      const enhancedData = generateEnhancedMatchData(match);
      
      const updateQuery = `
        UPDATE matches 
        SET 
          predicted_score_range = $1,
          weather_prediction = $2,
          pitch_condition_prediction = $3,
          toss_factor = $4,
          home_advantage = $5,
          recent_form_comparison = $6,
          key_player_impact = $7,
          match_importance_factor = $8,
          crowd_factor = $9,
          broadcast_viewership_prediction = $10,
          fantasy_difficulty_rating = $11,
          injury_updates = $12,
          team_news = $13
        WHERE id = $14
      `;
      
      await neonDB.query(updateQuery, [
        enhancedData.predicted_score_range,
        enhancedData.weather_prediction,
        enhancedData.pitch_condition_prediction,
        enhancedData.toss_factor,
        enhancedData.home_advantage,
        enhancedData.recent_form_comparison,
        enhancedData.key_player_impact,
        enhancedData.match_importance_factor,
        enhancedData.crowd_factor,
        enhancedData.broadcast_viewership_prediction,
        enhancedData.fantasy_difficulty_rating,
        enhancedData.injury_updates,
        enhancedData.team_news,
        match.id
      ]);
      
      console.log(`✅ Updated enhanced data for match: ${match.team_name}`);
    }
  } catch (error) {
    console.error('❌ Error populating enhanced match data:', error);
  }
}

async function populateEnhancedPlayerData() {
  console.log('👥 Populating enhanced player data...');
  
  try {
    const players = await neonDB.getAllPlayers();
    
    for (const player of players) {
      const enhancedData = generateEnhancedPlayerData(player);
      
      const updateQuery = `
        UPDATE players 
        SET 
          dream_team_percentage = $1,
          recent_form_rating = $2,
          consistency_score = $3,
          versatility_score = $4,
          injury_risk_score = $5,
          venue_performance = $6,
          pitch_suitability = $7,
          weather_adaptability = $8,
          opposition_strength = $9,
          head_to_head_record = $10,
          captain_potential = $11,
          ownership_projection = $12,
          price_efficiency = $13,
          upset_potential = $14,
          recent_match_points = $15,
          match_format_preference = $16,
          playing_conditions_preference = $17,
          strike_rate = $18,
          average = $19,
          economy_rate = $20,
          bowling_average = $21,
          wickets_per_match = $22,
          catches_per_match = $23,
          run_outs_per_match = $24,
          boundaries_per_match = $25,
          sixes_per_match = $26,
          team_dependency_score = $27,
          pressure_performance = $28,
          clutch_factor = $29,
          last_5_matches_avg = $30,
          season_trend = $31,
          peak_performance_month = $32
        WHERE id = $33
      `;
      
      await neonDB.query(updateQuery, [
        enhancedData.dream_team_percentage,
        enhancedData.recent_form_rating,
        enhancedData.consistency_score,
        enhancedData.versatility_score,
        enhancedData.injury_risk_score,
        enhancedData.venue_performance,
        enhancedData.pitch_suitability,
        enhancedData.weather_adaptability,
        enhancedData.opposition_strength,
        enhancedData.head_to_head_record,
        enhancedData.captain_potential,
        enhancedData.ownership_projection,
        enhancedData.price_efficiency,
        enhancedData.upset_potential,
        enhancedData.recent_match_points,
        enhancedData.match_format_preference,
        enhancedData.playing_conditions_preference,
        enhancedData.strike_rate,
        enhancedData.average,
        enhancedData.economy_rate,
        enhancedData.bowling_average,
        enhancedData.wickets_per_match,
        enhancedData.catches_per_match,
        enhancedData.run_outs_per_match,
        enhancedData.boundaries_per_match,
        enhancedData.sixes_per_match,
        enhancedData.team_dependency_score,
        enhancedData.pressure_performance,
        enhancedData.clutch_factor,
        enhancedData.last_5_matches_avg,
        enhancedData.season_trend,
        enhancedData.peak_performance_month,
        player.id
      ]);
      
      console.log(`✅ Updated enhanced data for player: ${player.name} (${player.team_name})`);
    }
  } catch (error) {
    console.error('❌ Error populating enhanced player data:', error);
  }
}

function generateEnhancedMatchData(match: any) {
  // Generate realistic dummy data based on match context
  const teamNames = ['India', 'Australia', 'England', 'Pakistan', 'Afghanistan'];
  const venues = ['Wankhede', 'MCG', 'Lords', 'Oval', 'Eden Gardens'];
  
  return {
    predicted_score_range: JSON.stringify({
      min: 140 + Math.floor(Math.random() * 40),
      max: 180 + Math.floor(Math.random() * 60)
    }),
    weather_prediction: ['Clear', 'Partly Cloudy', 'Overcast', 'Light Rain Risk'][Math.floor(Math.random() * 4)],
    pitch_condition_prediction: ['Batting Friendly', 'Bowling Friendly', 'Balanced', 'Spin Friendly'][Math.floor(Math.random() * 4)],
    toss_factor: (0.45 + Math.random() * 0.1).toFixed(2),
    home_advantage: match.match_venue === 'Home' ? (0.05 + Math.random() * 0.15).toFixed(2) : '0.00',
    recent_form_comparison: JSON.stringify({
      team_a: (0.60 + Math.random() * 0.30).toFixed(2),
      team_b: (0.60 + Math.random() * 0.30).toFixed(2)
    }),
    key_player_impact: JSON.stringify({
      team_a: [`${match.team_name} Player 1`, `${match.team_name} Player 2`],
      team_b: ['Opposition Player 1', 'Opposition Player 2']
    }),
    match_importance_factor: (0.60 + Math.random() * 0.30).toFixed(2),
    crowd_factor: (0.40 + Math.random() * 0.40).toFixed(2),
    broadcast_viewership_prediction: Math.floor(500000 + Math.random() * 2000000),
    fantasy_difficulty_rating: (0.50 + Math.random() * 0.40).toFixed(2),
    injury_updates: JSON.stringify({
      confirmed: [],
      doubtful: ['Player X - Fitness Test']
    }),
    team_news: JSON.stringify({
      team_a: 'No major changes expected',
      team_b: 'Possible changes in bowling lineup'
    })
  };
}

function generateEnhancedPlayerData(player: any) {
  // Generate role-specific dummy data
  const isBAT = player.player_role === 'BAT';
  const isBWL = player.player_role === 'BWL';
  const isAR = player.player_role === 'AR';
  const isWK = player.player_role === 'WK';
  
  // Base stats influenced by player credits (higher credits = better stats)
  const creditMultiplier = Math.max(0.5, Math.min(1.5, player.credits / 8.0));
  
  return {
    dream_team_percentage: Math.min(95, Math.max(5, (player.selection_percentage * 0.8 + Math.random() * 10))).toFixed(1),
    recent_form_rating: Math.min(1.0, Math.max(0.3, (0.6 + Math.random() * 0.3) * creditMultiplier)).toFixed(2),
    consistency_score: Math.min(1.0, Math.max(0.4, (0.65 + Math.random() * 0.25) * creditMultiplier)).toFixed(2),
    versatility_score: Math.min(1.0, Math.max(0.3, isAR ? 0.80 + Math.random() * 0.15 : 0.60 + Math.random() * 0.25)).toFixed(2),
    injury_risk_score: Math.floor(5 + Math.random() * 5), // 5-9 scale
    
    venue_performance: Math.min(1.0, Math.max(0.4, (0.65 + Math.random() * 0.25) * creditMultiplier)).toFixed(2),
    pitch_suitability: Math.min(1.0, Math.max(0.5, (0.70 + Math.random() * 0.25) * creditMultiplier)).toFixed(2),
    weather_adaptability: Math.min(1.0, Math.max(0.4, 0.65 + Math.random() * 0.25)).toFixed(2),
    opposition_strength: Math.min(1.0, Math.max(0.5, (0.70 + Math.random() * 0.20) * creditMultiplier)).toFixed(2),
    head_to_head_record: Math.min(1.0, Math.max(0.3, 0.60 + Math.random() * 0.30)).toFixed(2),
    
    captain_potential: Math.min(1.0, Math.max(0.2, 
      (isBAT || isAR) ? (0.70 + Math.random() * 0.25) * creditMultiplier : 
      (0.40 + Math.random() * 0.30) * creditMultiplier
    )).toFixed(2),
    ownership_projection: Math.min(80, Math.max(5, player.selection_percentage * 0.6 + Math.random() * 15)).toFixed(1),
    price_efficiency: Math.min(1.0, Math.max(0.3, (player.points / player.credits) / 6)).toFixed(2),
    upset_potential: Math.min(1.0, Math.max(0.1, 1.0 - (creditMultiplier * 0.7))).toFixed(2),
    
    recent_match_points: JSON.stringify(
      Array.from({length: 5}, () => 
        Math.floor(Math.max(5, player.points * 0.7 + Math.random() * player.points * 0.6))
      )
    ),
    match_format_preference: ['Test', 'ODI', 'T20'][Math.floor(Math.random() * 3)],
    playing_conditions_preference: ['Day', 'Night'][Math.floor(Math.random() * 2)],
    
    // Role-specific advanced stats
    strike_rate: isBAT || isAR || isWK ? 
      Math.min(200, Math.max(80, 100 + Math.random() * 60 * creditMultiplier)).toFixed(1) : 
      Math.min(150, Math.max(60, 80 + Math.random() * 40)).toFixed(1),
    average: isBAT || isAR || isWK ? 
      Math.min(60, Math.max(15, 25 + Math.random() * 25 * creditMultiplier)).toFixed(1) : 
      Math.min(25, Math.max(5, 10 + Math.random() * 10)).toFixed(1),
    economy_rate: isBWL || isAR ? 
      Math.min(12, Math.max(4, 8 - Math.random() * 2 * creditMultiplier)).toFixed(1) : 
      Math.min(15, Math.max(6, 9 + Math.random() * 4)).toFixed(1),
    bowling_average: isBWL || isAR ? 
      Math.min(45, Math.max(15, 35 - Math.random() * 15 * creditMultiplier)).toFixed(1) : 
      Math.min(60, Math.max(25, 40 + Math.random() * 15)).toFixed(1),
    wickets_per_match: isBWL ? 
      Math.min(4, Math.max(0.5, 1.5 + Math.random() * 1.5 * creditMultiplier)).toFixed(1) : 
      isAR ? Math.min(2, Math.max(0.2, 0.8 + Math.random() * 0.8)).toFixed(1) : 
      Math.min(0.5, Math.random() * 0.3).toFixed(1),
    catches_per_match: isWK ? 
      Math.min(3, Math.max(0.5, 1.5 + Math.random() * 1.0)).toFixed(1) : 
      Math.min(2, Math.max(0.1, 0.5 + Math.random() * 0.8)).toFixed(1),
    run_outs_per_match: Math.min(0.5, Math.max(0, Math.random() * 0.3)).toFixed(1),
    boundaries_per_match: isBAT || isAR || isWK ? 
      Math.min(10, Math.max(1, 3 + Math.random() * 4 * creditMultiplier)).toFixed(1) : 
      Math.min(2, Math.random() * 1.5).toFixed(1),
    sixes_per_match: isBAT || isAR || isWK ? 
      Math.min(4, Math.max(0.2, 0.8 + Math.random() * 2 * creditMultiplier)).toFixed(1) : 
      Math.min(0.5, Math.random() * 0.3).toFixed(1),
    
    team_dependency_score: Math.min(1.0, Math.max(0.3, 0.65 + Math.random() * 0.25)).toFixed(2),
    pressure_performance: Math.min(1.0, Math.max(0.3, (0.60 + Math.random() * 0.30) * creditMultiplier)).toFixed(2),
    clutch_factor: Math.min(1.0, Math.max(0.2, (0.55 + Math.random() * 0.35) * creditMultiplier)).toFixed(2),
    
    last_5_matches_avg: Math.min(80, Math.max(8, player.points * 0.9 + Math.random() * player.points * 0.4)).toFixed(1),
    season_trend: ['Improving', 'Stable', 'Declining', 'Peak Form'][Math.floor(Math.random() * 4)],
    peak_performance_month: ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December'][Math.floor(Math.random() * 12)]
  };
}

async function runMigration() {
  console.log('🚀 Starting database schema migration...');
  console.log('⚠️  This will add new fields to matches and players tables and populate them with enhanced dummy data');
  
  try {
    // Step 1: Migrate table schemas
    await migrateMatchesTable();
    await migratePlayersTable();
    
    // Step 2: Populate enhanced data
    await populateEnhancedMatchData();
    await populateEnhancedPlayerData();
    
    console.log('🎉 Database migration completed successfully!');
    console.log('📊 Enhanced analytics fields have been added and populated for all existing records');
    
    // Summary
    const matches = await neonDB.getAllMatches();
    const players = await neonDB.getAllPlayers();
    console.log(`✅ Migration Summary: ${matches.length} matches and ${players.length} players updated with enhanced fields`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Export functions for use in other scripts
export { 
  runMigration, 
  migrateMatchesTable, 
  migratePlayersTable, 
  populateEnhancedMatchData, 
  populateEnhancedPlayerData 
};

// Run migration if called directly
if (require.main === module) {
  runMigration().then(() => {
    console.log('Migration script completed successfully.');
    process.exit(0);
  }).catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
}
