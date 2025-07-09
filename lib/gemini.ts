import { GoogleGenerativeAI } from '@google/generative-ai';
import { SportRadarMatch, SportRadarPlayer } from './sportradar';
import { MatchAnalysis } from './openai';

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      console.warn('⚠️  Gemini API key not configured. Please add GEMINI_API_KEY to .env.local');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async analyzeMatchData(
    matchData: SportRadarMatch,
    playerStats: SportRadarPlayer[],
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
    matchData: SportRadarMatch,
    playerStats: SportRadarPlayer[],
    weatherData: any,
    teamResults: any[],
    tournamentData: any
  ): string {
    // Limit data to reduce token count
    const limitedPlayerStats = playerStats.slice(0, 6).map(player => ({
      name: player.name,
      role: player.type,
      team: player.nationality,
      statistics: {
        batting_average: player.statistics?.batting_average,
        strike_rate: player.statistics?.strike_rate,
        wickets_taken: player.statistics?.wickets_taken,
        economy_rate: player.statistics?.economy_rate
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
      competitors: matchData.competitors?.map(comp => ({
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
    matchData: SportRadarMatch,
    playerStats: SportRadarPlayer[],
    tournamentData?: any
  ): MatchAnalysis {
    const team1 = matchData.competitors[0]?.name || "Team 1";
    const team2 = matchData.competitors[1]?.name || "Team 2";
    
    const availablePlayers = playerStats.slice(0, 6);
    const topBatsman = availablePlayers.find(p => p.statistics?.batting_average && p.statistics.batting_average > 30)?.name || "Top Batsman";
    const topBowler = availablePlayers.find(p => p.statistics?.wickets_taken && p.statistics.wickets_taken > 10)?.name || "Top Bowler";
    const allRounder = availablePlayers.find(p => 
      p.statistics?.batting_average && p.statistics?.wickets_taken &&
      p.statistics.batting_average > 20 && p.statistics.wickets_taken > 5
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
}

export const geminiService = new GeminiService();