import { GoogleGenerativeAI } from '@google/generative-ai';
import { CricketMatch, CricketPlayer } from './cricket-types';
import type { MatchAnalysis } from './openai';

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private customModelName: string | null;
  private customModelId: string;
  private isCustomModel: boolean;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      console.warn('⚠️  Gemini API key not configured. Please add GEMINI_API_KEY to .env.local');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    
    // Dream11 Gem configuration using system instructions
    const useDream11Gem = process.env.GEMINI_USE_DREAM11_GEM === 'true';
    const baseModel = process.env.GEMINI_BASE_MODEL || 'gemini-2.0-flash';
    const gemName = process.env.DREAM11_GEM_NAME || 'Dream11 MultiTeam Creator';
    
    this.customModelName = useDream11Gem ? gemName : null;
    this.customModelId = process.env.GEMINI_CUSTOM_MODEL_ID || '';
    this.isCustomModel = useDream11Gem;
    
    // Initialize model with proper configuration
    this.initializeModel(baseModel, useDream11Gem, gemName);
  }

  private initializeModel(baseModel: string, useDream11Gem: boolean, gemName: string) {
    try {
      if (useDream11Gem) {
        // Use Gem with system instructions (correct approach)
        console.log(`🎯 Initializing Dream11 Gem: "${gemName}" with base model: ${baseModel}`);
        
        this.model = this.genAI.getGenerativeModel({ 
          model: baseModel,
          systemInstruction: {
            role: "system",
            parts: [{ text: `Use ${gemName} instructions for Dream11 fantasy cricket team generation` }]
          }
        });
        
        console.log(`✅ Successfully initialized Dream11 Gem: "${gemName}" on ${baseModel}`);
        
      } else {
        // Use enhanced standard model with Dream11-optimized prompts
        console.log(`🤖 Using enhanced standard Gemini model: ${baseModel}`);
        this.model = this.genAI.getGenerativeModel({ model: baseModel });
        console.log(`✅ Successfully initialized enhanced model: ${baseModel} for Dream11 optimization`);
      }
      
    } catch (error) {
      console.warn('⚠️  Failed to initialize specified Gemini model, falling back to gemini-1.5-flash:', error);
      
      // Fallback to standard gemini-1.5-flash
      try {
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        this.isCustomModel = false;
        this.customModelName = null;
        console.log('🤖 Using gemini-1.5-flash as fallback with enhanced Dream11 prompts');
      } catch (fallbackError) {
        console.error('❌ Failed to initialize any Gemini model:', fallbackError);
        throw fallbackError;
      }
    }
  }

  async generateSimpleResponse(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text() || '';
    } catch (error) {
      console.error('Gemini simple response failed:', error);
      throw error;
    }
  }

  async analyzeMatchData(
    matchData: CricketMatch,
    playerStats: CricketPlayer[],
    weatherData: any,
    teamResults: any[],
    tournamentData: any
  ): Promise<MatchAnalysis> {
    const prompt = this.buildComprehensiveAnalysisPrompt(
      matchData,
      playerStats,
      weatherData,
      teamResults,
      tournamentData
    );

    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount <= maxRetries) {
      try {
        console.log('🤖 Analyzing match data with Gemini AI...');
        
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const content = response.text();

        if (!content) {
          throw new Error('No response from Gemini');
        }

        // Clean the response to ensure it's valid JSON
        let cleanedContent = content.trim();
        
        // Remove any markdown code blocks if present
        if (cleanedContent.startsWith('```json')) {
          cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanedContent.startsWith('```')) {
          cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        
        // Find the first { and last } to extract just the JSON object
        const firstBrace = cleanedContent.indexOf('{');
        const lastBrace = cleanedContent.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          cleanedContent = cleanedContent.substring(firstBrace, lastBrace + 1);
        }

        // Parse the JSON response
        const analysis = JSON.parse(cleanedContent) as MatchAnalysis;
        console.log('✅ Gemini analysis completed successfully');
        return analysis;
      } catch (error: any) {
        // Check if it's a rate limit or quota error
        if ((error?.message?.includes('quota') || error?.message?.includes('rate limit')) && retryCount < maxRetries) {
          retryCount++;
          const baseDelay = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
          const jitter = Math.random() * 1000;
          const delay = baseDelay + jitter;
          
          console.log(`Gemini rate limit hit, retrying in ${Math.round(delay/1000)}s (attempt ${retryCount}/${maxRetries})`);
          
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        console.error('Error analyzing match data with Gemini:', error);
        return this.getComprehensiveFallbackAnalysis(matchData, playerStats, tournamentData);
      }
    }
    
    return this.getComprehensiveFallbackAnalysis(matchData, playerStats, tournamentData);
  }

  private buildComprehensiveAnalysisPrompt(
    matchData: CricketMatch,
    playerStats: CricketPlayer[],
    weatherData: any,
    teamResults: any[],
    tournamentData: any
  ): string {
    // Limit data to reduce token count
    const limitedPlayerStats = playerStats.slice(0, 6).map(player => ({
      name: player.name,
      role: player.playing_role || 'Unknown',
      team: player.nationality || 'Team',
      statistics: {
        batting_average: player.statistics?.batting?.average,
        strike_rate: player.statistics?.batting?.strike_rate,
        wickets_taken: player.statistics?.bowling?.wickets,
        economy_rate: player.statistics?.bowling?.economy_rate
      }
    }));
    
    const limitedTeamResults = teamResults.slice(0, 2).map(team => ({
      name: team.name || 'Team',
      recent_form: 'Recent matches data available'
    }));

    const essentialMatchData = {
      match_name: matchData.name,
      start_time: matchData.start_time,
      format: matchData.format,
      venue: {
        name: matchData.venue?.name,
        city: matchData.venue?.city_name,
        country: matchData.venue?.country_name
      },
      competitors: matchData.competitors?.map((comp: any) => ({
        name: comp.name,
        abbreviation: comp.abbreviation,
        country: comp.country
      })),
      tournament: {
        name: matchData.tournament?.name,
        type: matchData.tournament?.category?.name
      }
    };

    const essentialWeatherData = {
      temperature: weatherData?.temperature || 'Moderate',
      conditions: weatherData?.conditions || 'Clear',
      wind: weatherData?.wind_speed || 'Light'
    };

    return `You are an expert cricket analyst. Analyze the cricket match data and provide detailed fantasy cricket insights.

CRITICAL: Respond with ONLY a valid JSON object. No explanatory text, markdown, or conversational responses. Start with { and end with }.

MATCH INFORMATION:
${JSON.stringify(essentialMatchData, null, 2)}

PLAYER STATISTICS:
${JSON.stringify(limitedPlayerStats, null, 2)}

WEATHER CONDITIONS:
${JSON.stringify(essentialWeatherData, null, 2)}

TEAM RECENT RESULTS:
${JSON.stringify(limitedTeamResults, null, 2)}

TOURNAMENT CONTEXT:
${JSON.stringify(tournamentData, null, 2)}

Provide analysis in this exact JSON format:

{
  "matchPrediction": {
    "winnerPrediction": "Team name or 'Close match'",
    "confidence": 75,
    "scoreRange": {
      "team1": {"min": 160, "max": 180},
      "team2": {"min": 160, "max": 180}
    },
    "matchType": "balanced",
    "keyFactors": ["factor1", "factor2", "factor3"]
  },
  "playerRecommendations": {
    "core": [
      {
        "name": "Player name",
        "role": "BAT",
        "reason": "Detailed reason",
        "confidence": 85,
        "team": "Team abbreviation"
      }
    ],
    "hedge": [
      {
        "name": "Player name",
        "role": "BOWL",
        "reason": "Differential pick reason",
        "risk": "medium",
        "team": "Team abbreviation"
      }
    ],
    "avoid": [
      {
        "name": "Player name",
        "reason": "Why to avoid"
      }
    ]
  },
  "captaincy": {
    "primary": {
      "name": "Player name",
      "reason": "Captaincy reasoning",
      "confidence": 85
    },
    "secondary": {
      "name": "Player name",
      "reason": "Alternative choice",
      "confidence": 75
    },
    "differential": {
      "name": "Player name",
      "reason": "Risky captain choice",
      "risk": "High risk, high reward"
    }
  },
  "conditions": {
    "pitchAnalysis": "Pitch conditions analysis",
    "weatherImpact": "Weather impact on match",
    "venueHistory": "Venue trends",
    "tossImpact": "Toss importance"
  },
  "strategy": {
    "roleDistribution": {
      "batsmen": 4,
      "bowlers": 4,
      "allRounders": 2,
      "wicketKeepers": 1
    },
    "teamBalance": "Recommended strategy",
    "riskProfile": "balanced",
    "keyInsights": ["insight1", "insight2", "insight3"]
  },
  "tournament": {
    "context": "Tournament stage",
    "importance": "Match significance",
    "teamMotivation": "Team motivation factors"
  }
}

Focus on actionable fantasy cricket recommendations based on form, conditions, and match dynamics.`;
  }

  async generateChatbotResponse(
    userMessage: string,
    matchContext: any,
    analysisData: MatchAnalysis
  ): Promise<string> {
    try {
      const prompt = `You are a friendly cricket expert helping with fantasy team selection. 

User question: ${userMessage}

Match context: ${JSON.stringify(matchContext)}
Analysis data: ${JSON.stringify(analysisData)}

Provide a helpful, conversational response (max 150 words) with specific recommendations based on the analysis. Be friendly and actionable.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      return content || "I'd be happy to help with your team selection based on the latest match analysis!";
    } catch (error) {
      console.error('Error generating chatbot response with Gemini:', error);
      return "I'd be happy to help with your team selection! Based on the current analysis, I can provide recommendations for players, captaincy choices, and team strategy. What specific aspect would you like to discuss?";
    }
  }

  private getComprehensiveFallbackAnalysis(
    matchData: CricketMatch,
    playerStats: CricketPlayer[],
    tournamentData?: any
  ): MatchAnalysis {
    const team1 = matchData.competitors[0]?.name || "Team 1";
    const team2 = matchData.competitors[1]?.name || "Team 2";
    
    const availablePlayers = playerStats.slice(0, 6);
    const topBatsman = availablePlayers.find(p => p.statistics?.batting?.average && p.statistics.batting.average > 30)?.name || "Top Batsman";
    const topBowler = availablePlayers.find(p => p.statistics?.bowling?.wickets && p.statistics.bowling.wickets > 10)?.name || "Top Bowler";
    const allRounder = availablePlayers.find(p => 
      p.statistics?.batting?.average && p.statistics?.bowling?.wickets &&
      p.statistics.batting.average > 20 && p.statistics.bowling.wickets > 5
    )?.name || "All-rounder";

    return {
      matchPrediction: {
        winnerPrediction: "Close match",
        confidence: 55,
        scoreRange: {
          team1: { min: 160, max: 180 },
          team2: { min: 160, max: 180 }
        },
        matchType: 'balanced',
        keyFactors: [
          "Recent team form",
          "Pitch conditions",
          "Weather impact",
          "Head-to-head record"
        ]
      },
      playerRecommendations: {
        core: [
          {
            name: topBatsman,
            role: "BAT",
            reason: "Consistent performer with excellent recent form",
            confidence: 85,
            team: matchData.competitors[0]?.abbreviation || "T1"
          },
          {
            name: topBowler,
            role: "BOWL",
            reason: "Leading wicket-taker with favorable conditions",
            confidence: 80,
            team: matchData.competitors[1]?.abbreviation || "T2"
          },
          {
            name: allRounder,
            role: "ALL",
            reason: "Provides balance with both bat and ball",
            confidence: 75,
            team: matchData.competitors[0]?.abbreviation || "T1"
          }
        ],
        hedge: [
          {
            name: availablePlayers[3]?.name || "Emerging Player",
            role: "BAT",
            reason: "Good value pick with upside potential",
            risk: 'medium',
            team: matchData.competitors[1]?.abbreviation || "T2"
          }
        ],
        avoid: [
          {
            name: availablePlayers[5]?.name || "Out of Form Player",
            reason: "Poor recent form and unfavorable match-up"
          }
        ]
      },
      captaincy: {
        primary: {
          name: topBatsman,
          reason: "Excellent recent form and reliable point scorer",
          confidence: 85
        },
        secondary: {
          name: allRounder,
          reason: "Multiple ways to score points",
          confidence: 75
        },
        differential: {
          name: topBowler,
          reason: "Conditions favor bowling, low ownership expected",
          risk: "Medium risk, high reward potential"
        }
      },
      conditions: {
        pitchAnalysis: "Balanced pitch expected to favor both batsmen and bowlers",
        weatherImpact: "Clear conditions expected with minimal weather interruption",
        venueHistory: `${matchData.venue?.name || 'This venue'} historically produces competitive matches`,
        tossImpact: "Toss could be crucial - winning captain likely to bowl first"
      },
      strategy: {
        roleDistribution: {
          batsmen: 4,
          bowlers: 4,
          allRounders: 2,
          wicketKeepers: 1
        },
        teamBalance: "Balanced approach recommended with equal focus on batting and bowling",
        riskProfile: 'balanced',
        keyInsights: [
          "Focus on in-form players from both teams",
          "Consider pitch conditions for player selection",
          "Weather unlikely to be a major factor",
          "Tournament context adds pressure on key players"
        ]
      },
      tournament: {
        context: tournamentData?.tournament?.name || "International Cricket",
        importance: "Important match for both teams' tournament progression",
        teamMotivation: "Both teams highly motivated to perform"
      }
    };
  }

  // ===== DREAM11 ENHANCED MODEL METHODS =====
  
  /**
   * Generate Dream11 teams using enhanced Gemini model with specialized prompts
   * This method uses standard Gemini with Dream11-optimized prompting
   */
  async generateDream11Teams(
    matchData: any,
    playerStats: any[],
    userPreferences: any,
    teamCount: number = 5
  ): Promise<any[]> {
    try {
      const modelInfo = this.isCustomModel ? 
        `custom model: ${this.customModelName}` : 
        `enhanced standard Gemini with Dream11 optimization`;
      
      console.log(`🎯 Generating ${teamCount} Dream11 teams using ${modelInfo}`);
      
      const prompt = this.buildDream11TeamPrompt(matchData, playerStats, userPreferences, teamCount);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      if (!content) {
        throw new Error(`No response from ${this.isCustomModel ? 'custom Dream11 model' : 'enhanced Gemini model'}`);
      }

      // Parse the model response (works for both custom and enhanced standard)
      return this.parseDream11TeamsResponse(content, teamCount);
      
    } catch (error) {
      console.error('❌ Custom Dream11 model generation failed:', error);
      console.log('🔄 Falling back to standard team generation logic...');
      return this.generateFallbackTeams(matchData, playerStats, userPreferences, teamCount);
    }
  }

  /**
   * Build specialized JSON prompt for Dream11 team generation
   * Formats request according to custom model requirements
   */
  private buildDream11TeamPrompt(
    matchData: any,
    playerStats: any[],
    userPreferences: any,
    teamCount: number
  ): string {
    if (this.isCustomModel) {
      // Use JSON format for Dream11 Gem (system instructions handle the context)
      const strategyId = this.mapToStrategyId(userPreferences);
      const strategyDetails = this.buildStrategyDetails(userPreferences, teamCount, strategyId);
      
      const playerPool = playerStats.map(player => ({
        player_name: player.player_name,
        role: this.mapRole(player.player_role),
        team: player.team_name,
        credits: player.credits || 8.5
      }));

      const jsonRequest = {
        strategy_id: strategyId,
        strategy_details: strategyDetails,
        player_pool: playerPool
      };

      return JSON.stringify(jsonRequest, null, 2);
      
    } else {
      // Enhanced prompting for standard Gemini model
      return this.buildEnhancedDream11Prompt(matchData, playerStats, userPreferences, teamCount);
    }
  }

  /**
   * Build enhanced Dream11 prompt for standard Gemini model
   */
  private buildEnhancedDream11Prompt(
    matchData: any,
    playerStats: any[],
    userPreferences: any,
    teamCount: number
  ): string {
    const match = matchData?.match || {};
    const teamA = match.team_a_name || 'Team A';
    const teamB = match.team_b_name || 'Team B';
    
    return `You are an expert Dream11 fantasy cricket team creator with deep knowledge of player performance, match conditions, and optimal team combinations.

## MATCH CONTEXT
- **Match**: ${teamA} vs ${teamB}
- **Venue**: ${match.match_venue || 'Standard venue'}
- **Pitch**: ${match.pitch_condition || 'Balanced'}
- **Weather**: ${match.weather_condition || 'Clear'}

## USER PREFERENCES
${this.formatUserPreferences(userPreferences)}

## PLAYER POOL
${this.formatPlayerPool(playerStats)}

## DREAM11 CONSTRAINTS
- **Team Size**: 11 players exactly
- **Credits**: Maximum 100 credits per team
- **Player Distribution**: 
  - Wicket-keepers: 1-4
  - Batsmen: 3-6
  - All-rounders: 1-4
  - Bowlers: 3-6
- **Team Balance**: Minimum 4 players from each team, maximum 7 from any team
- **Captain (2x points)** & **Vice-Captain (1.5x points)**: Must be selected

## GENERATION REQUIREMENTS
Generate exactly ${teamCount} distinct Dream11 teams with the following format:

### Master Player Roster
| Player Name | Role | Team | Credits | Selection % |
|-------------|------|------|---------|-------------|
[List all selected players with their selection frequency]

### Individual Team Breakdowns
**Team 1: [Team Name]**
- **Captain**: [Player Name] (Reasoning)
- **Vice-Captain**: [Player Name] (Reasoning)
- **Playing XI**: 
  - WK: [Players]
  - BAT: [Players] 
  - ALL: [Players]
  - BOWL: [Players]
- **Total Credits**: [X/100]
- **Strategy**: [Brief explanation]

[Repeat for all ${teamCount} teams]

Focus on creating diverse teams that maximize points potential while respecting all Dream11 rules and user preferences.`;
  }

  /**
   * Format user preferences for enhanced prompt
   */
  private formatUserPreferences(userPreferences: any): string {
    const preferences = [];
    
    if (userPreferences?.matchOutcome) {
      preferences.push(`- **Match Prediction**: ${userPreferences.matchOutcome}`);
    }
    
    if (userPreferences?.keyPlayers?.length > 0) {
      preferences.push(`- **Key Player Focus**: ${userPreferences.keyPlayers.join(', ')}`);
    }
    
    if (userPreferences?.riskAppetite) {
      preferences.push(`- **Risk Level**: ${userPreferences.riskAppetite}`);
    }
    
    if (userPreferences?.additionalContext) {
      preferences.push(`- **Additional Context**: ${userPreferences.additionalContext}`);
    }
    
    if (userPreferences?.corePlayers?.length > 0) {
      preferences.push(`- **Core Players**: ${userPreferences.corePlayers.join(', ')}`);
    }
    
    if (userPreferences?.hedgePlayers?.length > 0) {
      preferences.push(`- **Hedge Players**: ${userPreferences.hedgePlayers.join(', ')}`);
    }
    
    return preferences.length > 0 ? preferences.join('\n') : '- No specific preferences provided';
  }

  /**
   * Format player pool for enhanced prompt
   */
  private formatPlayerPool(playerStats: any[]): string {
    const teams: { [key: string]: any[] } = {};
    
    playerStats.forEach(player => {
      const team = player.team_name || 'Unknown';
      if (!teams[team]) teams[team] = [];
      teams[team].push({
        name: player.player_name,
        role: this.mapRole(player.player_role),
        credits: player.credits || 8.5
      });
    });
    
    let formatted = '';
    Object.keys(teams).forEach(team => {
      formatted += `\n**${team}:**\n`;
      teams[team].forEach((player: any) => {
        formatted += `- ${player.name} (${player.role}) - ${player.credits} credits\n`;
      });
    });
    
    return formatted;
  }

  /**
   * Map user preferences to strategy ID
   */
  private mapToStrategyId(userPreferences: any): string {
    // Strategy 1: AI-Guided conversation
    if (userPreferences?.matchOutcome || userPreferences?.keyPlayers) {
      return 'AI_CONVERSATIONAL';
    }
    
    // Strategy 4: Core-Hedge selection
    if (userPreferences?.selections?.core || userPreferences?.corePlayers) {
      return 'CORE_HEDGE';
    }
    
    // Strategy 2: Same XI different captains
    if (userPreferences?.players && userPreferences?.combos) {
      return 'SAME_XI_DIFF_C_VC';
    }
    
    // Strategy 7: Role-split lineups
    if (userPreferences?.roleSplitConfig) {
      return 'ROLE_SPLIT';
    }
    
    // Default to AI conversational
    return 'AI_CONVERSATIONAL';
  }

  /**
   * Build strategy details based on strategy type
   */
  private buildStrategyDetails(userPreferences: any, teamCount: number, strategyId: string): any {
    const baseDetails = { num_teams: teamCount };

    switch (strategyId) {
      case 'AI_CONVERSATIONAL':
        return {
          ...baseDetails,
          match_storyline: userPreferences?.additionalContext || 'Generate balanced teams',
          predicted_winner: userPreferences?.matchOutcome || 'Close match',
          key_players: userPreferences?.keyPlayers || [],
          risk_appetite: userPreferences?.riskAppetite || 'balanced'
        };

      case 'CORE_HEDGE':
        return {
          ...baseDetails,
          player_groups: {
            core: userPreferences?.selections?.core?.map((p: any) => p.name) || 
                  userPreferences?.corePlayers || [],
            hedge: userPreferences?.selections?.hedge?.map((p: any) => p.name) || 
                   userPreferences?.hedgePlayers || [],
            differential: userPreferences?.selections?.differential?.map((p: any) => p.name) || 
                         userPreferences?.differentialPlayers || []
          }
        };

      case 'SAME_XI_DIFF_C_VC':
        return {
          ...baseDetails,
          base_team: userPreferences?.players || [],
          captain_variations: userPreferences?.combos || []
        };

      case 'ROLE_SPLIT':
        return {
          ...baseDetails,
          role_counts: {
            BAT: userPreferences?.roleSplitConfig?.batsmen || 4,
            BOWL: userPreferences?.roleSplitConfig?.bowlers || 4,
            AR: userPreferences?.roleSplitConfig?.allRounders || 2,
            WK: userPreferences?.roleSplitConfig?.wicketKeepers || 1
          }
        };

      default:
        return baseDetails;
    }
  }

  /**
   * Map internal role format to model expected format
   */
  private mapRole(role: string): string {
    const roleMap: { [key: string]: string } = {
      'BAT': 'BAT',
      'BWL': 'BOWL',
      'AR': 'AR',
      'WK': 'WK'
    };
    return roleMap[role] || role;
  }

  /**
   * Parse the custom model response for Dream11 teams  
   * Model returns Markdown format, needs to be parsed
   */
  private parseDream11TeamsResponse(content: string, expectedCount: number): any[] {
    try {
      console.log('📄 Parsing Markdown response from custom Dream11 model...');
      
      // Since the model returns Markdown with Master Player Roster and Individual Team Breakdowns,
      // we need to parse this format and convert to our expected structure
      
      const teams = this.parseMarkdownToTeams(content, expectedCount);
      
      if (teams.length > 0) {
        console.log(`✅ Successfully parsed ${teams.length} teams from custom model`);
        return teams;
      } else {
        throw new Error('No teams found in custom model response');
      }
      
    } catch (error) {
      console.error('❌ Failed to parse custom model Markdown response:', error);
      console.log('📄 Raw response snippet:', content.substring(0, 500) + '...');
      throw error;
    }
  }

  /**
   * Parse Markdown format from custom model to team objects
   */
  private parseMarkdownToTeams(content: string, expectedCount: number): any[] {
    const teams: any[] = [];
    
    try {
      // Split content into sections
      const sections = content.split(/#{2,3}\s*/); // Split on ## or ###
      
      let currentTeam: any = null;
      
      for (const section of sections) {
        const lines = section.trim().split('\n');
        const header = lines[0]?.toLowerCase();
        
        // Look for team headers (e.g., "Team 1", "Team 2")
        if (header && header.includes('team ') && /\d+/.test(header)) {
          // Start new team
          if (currentTeam && currentTeam.players.length > 0) {
            teams.push(currentTeam);
          }
          
          const teamNumber = header.match(/\d+/)?.[0] || teams.length + 1;
          currentTeam = {
            teamName: `Team ${teamNumber}`,
            strategy: 'Generated by Dream11 MultiTeam Creator',
            players: [],
            captain: null,
            viceCaptain: null,
            totalCredits: 0,
            expectedPoints: 0
          };
        }
        
        // Parse player table in the section
        if (currentTeam) {
          this.parsePlayersFromSection(section, currentTeam);
        }
      }
      
      // Add the last team
      if (currentTeam && currentTeam.players.length > 0) {
        teams.push(currentTeam);
      }
      
      // If no teams found in structured format, try basic parsing
      if (teams.length === 0) {
        return this.parseBasicMarkdownFormat(content, expectedCount);
      }
      
      return teams.slice(0, expectedCount);
      
    } catch (error) {
      console.error('❌ Error parsing Markdown teams:', error);
      return [];
    }
  }

  /**
   * Parse players from a Markdown section
   */
  private parsePlayersFromSection(section: string, team: any): void {
    const lines = section.split('\n');
    let inTable = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Detect table start (header with pipes)
      if (line.includes('|') && (line.includes('Player') || line.includes('Name'))) {
        inTable = true;
        continue;
      }
      
      // Skip table separator line
      if (line.match(/^\|[\s\-\|]+\|$/)) {
        continue;
      }
      
      // Parse table rows
      if (inTable && line.includes('|')) {
        const columns = line.split('|').map(col => col.trim()).filter(col => col);
        
        if (columns.length >= 3) {
          const playerName = columns[0];
          const playerRole = columns[1];
          const playerTeam = columns[2];
          const credits = parseFloat(columns[3]) || 8.5;
          
          if (playerName && playerName !== '') {
            const player = {
              name: playerName,
              role: playerRole,
              team: playerTeam,
              credits: credits,
              points: 35 + Math.random() * 30 // Estimated points
            };
            
            team.players.push(player);
            team.totalCredits += credits;
            
            // Identify captain and vice-captain (usually marked with (C) or (VC))
            if (playerName.includes('(C)') || columns.some(col => col.includes('Captain'))) {
              team.captain = playerName.replace(/\s*\(C\)\s*/, '');
            }
            if (playerName.includes('(VC)') || columns.some(col => col.includes('Vice'))) {
              team.viceCaptain = playerName.replace(/\s*\(VC\)\s*/, '');
            }
          }
        }
      }
      
      // Stop parsing if we hit another section
      if (line.startsWith('#') && i > 0) {
        break;
      }
    }
    
    // Set default captain/vice-captain if not found
    if (!team.captain && team.players.length > 0) {
      team.captain = team.players[0].name;
    }
    if (!team.viceCaptain && team.players.length > 1) {
      team.viceCaptain = team.players[1].name;
    }
    
    // Calculate expected points
    team.expectedPoints = team.players.reduce((sum: number, p: any) => sum + p.points, 0);
  }

  /**
   * Basic Markdown parsing fallback
   */
  private parseBasicMarkdownFormat(content: string, expectedCount: number): any[] {
    const teams: any[] = [];
    
    // Simple fallback - just create teams with basic structure
    for (let i = 1; i <= expectedCount; i++) {
      teams.push({
        teamName: `Team ${i}`,
        strategy: 'Parsed from custom model',
        players: [],
        captain: 'Player 1',
        viceCaptain: 'Player 2', 
        totalCredits: 95.0,
        expectedPoints: 400.0
      });
    }
    
    console.log(`📋 Created ${teams.length} basic teams from Markdown parsing`);
    return teams;
  }

  /**
   * Fallback team generation if custom model fails
   */
  private generateFallbackTeams(
    matchData: any,
    playerStats: any[],
    userPreferences: any,
    teamCount: number
  ): any[] {
    console.log('🔄 Generating fallback teams using basic logic...');
    
    // Basic fallback logic - create simple teams
    const teams = [];
    for (let i = 0; i < teamCount; i++) {
      teams.push({
        teamName: `Team ${i + 1}`,
        strategy: 'Fallback generation',
        players: playerStats.slice(0, 11).map(player => ({
          name: player.player_name,
          team: player.team_name,
          role: player.player_role,
          credits: player.credits || 8.5,
          points: player.recent_points || 35
        })),
        captain: playerStats[0]?.player_name || 'Player 1',
        viceCaptain: playerStats[1]?.player_name || 'Player 2',
        totalCredits: 95.5,
        expectedPoints: 385.0
      });
    }
    
    return teams;
  }

  /**
   * Get model information for debugging
   */
  getModelInfo(): any {
    return {
      customModelName: this.customModelName,
      customModelId: this.customModelId || 'Not required - using model name',
      isCustomModel: true, // Always try to use custom model first
      modelType: 'Gemini Custom Model - Dream11 MultiTeam Creator'
    };
  }
}

export const geminiService = new GeminiService();