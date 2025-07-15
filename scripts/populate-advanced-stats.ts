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

// Function to generate realistic advanced stats based on player role and base stats
function generateAdvancedStats(player: any) {
  const { player_role, points, credits } = player;
  
  // Base performance indicators
  const basePerformance = Math.min(100, Math.max(0, points || 0)) / 100;
  const creditRatio = (credits || 8) / 15; // Normalize credits to 0-1 scale
  
  // Role-specific adjustments
  const roleMultipliers = {
    'BAT': { consistency: 1.1, versatility: 0.9, captainPotential: 1.2 },
    'BWL': { consistency: 1.0, versatility: 0.8, captainPotential: 0.9 },
    'AR': { consistency: 0.9, versatility: 1.3, captainPotential: 1.1 },
    'WK': { consistency: 1.2, versatility: 1.0, captainPotential: 1.1 }
  };
  
  const multiplier = roleMultipliers[player_role as keyof typeof roleMultipliers] || roleMultipliers['BAT'];
  
  // Generate realistic values with some randomness
  const random = (base: number, variance: number = 0.3) => {
    const randomFactor = (Math.random() - 0.5) * variance;
    return Math.max(0, Math.min(1, base + randomFactor));
  };
  
  const randomInt = (base: number, min: number = 0, max: number = 100) => {
    const variance = (max - min) * 0.3;
    const randomFactor = (Math.random() - 0.5) * variance;
    return Math.max(min, Math.min(max, Math.round(base + randomFactor)));
  };
  
  return {
    dream_team_percentage: randomInt(basePerformance * 80 + 10, 5, 95),
    selection_percentage: randomInt(basePerformance * 60 + 15, 5, 85),
    recent_form_rating: random(basePerformance * multiplier.consistency),
    consistency_score: random(basePerformance * multiplier.consistency * 0.8 + 0.2),
    versatility_score: random(basePerformance * multiplier.versatility * 0.7 + 0.3),
    injury_risk_score: randomInt(7 + basePerformance * 2, 3, 10),
    venue_performance: random(basePerformance * 0.8 + 0.2),
    pitch_suitability: random(basePerformance * 0.7 + 0.3),
    weather_adaptability: random(basePerformance * 0.6 + 0.4),
    opposition_strength: random(basePerformance * 0.8 + 0.2),
    head_to_head_record: random(basePerformance * 0.7 + 0.3),
    captain_potential: random(basePerformance * multiplier.captainPotential * 0.8 + 0.2),
    ownership_projection: randomInt(basePerformance * 60 + 10, 5, 90),
    price_efficiency: random(basePerformance * 0.8 + 0.2),
    upset_potential: random(0.5 - basePerformance * 0.3 + 0.2), // Lower for consistent players
    recent_match_points: Array.from({ length: 5 }, () => randomInt(basePerformance * 80 + 10, 0, 120)),
    match_format_preference: ['T20', 'ODI', 'Test'][Math.floor(Math.random() * 3)],
    playing_conditions_preference: ['Day', 'Night', 'Dawn'][Math.floor(Math.random() * 3)]
  };
}

async function updatePlayerAdvancedStats() {
  console.log('🚀 Starting player advanced stats update...');
  
  try {
    // Get all players
    const playersResult = await executeQuery('SELECT * FROM players ORDER BY id');
    const players = playersResult.rows;
    
    console.log(`📊 Found ${players.length} players to update`);
    
    // Update each player with advanced stats
    for (const player of players) {
      const advancedStats = generateAdvancedStats(player);
      
      const updateQuery = `
        UPDATE players SET
          dream_team_percentage = $1,
          selection_percentage = $2,
          recent_form_rating = $3,
          consistency_score = $4,
          versatility_score = $5,
          injury_risk_score = $6,
          venue_performance = $7,
          pitch_suitability = $8,
          weather_adaptability = $9,
          opposition_strength = $10,
          head_to_head_record = $11,
          captain_potential = $12,
          ownership_projection = $13,
          price_efficiency = $14,
          upset_potential = $15,
          recent_match_points = $16,
          match_format_preference = $17,
          playing_conditions_preference = $18
        WHERE id = $19
      `;
      
      const params = [
        advancedStats.dream_team_percentage,
        advancedStats.selection_percentage,
        advancedStats.recent_form_rating,
        advancedStats.consistency_score,
        advancedStats.versatility_score,
        advancedStats.injury_risk_score,
        advancedStats.venue_performance,
        advancedStats.pitch_suitability,
        advancedStats.weather_adaptability,
        advancedStats.opposition_strength,
        advancedStats.head_to_head_record,
        advancedStats.captain_potential,
        advancedStats.ownership_projection,
        advancedStats.price_efficiency,
        advancedStats.upset_potential,
        advancedStats.recent_match_points,
        advancedStats.match_format_preference,
        advancedStats.playing_conditions_preference,
        player.id
      ];
      
      await executeQuery(updateQuery, params);
      
      console.log(`✅ Updated ${player.name} (${player.player_role}) - Dream Team: ${advancedStats.dream_team_percentage}%, Form: ${(advancedStats.recent_form_rating * 100).toFixed(1)}%`);
    }
    
    console.log('✅ All players updated successfully!');
    
    // Verify the updates
    const verifyQuery = `
      SELECT name, player_role, dream_team_percentage, selection_percentage, 
             recent_form_rating, consistency_score, captain_potential
      FROM players 
      WHERE dream_team_percentage > 0 
      ORDER BY dream_team_percentage DESC 
      LIMIT 10
    `;
    
    const verifyResult = await executeQuery(verifyQuery);
    console.log('\n📊 Top 10 players by Dream Team percentage:');
    verifyResult.rows.forEach((player, index) => {
      console.log(`${index + 1}. ${player.name} (${player.player_role}): ${player.dream_team_percentage}% dream team, ${(player.recent_form_rating * 100).toFixed(1)}% form, ${(player.captain_potential * 100).toFixed(1)}% captain potential`);
    });
    
  } catch (error) {
    console.error('❌ Error updating player stats:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting player advanced stats population...');
  
  try {
    await updatePlayerAdvancedStats();
    console.log('\n🎉 Player advanced stats population completed successfully!');
    console.log('📝 Now the ML optimization should work properly with realistic data');
  } catch (error) {
    console.error('❌ Player stats update failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
