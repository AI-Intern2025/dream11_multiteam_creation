import { openAIService } from './openai';
import { geminiService } from './gemini';
import { neonDB, Player, Match } from './neon-db';
import { SportRadarMatch, SportRadarPlayer } from './sportradar';
import { MatchAnalysis } from './openai';
// Import preset strategy service for Strategy 6
import { presetStrategyService } from './preset-strategy-service';

// Import Dream11 validation from data-integration
import Dream11TeamValidator, { DREAM11_RULES, TeamComposition } from './dream11-validator';

type AIProvider = 'openai' | 'gemini';

export interface TeamGenerationRequest {
  matchId: number;
  strategy: string;
  teamCount: number;
  userPreferences?: {
    // Core-Hedge picks for Strategy 4
    corePlayers?: string[]; // 75%+ teams - safe picks
    hedgePlayers?: string[]; // ~50% teams - risk/reward picks  
    differentialPlayers?: string[]; // 1-2 teams - high differential
    corePercentage?: number; // percentage of teams with core players
    hedgePercentage?: number; // percentage of teams with hedge players
    // Strategy 5 - Enhanced Stats-driven filters
    filters?: {
      // Core Statistical Filters
      dreamTeamPercentage: { min: number; max: number };
      selectionPercentage?: { min: number; max: number };
      averagePoints?: { min: number; max: number };
      credits?: { min: number; max: number };
      
      // Advanced Performance Filters
      recentForm?: { min: number; max: number }; // Last 5 matches performance
      consistencyScore?: { min: number; max: number }; // Variance in performance
      versatilityScore?: { min: number; max: number }; // Multi-format performance
      injuryRisk?: { min: number; max: number }; // 1-10 scale (1=high risk, 10=low risk)
      
      // Venue & Conditions Filters
      venuePerformance?: { min: number; max: number }; // Performance at specific venues
      pitchSuitability?: { min: number; max: number }; // Batting/bowling friendly pitch scores
      weatherAdaptability?: { min: number; max: number }; // Performance in different conditions
      
      // Opposition & Matchup Filters
      oppositionStrength?: { min: number; max: number }; // Performance vs strong/weak teams
      headToHeadRecord?: { min: number; max: number }; // H2H performance vs specific teams
      captainPotential?: { min: number; max: number }; // Leadership and clutch performance
      
      // Fantasy-Specific Filters
      ownershipProjection?: { min: number; max: number }; // Expected ownership %
      priceEfficiency?: { min: number; max: number }; // Points per credit ratio
      upsetPotential?: { min: number; max: number }; // Likelihood of surprise performance
      
      // ML-Based Predictions
      mlPredictedPoints?: { min: number; max: number }; // ML model predictions
      mlConfidenceScore?: { min: number; max: number }; // Model confidence (0-1)
      performanceVolatility?: { min: number; max: number }; // Expected variance in performance
      
      // Role-based constraints
      playerRoles: {
        batsmen: { min: number; max: number };
        bowlers: { min: number; max: number };
        allRounders: { min: number; max: number };
        wicketKeepers: { min: number; max: number };
      };
    };
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
    // For Strategy 6 preset scenarios
    preset?: {
      id: string;
      name: string;
      description: string;
      strategy: string;
      focus: Record<string, any>;
      riskLevel: 'low' | 'medium' | 'high';
      tags: string[];
      constraints: any;
    };
    teamNames?: {
      teamA: string;
      teamB: string;
    };
    // For Strategy 8 base team + rule-based edits
    baseTeam?: Player[];
    optimizationRules?: {
      primaryParameter: 'dreamTeamPercentage' | 'selectionPercentage' | 'averagePoints';
      guardrails: {
        maxPerRole: {
          batsmen: number;
          bowlers: number;
          allRounders: number;
          wicketKeepers: number;
        };
        maxPerTeam: {
          teamA: number;
          teamB: number;
        };
        minCredits: number;
        maxCredits: number;
      };
      preferences: {
        bowlingStyle: 'pace-heavy' | 'spin-heavy' | 'balanced';
        battingOrder: 'top-heavy' | 'middle-heavy' | 'balanced';
        riskTolerance: 'conservative' | 'medium' | 'aggressive';
      };
      editIntensity: 'minor' | 'moderate' | 'major';
    };
    summary?: string;
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

export class AIService {
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

      // Handle preset scenarios strategy (Strategy 6)
      if (request.strategy === 'preset-scenarios' && request.userPreferences?.preset) {
        return this.generatePresetScenarioTeams(request);
      }

      // Handle base team + rule-based edits (Strategy 8)
      if ((request.strategy === 'base-edit' || request.strategy === 'strategy8' || request.strategy === 'iterative-editing') && 
          request.userPreferences?.baseTeam && request.userPreferences?.optimizationRules) {
        return this.generateBaseTeamVariations(request);
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
    // Strategy 4: Core-Hedge comprehensive implementation
    if (request.strategy === 'core-hedge' && request.userPreferences) {
      return this.generateCoreHedgeTeam(recommendations, request, teamIndex);
    }

    // Strategy 5: Stats-Driven Guardrails implementation
    if (request.strategy === 'stats-driven' && request.userPreferences) {
      return await this.generateStatsGuardrailsTeam(recommendations, request, teamIndex);
    }

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
      const roleCount = count as number;
      const rolePlayers = playersByRole[role as keyof typeof playersByRole] || [];
      
      // Apply strategy-specific selection logic
      const strategyFilteredPlayers = this.applyStrategyFiltering(rolePlayers, request, teamIndex);
      
      let selected = 0;
      for (const rec of strategyFilteredPlayers) {
        if (selected >= roleCount) break;
        
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
    const { captain, viceCaptain } = this.forceVariedCaptainSelection(selectedPlayers, recommendations, request, teamIndex);

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
    console.log(`🚨 Generating fallback team ${teamIndex + 1} from ${recommendations.length} recommendations`);
    
    // Generate a basic valid team with 1-4-2-4 composition
    const fallbackComposition = { WK: 1, BAT: 4, AR: 2, BWL: 4 };
    const playersByRole = this.groupRecommendationsByRole(recommendations);
    const selectedPlayers: Player[] = [];
    
    // First, try to get players according to the fallback composition
    Object.entries(fallbackComposition).forEach(([role, count]) => {
      const rolePlayers = playersByRole[role] || [];
      const selected = rolePlayers.slice(0, count).map(rec => rec.player);
      selectedPlayers.push(...selected);
    });

    // Fill remaining slots with any available players
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

    // If we still don't have 11 players, generate dummy players to avoid crashes
    if (selectedPlayers.length < 11) {
      console.warn(`⚠️ Only ${selectedPlayers.length} players available, generating dummy players to fill team`);
      
      // Generate dummy players to fill the team
      const remainingSlots = 11 - selectedPlayers.length;
      for (let i = 0; i < remainingSlots; i++) {
        const dummyPlayer: Player = {
          id: 1000 + i, // Use numeric ID for dummy players
          name: `Dummy Player ${i + 1}`,
          full_name: `Dummy Player ${i + 1}`,
          team_name: 'Unknown',
          player_role: 'BAT',
          credits: 8,
          selection_percentage: 0,
          points: 0,
          is_playing_today: true,
          country: 'Unknown',
          batting_style: 'Right-hand bat',
          bowling_style: 'Right-arm medium',
          dream_team_percentage: 0
        };
        selectedPlayers.push(dummyPlayer);
      }
      
      console.log(`✅ Fallback team filled with ${selectedPlayers.length} players (${remainingSlots} dummy players)`);
    }

    // Ensure we have exactly 11 players
    const finalPlayers = selectedPlayers.slice(0, 11);
    const captain = finalPlayers[0];
    const viceCaptain = finalPlayers[1];

    return {
      players: finalPlayers,
      captain,
      viceCaptain,
      totalCredits: Math.min(100, finalPlayers.reduce((sum, p) => sum + (p.credits || 8), 0)),
      roleBalance: { batsmen: 4, bowlers: 4, allRounders: 2, wicketKeepers: 1 },
      riskScore: 50,
      expectedPoints: 400,
      confidence: 70,
      insights: ['Fallback team generated due to validation issues']
    };
  }

  private generateCoreHedgeTeam(
    recommendations: AIPlayerRecommendation[],
    request: TeamGenerationRequest,
    teamIndex: number
  ): AITeamAnalysis {
    const prefs = request.userPreferences!;
    const selectedPlayers: Player[] = [];
    
    // Get player objects from names
    const getPlayersFromNames = (names: string[]): Player[] => {
      return names.map(name => 
        recommendations.find(r => r.player.name === name)?.player
      ).filter((p): p is Player => !!p);
    };

    // 1. Core Players (75%+ teams) - Always include
    const corePlayerObjs = getPlayersFromNames(prefs.corePlayers || []);
    selectedPlayers.push(...corePlayerObjs);

    // 2. Hedge Players (~50% teams) - Include based on team index rotation
    const hedgePlayerObjs = getPlayersFromNames(prefs.hedgePlayers || []);
    const hedgePercentage = prefs.hedgePercentage || 50;
    const includeHedge = (teamIndex * 100 / request.teamCount) < hedgePercentage;
    
    if (includeHedge && hedgePlayerObjs.length > 0) {
      // Rotate through hedge players for variation
      const hedgeCount = Math.min(
        hedgePlayerObjs.length,
        DREAM11_RULES.totalPlayers - selectedPlayers.length - 1 // leave room for differential
      );
      for (let i = 0; i < hedgeCount; i++) {
        const hedgeIndex = (teamIndex + i) % hedgePlayerObjs.length;
        const hedgePlayer = hedgePlayerObjs[hedgeIndex];
        if (!selectedPlayers.find(p => p.id === hedgePlayer.id)) {
          selectedPlayers.push(hedgePlayer);
        }
      }
    }

    // 3. Differential Players (1-2 teams) - Very selective inclusion
    const differentialPlayerObjs = getPlayersFromNames(prefs.differentialPlayers || []);
    const isDifferentialTeam = teamIndex < 2; // Only first 1-2 teams get differentials
    
    if (isDifferentialTeam && differentialPlayerObjs.length > 0) {
      const diffPlayer = differentialPlayerObjs[teamIndex % differentialPlayerObjs.length];
      if (!selectedPlayers.find(p => p.id === diffPlayer.id)) {
        selectedPlayers.push(diffPlayer);
      }
    }

    // 4. Fill remaining slots with top recommendations (ensuring Dream11 rules)
    const remainingSlots = DREAM11_RULES.totalPlayers - selectedPlayers.length;
    const usedPlayerIds = new Set(selectedPlayers.map(p => p.id));
    const availableRecs = recommendations.filter(rec => !usedPlayerIds.has(rec.player.id));
    
    // Track team counts and credits for Dream11 validation
    let totalCredits = selectedPlayers.reduce((sum, p) => sum + (p.credits || 8), 0);
    const teamCounts: Record<string, number> = {};
    selectedPlayers.forEach(p => {
      const team = p.team_name || 'Unknown';
      teamCounts[team] = (teamCounts[team] || 0) + 1;
    });

    // Fill remaining slots with valid players
    for (let i = 0; i < remainingSlots && availableRecs.length > 0; i++) {
      const rec = availableRecs[i];
      const player = rec.player;
      const playerCredits = player.credits || 8;
      const playerTeam = player.team_name || 'Unknown';
      
      // Check Dream11 constraints
      if (totalCredits + playerCredits <= DREAM11_RULES.maxCredits &&
          (teamCounts[playerTeam] || 0) < DREAM11_RULES.maxPlayersFromOneTeam) {
        selectedPlayers.push(player);
        totalCredits += playerCredits;
        teamCounts[playerTeam] = (teamCounts[playerTeam] || 0) + 1;
      }
    }

    // Ensure we have exactly 11 players
    while (selectedPlayers.length < DREAM11_RULES.totalPlayers) {
      const fallbackPlayer = recommendations.find(rec => 
        !selectedPlayers.some(p => p.id === rec.player.id)
      )?.player;
      if (fallbackPlayer) {
        selectedPlayers.push(fallbackPlayer);
      } else {
        break;
      }
    }

    // Validate team composition
    const validation = Dream11TeamValidator.validateTeamComposition(selectedPlayers);
    if (!validation.isValid) {
      console.warn('Core-hedge team validation failed, using fallback');
      return this.generateFallbackTeam(recommendations, request, teamIndex);
    }

    // Select captain and vice-captain using combos
    const { captain, viceCaptain } = this.forceVariedCaptainSelection(selectedPlayers, recommendations, request, teamIndex);

    // Calculate team insights
    const coreCount = selectedPlayers.filter(p => 
      corePlayerObjs.some(core => core.id === p.id)
    ).length;
    const hedgeCount = selectedPlayers.filter(p => 
      hedgePlayerObjs.some(hedge => hedge.id === p.id)
    ).length;
    const diffCount = selectedPlayers.filter(p => 
      differentialPlayerObjs.some(diff => diff.id === p.id)
    ).length;

    const insights = [
      `Core-hedge strategy: ${coreCount} core, ${hedgeCount} hedge, ${diffCount} differential players`,
      `Team ${teamIndex + 1}: ${includeHedge ? 'Includes hedge picks' : 'Core-focused team'}`,
      `${isDifferentialTeam ? 'Differential team with unique picks' : 'Standard core-hedge balance'}`
    ];

    return {
      players: selectedPlayers.slice(0, DREAM11_RULES.totalPlayers),
      captain,
      viceCaptain,
      totalCredits: selectedPlayers.reduce((sum, p) => sum + (p.credits || 8), 0),
      roleBalance: this.calculateTeamRoleBalance(selectedPlayers),
      riskScore: this.calculateRiskScore(selectedPlayers, request),
      expectedPoints: this.calculateExpectedPoints(selectedPlayers),
      confidence: this.calculateTeamConfidence(selectedPlayers, recommendations),
      insights,
      reasoning: `Core-hedge team ${teamIndex + 1} with ${coreCount}/${hedgeCount}/${diffCount} core/hedge/diff split`
    };
  }

  private async generateStatsGuardrailsTeam(
    recommendations: AIPlayerRecommendation[],
    request: TeamGenerationRequest,
    teamIndex: number
  ): Promise<AITeamAnalysis> {
    console.log(`🔍 Generating ML-enhanced stats-driven team ${teamIndex + 1} of ${request.teamCount}`);
    
    const filters = request.userPreferences?.filters;
    if (!filters) {
      console.warn('No filters provided, using fallback');
      return this.generateFallbackTeam(recommendations, request, teamIndex);
    }

    // Import ML optimization service
    const { mlOptimizationService } = await import('./ml-optimization');
    
    // Extract players from recommendations
    const players = recommendations.map(rec => rec.player);
    
    // Create match context for ML optimization
    const matchContext = {
      matchId: request.matchId,
      venue: 'Wankhede Stadium, Mumbai', // This should come from match data
      pitchType: 'balanced' as const,
      weatherCondition: 'clear' as const,
      team1: 'India',
      team2: 'Australia',
      matchFormat: 'T20' as const,
      recentHead2Head: []
    };
    
    // Generate ML scores for all players
    console.log('🤖 Generating ML player scores...');
    const mlScores = await mlOptimizationService.generateMLPlayerScores(players, matchContext);
    
    // Apply enhanced statistical filters
    const filteredRecommendations = this.applyEnhancedStatsFilters(recommendations, mlScores, filters);
    console.log(`📊 Enhanced filtering: ${filteredRecommendations.length} players from ${recommendations.length} total`);
    
    if (filteredRecommendations.length === 0) {
      console.warn('No players match the enhanced statistical filters, using fallback with original recommendations');
      return this.generateFallbackTeam(recommendations, request, teamIndex);
    }

    // Use ML optimization if enough players available
    if (filteredRecommendations.length >= 15) {
      console.log('🤖 Using ML optimization for team generation');
      return this.generateMLOptimizedTeam(filteredRecommendations, mlScores, matchContext, filters, request, teamIndex);
    } else {
      console.log('📊 Using traditional stats-driven approach');
      return this.generateTeamFromFilteredRecommendations(filteredRecommendations, recommendations, filters, request, teamIndex);
    }
  }

  /**
   * Apply enhanced statistical filters with ML scores
   */
  private applyEnhancedStatsFilters(
    recommendations: AIPlayerRecommendation[],
    mlScores: any[],
    filters: any
  ): AIPlayerRecommendation[] {
    console.log(`🔍 Applying enhanced statistical filters to ${recommendations.length} players`);
    
    const filtered = recommendations.filter(rec => {
      const player = rec.player;
      const mlScore = mlScores.find(score => score.playerId === player.id);
      
      if (!mlScore) return false;
      
      // Core filters - these should always be applied
      const dreamTeamPct = player.dream_team_percentage || 0;
      const selectionPct = player.selection_percentage || 0;
      const avgPoints = player.points || 0;
      const credits = player.credits || 8;
      
      // Apply core filters
      let passes = true;
      passes = passes && dreamTeamPct >= filters.dreamTeamPercentage.min && dreamTeamPct <= filters.dreamTeamPercentage.max;
      
      // Apply other filters only if they exist
      if (filters.selectionPercentage) {
        passes = passes && selectionPct >= filters.selectionPercentage.min && selectionPct <= filters.selectionPercentage.max;
      }
      if (filters.averagePoints) {
        passes = passes && avgPoints >= filters.averagePoints.min && avgPoints <= filters.averagePoints.max;
      }
      if (filters.credits) {
        passes = passes && credits >= filters.credits.min && credits <= filters.credits.max;
      }
      
      // Enhanced filters - only apply if provided
      if (filters.recentForm) {
        const recentForm = (player.recent_form_rating || 0) * 100;
        passes = passes && recentForm >= filters.recentForm.min && recentForm <= filters.recentForm.max;
      }
      if (filters.consistencyScore) {
        const consistencyScore = (player.consistency_score || 0) * 100;
        passes = passes && consistencyScore >= filters.consistencyScore.min && consistencyScore <= filters.consistencyScore.max;
      }
      if (filters.versatilityScore) {
        const versatilityScore = (player.versatility_score || 0) * 100;
        passes = passes && versatilityScore >= filters.versatilityScore.min && versatilityScore <= filters.versatilityScore.max;
      }
      if (filters.injuryRisk) {
        const injuryRisk = player.injury_risk_score || 5;
        passes = passes && injuryRisk >= filters.injuryRisk.min && injuryRisk <= filters.injuryRisk.max;
      }
      if (filters.venuePerformance) {
        const venuePerformance = (player.venue_performance || 0) * 100;
        passes = passes && venuePerformance >= filters.venuePerformance.min && venuePerformance <= filters.venuePerformance.max;
      }
      if (filters.mlPredictedPoints) {
        passes = passes && mlScore.predictedPoints >= filters.mlPredictedPoints.min && mlScore.predictedPoints <= filters.mlPredictedPoints.max;
      }
      if (filters.mlConfidenceScore) {
        const mlConfidence = mlScore.confidence * 100;
        passes = passes && mlConfidence >= filters.mlConfidenceScore.min && mlConfidence <= filters.mlConfidenceScore.max;
      }
      
      return passes;
    });
    
    console.log(`✅ Enhanced filtering: ${filtered.length} players passed all filters`);
    return filtered;
  }

  /**
   * Generate ML-optimized team
   */
  private async generateMLOptimizedTeam(
    filteredRecommendations: AIPlayerRecommendation[],
    mlScores: any[],
    matchContext: any,
    filters: any,
    request: TeamGenerationRequest,
    teamIndex: number
  ): Promise<AITeamAnalysis> {
    console.log(`🤖 Generating ML-optimized team ${teamIndex + 1}`);
    
    const { mlOptimizationService } = await import('./ml-optimization');
    
    // Extract players from filtered recommendations
    const players = filteredRecommendations.map(rec => rec.player);
    
    // Determine risk profile
    const riskProfile = request.userPreferences?.riskProfile || 'balanced';
    
    // Get ML-optimized team composition
    const optimization = await mlOptimizationService.optimizeTeamComposition(
      players,
      mlScores.filter(score => players.some(p => p.id === score.playerId)),
      matchContext,
      riskProfile
    );
    
    // Select captain and vice captain using ML scores
    const { captain, viceCaptain } = this.selectMLOptimizedCaptains(
      optimization.teamComposition,
      mlScores,
      teamIndex
    );
    
    // Calculate final team stats
    const totalCredits = optimization.teamComposition.reduce((sum, p) => sum + (p.credits || 8), 0);
    const roleBalance = this.calculateTeamRoleBalance(optimization.teamComposition);
    
    // Generate insights
    const insights = [
      `ML-optimized team with ${riskProfile} risk profile`,
      `Expected points: ${optimization.expectedPoints.toFixed(1)}`,
      `Risk score: ${(optimization.riskScore * 100).toFixed(1)}%`,
      `Confidence: ${(optimization.confidenceScore * 100).toFixed(1)}%`,
      `Diversity score: ${(optimization.diversityScore * 100).toFixed(1)}%`,
      ...optimization.reasoning
    ];
    
    return {
      players: optimization.teamComposition,
      captain,
      viceCaptain,
      totalCredits,
      roleBalance,
      riskScore: optimization.riskScore,
      expectedPoints: optimization.expectedPoints,
      confidence: optimization.confidenceScore,
      insights,
      reasoning: `ML-optimized team ${teamIndex + 1} using ${riskProfile} risk profile and advanced statistical filters`
    };
  }

  /**
   * Select captains using ML optimization
   */
  private selectMLOptimizedCaptains(
    players: Player[],
    mlScores: any[],
    teamIndex: number
  ): { captain: Player; viceCaptain: Player } {
    console.log(`🤖 Selecting ML-optimized captains for team ${teamIndex + 1}`);
    
    // Get ML scores for team players
    const teamScores = players.map(player => ({
      player,
      mlScore: mlScores.find(score => score.playerId === player.id)
    })).filter(item => item.mlScore);
    
    // Sort by captaincy potential and predicted points
    const captainCandidates = teamScores
      .filter(item => item.player.player_role === 'BAT' || item.player.player_role === 'AR' || item.player.player_role === 'WK')
      .sort((a, b) => {
        const aScore = (a.mlScore.captainPotential || 0) * 0.6 + (a.mlScore.predictedPoints || 0) * 0.4;
        const bScore = (b.mlScore.captainPotential || 0) * 0.6 + (b.mlScore.predictedPoints || 0) * 0.4;
        return bScore - aScore;
      });
    
    // Use fallback if no suitable candidates
    if (captainCandidates.length < 2) {
      const fallbackCandidates = teamScores.sort((a, b) => (b.mlScore.predictedPoints || 0) - (a.mlScore.predictedPoints || 0));
      return {
        captain: fallbackCandidates[0]?.player || players[0],
        viceCaptain: fallbackCandidates[1]?.player || players[1]
      };
    }
    
    // ML-based captain selection with variation
    let captainIndex = 0;
    let viceCaptainIndex = 1;
    
    // Use different ML-based algorithms for different teams
    if (teamIndex % 4 === 0) {
      // Highest ML captain potential
      captainIndex = 0;
      viceCaptainIndex = 1;
    } else if (teamIndex % 4 === 1) {
      // Highest predicted points
      const pointsSorted = [...captainCandidates].sort((a, b) => (b.mlScore.predictedPoints || 0) - (a.mlScore.predictedPoints || 0));
      captainIndex = captainCandidates.findIndex(c => c.player.id === pointsSorted[0].player.id);
      viceCaptainIndex = captainCandidates.findIndex(c => c.player.id === pointsSorted[1].player.id);
    } else if (teamIndex % 4 === 2) {
      // Best consistency-confidence combo
      const consistencySorted = [...captainCandidates].sort((a, b) => {
        const aScore = (a.mlScore.consistencyScore || 0) * 0.7 + (a.mlScore.confidence || 0) * 0.3;
        const bScore = (b.mlScore.consistencyScore || 0) * 0.7 + (b.mlScore.confidence || 0) * 0.3;
        return bScore - aScore;
      });
      captainIndex = captainCandidates.findIndex(c => c.player.id === consistencySorted[0].player.id);
      viceCaptainIndex = captainCandidates.findIndex(c => c.player.id === consistencySorted[1].player.id);
    } else {
      // Low ownership but high potential (differential picks)
      const differentialSorted = [...captainCandidates].sort((a, b) => {
        const aScore = (a.mlScore.upsetPotential || 0) * 0.8 + (a.mlScore.captainPotential || 0) * 0.2;
        const bScore = (b.mlScore.upsetPotential || 0) * 0.8 + (b.mlScore.captainPotential || 0) * 0.2;
        return bScore - aScore;
      });
      captainIndex = captainCandidates.findIndex(c => c.player.id === differentialSorted[0].player.id);
      viceCaptainIndex = captainCandidates.findIndex(c => c.player.id === differentialSorted[1].player.id);
    }
    
    const selectedCaptain = captainCandidates[captainIndex]?.player || players[0];
    const selectedViceCaptain = captainCandidates[viceCaptainIndex]?.player || players[1];
    
    // Final safety check - ensure captain and vice-captain are different players
    if (selectedCaptain.id === selectedViceCaptain.id && players.length > 1) {
      console.log(`⚠️ ML Captain and vice-captain were same player (${selectedCaptain.name}), forcing different selection`);
      // Find a different player for vice-captain
      const alternativeViceCaptain = players.find(p => p.id !== selectedCaptain.id) || players[1];
      return { captain: selectedCaptain, viceCaptain: alternativeViceCaptain };
    }
    
    return {
      captain: selectedCaptain,
      viceCaptain: selectedViceCaptain
    };
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

  // Stub methods for missing functionality
  private generateSameXITeams(request: TeamGenerationRequest): Promise<AITeamAnalysis[]> {
    // TODO: Implement same-xi strategy
    return Promise.resolve([]);
  }

  private async generatePresetScenarioTeams(request: TeamGenerationRequest): Promise<AITeamAnalysis[]> {
    const { preset, teamNames } = request.userPreferences!;
    
    if (!preset || !teamNames) {
      throw new Error('Invalid preset data: need preset configuration and team names');
    }

    console.log(`🎯 Generating preset scenario teams with: ${preset.name}`);

    try {
      // Use the preset strategy service to generate teams
      const teams = await presetStrategyService.generatePresetTeams({
        matchId: request.matchId,
        presetId: preset.id,
        teamCount: request.teamCount,
        teamNames,
        matchConditions: request.userPreferences?.matchConditions
      });

      return teams;
    } catch (error) {
      console.error('Error generating preset scenario teams:', error);
      // Fallback to regular team generation
      const recommendations = await this.generateAIPlayerRecommendations(request.matchId);
      const teams: AITeamAnalysis[] = [];

      for (let i = 0; i < request.teamCount; i++) {
        const team = await this.generateSingleTeam(recommendations, request, i);
        teams.push(team);
      }

      return teams;
    }
  }

  private applyStrategyFiltering(
    recommendations: AIPlayerRecommendation[],
    request: TeamGenerationRequest,
    teamIndex: number
  ): AIPlayerRecommendation[] {
    // TODO: Implement strategy-specific filtering
    return recommendations;
  }

  private forceVariedCaptainSelection(
    players: Player[],
    recommendations: AIPlayerRecommendation[],
    request: TeamGenerationRequest,
    teamIndex: number
  ): { captain: Player; viceCaptain: Player } {
    console.log(`🎯 Forcing varied captain selection for team ${teamIndex + 1}`);
    
    // Get all players with their captaincy scores
    const playersWithScores = players.map(player => {
      const rec = recommendations.find(r => r.player.id === player.id);
      const baseScore = rec?.captaincy_score || (player.points || 0) + (player.credits || 0) * 2;
      return { 
        player, 
        score: baseScore,
        role: player.player_role || 'BAT'
      };
    });

    // Sort by score
    playersWithScores.sort((a, b) => b.score - a.score);

    // Prefer batsmen and all-rounders for captaincy, but allow flexibility
    const captainCandidates = playersWithScores.filter(p => 
      p.role === 'BAT' || p.role === 'AR' || p.role === 'WK'
    );
    
    // If no batsmen/all-rounders, use top performers from any role
    const candidatePool = captainCandidates.length >= 2 ? captainCandidates : playersWithScores;
    
    console.log(`👑 Captain candidates: ${candidatePool.map(c => c.player.name).join(', ')}`);
    
    // AGGRESSIVE C/VC VARIATION: Use different algorithms for different teams
    let captainIndex = 0;
    let viceCaptainIndex = 1;
    
    if (candidatePool.length >= 2) {
      const poolSize = Math.min(candidatePool.length, 8); // Use top 8 candidates max
      
      if (teamIndex % 6 === 0) {
        // Team 1, 7, 13... - Top performer as captain, 2nd as VC
        captainIndex = 0;
        viceCaptainIndex = 1;
      } else if (teamIndex % 6 === 1) {
        // Team 2, 8, 14... - 2nd as captain, 3rd as VC
        captainIndex = Math.min(1, poolSize - 1);
        viceCaptainIndex = Math.min(2, poolSize - 1);
      } else if (teamIndex % 6 === 2) {
        // Team 3, 9, 15... - 3rd as captain, 1st as VC
        captainIndex = Math.min(2, poolSize - 1);
        viceCaptainIndex = 0;
      } else if (teamIndex % 6 === 3) {
        // Team 4, 10, 16... - 1st as captain, 4th as VC
        captainIndex = 0;
        viceCaptainIndex = Math.min(3, poolSize - 1);
      } else if (teamIndex % 6 === 4) {
        // Team 5, 11, 17... - 4th as captain, 2nd as VC
        captainIndex = Math.min(3, poolSize - 1);
        viceCaptainIndex = 1;
      } else {
        // Team 6, 12, 18... - Use seeded random selection
        const seed = teamIndex * 997;
        captainIndex = Math.abs(seed) % poolSize;
        viceCaptainIndex = Math.abs(seed * 31 + 17) % poolSize;
        
        // Ensure different captain and vice-captain
        if (captainIndex === viceCaptainIndex) {
          viceCaptainIndex = (viceCaptainIndex + 1) % poolSize;
        }
      }
    }
    
    const captain = candidatePool[captainIndex]?.player || players[0];
    const viceCaptain = candidatePool[viceCaptainIndex]?.player || players[1];
    
    // Final safety check - ensure captain and vice-captain are different players
    if (captain.id === viceCaptain.id && players.length > 1) {
      console.log(`⚠️ Captain and vice-captain were same player (${captain.name}), forcing different selection`);
      // Find a different player for vice-captain
      const alternativeViceCaptain = players.find(p => p.id !== captain.id) || players[1];
      console.log(`👑 Team ${teamIndex + 1} Selected: Captain ${captain.name} (${captain.player_role}), Vice-Captain ${alternativeViceCaptain.name} (${alternativeViceCaptain.player_role})`);
      return { captain, viceCaptain: alternativeViceCaptain };
    }
    
    console.log(`👑 Team ${teamIndex + 1} Selected: Captain ${captain.name} (${captain.player_role}), Vice-Captain ${viceCaptain.name} (${viceCaptain.player_role})`);
    
    return { captain, viceCaptain };
  }

  /**
   * Select captains from players who passed the statistical filters
   * This ensures captain rotation among the guardrails-compliant players
   */
  private selectCaptainsFromFilteredPlayers(
    filterPassingPlayers: Player[],
    teamIndex: number
  ): { captain: Player; viceCaptain: Player } {
    console.log(`🎯 Selecting captains from ${filterPassingPlayers.length} filter-passing players for team ${teamIndex + 1}`);
    
    if (filterPassingPlayers.length < 2) {
      console.warn('⚠️ Not enough filter-passing players for captain selection, using first available');
      return {
        captain: filterPassingPlayers[0] || { id: 0, name: 'Unknown', player_role: 'BAT' } as Player,
        viceCaptain: filterPassingPlayers[1] || filterPassingPlayers[0] || { id: 0, name: 'Unknown', player_role: 'BAT' } as Player
      };
    }
    
    // Filter for suitable captain candidates (BAT, AR, WK roles typically better for captaincy)
    const captainCandidates = filterPassingPlayers.filter(p => 
      p.player_role === 'BAT' || p.player_role === 'AR' || p.player_role === 'WK'
    );
    
    // If no suitable candidates, use all filter-passing players
    const finalCandidates = captainCandidates.length >= 2 ? captainCandidates : filterPassingPlayers;
    
    // Sort by performance metrics for better captain selection
    const sortedCandidates = finalCandidates.sort((a, b) => {
      // Prioritize by points, then dream team percentage, then selection percentage
      const aScore = (a.points || 0) * 0.5 + (a.dream_team_percentage || 0) * 0.3 + (a.selection_percentage || 0) * 0.2;
      const bScore = (b.points || 0) * 0.5 + (b.dream_team_percentage || 0) * 0.3 + (b.selection_percentage || 0) * 0.2;
      return bScore - aScore;
    });
    
    // Implement captain rotation based on team index
    const captainIndex = teamIndex % sortedCandidates.length;
    const viceCaptainIndex = (teamIndex + 1) % sortedCandidates.length;
    
    // Ensure captain and vice-captain are different
    const captain = sortedCandidates[captainIndex];
    const viceCaptain = sortedCandidates[viceCaptainIndex === captainIndex ? 
      (viceCaptainIndex + 1) % sortedCandidates.length : viceCaptainIndex];
    
    console.log(`✅ Selected captain: ${captain.name} (${captain.player_role})`);
    console.log(`✅ Selected vice-captain: ${viceCaptain.name} (${viceCaptain.player_role})`);
    
    return { captain, viceCaptain };
  }

  /**
   * Calculate role balance for a team
   */
  private calculateTeamRoleBalance(players: Player[]): { batsmen: number; bowlers: number; allRounders: number; wicketKeepers: number } {
    const roleBalance = { batsmen: 0, bowlers: 0, allRounders: 0, wicketKeepers: 0 };
    
    players.forEach(player => {
      const role = Dream11TeamValidator.normalizeRole(player.player_role || '');
      this.updateRoleBalance(roleBalance, role);
    });
    
    return roleBalance;
  }

  /**
   * Calculate risk score for a team
   */
  private calculateRiskScore(players: Player[], request: TeamGenerationRequest): number {
    let totalRisk = 0;
    let count = 0;
    
    players.forEach(player => {
      const selectionPct = player.selection_percentage || 0;
      const dreamTeamPct = player.dream_team_percentage || 0;
      
      // Higher risk for low selection % but potentially high reward
      const ownershipRisk = selectionPct < 20 ? 30 : selectionPct < 40 ? 15 : 0;
      
      // Lower risk for high dream team % players
      const dreamTeamRisk = dreamTeamPct > 60 ? -10 : dreamTeamPct < 30 ? 20 : 0;
      
      totalRisk += ownershipRisk + dreamTeamRisk;
      count++;
    });
    
    const baseRisk = count > 0 ? totalRisk / count : 50;
    return Math.max(0, Math.min(100, baseRisk + 50)); // Normalize to 0-100 range
  }

  /**
   * Calculate expected points for a team
   */
  private calculateExpectedPoints(players: Player[]): number {
    const basePoints = players.reduce((sum, player) => sum + (player.points || 0), 0);
    
    // Add captain and vice-captain multipliers
    const captain = players[0];
    const viceCaptain = players[1];
    
    const captainBonus = (captain?.points || 0) * 1.0; // 2x - 1x = 1x bonus
    const viceCaptainBonus = (viceCaptain?.points || 0) * 0.5; // 1.5x - 1x = 0.5x bonus
    
    return basePoints + captainBonus + viceCaptainBonus;
  }

  /**
   * Calculate team confidence score
   */
  private calculateTeamConfidence(players: Player[], recommendations: AIPlayerRecommendation[]): number {
    let totalConfidence = 0;
    let count = 0;
    
    players.forEach(player => {
      const rec = recommendations.find(r => r.player.id === player.id);
      if (rec) {
        totalConfidence += rec.confidence;
        count++;
      }
    });
    
    const avgConfidence = count > 0 ? totalConfidence / count : 0.5;
    return Math.round(avgConfidence * 100);
  }

  /**
   * Generate team insights
   */
  private generateTeamInsights(players: Player[], strategy: string): string[] {
    const insights: string[] = [];
    
    // Calculate team stats
    const avgPoints = players.reduce((sum, p) => sum + (p.points || 0), 0) / players.length;
    const avgDreamTeam = players.reduce((sum, p) => sum + (p.dream_team_percentage || 0), 0) / players.length;
    const avgSelection = players.reduce((sum, p) => sum + (p.selection_percentage || 0), 0) / players.length;
    const totalCredits = players.reduce((sum, p) => sum + (p.credits || 8), 0);
    
    // Role distribution
    const roleBalance = this.calculateTeamRoleBalance(players);
    
    insights.push(`Average Points: ${avgPoints.toFixed(1)}`);
    insights.push(`Average Dream Team %: ${avgDreamTeam.toFixed(1)}%`);
    insights.push(`Average Selection %: ${avgSelection.toFixed(1)}%`);
    insights.push(`Total Credits: ${totalCredits}`);
    insights.push(`Team composition: ${roleBalance.wicketKeepers} WK, ${roleBalance.batsmen} BAT, ${roleBalance.allRounders} AR, ${roleBalance.bowlers} BWL`);
    
    if (strategy === 'stats-driven') {
      insights.push('Team generated using advanced statistical filters');
    }
    
    return insights;
  }

  /**
   * Generate team from filtered recommendations (traditional approach)
   */
  private generateTeamFromFilteredRecommendations(
    filteredRecommendations: AIPlayerRecommendation[],
    originalRecommendations: AIPlayerRecommendation[],
    filters: any,
    request: TeamGenerationRequest,
    teamIndex: number
  ): AITeamAnalysis {
    console.log(`📊 Generating traditional stats-driven team ${teamIndex + 1} from ${filteredRecommendations.length} filtered players`);
    
    const selectedPlayers: Player[] = [];
    const playersPassingFilters: Player[] = []; // Track players who passed filters
    let totalCredits = 0;
    const maxCredits = DREAM11_RULES.maxCredits;
    
    // Track team counts to enforce max 7 from one team
    const teamCounts: Record<string, number> = {};
    
    // Get target composition
    const validCompositions = Dream11TeamValidator.generateValidTeamCompositions();
    const targetComposition = validCompositions[teamIndex % validCompositions.length];
    
    // Group recommendations by role
    const playersByRole = this.groupRecommendationsByRole(filteredRecommendations);
    
    // Select players for each role
    Object.entries(targetComposition).forEach(([role, count]) => {
      const roleCount = count as number;
      const rolePlayers = playersByRole[role as keyof typeof playersByRole] || [];
      
      // Apply team-specific selection strategy for variation
      const strategyFilteredPlayers = this.applyTeamVariationStrategy(rolePlayers, teamIndex);
      
      let selected = 0;
      for (const rec of strategyFilteredPlayers) {
        if (selected >= roleCount) break;
        
        const player = rec.player;
        const playerCredits = player.credits || 8;
        const playerTeam = player.team_name || 'Unknown';
        
        // Check Dream11 constraints
        if (totalCredits + playerCredits <= maxCredits &&
            (teamCounts[playerTeam] || 0) < DREAM11_RULES.maxPlayersFromOneTeam) {
          
          selectedPlayers.push(player);
          playersPassingFilters.push(player); // Track filter-passing players
          totalCredits += playerCredits;
          teamCounts[playerTeam] = (teamCounts[playerTeam] || 0) + 1;
          selected++;
        }
      }
    });
    
    // Fill remaining slots with filtered players first
    while (selectedPlayers.length < 11) {
      const usedIds = new Set(selectedPlayers.map(p => p.id));
      const availablePlayer = filteredRecommendations.find(rec => 
        !usedIds.has(rec.player.id) &&
        totalCredits + (rec.player.credits || 8) <= maxCredits
      );
      
      if (availablePlayer) {
        selectedPlayers.push(availablePlayer.player);
        playersPassingFilters.push(availablePlayer.player); // Also track these
        totalCredits += availablePlayer.player.credits || 8;
      } else {
        break;
      }
    }
    
    // If still under 11 players, fill with random players from original recommendations
    if (selectedPlayers.length < 11) {
      console.warn(`Only ${selectedPlayers.length} players from filters, filling remaining ${11 - selectedPlayers.length} slots with random players`);
      
      const usedIds = new Set(selectedPlayers.map(p => p.id));
      const availableFromOriginal = originalRecommendations.filter(rec => 
        !usedIds.has(rec.player.id)
      );
      
      // Shuffle and fill remaining slots
      const shuffled = availableFromOriginal.sort(() => Math.random() - 0.5);
      let filled = 0;
      
      for (const rec of shuffled) {
        if (selectedPlayers.length >= 11) break;
        
        const player = rec.player;
        const playerCredits = player.credits || 8;
        const playerTeam = player.team_name || 'Unknown';
        
        // Check Dream11 constraints
        if (totalCredits + playerCredits <= maxCredits &&
            (teamCounts[playerTeam] || 0) < DREAM11_RULES.maxPlayersFromOneTeam) {
          
          selectedPlayers.push(player);
          totalCredits += playerCredits;
          teamCounts[playerTeam] = (teamCounts[playerTeam] || 0) + 1;
          filled++;
        }
      }
      
      console.log(`✅ Filled team with ${playersPassingFilters.length} filter-passing players + ${filled} random players`);
    }
    
    // If still under 11 players, use complete fallback
    if (selectedPlayers.length < 11) {
      console.warn(`Still only ${selectedPlayers.length} players after all attempts, using complete fallback`);
      return this.generateFallbackTeam(originalRecommendations, request, teamIndex);
    }
    
    // Use filter-passing players for captain selection when possible
    const captainCandidates = playersPassingFilters.length >= 2 ? playersPassingFilters : selectedPlayers;
    const { captain, viceCaptain } = this.selectCaptainsFromFilteredPlayers(captainCandidates, teamIndex);
    
    return {
      players: selectedPlayers,
      captain,
      viceCaptain,
      totalCredits,
      roleBalance: this.calculateTeamRoleBalance(selectedPlayers),
      riskScore: this.calculateRiskScore(selectedPlayers, request),
      expectedPoints: this.calculateExpectedPoints(selectedPlayers),
      confidence: this.calculateTeamConfidence(selectedPlayers, filteredRecommendations),
      insights: this.generateTeamInsights(selectedPlayers, request.strategy)
    };
  }

  /**
   * Apply team variation strategy for different teams
   */
  private applyTeamVariationStrategy(
    rolePlayers: AIPlayerRecommendation[],
    teamIndex: number
  ): AIPlayerRecommendation[] {
    const strategyIndex = teamIndex % 7;
    
    switch (strategyIndex) {
      case 0: // Team 1: Top performers
        return rolePlayers.sort((a, b) => b.confidence - a.confidence);
      case 1: // Team 2: Skip top 2, then select
        return rolePlayers.sort((a, b) => b.confidence - a.confidence).slice(2);
      case 2: // Team 3: Middle performers
        const sorted = rolePlayers.sort((a, b) => b.confidence - a.confidence);
        const mid = Math.floor(sorted.length / 2);
        return sorted.slice(mid - 2, mid + 2);
      case 3: // Team 4: Reverse order
        return rolePlayers.sort((a, b) => a.confidence - b.confidence);
      case 4: // Team 5: Randomized
        return rolePlayers.sort(() => Math.random() - 0.5);
      case 5: // Team 6: Credit-efficient
        return rolePlayers.sort((a, b) => {
          const aEfficiency = (a.player.points || 0) / (a.player.credits || 8);
          const bEfficiency = (b.player.points || 0) / (b.player.credits || 8);
          return bEfficiency - aEfficiency;
        });
      case 6: // Team 7: Balanced approach
        return rolePlayers.sort((a, b) => {
          const aScore = (a.confidence * 0.6) + ((a.player.points || 0) / 100 * 0.4);
          const bScore = (b.confidence * 0.6) + ((b.player.points || 0) / 100 * 0.4);
          return bScore - aScore;
        });
      default:
        return rolePlayers;
    }
  }

  /**
   * Strategy 8: Base Team + Rule-Based Edits
   * Generates variations of a user-provided base team using optimization rules
   */
  async generateBaseTeamVariations(request: TeamGenerationRequest): Promise<AITeamAnalysis[]> {
    try {
      const { baseTeam, optimizationRules, teamNames } = request.userPreferences!;
      const teams: AITeamAnalysis[] = [];
      
      console.log('🎯 Strategy 8: Generating base team variations', {
        baseTeamSize: baseTeam?.length,
        teamCount: request.teamCount,
        editIntensity: optimizationRules?.editIntensity
      });

      // Get all available players for swapping
      let allPlayers: Player[] = [];
      try {
        // allPlayers = await neonDB.getPlayingPlayersForMatch(request.matchId);
        console.warn('⚠️  Database temporarily disabled for testing');
        // Use mock players for testing instead
        allPlayers = [
          { id: 12, name: 'Kane Williamson', full_name: 'Kane Williamson', player_role: 'BAT', credits: 10.5, points: 138, dream_team_percentage: 42, selection_percentage: 38, team_name: 'New Zealand', is_playing_today: true, country: 'NZ', batting_style: 'RHB', bowling_style: 'N/A' },
          { id: 13, name: 'Ross Taylor', full_name: 'Ross Taylor', player_role: 'BAT', credits: 9.5, points: 86, dream_team_percentage: 28, selection_percentage: 22, team_name: 'New Zealand', is_playing_today: true, country: 'NZ', batting_style: 'RHB', bowling_style: 'N/A' },
          { id: 14, name: 'Temba Bavuma', full_name: 'Temba Bavuma', player_role: 'BAT', credits: 9.0, points: 78, dream_team_percentage: 25, selection_percentage: 18, team_name: 'South Africa', is_playing_today: true, country: 'SA', batting_style: 'RHB', bowling_style: 'N/A' },
          { id: 15, name: 'Devon Conway', full_name: 'Devon Conway', player_role: 'WK', credits: 8.5, points: 89, dream_team_percentage: 32, selection_percentage: 24, team_name: 'New Zealand', is_playing_today: true, country: 'NZ', batting_style: 'LHB', bowling_style: 'N/A' },
          { id: 16, name: 'Faf du Plessis', full_name: 'Faf du Plessis', player_role: 'BAT', credits: 9.5, points: 92, dream_team_percentage: 35, selection_percentage: 28, team_name: 'South Africa', is_playing_today: true, country: 'SA', batting_style: 'RHB', bowling_style: 'N/A' },
          { id: 17, name: 'Kagiso Rabada', full_name: 'Kagiso Rabada', player_role: 'BWL', credits: 9.0, points: 74, dream_team_percentage: 30, selection_percentage: 25, team_name: 'South Africa', is_playing_today: true, country: 'SA', batting_style: 'RHB', bowling_style: 'RF' },
          { id: 18, name: 'Trent Boult', full_name: 'Trent Boult', player_role: 'BWL', credits: 8.5, points: 68, dream_team_percentage: 28, selection_percentage: 22, team_name: 'New Zealand', is_playing_today: true, country: 'NZ', batting_style: 'LHB', bowling_style: 'LF' },
          { id: 19, name: 'Quinton de Kock', full_name: 'Quinton de Kock', player_role: 'WK', credits: 10.0, points: 95, dream_team_percentage: 38, selection_percentage: 35, team_name: 'South Africa', is_playing_today: true, country: 'SA', batting_style: 'LHB', bowling_style: 'N/A' },
          { id: 20, name: 'Anrich Nortje', full_name: 'Anrich Nortje', player_role: 'BWL', credits: 8.0, points: 62, dream_team_percentage: 22, selection_percentage: 18, team_name: 'South Africa', is_playing_today: true, country: 'SA', batting_style: 'RHB', bowling_style: 'RF' }
        ];
      } catch (error) {
        console.warn('⚠️  Database unavailable, using mock players for testing');
        // Return mock players for testing when database is unavailable
        allPlayers = [
          { id: 12, name: 'Player12', full_name: 'Player12', player_role: 'BAT', credits: 9.0, points: 50, dream_team_percentage: 32, selection_percentage: 20, team_name: 'Team B', is_playing_today: true, country: 'IND', batting_style: 'RHB', bowling_style: 'N/A' },
          { id: 13, name: 'Player13', full_name: 'Player13', player_role: 'BWL', credits: 8.5, points: 36, dream_team_percentage: 20, selection_percentage: 12, team_name: 'Team A', is_playing_today: true, country: 'IND', batting_style: 'RHB', bowling_style: 'RF' },
          { id: 14, name: 'Player14', full_name: 'Player14', player_role: 'AR', credits: 9.5, points: 45, dream_team_percentage: 28, selection_percentage: 18, team_name: 'Team B', is_playing_today: true, country: 'IND', batting_style: 'RHB', bowling_style: 'RF' },
          { id: 15, name: 'Player15', full_name: 'Player15', player_role: 'WK', credits: 8.0, points: 38, dream_team_percentage: 22, selection_percentage: 14, team_name: 'Team A', is_playing_today: true, country: 'IND', batting_style: 'RHB', bowling_style: 'N/A' },
          { id: 16, name: 'Player16', full_name: 'Player16', player_role: 'BAT', credits: 10.0, points: 42, dream_team_percentage: 26, selection_percentage: 16, team_name: 'Team B', is_playing_today: true, country: 'IND', batting_style: 'RHB', bowling_style: 'N/A' },
          { id: 17, name: 'Player17', full_name: 'Player17', player_role: 'BWL', credits: 9.0, points: 44, dream_team_percentage: 30, selection_percentage: 19, team_name: 'Team A', is_playing_today: true, country: 'IND', batting_style: 'RHB', bowling_style: 'RF' },
          { id: 18, name: 'Player18', full_name: 'Player18', player_role: 'AR', credits: 10.5, points: 52, dream_team_percentage: 38, selection_percentage: 25, team_name: 'Team B', is_playing_today: true, country: 'IND', batting_style: 'RHB', bowling_style: 'RF' },
          { id: 19, name: 'Player19', full_name: 'Player19', player_role: 'BAT', credits: 8.5, points: 34, dream_team_percentage: 18, selection_percentage: 11, team_name: 'Team A', is_playing_today: true, country: 'IND', batting_style: 'RHB', bowling_style: 'N/A' },
          { id: 20, name: 'Player20', full_name: 'Player20', player_role: 'BWL', credits: 9.0, points: 40, dream_team_percentage: 25, selection_percentage: 15, team_name: 'Team B', is_playing_today: true, country: 'IND', batting_style: 'RHB', bowling_style: 'RF' }
        ];
      }
      
      // Filter players not in base team for potential swaps
      const availableForSwap = allPlayers.filter((p: Player) => 
        !baseTeam?.some((bp: Player) => bp.id === p.id)
      );

      // Generate variations based on edit intensity
      for (let i = 0; i < request.teamCount; i++) {
        const variation = await this.generateSingleBaseTeamVariation(
          baseTeam!,
          availableForSwap,
          optimizationRules!,
          i,
          teamNames
        );
        teams.push(variation);
      }

      console.log('✅ Strategy 8: Generated variations', {
        totalTeams: teams.length,
        averageCredits: teams.reduce((sum, t) => sum + t.totalCredits, 0) / teams.length
      });

      return teams;
    } catch (error) {
      console.error('❌ Strategy 8: Error generating base team variations:', error);
      return [];
    }
  }

  /**
   * Generate a single variation of the base team
   */
  private async generateSingleBaseTeamVariation(
    baseTeam: Player[],
    availableForSwap: Player[],
    rules: NonNullable<TeamGenerationRequest['userPreferences']>['optimizationRules'],
    teamIndex: number,
    teamNames?: { teamA: string; teamB: string }
  ): Promise<AITeamAnalysis> {
    // Start with base team
    let currentTeam = [...baseTeam];
    
    // Determine number of edits based on intensity
    const editCount = this.calculateEditCount(rules!.editIntensity, teamIndex);
    
    // Apply edits based on optimization rules
    currentTeam = await this.applyOptimizationEdits(
      currentTeam,
      availableForSwap,
      rules!,
      editCount,
      teamIndex
    );

    // Validate team composition
    currentTeam = await this.validateAndFixTeamComposition(currentTeam, availableForSwap, rules!);

    // Select captain and vice-captain
    const { captain, viceCaptain } = await this.selectCaptainAndViceCaptain(
      currentTeam,
      rules!.primaryParameter,
      teamIndex
    );

    // Calculate metrics
    const totalCredits = currentTeam.reduce((sum, p) => sum + (p.credits || 0), 0);
    const roleBalance = this.calculateTeamRoleBalance(currentTeam);
    const riskScore = this.calculateBaseTeamRiskScore(currentTeam, rules!);
    const expectedPoints = this.calculateExpectedPoints(currentTeam);
    const confidence = this.calculateBaseTeamConfidence(currentTeam, rules!, teamIndex);

    return {
      players: currentTeam,
      captain,
      viceCaptain,
      totalCredits,
      roleBalance,
      riskScore,
      expectedPoints,
      confidence,
      reasoning: this.generateBaseTeamReasoning(currentTeam, baseTeam, rules!, editCount),
      insights: this.generateBaseTeamInsights(currentTeam, rules!, teamIndex)
    };
  }

  /**
   * Calculate number of edits based on intensity and team index
   */
  private calculateEditCount(intensity: 'minor' | 'moderate' | 'major', teamIndex: number): number {
    const baseEdits = {
      minor: 1,
      moderate: 3,
      major: 5
    };

    const base = baseEdits[intensity];
    const variation = Math.floor(teamIndex / 3); // Every 3 teams, increase by 1
    const editCount = Math.min(base + variation, intensity === 'major' ? 7 : intensity === 'moderate' ? 5 : 3);
    
    console.log(`📊 Edit count calculation: ${intensity} intensity, team ${teamIndex} → ${base} base + ${variation} variation = ${editCount} edits`);
    
    return editCount;
  }

  /**
   * Apply optimization edits to the team with randomization
   */
  private async applyOptimizationEdits(
    team: Player[],
    availableForSwap: Player[],
    rules: NonNullable<TeamGenerationRequest['userPreferences']>['optimizationRules'],
    editCount: number,
    teamIndex: number
  ): Promise<Player[]> {
    let editedTeam = [...team];
    const editsApplied = [];

    console.log(`🔄 Attempting to apply ${editCount} edits to base team...`);

    // Shuffle available players to add randomization
    const shuffledAvailable = this.shuffleArray(availableForSwap);
    console.log(`🎲 Shuffled ${shuffledAvailable.length} available players for variation`);

    // Primary edit strategy
    for (let i = 0; i < editCount; i++) {
      const edit = await this.generateSingleEdit(
        editedTeam,
        shuffledAvailable,
        rules!,
        teamIndex + i,
        editsApplied
      );

      if (edit) {
        editedTeam = edit.newTeam;
        editsApplied.push(edit);
      } else {
        console.log(`⚠️ Could not generate edit ${i + 1}/${editCount}, trying alternative approach`);
        
        // Alternative approach: try random swaps with less strict constraints
        const randomEdit = await this.generateRandomEdit(
          editedTeam,
          shuffledAvailable,
          rules!,
          editsApplied
        );
        
        if (randomEdit) {
          editedTeam = randomEdit.newTeam;
          editsApplied.push(randomEdit);
          console.log(`✅ Applied random edit: ${randomEdit.oldPlayer.name} → ${randomEdit.newPlayer.name}`);
        }
      }
    }

    console.log(`🔄 Applied ${editsApplied.length}/${editCount} edits to base team:`, 
      editsApplied.map(e => `${e.oldPlayer.name} → ${e.newPlayer.name}`)
    );

    return editedTeam;
  }

  /**
   * Generate a random edit when systematic approach fails
   */
  private async generateRandomEdit(
    currentTeam: Player[],
    availableForSwap: Player[],
    rules: NonNullable<TeamGenerationRequest['userPreferences']>['optimizationRules'],
    previousEdits: Array<{ oldPlayer: Player; newPlayer: Player; newTeam: Player[] }>
  ): Promise<{ oldPlayer: Player; newPlayer: Player; newTeam: Player[] } | null> {
    
    console.log(`🎲 Attempting random edit as fallback...`);
    
    // Get players that haven't been recently edited
    const candidatesForRemoval = currentTeam.filter(player => 
      !previousEdits.some(edit => edit.newPlayer.id === player.id)
    );
    
    // Try up to 10 random combinations
    for (let attempt = 0; attempt < 10; attempt++) {
      const oldPlayer = candidatesForRemoval[Math.floor(Math.random() * candidatesForRemoval.length)];
      const newPlayer = availableForSwap[Math.floor(Math.random() * availableForSwap.length)];
      
      if (oldPlayer && newPlayer) {
        const newTeam = currentTeam.map(p => 
          p.id === oldPlayer.id ? newPlayer : p
        );
        
        // Check if this swap is valid
        if (await this.validateTeamConstraints(newTeam, rules!)) {
          console.log(`✅ Random edit successful: ${oldPlayer.name} → ${newPlayer.name}`);
          return { oldPlayer, newPlayer, newTeam };
        }
      }
    }
    
    console.log(`❌ Random edit failed after 10 attempts`);
    return null;
  }

  /**
   * Shuffle array using Fisher-Yates algorithm
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Generate a single edit (player swap) with randomization for diversity
   */
  private async generateSingleEdit(
    currentTeam: Player[],
    availableForSwap: Player[],
    rules: NonNullable<TeamGenerationRequest['userPreferences']>['optimizationRules'],
    variation: number,
    previousEdits: Array<{ oldPlayer: Player; newPlayer: Player; newTeam: Player[] }>
  ): Promise<{ oldPlayer: Player; newPlayer: Player; newTeam: Player[] } | null> {
    
    console.log(`🔄 Attempting edit ${previousEdits.length + 1} with ${availableForSwap.length} available players`);
    
    // Get optimization strategy based on primary parameter
    const optimizationStrategy = this.getOptimizationStrategy(rules!.primaryParameter, variation);
    
    // Find players to potentially replace (exclude players that were just added)
    const candidatesForRemoval = currentTeam.filter(player => 
      !previousEdits.some(edit => edit.newPlayer.id === player.id)
    );

    console.log(`🎯 ${candidatesForRemoval.length} candidates for removal from current team`);

    // Sort by optimization parameter (worst first for replacement)
    candidatesForRemoval.sort((a, b) => {
      const scoreA = this.getPlayerOptimizationScore(a, rules!.primaryParameter);
      const scoreB = this.getPlayerOptimizationScore(b, rules!.primaryParameter);
      return scoreA - scoreB; // Ascending (worst first)
    });

    // Add randomization: shuffle the candidates with bias towards worse players
    const topCandidates = candidatesForRemoval.slice(0, Math.min(6, candidatesForRemoval.length));
    const shuffledCandidates = this.shuffleArray(topCandidates);

    console.log(`🔄 Trying to replace players in randomized order: ${shuffledCandidates.slice(0, 3).map(p => p.name).join(', ')}`);

    // Try to find a suitable replacement
    for (const oldPlayer of shuffledCandidates) {
      console.log(`🔄 Trying to replace ${oldPlayer.name} (${oldPlayer.player_role}, ${oldPlayer.credits} cr)`);
      
      const replacement = await this.findBestReplacement(
        oldPlayer,
        currentTeam,
        availableForSwap,
        rules!,
        optimizationStrategy,
        variation // Pass variation for randomization
      );

      if (replacement) {
        console.log(`✅ Found replacement: ${oldPlayer.name} → ${replacement.name}`);
        const newTeam = currentTeam.map(p => 
          p.id === oldPlayer.id ? replacement : p
        );

        // Validate the swap maintains team constraints
        if (await this.validateTeamConstraints(newTeam, rules!)) {
          console.log(`✅ Swap validated successfully`);
          return { oldPlayer, newPlayer: replacement, newTeam };
        } else {
          console.log(`❌ Swap failed validation`);
        }
      } else {
        console.log(`❌ No suitable replacement found for ${oldPlayer.name}`);
      }
    }

    console.log(`❌ No valid edits found in this attempt`);
    return null;
  }

  /**
   * Find the best replacement for a player with randomization for diversity
   */
  private async findBestReplacement(
    oldPlayer: Player,
    currentTeam: Player[],
    availableForSwap: Player[],
    rules: NonNullable<TeamGenerationRequest['userPreferences']>['optimizationRules'],
    optimizationStrategy: string,
    variation: number
  ): Promise<Player | null> {
    
    console.log(`🔍 Finding replacement for ${oldPlayer.name} (${oldPlayer.player_role}) from ${availableForSwap.length} available players`);
    
    // Get current team composition
    const currentRoleBalance = this.calculateTeamRoleBalance(currentTeam);
    const oldRole = this.getPlayerRole(oldPlayer.player_role);
    
    // Get set of current team player IDs to exclude them from selection
    const currentTeamIds = new Set(currentTeam.map(p => p.id));
    
    // Filter candidates by role and exclude players already in current team
    const candidates = availableForSwap.filter(player => {
      // First check: exclude players already in current team
      if (currentTeamIds.has(player.id)) {
        console.log(`❌ Excluding ${player.name} - already in current team`);
        return false;
      }
      
      const newRole = this.getPlayerRole(player.player_role);
      
      // Primary preference: same role
      if (oldRole === newRole) {
        return true;
      }
      
      // Secondary preference: allow all-rounders to replace any non-WK role
      if (newRole === 'allRounders' && oldRole !== 'wicketKeepers') {
        return true;
      }
      
      // Allow any role to replace all-rounders (except if it violates constraints)
      if (oldRole === 'allRounders') {
        return true;
      }
      
      // Allow batsmen and bowlers to be interchangeable if team balance permits
      if ((oldRole === 'batsmen' && newRole === 'bowlers') || 
          (oldRole === 'bowlers' && newRole === 'batsmen')) {
        return true;
      }
      
      return false;
    });

    console.log(`🎯 ${candidates.length} role-compatible candidates found`);

    if (candidates.length === 0) {
      console.log(`❌ No role-compatible candidates for ${oldPlayer.name}`);
      return null;
    }

    // Filter by credit constraints
    const currentCredits = currentTeam.reduce((sum, p) => sum + (p.credits || 0), 0);
    const budgetAfterRemoval = currentCredits - (oldPlayer.credits || 0);
    
    const affordableCandidates = candidates.filter(player => {
      const newTotal = budgetAfterRemoval + (player.credits || 0);
      return newTotal >= rules!.guardrails.minCredits && newTotal <= rules!.guardrails.maxCredits;
    });

    console.log(`💰 ${affordableCandidates.length} affordable candidates (budget: ${budgetAfterRemoval.toFixed(1)} + player credits must be ${rules!.guardrails.minCredits}-${rules!.guardrails.maxCredits})`);

    if (affordableCandidates.length === 0) {
      console.log(`❌ No affordable candidates for ${oldPlayer.name}`);
      return null;
    }

    // Sort by optimization score
    affordableCandidates.sort((a, b) => {
      const scoreA = this.getPlayerOptimizationScore(a, rules!.primaryParameter);
      const scoreB = this.getPlayerOptimizationScore(b, rules!.primaryParameter);
      return scoreB - scoreA; // Descending (best first)
    });

    console.log(`📊 Top 3 candidates by ${rules!.primaryParameter}: ${affordableCandidates.slice(0, 3).map(p => `${p.name} (${this.getPlayerOptimizationScore(p, rules!.primaryParameter)})`).join(', ')}`);

    // Add randomization to candidate selection based on variation
    const selectedPlayer = this.applyOptimizationStrategy(
      affordableCandidates,
      rules!,
      optimizationStrategy,
      variation
    );

    console.log(`✅ Selected: ${selectedPlayer?.name || 'None'}`);
    return selectedPlayer;
  }

  /**
   * Get optimization strategy based on primary parameter and variation with randomization
   */
  private getOptimizationStrategy(
    primaryParameter: 'dreamTeamPercentage' | 'selectionPercentage' | 'averagePoints',
    variation: number
  ): string {
    const strategies = {
      dreamTeamPercentage: ['elite-performers', 'consistent-picks', 'value-finds'],
      selectionPercentage: ['low-ownership', 'balanced-ownership', 'popular-picks'],
      averagePoints: ['form-based', 'season-average', 'recent-performance']
    };

    const strategyList = strategies[primaryParameter];
    
    // Add some randomization to strategy selection
    const baseStrategy = strategyList[variation % strategyList.length];
    const randomOffset = Math.floor(variation / 3) % strategyList.length;
    const finalStrategyIndex = (strategyList.indexOf(baseStrategy) + randomOffset) % strategyList.length;
    
    return strategyList[finalStrategyIndex];
  }

  /**
   * Get player optimization score based on parameter
   */
  private getPlayerOptimizationScore(
    player: Player,
    parameter: 'dreamTeamPercentage' | 'selectionPercentage' | 'averagePoints'
  ): number {
    switch (parameter) {
      case 'dreamTeamPercentage':
        return player.dream_team_percentage || 0;
      case 'selectionPercentage':
        return player.selection_percentage || 0;
      case 'averagePoints':
        return player.points || 0;
      default:
        return 0;
    }
  }

  /**
   * Apply optimization strategy to candidate selection with randomization
   */
  private applyOptimizationStrategy(
    candidates: Player[],
    rules: NonNullable<TeamGenerationRequest['userPreferences']>['optimizationRules'],
    strategy: string,
    variation: number = 0
  ): Player | null {
    if (candidates.length === 0) return null;

    // Apply strategy-specific logic
    switch (strategy) {
      case 'elite-performers':
        // Add randomization: pick from top 3 performers instead of always the best
        const topPerformers = candidates.slice(0, Math.min(3, candidates.length));
        const performerIndex = variation % topPerformers.length;
        return topPerformers[performerIndex];
      
      case 'value-finds':
        // Find best points per credit ratio
        candidates.sort((a, b) => {
          const ratioA = (a.points || 0) / (a.credits || 1);
          const ratioB = (b.points || 0) / (b.credits || 1);
          return ratioB - ratioA;
        });
        // Add randomization: pick from top value picks
        const topValues = candidates.slice(0, Math.min(3, candidates.length));
        const valueIndex = variation % topValues.length;
        return topValues[valueIndex];
      
      case 'low-ownership':
        // Prefer players with lower selection percentage
        candidates.sort((a, b) => 
          (a.selection_percentage || 0) - (b.selection_percentage || 0)
        );
        // Add randomization: pick from top low-ownership players
        const lowOwnership = candidates.slice(0, Math.min(3, candidates.length));
        const ownershipIndex = variation % lowOwnership.length;
        return lowOwnership[ownershipIndex];
      
      case 'form-based':
        // Prefer players with recent good form
        candidates.sort((a, b) => {
          const formA = this.calculateRecentForm(a);
          const formB = this.calculateRecentForm(b);
          return formB - formA;
        });
        // Add randomization: pick from top form players
        const topForm = candidates.slice(0, Math.min(3, candidates.length));
        const formIndex = variation % topForm.length;
        return topForm[formIndex];
      
      default:
        // Default randomization: pick from top candidates
        const topCandidates = candidates.slice(0, Math.min(3, candidates.length));
        const randomIndex = variation % topCandidates.length;
        return topCandidates[randomIndex];
    }
  }

  /**
   * Calculate recent form score for a player
   */
  private calculateRecentForm(player: Player): number {
    // Use a combination of recent points and consistency
    const baseScore = player.points || 0;
    const consistency = 1 - (player.selection_percentage || 0) / 100; // Lower ownership = higher uniqueness
    return baseScore * (1 + consistency * 0.2);
  }

  /**
   * Validate team constraints after edit
   */
  private async validateTeamConstraints(
    team: Player[],
    rules: NonNullable<TeamGenerationRequest['userPreferences']>['optimizationRules']
  ): Promise<boolean> {
    console.log(`🔍 Validating team constraints...`);
    
    // Check role constraints
    const roleBalance = this.calculateTeamRoleBalance(team);
    console.log(`📊 Role balance: BAT=${roleBalance.batsmen}/${rules!.guardrails.maxPerRole.batsmen}, BWL=${roleBalance.bowlers}/${rules!.guardrails.maxPerRole.bowlers}, AR=${roleBalance.allRounders}/${rules!.guardrails.maxPerRole.allRounders}, WK=${roleBalance.wicketKeepers}/${rules!.guardrails.maxPerRole.wicketKeepers}`);
    
    if (roleBalance.batsmen > rules!.guardrails.maxPerRole.batsmen) {
      console.log(`❌ Too many batsmen: ${roleBalance.batsmen} > ${rules!.guardrails.maxPerRole.batsmen}`);
      return false;
    }
    if (roleBalance.bowlers > rules!.guardrails.maxPerRole.bowlers) {
      console.log(`❌ Too many bowlers: ${roleBalance.bowlers} > ${rules!.guardrails.maxPerRole.bowlers}`);
      return false;
    }
    if (roleBalance.allRounders > rules!.guardrails.maxPerRole.allRounders) {
      console.log(`❌ Too many all-rounders: ${roleBalance.allRounders} > ${rules!.guardrails.maxPerRole.allRounders}`);
      return false;
    }
    if (roleBalance.wicketKeepers > rules!.guardrails.maxPerRole.wicketKeepers) {
      console.log(`❌ Too many wicket-keepers: ${roleBalance.wicketKeepers} > ${rules!.guardrails.maxPerRole.wicketKeepers}`);
      return false;
    }

    // Check credit constraints
    const totalCredits = team.reduce((sum, p) => sum + (p.credits || 0), 0);
    console.log(`💰 Total credits: ${totalCredits.toFixed(1)} (range: ${rules!.guardrails.minCredits}-${rules!.guardrails.maxCredits})`);
    
    if (totalCredits < rules!.guardrails.minCredits) {
      console.log(`❌ Credits too low: ${totalCredits.toFixed(1)} < ${rules!.guardrails.minCredits}`);
      return false;
    }
    if (totalCredits > rules!.guardrails.maxCredits) {
      console.log(`❌ Credits too high: ${totalCredits.toFixed(1)} > ${rules!.guardrails.maxCredits}`);
      return false;
    }

    // Check team split constraints
    const teamCounts = this.calculateTeamSplit(team);
    console.log(`🏏 Team split: ${Object.entries(teamCounts).map(([team, count]) => `${team}=${count}`).join(', ')}`);
    
    for (const [teamName, count] of Object.entries(teamCounts)) {
      if (count > 7) {
        console.log(`❌ Too many players from ${teamName}: ${count} > 7`);
        return false;
      }
    }

    // Ensure at least 1 wicket keeper
    if (roleBalance.wicketKeepers === 0) {
      console.log(`❌ No wicket keeper in team`);
      return false;
    }

    console.log(`✅ Team constraints validation passed`);
    return true;
  }

  /**
   * Calculate team split (players per team)
   */
  private calculateTeamSplit(team: Player[]): Record<string, number> {
    const teamCounts: Record<string, number> = {};
    team.forEach(player => {
      const teamName = player.team_name || 'Unknown';
      teamCounts[teamName] = (teamCounts[teamName] || 0) + 1;
    });
    return teamCounts;
  }

  /**
   * Validate and fix team composition if needed
   */
  private async validateAndFixTeamComposition(
    team: Player[],
    availableForSwap: Player[],
    rules: NonNullable<TeamGenerationRequest['userPreferences']>['optimizationRules']
  ): Promise<Player[]> {
    let fixedTeam = [...team];
    
    // Ensure we have exactly 11 players
    if (fixedTeam.length > 11) {
      fixedTeam = fixedTeam.slice(0, 11);
    }
    
    // Ensure we have at least 1 wicket keeper
    const hasWicketKeeper = fixedTeam.some(p => 
      this.getPlayerRole(p.player_role) === 'wicketKeepers'
    );
    
    if (!hasWicketKeeper) {
      // Find a wicket keeper to add
      const wicketKeeper = availableForSwap.find(p => 
        this.getPlayerRole(p.player_role) === 'wicketKeepers'
      );
      
      if (wicketKeeper) {
        // Replace the worst performer
        const worstPerformer = fixedTeam.reduce((worst, current) => 
          this.getPlayerOptimizationScore(current, rules!.primaryParameter) < 
          this.getPlayerOptimizationScore(worst, rules!.primaryParameter) ? current : worst
        );
        
        fixedTeam = fixedTeam.map(p => 
          p.id === worstPerformer.id ? wicketKeeper : p
        );
      }
    }

    return fixedTeam;
  }

  /**
   * Select captain and vice-captain based on optimization parameter
   */
  private async selectCaptainAndViceCaptain(
    team: Player[],
    primaryParameter: 'dreamTeamPercentage' | 'selectionPercentage' | 'averagePoints',
    teamIndex: number
  ): Promise<{ captain: Player; viceCaptain: Player }> {
    
    if (team.length < 2) {
      console.error('❌ Team has less than 2 players, cannot select captain and vice-captain');
      return {
        captain: team[0] || { id: 0, name: 'Unknown Captain', player_role: 'BAT' } as Player,
        viceCaptain: team[0] || { id: 0, name: 'Unknown Vice-Captain', player_role: 'BAT' } as Player
      };
    }

    // Sort by optimization score
    const sortedByScore = [...team].sort((a, b) => {
      const scoreA = this.getPlayerOptimizationScore(a, primaryParameter);
      const scoreB = this.getPlayerOptimizationScore(b, primaryParameter);
      return scoreB - scoreA;
    });

    // Add some variation based on team index but ensure different players
    let captainIndex = teamIndex % Math.min(3, sortedByScore.length);
    let viceCaptainIndex = (teamIndex + 1) % Math.min(3, sortedByScore.length);

    // Ensure captain and vice-captain are different
    if (captainIndex === viceCaptainIndex) {
      if (sortedByScore.length > 1) {
        viceCaptainIndex = (captainIndex + 1) % sortedByScore.length;
      }
    }

    const captain = sortedByScore[captainIndex];
    const viceCaptain = sortedByScore[viceCaptainIndex];

    // Final safety check - if still same player, force different selection
    if (captain.id === viceCaptain.id && sortedByScore.length > 1) {
      console.log(`⚠️ Captain and vice-captain were same player (${captain.name}), forcing different selection`);
      return {
        captain: sortedByScore[0],
        viceCaptain: sortedByScore[1]
      };
    }

    console.log(`✅ Team ${teamIndex + 1} Captain: ${captain.name} (${captain.player_role}), Vice-Captain: ${viceCaptain.name} (${viceCaptain.player_role})`);
    return { captain, viceCaptain };
  }

  /**
   * Calculate risk score for base team variation
   */
  private calculateBaseTeamRiskScore(
    team: Player[],
    rules: NonNullable<TeamGenerationRequest['userPreferences']>['optimizationRules']
  ): number {
    const riskFactors = {
      conservative: 0.3,
      medium: 0.5,
      aggressive: 0.7
    };

    const baseRisk = riskFactors[rules!.preferences.riskTolerance];
    
    // Adjust based on edit intensity
    const intensityMultiplier = {
      minor: 1.0,
      moderate: 1.2,
      major: 1.4
    };

    return Math.min(baseRisk * intensityMultiplier[rules!.editIntensity], 1.0);
  }

  /**
   * Calculate confidence for base team variation
   */
  private calculateBaseTeamConfidence(
    team: Player[],
    rules: NonNullable<TeamGenerationRequest['userPreferences']>['optimizationRules'],
    teamIndex: number
  ): number {
    // Base confidence starts high since user selected the base team
    let confidence = 85;

    // Adjust based on optimization parameter alignment
    const avgOptimizationScore = team.reduce((sum, p) => 
      sum + this.getPlayerOptimizationScore(p, rules!.primaryParameter), 0
    ) / team.length;

    // Normalize score to 0-15 range
    const normalizedScore = Math.min(avgOptimizationScore / 10, 1.5) * 10;
    confidence += normalizedScore;

    // Adjust based on edit intensity (more edits = slightly lower confidence)
    const intensityAdjustment = {
      minor: 0,
      moderate: -3,
      major: -5
    };
    confidence += intensityAdjustment[rules!.editIntensity];

    // Add slight variation between teams
    confidence += (teamIndex % 5) - 2;

    return Math.max(Math.min(confidence, 95), 70);
  }

  /**
   * Generate reasoning for base team variation
   */
  private generateBaseTeamReasoning(
    finalTeam: Player[],
    originalTeam: Player[],
    rules: NonNullable<TeamGenerationRequest['userPreferences']>['optimizationRules'],
    editCount: number
  ): string {
    const changedPlayers = finalTeam.filter(p => 
      !originalTeam.some(op => op.id === p.id)
    );

    if (changedPlayers.length === 0) {
      return `Maintained original base team composition optimized for ${rules!.primaryParameter.replace(/([A-Z])/g, ' $1').toLowerCase()}.`;
    }

    const changesList = changedPlayers.map(p => p.name).join(', ');
    const intensityDesc = {
      minor: 'minimal adjustments',
      moderate: 'strategic changes',
      major: 'comprehensive optimization'
    };

    return `Applied ${intensityDesc[rules!.editIntensity]} with ${editCount} edits. Key additions: ${changesList}. Optimized for ${rules!.primaryParameter.replace(/([A-Z])/g, ' $1').toLowerCase()} with ${rules!.preferences.riskTolerance} risk tolerance.`;
  }

  /**
   * Generate insights for base team variation
   */
  private generateBaseTeamInsights(
    team: Player[],
    rules: NonNullable<TeamGenerationRequest['userPreferences']>['optimizationRules'],
    teamIndex: number
  ): string[] {
    const insights: string[] = [];

    // Role balance insight
    const roleBalance = this.calculateTeamRoleBalance(team);
    insights.push(`Role composition: ${roleBalance.batsmen} BAT, ${roleBalance.bowlers} BWL, ${roleBalance.allRounders} AR, ${roleBalance.wicketKeepers} WK`);

    // Credit utilization insight
    const totalCredits = team.reduce((sum, p) => sum + (p.credits || 0), 0);
    const creditUtilization = (totalCredits / rules!.guardrails.maxCredits) * 100;
    insights.push(`Credit utilization: ${creditUtilization.toFixed(1)}% (${totalCredits.toFixed(1)}/${rules!.guardrails.maxCredits})`);

    // Optimization parameter insight
    const avgScore = team.reduce((sum, p) => 
      sum + this.getPlayerOptimizationScore(p, rules!.primaryParameter), 0
    ) / team.length;
    insights.push(`Average ${rules!.primaryParameter.replace(/([A-Z])/g, ' $1').toLowerCase()}: ${avgScore.toFixed(1)}`);

    // Team split insight
    const teamSplit = this.calculateTeamSplit(team);
    const teamSplitDesc = Object.entries(teamSplit)
      .map(([team, count]) => `${team}: ${count}`)
      .join(', ');
    insights.push(`Team distribution: ${teamSplitDesc}`);

    // Strategy-specific insight
    const strategyInsight = this.getStrategySpecificInsight(rules!, teamIndex);
    if (strategyInsight) {
      insights.push(strategyInsight);
    }

    return insights;
  }

  /**
   * Get strategy-specific insight
   */
  private getStrategySpecificInsight(
    rules: NonNullable<TeamGenerationRequest['userPreferences']>['optimizationRules'],
    teamIndex: number
  ): string | null {
    const strategy = this.getOptimizationStrategy(rules!.primaryParameter, teamIndex);
    
    switch (strategy) {
      case 'elite-performers':
        return 'Focused on top-tier performers with proven track records';
      case 'value-finds':
        return 'Optimized for best points-per-credit value picks';
      case 'low-ownership':
        return 'Targeting differential picks with lower ownership';
      case 'form-based':
        return 'Prioritizing players with recent strong performances';
      default:
        return null;
    }
  }

  /**
   * Get player role from role string
   */
  private getPlayerRole(role: string): 'batsmen' | 'bowlers' | 'allRounders' | 'wicketKeepers' {
    if (role.includes('BAT')) return 'batsmen';
    if (role.includes('BWL')) return 'bowlers';
    if (role.includes('AR')) return 'allRounders';
    if (role.includes('WK')) return 'wicketKeepers';
    return 'allRounders';
  }
}

export const aiService = new AIService();
