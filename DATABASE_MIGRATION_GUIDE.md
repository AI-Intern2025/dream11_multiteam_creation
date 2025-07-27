# Database Schema Migration Guide

## Overview

This guide covers the enhanced database schema migration that adds comprehensive analytics fields to your Dream11 Multi-Team Creator project. The migration adds advanced performance metrics, contextual analytics, and fantasy-specific data points to both matches and players tables.

## Migration Features

### Enhanced Matches Table
The migration adds the following fields to the `matches` table:

- **`predicted_score_range`** (JSONB): Min/max score predictions
- **`weather_prediction`** (TEXT): Detailed weather forecast
- **`pitch_condition_prediction`** (TEXT): Pitch behavior analysis
- **`toss_factor`** (DECIMAL): Toss win advantage coefficient
- **`home_advantage`** (DECIMAL): Home ground advantage factor
- **`recent_form_comparison`** (JSONB): Team form comparison
- **`key_player_impact`** (JSONB): Important players from both teams
- **`match_importance_factor`** (DECIMAL): Tournament significance
- **`crowd_factor`** (DECIMAL): Crowd support influence
- **`broadcast_viewership_prediction`** (INTEGER): Expected viewership
- **`fantasy_difficulty_rating`** (DECIMAL): Fantasy complexity score
- **`injury_updates`** (JSONB): Player injury status
- **`team_news`** (JSONB): Latest team announcements

### Enhanced Players Table
The migration adds 32+ new fields to the `players` table:

#### Analytics & Performance
- **`dream_team_percentage`** (DECIMAL): Dream11 selection likelihood
- **`recent_form_rating`** (DECIMAL): Last 5 matches performance (0-1)
- **`consistency_score`** (DECIMAL): Performance variance measure (0-1)
- **`versatility_score`** (DECIMAL): Multi-format adaptability (0-1)
- **`injury_risk_score`** (INTEGER): Injury probability (1-10 scale)

#### Contextual Performance
- **`venue_performance`** (DECIMAL): Venue-specific stats (0-1)
- **`pitch_suitability`** (DECIMAL): Pitch preference match (0-1)
- **`weather_adaptability`** (DECIMAL): Weather condition performance (0-1)
- **`opposition_strength`** (DECIMAL): Performance vs opponent quality (0-1)
- **`head_to_head_record`** (DECIMAL): Historical matchup stats (0-1)

#### Fantasy Specifics
- **`captain_potential`** (DECIMAL): Captaincy suitability (0-1)
- **`ownership_projection`** (DECIMAL): Expected ownership percentage
- **`price_efficiency`** (DECIMAL): Value for money rating (0-1)
- **`upset_potential`** (DECIMAL): Surprise performance likelihood (0-1)

#### Advanced Statistics
- **`strike_rate`** (DECIMAL): Batting strike rate
- **`average`** (DECIMAL): Batting/bowling average
- **`economy_rate`** (DECIMAL): Bowling economy
- **`wickets_per_match`** (DECIMAL): Average wickets taken
- **`catches_per_match`** (DECIMAL): Fielding contributions
- **`boundaries_per_match`** (DECIMAL): 4s and 6s frequency
- And many more performance metrics...

## Migration Steps

### Step 1: Run the Migration
```bash
# Navigate to your project directory
cd d:\VJTI\Internship\Dream11\dream11_multiteam_creation

# Run the database schema migration
npx ts-node scripts/migrate-database-schema.ts
```

### Step 2: Verify Migration
```bash
# Test the migration to ensure all fields were added
npx ts-node scripts/test-migration.ts
```

### Step 3: Populate Enhanced Data
```bash
# Add sample enhanced data with all new fields
npx ts-node scripts/insert-enhanced-dummy-data.ts
```

## What the Migration Does

### 1. **Schema Enhancement**
- Adds new columns to existing tables using `ALTER TABLE` statements
- Uses `IF NOT EXISTS` to prevent errors if columns already exist
- Sets appropriate default values for all new fields

