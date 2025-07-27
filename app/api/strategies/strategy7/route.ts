import { NextRequest, NextResponse } from 'next/server';

interface RoleSplitConfig {
  batsmen_variations: {
    aggressive_openers: number;
    anchor_middle_order: number;
    finisher_specialists: number;
  };
  bowler_variations: {
    powerplay_specialists: number;
    middle_overs_control: number;
    death_bowling_experts: number;
  };
  allrounder_focus: 'batting_heavy' | 'bowling_heavy' | 'balanced' | 'utility';
  wicketkeeper_strategy: 'premium_single' | 'dual_keeper' | 'batting_focused';
}

interface OptimizationSettings {
  role_balance_strictness: 'strict' | 'flexible' | 'experimental';
  budget_distribution: 'role_heavy' | 'star_distributed' | 'value_balanced';
  diversity_factor: number;
  captaincy_rotation: boolean;
  complementary_skills: boolean;
  formation_style: '4-4-2-1' | '3-4-3-1' | '5-3-2-1' | 'custom';
}

class RoleSpecializationService {
  private getRoleSpecializationScore(player: any, roleType: string, variation: string): number {
    let score = Math.random() * 10 + 5; // Base score 5-15
    
    // Add role-specific scoring based on player attributes
    switch (roleType) {
      case 'batsmen':
        switch (variation) {
          case 'aggressive_openers':
            if (player.batting_order <= 2) score += 3;
            if (player.strike_rate && player.strike_rate > 130) score += 2;
            if (player.powerplay_average && player.powerplay_average > 30) score += 2;
            break;
          case 'anchor_middle_order':
            if (player.batting_order >= 3 && player.batting_order <= 5) score += 3;
            if (player.consistency_score && player.consistency_score > 7) score += 2;
            if (player.average && player.average > 35) score += 2;
            break;
          case 'finisher_specialists':
            if (player.batting_order >= 6) score += 3;
            if (player.death_overs_strike_rate && player.death_overs_strike_rate > 140) score += 3;
            if (player.boundary_percentage && player.boundary_percentage > 0.5) score += 2;
            break;
        }
        break;
        
      case 'bowlers':
        switch (variation) {
          case 'powerplay_specialists':
            if (player.powerplay_economy && player.powerplay_economy < 7) score += 3;
            if (player.powerplay_wickets && player.powerplay_wickets > 0.5) score += 2;
            if (player.bowling_style === 'pace') score += 1;
            break;
          case 'middle_overs_control':
            if (player.middle_overs_economy && player.middle_overs_economy < 6.5) score += 3;
            if (player.bowling_style === 'spin') score += 2;
            if (player.dot_ball_percentage && player.dot_ball_percentage > 0.4) score += 2;
            break;
          case 'death_bowling_experts':
            if (player.death_overs_economy && player.death_overs_economy < 9) score += 4;
            if (player.yorker_accuracy && player.yorker_accuracy > 0.6) score += 3;
            if (player.death_overs_wickets && player.death_overs_wickets > 0.3) score += 2;
            break;
        }
        break;
    }
    
    return Math.max(1, Math.min(20, score));
  }

  private getComplementarySkillsBonus(player: any, teamPlayers: any[]): number {
    let bonus = 0;
    
    // Check for complementary bowling styles
    const teamBowlingStyles = teamPlayers
      .filter(p => p.role?.toLowerCase().includes('bowl'))
      .map(p => p.bowling_style);
    
    if (player.bowling_style === 'pace' && teamBowlingStyles.includes('spin')) bonus += 1;
    if (player.bowling_style === 'spin' && teamBowlingStyles.includes('pace')) bonus += 1;
    
    // Check for batting order diversity
    const teamBattingOrders = teamPlayers
      .filter(p => p.role?.toLowerCase().includes('bat'))
      .map(p => p.batting_order || Math.floor(Math.random() * 11) + 1);
    
    const playerBattingOrder = player.batting_order || Math.floor(Math.random() * 11) + 1;
    const orderGaps = teamBattingOrders.filter(order => Math.abs(order - playerBattingOrder) <= 2).length;
    
    if (orderGaps === 0) bonus += 2; // Fills a gap in batting order
    
    return bonus;
  }

