# Strategy 5: Stats-Driven Guardrails - Testing Guide

## Test Scenarios

### 1. Basic Functionality Test
**URL:** `http://localhost:3000/match/[matchId]/teams?strategy=stats-driven`

**Expected Behavior:**
- Strategy5Wizard should load with filter configuration form
- Dream Team % slider should be present and marked as mandatory
- At least one additional filter (Selection %, Average Points, or Credits) must be configured
- Role composition sliders should be present for all 4 roles

### 2. Filter Validation Test
**Steps:**
1. Set Dream Team % to 30-70%
2. Leave all other filters at default values
3. Click "Save Guardrails"

**Expected:** Alert should appear: "Please set at least one additional filter besides Dream Team % to proceed."

### 3. Valid Configuration Test
**Steps:**
1. Set Dream Team % to 40-60%
2. Set Selection % to 20-50%
3. Set Average Points to 35-75
4. Click "Save Guardrails"

**Expected:** Should proceed to summary stage showing all configured filters

### 4. Team Generation Test
**Steps:**
1. Complete valid filter configuration
2. Set team count to 5
3. Click "Generate Teams"

**Expected:**
- API call to `/api/teams/generate` with strategy: 'stats-driven'
- Filters should be passed in userPreferences.filters
- Should generate 5 different teams meeting the criteria

### 5. Backend Logic Test
**API Payload:**
```json
{
  "matchId": 123,
  "strategy": "stats-driven",
  "teamCount": 5,
  "userPreferences": {
    "strategy": "stats-driven",
    "filters": {
      "dreamTeamPercentage": { "min": 40, "max": 60 },
      "selectionPercentage": { "min": 20, "max": 50 },
      "averagePoints": { "min": 35, "max": 75 },
      "playerRoles": {
        "batsmen": { "min": 3, "max": 5 },
        "bowlers": { "min": 3, "max": 5 },
        "allRounders": { "min": 2, "max": 4 },
        "wicketKeepers": { "min": 1, "max": 2 }
      }
    }
  }
}
```

**Expected Backend Behavior:**
1. `generateStatsGuardrailsTeam()` method should be called
2. Players should be filtered by `applyStatsFilters()`
3. Only players meeting ALL criteria should be considered
4. Teams should have at least 10% variation
5. Each team should have different captain/vice-captain combinations

### 6. Filter Logic Test
**Test Data:**
```javascript
// Mock player data
const players = [
  { id: 1, name: "Player1", dream_team_percentage: 45, selection_percentage: 25, points: 50 },
  { id: 2, name: "Player2", dream_team_percentage: 65, selection_percentage: 15, points: 40 },
  { id: 3, name: "Player3", dream_team_percentage: 35, selection_percentage: 35, points: 60 }
];

// Filter: dreamTeam 40-60%, selection 20-50%, points 35-75
// Expected: Only Player1 should pass (others fail different criteria)
```

### 7. Fallback Logic Test
**Steps:**
1. Set very restrictive filters (e.g., Dream Team % 90-100%)
2. Generate teams

**Expected:**
- Should attempt generation with original filters
- If no players match, should relax Dream Team % by ±10%
- If still no players, should use fallback team generation
- Should add insight: "Filters were slightly relaxed to ensure team generation"

### 8. Role Composition Test
**Steps:**
1. Set batsmen: 4-6, bowlers: 2-4, all-rounders: 2-3, wicket-keepers: 1-1
2. Generate multiple teams

**Expected:**
- Each team should respect the role constraints
- Different teams should have different role distributions within the ranges
- Team 1 might have 4 BAT, Team 2 might have 5 BAT, etc.

### 9. Team Variation Test - ENHANCED VERSION
**Steps:**
1. Generate 10 teams with same filters
2. Compare team compositions

**Expected:**
- **NO two teams should be identical** (this was the main issue - NOW FIXED!)
- **Aggressive Player Variation**: Each team uses different player selection strategies:
  - Team 1: Top performers only
  - Team 2: Skip top 2, then select  
  - Team 3: Middle performers
  - Team 4: Reverse order (worst to best)
  - Team 5: Completely randomized
