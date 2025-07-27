import { config } from 'dotenv';
import { neonDB } from '../lib/neon-db';

// Load environment variables
config({ path: '.env.local' });

/**
 * Database Schema Verification Script
 * 
 * This script verifies that the database schema migration was successful
 * by checking for the existence of new fields in both tables.
 */

async function verifyMigration() {
  console.log('🔍 Verifying database schema migration...');
  
  try {
    // Check matches table new fields
    console.log('\n📊 Checking matches table enhancements...');
    const matchesFieldsQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'matches' 
      AND column_name IN (
        'predicted_score_range', 'weather_prediction', 'pitch_condition_prediction',
        'toss_factor', 'home_advantage', 'recent_form_comparison', 'key_player_impact',
        'match_importance_factor', 'crowd_factor', 'broadcast_viewership_prediction',
        'fantasy_difficulty_rating', 'injury_updates', 'team_news'
      )
      ORDER BY column_name;
    `;
    
    const matchesFields = await neonDB.query(matchesFieldsQuery);
    console.log(`✅ Found ${matchesFields.rows.length}/13 enhanced matches fields:`);
    matchesFields.rows.forEach(row => {
      console.log(`   • ${row.column_name} (${row.data_type})`);
    });

    // Check players table new fields
    console.log('\n👥 Checking players table enhancements...');
    const playersFieldsQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'players' 
      AND column_name IN (
        'dream_team_percentage', 'recent_form_rating', 'consistency_score',
        'versatility_score', 'injury_risk_score', 'venue_performance',
        'pitch_suitability', 'weather_adaptability', 'opposition_strength',
        'head_to_head_record', 'captain_potential', 'ownership_projection',
        'price_efficiency', 'upset_potential', 'recent_match_points',
        'match_format_preference', 'playing_conditions_preference',
        'strike_rate', 'average', 'economy_rate', 'bowling_average',
        'wickets_per_match', 'catches_per_match', 'run_outs_per_match',
        'boundaries_per_match', 'sixes_per_match', 'team_dependency_score',
        'pressure_performance', 'clutch_factor', 'last_5_matches_avg',
        'season_trend', 'peak_performance_month'
      )
      ORDER BY column_name;
    `;
    
    const playersFields = await neonDB.query(playersFieldsQuery);
    console.log(`✅ Found ${playersFields.rows.length}/32 enhanced players fields:`);
    playersFields.rows.forEach(row => {
      console.log(`   • ${row.column_name} (${row.data_type})`);
    });

    // Check total table structure
    console.log('\n📈 Table Summary:');
    const matchesCount = await neonDB.query("SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'matches'");
    const playersCount = await neonDB.query("SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'players'");
    
    console.log(`   • Matches table: ${matchesCount.rows[0].count} total columns`);
    console.log(`   • Players table: ${playersCount.rows[0].count} total columns`);

    // Check for sample data
    console.log('\n🔍 Checking for existing data...');
    const matchesData = await neonDB.query("SELECT COUNT(*) FROM matches");
    const playersData = await neonDB.query("SELECT COUNT(*) FROM players");
    
    console.log(`   • Matches records: ${matchesData.rows[0].count}`);
    console.log(`   • Players records: ${playersData.rows[0].count}`);

    if (matchesFields.rows.length === 13 && playersFields.rows.length === 32) {
      console.log('\n🎉 Schema migration verification SUCCESSFUL!');
      console.log('✅ All enhanced fields have been added to both tables');
    } else {
      console.log('\n⚠️  Schema migration partially complete:');
      console.log(`   • Matches fields: ${matchesFields.rows.length}/13`);
      console.log(`   • Players fields: ${playersFields.rows.length}/32`);
    }

  } catch (error: any) {
    console.error('❌ Verification failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Database connection failed. Please ensure:');
      console.log('   1. DATABASE_URL environment variable is set');
      console.log('   2. Neon PostgreSQL database is accessible');
      console.log('   3. Network connection is available');
    }
  }
}

// Export for use in other scripts
export { verifyMigration };

// Run verification if called directly
if (require.main === module) {
  verifyMigration().then(() => {
    console.log('\n✨ Schema verification completed.');
    process.exit(0);
  }).catch((error) => {
    console.error('Schema verification failed:', error);
    process.exit(1);
  });
}
