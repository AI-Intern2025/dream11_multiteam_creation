import { config } from 'dotenv';
import { Pool } from 'pg';

// Load environment variables
config({ path: '.env.local' });

// Direct database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function executeQuery(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

async function addAdvancedStatsColumns() {
  console.log('🔧 Adding advanced statistical columns to players table...');
  
  try {
    // Add all the advanced statistical fields that are missing
    const alterTableQueries = [
      // Basic performance fields
      `ALTER TABLE players ADD COLUMN IF NOT EXISTS dream_team_percentage INTEGER DEFAULT 0;`,
      `ALTER TABLE players ADD COLUMN IF NOT EXISTS selection_percentage INTEGER DEFAULT 0;`,
      
      // Advanced performance metrics
      `ALTER TABLE players ADD COLUMN IF NOT EXISTS recent_form_rating DECIMAL(3,2) DEFAULT 0.5;`,
      `ALTER TABLE players ADD COLUMN IF NOT EXISTS consistency_score DECIMAL(3,2) DEFAULT 0.5;`,
      `ALTER TABLE players ADD COLUMN IF NOT EXISTS versatility_score DECIMAL(3,2) DEFAULT 0.5;`,
      `ALTER TABLE players ADD COLUMN IF NOT EXISTS injury_risk_score INTEGER DEFAULT 7;`,
      
      // Venue & conditions performance
      `ALTER TABLE players ADD COLUMN IF NOT EXISTS venue_performance DECIMAL(3,2) DEFAULT 0.5;`,
      `ALTER TABLE players ADD COLUMN IF NOT EXISTS pitch_suitability DECIMAL(3,2) DEFAULT 0.5;`,
      `ALTER TABLE players ADD COLUMN IF NOT EXISTS weather_adaptability DECIMAL(3,2) DEFAULT 0.5;`,
      
      // Opposition & matchup data
      `ALTER TABLE players ADD COLUMN IF NOT EXISTS opposition_strength DECIMAL(3,2) DEFAULT 0.5;`,
      `ALTER TABLE players ADD COLUMN IF NOT EXISTS head_to_head_record DECIMAL(3,2) DEFAULT 0.5;`,
      `ALTER TABLE players ADD COLUMN IF NOT EXISTS captain_potential DECIMAL(3,2) DEFAULT 0.5;`,
      
      // Fantasy-specific metrics
      `ALTER TABLE players ADD COLUMN IF NOT EXISTS ownership_projection INTEGER DEFAULT 30;`,
      `ALTER TABLE players ADD COLUMN IF NOT EXISTS price_efficiency DECIMAL(3,2) DEFAULT 0.5;`,
      `ALTER TABLE players ADD COLUMN IF NOT EXISTS upset_potential DECIMAL(3,2) DEFAULT 0.5;`,
      
      // Match-specific data
      `ALTER TABLE players ADD COLUMN IF NOT EXISTS recent_match_points INTEGER[] DEFAULT '{}';`,
      `ALTER TABLE players ADD COLUMN IF NOT EXISTS match_format_preference VARCHAR(10) DEFAULT 'T20';`,
      `ALTER TABLE players ADD COLUMN IF NOT EXISTS playing_conditions_preference VARCHAR(20) DEFAULT 'Day';`
    ];

    // Execute all queries
    for (const queryText of alterTableQueries) {
      console.log(`🔄 Executing: ${queryText.substring(0, 60)}...`);
      await executeQuery(queryText);
    }
    
    console.log('✅ All advanced statistical columns added successfully!');
    
    // Verify the new columns exist
    const verifyQuery = `
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'players' 
      AND column_name IN (
        'dream_team_percentage', 'selection_percentage', 'recent_form_rating',
        'consistency_score', 'versatility_score', 'injury_risk_score',
        'venue_performance', 'pitch_suitability', 'weather_adaptability',
        'opposition_strength', 'head_to_head_record', 'captain_potential',
        'ownership_projection', 'price_efficiency', 'upset_potential'
      )
      ORDER BY column_name;
    `;
    
    const result = await executeQuery(verifyQuery);
    console.log('\n📊 Verified new columns:');
    result.rows.forEach(row => {
      console.log(`  ✅ ${row.column_name}: ${row.data_type} (default: ${row.column_default})`);
    });
    
  } catch (error) {
    console.error('❌ Error adding advanced stats columns:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting database schema migration...');
  
  try {
    await addAdvancedStatsColumns();
    console.log('\n🎉 Database schema migration completed successfully!');
    console.log('📝 Next step: Run the dummy data script to populate the advanced stats');
  } catch (error) {
    console.error('❌ Database migration failed:', error);
    process.exit(1);
  }
}

main();