- **Captain/Vice-Captain Rotation**: Each team uses different C/VC selection algorithms:
  - Team 1: Top performer as C, 2nd as VC
  - Team 2: 2nd as C, 3rd as VC  
  - Team 3: 3rd as C, 1st as VC
  - Team 4: 1st as C, 4th as VC
  - Team 5: 4th as C, 2nd as VC
  - Team 6: Seeded random selection
- **Role Count Variation**: Different teams use different role distribution strategies (7 strategies total)
- **Player Pool Utilization**: Teams should utilize broader player pool with aggressive shuffling

**Specific Validation:**
- Team 1: Top players with minimum role counts
- Team 2: Mid-tier players with maximum role counts
- Team 3: Middle performers with varied role counts
- Team 4: Reverse selection with different captains
- Team 5: Randomized selection with unique C/VC
- **At least 3-4 players should be different in each team**
- **Captain/Vice-Captain should NEVER repeat the same combination**
- **Each team should show different selection strategy in logs**

**Specific Validation:**
- Team 1: Virat Kohli (C), Rohit Sharma (VC), + 9 others
- Team 2: Shubman Gill (C), KL Rahul (VC), + 9 others (6-7 common players, 3-4 different)
- Team 3: Rohit Sharma (C), Virat Kohli (VC), + 9 others (6-7 common players, 3-4 different)
- At least 2-3 players should be different in each team
- Captain/Vice-Captain should never repeat the same combination

### 10. UI/UX Test
**Filters Stage:**
- All sliders should be responsive
- Real-time preview should update as filters change
- Validation messages should be clear

**Summary Stage:**
- Should display all configured filters
- Should show meaningful summary text
- Should allow going back to modify filters

### 11. Team Diversity Algorithm Test
**Purpose:** Test the new core-variable player selection algorithm

**Steps:**
1. Set filters: Dream Team % 40-60%, Selection % 20-50%
2. Generate 5 teams
3. Analyze team compositions

**Expected Algorithm Behavior:**
- **Core Players (60-70%)**: 6-7 players should be consistent across most teams
- **Variable Players (30-40%)**: 3-4 players should change between teams
- **Captain Pool**: Should rotate through top 6 performing players
- **Role Distribution**: Should use different algorithms:
  - Team 1: Linear progression (e.g., 3 BAT, 3 BWL, 2 AR, 1 WK)
  - Team 2: Reverse progression (e.g., 5 BAT, 5 BWL, 4 AR, 2 WK)
  - Team 3: Random-like progression (e.g., 4 BAT, 4 BWL, 3 AR, 1 WK)

**Validation Commands:**
```javascript
// Compare team overlaps
const team1Players = teams[0].players.map(p => p.id);
const team2Players = teams[1].players.map(p => p.id);
const overlap = team1Players.filter(id => team2Players.includes(id));
console.log(`Team overlap: ${overlap.length}/11 players`); // Should be 6-8 players

// Check C/VC uniqueness
const cvCombos = teams.map(t => `${t.captain.id}-${t.viceCaptain.id}`);
const uniqueCombos = new Set(cvCombos);
console.log(`Unique C/VC combinations: ${uniqueCombos.size}/${teams.length}`); // Should be equal
```

### 12. Player Pool Utilization Test
**Purpose:** Ensure broader player pool is used, not just top 11 players

**Steps:**
1. Set broad filters to include many players
2. Generate 15 teams
3. Track all unique players used

**Expected:**
- Should use 25-35 unique players across all teams (not just 11)
- Top performers should appear in 60-80% of teams
- Mid-tier players should appear in 20-40% of teams
- Differential players should appear in 5-20% of teams

