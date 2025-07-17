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
    
    // Strategy 4 - New data structure from frontend
    selections?: {
      core: any[];
      hedge: any[];
      differential: any[];
    };
    captainOrder?: string[];
    
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
        console.log('🎯 Strategy 8: Processing base team variations');
        console.log('Base team length:', request.userPreferences.baseTeam.length);
        console.log('Optimization rules:', request.userPreferences.optimizationRules);
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

  private selectCorePlayersWithVariation(
    playersByRole: { WK: any[], BAT: any[], AR: any[], BWL: any[] },
    config: any,
    teamIndex: number,
    match: Match
  ): Player[] {
    console.log(`🎯 Core + Variation selection for team ${teamIndex + 1} (targeting 25%+ variation)`);
    
    const selectedPlayers: Player[] = [];
    const targetVariationPercentage = 25; // Minimum 25% variation
    const targetVariationPlayers = Math.ceil(11 * (targetVariationPercentage / 100)); // ~3 players minimum
    
    // Define core and swap pools for each role based on preset requirements
    const roleRequirements = this.getRoleRequirements(config);
    
    for (const [role, requiredCount] of Object.entries(roleRequirements)) {
      if (requiredCount === 0) continue;
      
      const availablePlayers = playersByRole[role as keyof typeof playersByRole] || [];
      if (availablePlayers.length === 0) continue;
      
      console.log(`📊 ${role}: Need ${requiredCount}, Available ${availablePlayers.length}`);
      
      // For Team 1 (teamIndex 0): Select top players as "core"
      if (teamIndex === 0) {
        const coreSelections = availablePlayers.slice(0, requiredCount);
        selectedPlayers.push(...coreSelections);
        console.log(`  🎯 Team 1 Core: Selected top ${coreSelections.length} ${role} players`);
      } else {
        // For subsequent teams: Mix core players with variations
        const coreCount = Math.max(1, requiredCount - Math.ceil(requiredCount * 0.4)); // Keep 60% as core
        const variationCount = requiredCount - coreCount;
        
        // Select core players (top performers)
        const coreSelections = availablePlayers.slice(0, coreCount);
        selectedPlayers.push(...coreSelections);
        
        // Create variation pool from remaining qualified players
        const variationPool = availablePlayers.slice(coreCount);
        
        if (variationPool.length > 0 && variationCount > 0) {
          // Systematic variation based on team index
          const variationSelections = this.selectVariationPlayers(
            variationPool,
            variationCount,
            teamIndex,
            role,
            config
          );
          selectedPlayers.push(...variationSelections);
          
          console.log(`  🔄 Team ${teamIndex + 1}: ${coreCount} core + ${variationSelections.length} variation ${role} players`);
        } else {
          // Not enough variation pool, take remaining from top
          const fallbackSelections = availablePlayers.slice(coreCount, requiredCount);
          selectedPlayers.push(...fallbackSelections);
          console.log(`  ⚠️ Team ${teamIndex + 1}: Limited variation pool for ${role}, using fallback`);
        }
      }
    }
    
    console.log(`✅ Selected ${selectedPlayers.length}/11 players with core+variation strategy`);
    return selectedPlayers;
  }

  private getRoleRequirements(config: any): { [key: string]: number } {
    // Default role requirements based on configuration
    let requirements: { [key: string]: number } = {
      'WK': config.wicketKeepers || 1,
      'BAT': (config.topOrderBatsmen || 0) + (config.middleOrderBatsmen || 0) + (config.lowerOrderBatsmen || 0),
      'AR': config.allRounders || 1,
      'BWL': (config.spinners || 0) + (config.pacers || 0)
    };
    
    // Preset-specific adjustments
    if (config.preset === 'all-rounder-heavy') {
      requirements['AR'] = Math.min(4, requirements['AR'] + 1);
      requirements['BAT'] = Math.max(2, requirements['BAT'] - 1);
    } else if (config.preset === 'top-order-stack') {
      requirements['BAT'] = Math.min(5, requirements['BAT'] + 1);
      requirements['BWL'] = Math.max(3, requirements['BWL'] - 1);
    } else if (config.preset === 'bowling-special') {
      requirements['BWL'] = Math.min(5, requirements['BWL'] + 1);
      requirements['BAT'] = Math.max(2, requirements['BAT'] - 1);
    }
    
    // Ensure total equals 11
    const total = Object.values(requirements).reduce((sum, count) => sum + count, 0);
    if (total !== 11) {
      console.warn(`⚠️ Role requirements total ${total}, adjusting to 11`);
      // Adjust the largest role requirement
      const maxRole = Object.keys(requirements).reduce((a, b) => 
        requirements[a] > requirements[b] ? a : b
      );
      requirements[maxRole] += (11 - total);
    }
    
    return requirements;
  }

  private selectVariationPlayers(
    variationPool: any[],
    count: number,
    teamIndex: number,
    role: string,
    config: any
  ): Player[] {
    if (variationPool.length === 0 || count === 0) return [];
    
    const selections: Player[] = [];
    
    // Create deterministic but varied selection based on team index
    for (let i = 0; i < count && i < variationPool.length; i++) {
      // Use different algorithms for each role to ensure variety
      let selectionIndex: number;
      
      if (role === 'WK') {
        // For WK, simple rotation since usually limited pool
        selectionIndex = (teamIndex - 1) % variationPool.length;
      } else if (role === 'BAT') {
        // For batsmen, use preset-specific variation patterns
        const presetMultiplier = this.getPresetMultiplier(config.preset);
        selectionIndex = ((teamIndex - 1) * presetMultiplier + i * 2) % variationPool.length;
      } else if (role === 'AR') {
        // For all-rounders, weighted towards versatility
        const versatilityOffset = config.versatilityFocus ? 1 : 0;
        selectionIndex = ((teamIndex - 1) * 2 + i + versatilityOffset) % variationPool.length;
      } else if (role === 'BWL') {
        // For bowlers, consider bowling conditions
        const conditionOffset = config.bowlingConditions ? 2 : 0;
        selectionIndex = ((teamIndex - 1) * 3 + i + conditionOffset) % variationPool.length;
      } else {
        // Default variation
        selectionIndex = ((teamIndex - 1) + i) % variationPool.length;
      }
      
      // Ensure we don't select the same player twice
      while (selections.some(p => p.id === variationPool[selectionIndex].id) && 
             selections.length < variationPool.length) {
        selectionIndex = (selectionIndex + 1) % variationPool.length;
      }
      
      selections.push(variationPool[selectionIndex]);
    }
    
    return selections;
  }

  private getPresetMultiplier(preset: string): number {
    const multipliers: { [key: string]: number } = {
      'team-a-bias': 2,
      'team-b-bias': 3,
      'high-differential': 4,
      'balanced': 2,
      'all-rounder-heavy': 3,
      'top-order-stack': 4,
      'bowling-special': 5,
      'death-overs': 3
    };
    
    return multipliers[preset] || 2;
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
    
    // Get player objects from selections object structure
    const getPlayersFromSelections = (players: any[]): Player[] => {
      return players.map(playerObj => 
        recommendations.find(r => r.player.id === playerObj.id)?.player
      ).filter((p): p is Player => !!p);
    };

    // Extract selections from the user preferences
    const selections = prefs.selections || { core: [], hedge: [], differential: [] };
    const captainOrder = prefs.captainOrder || [];
    
    // 1. Core Players (always include most core players)
    const corePlayerObjs = getPlayersFromSelections(selections.core);
    const coreToInclude = Math.max(6, Math.min(corePlayerObjs.length, 9)); // Include 6-9 core players
    
    // Rotate which core players to include for team variation
    for (let i = 0; i < coreToInclude; i++) {
      const coreIndex = (teamIndex + i) % corePlayerObjs.length;
      const corePlayer = corePlayerObjs[coreIndex];
      if (corePlayer && !selectedPlayers.find(p => p.id === corePlayer.id)) {
        selectedPlayers.push(corePlayer);
      }
    }

    // 2. Hedge Players (~50% teams with rotation)
    const hedgePlayerObjs = getPlayersFromSelections(selections.hedge);
    const hedgePercentage = 50;
    const includeHedge = (teamIndex % 2 === 0); // Alternate teams get hedge players
    
    if (includeHedge && hedgePlayerObjs.length > 0) {
      // Rotate through hedge players for variation
      const hedgeCount = Math.min(
        Math.ceil(hedgePlayerObjs.length / 2), // Include about half of hedge players
        DREAM11_RULES.totalPlayers - selectedPlayers.length - 1 // leave room for others
      );
      for (let i = 0; i < hedgeCount; i++) {
        const hedgeIndex = (teamIndex + i) % hedgePlayerObjs.length;
        const hedgePlayer = hedgePlayerObjs[hedgeIndex];
        if (hedgePlayer && !selectedPlayers.find(p => p.id === hedgePlayer.id)) {
          selectedPlayers.push(hedgePlayer);
        }
      }
    }

    // 3. Differential Players (1-2 teams only)
    const differentialPlayerObjs = getPlayersFromSelections(selections.differential);
    const isDifferentialTeam = teamIndex < Math.min(2, differentialPlayerObjs.length);
    
    if (isDifferentialTeam && differentialPlayerObjs.length > 0) {
      const diffPlayer = differentialPlayerObjs[teamIndex];
      if (diffPlayer && !selectedPlayers.find(p => p.id === diffPlayer.id)) {
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

    // Fill remaining slots with valid players ensuring role balance
    const roleBalance = this.calculateRoleBalance(selectedPlayers);
    const validCompositions = Dream11TeamValidator.generateValidTeamCompositions();
    const targetComposition = validCompositions[0]; // Use standard composition
    
    // Prioritize filling roles that are short
    const roleShortfall = {
      BAT: Math.max(0, (targetComposition.BAT || 3) - roleBalance.batsmen),
      BWL: Math.max(0, (targetComposition.BWL || 3) - roleBalance.bowlers),
      AR: Math.max(0, (targetComposition.AR || 2) - roleBalance.allRounders),
      WK: Math.max(0, (targetComposition.WK || 1) - roleBalance.wicketKeepers)
    };

    // Sort available players by role priority and quality
    const sortedRecs = availableRecs.sort((a, b) => {
      const aRole = a.player.player_role || 'BAT';
      const bRole = b.player.player_role || 'BAT';
      const aShortfall = roleShortfall[aRole as keyof typeof roleShortfall] || 0;
      const bShortfall = roleShortfall[bRole as keyof typeof roleShortfall] || 0;
      
      // Prioritize roles we need more of
      if (aShortfall !== bShortfall) return bShortfall - aShortfall;
      
      // Then by player quality (points and selection percentage)
      const aScore = (a.player.points || 0) + (a.player.selection_percentage || 0);
      const bScore = (b.player.points || 0) + (b.player.selection_percentage || 0);
      return bScore - aScore;
    });

    // Fill remaining slots
    for (const rec of sortedRecs) {
      if (selectedPlayers.length >= DREAM11_RULES.totalPlayers) break;
      
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

    // Trim to exactly 11 players
    const finalTeam = selectedPlayers.slice(0, DREAM11_RULES.totalPlayers);

    // Validate team composition
    const validation = Dream11TeamValidator.validateTeamComposition(finalTeam);
    if (!validation.isValid) {
      console.warn('Core-hedge team validation failed, using fallback');
      return this.generateFallbackTeam(recommendations, request, teamIndex);
    }

    // Select captain and vice-captain using captain order from frontend
    const { captain, viceCaptain } = this.selectCaptainFromOrder(finalTeam, captainOrder, teamIndex);

    // Calculate team insights
    const coreCount = finalTeam.filter(p => 
      corePlayerObjs.some(core => core.id === p.id)
    ).length;
    const hedgeCount = finalTeam.filter(p => 
      hedgePlayerObjs.some(hedge => hedge.id === p.id)
    ).length;
    const diffCount = finalTeam.filter(p => 
      differentialPlayerObjs.some(diff => diff.id === p.id)
    ).length;

    const insights = [
      `Core-hedge strategy: ${coreCount} core, ${hedgeCount} hedge, ${diffCount} differential players`,
      `Team ${teamIndex + 1}: ${includeHedge ? 'Includes hedge picks' : 'Core-focused team'}`,
      `${isDifferentialTeam ? 'Differential team with unique picks' : 'Standard core-hedge balance'}`,
      `Captain: ${captain.name}, Vice-Captain: ${viceCaptain.name}`
    ];

    return {
      players: finalTeam,
      captain,
      viceCaptain,
      totalCredits: finalTeam.reduce((sum, p) => sum + (p.credits || 8), 0),
      roleBalance: this.calculateRoleBalance(finalTeam),
      riskScore: this.calculateRiskScore(finalTeam, request),
      expectedPoints: this.calculateExpectedPoints(finalTeam, captain, viceCaptain),
      confidence: this.calculateTeamConfidence(finalTeam, recommendations),
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
    try {
      console.log('🎯 Strategy 2: Generating Same XI teams with different captains');
      
      const { players, combos } = request.userPreferences!;
      const teamCount = request.teamCount;
      
      if (!players || !Array.isArray(players) || players.length !== 11) {
        console.error('❌ Strategy 2: Invalid player selection - need exactly 11 players');
        return Promise.resolve([]);
      }

      if (!combos || !Array.isArray(combos) || combos.length === 0) {
        console.error('❌ Strategy 2: No captain/vice-captain combinations provided');
        return Promise.resolve([]);
      }

      // Validate combinations total to 100%
      const totalPercentage = combos.reduce((sum: number, combo: any) => sum + (combo.percentage || 0), 0);
      if (totalPercentage !== 100) {
        console.error(`❌ Strategy 2: Invalid percentage distribution. Total: ${totalPercentage}%, Expected: 100%`);
        return Promise.resolve([]);
      }

      const teams: AITeamAnalysis[] = [];
      let teamIndex = 0;

      // Generate teams based on percentage distribution
      for (const combo of combos) {
        const teamsForThisCombo = Math.round((combo.percentage / 100) * teamCount);
        
        for (let i = 0; i < teamsForThisCombo && teamIndex < teamCount; i++) {
          const team = this.createSameXITeam(
            players,
            combo.captain,
            combo.viceCaptain,
            teamIndex + 1,
            combo.percentage
          );
          teams.push(team);
          teamIndex++;
        }
      }

      // Fill remaining teams if percentage rounding left some unfilled
      while (teams.length < teamCount) {
        const combo = combos[teams.length % combos.length];
        const team = this.createSameXITeam(
          players,
          combo.captain,
          combo.viceCaptain,
          teams.length + 1,
          combo.percentage
        );
        teams.push(team);
      }

      console.log(`✅ Strategy 2: Generated ${teams.length} teams with same XI, different captains`);
      return Promise.resolve(teams);
    } catch (error) {
      console.error('❌ Strategy 2 error:', error);
      return Promise.resolve([]);
    }
  }

  private createSameXITeam(
    players: any[],
    captainName: string,
    viceCaptainName: string,
    teamNumber: number,
    percentage: number
  ): AITeamAnalysis {
    // Find captain and vice-captain from players
    const captain = players.find(p => p.name === captainName) || players[0];
    const viceCaptain = players.find(p => p.name === viceCaptainName) || players[1];

    // Calculate total credits
    const totalCredits = players.reduce((sum, p) => sum + (p.credits || 8), 0);

    // Estimate team points
    const expectedPoints = players.reduce((sum, p) => sum + (p.points || 0), 0);

    // Calculate role balance
    const roleBalance = this.calculateRoleBalanceForSameXI(players);

    return {
      players: players,
      captain: captain,
      viceCaptain: viceCaptain,
      totalCredits: totalCredits,
      expectedPoints: expectedPoints,
      confidence: 85, // High confidence since user manually selected the XI
      riskScore: 30, // Lower risk since same XI across all teams
      reasoning: `Same XI Team ${teamNumber} with ${captainName} (C) and ${viceCaptainName} (VC) - ${percentage}% distribution`,
      roleBalance: roleBalance
    };
  }

  private calculateRoleBalanceForSameXI(players: any[]): { batsmen: number; bowlers: number; allRounders: number; wicketKeepers: number } {
    const roles = { batsmen: 0, bowlers: 0, allRounders: 0, wicketKeepers: 0 };
    
    players.forEach(player => {
      switch (player.player_role) {
        case 'BAT':
          roles.batsmen++;
          break;
        case 'BWL':
          roles.bowlers++;
          break;
        case 'AR':
          roles.allRounders++;
          break;
        case 'WK':
          roles.wicketKeepers++;
          break;
      }
    });
    
    return roles;
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
    console.log(`🎯 Building role-split team ${teamIndex + 1} with preset: ${config.preset || 'default'} (targeting 25%+ variation)`);
    
    // Apply preset-specific configurations
    const enhancedConfig = this.applyPresetConfiguration(config, match, teamIndex);
    
    // Enhanced player analysis with AI scoring including preset logic
    const enhancedPlayers = await this.analyzePlayersForRoleSplit(players, match, enhancedConfig, teamIndex);
    
    // Group players by their role with enhanced scoring
    const playersByRole = {
      WK: enhancedPlayers.filter(p => p.player_role === 'WK'),
      BAT: enhancedPlayers.filter(p => p.player_role === 'BAT'),
      AR: enhancedPlayers.filter(p => p.player_role === 'AR'),
      BWL: enhancedPlayers.filter(p => p.player_role === 'BWL')
    };

    console.log(`📊 Enhanced analysis for preset "${enhancedConfig.preset}": WK(${playersByRole.WK.length}), BAT(${playersByRole.BAT.length}), AR(${playersByRole.AR.length}), BWL(${playersByRole.BWL.length})`);

    // NEW: Core + Variation Selection Strategy
    const selectedPlayers = this.selectCorePlayersWithVariation(
      playersByRole,
      enhancedConfig,
      teamIndex,
      match
    );

    // Fill remaining slots with strategic picks based on preset
    const remainingSlots = 11 - selectedPlayers.length;
    if (remainingSlots > 0) {
      const strategicFillers = this.selectStrategicFillers(
        enhancedPlayers.filter(p => !selectedPlayers.some(sp => sp.id === p.id)),
        remainingSlots,
        teamIndex,
        config,
        match
      );
      selectedPlayers.push(...strategicFillers);
    }

    // Ensure exactly 11 players
    const finalPlayers = selectedPlayers.slice(0, 11);

    // Validate Dream11 rules
    const validation = Dream11TeamValidator.validateTeamComposition(finalPlayers);
    if (!validation.isValid) {
      console.warn(`⚠️ Team ${teamIndex + 1} validation failed, applying fixes`);
      return this.fixAndReturnRoleSplitTeam(enhancedPlayers, config, match, request, teamIndex);
    }

    // Intelligent Captain and Vice-Captain selection
    const { captain, viceCaptain } = this.selectIntelligentCaptains(finalPlayers, teamIndex, match, config);

    // Calculate enhanced team statistics
    const teamStats = this.calculateEnhancedTeamStats(finalPlayers, captain, viceCaptain, match, config);

    // Generate strategy descriptions for reasoning
    const battingStrategy = this.determineBattingStrategy(match, config, teamIndex);
    const bowlingStrategy = this.determineBowlingStrategy(match, config, teamIndex);

    return {
      players: finalPlayers,
      captain,
      viceCaptain,
      totalCredits: teamStats.totalCredits,
      roleBalance: teamStats.roleBalance,
      riskScore: teamStats.riskScore,
      expectedPoints: teamStats.expectedPoints,
      confidence: teamStats.confidence,
      reasoning: this.generateRoleSplitReasoning(config, teamIndex, battingStrategy, bowlingStrategy),
      insights: this.generateRoleSplitInsights(finalPlayers, config, teamIndex, match)
    };
  }

  private async analyzePlayersForRoleSplit(
    players: Player[], 
    match: Match, 
    config: any, 
    teamIndex: number
  ): Promise<(Player & { aiScore: number; matchScore: number; formScore: number; presetScore: number })[]> {
    const enhancedPlayers = players.map(player => {
      // Base scoring
      const baseScore = (player.points || 0) * 0.4 + (player.selection_percentage || 0) * 0.1;
      
      // Form analysis (last 5 matches performance indicator)
      const formScore = this.calculateFormScore(player, config.prioritizeForm);
      
      // Match-specific scoring based on conditions
      const matchScore = this.calculateMatchSpecificScore(player, match, config);
      
      // Role-specific bonus
      const roleBonus = this.calculateRoleBonus(player, config, teamIndex);
      
      // NEW: Preset-specific scoring for advanced strategies
      const presetScore = this.calculatePresetSpecificScore(player, config, match, teamIndex);
      
      // Combine all factors with intelligent weighting
      const aiScore = (baseScore * 0.25) + (formScore * 0.25) + (matchScore * 0.2) + (roleBonus * 0.15) + (presetScore * 0.15);
      
      return {
        ...player,
        aiScore,
        matchScore,
        formScore,
        presetScore
      };
    });

    // Sort by AI score for intelligent selection
    return enhancedPlayers.sort((a, b) => b.aiScore - a.aiScore);
  }

  private calculatePresetSpecificScore(player: Player, config: any, match: Match, teamIndex: number): number {
    let score = 50; // Base preset score
    
    // Team A High Total, Team B Collapse strategy
    if (config.teamBias === 'teamA') {
      const teamNames = match.team_name?.split(' vs ') || [];
      if (teamNames.length >= 2) {
        if (player.team_name === teamNames[0] && player.player_role === 'BAT') {
          score += 25; // Heavy bonus for Team A batsmen
        }
        if (player.team_name === teamNames[1] && player.player_role === 'BWL') {
          score += 20; // Bonus for Team B bowlers
        }
      }
    }
    
    // Team B High Total, Team A Collapse strategy
    if (config.teamBias === 'teamB') {
      const teamNames = match.team_name?.split(' vs ') || [];
      if (teamNames.length >= 2) {
        if (player.team_name === teamNames[1] && player.player_role === 'BAT') {
          score += 25; // Heavy bonus for Team B batsmen
        }
        if (player.team_name === teamNames[0] && player.player_role === 'BWL') {
          score += 20; // Bonus for Team A bowlers
        }
      }
    }
    
    // High Differentials Strategy
    if (config.differentialFocus) {
      const ownership = player.selection_percentage || 50;
      if (ownership < (config.ownershipThreshold || 20)) {
        score += 30; // High bonus for low-ownership players
      } else if (ownership > 60) {
        score -= 15; // Penalty for high-ownership players
      }
    }
    
    // All-Rounder Heavy strategy
    if (config.versatilityFocus && player.player_role === 'AR') {
      score += 25; // All-rounders get major bonus
    }
    
    // Top Order Batting Stack
    if (config.powerplayFocus && player.player_role === 'BAT') {
      // Assume higher points = better batting position
      const battingPosition = this.estimateBattingPosition(player);
      if (battingPosition <= 3) {
        score += 20; // Top-order batsmen bonus
      }
    }
    
    // Bowling Pitch Special
    if (config.bowlingConditions && player.player_role === 'BWL') {
      score += 20; // Bowlers get bonus
      const pitchCondition = match.pitch_condition?.toLowerCase() || '';
      if (pitchCondition.includes('bowl') || pitchCondition.includes('seam') || pitchCondition.includes('spin')) {
        score += 15; // Extra bonus for bowling-friendly conditions
      }
    }
    
    // Death Overs Specialists
    if (config.deathOversFocus) {
      if (player.player_role === 'BAT') {
        // Finishers - typically middle/lower order batsmen with high strike rates
        const battingPosition = this.estimateBattingPosition(player);
        if (battingPosition >= 4 && (player.points || 0) > 60) {
          score += 18; // Finisher bonus
        }
      }
      if (player.player_role === 'BWL') {
        // Death bowlers - typically pacers with good economy
        if (!player.bowling_style?.toLowerCase().includes('spin')) {
          score += 15; // Pacer death bowler bonus
        }
      }
    }
    
    // Balanced strategy
    if (config.balanced) {
      // No extreme bonuses, slight preference for consistent performers
      if ((player.selection_percentage || 0) > 30 && (player.selection_percentage || 0) < 70) {
        score += 10; // Moderate ownership bonus
      }
    }
    
    return Math.max(0, Math.min(100, score));
  }

  private estimateBattingPosition(player: Player): number {
    // Estimate batting position based on role and performance
    if (player.player_role === 'WK') return 1; // Often openers or top order
    if (player.player_role === 'BAT') {
      // Higher points typically indicate higher batting order
      const points = player.points || 0;
      if (points > 80) return 1; // Likely opener
      if (points > 60) return 2; // Likely #3
      if (points > 40) return 4; // Middle order
      return 6; // Lower middle order
    }
    if (player.player_role === 'AR') return 5; // Typically middle order
    return 8; // Bowlers typically bat lower
  }

  private calculateFormScore(player: Player, prioritizeForm: boolean): number {
    if (!prioritizeForm) return (player.points || 0) * 0.5;
    
    let formScore = 50; // Base score
    
    // Use advanced database stats if available
    if ((player as any).recent_form_rating !== undefined) {
      formScore = Math.max(0, Math.min(100, (player as any).recent_form_rating * 100));
    } else {
      // Fallback to points-based calculation
      formScore = Math.min(100, (player.points || 0) / 2);
    }
    
    // Bonus for consistency
    if ((player as any).consistency_score !== undefined) {
      formScore += ((player as any).consistency_score * 15); // Up to 15 points for consistency
    }
    
    // Bonus for versatility in all-rounder heavy strategies
    if ((player as any).versatility_score !== undefined && player.player_role === 'AR') {
      formScore += ((player as any).versatility_score * 10); // Up to 10 points for versatility
    }
    
    return Math.max(0, Math.min(100, formScore));
  }

  private calculateMatchSpecificScore(player: Player, match: Match, config: any): number {
    let score = 50; // Base score
    
    // Use database venue performance if available
    if ((player as any).venue_performance !== undefined) {
      score += ((player as any).venue_performance * 25); // Up to 25 points for venue performance
    }
    
    // Use database pitch suitability if available
    if ((player as any).pitch_suitability !== undefined) {
      score += ((player as any).pitch_suitability * 20); // Up to 20 points for pitch suitability
    }
    
    // Use database weather adaptability if available
    if ((player as any).weather_adaptability !== undefined) {
      score += ((player as any).weather_adaptability * 15); // Up to 15 points for weather adaptability
    }
    
    // Fallback to manual pitch condition adjustments if database stats not available
    if ((player as any).venue_performance === undefined && (player as any).pitch_suitability === undefined) {
      const pitchCondition = match.pitch_condition?.toLowerCase() || '';
      
      if (pitchCondition.includes('spin') && player.bowling_style?.toLowerCase().includes('spin')) {
        score += 20; // Spinners get bonus on spin-friendly pitches
      }
      
      if (pitchCondition.includes('pace') && !player.bowling_style?.toLowerCase().includes('spin')) {
        score += 20; // Pacers get bonus on pace-friendly pitches
      }
      
      if (pitchCondition.includes('bat') && ['BAT', 'WK'].includes(player.player_role)) {
        score += 15; // Batsmen get bonus on batting-friendly pitches
      }
      
      if (pitchCondition.includes('bowl') && ['BWL', 'AR'].includes(player.player_role)) {
        score += 15; // Bowlers get bonus on bowling-friendly pitches
      }
    }
    
    // Weather condition adjustments (if database stats not available)
    if ((player as any).weather_adaptability === undefined) {
      const weatherCondition = match.weather_condition?.toLowerCase() || '';
      
      if (weatherCondition.includes('cloudy') && player.player_role === 'BWL') {
        score += 10; // Bowlers benefit from cloudy conditions
      }
      
      if (weatherCondition.includes('sunny') && ['BAT', 'WK'].includes(player.player_role)) {
        score += 5; // Batsmen slightly benefit from clear conditions
      }
    }
    
    return Math.max(0, Math.min(100, score));
  }

  private calculateRoleBonus(player: Player, config: any, teamIndex: number): number {
    let bonus = 0;
    
    // Configuration-specific bonuses
    if (player.player_role === 'AR' && config.allRounders >= 2) {
      bonus += 10; // All-rounder heavy team bonus
    }
    
    if (player.player_role === 'BWL') {
      if (config.spinners > config.pacers && player.bowling_style?.toLowerCase().includes('spin')) {
        bonus += 15; // Spinner-heavy configuration
      } else if (config.pacers > config.spinners && !player.bowling_style?.toLowerCase().includes('spin')) {
        bonus += 15; // Pacer-heavy configuration
      }
    }
    
    // Team index variation for diversity
    const variationBonus = (teamIndex % 3) * 5; // Adds 0, 5, or 10 bonus
    bonus += variationBonus;
    
    return bonus;
  }

  private selectIntelligentRolePlayers(
    rolePlayers: (Player & { aiScore: number; matchScore: number; formScore: number; presetScore?: number })[],
    count: number,
    teamIndex: number,
    role: string,
    config: any,
    match: Match
  ): Player[] {
    if (count === 0 || rolePlayers.length === 0) return [];

    // Create intelligent selection with FORCED diversity for preset strategies
    const selectionPool = Math.min(rolePlayers.length, Math.max(count * 5, 15)); // Larger pool for more diversity
    const selectedPlayers: Player[] = [];
    const usedIndices = new Set<number>();

    for (let i = 0; i < count && i < rolePlayers.length; i++) {
      // ENHANCED diversity algorithm for preset-based strategies
      let baseIndex: number;
      
      if (config.preset && teamIndex > 0) {
        // For preset strategies, use a more aggressive variation algorithm
        const presetVariation = this.getPresetVariationOffset(config.preset, teamIndex, i);
        const roleVariation = role === 'WK' ? 0 : Math.floor(teamIndex / 2); // Less variation for WK
        const combinedVariation = presetVariation + roleVariation;
        
        baseIndex = (i + combinedVariation) % selectionPool;
      } else {
        // Standard variation for non-preset strategies
        baseIndex = Math.floor((teamIndex + i) * 1.7) % selectionPool;
      }
      
      // Add randomness based on team index to ensure variation
      const variationOffset = config.enforceVariation !== false ? 
        (teamIndex * 3 + i * 2) % Math.min(5, selectionPool) : 0;
      let index = (baseIndex + variationOffset) % selectionPool;
      
      // Ensure we don't pick the same player twice with enhanced fallback
      let attempts = 0;
      while (usedIndices.has(index) && attempts < selectionPool) {
        index = (index + teamIndex + attempts + 1) % selectionPool;
        attempts++;
      }
      
      if (index < rolePlayers.length && !usedIndices.has(index)) {
        selectedPlayers.push(rolePlayers[index]);
        usedIndices.add(index);
      } else if (selectedPlayers.length < count) {
        // Fallback: find any unused player for this role
        for (let fallbackIndex = 0; fallbackIndex < rolePlayers.length; fallbackIndex++) {
          if (!usedIndices.has(fallbackIndex)) {
            selectedPlayers.push(rolePlayers[fallbackIndex]);
            usedIndices.add(fallbackIndex);
            break;
          }
        }
      }
    }

    console.log(`🎯 Selected ${selectedPlayers.length} ${role} players for team ${teamIndex + 1} (preset: ${config.preset || 'none'})`);
    return selectedPlayers;
  }

  private getPresetVariationOffset(preset: string, teamIndex: number, playerIndex: number): number {
    // Different variation patterns for each preset to ensure unique team compositions
    const presetMultipliers: { [key: string]: number } = {
      'team-a-high-total-team-b-collapse': 3,
      'team-b-high-total-team-a-collapse': 4,
      'high-differentials-strategy': 5,
      'balanced-roles': 2,
      'all-rounder-heavy-lineup': 6,
      'top-order-batting-stack': 7,
      'bowling-pitch-special': 8,
      'death-overs-specialists': 9
    };
    
    const multiplier = presetMultipliers[preset] || 3;
    return (teamIndex * multiplier + playerIndex * 2) % 10;
  }

  private determineBowlingStrategy(match: Match, config: any, teamIndex: number): string {
    const pitchCondition = match.pitch_condition?.toLowerCase() || '';
    const weatherCondition = match.weather_condition?.toLowerCase() || '';
    
    // AI-driven bowling strategy determination
    if (pitchCondition.includes('spin') || pitchCondition.includes('turn')) {
      return teamIndex % 2 === 0 ? 'spin-heavy' : 'balanced-spin';
    }
    
    if (pitchCondition.includes('pace') || pitchCondition.includes('bouncy')) {
      return teamIndex % 2 === 0 ? 'pace-heavy' : 'balanced-pace';
    }
    
    if (weatherCondition.includes('cloud') || weatherCondition.includes('overcast')) {
      return 'swing-focused';
    }
    
    // Default strategies with rotation
    const strategies = ['balanced', 'pace-heavy', 'spin-heavy', 'swing-focused'];
    return strategies[teamIndex % strategies.length];
  }

  private selectStrategicBowlers(
    bowlers: (Player & { aiScore: number; matchScore: number; formScore: number })[],
    config: any,
    teamIndex: number,
    bowlingStrategy: string,
    match: Match
  ): Player[] {
    const selectedBowlers: Player[] = [];
    
    // Categorize bowlers with enhanced analysis
    const spinners = bowlers.filter(p => 
      p.bowling_style?.toLowerCase().includes('spin') || 
      p.bowling_style?.toLowerCase().includes('orthodox') ||
      p.bowling_style?.toLowerCase().includes('leg')
    );
    
    const pacers = bowlers.filter(p => 
      !p.bowling_style?.toLowerCase().includes('spin') && 
      !p.bowling_style?.toLowerCase().includes('orthodox') &&
      !p.bowling_style?.toLowerCase().includes('leg')
    );

    // Apply bowling strategy intelligence
    let spinnerCount = config.spinners;
    let pacerCount = config.pacers;
    
    if (bowlingStrategy === 'spin-heavy') {
      spinnerCount = Math.min(spinners.length, config.spinners + 1);
      pacerCount = Math.max(0, config.pacers - 1);
    } else if (bowlingStrategy === 'pace-heavy') {
      pacerCount = Math.min(pacers.length, config.pacers + 1);
      spinnerCount = Math.max(0, config.spinners - 1);
    }

    // Select spinners with intelligence
    const selectedSpinners = this.selectIntelligentRolePlayers(
      spinners, spinnerCount, teamIndex, 'SPIN', config, match
    );
    selectedBowlers.push(...selectedSpinners);

    // Select pacers with intelligence
    const selectedPacers = this.selectIntelligentRolePlayers(
      pacers, pacerCount, teamIndex, 'PACE', config, match
    );
    selectedBowlers.push(...selectedPacers);

    console.log(`🎳 Selected ${selectedBowlers.length} bowlers with ${bowlingStrategy} strategy`);
    return selectedBowlers;
  }

  private determineBattingStrategy(match: Match, config: any, teamIndex: number): string {
    const pitchCondition = match.pitch_condition?.toLowerCase() || '';
    
    // AI-driven batting strategy determination
    if (pitchCondition.includes('bat') || pitchCondition.includes('flat')) {
      return teamIndex % 2 === 0 ? 'aggressive-top' : 'balanced-batting';
    }
    
    if (pitchCondition.includes('bowler') || pitchCondition.includes('difficult')) {
      return 'conservative-batting';
    }
    
    // Rotate batting strategies for diversity
    const strategies = ['aggressive-top', 'balanced-batting', 'middle-order-focus', 'conservative-batting'];
    return strategies[teamIndex % strategies.length];
  }

  private selectStrategicBatsmen(
    batsmen: (Player & { aiScore: number; matchScore: number; formScore: number })[],
    config: any,
    teamIndex: number,
    battingStrategy: string,
    match: Match
  ): Player[] {
    const selectedBatsmen: Player[] = [];
    
    // Categorize batsmen by batting order with AI analysis
    const sortedBatsmen = batsmen.sort((a, b) => b.aiScore - a.aiScore);
    
    // Dynamic batting order categorization based on strategy
    let topOrderCount = config.topOrderBatsmen;
    let middleOrderCount = config.middleOrderBatsmen; 
    let lowerOrderCount = config.lowerOrderBatsmen;
    
    if (battingStrategy === 'aggressive-top') {
      topOrderCount = Math.min(batsmen.length, config.topOrderBatsmen + 1);
      middleOrderCount = Math.max(0, config.middleOrderBatsmen - 1);
    } else if (battingStrategy === 'middle-order-focus') {
      middleOrderCount = Math.min(batsmen.length, config.middleOrderBatsmen + 1);
      topOrderCount = Math.max(0, config.topOrderBatsmen - 1);
    }

    // Intelligent batting order selection
    const topOrderPool = sortedBatsmen.slice(0, Math.ceil(sortedBatsmen.length * 0.4));
    const middleOrderPool = sortedBatsmen.slice(
      Math.ceil(sortedBatsmen.length * 0.3), 
      Math.ceil(sortedBatsmen.length * 0.8)
    );
    const lowerOrderPool = sortedBatsmen.slice(Math.ceil(sortedBatsmen.length * 0.7));

    // Select with intelligent variation
    const selectedTopOrder = this.selectIntelligentRolePlayers(
      topOrderPool, topOrderCount, teamIndex, 'TOP_BAT', config, match
    );
    selectedBatsmen.push(...selectedTopOrder);

    const selectedMiddleOrder = this.selectIntelligentRolePlayers(
      middleOrderPool, middleOrderCount, teamIndex, 'MID_BAT', config, match
    );
    selectedBatsmen.push(...selectedMiddleOrder);

    const selectedLowerOrder = this.selectIntelligentRolePlayers(
      lowerOrderPool, lowerOrderCount, teamIndex, 'LOW_BAT', config, match
    );
    selectedBatsmen.push(...selectedLowerOrder);

    console.log(`🏏 Selected ${selectedBatsmen.length} batsmen with ${battingStrategy} strategy`);
    return selectedBatsmen;
  }

  private selectStrategicFillers(
    availablePlayers: (Player & { aiScore: number; matchScore: number; formScore: number })[],
    slotsNeeded: number,
    teamIndex: number,
    config: any,
    match: Match
  ): Player[] {
    if (slotsNeeded <= 0 || availablePlayers.length === 0) return [];

    // Sort by AI score and select with variation
    const sortedPlayers = availablePlayers.sort((a, b) => b.aiScore - a.aiScore);
    const selectedFillers: Player[] = [];
    
    for (let i = 0; i < slotsNeeded && i < sortedPlayers.length; i++) {
      const poolSize = Math.min(sortedPlayers.length, slotsNeeded * 2);
      const index = (teamIndex + i) % poolSize;
      selectedFillers.push(sortedPlayers[index]);
    }

    console.log(`🔧 Selected ${selectedFillers.length} strategic fillers`);
    return selectedFillers;
  }

  private fixAndReturnRoleSplitTeam(
    players: (Player & { aiScore: number; matchScore: number; formScore: number })[],
    config: any,
    match: Match,
    request: TeamGenerationRequest,
    teamIndex: number
  ): AITeamAnalysis {
    console.log(`🔧 Fixing team ${teamIndex + 1} composition`);
    
    // Create a valid team using fallback logic
    const sortedPlayers = players.sort((a, b) => b.aiScore - a.aiScore);
    const validCompositions = Dream11TeamValidator.generateValidTeamCompositions();
    const targetComposition = validCompositions[teamIndex % validCompositions.length];
    
    const selectedPlayers: Player[] = [];
    const roleTargets = { WK: targetComposition.WK, BAT: targetComposition.BAT, AR: targetComposition.AR, BWL: targetComposition.BWL };
    const roleCounts = { WK: 0, BAT: 0, AR: 0, BWL: 0 };
    
    // Fill roles according to valid composition
    for (const player of sortedPlayers) {
      if (selectedPlayers.length >= 11) break;
      
      const role = player.player_role as keyof typeof roleCounts;
      if (roleCounts[role] < roleTargets[role]) {
        selectedPlayers.push(player);
        roleCounts[role]++;
      }
    }
    
    // Fill any remaining slots
    while (selectedPlayers.length < 11 && selectedPlayers.length < sortedPlayers.length) {
      const nextPlayer = sortedPlayers.find(p => !selectedPlayers.includes(p));
      if (nextPlayer) selectedPlayers.push(nextPlayer);
    }

    const { captain, viceCaptain } = this.selectIntelligentCaptains(selectedPlayers, teamIndex, match, config);
    const teamStats = this.calculateEnhancedTeamStats(selectedPlayers, captain, viceCaptain, match, config);

    return {
      players: selectedPlayers.slice(0, 11),
      captain,
      viceCaptain,
      totalCredits: teamStats.totalCredits,
      roleBalance: teamStats.roleBalance,
      riskScore: teamStats.riskScore,
      expectedPoints: teamStats.expectedPoints,
      confidence: teamStats.confidence - 10, // Lower confidence for fixed team
      reasoning: `Fixed role-split team ${teamIndex + 1} with valid composition`,
      insights: [`Team composition fixed to meet Dream11 requirements`]
    };
  }

  private selectIntelligentCaptains(
    players: Player[],
    teamIndex: number,
    match: Match,
    config: any
  ): { captain: Player; viceCaptain: Player } {
    // Filter captain-worthy players with enhanced criteria
    const captainCandidates = players.filter(p => 
      ['BAT', 'AR', 'WK'].includes(p.player_role || 'BAT')
    );

    if (captainCandidates.length < 2) {
      return { captain: players[0], viceCaptain: players[1] || players[0] };
    }

    // Enhanced captain scoring
    const scoredCandidates = captainCandidates.map(player => ({
      player,
      captainScore: this.calculateCaptainScore(player, match, config)
    })).sort((a, b) => b.captainScore - a.captainScore);

    // Intelligent captain rotation for diversity
    const poolSize = Math.min(scoredCandidates.length, 4);
    const captainIndex = teamIndex % poolSize;
    const viceCaptainIndex = (teamIndex + 1) % poolSize;

    const captain = scoredCandidates[captainIndex].player;
    const viceCaptain = scoredCandidates[
      viceCaptainIndex === captainIndex ? 
      (viceCaptainIndex + 1) % poolSize : 
      viceCaptainIndex
    ].player;

    return { captain, viceCaptain };
  }

  private calculateCaptainScore(player: Player, match: Match, config: any): number {
    let score = (player.points || 0) * 0.6; // Base performance
    
    // Role-based captain bonus
    if (player.player_role === 'BAT') score += 15;
    if (player.player_role === 'AR') score += 20; // All-rounders make great captains
    if (player.player_role === 'WK') score += 10;
    
    // Form bonus
    score += (player.selection_percentage || 0) * 0.3;
    
    // Match condition bonus
    const pitchCondition = match.pitch_condition?.toLowerCase() || '';
    if (pitchCondition.includes('bat') && player.player_role === 'BAT') {
      score += 10;
    }
    
    return score;
  }

  private applyPresetConfiguration(config: any, match: Match, teamIndex: number): any {
    const enhancedConfig = { ...config };
    
    // Apply preset-specific modifications
    switch (config.preset) {
      case 'team-a-bias':
        enhancedConfig.teamBias = 'teamA';
        enhancedConfig.enforceVariation = true;
        break;
      case 'team-b-bias':
        enhancedConfig.teamBias = 'teamB';
        enhancedConfig.enforceVariation = true;
        break;
      case 'high-differential':
        enhancedConfig.differentialFocus = true;
        enhancedConfig.ownershipThreshold = 15;
        enhancedConfig.enforceVariation = true;
        break;
      case 'balanced':
        enhancedConfig.balanced = true;
        enhancedConfig.enforceVariation = false;
        break;
      case 'all-rounder-heavy':
        enhancedConfig.versatilityFocus = true;
        enhancedConfig.enforceVariation = true;
        break;
      case 'top-order-stack':
        enhancedConfig.powerplayFocus = true;
        enhancedConfig.enforceVariation = true;
        break;
      case 'bowling-special':
        enhancedConfig.bowlingConditions = true;
        enhancedConfig.pitchCondition = match.pitch_condition;
        enhancedConfig.enforceVariation = true;
        break;
      case 'death-overs':
        enhancedConfig.deathOversFocus = true;
        enhancedConfig.enforceVariation = true;
        break;
      default:
        enhancedConfig.balanced = true;
    }
    
    return enhancedConfig;
  }

  private selectPresetBasedPlayers(
    players: (Player & { aiScore: number; matchScore: number; formScore: number; presetScore: number })[],
    role: string,
    count: number,
    config: any,
    teamIndex: number
  ): Player[] {
    if (count === 0 || players.length === 0) return [];

    // Apply preset-specific sorting
    const sortedPlayers = [...players];
    
    if (config.preset === 'high-differential') {
      // Sort by low ownership + AI score
      sortedPlayers.sort((a, b) => {
        const ownershipA = a.selection_percentage || 50;
        const ownershipB = b.selection_percentage || 50;
        
        if (ownershipA !== ownershipB) {
          return ownershipA - ownershipB; // Lower ownership first
        }
        return b.aiScore - a.aiScore;
      });
    } else if (config.preset === 'all-rounder-heavy' && role === 'AR') {
      // Prioritize versatile all-rounders
      sortedPlayers.sort((a, b) => {
        const versatilityA = this.calculateVersatilityScore(a);
        const versatilityB = this.calculateVersatilityScore(b);
        return versatilityB - versatilityA;
      });
    } else if (config.preset === 'top-order-stack' && role === 'BAT') {
      // Prioritize top-order batsmen
      sortedPlayers.sort((a, b) => {
        const positionA = this.estimateBattingPosition(a);
        const positionB = this.estimateBattingPosition(b);
        
        if (positionA !== positionB) {
          return positionA - positionB;
        }
        return b.aiScore - a.aiScore;
      });
    } else if (config.preset === 'bowling-special' && role === 'BWL') {
      // Prioritize bowlers for bowling conditions
      sortedPlayers.sort((a, b) => {
        const bowlingScoreA = this.calculateBowlingMatchScore(a, config);
        const bowlingScoreB = this.calculateBowlingMatchScore(b, config);
        
        if (bowlingScoreA !== bowlingScoreB) {
          return bowlingScoreB - bowlingScoreA;
        }
        return b.aiScore - a.aiScore;
      });
    } else if (config.preset === 'death-overs' && (role === 'BAT' || role === 'BWL')) {
      // Prioritize death specialists
      sortedPlayers.sort((a, b) => {
        const deathScoreA = this.calculateDeathOverScore(a, role);
        const deathScoreB = this.calculateDeathOverScore(b, role);
        
        if (deathScoreA !== deathScoreB) {
          return deathScoreB - deathScoreA;
        }
        return b.aiScore - a.aiScore;
      });
    } else {
      // Default: sort by AI score
      sortedPlayers.sort((a, b) => b.aiScore - a.aiScore);
    }

    // Select players with variation
    const selectedPlayers: Player[] = [];
    const usedIndices = new Set<number>();

    for (let i = 0; i < count && selectedPlayers.length < count; i++) {
      let index = i;
      
      // Add variation for team diversity
      if (teamIndex > 0 && config.enforceVariation) {
        const variationRange = Math.min(3, Math.floor(sortedPlayers.length * 0.3));
        const randomOffset = (teamIndex + i) % (variationRange + 1);
        index = Math.min(i + randomOffset, sortedPlayers.length - 1);
      }
      
      // Ensure unique selection
      while (usedIndices.has(index) && index < sortedPlayers.length - 1) {
        index++;
      }
      
      if (index < sortedPlayers.length && !usedIndices.has(index)) {
        selectedPlayers.push(sortedPlayers[index]);
        usedIndices.add(index);
      }
    }

    return selectedPlayers;
  }

  private calculateVersatilityScore(player: Player): number {
    let score = 50;
    
    // All-rounders get base bonus
    if (player.player_role === 'AR') {
      score += 20;
    }
    
    // Players with both batting and bowling stats
    const hasBattingStats = (player.points || 0) > 40;
    const hasBowlingStyle = !!player.bowling_style;
    
    if (hasBattingStats && hasBowlingStyle) {
      score += 15;
    }
    
    // High points indicate good performance in primary role
    if ((player.points || 0) > 60) {
      score += 10;
    }
    
    return score;
  }

  private calculateBowlingMatchScore(player: Player, config: any): number {
    let score = 50;
    
    // Bowling style preference based on conditions
    const bowlingStyle = player.bowling_style?.toLowerCase() || '';
    
    if (config.pitchCondition) {
      const condition = config.pitchCondition.toLowerCase();
      
      if (condition.includes('spin') && bowlingStyle.includes('spin')) {
        score += 20;
      } else if (condition.includes('pace') && !bowlingStyle.includes('spin')) {
        score += 20;
      } else if (condition.includes('bowl') && player.player_role === 'BWL') {
        score += 15;
      }
    }
    
    return score;
  }

  private calculateDeathOverScore(player: Player, role: string): number {
    let score = 50;
    
    if (role === 'BAT') {
      // Finishers typically bat lower and have high strike rates
      const battingPosition = this.estimateBattingPosition(player);
      if (battingPosition >= 4) {
        score += 15;
      }
      
      // High points suggest good finishing ability
      if ((player.points || 0) > 50) {
        score += 10;
      }
    } else if (role === 'BWL') {
      // Death bowlers typically pacers
      const bowlingStyle = player.bowling_style?.toLowerCase() || '';
      if (!bowlingStyle.includes('spin')) {
        score += 15; // Preference for pacers in death overs
      }
      
      // Higher points suggest better death bowling
      if ((player.points || 0) > 50) {
        score += 10;
      }
    }
    
    return score;
  }

  private calculateEnhancedTeamStats(
    players: Player[],
    captain: Player,
    viceCaptain: Player,
    match: Match,
    config: any
  ): {
    totalCredits: number;
    roleBalance: any;
    riskScore: number;
    expectedPoints: number;
    confidence: number;
  } {
    const totalCredits = players.reduce((sum, p) => sum + (p.credits || 8), 0);
    const roleBalance = this.calculateRoleBalance(players);
    const riskScore = this.calculateRoleSplitRiskScore(config, players);
    const expectedPoints = this.calculateExpectedPoints(players, captain, viceCaptain);
    
    // Enhanced confidence calculation
    let confidence = 85;
    if (config.prioritizeForm) confidence += 5;
    if (config.diversityLevel === 'high') confidence += 3;
    if (totalCredits <= 98) confidence += 2; // Credit efficiency bonus
    
    return { totalCredits, roleBalance, riskScore, expectedPoints, confidence };
  }

  private generateRoleSplitReasoning(
    config: any,
    teamIndex: number,
    battingStrategy: string,
    bowlingStrategy: string
  ): string {
    return `Intelligent role-split team ${teamIndex + 1}: ${config.topOrderBatsmen} top-order batsmen (${battingStrategy}), ${config.spinners} spinners + ${config.pacers} pacers (${bowlingStrategy}), optimized for match conditions with ${config.diversityLevel} diversity`;
  }

  private generateRoleSplitInsights(
    players: Player[],
    config: any,
    teamIndex: number,
    match: Match
  ): string[] {
    const insights = [
      `Batting Strategy: ${config.topOrderBatsmen} top + ${config.middleOrderBatsmen} middle + ${config.lowerOrderBatsmen} lower order`,
      `Bowling Strategy: ${config.spinners} spinners + ${config.pacers} pacers optimized for ${match.pitch_condition || 'standard'} pitch`,
      `Role Balance: ${config.allRounders} all-rounders + ${config.wicketKeepers} wicket-keepers`,
      `Diversity Level: ${config.diversityLevel} with ${config.prioritizeForm ? 'form-based' : 'balanced'} selection`,
      `Team Credits: ${players.reduce((sum, p) => sum + (p.credits || 8), 0)}/100`
    ];

    // Add match-specific insights
    const pitchCondition = match.pitch_condition?.toLowerCase() || '';
    if (pitchCondition.includes('spin')) {
      insights.push('🌀 Spin-friendly pitch adaptation applied');
    }
    if (pitchCondition.includes('pace')) {
      insights.push('⚡ Pace-friendly pitch adaptation applied');
    }

    return insights;
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
  private async generateBaseTeamVariations(request: TeamGenerationRequest): Promise<AITeamAnalysis[]> {
    try {
      console.log('🎯 Strategy 8: Generating base team variations');
      
      const { baseTeam, optimizationRules } = request.userPreferences || {};
      
      if (!baseTeam || !Array.isArray(baseTeam) || baseTeam.length !== 11) {
        console.error('❌ Strategy 8: Invalid base team provided');
        return [];
      }

      if (!optimizationRules) {
        console.error('❌ Strategy 8: No optimization rules provided');
        return [];
      }

      const teams: AITeamAnalysis[] = [];
      
      // Get all available players for the match
      const allPlayers = await neonDB.getPlayingPlayersForMatch(request.matchId);
      
      if (!allPlayers || allPlayers.length === 0) {
        console.error('❌ Strategy 8: No players found for match');
        return [];
      }

      for (let teamIndex = 0; teamIndex < request.teamCount; teamIndex++) {
        const variation = await this.createBaseTeamVariation(
          baseTeam,
          allPlayers,
          optimizationRules,
          teamIndex
        );
        teams.push(variation);
      }

      console.log(`✅ Strategy 8: Generated ${teams.length} team variations`);
      return teams;
    } catch (error) {
      console.error('❌ Strategy 8 error:', error);
      return [];
    }
  }

  private async createBaseTeamVariation(
    baseTeam: Player[],
    allPlayers: Player[],
    rules: any,
    teamIndex: number
  ): Promise<AITeamAnalysis> {
    // Create a copy of the base team
    let currentTeam = [...baseTeam];
    
    // Determine edit intensity based on team index and rules
    const editIntensity = rules.editIntensity || 'minor';
    let editsToMake = 0;
    
    switch (editIntensity) {
      case 'minor':
        editsToMake = teamIndex % 3 === 0 ? 1 : 2; // 1-2 edits
        break;
      case 'moderate':
        editsToMake = 2 + (teamIndex % 3); // 2-4 edits
        break;
      case 'major':
        editsToMake = 3 + (teamIndex % 4); // 3-6 edits
        break;
    }

    // Apply systematic edits
    for (let editCount = 0; editCount < editsToMake; editCount++) {
      currentTeam = this.applyRuleBasedEdit(
        currentTeam,
        allPlayers,
        rules,
        teamIndex,
        editCount
      );
    }

    // Validate Dream11 constraints using static method
    const validationResult = Dream11TeamValidator.validateTeamComposition(currentTeam);
    if (!validationResult.isValid) {
      console.warn(`Team ${teamIndex + 1} failed validation, reverting to base team`);
      currentTeam = [...baseTeam];
    }

    // Select captain and vice-captain with variation
    const captaincy = this.selectCaptaincyVariation(currentTeam, teamIndex);

    return {
      players: currentTeam,
      captain: captaincy.captain,
      viceCaptain: captaincy.viceCaptain,
      totalCredits: currentTeam.reduce((sum, p) => sum + (p.credits || 8), 0),
      expectedPoints: this.estimateTeamPoints(currentTeam),
      confidence: Math.max(60, 85 - (editsToMake * 5)), // Lower confidence for more edits
      riskScore: 40 + (editsToMake * 10), // Higher risk for more edits
      reasoning: `Base team with ${editsToMake} strategic ${editsToMake === 1 ? 'edit' : 'edits'}, optimizing for ${rules.primaryParameter || 'balanced'}`,
      roleBalance: this.calculateRoleBalanceForStrategy8(currentTeam)
    };
  }

  private applyRuleBasedEdit(
    team: Player[],
    allPlayers: Player[],
    rules: any,
    teamIndex: number,
    editIndex: number
  ): Player[] {
    const newTeam = [...team];
    const { primaryParameter, preferences } = rules;
    
    // Determine which position to edit based on systematic approach
    const positionToEdit = (teamIndex + editIndex) % 11;
    const playerToReplace = newTeam[positionToEdit];
    
    if (!playerToReplace) return newTeam;

    // Find replacement candidates of the same role
    const sameRolePlayers = allPlayers.filter(p => 
      p.player_role === playerToReplace.player_role &&
      p.id !== playerToReplace.id &&
      !newTeam.some(tp => tp.id === p.id)
    );

    if (sameRolePlayers.length === 0) return newTeam;

    // Select replacement based on primary parameter and edit strategy
    let replacement: Player;
    
    switch (primaryParameter) {
      case 'dreamTeamPercentage':
        replacement = sameRolePlayers.sort((a, b) => 
          (b.dream_team_percentage || 0) - (a.dream_team_percentage || 0)
        )[editIndex % sameRolePlayers.length];
        break;
      case 'selectionPercentage':
        replacement = sameRolePlayers.sort((a, b) => 
          (b.selection_percentage || 0) - (a.selection_percentage || 0)
        )[editIndex % sameRolePlayers.length];
        break;
      case 'averagePoints':
        replacement = sameRolePlayers.sort((a, b) => 
          (b.points || 0) - (a.points || 0)
        )[editIndex % sameRolePlayers.length];
        break;
      default:
        // Random selection for diversity
        replacement = sameRolePlayers[editIndex % sameRolePlayers.length];
    }

    // Apply risk tolerance filter
    if (preferences?.riskTolerance === 'conservative' && (replacement.selection_percentage || 0) < 30) {
      // Find a safer option
      const safeOptions = sameRolePlayers.filter(p => (p.selection_percentage || 0) >= 30);
      if (safeOptions.length > 0) {
        replacement = safeOptions[0];
      }
    } else if (preferences?.riskTolerance === 'aggressive' && (replacement.selection_percentage || 0) > 60) {
      // Find a more differential option
      const riskOptions = sameRolePlayers.filter(p => (p.selection_percentage || 0) <= 60);
      if (riskOptions.length > 0) {
        replacement = riskOptions[0];
      }
    }

    newTeam[positionToEdit] = replacement;
    return newTeam;
  }

  private selectCaptaincyVariation(team: Player[], teamIndex: number): { captain: Player; viceCaptain: Player } {
    // Get captain-worthy players (BAT, AR, WK with high points/credits)
    const captainCandidates = team
      .filter(p => ['BAT', 'AR', 'WK'].includes(p.player_role))
      .sort((a, b) => (b.points || 0) - (a.points || 0));

    if (captainCandidates.length < 2) {
      return { captain: team[0], viceCaptain: team[1] };
    }

    // Rotate captaincy based on team index
    const captainIndex = teamIndex % Math.min(captainCandidates.length, 4);
    const viceCaptainIndex = (teamIndex + 1) % Math.min(captainCandidates.length, 4);

    return {
      captain: captainCandidates[captainIndex],
      viceCaptain: captainCandidates[viceCaptainIndex]
    };
  }

  private estimateTeamPoints(team: Player[]): number {
    return team.reduce((sum, player) => sum + (player.points || 0), 0);
  }

  private calculateRoleBalanceForStrategy8(team: Player[]): { batsmen: number; bowlers: number; allRounders: number; wicketKeepers: number } {
    const roles = { batsmen: 0, bowlers: 0, allRounders: 0, wicketKeepers: 0 };
    team.forEach(player => {
      switch (player.player_role) {
        case 'BAT':
          roles.batsmen++;
          break;
        case 'BWL':
          roles.bowlers++;
          break;
        case 'AR':
          roles.allRounders++;
          break;
        case 'WK':
          roles.wicketKeepers++;
          break;
      }
    });
    return roles;
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

  private selectCaptainFromOrder(
    players: Player[],
    captainOrder: string[],
    teamIndex: number
  ): { captain: Player; viceCaptain: Player } {
    // If no captain order provided, use default varied selection
    if (!captainOrder || captainOrder.length === 0) {
      const eligiblePlayers = players.filter(p => 
        ['BAT', 'BWL', 'AR'].includes(p.player_role || 'BAT')
      );
      
      if (eligiblePlayers.length < 2) {
        const captain = players[0];
        const viceCaptain = players[1] || players[0];
        return { captain, viceCaptain };
      }
      
      const captainIndex = teamIndex % eligiblePlayers.length;
      const viceCaptainIndex = (teamIndex + 1) % eligiblePlayers.length;
      
      return {
        captain: eligiblePlayers[captainIndex],
        viceCaptain: eligiblePlayers[viceCaptainIndex === captainIndex ? 
          (viceCaptainIndex + 1) % eligiblePlayers.length : viceCaptainIndex]
      };
    }

    // Find players in the team that match the captain order
    const availableCaptains = captainOrder
      .map(name => players.find(p => p.name === name))
      .filter((p): p is Player => !!p);

    if (availableCaptains.length === 0) {
      // Fallback to first eligible player
      const eligiblePlayers = players.filter(p => 
        ['BAT', 'BWL', 'AR'].includes(p.player_role || 'BAT')
      );
      const captain = eligiblePlayers[0] || players[0];
      const viceCaptain = eligiblePlayers[1] || players[1] || players[0];
      return { captain, viceCaptain };
    }

    // Rotate through available captains based on team index
    const captainIndex = teamIndex % availableCaptains.length;
    const captain = availableCaptains[captainIndex];

    // Select vice-captain (next in order or second choice)
    let viceCaptain = captain; // fallback
    if (availableCaptains.length > 1) {
      const viceCaptainIndex = (captainIndex + 1) % availableCaptains.length;
      viceCaptain = availableCaptains[viceCaptainIndex];
    } else {
      // Find alternative vice-captain from team
      const alternatives = players.filter(p => 
        p.id !== captain.id && ['BAT', 'BWL', 'AR'].includes(p.player_role || 'BAT')
      );
      if (alternatives.length > 0) {
        viceCaptain = alternatives[0];
      }
    }

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