### 2. **Data Population** 
- Generates realistic dummy data for all new fields
- Uses role-specific logic (BAT/BWL/AR/WK) for appropriate statistics
- Considers player credits and existing performance for data generation

### 3. **Backward Compatibility**
- Preserves all existing data
- Uses safe default values for new fields
- Does not modify existing table structure

## Migration Scripts Overview

### `migrate-database-schema.ts`
Main migration script that:
- Adds new columns to matches and players tables
- Populates existing records with enhanced dummy data
- Provides comprehensive error handling
- Generates role-appropriate statistics

### `test-migration.ts`
Testing script that:
- Validates the migration process
- Checks for successful field additions
- Ensures data integrity

### `insert-enhanced-dummy-data.ts`  
Enhanced data population script that:
- Adds sample records with all new fields
- Demonstrates the enhanced schema structure
- Can be run after migration for additional test data

## Data Generation Logic

### Match Data Generation
- **Predicted Scores**: Based on venue and format (T20: 140-240, ODI: 200-350)
- **Weather Predictions**: Realistic conditions based on venue
- **Toss Factors**: Statistical advantage coefficients (0.45-0.55)
- **Home Advantage**: Location-based advantage factors

### Player Data Generation  
- **Credit-Based Stats**: Higher credits → better performance metrics
- **Role-Specific Logic**: 
  - Batsmen: Higher strike rates, averages, boundary frequency
  - Bowlers: Better economy rates, wicket-taking ability
  - All-rounders: Balanced stats across disciplines
  - Wicket-keepers: Enhanced catching stats
- **Contextual Factors**: Venue performance, opposition strength, pitch suitability

## Troubleshooting

### Common Issues

1. **"Field already exists" warnings**
   - These are normal if re-running the migration
   - The migration uses `IF NOT EXISTS` to prevent errors

2. **Database connection errors**
   - Ensure your `DATABASE_URL` environment variable is set
   - Check Neon PostgreSQL connection settings

3. **Type errors during compilation**
   - Make sure TypeScript dependencies are up to date
   - Run `npm install` to ensure proper packages

### Verification Queries

Check if migration was successful:
```sql
-- Check new matches table columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'matches' 
AND column_name LIKE '%prediction%';

-- Check new players table columns  
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'players' 
AND column_name LIKE '%dream_team%';

-- Sample enhanced data
SELECT name, dream_team_percentage, recent_form_rating, captain_potential 
FROM players 
WHERE dream_team_percentage IS NOT NULL 
LIMIT 5;
```

## Integration with Strategies

The enhanced fields support all 8 strategies:

- **Strategy 1**: Uses form ratings and consistency scores for AI recommendations
- **Strategy 2**: Leverages captain potential and ownership projections
- **Strategy 3**: Utilizes predicted scores and match importance factors
- **Strategy 4**: Employs core/hedge classifications and risk factors
- **Strategy 5**: Incorporates ML optimization with advanced statistics
- **Strategy 6**: Uses preset scenario data and contextual performance
- **Strategy 7**: Leverages role-specific stats and versatility scores
- **Strategy 8**: Utilizes base team metrics and rule-based variations

## Best Practices

1. **Run Migration in Development First**
   - Test the migration on a development database
   - Verify all strategies work with enhanced data

2. **Backup Before Migration**
   - Create database backups before running migration
   - Document current schema state

3. **Monitor Performance**
   - Check query performance with new fields
   - Add indexes if needed for frequently queried columns

4. **Gradual Rollout**
   - Test individual strategies with enhanced data
   - Gradually enable new features across the platform

## Next Steps

After successful migration:

1. **Update Strategy Components**: Modify strategy wizards to use new analytics fields
2. **Enhance AI Services**: Update OpenAI/Gemini prompts to include new data points
3. **Improve UI**: Add enhanced analytics displays to team generation interfaces
4. **Monitor Usage**: Track which new fields provide the most value to users

The enhanced schema provides a solid foundation for advanced fantasy cricket analytics and more sophisticated team generation algorithms.