**Validation:**
```javascript
// Track player usage across teams
const playerUsage = {};
teams.forEach(team => {
  team.players.forEach(player => {
    playerUsage[player.id] = (playerUsage[player.id] || 0) + 1;
  });
});

const totalUniquePlayers = Object.keys(playerUsage).length;
console.log(`Total unique players used: ${totalUniquePlayers}`); // Should be 25-35

const usageFrequency = Object.values(playerUsage).sort((a, b) => b - a);
console.log(`Player usage distribution:`, usageFrequency); // Should show variety
```

### 13. Advanced Statistical Filters Test - NEW
**Purpose:** Test the enhanced statistical filters with ML predictions

**Steps:**
1. Configure advanced filters in the EnhancedStrategy5Wizard:
   - Recent Form: 60-90%
   - Consistency Score: 50-80%
   - Venue Performance: 40-70%
   - ML Predicted Points: 35-65
   - ML Confidence Score: 60-90%
   - Injury Risk: 6-10 (low risk)
2. Generate 5 teams

**Expected:**
- Only players meeting ALL advanced criteria should be selected
- Teams should show higher quality metrics than basic filters
- Console logs should show: "🔍 Applying enhanced statistical filters"
- Should fallback to traditional approach if not enough players

**Validation:**
```javascript
// Check if advanced filters are properly applied
const teamPlayers = teams[0].players;
teamPlayers.forEach(player => {
  const mlScore = mlScores.find(s => s.playerId === player.id);
  console.log(`${player.name}: Form=${mlScore.recentForm}, Consistency=${mlScore.consistencyScore}`);
});
```

### 14. ML Optimization Test - NEW
**Purpose:** Test machine learning-based team optimization

**Steps:**
1. Set broad filters to ensure 15+ players pass filtering
2. Enable ML optimization in wizard
3. Select risk profile: 'aggressive'
4. Generate 3 teams

**Expected:**
- Console logs should show: "🤖 Using ML optimization for team generation"
- Teams should be optimized using genetic algorithm
- Should see progress logs: "🧬 Generation X: Best fitness = Y"
- Final teams should have high expected points and appropriate risk scores

**ML Optimization Features:**
- **Ensemble ML Scoring**: Multiple algorithms for player scoring
- **Genetic Algorithm**: 50 generations, 100 population size
- **Multi-objective Fitness**: Expected points, risk, diversity, confidence
- **Tournament Selection**: Best parents for breeding
- **Crossover & Mutation**: Team variation and evolution

**Validation:**
```javascript
// Check ML optimization results
console.log('ML Optimization Results:');
teams.forEach((team, index) => {
  console.log(`Team ${index + 1}:`);
  console.log(`  Expected Points: ${team.expectedPoints}`);
  console.log(`  Risk Score: ${team.riskScore}`);
  console.log(`  Diversity Score: ${team.diversityScore}`);
  console.log(`  Confidence: ${team.confidenceScore}`);
  console.log(`  Reasoning: ${team.reasoning.join(', ')}`);
});
```

### 15. Risk Profile Optimization Test - NEW
**Purpose:** Test different risk profile optimizations

**Steps:**
1. Generate 3 teams with 'conservative' risk profile
2. Generate 3 teams with 'aggressive' risk profile
3. Generate 3 teams with 'balanced' risk profile
4. Compare results

**Expected:**
- **Conservative**: Lower volatility players, higher consistency scores
- **Aggressive**: Higher volatility players, potential for higher points
- **Balanced**: Mix of stable and risky players

**Risk Profile Characteristics:**
- **Conservative**: Max volatility 0.3, min consistency 0.7
- **Balanced**: Max volatility 0.5, min consistency 0.5
- **Aggressive**: Max volatility 0.8, min consistency 0.3

### 16. Genetic Algorithm Performance Test - NEW
**Purpose:** Test genetic algorithm convergence and optimization

**Steps:**
1. Enable detailed logging for genetic algorithm
2. Set generations to 100, population size to 100
3. Generate 1 team and monitor progress

**Expected:**
- Should see fitness improvement over generations
- Final fitness should be significantly higher than initial
- Should converge to optimal solution within 100 generations
- No invalid teams should be generated

