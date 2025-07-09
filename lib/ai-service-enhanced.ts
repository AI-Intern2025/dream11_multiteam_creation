import { openAIService } from './openai';
import { geminiService } from './gemini';
import { neonDB, Player, Match } from './neon-db';
import { SportRadarMatch, SportRadarPlayer } from './sportradar';
import { MatchAnalysis } from './openai';

type AIProvider = 'openai' | 'gemini';

export interface TeamGenerationRequest {
  matchId: number;
  strategy: string;
  teamCount: number;
  userPreferences?: {
    captain?: string;
    viceCaptain?: string;
    preferredPlayers?: string[];
    avoidPlayers?: string[];
    riskProfile?: 'conservative' | 'balanced' | 'aggressive';
    budget?: number;
  };
}

export interface AIPlayerRecommendation {
  player: Player;
  confidence: number;
  reason: string;
  role: 'core' | 'hedge' | 'differential';
  captaincy_score?: number;
}

export interface AITeamAnalysis {
  players: Player[];
  captain: Player;
  viceCaptain: Player;
  totalCredits: number;
  roleBalance: {
    batsmen: number;
    bowlers: number;
    allRounders: number;
    wicketKeepers: number;
  };
  riskScore: number;
  expectedPoints: number;
  confidence: number;
  reasoning: string;
}

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

  // Legacy SportRadar integration methods
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
      console.error('❌ AI analysis failed:', error);
      return this.getFallbackAnalysis(matchData);
    }
  }

  async generateChatbotResponse(
    message: string,
    matchData?: any,
    analysis?: any
  ): Promise<string> {
    try {
      // Try primary provider first
      if (this.provider === 'openai' && process.env.OPENAI_API_KEY) {
        return await openAIService.generateChatbotResponse(message, matchData, analysis);
      } else if (this.provider === 'gemini' && process.env.GEMINI_API_KEY) {
        return await geminiService.generateChatbotResponse(message, matchData, analysis);
      }

      // Fallback to alternative provider
      if (process.env.OPENAI_API_KEY) {
        return await openAIService.generateChatbotResponse(message, matchData, analysis);
      } else if (process.env.GEMINI_API_KEY) {
        return await geminiService.generateChatbotResponse(message, matchData, analysis);
      }

      // Final fallback
      return this.generateFallbackResponse(message);
    } catch (error) {
      console.error('Error generating AI response:', error);
      return this.generateFallbackResponse(message);
    }
  }

  // New Neon DB integration methods
  async generateAIPlayerRecommendations(matchId: number): Promise<AIPlayerRecommendation[]> {
    try {
      const match = await neonDB.getMatchById(matchId);
      if (!match) throw new Error('Match not found');

      const players = await neonDB.getPlayingPlayersForMatch(matchId);
      const matchConditions = await neonDB.getMatchConditionsAnalysis(matchId);

      const recommendations: AIPlayerRecommendation[] = [];

      for (const player of players) {
        const playerForm = await neonDB.getPlayerFormAnalysis(player.id);
        const recommendation = await this.analyzePlayerForMatch(player, playerForm, match, matchConditions);
        recommendations.push(recommendation);
      }

      // Sort by confidence score
      return recommendations.sort((a, b) => b.confidence - a.confidence);
    } catch (error) {
      console.error('Error generating AI player recommendations:', error);
      return [];
    }
  }

  private async analyzePlayerForMatch(
    player: Player,
    playerForm: any,
    match: Match,
    matchConditions: any
  ): Promise<AIPlayerRecommendation> {
    let confidence = 0.5; // Base confidence
    let reason = '';
    let role: 'core' | 'hedge' | 'differential' = 'hedge';
    let captaincy_score = 0;

    // Analyze based on form
    if (playerForm.form_rating === 'Excellent') {
      confidence += 0.3;
      reason += 'Excellent recent form. ';
      captaincy_score += 30;
    } else if (playerForm.form_rating === 'Good') {
      confidence += 0.2;
      reason += 'Good recent form. ';
      captaincy_score += 20;
    } else if (playerForm.form_rating === 'Poor') {
      confidence -= 0.2;
      reason += 'Poor recent form, risky pick. ';
      captaincy_score -= 20;
    }

    // Analyze based on credits (value for money)
    if (player.credits < 7) {
      confidence += 0.1;
      reason += 'Good value pick. ';
      role = 'differential';
    } else if (player.credits > 10) {
      reason += 'Premium pick, high ownership expected. ';
      if (confidence > 0.7) role = 'core';
      captaincy_score += 20;
    }

    // Analyze based on selection percentage
    if (player.selection_percentage < 30) {
      confidence += 0.1;
      reason += 'Low ownership differential. ';
      role = 'differential';
    } else if (player.selection_percentage > 70) {
      reason += 'Popular pick, safe choice. ';
      if (confidence > 0.6) role = 'core';
    }

    // Analyze based on match conditions
    if (matchConditions.pitch_condition === 'Spin-friendly' && player.player_role === 'BWL' && player.bowling_style?.includes('spin')) {
      confidence += 0.2;
      reason += 'Spin-friendly pitch favors this bowler. ';
      captaincy_score += 25;
    } else if (matchConditions.pitch_condition === 'Seam-friendly' && player.player_role === 'BWL' && !player.bowling_style?.includes('spin')) {
      confidence += 0.2;
      reason += 'Seam-friendly pitch favors fast bowlers. ';
      captaincy_score += 25;
    } else if (matchConditions.pitch_condition === 'Flat' && player.player_role === 'BAT') {
      confidence += 0.15;
      reason += 'Flat pitch favors batsmen. ';
      captaincy_score += 20;
    }

    // Weather analysis
    if (matchConditions.weather_condition === 'Overcast' && player.player_role === 'BWL') {
      confidence += 0.1;
      reason += 'Overcast conditions help bowlers. ';
      captaincy_score += 15;
    } else if (matchConditions.weather_condition === 'Clear' && player.player_role === 'BAT') {
      confidence += 0.1;
      reason += 'Clear weather good for batting. ';
      captaincy_score += 15;
    }

    // Player role specific analysis
    if (player.player_role === 'AR') {
      confidence += 0.05;
      reason += 'All-rounder provides balance. ';
      captaincy_score += 10;
    } else if (player.player_role === 'WK') {
      confidence += 0.05;
      reason += 'Wicket-keeper provides extra points. ';
    }

    // Cap confidence and captaincy score
    confidence = Math.min(Math.max(confidence, 0), 1);
    captaincy_score = Math.max(captaincy_score, 0);

    return {
      player,
      confidence,
      reason: reason.trim(),
      role,
      captaincy_score
    };
  }

  async generateTeamsWithAIStrategy(request: TeamGenerationRequest): Promise<AITeamAnalysis[]> {
    try {
      const recommendations = await this.generateAIPlayerRecommendations(request.matchId);
      const teams: AITeamAnalysis[] = [];

      for (let i = 0; i < request.teamCount; i++) {
        const team = await this.generateSingleTeam(recommendations, request, i);
        teams.push(team);
      }

      return teams;
    } catch (error) {
      console.error('Error generating AI teams:', error);
      return [];
    }
  }

  private async generateSingleTeam(
    recommendations: AIPlayerRecommendation[],
    request: TeamGenerationRequest,
    teamIndex: number
  ): Promise<AITeamAnalysis> {
    const selectedPlayers: Player[] = [];
    let totalCredits = 0;
    const maxCredits = 100; // Dream11 credit limit
    
    // Role requirements
    const roleBalance = {
      batsmen: 0,
      bowlers: 0,
      allRounders: 0,
      wicketKeepers: 0
    };

    // Strategy-specific logic
    let coreCount = 6; // Default core players
    let hedgeCount = 3;
    let differentialCount = 2;

    switch (request.strategy) {
      case 'ai-chatbot':
        // AI-guided selection based on user preferences
        break;
      case 'core-hedge':
        coreCount = 7;
        hedgeCount = 3;
        differentialCount = 1;
        break;
      case 'stats-driven':
        // Focus on high-confidence picks
        coreCount = 8;
        hedgeCount = 2;
        differentialCount = 1;
        break;
      case 'differential':
        coreCount = 4;
        hedgeCount = 4;
        differentialCount = 3;
        break;
    }

    // Select players based on strategy
    const coreRecommendations = recommendations.filter(r => r.role === 'core').slice(0, coreCount);
    const hedgeRecommendations = recommendations.filter(r => r.role === 'hedge').slice(0, hedgeCount);
    const differentialRecommendations = recommendations.filter(r => r.role === 'differential').slice(0, differentialCount);

    // Combine recommendations with some randomization for team variety
    const teamRecommendations = [
      ...coreRecommendations,
      ...hedgeRecommendations.slice(teamIndex % hedgeRecommendations.length),
      ...differentialRecommendations.slice(teamIndex % differentialRecommendations.length)
    ].slice(0, 11);

    // Ensure role balance
    let selectedWK = 0, selectedBAT = 0, selectedAR = 0, selectedBWL = 0;

    for (const rec of teamRecommendations) {
      const player = rec.player;
      
      // Check role limits
      if (player.player_role === 'WK' && selectedWK >= 2) continue;
      if (player.player_role === 'BAT' && selectedBAT >= 6) continue;
      if (player.player_role === 'AR' && selectedAR >= 4) continue;
      if (player.player_role === 'BWL' && selectedBWL >= 6) continue;
      
      // Check credit limit
      if (totalCredits + player.credits > maxCredits) continue;

      selectedPlayers.push(player);
      totalCredits += player.credits;

      // Update role counts
      switch (player.player_role) {
        case 'WK': selectedWK++; roleBalance.wicketKeepers++; break;
        case 'BAT': selectedBAT++; roleBalance.batsmen++; break;
        case 'AR': selectedAR++; roleBalance.allRounders++; break;
        case 'BWL': selectedBWL++; roleBalance.bowlers++; break;
      }

      if (selectedPlayers.length === 11) break;
    }

    // Fill remaining slots if needed
    while (selectedPlayers.length < 11 && recommendations.length > selectedPlayers.length) {
      const remainingRecs = recommendations.filter(r => !selectedPlayers.includes(r.player));
      if (remainingRecs.length === 0) break;
      
      const nextPlayer = remainingRecs[0].player;
      if (totalCredits + nextPlayer.credits <= maxCredits) {
        selectedPlayers.push(nextPlayer);
        totalCredits += nextPlayer.credits;
        
        switch (nextPlayer.player_role) {
          case 'WK': roleBalance.wicketKeepers++; break;
          case 'BAT': roleBalance.batsmen++; break;
          case 'AR': roleBalance.allRounders++; break;
          case 'BWL': roleBalance.bowlers++; break;
        }
      } else {
        break;
      }
    }

    // Select captain and vice-captain
    const captainCandidates = recommendations
      .filter(r => selectedPlayers.includes(r.player))
      .sort((a, b) => (b.captaincy_score || 0) - (a.captaincy_score || 0));

    const captain = captainCandidates[0]?.player || selectedPlayers[0];
    const viceCaptain = captainCandidates[1]?.player || selectedPlayers[1];

    // Calculate team metrics
    const riskScore = this.calculateRiskScore(selectedPlayers);
    const expectedPoints = this.calculateExpectedPoints(selectedPlayers, captain, viceCaptain);
    const confidence = this.calculateTeamConfidence(recommendations.filter(r => selectedPlayers.includes(r.player)));

    return {
      players: selectedPlayers,
      captain,
      viceCaptain,
      totalCredits,
      roleBalance,
      riskScore,
      expectedPoints,
      confidence,
      reasoning: this.generateTeamReasoning(recommendations.filter(r => selectedPlayers.includes(r.player)), request.strategy)
    };
  }

  private calculateRiskScore(players: Player[]): number {
    const avgCredits = players.reduce((sum, p) => sum + p.credits, 0) / players.length;
    const avgSelection = players.reduce((sum, p) => sum + p.selection_percentage, 0) / players.length;
    
    // Higher credits and lower selection = higher risk
    return Math.min((avgCredits * 10) + ((100 - avgSelection) / 2), 100);
  }

  private calculateExpectedPoints(players: Player[], captain: Player, viceCaptain: Player): number {
    let totalPoints = players.reduce((sum, p) => sum + p.points, 0);
    totalPoints += captain.points; // Captain gets 2x points
    totalPoints += viceCaptain.points * 0.5; // Vice-captain gets 1.5x points
    return totalPoints;
  }

  private calculateTeamConfidence(recommendations: AIPlayerRecommendation[]): number {
    if (recommendations.length === 0) return 50;
    const avgConfidence = recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length;
    return Math.round(avgConfidence * 100);
  }

  private generateTeamReasoning(recommendations: AIPlayerRecommendation[], strategy: string): string {
    if (recommendations.length === 0) return `${strategy} strategy applied with available players.`;
    
    const topReasons = recommendations
      .slice(0, 3)
      .map(r => `${r.player.name}: ${r.reason}`)
      .join(' ');
    
    return `${strategy} strategy applied. ${topReasons}`;
  }

  private generateFallbackResponse(message: string): string {
    const fallbackResponses = [
      "I'd be happy to help with your team selection! However, I'm experiencing some technical difficulties at the moment. Please try again later.",
      "That's an interesting question about cricket strategy! While I can't provide AI-powered insights right now, I recommend considering player form, pitch conditions, and recent performance.",
      "Great question! For the best team selection advice, consider factors like player credits, recent form, pitch conditions, and weather. Try asking me again in a moment!"
    ];

    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }

  private getFallbackAnalysis(matchData: SportRadarMatch): MatchAnalysis {
    // Return a basic analysis structure when AI fails
    return {
      matchPrediction: {
        winnerPrediction: 'Unable to predict due to technical issues',
        confidence: 50,
        scoreRange: {
          team1: { min: 150, max: 200 },
          team2: { min: 150, max: 200 }
        },
        matchType: 'balanced',
        keyFactors: ['Match analysis temporarily unavailable']
      },
      playerRecommendations: {
        core: [],
        hedge: [],
        avoid: []
      },
      captaincy: {
        primary: {
          name: 'Analysis unavailable',
          reason: 'Technical difficulties',
          confidence: 50
        },
        secondary: {
          name: 'Analysis unavailable',
          reason: 'Technical difficulties',
          confidence: 50
        },
        differential: {
          name: 'Analysis unavailable',
          reason: 'Technical difficulties',
          risk: 'unknown'
        }
      },
      conditions: {
        pitchAnalysis: 'Analysis temporarily unavailable',
        weatherImpact: 'Analysis temporarily unavailable',
        venueHistory: 'Analysis temporarily unavailable',
        tossImpact: 'Analysis temporarily unavailable'
      },
      strategy: {
        roleDistribution: {
          batsmen: 4,
          bowlers: 4,
          allRounders: 2,
          wicketKeepers: 1
        },
        teamBalance: 'Balanced approach recommended',
        riskProfile: 'balanced',
        keyInsights: ['AI analysis temporarily unavailable']
      },
      tournament: {
        context: 'Match context analysis unavailable',
        importance: 'Standard importance',
        teamMotivation: 'Analysis unavailable'
      }
    };
  }
}

export const aiService = new AIService();