  assignRoleSpecializations(players: any[], config: RoleSplitConfig): any[] {
    return players.map(player => {
      const roleType = this.normalizeRole(player.role);
      let specialization = '';
      let specializationScore = 0;
      
      // Assign specializations based on role
      switch (roleType) {
        case 'batsmen':
          const battingVariations = ['aggressive_openers', 'anchor_middle_order', 'finisher_specialists'];
          const bestBattingVariation = battingVariations.reduce((best, variation) => {
            const score = this.getRoleSpecializationScore(player, 'batsmen', variation);
            return score > specializationScore ? variation : best;
          });
          specialization = bestBattingVariation;
          specializationScore = this.getRoleSpecializationScore(player, 'batsmen', bestBattingVariation);
          break;
          
        case 'bowlers':
          const bowlingVariations = ['powerplay_specialists', 'middle_overs_control', 'death_bowling_experts'];
          const bestBowlingVariation = bowlingVariations.reduce((best, variation) => {
            const score = this.getRoleSpecializationScore(player, 'bowlers', variation);
            return score > specializationScore ? variation : best;
          });
          specialization = bestBowlingVariation;
          specializationScore = this.getRoleSpecializationScore(player, 'bowlers', bestBowlingVariation);
          break;
          
        case 'allRounders':
          specialization = config.allrounder_focus;
          specializationScore = Math.random() * 5 + 10; // 10-15 for all-rounders
          break;
          
        case 'wicketKeepers':
          specialization = config.wicketkeeper_strategy;
          specializationScore = Math.random() * 3 + 12; // 12-15 for keepers
          break;
      }
      
      return {
        ...player,
        role_specialization: specialization,
        specialization_score: specializationScore,
        batting_order: player.batting_order || Math.floor(Math.random() * 11) + 1,
        strike_rate: player.strike_rate || (100 + Math.random() * 50),
        average: player.average || (25 + Math.random() * 15),
        powerplay_average: player.powerplay_average || (20 + Math.random() * 20),
        death_overs_strike_rate: player.death_overs_strike_rate || (120 + Math.random() * 40),
        boundary_percentage: player.boundary_percentage || Math.random(),
        powerplay_economy: player.powerplay_economy || (6 + Math.random() * 3),
        middle_overs_economy: player.middle_overs_economy || (6 + Math.random() * 2),
        death_overs_economy: player.death_overs_economy || (8 + Math.random() * 4),
        bowling_style: player.bowling_style || (Math.random() > 0.6 ? 'spin' : 'pace'),
        consistency_score: player.consistency_score || Math.random() * 10
      };
    });
  }

  normalizeRole(role: string): string {
    const roleLower = role?.toLowerCase() || '';
    if (roleLower.includes('bat')) return 'batsmen';
    if (roleLower.includes('bowl')) return 'bowlers';
    if (roleLower.includes('all') || roleLower.includes('round')) return 'allRounders';
    if (roleLower.includes('keep') || roleLower.includes('wk')) return 'wicketKeepers';
    return 'batsmen'; // default
  }
}

class RoleSplitTeamBuilder {
  constructor(private roleService: RoleSpecializationService) {}

  buildTeams(
    players: any[],
    config: RoleSplitConfig,
    settings: OptimizationSettings,
    teamCount: number,
    matchData: any
  ): any[] {
    const teams = [];
    
    // Get role distribution based on formation
    const roleDistribution = this.getFormationDistribution(settings.formation_style);
    
    // Assign role specializations to all players
    const specializedPlayers = this.roleService.assignRoleSpecializations(players, config);
    
    for (let i = 0; i < teamCount; i++) {
      const team = this.buildSingleTeam(
        specializedPlayers,
        config,
        settings,
        roleDistribution,
        i,
        matchData
      );
      if (team) teams.push(team);
    }
    
    return teams;
  }

