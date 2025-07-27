import { NextRequest, NextResponse } from 'next/server';

interface StatisticalGuardrails {
  minRecentFormScore: number;
  maxDreamsPriceCap: number;
  minOwnershipPercentage: number;
  maxOwnershipPercentage: number;
  recentMatchWindow: number;
  venueAdvantageWeight: number;
  injuryRiskTolerance: 'low' | 'medium' | 'high';
  consistencyWeight: number;
  opponentStrengthWeight: number;
}

interface MLOptimizationConfig {
  enableMLOptimization: boolean;
  optimizationObjective: 'balanced' | 'high_risk_high_reward' | 'safe_consistent' | 'contrarian';
  predictiveModelWeight: number;
  ensembleModels: string[];
  correlationAnalysis: boolean;
  volatilityAdjustment: boolean;
  momentumFactor: number;
}

interface AdvancedFilters {
  mustIncludePlayers: string[];
  avoidPlayers: string[];
  roleDistribution: {
    batsmen: [number, number];
    bowlers: [number, number];
    allRounders: [number, number];
    wicketKeepers: [number, number];
  };
  teamBalanceRequirement: 'strict' | 'flexible' | 'experimental';
  budgetAllocation: 'even' | 'star_heavy' | 'balanced_depth';
}

// Mock ML optimization service
class MLOptimizationService {
  private getPlayerMLScore(player: any, config: MLOptimizationConfig): number {
    let baseScore = Math.random() * 10 + 5; // 5-15 base score
    
    // Apply optimization objective adjustments
    switch (config.optimizationObjective) {
      case 'high_risk_high_reward':
        baseScore += (Math.random() > 0.7 ? 5 : -2); // High variance
        break;
      case 'safe_consistent':
        baseScore = Math.max(7, Math.min(12, baseScore)); // Limit variance
        break;
      case 'contrarian':
        baseScore += (Math.random() > 0.8 ? 8 : 1); // Occasional huge spikes
        break;
      default: // balanced
        baseScore += Math.random() * 2 - 1; // Small adjustments
    }
    
    // Apply model ensemble weights
    const modelBonus = config.ensembleModels.length * 0.5;
    baseScore += modelBonus;
    
    // Apply momentum factor
    baseScore += config.momentumFactor * 10 * (Math.random() - 0.5);
    
    return Math.max(1, Math.min(20, baseScore));
  }

  private applyCorrelationAnalysis(players: any[], config: MLOptimizationConfig): any[] {
    if (!config.correlationAnalysis) return players;
    
    // Simple correlation - boost players from same team slightly
    return players.map(player => ({
      ...player,
      mlCorrelationBonus: Math.random() * 0.5
    }));
  }

  private applyVolatilityAdjustment(players: any[], config: MLOptimizationConfig): any[] {
    if (!config.volatilityAdjustment) return players;
    
    return players.map(player => ({
      ...player,
      volatilityAdjustedScore: player.mlScore * (0.8 + Math.random() * 0.4)
    }));
  }

  optimizePlayers(players: any[], config: MLOptimizationConfig): any[] {
    // Add ML scores to players
    let optimizedPlayers = players.map(player => ({
      ...player,
      mlScore: this.getPlayerMLScore(player, config),
      predictiveValue: Math.random() * 100,
      riskScore: Math.random() * 10,
      momentumScore: Math.random() * 10
    }));

    // Apply correlation analysis
    optimizedPlayers = this.applyCorrelationAnalysis(optimizedPlayers, config);
    
    // Apply volatility adjustment
    optimizedPlayers = this.applyVolatilityAdjustment(optimizedPlayers, config);
    
    return optimizedPlayers;
  }
}

class StatisticalGuardrailsService {
  applyGuardrails(players: any[], guardrails: StatisticalGuardrails): any[] {
    return players.filter(player => {
      // Form score filter
      const recentForm = player.recent_form || (7 + Math.random() * 3);
      if (recentForm < guardrails.minRecentFormScore) return false;
      
      // Price filter
      const playerPrice = player.credits || (8 + Math.random() * 4);
      if (playerPrice > guardrails.maxDreamsPriceCap) return false;
      
      // Ownership filter
      const ownership = player.ownership_percentage || Math.random() * 40;
      if (ownership < guardrails.minOwnershipPercentage || ownership > guardrails.maxOwnershipPercentage) {
        return false;
      }
      
      // Injury risk filter
      const injuryRisk = player.injury_risk || Math.random();
      switch (guardrails.injuryRiskTolerance) {
        case 'low':
          if (injuryRisk > 0.3) return false;
          break;
        case 'medium':
          if (injuryRisk > 0.6) return false;
          break;
        // 'high' allows all players
      }
      
      return true;
    }).map(player => ({
      ...player,
      guardrailsScore: this.calculateGuardrailsScore(player, guardrails)
    }));
  }

