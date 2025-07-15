import { config } from 'dotenv';
import { Pool } from 'pg';

// Load environment variables
config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function updatePlayerStats() {
  try {
    console.log('🚀 Starting player stats update...');
    
    const client = await pool.connect();
    
    // First, let's see what players exist
    const playersResult = await client.query('SELECT id, name, team_name FROM players LIMIT 5');
    console.log('📊 Sample existing players:', playersResult.rows);
    
    // Update players with advanced stats
    const updateQuery = `
      UPDATE players SET
        recent_form_rating = CASE 
          WHEN name = 'Virat Kohli' THEN 0.88
          WHEN name = 'Rohit Sharma' THEN 0.85
          WHEN name = 'Joe Root' THEN 0.82
          WHEN name = 'Babar Azam' THEN 0.86
          ELSE 0.60 + (RANDOM() * 0.3)
        END,
        consistency_score = CASE 
          WHEN name = 'Virat Kohli' THEN 0.82
          WHEN name = 'Rohit Sharma' THEN 0.88
          WHEN name = 'Joe Root' THEN 0.85
          WHEN name = 'Babar Azam' THEN 0.78
          ELSE 0.50 + (RANDOM() * 0.35)
        END,
        versatility_score = CASE 
          WHEN player_role = 'AR' THEN 0.85 + (RANDOM() * 0.15)
          WHEN player_role = 'BAT' THEN 0.60 + (RANDOM() * 0.25)
          WHEN player_role = 'BWL' THEN 0.55 + (RANDOM() * 0.25)
          WHEN player_role = 'WK' THEN 0.70 + (RANDOM() * 0.20)
          ELSE 0.60 + (RANDOM() * 0.25)
        END,
        injury_risk_score = CASE 
          WHEN name IN ('Virat Kohli', 'Rohit Sharma', 'Joe Root', 'Babar Azam') THEN 7 + FLOOR(RANDOM() * 3)
          ELSE 5 + FLOOR(RANDOM() * 5)
        END,
        venue_performance = 0.50 + (RANDOM() * 0.45),
        pitch_suitability = CASE 
          WHEN player_role = 'BAT' THEN 0.70 + (RANDOM() * 0.25)
          WHEN player_role = 'BWL' THEN 0.65 + (RANDOM() * 0.30)
          WHEN player_role = 'AR' THEN 0.75 + (RANDOM() * 0.20)
          WHEN player_role = 'WK' THEN 0.65 + (RANDOM() * 0.25)
          ELSE 0.60 + (RANDOM() * 0.30)
        END,
        weather_adaptability = 0.55 + (RANDOM() * 0.35),
        opposition_strength = 0.60 + (RANDOM() * 0.30),
        head_to_head_record = 0.50 + (RANDOM() * 0.40),
        captain_potential = CASE 
          WHEN name IN ('Virat Kohli', 'Rohit Sharma', 'Joe Root', 'Babar Azam') THEN 0.85 + (RANDOM() * 0.15)
          WHEN player_role = 'BAT' THEN 0.60 + (RANDOM() * 0.30)
          WHEN player_role = 'AR' THEN 0.65 + (RANDOM() * 0.25)
          ELSE 0.40 + (RANDOM() * 0.35)
        END,
        ownership_projection = CASE 
          WHEN name IN ('Virat Kohli', 'Rohit Sharma') THEN 65 + FLOOR(RANDOM() * 20)
          WHEN name IN ('Joe Root', 'Babar Azam') THEN 55 + FLOOR(RANDOM() * 25)
          ELSE 20 + FLOOR(RANDOM() * 50)
        END,
        price_efficiency = 0.40 + (RANDOM() * 0.45),
        upset_potential = CASE 
          WHEN name IN ('Virat Kohli', 'Rohit Sharma', 'Joe Root', 'Babar Azam') THEN 0.15 + (RANDOM() * 0.20)
          ELSE 0.25 + (RANDOM() * 0.45)
        END
      WHERE dream_team_percentage IS NOT NULL;
    `;
    
    const result = await client.query(updateQuery);
    console.log(`✅ Updated ${result.rowCount} players with advanced stats`);
    
    // Verify the update
    const verifyResult = await client.query(`
      SELECT name, team_name, recent_form_rating, consistency_score, captain_potential, ownership_projection
      FROM players 
      WHERE recent_form_rating IS NOT NULL 
      LIMIT 5
    `);
    
    console.log('🔍 Sample updated players:');
    verifyResult.rows.forEach(player => {
      console.log(`  ${player.name} (${player.team_name}): Form=${player.recent_form_rating?.toFixed(2)}, Consistency=${player.consistency_score?.toFixed(2)}, Captain=${player.captain_potential?.toFixed(2)}, Ownership=${player.ownership_projection}%`);
    });
    
    client.release();
    await pool.end();
    
    console.log('🎉 Player stats update completed successfully!');
    
  } catch (error) {
    console.error('❌ Error updating player stats:', error);
  }
}

updatePlayerStats();