  private buildSingleTeam(
    players: any[],
    config: RoleSplitConfig,
    settings: OptimizationSettings,
    roleDistribution: any,
    teamIndex: number,
    matchData: any
  ): any {
    const team: any[] = [];
    let remainingCredits = 100;
    
    // Apply diversity factor for different team compositions
    const diversityOffset = settings.diversity_factor * teamIndex * 0.1;
    
    // Build team by role with specialization
    const roleTargets = this.adjustRoleTargetsForSpecialization(roleDistribution, config, teamIndex);
    
    // Group players by role and specialization
    const playersByRole = this.groupPlayersByRoleAndSpecialization(players);
    
    // Select players for each role based on specialization requirements
    for (const [role, count] of Object.entries(roleTargets)) {
      const roleKey = role as keyof typeof playersByRole;
      const availablePlayers = playersByRole[roleKey] || [];
      
      if (role === 'batsmen') {
        this.selectBatsmenBySpecialization(team, availablePlayers, config.batsmen_variations, remainingCredits, settings);
      } else if (role === 'bowlers') {
        this.selectBowlersBySpecialization(team, availablePlayers, config.bowler_variations, remainingCredits, settings);
      } else {
        this.selectByRole(team, availablePlayers, count as number, remainingCredits, settings, diversityOffset);
      }
    }
    
    // Fill remaining spots if needed
    this.fillRemainingSpots(team, players, remainingCredits);
    
    // Select captain and vice-captain with rotation
    const { captain, viceCaptain } = this.selectCaptaincy(team, settings, teamIndex);
    
    // Calculate team metrics
    const teamMetrics = this.calculateTeamMetrics(team, config, settings);
    
    return {
      team_name: `Role-Split Team ${teamIndex + 1}`,
      players: team.map(player => ({
        ...player,
        is_captain: player.id === captain?.id,
        is_vice_captain: player.id === viceCaptain?.id
      })),
      total_credits: 100 - remainingCredits,
      captain_name: captain?.name || 'Unknown',
      vice_captain_name: viceCaptain?.name || 'Unknown',
      formation_used: settings.formation_style,
      role_optimization_score: teamMetrics.roleOptimization,
      specialization_balance: teamMetrics.specializationBalance,
      complementary_skills_score: teamMetrics.complementarySkills,
      diversity_index: teamMetrics.diversityIndex,
      expected_ownership: Math.round(Math.random() * 15 + 20), // 20-35%
      risk_level: settings.role_balance_strictness === 'experimental' ? 'High' : 
                 settings.role_balance_strictness === 'strict' ? 'Low' : 'Medium'
    };
  }

  private getFormationDistribution(formation: string): any {
    switch (formation) {
      case '3-4-3-1':
        return { batsmen: 3, bowlers: 4, allRounders: 3, wicketKeepers: 1 };
      case '5-3-2-1':
        return { batsmen: 5, bowlers: 3, allRounders: 2, wicketKeepers: 1 };
      case 'custom':
        return { batsmen: 4, bowlers: 4, allRounders: 2, wicketKeepers: 1 }; // fallback
      default: // '4-4-2-1'
        return { batsmen: 4, bowlers: 4, allRounders: 2, wicketKeepers: 1 };
    }
  }

  private adjustRoleTargetsForSpecialization(
    baseDistribution: any,
    config: RoleSplitConfig,
    teamIndex: number
  ): any {
    // Adjust based on specialization requirements
    const adjusted = { ...baseDistribution };
    
    // Wicketkeeper strategy adjustment
    if (config.wicketkeeper_strategy === 'dual_keeper') {
      adjusted.wicketKeepers = 2;
      adjusted.batsmen = Math.max(2, adjusted.batsmen - 1);
    }
    
    return adjusted;
  }