**Convergence Validation:**
```javascript
// Monitor genetic algorithm progress
const generationLogs = [];
```

### 17. Multi-Objective Optimization Test - NEW
**Purpose:** Test balanced optimization across multiple objectives

**Steps:**
1. Configure filters to pass 20+ players
2. Enable ML optimization
3. Generate 5 teams with different objectives:
   - Team 1: Maximize expected points
   - Team 2: Minimize risk
   - Team 3: Maximize diversity
   - Team 4: Maximize confidence
   - Team 5: Balanced approach

**Expected:**
- Each team should excel in its target objective
- Teams should show different compositions based on objectives
- Should maintain Dream11 compliance across all objectives

**Multi-Objective Weights:**
- Expected Points: 40%
- Risk Management: 20%
- Diversity: 15%
- Confidence: 15%
- Budget Efficiency: 10%

### 18. Enhanced Filter Fallback Test - NEW
**Purpose:** Test fallback behavior when advanced filters are too restrictive

**Steps:**
1. Set very restrictive advanced filters:
   - Recent Form: 95-100%
   - Consistency Score: 90-100%
   - ML Predicted Points: 80-100
   - ML Confidence Score: 95-100%
2. Generate teams

**Expected:**
- Should attempt advanced filtering first
- If no players pass, should log: "No players match the enhanced statistical filters"
- Should fallback to traditional stats-driven approach
- Should still generate valid teams

### 19. Player Pool Diversification Test - NEW
**Purpose:** Test that ML optimization uses broader player pool

**Steps:**
1. Set moderate filters to pass 25+ players
2. Enable ML optimization
3. Generate 10 teams
4. Analyze player usage distribution

**Expected:**
- Should use 30-40 unique players across all teams
- Top ML-scored players should appear in 70-90% of teams
- Mid-tier players should appear in 30-60% of teams
- Differential picks should appear in 10-30% of teams

**Player Pool Analysis:**
```javascript
// Analyze player usage patterns
const playerUsageByMLScore = {};
teams.forEach(team => {
  team.players.forEach(player => {
    const mlScore = mlScores.find(s => s.playerId === player.id);
    const tier = mlScore.predictedPoints > 60 ? 'top' : 
                 mlScore.predictedPoints > 40 ? 'mid' : 'differential';
    playerUsageByMLScore[tier] = (playerUsageByMLScore[tier] || 0) + 1;
  });
});
```

### 20. Advanced Captain Selection Test - NEW
**Purpose:** Test ML-based captain and vice-captain selection

**Steps:**
1. Enable ML optimization
2. Generate 10 teams
3. Analyze captain selection patterns

**Expected:**
- Captains should be selected based on ML metrics:
  - High captaincy potential score
  - High predicted points
  - Appropriate risk level for profile
- Should use different captain selection strategies:
  - High ownership: Top performers
  - Medium ownership: Consistency-based
  - Low ownership: Differential picks

**Captain Selection Strategies:**
- **High Ownership (60%+)**: Top ML predicted points
- **Medium Ownership (30-60%)**: Consistency + confidence
- **Low Ownership (<30%)**: Upset potential + captain potential

**Validation:**
```javascript
// Check captain selection logic
teams.forEach((team, index) => {
  const captain = team.captain;
  const mlScore = mlScores.find(s => s.playerId === captain.id);
  console.log(`Team ${index + 1} Captain: ${captain.name}`);
  console.log(`  ML Score: ${mlScore.predictedPoints}`);
  console.log(`  Captain Potential: ${mlScore.captainPotential}`);
  console.log(`  Ownership: ${mlScore.ownershipProjection}%`);
});
```

## API Testing - Enhanced Version

