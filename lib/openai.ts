import OpenAI from 'openai';
import { SportRadarMatch, SportRadarPlayer } from './sportradar';

export interface MatchAnalysis {
  matchPrediction: {
    winnerPrediction: string;
    confidence: number;
    scoreRange: {
      team1: { min: number; max: number };
      team2: { min: number; max: number };
    };
    matchType: 'high-scoring' | 'low-scoring' | 'balanced';
    keyFactors: string[];
  };
  playerRecommendations: {
    core: Array<{
      name: string;
      role: string;
      reason: string;
      confidence: number;
      team: string;
    }>;
    hedge: Array<{
      name: string;
      role: string;
      reason: string;
      risk: 'low' | 'medium' | 'high';
      team: string;
    }>;
    avoid: Array<{
      name: string;
      reason: string;
    }>;
  };
  captaincy: {
    primary: {
      name: string;
      reason: string;
      confidence: number;
    };
    secondary: {
      name: string;
      reason: string;
      confidence: number;
    };
    differential: {
      name: string;
      reason: string;
      risk: string;
    };
  };
  conditions: {
    pitchAnalysis: string;
    weatherImpact: string;
    venueHistory: string;
    tossImpact: string;
  };
  strategy: {
    roleDistribution: {
      batsmen: number;
      bowlers: number;
      allRounders: number;
      wicketKeepers: number;
    };
    teamBalance: string;
    riskProfile: 'conservative' | 'balanced' | 'aggressive';
    keyInsights: string[];
  };
  tournament: {
    context: string;
    importance: string;
    teamMotivation: string;
  };
}