  private groupPlayersByRoleAndSpecialization(players: any[]): any {
    const grouped: any = {
      batsmen: [],
      bowlers: [],
      allRounders: [],
      wicketKeepers: []
    };
    
    players.forEach(player => {
      const role = this.roleService.normalizeRole(player.role);
      if (grouped[role]) {
        grouped[role].push(player);
      }
    });
    
    // Sort each group by specialization score
    Object.keys(grouped).forEach(role => {
      grouped[role].sort((a: any, b: any) => (b.specialization_score || 0) - (a.specialization_score || 0));
    });
    
    return grouped;
  }

  private selectBatsmenBySpecialization(
    team: any[],
    availablePlayers: any[],
    variations: any,
    remainingCredits: number,
    settings: OptimizationSettings
  ): void {
    const specializations = [
      { type: 'aggressive_openers', count: variations.aggressive_openers },
      { type: 'anchor_middle_order', count: variations.anchor_middle_order },
      { type: 'finisher_specialists', count: variations.finisher_specialists }
    ];
    
    for (const { type, count } of specializations) {
      const specialists = availablePlayers.filter(p => p.role_specialization === type);
      const selected = specialists.slice(0, count).filter(p => {
        const cost = p.credits || 8;
        return remainingCredits >= cost && !team.some(tp => tp.id === p.id);
      });
      
      team.push(...selected);
    }
  }

  private selectBowlersBySpecialization(
    team: any[],
    availablePlayers: any[],
    variations: any,
    remainingCredits: number,
    settings: OptimizationSettings
  ): void {
    const specializations = [
      { type: 'powerplay_specialists', count: variations.powerplay_specialists },
      { type: 'middle_overs_control', count: variations.middle_overs_control },
      { type: 'death_bowling_experts', count: variations.death_bowling_experts }
    ];
    
    for (const { type, count } of specializations) {
      const specialists = availablePlayers.filter(p => p.role_specialization === type);
      const selected = specialists.slice(0, count).filter(p => {
        const cost = p.credits || 8;
        return remainingCredits >= cost && !team.some(tp => tp.id === p.id);
      });
      
      team.push(...selected);
    }
  }

  private selectByRole(
    team: any[],
    availablePlayers: any[],
    count: number,
    remainingCredits: number,
    settings: OptimizationSettings,
    diversityOffset: number
  ): void {
    const selected = availablePlayers
      .filter(p => !team.some(tp => tp.id === p.id))
      .slice(0, count)
      .filter(p => {
        const cost = p.credits || 8;
        return remainingCredits >= cost;
      });
    
    team.push(...selected);
  }

  private fillRemainingSpots(team: any[], allPlayers: any[], remainingCredits: number): void {
    const availablePlayers = allPlayers
      .filter(p => !team.some(tp => tp.id === p.id))
      .sort((a, b) => (b.specialization_score || 0) - (a.specialization_score || 0));
    
    for (const player of availablePlayers) {
      if (team.length >= 11) break;
      const cost = player.credits || 8;
      if (remainingCredits >= cost) {
        team.push(player);
        remainingCredits -= cost;
      }
    }
  }

  private selectCaptaincy(team: any[], settings: OptimizationSettings, teamIndex: number): { captain: any; viceCaptain: any } {
    let candidates = [...team].sort((a, b) => (b.specialization_score || 0) - (a.specialization_score || 0));
    
    if (settings.captaincy_rotation) {
      // Rotate captaincy based on team index
      const rotationIndex = teamIndex % candidates.length;
      candidates = [...candidates.slice(rotationIndex), ...candidates.slice(0, rotationIndex)];
    }
    
    const captain = candidates[0];
    const viceCaptain = candidates[1];
    
    return { captain, viceCaptain };
  }