### Basic Stats-Driven API Test
```bash
curl -X POST http://localhost:3000/api/teams/generate \
  -H "Content-Type: application/json" \
  -d '{
    "matchId": 123,
    "strategy": "stats-driven",
    "teamCount": 3,
    "userPreferences": {
      "strategy": "stats-driven",
      "filters": {
        "dreamTeamPercentage": { "min": 40, "max": 60 },
        "selectionPercentage": { "min": 20, "max": 50 },
        "averagePoints": { "min": 35, "max": 75 },
        "playerRoles": {
          "batsmen": { "min": 3, "max": 5 },
          "bowlers": { "min": 3, "max": 5 },
          "allRounders": { "min": 2, "max": 4 },
          "wicketKeepers": { "min": 1, "max": 2 }
        }
      }
    }
  }'
```

### Advanced ML-Optimized API Test - NEW
```bash
curl -X POST http://localhost:3000/api/teams/generate \
  -H "Content-Type: application/json" \
  -d '{
    "matchId": 123,
    "strategy": "stats-driven",
    "teamCount": 5,
    "userPreferences": {
      "strategy": "stats-driven",
      "riskProfile": "aggressive",
      "filters": {
        "dreamTeamPercentage": { "min": 30, "max": 70 },
        "selectionPercentage": { "min": 15, "max": 60 },
        "averagePoints": { "min": 25, "max": 80 },
        "recentForm": { "min": 60, "max": 95 },
        "consistencyScore": { "min": 40, "max": 85 },
        "versatilityScore": { "min": 35, "max": 90 },
        "injuryRisk": { "min": 5, "max": 10 },
        "venuePerformance": { "min": 30, "max": 80 },
        "mlPredictedPoints": { "min": 30, "max": 70 },
        "mlConfidenceScore": { "min": 50, "max": 90 },
        "captainPotential": { "min": 40, "max": 85 },
        "ownershipProjection": { "min": 10, "max": 60 },
        "priceEfficiency": { "min": 3, "max": 8 },
        "playerRoles": {
          "batsmen": { "min": 3, "max": 5 },
          "bowlers": { "min": 3, "max": 5 },
          "allRounders": { "min": 2, "max": 4 },
          "wicketKeepers": { "min": 1, "max": 2 }
        }
      }
    }
  }'
```

### Conservative Risk Profile API Test - NEW
```bash
curl -X POST http://localhost:3000/api/teams/generate \
  -H "Content-Type: application/json" \
  -d '{
    "matchId": 123,
    "strategy": "stats-driven",
    "teamCount": 3,
    "userPreferences": {
      "strategy": "stats-driven",
      "riskProfile": "conservative",
      "filters": {
        "dreamTeamPercentage": { "min": 50, "max": 80 },
        "consistencyScore": { "min": 70, "max": 95 },
        "injuryRisk": { "min": 7, "max": 10 },
        "mlConfidenceScore": { "min": 75, "max": 95 },
        "performanceVolatility": { "min": 0, "max": 30 },
        "playerRoles": {
          "batsmen": { "min": 4, "max": 5 },
          "bowlers": { "min": 3, "max": 4 },
          "allRounders": { "min": 2, "max": 3 },
          "wicketKeepers": { "min": 1, "max": 2 }
        }
      }
    }
  }'
```

