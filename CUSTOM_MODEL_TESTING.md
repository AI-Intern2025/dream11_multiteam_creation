# Testing Your Custom Dream11 MultiTeam Creator Model

## 🎯 Quick Setup Instructions

### 1. Get Your Model ID
1. Go to **Google AI Studio**: https://aistudio.google.com/
2. Find your **"Dream11 MultiTeam Creator"** model
3. Copy the model ID (format: `tunedModels/dream11-multiteam-creator-xxxxx`)

### 2. Update Environment Variables
Add to your `.env.local` file:
```bash
GEMINI_CUSTOM_MODEL_ID=tunedModels/your-actual-model-id-here
AI_PROVIDER=gemini
```

### 3. Test the Integration

**Start the application:**
```bash
npm run dev
```

**Expected console messages when configured correctly:**
```
🎯 Custom Dream11 Model Active: Dream11 MultiTeam Creator
🤖 Using GEMINI for analysis (both APIs available)
```

## 🧪 Testing Scenarios

### Test 1: Strategy 1 (AI-Guided Conversation)
1. Go to any match
2. Select "Strategy 1: AI-Guided Conversation"
3. Answer the simplified questions:
   - Match outcome prediction
   - Key players to focus on
   - Risk appetite
4. Watch console for:
   ```
   🎯 Using Custom Dream11 MultiTeam Creator model for strategy: ai-guided
   📄 Parsing Markdown response from custom Dream11 model...
   ✅ Successfully parsed X teams from custom model
   ```

### Test 2: Strategy 4 (Core-Hedge Selection)
1. Go to any match
2. Select "Strategy 4: Core-Hedge Selection"
3. Select core, hedge, and differential players
4. Your model will receive JSON like:
   ```json
   {
     "strategy_id": "CORE_HEDGE",
     "strategy_details": {
       "num_teams": 5,
       "player_groups": {
         "core": ["Player 1", "Player 2"],
         "hedge": ["Player 3", "Player 4"], 
         "differential": ["Player 5"]
       }
     },
     "player_pool": [...]
   }
   ```

### Test 3: Strategy 7 (Role-Split Lineups)
1. Go to any match
2. Select "Strategy 7: Role-Split Lineups"
3. Configure role distribution
4. Your model will receive:
   ```json
   {
     "strategy_id": "ROLE_SPLIT",
     "strategy_details": {
       "num_teams": 5,
       "role_counts": {
         "BAT": 4,
         "BOWL": 4,
         "AR": 2,
         "WK": 1
       }
     },
     "player_pool": [...]
   }
   ```

## 📊 Expected Model Behavior

### Input Format
Your model receives a single JSON string with:
- `strategy_id`: One of AI_CONVERSATIONAL, CORE_HEDGE, SAME_XI_DIFF_C_VC, ROLE_SPLIT
- `strategy_details`: Strategy-specific configuration
- `player_pool`: Array of all available players with name, role, team, credits

### Output Format
Your model should return Markdown with:
1. **Master Player Roster**: Table showing player inclusion across teams
2. **Individual Team Breakdowns**: Each team with reasoning and 11-player table

### Parsing Logic
The integration automatically:
- Splits Markdown by headers (## Team 1, ## Team 2, etc.)
- Parses player tables from each team section
- Identifies captains/vice-captains (marked with (C)/(VC) or in columns)
- Calculates total credits and expected points
- Converts to internal team format

## 🔧 Troubleshooting

### Issue: "Using default Gemini Pro model"
**Solution**: Check your `GEMINI_CUSTOM_MODEL_ID` in `.env.local`

### Issue: "Custom model generation failed"
**Possible Causes:**
1. Invalid model ID
2. Model not accessible/published
3. API quota exceeded
4. Model expects different input format

**Check Console For:**
- Raw JSON request being sent
- Raw Markdown response received
- Parsing error details

### Issue: "No teams found in custom model response"
**Solution**: 
1. Check if your model returns proper Markdown format
2. Verify team headers (## Team 1, ## Team 2, etc.)
3. Ensure player tables have proper pipe separation

### Issue: Teams generated but missing players
**Solution:**
1. Check Markdown table format in model response
2. Verify player names match exactly
3. Ensure tables have minimum 3 columns (Name, Role, Team)

## 🎯 Model Training Tips

If you need to retrain your model:

### Successful Request Examples
Include these JSON formats in your training data:

**AI Conversational:**
```json
{
  "strategy_id": "AI_CONVERSATIONAL",
  "strategy_details": {
    "num_teams": 5,
    "match_storyline": "High-scoring match expected",
    "predicted_winner": "Team 1 likely to win",
    "key_players": ["Virat Kohli", "Jasprit Bumrah"],
    "risk_appetite": "balanced"
  },
  "player_pool": [...]
}
```

**Core Hedge:**
```json
{
  "strategy_id": "CORE_HEDGE", 
  "strategy_details": {
    "num_teams": 3,
    "player_groups": {
      "core": ["V. Kohli", "J. Bumrah"],
      "hedge": ["R. Sharma", "M. Starc"],
      "differential": ["S. Iyer"]
    }
  },
  "player_pool": [...]
}
```

### Expected Output Format
Train your model to return consistent Markdown:

```markdown
# Master Player Roster

| Player | Team 1 | Team 2 | Team 3 |
|--------|--------|--------|--------|
| V. Kohli | C | Yes | VC |
| J. Bumrah | Yes | C | Yes |

## Team 1

**Strategy**: Balanced approach with key players

| Player | Role | Team | Credits |
|--------|------|------|---------|
| V. Kohli (C) | BAT | IND | 10.0 |
| J. Bumrah | BOWL | IND | 9.5 |
...
```

## 🚀 Success Metrics

When properly configured, you should see:
- ✅ Custom model activated on startup
- ✅ JSON requests sent to your model
- ✅ Markdown responses parsed successfully  
- ✅ Teams displayed in the UI
- ✅ All 8 strategies working with your model

Your custom "Dream11 MultiTeam Creator" model is now fully integrated and ready for testing! 🎯🏏
