import { config } from 'dotenv';
import { neonDB } from '../lib/neon-db';

// Load environment variables
config({ path: '.env.local' });

/**
 * Enhanced Dummy Data Population Script
 * 
 * This script populates the database with comprehensive dummy data including
 * all the new enhanced analytics fields for both matches and players.
 * It can be run after the migration to ensure all data is properly populated.
 */

// Enhanced dummy matches with all new fields
const enhancedDummyMatches = [
  {
    team_name: 'India vs Australia',
    match_venue: 'Wankhede Stadium',
    match_date: new Date('2024-03-15'),
    match_format: 'T20',
    is_active: true,
    start_time: '19:30',
    end_time: '23:00',
    is_upcoming: false,
    status: 'Live',
    venue_condition: 'Excellent',
    pitch_condition: 'Batting Friendly',
    weather_condition: 'Clear',
    predicted_score_range: JSON.stringify({min: 160, max: 200}),
    weather_prediction: 'Clear skies, no rain expected',
    pitch_condition_prediction: 'High scoring, favors batsmen',
    toss_factor: 0.55,
    home_advantage: 0.10,
    recent_form_comparison: JSON.stringify({team_a: 0.85, team_b: 0.78}),
    key_player_impact: JSON.stringify({
      team_a: ['V Kohli', 'R Sharma', 'J Bumrah'],
      team_b: ['S Smith', 'D Warner', 'P Cummins']
    }),
    match_importance_factor: 0.95,
    crowd_factor: 0.90,
    broadcast_viewership_prediction: 15000000,
    fantasy_difficulty_rating: 0.80,
    injury_updates: JSON.stringify({
      confirmed: [],
      doubtful: ['K Rahul - Fitness Test']
    }),
    team_news: JSON.stringify({
      team_a: 'Full strength squad available',
      team_b: 'Warner returns after injury'
    })
  },
  {
    team_name: 'England vs Pakistan',
    match_venue: 'Lords',
    match_date: new Date('2024-03-16'),
    match_format: 'ODI',
    is_active: false,
    start_time: '14:00',
    end_time: '22:30',
    is_upcoming: true,
    status: 'Upcoming',
    venue_condition: 'Good',
    pitch_condition: 'Balanced',
    weather_condition: 'Partly Cloudy',
    predicted_score_range: JSON.stringify({min: 280, max: 320}),
    weather_prediction: 'Overcast conditions, slight chance of rain',
    pitch_condition_prediction: 'Even contest between bat and ball',
    toss_factor: 0.48,
    home_advantage: 0.08,
    recent_form_comparison: JSON.stringify({team_a: 0.72, team_b: 0.88}),
    key_player_impact: JSON.stringify({
      team_a: ['J Root', 'B Stokes', 'J Anderson'],
      team_b: ['B Azam', 'M Rizwan', 'S Afridi']
    }),
    match_importance_factor: 0.85,
    crowd_factor: 0.75,
    broadcast_viewership_prediction: 8500000,
    fantasy_difficulty_rating: 0.65,
    injury_updates: JSON.stringify({
      confirmed: ['J Archer - Ruled Out'],
      doubtful: []
    }),
    team_news: JSON.stringify({
      team_a: 'Stokes to lead in Morgans absence',
      team_b: 'Babar confident about series win'
    })
  }
];