### Expected Response - Enhanced Version
```json
{
  "success": true,
  "teams": [
    {
      "players": [...],
      "captain": {
        "id": 1,
        "name": "Virat Kohli",
        "player_role": "BAT",
        "credits": 11.5,
        "points": 85,
        "dream_team_percentage": 75,
        "mlScore": {
          "predictedPoints": 58.5,
          "confidence": 0.85,
          "captainPotential": 0.92,
          "recentForm": 0.88
        }
      },
      "viceCaptain": {
        "id": 2,
        "name": "Rohit Sharma",
        "player_role": "BAT",
        "credits": 11.0,
        "points": 78,
        "dream_team_percentage": 68,
        "mlScore": {
          "predictedPoints": 52.3,
          "confidence": 0.82,
          "captainPotential": 0.87,
          "recentForm": 0.85
        }
      },
      "totalCredits": 98.5,
      "roleBalance": { "batsmen": 4, "bowlers": 3, "allRounders": 3, "wicketKeepers": 1 },
      "expectedPoints": 485.7,
      "riskScore": 0.45,
      "diversityScore": 0.72,
      "confidenceScore": 0.81,
      "insights": [
        "Optimized using genetic-algorithm approach",
        "Expected Points: 485.7",
        "Risk Score: 45.0%",
        "Diversity Score: 72.0%",
        "Confidence: 81.0%",
        "Top picks: Virat Kohli, Rohit Sharma, Jasprit Bumrah",
        "ML optimization completed in 100 generations",
        "Selected from 28 players meeting advanced criteria",
        "Team composition: 1 WK, 4 BAT, 3 AR, 3 BWL"
      ],
      "reasoning": "ML-optimized stats-driven team using genetic algorithm with aggressive risk profile",
      "mlOptimizationDetails": {
        "method": "genetic-algorithm",
        "generations": 100,
        "populationSize": 100,
        "finalFitness": 0.847,
        "convergenceGeneration": 73,
        "playersEvaluated": 28,
        "filtersPassed": 25,
        "optimizationTime": 1.2
      }
    }
  ]
}
```

## Debug Console Logs - Enhanced Version

Look for these log messages during testing:

### Basic Stats-Driven Logs
```
✅ Success: "🔍 Generating 5 teams for match 123 with strategy stats-driven"
✅ Success: "Stats-driven team generation with X players meeting criteria"
⚠️ Warning: "No players match the statistical filters, relaxing filters and trying again"
⚠️ Warning: "Filters were slightly relaxed to ensure team generation"
❌ Error: "Even relaxed filters produced no results, using fallback"
```

### Advanced ML Optimization Logs - NEW
```
✅ Success: "🔍 Applying enhanced statistical filters to 45 players"
✅ Success: "✅ Enhanced filtering: 28 players passed all filters"
✅ Success: "🤖 Using ML optimization for team generation"
✅ Success: "🧬 Starting genetic algorithm optimization (100 generations, 100 population)"
✅ Progress: "🧬 Generation 0: Best fitness = 0.652"
✅ Progress: "🧬 Generation 10: Best fitness = 0.721"
✅ Progress: "🧬 Generation 20: Best fitness = 0.789"
✅ Progress: "🧬 Generation 30: Best fitness = 0.834"
✅ Progress: "🧬 Generation 40: Best fitness = 0.841"
✅ Progress: "🧬 Generation 50: Best fitness = 0.847"
✅ Success: "🏆 Genetic algorithm completed. Best fitness: 0.85"
✅ Success: "👑 ML Captain Selection: Virat Kohli (ownership: 65%, strategy: high-ownership)"
✅ Success: "🎯 ML Vice-Captain Selection: Rohit Sharma (strategy: consistency-based)"
```

### Risk Profile Logs - NEW
```
✅ Success: "🛡️ Conservative risk profile: Selecting low-volatility players"
✅ Success: "⚡ Aggressive risk profile: Selecting high-upside players"
✅ Success: "⚖️ Balanced risk profile: Mixing stable and risky players"
```

### Fallback Logs - NEW
```
⚠️ Warning: "No players match the enhanced statistical filters, using relaxed filtering"
⚠️ Warning: "📊 Using traditional stats-driven approach"
⚠️ Warning: "Insufficient players for ML optimization, using traditional approach"
```

### Performance Logs - NEW
```
✅ Performance: "🤖 ML: Generating scores for 45 players"
✅ Performance: "🧬 Genetic algorithm optimization completed in 1.2 seconds"
✅ Performance: "📊 Traditional approach completed in 0.3 seconds"
```

### Validation Logs - NEW
```
✅ Validation: "🔍 Validating team composition: 1 WK, 4 BAT, 3 AR, 3 BWL"
✅ Validation: "💰 Budget check: 98.5/100 credits used"
✅ Validation: "🏏 Team distribution: 7 Team A, 4 Team B"
✅ Validation: "✅ All Dream11 constraints satisfied"
```

## Performance Testing - Enhanced Version