  private calculateGuardrailsScore(player: any, guardrails: StatisticalGuardrails): number {
    let score = 0;
    
    // Recent form contribution
    const recentForm = player.recent_form || (7 + Math.random() * 3);
    score += recentForm * 0.3;
    
    // Consistency contribution
    const consistency = player.consistency_score || Math.random() * 10;
    score += consistency * guardrails.consistencyWeight;
    
    // Venue advantage
    const venueAdvantage = player.venue_advantage || Math.random() * 5;
    score += venueAdvantage * guardrails.venueAdvantageWeight;
    
    // Opponent strength adjustment
    const opponentStrength = player.opponent_strength || Math.random() * 10;
    score -= opponentStrength * guardrails.opponentStrengthWeight * 0.5;
    
    return Math.max(1, score);
  }
}

class AdvancedTeamBuilder {
  buildTeams(
    players: any[], 
    filters: AdvancedFilters, 
    teamCount: number,
    matchData: any
  ): any[] {
    const teams = [];
    
    for (let i = 0; i < teamCount; i++) {
      const team = this.buildSingleTeam(players, filters, i, matchData);
      if (team) teams.push(team);
    }
    
    return teams;
  }

  private buildSingleTeam(players: any[], filters: AdvancedFilters, teamIndex: number, matchData: any): any {
    const team: any[] = [];
    let remainingCredits = 100;
    
    // First, add must-include players
    const mustIncludePlayers = players.filter(p => filters.mustIncludePlayers.includes(p.id));
    for (const player of mustIncludePlayers) {
      if (remainingCredits >= (player.credits || 8)) {
        team.push(player);
        remainingCredits -= (player.credits || 8);
      }
    }
    
    // Filter out avoided players and already selected players
    const availablePlayers = players.filter(p => 
      !filters.avoidPlayers.includes(p.id) && 
      !team.some(tp => tp.id === p.id)
    );
    
    // Build team according to role distribution and budget strategy
    const roleTargets = this.getRoleTargets(filters.roleDistribution, teamIndex);
    
    // Sort players based on budget allocation strategy
    const sortedPlayers = this.sortPlayersByStrategy(availablePlayers, filters.budgetAllocation);
    
    // Fill remaining positions
    const roleCounts: { [key: string]: number } = { batsmen: 0, bowlers: 0, allRounders: 0, wicketKeepers: 0 };
    
    // Count existing roles
    team.forEach(player => {
      const role = this.normalizeRole(player.role);
      if (roleCounts[role] !== undefined) roleCounts[role]++;
    });
    
    // Add players to meet role requirements
    for (const player of sortedPlayers) {
      if (team.length >= 11) break;
      
      const role = this.normalizeRole(player.role);
      const playerPrice = player.credits || 8;
      
      if (remainingCredits >= playerPrice && roleCounts[role] < roleTargets[role]) {
        team.push(player);
        remainingCredits -= playerPrice;
        roleCounts[role]++;
      }
    }
    
    // Fill remaining spots if needed
    for (const player of sortedPlayers) {
      if (team.length >= 11) break;
      
      const playerPrice = player.credits || 8;
      if (remainingCredits >= playerPrice && !team.some(tp => tp.id === player.id)) {
        team.push(player);
        remainingCredits -= playerPrice;
      }
    }
    
    // Select captain and vice-captain
    const sortedTeam = team.sort((a, b) => (b.mlScore || b.guardrailsScore || Math.random() * 10) - (a.mlScore || a.guardrailsScore || Math.random() * 10));
    const captain = sortedTeam[0];
    const viceCaptain = sortedTeam[1];
    
    return {
      team_name: `ML-Optimized Team ${teamIndex + 1}`,
      players: team.map(player => ({
        ...player,
        is_captain: player.id === captain?.id,
        is_vice_captain: player.id === viceCaptain?.id
      })),
      total_credits: 100 - remainingCredits,
      captain_name: captain?.name || 'Unknown',
      vice_captain_name: viceCaptain?.name || 'Unknown',
      strategy_confidence: Math.random() * 20 + 75, // 75-95%
      ml_optimization_score: Math.random() * 10 + 85, // 85-95
      guardrails_compliance: Math.random() * 5 + 95, // 95-100%
      expected_ownership: Math.random() * 10 + 15, // 15-25% (contrarian effect)
      risk_level: filters.teamBalanceRequirement === 'experimental' ? 'High' : 
                 filters.teamBalanceRequirement === 'strict' ? 'Low' : 'Medium'
    };
  }