// Sample enhanced player data with all new analytics fields
const enhancedPlayerSample = {
  name: 'V Kohli',
  full_name: 'Virat Kohli',
  team_name: 'India',
  player_role: 'BAT',
  credits: 12.0,
  selection_percentage: 95.2,
  points: 68,
  is_playing_today: true,
  country: 'India',
  batting_style: 'RH',
  bowling_style: 'RH',
  
  // Enhanced analytics fields
  dream_team_percentage: 89.4,
  recent_form_rating: 0.94,
  consistency_score: 0.96,
  versatility_score: 0.91,
  injury_risk_score: 8,
  
  venue_performance: 0.92,
  pitch_suitability: 0.95,
  weather_adaptability: 0.88,
  opposition_strength: 0.93,
  head_to_head_record: 0.89,
  
  captain_potential: 0.98,
  ownership_projection: 67.8,
  price_efficiency: 0.85,
  upset_potential: 0.15,
  
  recent_match_points: JSON.stringify([72, 55, 78, 61, 68]),
  match_format_preference: 'ODI',
  playing_conditions_preference: 'Day',
  
  // Advanced statistics
  strike_rate: 137.8,
  average: 52.4,
  economy_rate: 12.0,
  bowling_average: 45.0,
  wickets_per_match: 0.1,
  catches_per_match: 0.9,
  run_outs_per_match: 0.2,
  boundaries_per_match: 6.8,
  sixes_per_match: 2.1,
  
  team_dependency_score: 0.85,
  pressure_performance: 0.96,
  clutch_factor: 0.94,
  
  last_5_matches_avg: 66.8,
  season_trend: 'Peak Form',
  peak_performance_month: 'October'
};