### Basic Performance Expectations
- Filter validation: < 100ms
- Traditional team generation (5 teams): < 2 seconds
- API response: < 3 seconds total

### ML Optimization Performance - NEW
- Enhanced filter processing: < 200ms
- ML player scoring (50 players): < 500ms
- Genetic algorithm optimization (100 generations): < 5 seconds
- Complete ML-optimized API response: < 8 seconds total

### Performance Benchmarks by Team Count
- **1 team**: 
  - Traditional: < 0.5 seconds
  - ML-optimized: < 2 seconds
- **5 teams**:
  - Traditional: < 2 seconds
  - ML-optimized: < 6 seconds
- **10 teams**:
  - Traditional: < 4 seconds
  - ML-optimized: < 12 seconds

### Memory Usage Expectations
- Traditional approach: < 50MB
- ML optimization: < 150MB
- Genetic algorithm: < 200MB peak
- No memory leaks during multiple generations

### Optimization Targets
- **Conservative Profile**: Prioritize consistency over speed
- **Balanced Profile**: Balance between performance and optimization
- **Aggressive Profile**: Maximum optimization, acceptable longer processing

### Performance Monitoring
```javascript
// Monitor performance metrics
const startTime = performance.now();
// ... team generation ...
const endTime = performance.now();
console.log(`Team generation took ${endTime - startTime} milliseconds`);

// Memory usage (if available)
if (performance.memory) {
  console.log(`Memory used: ${performance.memory.usedJSHeapSize / 1024 / 1024} MB`);
}
```

## Compliance Checklist - Enhanced Version

### Basic Compliance
- ✅ Dream Team % is mandatory
- ✅ At least one additional filter required
- ✅ Strict adherence to user-defined criteria
- ✅ 10%+ team variation
- ✅ Captain/vice-captain rotation
- ✅ Dream11 rules compliance
- ✅ Graceful error handling
- ✅ Meaningful user feedback

### Advanced Statistical Filters Compliance - NEW
- ✅ Recent form filtering (0-100%)
- ✅ Consistency score validation (0-100%)
- ✅ Versatility score assessment (0-100%)
- ✅ Injury risk evaluation (1-10 scale)
- ✅ Venue performance analysis (0-100%)
- ✅ Pitch suitability matching (0-100%)
- ✅ Weather adaptability scoring (0-100%)
- ✅ Opposition strength consideration (0-100%)
- ✅ Head-to-head record analysis (0-100%)
- ✅ Captain potential evaluation (0-100%)
- ✅ Ownership projection accuracy (0-100%)
- ✅ Price efficiency calculation (points/credit)
- ✅ Upset potential assessment (0-100%)

### ML Optimization Compliance - NEW
- ✅ ML predicted points accuracy (±15% tolerance)
- ✅ ML confidence score reliability (0-100%)
- ✅ Performance volatility estimation (0-100%)
- ✅ Ensemble prediction consistency
- ✅ Genetic algorithm convergence
- ✅ Multi-objective optimization balance
- ✅ Risk profile adherence
- ✅ Tournament selection effectiveness
- ✅ Crossover operation validity
- ✅ Mutation operation control
- ✅ Population diversity maintenance
- ✅ Fitness function optimization

### Risk Profile Compliance - NEW
- ✅ Conservative: Max volatility 30%, min consistency 70%
- ✅ Balanced: Max volatility 50%, min consistency 50%
- ✅ Aggressive: Max volatility 80%, min consistency 30%
- ✅ Risk-appropriate captain selection
- ✅ Portfolio diversification
- ✅ Expected return optimization

### Performance Compliance - NEW
- ✅ Response time within acceptable limits
- ✅ Memory usage optimization
- ✅ Scalability for multiple teams
- ✅ Graceful degradation under load
- ✅ Error handling robustness
- ✅ Logging and monitoring coverage

## Browser Testing

Test in multiple browsers:
- Chrome/Edge (Chromium)
- Firefox
- Safari (if available)

All functionality should work consistently across browsers.
