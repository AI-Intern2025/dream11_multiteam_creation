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
    // For Strategy 7 role-split lineups
    roleSplitConfig?: {
      // Batting order split
      topOrderBatsmen: number;    // Positions 1-3
      middleOrderBatsmen: number; // Positions 4-6
      lowerOrderBatsmen: number;  // Positions 7-11
      
      // Bowling type split
      spinners: number;
      pacers: number;
      
      // General role requirements
      wicketKeepers: number;
      allRounders: number;
      
      // Team generation settings
      teamCount: number;
      
      // Advanced options
      prioritizeForm: boolean;
      balanceCredits: boolean;
      diversityLevel: 'low' | 'medium' | 'high';
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

      // Handle role-split lineups strategy (Strategy 7)
      if (request.strategy === 'role-split' && request.userPreferences?.roleSplitConfig) {
        return this.generateRoleSplitTeams(request);
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
      expectedPoints: this.calculateExpectedPoints(selectedPlayers, captain, viceCaptain),
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
      roleBalance: this.calculateRoleBalance(selectedPlayers),
      riskScore: this.calculateRiskScore(selectedPlayers, request),
      expectedPoints: this.calculateExpectedPoints(selectedPlayers, captain, viceCaptain),
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
    const roleBalance = this.calculateRoleBalance(optimization.teamComposition);
    
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

  private async generateRoleSplitTeams(request: TeamGenerationRequest): Promise<AITeamAnalysis[]> {
    const { roleSplitConfig, teamNames } = request.userPreferences!;
    
    if (!roleSplitConfig || !teamNames) {
      throw new Error('Invalid role-split data: need role configuration and team names');
    }

    console.log(`🎯 Generating role-split teams with configuration: ${JSON.stringify(roleSplitConfig)}`);

    try {
      // Get match and player data
      const match = await neonDB.getMatchById(request.matchId);
      if (!match) {
        throw new Error(`Match not found: ${request.matchId}`);
      }

      const players = await neonDB.getPlayingPlayersForMatch(request.matchId);
      console.log(`📊 Found ${players.length} players for match ${request.matchId}`);
      
      if (players.length === 0) {
        throw new Error(`No players found for match ${request.matchId}`);
      }

      const teams: AITeamAnalysis[] = [];

      // Generate teams based on role-split configuration
      for (let i = 0; i < roleSplitConfig.teamCount; i++) {
        const team = await this.generateRoleSplitTeam(
          roleSplitConfig,
          players,
          match,
          request,
          i,
          teams // Pass existing teams for diversity
        );
        teams.push(team);
      }

      return teams;
    } catch (error) {
      console.error('Error generating role-split teams:', error);
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

  private async generateRoleSplitTeam(
    config: any,
    players: Player[],
    match: Match,
    request: TeamGenerationRequest,
    teamIndex: number,
    existingTeams: AITeamAnalysis[]
  ): Promise<AITeamAnalysis> {
    console.log(`🏏 Generating role-split team ${teamIndex + 1} with diversity consideration`);

    let attempts = 0;
    const maxAttempts = config.diversityLevel === 'high' ? 50 : config.diversityLevel === 'medium' ? 30 : 10;
    let bestTeam: AITeamAnalysis | null = null;
    let bestDiversityScore = -1;

    while (attempts < maxAttempts) {
      attempts++;
      
      // Generate candidate team
      const candidateTeam = await this.buildRoleSplitTeam(config, players, match, request, teamIndex + attempts);
      
      // Calculate diversity score if we have existing teams
      const diversityScore = this.calculateTeamDiversityScore(candidateTeam, existingTeams);
      
      if (diversityScore >= 25.0 || existingTeams.length === 0) {
        console.log(`✅ Role-split team ${teamIndex + 1} meets diversity requirement (${diversityScore.toFixed(2)}%)`);
        return candidateTeam;
      }

      if (diversityScore > bestDiversityScore) {
        bestDiversityScore = diversityScore;
        bestTeam = candidateTeam;
      }
    }

    return bestTeam || await this.buildRoleSplitTeam(config, players, match, request, teamIndex);
  }

  private async buildRoleSplitTeam(
    config: any,
    players: Player[],
    match: Match,
    request: TeamGenerationRequest,
    teamIndex: number
  ): Promise<AITeamAnalysis> {
    const selectedPlayers: Player[] = [];
    
    // Group players by their primary role
    const playersByRole = {
      WK: players.filter(p => p.player_role === 'WK'),
      BAT: players.filter(p => p.player_role === 'BAT'),
      AR: players.filter(p => p.player_role === 'AR'),
      BWL: players.filter(p => p.player_role === 'BWL')
    };

    // Step 1: Select exact number of wicket keepers
    const selectedWK = this.selectRoleSplitPlayers(playersByRole.WK, config.wicketKeepers, teamIndex, config.prioritizeForm);
    selectedPlayers.push(...selectedWK);

    // Step 2: Select exact number of all-rounders
    const selectedAR = this.selectRoleSplitPlayers(playersByRole.AR, config.allRounders, teamIndex, config.prioritizeForm);
    selectedPlayers.push(...selectedAR);

    // Step 3: Select bowlers based on bowling type preferences
    const allBowlers = playersByRole.BWL.filter(p => !selectedPlayers.some(sp => sp.id === p.id));
    
    // Categorize bowlers by bowling style
    const spinners = allBowlers.filter(p => 
      p.bowling_style?.toLowerCase().includes('spin') || 
      p.bowling_style?.toLowerCase().includes('orthodox') ||
      p.bowling_style?.toLowerCase().includes('leg')
    );
    const pacers = allBowlers.filter(p => 
      !p.bowling_style?.toLowerCase().includes('spin') && 
      !p.bowling_style?.toLowerCase().includes('orthodox') &&
      !p.bowling_style?.toLowerCase().includes('leg')
    );

    // Select specified number of spinners and pacers
    const selectedSpinners = this.selectRoleSplitPlayers(spinners, config.spinners, teamIndex, config.prioritizeForm);
    const selectedPacers = this.selectRoleSplitPlayers(pacers, config.pacers, teamIndex, config.prioritizeForm);
    selectedPlayers.push(...selectedSpinners, ...selectedPacers);

    // Step 4: Select batsmen based on batting order preferences
    const remainingBatsmen = playersByRole.BAT.filter(p => !selectedPlayers.some(sp => sp.id === p.id));
    
    // Categorize batsmen by batting order (using points as proxy for batting position)
    const sortedBatsmen = remainingBatsmen.sort((a, b) => (b.points || 0) - (a.points || 0));
    const topOrderBatsmen = sortedBatsmen.slice(0, Math.ceil(sortedBatsmen.length * 0.4));
    const middleOrderBatsmen = sortedBatsmen.slice(Math.ceil(sortedBatsmen.length * 0.4), Math.ceil(sortedBatsmen.length * 0.8));
    const lowerOrderBatsmen = sortedBatsmen.slice(Math.ceil(sortedBatsmen.length * 0.8));

    // Select specified number of batsmen from each order
    const selectedTopOrder = this.selectRoleSplitPlayers(topOrderBatsmen, config.topOrderBatsmen, teamIndex, config.prioritizeForm);
    const selectedMiddleOrder = this.selectRoleSplitPlayers(middleOrderBatsmen, config.middleOrderBatsmen, teamIndex, config.prioritizeForm);
    const selectedLowerOrder = this.selectRoleSplitPlayers(lowerOrderBatsmen, config.lowerOrderBatsmen, teamIndex, config.prioritizeForm);
    
    selectedPlayers.push(...selectedTopOrder, ...selectedMiddleOrder, ...selectedLowerOrder);

    // Step 5: Fill any remaining slots with best available players (fallback)
    while (selectedPlayers.length < 11) {
      const remainingPlayers = players.filter(p => 
        !selectedPlayers.some(sp => sp.id === p.id)
      ).sort((a, b) => (b.points || 0) - (a.points || 0));
      
      if (remainingPlayers.length > 0) {
        const playerIndex = (teamIndex + selectedPlayers.length) % Math.min(remainingPlayers.length, 5);
        selectedPlayers.push(remainingPlayers[playerIndex]);
      } else {
        break;
      }
    }

    // Ensure exactly 11 players
    const finalPlayers = selectedPlayers.slice(0, 11);

    // Select captain and vice-captain
    const { captain, viceCaptain } = this.selectRoleSplitCaptains(finalPlayers, teamIndex);

    // Calculate team statistics
    const totalCredits = finalPlayers.reduce((sum, p) => sum + (p.credits || 8), 0);
    const roleBalance = this.calculateRoleBalance(finalPlayers);
    const riskScore = this.calculateRoleSplitRiskScore(config, finalPlayers);
    const expectedPoints = this.calculateExpectedPoints(finalPlayers, captain, viceCaptain);

    return {
      players: finalPlayers,
      captain,
      viceCaptain,
      totalCredits,
      roleBalance,
      riskScore,
      expectedPoints,
      confidence: 85,
      reasoning: `Role-split team ${teamIndex + 1} with ${config.topOrderBatsmen} top-order, ${config.middleOrderBatsmen} middle-order batsmen, ${config.spinners} spinners, ${config.pacers} pacers`,
      insights: [
        `Batting Order: ${config.topOrderBatsmen} top + ${config.middleOrderBatsmen} middle + ${config.lowerOrderBatsmen} lower`,
        `Bowling Split: ${config.spinners} spinners + ${config.pacers} pacers`,
        `Role Balance: ${config.allRounders} AR + ${config.wicketKeepers} WK`,
        `Diversity Level: ${config.diversityLevel}`,
        `Form Priority: ${config.prioritizeForm ? 'Yes' : 'No'}`
      ]
    };
  }

  private selectRoleSplitPlayers(rolePlayers: Player[], count: number, teamIndex: number, prioritizeForm: boolean): Player[] {
    if (count === 0 || rolePlayers.length === 0) return [];

    // Sort players based on priority (form vs historical performance)
    const sortedPlayers = rolePlayers.sort((a, b) => {
      if (prioritizeForm) {
        // Prioritize recent form (using points as proxy)
        return (b.points || 0) - (a.points || 0);
      } else {
        // Balance between points and selection percentage
        const aScore = (a.points || 0) + (a.selection_percentage || 0) * 0.5;
        const bScore = (b.points || 0) + (b.selection_percentage || 0) * 0.5;
        return bScore - aScore;
      }
    });

    // Create variation using team index
    const availablePool = Math.min(sortedPlayers.length, count * 4); // Expand pool for variation
    const selectedPlayers: Player[] = [];
    const usedIndices = new Set<number>();

    for (let i = 0; i < count && i < sortedPlayers.length; i++) {
      let index = (teamIndex + i) % availablePool;
      
      // Ensure we don't pick the same player twice
      while (usedIndices.has(index) && usedIndices.size < availablePool) {
        index = (index + 1) % availablePool;
      }
      
      if (index < sortedPlayers.length) {
        selectedPlayers.push(sortedPlayers[index]);
        usedIndices.add(index);
      }
    }

    return selectedPlayers;
  }

  private selectRoleSplitCaptains(players: Player[], teamIndex: number): { captain: Player; viceCaptain: Player } {
    // Filter for captain-worthy players
    const captainCandidates = players.filter(p => 
      p.player_role === 'BAT' || p.player_role === 'AR' || p.player_role === 'WK'
    );

    if (captainCandidates.length < 2) {
      return { captain: players[0], viceCaptain: players[1] };
    }

    // Sort by performance
    const sortedCandidates = captainCandidates.sort((a, b) => (b.points || 0) - (a.points || 0));
    
    // Vary captain selection to ensure diversity
    const candidatePool = Math.min(sortedCandidates.length, 6);
    const captainIndex = teamIndex % candidatePool;
    const viceCaptainIndex = (teamIndex + 1) % candidatePool;

    return {
      captain: sortedCandidates[captainIndex],
      viceCaptain: sortedCandidates[viceCaptainIndex === captainIndex ? 
        (viceCaptainIndex + 1) % candidatePool : viceCaptainIndex]
    };
  }

  private validateRoleSplitTeam(team: Player[], config: any): boolean {
    const actualRoles = this.calculateRoleBalance(team);
    
    // Check if actual roles match expected configuration
    const expectedRoles = {
      wicketKeepers: config.wicketKeepers,
      allRounders: config.allRounders,
      // Note: batsmen and bowlers are split by type, but we validate the core roles
    };
    
    return actualRoles.wicketKeepers === expectedRoles.wicketKeepers &&
           actualRoles.allRounders === expectedRoles.allRounders;
  }

  private calculateRoleSplitRiskScore(config: any, players: Player[]): number {
    let riskScore = 50; // Base risk

    // Adjust based on diversity level
    if (config.diversityLevel === 'high') riskScore += 20;
    else if (config.diversityLevel === 'low') riskScore -= 20;

    // Adjust based on form prioritization
    if (config.prioritizeForm) riskScore += 10;

    // Adjust based on average selection percentage
    const avgSelection = players.reduce((sum, p) => sum + (p.selection_percentage || 0), 0) / players.length;
    if (avgSelection < 30) riskScore += 15; // Low ownership = higher risk
    else if (avgSelection > 70) riskScore -= 15; // High ownership = lower risk

    return Math.max(0, Math.min(100, riskScore));
  }

  private calculateTeamDiversityScore(candidateTeam: AITeamAnalysis, existingTeams: AITeamAnalysis[]): number {
    if (existingTeams.length === 0) return 100;

    let totalDiversityScore = 0;
    
    for (const existingTeam of existingTeams) {
      const candidatePlayerIds = new Set(candidateTeam.players.map(p => p.id));
      const existingPlayerIds = new Set(existingTeam.players.map(p => p.id));
      
      const differentPlayers = Array.from(candidatePlayerIds).filter(id => !existingPlayerIds.has(id)).length;
      const diversityPercentage = (differentPlayers / 11) * 100;
      
      totalDiversityScore += diversityPercentage;
    }

    return totalDiversityScore / existingTeams.length;
  }

  private calculateRoleBalance(players: Player[]): { batsmen: number; bowlers: number; allRounders: number; wicketKeepers: number } {
    const roleBalance = { batsmen: 0, bowlers: 0, allRounders: 0, wicketKeepers: 0 };
    
    players.forEach(player => {
      switch (player.player_role) {
        case 'BAT': roleBalance.batsmen++; break;
        case 'BWL': roleBalance.bowlers++; break;
        case 'AR': roleBalance.allRounders++; break;
        case 'WK': roleBalance.wicketKeepers++; break;
      }
    });
    
    return roleBalance;
  }

  private calculateExpectedPoints(players: Player[], captain: Player, viceCaptain: Player): number {
    const basePoints = players.reduce((sum, p) => sum + (p.points || 0), 0);
    const captainBonus = (captain.points || 0) * 1.0; // 2x - 1x = 1x bonus
    const viceCaptainBonus = (viceCaptain.points || 0) * 0.5; // 1.5x - 1x = 0.5x bonus
    
    return basePoints + captainBonus + viceCaptainBonus;
  }

  // Helper methods for team generation
  private generateBaseTeamVariations(request: TeamGenerationRequest): Promise<AITeamAnalysis[]> {
    // TODO: Implement base team variations for Strategy 8
    return Promise.resolve([]);
  }

  private applyStrategyFiltering(
    rolePlayers: AIPlayerRecommendation[],
    request: TeamGenerationRequest,
    teamIndex: number
  ): AIPlayerRecommendation[] {
    // Apply strategy-specific filtering logic
    const strategy = request.strategy;
    const userPrefs = request.userPreferences;
    
    if (strategy === 'core-hedge' && userPrefs?.corePlayers && userPrefs?.hedgePlayers) {
      // Prioritize core players first, then hedge players
      const corePlayerNames = userPrefs.corePlayers;
      const hedgePlayerNames = userPrefs.hedgePlayers;
      
      const coreRecs = rolePlayers.filter(rec => corePlayerNames.includes(rec.player.name));
      const hedgeRecs = rolePlayers.filter(rec => hedgePlayerNames.includes(rec.player.name));
      const otherRecs = rolePlayers.filter(rec => 
        !corePlayerNames.includes(rec.player.name) && !hedgePlayerNames.includes(rec.player.name)
      );
      
      return [...coreRecs, ...hedgeRecs, ...otherRecs];
    }
    
    if (strategy === 'stats-driven' && userPrefs?.riskProfile) {
      // Filter based on risk profile
      const riskProfile = userPrefs.riskProfile;
      
      if (riskProfile === 'conservative') {
        return rolePlayers.filter(rec => rec.player.selection_percentage > 50);
      } else if (riskProfile === 'aggressive') {
        return rolePlayers.filter(rec => rec.player.selection_percentage < 50);
      }
    }
    
    // Default: return players sorted by confidence
    return rolePlayers.sort((a, b) => b.confidence - a.confidence);
  }

  private forceVariedCaptainSelection(
    selectedPlayers: Player[],
    recommendations: AIPlayerRecommendation[],
    request: TeamGenerationRequest,
    teamIndex: number
  ): { captain: Player; viceCaptain: Player } {
    // Get captain-worthy players (BAT, AR, WK)
    const captainCandidates = selectedPlayers.filter(p => 
      p.player_role === 'BAT' || p.player_role === 'AR' || p.player_role === 'WK'
    );

    if (captainCandidates.length < 2) {
      return { captain: selectedPlayers[0], viceCaptain: selectedPlayers[1] };
    }

    // Check if user provided captain combos
    const userCombos = request.userPreferences?.combos;
    if (userCombos && userCombos.length > 0) {
      const combo = userCombos[teamIndex % userCombos.length];
      const captain = selectedPlayers.find(p => p.name === combo.captain);
      const viceCaptain = selectedPlayers.find(p => p.name === combo.viceCaptain);
      
      if (captain && viceCaptain) {
        return { captain, viceCaptain };
      }
    }

    // Sort candidates by captaincy score
    const sortedCandidates = captainCandidates.sort((a, b) => {
      const aRec = recommendations.find(r => r.player.id === a.id);
      const bRec = recommendations.find(r => r.player.id === b.id);
      const aScore = aRec?.captaincy_score || 0;
      const bScore = bRec?.captaincy_score || 0;
      return bScore - aScore;
    });

    // Vary captain selection across teams
    const captainIndex = teamIndex % Math.min(sortedCandidates.length, 4);
    const viceCaptainIndex = (teamIndex + 1) % Math.min(sortedCandidates.length, 4);
    
    const captain = sortedCandidates[captainIndex];
    const viceCaptain = sortedCandidates[viceCaptainIndex === captainIndex ? 
      (viceCaptainIndex + 1) % sortedCandidates.length : viceCaptainIndex];

    return { captain, viceCaptain };
  }

  private calculateRiskScore(selectedPlayers: Player[], request: TeamGenerationRequest): number {
    let riskScore = 50; // Base risk score

    // Calculate average selection percentage
    const avgSelection = selectedPlayers.reduce((sum, p) => sum + (p.selection_percentage || 0), 0) / selectedPlayers.length;
    
    if (avgSelection < 30) {
      riskScore += 20; // Low ownership = higher risk
    } else if (avgSelection > 70) {
      riskScore -= 20; // High ownership = lower risk
    }

    // Adjust based on strategy
    if (request.strategy === 'core-hedge') {
      riskScore -= 10; // Core-hedge is generally safer
    } else if (request.strategy === 'stats-driven') {
      const riskProfile = request.userPreferences?.riskProfile;
      if (riskProfile === 'aggressive') {
        riskScore += 15;
      } else if (riskProfile === 'conservative') {
        riskScore -= 15;
      }
    }

    // Adjust based on credit distribution
    const totalCredits = selectedPlayers.reduce((sum, p) => sum + (p.credits || 8), 0);
    if (totalCredits > 95) {
      riskScore += 10; // High credit teams are riskier
    } else if (totalCredits < 85) {
      riskScore -= 10; // Lower credit teams are safer
    }

    return Math.max(0, Math.min(100, riskScore));
  }

  private calculateTeamConfidence(selectedPlayers: Player[], recommendations: AIPlayerRecommendation[]): number {
    // Calculate average confidence from AI recommendations
    const playerConfidences = selectedPlayers.map(player => {
      const rec = recommendations.find(r => r.player.id === player.id);
      return rec?.confidence || 0.5;
    });

    const avgConfidence = playerConfidences.reduce((sum, conf) => sum + conf, 0) / playerConfidences.length;
    
    // Convert to percentage and add some variation
    return Math.round(avgConfidence * 100);
  }

  private generateTeamInsights(selectedPlayers: Player[], strategy: string): string[] {
    const insights: string[] = [];
    
    // Role balance insights
    const roleBalance = this.calculateRoleBalance(selectedPlayers);
    insights.push(`Role Balance: ${roleBalance.batsmen} BAT, ${roleBalance.bowlers} BWL, ${roleBalance.allRounders} AR, ${roleBalance.wicketKeepers} WK`);
    
    // Credit insights
    const totalCredits = selectedPlayers.reduce((sum, p) => sum + (p.credits || 8), 0);
    if (totalCredits > 95) {
      insights.push('High-credit premium team');
    } else if (totalCredits < 85) {
      insights.push('Budget-friendly team with good value picks');
    }
    
    // Selection percentage insights
    const avgSelection = selectedPlayers.reduce((sum, p) => sum + (p.selection_percentage || 0), 0) / selectedPlayers.length;
    if (avgSelection < 30) {
      insights.push('Low-ownership differential team');
    } else if (avgSelection > 70) {
      insights.push('Popular picks with high ownership');
    }
    
    // Strategy-specific insights
    if (strategy === 'core-hedge') {
      insights.push('Core-hedge strategy balances safety and upside');
    } else if (strategy === 'stats-driven') {
      insights.push('Statistics-driven selection with advanced filters');
    } else if (strategy === 'preset-scenarios') {
      insights.push('Preset scenario-based team composition');
    } else if (strategy === 'role-split') {
      insights.push('Role-split lineup with batting order and bowling balance');
    }
    
    return insights;
  }

  private generateTeamFromFilteredRecommendations(
    filteredRecommendations: AIPlayerRecommendation[],
    allRecommendations: AIPlayerRecommendation[],
    filters: any,
    request: TeamGenerationRequest,
    teamIndex: number
  ): AITeamAnalysis {
    console.log(`📊 Generating team ${teamIndex + 1} from ${filteredRecommendations.length} filtered recommendations`);
    
    // Get a valid Dream11 team composition
    const validCompositions = Dream11TeamValidator.generateValidTeamCompositions();
    const targetComposition = validCompositions[teamIndex % validCompositions.length];

    const selectedPlayers: Player[] = [];
    let totalCredits = 0;
    const maxCredits = DREAM11_RULES.maxCredits;
    
    // Track team counts to enforce max 7 from one team
    const teamCounts: Record<string, number> = {};
    
    // Group filtered recommendations by role
    const playersByRole = this.groupRecommendationsByRole(filteredRecommendations);
    
    // Role balance tracking
    const roleBalance = { batsmen: 0, bowlers: 0, allRounders: 0, wicketKeepers: 0 };

    // Select players for each role according to target composition
    Object.entries(targetComposition).forEach(([role, count]) => {
      const roleCount = count as number;
      const rolePlayers = playersByRole[role as keyof typeof playersByRole] || [];
      
      let selected = 0;
      for (const rec of rolePlayers) {
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

    // Fill remaining slots if needed
    while (selectedPlayers.length < DREAM11_RULES.totalPlayers) {
      const remainingRecs = allRecommendations.filter(rec => 
        !selectedPlayers.some(p => p.id === rec.player.id)
      );
      
      if (remainingRecs.length === 0) break;
      
      const nextPlayer = remainingRecs[0].player;
      selectedPlayers.push(nextPlayer);
      totalCredits += nextPlayer.credits || 8;
    }

    // Ensure exactly 11 players
    const finalPlayers = selectedPlayers.slice(0, 11);

    // Select captain and vice-captain
    const { captain, viceCaptain } = this.forceVariedCaptainSelection(finalPlayers, allRecommendations, request, teamIndex);

    return {
      players: finalPlayers,
      captain,
      viceCaptain,
      totalCredits,
      roleBalance,
      riskScore: this.calculateRiskScore(finalPlayers, request),
      expectedPoints: this.calculateExpectedPoints(finalPlayers, captain, viceCaptain),
      confidence: this.calculateTeamConfidence(finalPlayers, allRecommendations),
      insights: this.generateTeamInsights(finalPlayers, request.strategy),
      reasoning: `Stats-driven team ${teamIndex + 1} with enhanced filtering applied`
    };
  }

  private createRolePriorityEntries(
    players: Player[], 
    targetCount: number, 
    roleType: string, 
    teamIndex: number, 
    prioritizeForm: boolean
  ): Array<{ player: Player; score: number; roleType: string }> {
    if (targetCount === 0 || players.length === 0) return [];

    // Sort players based on priority
    const sortedPlayers = players.sort((a, b) => {
      if (prioritizeForm) {
        return (b.points || 0) - (a.points || 0);
      } else {
        const aScore = (a.points || 0) + (a.selection_percentage || 0) * 0.5;
        const bScore = (b.points || 0) + (b.selection_percentage || 0) * 0.5;
        return bScore - aScore;
      }
    });

    // Create priority entries with varying scores to ensure team diversity
    const entries = [];
    const poolSize = Math.min(sortedPlayers.length, targetCount * 3);
    
    for (let i = 0; i < poolSize; i++) {
      const player = sortedPlayers[i];
      const baseScore = (player.points || 0) + (player.selection_percentage || 0) * 0.3;
      
      // Add variation based on team index to ensure different teams
      const variation = (teamIndex + i) % 3;
      const finalScore = baseScore + variation * 2;
      
      entries.push({
        player,
        score: finalScore,
        roleType
      });
    }

    return entries;
  }
}

export const aiService = new AIService();
