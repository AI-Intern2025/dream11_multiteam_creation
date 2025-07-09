import { openAIService } from './openai';
import { geminiService } from './gemini';
import { SportRadarMatch, SportRadarPlayer } from './sportradar';
import { MatchAnalysis } from './openai';

type AIProvider = 'openai' | 'gemini';

class AIService {
  private provider: AIProvider;

  constructor() {
    // Determine which AI service to use based on environment variables
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const hasGemini = !!process.env.GEMINI_API_KEY;
    
    if (hasGemini && !hasOpenAI) {
      this.provider = 'gemini';
      console.log('🤖 Using Gemini AI for analysis');
    } else if (hasOpenAI && !hasGemini) {
      this.provider = 'openai';
      console.log('🤖 Using OpenAI for analysis');
    } else if (hasGemini && hasOpenAI) {
      // If both are available, prefer the one specified in env or default to OpenAI
      this.provider = (process.env.AI_PROVIDER as AIProvider) || 'openai';
      console.log(`🤖 Using ${this.provider.toUpperCase()} for analysis (both APIs available)`);
    } else {
      // Default to OpenAI if no keys are configured (will use fallback)
      this.provider = 'openai';
      console.warn('⚠️  No AI API keys configured. Using fallback analysis.');
    }
  }

  async analyzeMatchData(
    matchData: SportRadarMatch,
    playerStats: SportRadarPlayer[],
    weatherData: any,
    teamResults: any[],
    tournamentData: any
  ): Promise<MatchAnalysis> {
    try {
      if (this.provider === 'gemini') {
        return await geminiService.analyzeMatchData(
          matchData,
          playerStats,
          weatherData,
          teamResults,
          tournamentData
        );
      } else {
        return await openAIService.analyzeMatchData(
          matchData,
          playerStats,
          weatherData,
          teamResults,
          tournamentData
        );
      }
    } catch (error) {
      console.error(`Error with ${this.provider} analysis, trying fallback:`, error);
      
      // Try the other provider as fallback
      try {
        if (this.provider === 'openai') {
          console.log('🔄 Falling back to Gemini...');
          return await geminiService.analyzeMatchData(
            matchData,
            playerStats,
            weatherData,
            teamResults,
            tournamentData
          );
        } else {
          console.log('🔄 Falling back to OpenAI...');
          return await openAIService.analyzeMatchData(
            matchData,
            playerStats,
            weatherData,
            teamResults,
            tournamentData
          );
        }
      } catch (fallbackError) {
        console.error('Both AI providers failed, using fallback analysis:', fallbackError);
        // Return a basic fallback analysis
        return this.getFallbackAnalysis(matchData, playerStats, tournamentData);
      }
    }
  }

  async generateChatbotResponse(
    userMessage: string,
    matchContext: any,
    analysisData: MatchAnalysis
  ): Promise<string> {
    try {
      if (this.provider === 'gemini') {
        return await geminiService.generateChatbotResponse(userMessage, matchContext, analysisData);
      } else {
        return await openAIService.generateChatbotResponse(userMessage, matchContext, analysisData);
      }
    } catch (error) {
      console.error(`Error with ${this.provider} chatbot, trying fallback:`, error);
      
      // Try the other provider as fallback
      try {
        if (this.provider === 'openai') {
          return await geminiService.generateChatbotResponse(userMessage, matchContext, analysisData);
        } else {
          return await openAIService.generateChatbotResponse(userMessage, matchContext, analysisData);
        }
      } catch (fallbackError) {
        console.error('Both AI providers failed for chatbot:', fallbackError);
        return "I'd be happy to help with your team selection! Based on the current analysis, I can provide recommendations for players, captaincy choices, and team strategy. What specific aspect would you like to discuss?";
      }
    }
  }

  getProvider(): AIProvider {
    return this.provider;
  }

  setProvider(provider: AIProvider): void {
    this.provider = provider;
    console.log(`🤖 Switched to ${provider.toUpperCase()} for analysis`);
  }

  private getFallbackAnalysis(
    matchData: SportRadarMatch,
    playerStats: SportRadarPlayer[],
    tournamentData?: any
  ): MatchAnalysis {
    const team1 = matchData.competitors[0]?.name || "Team 1";
    const team2 = matchData.competitors[1]?.name || "Team 2";
    
    const availablePlayers = playerStats.slice(0, 6);
    const topBatsman = availablePlayers[0]?.name || "Top Batsman";
    const topBowler = availablePlayers[1]?.name || "Top Bowler";
    const allRounder = availablePlayers[2]?.name || "All-rounder";

    return {
      matchPrediction: {
        winnerPrediction: "Close match",
        confidence: 50,
        scoreRange: {
          team1: { min: 150, max: 180 },
          team2: { min: 150, max: 180 }
        },
        matchType: 'balanced',
        keyFactors: [
          "Recent team form",
          "Pitch conditions",
          "Weather impact"
        ]
      },
      playerRecommendations: {
        core: [
          {
            name: topBatsman,
            role: "BAT",
            reason: "Consistent performer",
            confidence: 75,
            team: matchData.competitors[0]?.abbreviation || "T1"
          },
          {
            name: topBowler,
            role: "BOWL",
            reason: "Leading wicket-taker",
            confidence: 70,
            team: matchData.competitors[1]?.abbreviation || "T2"
          }
        ],
        hedge: [
          {
            name: allRounder,
            role: "ALL",
            reason: "Good value pick",
            risk: 'medium',
            team: matchData.competitors[0]?.abbreviation || "T1"
          }
        ],
        avoid: []
      },
      captaincy: {
        primary: {
          name: topBatsman,
          reason: "Reliable point scorer",
          confidence: 75
        },
        secondary: {
          name: allRounder,
          reason: "Multiple ways to score",
          confidence: 65
        },
        differential: {
          name: topBowler,
          reason: "Conditions may favor bowling",
          risk: "Medium risk"
        }
      },
      conditions: {
        pitchAnalysis: "Balanced pitch expected",
        weatherImpact: "Clear conditions expected",
        venueHistory: "Historically balanced venue",
        tossImpact: "Toss could be important"
      },
      strategy: {
        roleDistribution: {
          batsmen: 4,
          bowlers: 4,
          allRounders: 2,
          wicketKeepers: 1
        },
        teamBalance: "Balanced approach recommended",
        riskProfile: 'balanced',
        keyInsights: [
          "Focus on in-form players",
          "Consider pitch conditions",
          "Weather unlikely to be a factor"
        ]
      },
      tournament: {
        context: tournamentData?.tournament?.name || "Cricket Match",
        importance: "Important match for both teams",
        teamMotivation: "Both teams motivated to perform"
      }
    };
  }
}

export const aiService = new AIService();