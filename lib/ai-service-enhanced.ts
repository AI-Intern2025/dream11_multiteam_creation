import { openAIService } from './openai';
import { geminiService } from './gemini';
import { neonDB, Player, Match } from './neon-db';
import { SportRadarMatch, SportRadarPlayer } from './sportradar';
import { MatchAnalysis } from './openai';

// Import Dream11 validation from data-integration
import Dream11TeamValidator, { DREAM11_RULES, TeamComposition } from './dream11-validator';

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
    // For same-xi strategy
    players?: any[];
    combos?: Array<{
      captain: string;
      viceCaptain: string;
      percentage: number;
    }>;
    // For Strategy 3 user inputs and analysis
    userPredictions?: any;
    matchConditions?: {
      format: string;
      pitch: string;
      weather: string;
      venue: string;
    };
    team1Name?: string;
    team2Name?: string;
    aiAnalysis?: any;
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
  reasoning?: string;
  insights?: string[];
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
      // Handle same-xi strategy specially
      if (request.strategy === 'same-xi' && request.userPreferences?.players && request.userPreferences?.combos) {
        return this.generateSameXITeams(request);
      }

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
    // Get a valid Dream11 team composition
    const validCompositions = Dream11TeamValidator.generateValidTeamCompositions();
    const targetComposition = validCompositions[teamIndex % validCompositions.length];
    
    const selectedPlayers: Player[] = [];
    let totalCredits = 0;
    const maxCredits = DREAM11_RULES.maxCredits;
    
    // Track team counts to enforce max 7 from one team
    const teamCounts: Record<string, number> = {};
    
    // Group recommendations by role
    const playersByRole = this.groupRecommendationsByRole(recommendations);
    
    // Role balance tracking with Dream11 rules
    const roleBalance = { batsmen: 0, bowlers: 0, allRounders: 0, wicketKeepers: 0 };

    // Select players for each role according to target composition
    Object.entries(targetComposition).forEach(([role, count]) => {
      const rolePlayers = playersByRole[role as keyof typeof playersByRole] || [];
      
      // Apply strategy-specific selection logic
      const strategyFilteredPlayers = this.applyStrategyFiltering(rolePlayers, request, teamIndex);
      
      let selected = 0;
      for (const rec of strategyFilteredPlayers) {
        if (selected >= count) break;
        
        const player = rec.player;
        const playerCredits = player.credits || 8;
        const playerTeam = player.team_name || 'Unknown';
        
        // Check Dream11 constraints
        if (totalCredits + playerCredits <= maxCredits &&
            (teamCounts[playerTeam] || 0) < DREAM11_RULES.maxPlayersFromOneTeam) {
          
          selectedPlayers.push(player);
          totalCredits += playerCredits;
          teamCounts[playerTeam] = (teamCounts[playerTeam] || 0) + 1;
          selected++;
          
          // Update role balance
          this.updateRoleBalance(roleBalance, role);
        }
      }
    });

    // Ensure exactly 11 players by adding remaining from recommendations
    for (const rec of recommendations) {
      if (selectedPlayers.length >= DREAM11_RULES.totalPlayers) break;
      const p = rec.player;
      if (selectedPlayers.includes(p)) continue;
      selectedPlayers.push(p);
      const c = p.credits || 8;
      totalCredits += c;
      const teamName = p.team_name;
      teamCounts[teamName] = (teamCounts[teamName] || 0) + 1;
      this.updateRoleBalance(roleBalance, Dream11TeamValidator.normalizeRole(p.player_role || ''));
    }

    // If still under 11 players after fill, fallback
    if (selectedPlayers.length < DREAM11_RULES.totalPlayers) {
      console.warn(`Only ${selectedPlayers.length} players selected, using fallback team`);
      return this.generateFallbackTeam(recommendations, request, teamIndex);
    }

    // Validate the team
    const validation = Dream11TeamValidator.validateTeamComposition(selectedPlayers);
    if (!validation.isValid) {
      // AI team validation failed, falling back silently
      return this.generateFallbackTeam(recommendations, request, teamIndex);
    }

    // Select captain and vice-captain
    const { captain, viceCaptain } = this.selectCaptainAndViceCaptain(selectedPlayers, recommendations, request, teamIndex);

    return {
      players: selectedPlayers,
      captain,
      viceCaptain,
      totalCredits,
      roleBalance,
      riskScore: this.calculateRiskScore(selectedPlayers, request),
      expectedPoints: this.calculateExpectedPoints(selectedPlayers),
      confidence: this.calculateTeamConfidence(selectedPlayers, recommendations),
      insights: this.generateTeamInsights(selectedPlayers, request.strategy)
    };
  }

  private groupRecommendationsByRole(recommendations: AIPlayerRecommendation[]): Record<string, AIPlayerRecommendation[]> {
    const grouped: Record<string, AIPlayerRecommendation[]> = { WK: [], BAT: [], AR: [], BWL: [] };
    
    recommendations.forEach(rec => {
      const normalizedRole = Dream11TeamValidator.normalizeRole(rec.player.player_role || 'BAT');
      if (grouped[normalizedRole]) {
        grouped[normalizedRole].push(rec);
      }
    });
    
    return grouped;
  }

  private updateRoleBalance(roleBalance: any, role: string): void {
    switch (role) {
      case 'WK':
        roleBalance.wicketKeepers++;
        break;
      case 'BAT':
        roleBalance.batsmen++;
        break;
      case 'AR':
        roleBalance.allRounders++;
        break;
      case 'BWL':
        roleBalance.bowlers++;
        break;
    }
  }

  private generateFallbackTeam(
    recommendations: AIPlayerRecommendation[],
    request: TeamGenerationRequest,
    teamIndex: number
  ): AITeamAnalysis {
    // Generate a basic valid team with 1-4-2-4 composition
    const fallbackComposition = { WK: 1, BAT: 4, AR: 2, BWL: 4 };
    const playersByRole = this.groupRecommendationsByRole(recommendations);
    const selectedPlayers: Player[] = [];
    
    Object.entries(fallbackComposition).forEach(([role, count]) => {
      const rolePlayers = playersByRole[role] || [];
      const selected = rolePlayers.slice(0, count).map(rec => rec.player);
      selectedPlayers.push(...selected);
    });

    // Ensure we have exactly 11 players
    while (selectedPlayers.length < 11) {
      const availablePlayers = recommendations.filter(rec => 
        !selectedPlayers.some(p => p.id === rec.player.id)
      );
      if (availablePlayers.length > 0) {
        selectedPlayers.push(availablePlayers[0].player);
      } else {
        break;
      }
    }

    // If still under 11 players after fill, fallback
    if (selectedPlayers.length < 11) {
      console.warn(`Only ${selectedPlayers.length} players selected, using fallback team`);
      return this.generateFallbackTeam(recommendations, request, teamIndex);
    }

    const captain = selectedPlayers[0];
    const viceCaptain = selectedPlayers[1];

    return {
      players: selectedPlayers.slice(0, 11),
      captain,
      viceCaptain,
      totalCredits: Math.min(100, selectedPlayers.reduce((sum, p) => sum + (p.credits || 8), 0)),
      roleBalance: { batsmen: 4, bowlers: 4, allRounders: 2, wicketKeepers: 1 },
      riskScore: 50,
      expectedPoints: 400,
      confidence: 70,
      insights: ['Fallback team generated due to validation issues']
    };
  }

  private async generateSameXITeams(request: TeamGenerationRequest): Promise<AITeamAnalysis[]> {
    const { players, combos } = request.userPreferences!;
    const teams: AITeamAnalysis[] = [];
    
    if (!players || !combos || players.length !== 11) {
      throw new Error('Invalid same-xi data: need exactly 11 players and valid combos');
    }

    // Calculate how many teams for each combination based on percentage
    const teamCounts = combos.map(combo => {
      return {
        ...combo,
        count: Math.round((combo.percentage / 100) * request.teamCount)
      };
    });

    // Generate teams for each combination
    let teamIndex = 1;
    for (const comboData of teamCounts) {
      for (let i = 0; i < comboData.count; i++) {
        // Find captain and vice-captain from the selected players
        const captain = players.find(p => p.name === comboData.captain);
        const viceCaptain = players.find(p => p.name === comboData.viceCaptain);
        
        if (!captain || !viceCaptain) {
          console.warn(`Could not find captain (${comboData.captain}) or vice-captain (${comboData.viceCaptain}) in selected players`);
          continue;
        }

        // Calculate team metrics
        const totalCredits = players.reduce((sum: number, p: any) => sum + (p.credits || 9), 0);
        const roleBalance = this.calculateRoleBalance(players);
        const riskScore = this.calculateRiskScore(players, request);
        const expectedPoints = this.calculateExpectedPoints(players);
        // Default confidence for Same XI teams
        const confidence = 70;

        teams.push({
          players: [...players], // Create a copy
          captain,
          viceCaptain,
          totalCredits,
          roleBalance,
          riskScore,
          expectedPoints,
          confidence,
          reasoning: `Same XI strategy: Team ${teamIndex} with ${captain.name} (C) and ${viceCaptain.name} (VC)`
        });

        teamIndex++;
      }
    }

    return teams;
  }

  private calculateRoleBalance(players: any[]): { batsmen: number; bowlers: number; allRounders: number; wicketKeepers: number } {
    return players.reduce((balance, player) => {
      switch (player.player_role) {
        case 'BAT': balance.batsmen++; break;
        case 'BWL': balance.bowlers++; break;
        case 'AR': balance.allRounders++; break;
        case 'WK': balance.wicketKeepers++; break;
      }
      return balance;
    }, { batsmen: 0, bowlers: 0, allRounders: 0, wicketKeepers: 0 });
  }

  private applyStrategyFiltering(
    rolePlayers: AIPlayerRecommendation[],
    request: TeamGenerationRequest,
    teamIndex: number
  ): AIPlayerRecommendation[] {
    // Sort by confidence and apply strategy-specific logic
    let filtered = [...rolePlayers].sort((a, b) => b.confidence - a.confidence);
    
    switch (request.strategy) {
      case 'core-hedge':
        // Prefer core players with high confidence
        filtered = filtered.filter(p => p.role === 'core' || p.confidence > 70);
        break;
      case 'differential':
        // Mix of safe and differential picks
        const safeCount = Math.ceil(filtered.length * 0.6);
        const differential = filtered.slice(safeCount);
        filtered = [...filtered.slice(0, safeCount), ...differential];
        break;
      case 'stats-driven':
        // High confidence players only
        filtered = filtered.filter(p => p.confidence > 65);
        break;
      default:
        // Default balanced approach
        break;
    }
    
    return filtered;
  }

  private selectCaptainAndViceCaptain(
    players: Player[],
    recommendations: AIPlayerRecommendation[],
    request: TeamGenerationRequest,
    teamIndex: number = 0
  ): { captain: Player; viceCaptain: Player } {
    // 1. Explicit user preference
    if (request.userPreferences?.captain && request.userPreferences?.viceCaptain) {
      const cap = players.find(p => p.name === request.userPreferences!.captain) || players[0];
      const vc = players.find(p => p.name === request.userPreferences!.viceCaptain) || players[1];
      return { captain: cap, viceCaptain: vc };
    }

    // 2. Bias towards team predicted to score more with batting priority
    if (request.userPreferences?.userPredictions && request.userPreferences.team1Name && request.userPreferences.team2Name) {
      const preds = request.userPreferences.userPredictions;
      // Map predicted runs to numeric for comparison
      let teamARuns = 0;
      let teamBRuns = 0;
      const runMap: Record<string, number> = { high: 3, medium: 2, low: 1 };
      if (preds.teamA.runsExpected) {
        teamARuns = runMap[preds.teamA.runsExpected] || 0;
        teamBRuns = runMap[preds.teamB.runsExpected] || 0;
      } else if (preds.teamA.runs50Overs) {
        teamARuns = parseInt(preds.teamA.runs50Overs) || 0;
        teamBRuns = parseInt(preds.teamB.runs50Overs) || 0;
      } else if (preds.teamA.firstInnings) {
        teamARuns = (parseInt(preds.teamA.firstInnings) || 0) + (parseInt(preds.teamA.secondInnings) || 0);
        teamBRuns = (parseInt(preds.teamB.firstInnings) || 0) + (parseInt(preds.teamB.secondInnings) || 0);
      }
      const preferredTeam = teamARuns >= teamBRuns ? request.userPreferences.team1Name! : request.userPreferences.team2Name!;
      // Filter players from preferred team
      const teamPlayers = players.filter(p => p.team_name === preferredTeam);
      if (teamPlayers.length > 0) {
        // Prioritize batters and all-rounders
        const battingCandidates = teamPlayers.filter(p => p.player_role === 'BAT' || p.player_role === 'AR');
        const capPool = battingCandidates.length > 0 ? battingCandidates : teamPlayers;
        // Score candidates by captaincy_score
        const scoredCaps = capPool.map(p => ({ p, score: recommendations.find(r => r.player.id === p.id)?.captaincy_score || 0 }))
                           .sort((a, b) => b.score - a.score);
        // Rotate captain selection
        const cap = scoredCaps[teamIndex % scoredCaps.length]?.p || scoredCaps[0]?.p;
        let vc: Player;
        if (scoredCaps.length > 1) {
          // Rotate vice-captain among top candidates
          vc = scoredCaps[(teamIndex + 1) % scoredCaps.length]?.p || scoredCaps[1]?.p;
        } else {
          // Fallback vice-captain from overall highest captaincy_score excluding cap
          const globalScored = players.map(p => ({ p, score: recommendations.find(r => r.player.id === p.id)?.captaincy_score || 0 }))
                                   .sort((a, b) => b.score - a.score);
          vc = globalScored.find(item => item.p.id !== cap.id)?.p || cap;
        }
        return { captain: cap, viceCaptain: vc };
      }
    }

    // 3. Default: sort all by captaincy_score and rotate
    const playersWithScores = players.map(player => {
      const rec = recommendations.find(r => r.player.id === player.id);
      return { player, score: rec?.captaincy_score || 0 };
    }).sort((a, b) => b.score - a.score);
    const cap = playersWithScores[teamIndex % playersWithScores.length]?.player || players[0];
    const vc = playersWithScores[(teamIndex+1) % playersWithScores.length]?.player || players[1];
    return { captain: cap, viceCaptain: vc };
  }

  private calculateRiskScore(players: Player[], request: TeamGenerationRequest): number {
    // Calculate team risk based on player selection and credits
    const totalCredits = players.reduce((sum, p) => sum + (p.credits || 8), 0);
    const avgCredits = totalCredits / players.length;
    
    // Higher average credits = higher risk
    const creditRisk = (avgCredits - 7) * 10; // Base risk from credits
    
    // Strategy-specific risk adjustments
    let strategyRisk = 0;
    switch (request.strategy) {
      case 'differential':
        strategyRisk = 20;
        break;
      case 'core-hedge':
        strategyRisk = -10;
        break;
      case 'stats-driven':
        strategyRisk = -5;
        break;
    }
    
    return Math.max(0, Math.min(100, 50 + creditRisk + strategyRisk));
  }

  private calculateExpectedPoints(players: Player[]): number {
    return players.reduce((sum, p) => sum + (p.points || 50), 0);
  }

  private calculateTeamConfidence(players: Player[], recommendations: AIPlayerRecommendation[]): number {
    const confidenceScores = players.map(player => {
      const rec = recommendations.find(r => r.player.id === player.id);
      return rec?.confidence || 70;
    });
    
    return Math.round(confidenceScores.reduce((sum, c) => sum + c, 0) / confidenceScores.length);
  }

  private generateTeamInsights(players: Player[], strategy: string): string[] {
    const insights: string[] = [];
    
    // Role balance insights
    const composition = Dream11TeamValidator.getTeamComposition(players);
    insights.push(`Team composition: ${composition.WK} WK, ${composition.BAT} BAT, ${composition.AR} AR, ${composition.BWL} BWL`);
    
    // Credit distribution
    const totalCredits = players.reduce((sum, p) => sum + (p.credits || 8), 0);
    insights.push(`Total credits used: ${totalCredits}/100`);
    
    // Strategy-specific insights
    switch (strategy) {
      case 'core-hedge':
        insights.push('Balanced risk approach with core players and hedge picks');
        break;
      case 'differential':
        insights.push('High-risk, high-reward strategy with differential players');
        break;
      case 'stats-driven':
        insights.push('Data-driven selection based on statistical analysis');
        break;
    }
    
    return insights;
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
