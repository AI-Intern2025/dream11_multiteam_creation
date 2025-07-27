# Custom Gemini Model Setup Guide

## 🎯 Dream11 MultiTeam Creator Custom Model Integration

### Overview
Your custom "Dream11 MultiTeam Creator" model requires specific data preparation and JSON request format. This guide shows how to integrate it properly.

### Step 1: Update Environment Variables

Add these lines to your `.env.local` file:

```bash
# Custom Gemini Model Configuration
GEMINI_CUSTOM_MODEL_NAME=Dream11 MultiTeam Creator

# Set Gemini as primary provider to use custom model
AI_PROVIDER=gemini
```

**That's it!** No model ID required - the system will use your custom model by name.

### Step 2: Automatic Model Detection

The system will automatically:
1. **Try your custom model first**: Uses "Dream11 MultiTeam Creator" by name
2. **Fallback gracefully**: If custom model fails, uses standard Gemini Pro
3. **Log everything**: Shows which model is being used in console

### Step 3: Model Requirements

Your custom model expects:

1. **Knowledge Base**: CSV files with player data uploaded to the model
2. **JSON Request**: Structured request with strategy_id and strategy_details
3. **Markdown Output**: Model returns formatted Markdown (not JSON)

### Step 3: Data Preparation

The model requires CSV files with these essential columns:
- Player Name
- Team (e.g., IND, AUS)  
- Role (BAT, BOWL, AR, WK)
- Credits (e.g., 9.0, 8.5)
- Selection %
- Recent form, historical stats, head-to-head records, venue performance

### Step 4: Strategy IDs Supported

Your model supports these strategies:
- `AI_CONVERSATIONAL`: Teams based on narrative/prediction
- `CORE_HEDGE`: Teams around essential "core" players  
- `SAME_XI_DIFF_C_VC`: Captain/Vice-captain variations
- `ROLE_SPLIT`: Specific team structure requirements

### Step 5: JSON Request Format

Example for CORE_HEDGE strategy:
```json
{
  "strategy_id": "CORE_HEDGE",
  "strategy_details": {
    "num_teams": 3,
    "player_groups": {
      "core": ["V. Kohli", "J. Bumrah", "P. Cummins"],
      "hedge": ["R. Sharma", "D. Warner", "M. Starc", "S. Gill", "A. Zampa"],
      "differential": ["S. Iyer", "M. Marsh"]
    }
  },
  "player_pool": [
    {"player_name": "V. Kohli", "role": "BAT", "team": "IND", "credits": 10.0},
    {"player_name": "R. Sharma", "role": "BAT", "team": "IND", "credits": 9.5}
  ]
}
```

### Step 6: Verification

When you start the application, you should see:
```
🎯 Initializing custom Gemini model: Dream11 MultiTeam Creator
✅ Successfully initialized custom model: Dream11 MultiTeam Creator
🤖 Using GEMINI for analysis (both APIs available)
```

If your custom model isn't found, you'll see:
```
⚠️  Failed to initialize custom Gemini model, falling back to gemini-pro
🤖 Using standard Gemini Pro model as fallback
```

### Step 7: Testing

1. **Start your application**: `npm run dev`
2. **Go to any match**: Select any cricket match
3. **Try any strategy**: All 8 strategies now automatically use your custom model
4. **Check console logs**: Look for custom model usage messages

### Expected Log Messages

```
🎯 Using Custom Dream11 MultiTeam Creator model for strategy: ai-guided
📄 Parsing Markdown response from custom Dream11 model...
✅ Successfully parsed 5 teams from custom model
```

### Troubleshooting

**If custom model fails:**
- The system will automatically fallback to standard logic
- Check console for error messages
- Verify your model ID is correct
- Ensure the model is properly trained and accessible

**Common Issues:**
1. **Model Not Found**: Ensure your custom model "Dream11 MultiTeam Creator" exists in your Gemini account
2. **Wrong Account**: Verify you're using the same API key that has access to the custom model
3. **Model Name**: Double-check the exact name matches "Dream11 MultiTeam Creator"
4. **API Quota**: Check your Gemini API usage limits

### Integration Features

✅ **Automatic Fallback**: If custom model fails, uses standard generation
✅ **All Strategies**: Custom model works with all 8 team generation strategies  
✅ **Smart JSON Requests**: Proper formatting for each strategy type
✅ **Markdown Parsing**: Intelligent parsing of custom model responses
✅ **Error Handling**: Robust error handling with detailed logging
✅ **Strategy Mapping**: Maps internal strategies to your model's expected format

### Data Requirements

Your model needs access to CSV files with player data including:
- Player Name, Team, Role, Credits
- Selection %, Recent form, Historical stats
- Head-to-head records, Venue performance

### Strategy Mappings

| Internal Strategy | Model Strategy ID | Description |
|------------------|-------------------|-------------|
| ai-guided | AI_CONVERSATIONAL | Teams based on narrative/prediction |
| core-hedge | CORE_HEDGE | Teams around essential "core" players |
| same-xi | SAME_XI_DIFF_C_VC | Captain/Vice-captain variations |
| role-split | ROLE_SPLIT | Specific team structure requirements |

### Next Steps

After setting up the custom model:
1. Test with different strategies (Strategy 1-8)
2. Monitor performance and accuracy  
3. Check detailed testing guide: `CUSTOM_MODEL_TESTING.md`
4. Scale to higher team counts (up to 100 teams)

Your custom "Dream11 MultiTeam Creator" model is now fully integrated! 🚀

## 📚 Additional Resources

- **Testing Guide**: See `CUSTOM_MODEL_TESTING.md` for detailed testing scenarios
- **Google AI Studio**: https://aistudio.google.com/ (Get your model ID)
- **Model Documentation**: Refer to your custom model's training documentation

### Troubleshooting

**If custom model fails:**
- The system will automatically fallback to standard logic
- Check console for error messages
- Verify your model ID is correct
- Ensure the model is properly trained and accessible

**Common Issues:**
1. **Invalid Model ID**: Double-check the model ID from Google AI Studio
2. **Model Not Found**: Ensure the model is published and accessible
3. **API Quota**: Check your Gemini API usage limits

### Integration Features

✅ **Automatic Fallback**: If custom model fails, uses standard generation
✅ **All Strategies**: Custom model works with all 8 team generation strategies  
✅ **Smart Prompting**: Specialized prompts for Dream11 team generation
✅ **Response Parsing**: Intelligent parsing of custom model responses
✅ **Error Handling**: Robust error handling with detailed logging

### Next Steps

After setting up the custom model:
1. Test with different strategies (Strategy 1-8)
2. Monitor performance and accuracy
3. Fine-tune prompts if needed
4. Scale to higher team counts (up to 100 teams)

Your custom "Dream11 MultiTeam Creator" model is now fully integrated! 🚀