async function insertEnhancedDummyData() {
  console.log('🚀 Starting enhanced dummy data insertion...');
  
  try {
    // Check if migration has been run by looking for new columns
    console.log('🔍 Verifying database schema...');
    
    const testQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'players' 
      AND column_name = 'dream_team_percentage'
    `;
    
    const schemaCheck = await neonDB.query(testQuery);
    
    if (schemaCheck.rows.length === 0) {
      console.log('⚠️  Enhanced schema not detected. Please run migration first:');
      console.log('   npm run ts-node scripts/migrate-database-schema.ts');
      return;
    }

    console.log('✅ Enhanced schema detected. Proceeding with data insertion...');

    // Insert enhanced matches
    console.log('📊 Inserting enhanced matches...');
    for (const match of enhancedDummyMatches) {
      try {
        const insertQuery = `
          INSERT INTO matches (
            team_name, match_venue, match_date, match_format, is_active, 
            start_time, end_time, is_upcoming, status, venue_condition, 
            pitch_condition, weather_condition, predicted_score_range,
            weather_prediction, pitch_condition_prediction, toss_factor,
            home_advantage, recent_form_comparison, key_player_impact,
            match_importance_factor, crowd_factor, broadcast_viewership_prediction,
            fantasy_difficulty_rating, injury_updates, team_news
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
            $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25
          ) RETURNING id, team_name
        `;
        
        const values = [
          match.team_name, match.match_venue, match.match_date, match.match_format,
          match.is_active, match.start_time, match.end_time, match.is_upcoming,
          match.status, match.venue_condition, match.pitch_condition, match.weather_condition,
          match.predicted_score_range, match.weather_prediction, match.pitch_condition_prediction,
          match.toss_factor, match.home_advantage, match.recent_form_comparison,
          match.key_player_impact, match.match_importance_factor, match.crowd_factor,
          match.broadcast_viewership_prediction, match.fantasy_difficulty_rating,
          match.injury_updates, match.team_news
        ];
        
        const result = await neonDB.query(insertQuery, values);
        console.log(`✅ Inserted enhanced match: ${result.rows[0].team_name}`);
      } catch (error: any) {
        if (error.code === '23505') { // Duplicate key error
          console.log(`⚠️  Match already exists: ${match.team_name}`);
        } else {
          console.error(`❌ Error inserting match ${match.team_name}:`, error.message);
        }
      }
    }

    // Insert sample enhanced player
    console.log('👥 Inserting sample enhanced player...');
    try {
      const playerInsertQuery = `
        INSERT INTO players (
          name, full_name, team_name, player_role, credits, selection_percentage,
          points, is_playing_today, country, batting_style, bowling_style,
          dream_team_percentage, recent_form_rating, consistency_score,
          versatility_score, injury_risk_score, venue_performance,
          pitch_suitability, weather_adaptability, opposition_strength,
          head_to_head_record, captain_potential, ownership_projection,
          price_efficiency, upset_potential, recent_match_points,
          match_format_preference, playing_conditions_preference,
          strike_rate, average, economy_rate, bowling_average,
          wickets_per_match, catches_per_match, run_outs_per_match,
          boundaries_per_match, sixes_per_match, team_dependency_score,
          pressure_performance, clutch_factor, last_5_matches_avg,
          season_trend, peak_performance_month
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
          $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26,
          $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38,
          $39, $40, $41, $42, $43
        ) 
        ON CONFLICT (name, team_name) 
        DO UPDATE SET 
          dream_team_percentage = EXCLUDED.dream_team_percentage,
          recent_form_rating = EXCLUDED.recent_form_rating,
          consistency_score = EXCLUDED.consistency_score
        RETURNING name, team_name
      `;
      
      const playerValues = [
        enhancedPlayerSample.name, enhancedPlayerSample.full_name, enhancedPlayerSample.team_name,
        enhancedPlayerSample.player_role, enhancedPlayerSample.credits, enhancedPlayerSample.selection_percentage,
        enhancedPlayerSample.points, enhancedPlayerSample.is_playing_today, enhancedPlayerSample.country,
        enhancedPlayerSample.batting_style, enhancedPlayerSample.bowling_style, enhancedPlayerSample.dream_team_percentage,
        enhancedPlayerSample.recent_form_rating, enhancedPlayerSample.consistency_score, enhancedPlayerSample.versatility_score,
        enhancedPlayerSample.injury_risk_score, enhancedPlayerSample.venue_performance, enhancedPlayerSample.pitch_suitability,
        enhancedPlayerSample.weather_adaptability, enhancedPlayerSample.opposition_strength, enhancedPlayerSample.head_to_head_record,
        enhancedPlayerSample.captain_potential, enhancedPlayerSample.ownership_projection, enhancedPlayerSample.price_efficiency,
        enhancedPlayerSample.upset_potential, enhancedPlayerSample.recent_match_points, enhancedPlayerSample.match_format_preference,
        enhancedPlayerSample.playing_conditions_preference, enhancedPlayerSample.strike_rate, enhancedPlayerSample.average,
        enhancedPlayerSample.economy_rate, enhancedPlayerSample.bowling_average, enhancedPlayerSample.wickets_per_match,
        enhancedPlayerSample.catches_per_match, enhancedPlayerSample.run_outs_per_match, enhancedPlayerSample.boundaries_per_match,
        enhancedPlayerSample.sixes_per_match, enhancedPlayerSample.team_dependency_score, enhancedPlayerSample.pressure_performance,
        enhancedPlayerSample.clutch_factor, enhancedPlayerSample.last_5_matches_avg, enhancedPlayerSample.season_trend,
        enhancedPlayerSample.peak_performance_month
      ];
      
      const playerResult = await neonDB.query(playerInsertQuery, playerValues);
      console.log(`✅ Inserted/Updated enhanced player: ${playerResult.rows[0].name} (${playerResult.rows[0].team_name})`);
    } catch (error: any) {
      console.error('❌ Error inserting enhanced player:', error.message);
    }

    console.log('🎉 Enhanced dummy data insertion completed successfully!');
    
    // Verify enhanced data
    const matches = await neonDB.getAllMatches();
    const players = await neonDB.getAllPlayers();
    console.log(`📈 Summary: ${matches.length} matches and ${players.length} players in database with enhanced fields`);
    
  } catch (error) {
    console.error('❌ Error inserting enhanced dummy data:', error);
    throw error;
  }
}

// Export for use in other scripts
export { insertEnhancedDummyData, enhancedDummyMatches, enhancedPlayerSample };

// Run the script if called directly
if (require.main === module) {
  insertEnhancedDummyData().then(() => {
    console.log('Enhanced dummy data script completed.');
    process.exit(0);
  }).catch((error) => {
    console.error('Enhanced dummy data script failed:', error);
    process.exit(1);
  });
}