class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
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
        const response = await this.openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `You are an expert cricket analyst. Analyze the provided data and return insights in the exact JSON format specified. Focus on actionable fantasy cricket recommendations.

CRITICAL: You must respond with ONLY a valid JSON object. Do not include any explanatory text, markdown formatting, or conversational responses. Your entire response must be parseable by JSON.parse(). Start your response directly with { and end with }.`
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error('No response from OpenAI');
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
        return analysis;
      } catch (error: any) {
        // Check if it's a rate limit error
        if (error?.status === 429 && retryCount < maxRetries) {
          retryCount++;
          // Exponential backoff: 2^retryCount seconds, with some jitter
          const baseDelay = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
          const jitter = Math.random() * 1000; // Add up to 1s of random jitter
          const delay = baseDelay + jitter;
          
          console.log(`Rate limit hit, retrying in ${Math.round(delay/1000)}s (attempt ${retryCount}/${maxRetries})`);
          
          await new Promise(resolve => setTimeout(resolve, delay));
          continue; // Retry the request
        }
        
        // If it's not a rate limit error or we've exhausted retries, log and fallback
        console.error('Error analyzing match data with OpenAI:', error);
        // Return a comprehensive fallback analysis
        return this.getComprehensiveFallbackAnalysis(matchData, playerStats, tournamentData);
      }
    }
    
    // This should never be reached, but just in case
    return this.getComprehensiveFallbackAnalysis(matchData, playerStats, tournamentData);
  }

  private buildComprehensiveAnalysisPrompt(
    matchData: SportRadarMatch,
    playerStats: SportRadarPlayer[],
    weatherData: any,
    teamResults: any[],
    tournamentData: any
  ): string {
    // Significantly limit data to reduce token count
    const limitedPlayerStats = playerStats.slice(0, 3).map(player => ({
      name: player.name,
      role: player.role,
      team: player.team,
      statistics: {
        batting_average: player.statistics?.batting_average,
        strike_rate: player.statistics?.strike_rate,
        wickets_taken: player.statistics?.wickets_taken,
        economy_rate: player.statistics?.economy_rate,
        recent_form: player.statistics?.recent_form
      }
    }));
    
    const limitedTeamResults = teamResults.map(team => ({
      name: team.name,
      recent_matches: team.sport_events?.slice(0, 1).map((match: any) => ({
        result: match.result,
        opponent: match.opponent,
        date: match.date
      })) || []
    }));

    // Extract only essential match data
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
        type: (matchData.tournament as any)?.type || 'Unknown'
      }
    };

    // Extract only essential weather data
    const essentialWeatherData = {
      temperature: weatherData?.temperature,
      humidity: weatherData?.humidity,
      wind_speed: weatherData?.wind_speed,
      conditions: weatherData?.conditions,
      precipitation: weatherData?.precipitation
    };

    // Extract only essential tournament data
    const essentialTournamentData = {
      name: tournamentData?.tournament?.name,
      stage: tournamentData?.stage,
      importance: tournamentData?.importance
    };

    return `
Analyze the following comprehensive cricket match data from SportRadar and provide detailed fantasy cricket insights:

MATCH INFORMATION:
${JSON.stringify(essentialMatchData)}

PLAYER STATISTICS AND PROFILES:
${JSON.stringify(limitedPlayerStats)}

WEATHER CONDITIONS:
${JSON.stringify(essentialWeatherData)}

TEAM RECENT RESULTS:
${JSON.stringify(limitedTeamResults)}

TOURNAMENT CONTEXT:
${JSON.stringify(essentialTournamentData)}

Please provide a comprehensive analysis in the following JSON format:

{
  "matchPrediction": {
    "winnerPrediction": "Team name or 'Close match'",
    "confidence": 0-100,
    "scoreRange": {
      "team1": {"min": number, "max": number},
      "team2": {"min": number, "max": number}
    },
    "matchType": "high-scoring|low-scoring|balanced",
    "keyFactors": ["factor1", "factor2", "factor3"]
  },
  "playerRecommendations": {
    "core": [
      {
        "name": "Player name",
        "role": "BAT|BOWL|ALL|WK",
        "reason": "Detailed reason based on form, conditions, and match-up",
        "confidence": 0-100,
        "team": "Team abbreviation"
      }
    ],
    "hedge": [
      {
        "name": "Player name",
        "role": "BAT|BOWL|ALL|WK",
        "reason": "Why this is a good differential pick",
        "risk": "low|medium|high",
        "team": "Team abbreviation"
      }
    ],
    "avoid": [
      {
        "name": "Player name",
        "reason": "Why to avoid this player"
      }
    ]
  },
  "captaincy": {
    "primary": {
      "name": "Player name",
      "reason": "Detailed reason for captaincy choice",
      "confidence": 0-100
    },
    "secondary": {
      "name": "Player name",
      "reason": "Alternative captain choice reasoning",
      "confidence": 0-100
    },
    "differential": {
      "name": "Player name",
      "reason": "Risky but potentially rewarding captain",
      "risk": "Risk level description"
    }
  },
  "conditions": {
    "pitchAnalysis": "Detailed analysis of pitch conditions and their impact",
    "weatherImpact": "How weather will affect the match and player performance",
    "venueHistory": "Historical trends at this venue and ground dimensions",
    "tossImpact": "Importance of toss and preferred choice"
  },
  "strategy": {
    "roleDistribution": {
      "batsmen": number,
      "bowlers": number,
      "allRounders": number,
      "wicketKeepers": number
    },
    "teamBalance": "Recommended team composition strategy",
    "riskProfile": "conservative|balanced|aggressive",
    "keyInsights": ["insight1", "insight2", "insight3"]
  },
  "tournament": {
    "context": "Tournament stage and importance",
    "importance": "Match significance for teams",
    "teamMotivation": "Team motivation and pressure factors"
  }
}

Provide specific, actionable insights based on the data provided.
`;
  }

  private getComprehensiveFallbackAnalysis(
    matchData: SportRadarMatch,
    playerStats: SportRadarPlayer[],
    tournamentData?: any
  ): MatchAnalysis {
    const team1 = matchData.competitors[0]?.name || "Team 1";
    const team2 = matchData.competitors[1]?.name || "Team 2";
    
    // Extract some player names from the data
    const availablePlayers = playerStats.slice(0, 6);
    const topBatsman = availablePlayers.find(p => (p.statistics?.batting_average || 0) > 30)?.name || "Top Batsman";
    const topBowler = availablePlayers.find(p => (p.statistics?.wickets_taken || 0) > 10)?.name || "Top Bowler";
    const allRounder = availablePlayers.find(p => 
      (p.statistics?.batting_average || 0) > 20 && (p.statistics?.wickets_taken || 0) > 5
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

  async generateChatbotResponse(
    userMessage: string,
    matchContext: any,
    analysisData: MatchAnalysis
  ): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a friendly cricket expert and fantasy sports advisor helping users create optimal fantasy teams. Use the comprehensive match analysis data to provide helpful, conversational responses. Keep responses concise but informative, and always provide actionable advice based on the data.

Key guidelines:
- Be conversational and friendly
- Provide specific player recommendations with reasons
- Reference match conditions and analysis when relevant
- Suggest captaincy options
- Explain your reasoning briefly
- Keep responses under 150 words unless asked for detailed analysis`
          },
          {
            role: "user",
            content: `
User question: ${userMessage}

Match context: ${JSON.stringify(matchContext)}
Analysis data: ${JSON.stringify(analysisData)}

Provide a helpful response based on the comprehensive analysis.
`
          }
        ],
        temperature: 0.8,
        max_tokens: 250
      });

      return response.choices[0]?.message?.content || "I'd be happy to help with your team selection based on the latest match analysis!";
    } catch (error) {
      console.error('Error generating chatbot response:', error);
      return "I'd be happy to help with your team selection! Based on the current analysis, I can provide recommendations for players, captaincy choices, and team strategy. What specific aspect would you like to discuss?";
    }
  }
}

export const openAIService = new OpenAIService();