  private calculateTeamMetrics(team: any[], config: RoleSplitConfig, settings: OptimizationSettings): any {
    const avgSpecializationScore = team.reduce((sum, p) => sum + (p.specialization_score || 0), 0) / team.length;
    
    // Calculate role balance
    const roleCounts = team.reduce((counts: any, player) => {
      const role = this.roleService.normalizeRole(player.role);
      counts[role] = (counts[role] || 0) + 1;
      return counts;
    }, {});
    
    const expectedDistribution = this.getFormationDistribution(settings.formation_style);
    const balanceScore = Object.keys(expectedDistribution).reduce((score, role) => {
      const expected = expectedDistribution[role];
      const actual = roleCounts[role] || 0;
      return score + Math.max(0, 10 - Math.abs(expected - actual));
    }, 0) / 40; // Normalize to 0-1
    
    return {
      roleOptimization: Math.round(avgSpecializationScore * 6), // 30-120 scale
      specializationBalance: Math.round(balanceScore * 100), // 0-100 scale
      complementarySkills: Math.round(Math.random() * 30 + 70), // 70-100
      diversityIndex: Math.round(settings.diversity_factor * 100) // 0-100
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roleSplitConfig, optimizationSettings, teamCount, matchData } = body;

    console.log('Strategy 7 request:', {
      formation: optimizationSettings?.formation_style,
      strictness: optimizationSettings?.role_balance_strictness,
      teamCount,
      matchId: matchData?.match?.id
    });

    // Get players from match data
    let players = matchData?.players || [];
    
    // Add mock enhanced stats if missing
    players = players.map((player: any) => ({
      ...player,
      credits: player.credits || (8 + Math.random() * 4),
      recent_form: player.recent_form || (6 + Math.random() * 4)
    }));

    console.log(`Processing ${players.length} players for role-split optimization`);

    // Initialize services
    const roleService = new RoleSpecializationService();
    const teamBuilder = new RoleSplitTeamBuilder(roleService);

    // Generate teams with role specialization
    const teams = teamBuilder.buildTeams(players, roleSplitConfig, optimizationSettings, teamCount, matchData);
    
    console.log(`Generated ${teams.length} role-optimized teams`);

    // Calculate aggregate statistics
    const avgRoleOptimization = teams.reduce((sum, team) => sum + (team.role_optimization_score || 0), 0) / teams.length;
    const avgSpecializationBalance = teams.reduce((sum, team) => sum + (team.specialization_balance || 0), 0) / teams.length;
    
    const result = {
      teams,
      strategy: 'Strategy 7: Role-Split Lineups',
      total_teams: teams.length,
      configuration: {
        role_split_config: roleSplitConfig,
        optimization_settings: optimizationSettings,
        formation_used: optimizationSettings.formation_style
      },
      analytics: {
        average_role_optimization: Math.round(avgRoleOptimization * 100) / 100,
        average_specialization_balance: Math.round(avgSpecializationBalance * 100) / 100,
        formation_distribution: teams.reduce((acc: any, team) => {
          acc[team.formation_used] = (acc[team.formation_used] || 0) + 1;
          return acc;
        }, {}),
        risk_distribution: teams.reduce((acc: any, team) => {
          acc[team.risk_level] = (acc[team.risk_level] || 0) + 1;
          return acc;
        }, {}),
        specialization_coverage: {
          batting_specializations: Object.keys(roleSplitConfig.batsmen_variations),
          bowling_specializations: Object.keys(roleSplitConfig.bowler_variations),
          allrounder_focus: roleSplitConfig.allrounder_focus,
          keeper_strategy: roleSplitConfig.wicketkeeper_strategy
        }
      },
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Strategy 7 generation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate Strategy 7 teams',
        details: error instanceof Error ? error.message : 'Unknown error',
        strategy: 'Strategy 7: Role-Split Lineups'
      },
      { status: 500 }
    );
  }
}