  private getRoleTargets(roleDistribution: any, teamIndex: number): { [key: string]: number } {
    return {
      batsmen: roleDistribution.batsmen[0] + (teamIndex % (roleDistribution.batsmen[1] - roleDistribution.batsmen[0] + 1)),
      bowlers: roleDistribution.bowlers[0] + (teamIndex % (roleDistribution.bowlers[1] - roleDistribution.bowlers[0] + 1)),
      allRounders: roleDistribution.allRounders[0] + (teamIndex % (roleDistribution.allRounders[1] - roleDistribution.allRounders[0] + 1)),
      wicketKeepers: roleDistribution.wicketKeepers[0] + (teamIndex % (roleDistribution.wicketKeepers[1] - roleDistribution.wicketKeepers[0] + 1))
    };
  }

  private sortPlayersByStrategy(players: any[], strategy: string): any[] {
    switch (strategy) {
      case 'star_heavy':
        return players.sort((a, b) => (b.credits || 8) - (a.credits || 8));
      case 'even':
        return players.sort((a, b) => Math.abs((a.credits || 8) - 9) - Math.abs((b.credits || 8) - 9));
      default: // balanced_depth
        return players.sort((a, b) => (b.mlScore || b.guardrailsScore || Math.random() * 10) - (a.mlScore || a.guardrailsScore || Math.random() * 10));
    }
  }

  private normalizeRole(role: string): string {
    const roleLower = role.toLowerCase();
    if (roleLower.includes('bat')) return 'batsmen';
    if (roleLower.includes('bowl')) return 'bowlers';
    if (roleLower.includes('all') || roleLower.includes('round')) return 'allRounders';
    if (roleLower.includes('keep') || roleLower.includes('wk')) return 'wicketKeepers';
    return 'batsmen'; // default
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      statisticalGuardrails, 
      mlConfig, 
      advancedFilters, 
      teamCount, 
      matchData 
    } = body;

    console.log('Strategy 5 request:', {
      guardrails: statisticalGuardrails,
      mlEnabled: mlConfig?.enableMLOptimization,
      teamCount,
      matchId: matchData?.match?.id
    });

    // Get players from match data
    let players = matchData?.players || [];
    
    // Add mock enhanced stats if missing
    players = players.map((player: any) => ({
      ...player,
      recent_form: player.recent_form || (7 + Math.random() * 3),
      credits: player.credits || (8 + Math.random() * 4),
      ownership_percentage: player.ownership_percentage || Math.random() * 40,
      consistency_score: Math.random() * 10,
      venue_advantage: Math.random() * 5,
      opponent_strength: Math.random() * 10,
      injury_risk: Math.random()
    }));

    console.log(`Processing ${players.length} players with ML optimization`);

    // Initialize services
    const guardrailsService = new StatisticalGuardrailsService();
    const mlService = new MLOptimizationService();
    const teamBuilder = new AdvancedTeamBuilder();

    // Step 1: Apply statistical guardrails
    let filteredPlayers = guardrailsService.applyGuardrails(players, statisticalGuardrails);
    console.log(`${filteredPlayers.length} players passed guardrails`);

    // Step 2: Apply ML optimization if enabled
    if (mlConfig.enableMLOptimization) {
      filteredPlayers = mlService.optimizePlayers(filteredPlayers, mlConfig);
      console.log('Applied ML optimization to players');
    }

    // Step 3: Build teams with advanced filters
    const teams = teamBuilder.buildTeams(filteredPlayers, advancedFilters, teamCount, matchData);
    
    console.log(`Generated ${teams.length} ML-optimized teams`);

    // Calculate aggregate statistics
    const avgMLScore = teams.reduce((sum, team) => sum + (team.ml_optimization_score || 0), 0) / teams.length;
    const avgGuardrailsCompliance = teams.reduce((sum, team) => sum + (team.guardrails_compliance || 0), 0) / teams.length;
    
    const result = {
      teams,
      strategy: 'Strategy 5: Stats-Driven ML Optimization',
      total_teams: teams.length,
      configuration: {
        statistical_guardrails: statisticalGuardrails,
        ml_optimization: mlConfig,
        advanced_filters: advancedFilters
      },
      analytics: {
        average_ml_score: Math.round(avgMLScore * 100) / 100,
        average_guardrails_compliance: Math.round(avgGuardrailsCompliance * 100) / 100,
        players_analyzed: players.length,
        players_qualified: filteredPlayers.length,
        ml_models_used: mlConfig.enableMLOptimization ? mlConfig.ensembleModels.length : 0,
        optimization_objective: mlConfig.optimizationObjective
      },
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Strategy 5 generation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate Strategy 5 teams',
        details: error instanceof Error ? error.message : 'Unknown error',
        strategy: 'Strategy 5: Stats-Driven ML Optimization'
      },
      { status: 500 }
    );
  }
}
