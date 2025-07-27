import { NextRequest, NextResponse } from 'next/server';

interface PresetScenario {
  id: string;
  name: string;
  description: string;
  strategy: string;
  risk_level: 'Low' | 'Medium' | 'High';
  expected_ownership: string;
  best_for: string;
  key_features: string[];
}

interface ScenarioCustomization {
  captaincy_style: 'safe' | 'differential' | 'balanced';
  budget_distribution: 'conservative' | 'aggressive' | 'balanced';
  player_selection_approach: 'form_based' | 'fixture_based' | 'statistical';
  risk_tolerance: number;
  ownership_target: 'low' | 'medium' | 'high';
  team_diversity: boolean;
}

class PresetScenarioService {
  private getScenarioPlayerScore(player: any, scenario: PresetScenario, customization: ScenarioCustomization): number {
    let score = Math.random() * 10 + 5; // Base score 5-15
    
    // Apply scenario-specific bonuses
    switch (scenario.id) {
      case 'powerplay_dominance':
        if (player.role?.toLowerCase().includes('bat') && player.batting_order <= 3) {
          score += 3; // Boost for top-order batsmen
        }
        if (player.strike_rate && player.strike_rate > 130) {
          score += 2; // Bonus for aggressive batsmen
        }
        break;
        
      case 'middle_order_stability':
        if (player.role?.toLowerCase().includes('all') || 
            (player.role?.toLowerCase().includes('bat') && player.batting_order >= 4)) {
          score += 3; // Boost for middle-order and all-rounders
        }
        if (player.consistency_score && player.consistency_score > 7) {
          score += 2; // Bonus for consistent players
        }
        break;
        
      case 'bowling_conditions':
        if (player.role?.toLowerCase().includes('bowl')) {
          score += 4; // Major boost for bowlers
        }
        if (player.wickets_per_match && player.wickets_per_match > 1.5) {
          score += 2; // Bonus for wicket-takers
        }
        break;
        
      case 'spin_domination':
        if (player.bowling_style?.toLowerCase().includes('spin')) {
          score += 4; // Major boost for spinners
        }
        if (player.spin_bowling_average && player.spin_bowling_average < 25) {
          score += 2; // Bonus for effective spinners
        }
        break;
        
      case 'differential_captaincy':
        if (player.captaincy_potential && player.ownership_percentage < 20) {
          score += 5; // Huge boost for low-owned captaincy options
        }
        break;
        
      case 'safe_template':
        if (player.ownership_percentage && player.ownership_percentage > 30) {
          score += 3; // Boost for high-owned players
        }
        if (player.consistency_score && player.consistency_score > 8) {
          score += 2; // Bonus for very consistent players
        }
        break;
        
      case 'weather_disruption':
        if (player.short_format_average && player.short_format_average > player.overall_average) {
          score += 3; // Boost for players good in shortened games
        }
        break;
        
      case 'venue_specialists':
        if (player.venue_average && player.venue_average > player.overall_average * 1.2) {
          score += 4; // Major boost for venue specialists
        }
        break;
    }
    
    // Apply customization adjustments
    switch (customization.captaincy_style) {
      case 'safe':
        if (player.ownership_percentage > 25) score += 1;
        break;
      case 'differential':
        if (player.ownership_percentage < 15) score += 2;
        break;
    }
    
    switch (customization.budget_distribution) {
      case 'conservative':
        if (player.credits <= 9) score += 1;
        break;
      case 'aggressive':
        if (player.credits >= 10) score += 2;
        break;
    }
    
    switch (customization.player_selection_approach) {
      case 'form_based':
        if (player.recent_form > 8) score += 2;
        break;
      case 'fixture_based':
        if (player.opponent_matchup_score > 7) score += 2;
        break;
      case 'statistical':
        if (player.statistical_edge > 6) score += 2;
        break;
    }
    
    // Risk tolerance adjustment
    const riskMultiplier = customization.risk_tolerance / 10;
    if (player.volatility_score) {
      score += (player.volatility_score - 5) * riskMultiplier;
    }
    
    return Math.max(1, Math.min(20, score));
  }

  private selectCaptainAndViceCaptain(players: any[], scenario: PresetScenario, customization: ScenarioCustomization): {captain: any, viceCaptain: any} {
    // Filter potential captains
    let captainCandidates = players.filter(p => p.captaincy_potential || p.scenario_score > 12);
    
    if (customization.captaincy_style === 'safe') {
      captainCandidates = captainCandidates.filter(p => p.ownership_percentage > 20);
    } else if (customization.captaincy_style === 'differential') {
      captainCandidates = captainCandidates.filter(p => p.ownership_percentage < 20);
    }
    
    // Special captaincy logic for differential scenario
    if (scenario.id === 'differential_captaincy') {
      captainCandidates = players
        .filter(p => p.ownership_percentage < 15)
        .sort((a, b) => b.scenario_score - a.scenario_score);
    }
    
    // Sort by scenario score
    captainCandidates.sort((a, b) => b.scenario_score - a.scenario_score);
    
    const captain = captainCandidates[0] || players[0];
    const viceCaptain = captainCandidates[1] || players[1];
    
    return { captain, viceCaptain };
  }

  generateTeams(
    players: any[], 
    scenario: PresetScenario, 
    customization: ScenarioCustomization, 
    teamCount: number,
    matchData: any
  ): any[] {
    const teams = [];
    
    // Add scenario scores to all players
    const scoredPlayers = players.map(player => ({
      ...player,
      scenario_score: this.getScenarioPlayerScore(player, scenario, customization),
      captaincy_potential: Math.random() > 0.7, // 30% of players have captaincy potential
      ownership_percentage: player.ownership_percentage || Math.random() * 50,
      volatility_score: Math.random() * 10,
      opponent_matchup_score: Math.random() * 10,
      statistical_edge: Math.random() * 10,
      venue_average: player.venue_average || (player.overall_average || 30) * (0.8 + Math.random() * 0.4),
      overall_average: player.overall_average || (25 + Math.random() * 15)
    }));
    
    for (let i = 0; i < teamCount; i++) {
      const team = this.buildSingleTeam(scoredPlayers, scenario, customization, i, matchData);
      if (team) teams.push(team);
    }
    
    return teams;
  }

  private buildSingleTeam(
    players: any[], 
    scenario: PresetScenario, 
    customization: ScenarioCustomization, 
    teamIndex: number,
    matchData: any
  ): any {
    const team: any[] = [];
    let remainingCredits = 100;
    
    // Sort players by scenario score with some randomization for diversity
    const diversityFactor = customization.team_diversity ? (Math.random() * 0.3) : 0;
    const sortedPlayers = [...players].sort((a, b) => {
      const scoreA = a.scenario_score + (Math.random() - 0.5) * diversityFactor * 5;
      const scoreB = b.scenario_score + (Math.random() - 0.5) * diversityFactor * 5;
      return scoreB - scoreA;
    });
    
    // Role distribution based on scenario
    const roleTargets = this.getScenarioRoleTargets(scenario, teamIndex);
    const roleCounts: { [key: string]: number } = { 
      batsmen: 0, 
      bowlers: 0, 
      allRounders: 0, 
      wicketKeepers: 0 
    };
    
    // Select players based on role requirements and budget
    for (const player of sortedPlayers) {
      if (team.length >= 11) break;
      
      const role = this.normalizeRole(player.role);
      const playerPrice = player.credits || (8 + Math.random() * 4);
      
      // Check if we can afford and need this role
      if (remainingCredits >= playerPrice && roleCounts[role] < roleTargets[role]) {
        team.push(player);
        remainingCredits -= playerPrice;
        roleCounts[role]++;
      }
    }
    
    // Fill remaining spots if needed
    for (const player of sortedPlayers) {
      if (team.length >= 11) break;
      
      const playerPrice = player.credits || (8 + Math.random() * 4);
      if (remainingCredits >= playerPrice && !team.some(tp => tp.id === player.id)) {
        team.push(player);
        remainingCredits -= playerPrice;
      }
    }
    
    // Select captain and vice-captain
    const { captain, viceCaptain } = this.selectCaptainAndViceCaptain(team, scenario, customization);
    
    // Calculate team metrics
    const avgScenarioScore = team.reduce((sum, p) => sum + p.scenario_score, 0) / team.length;
    const avgOwnership = team.reduce((sum, p) => sum + p.ownership_percentage, 0) / team.length;
    
    return {
      team_name: `${scenario.name} #${teamIndex + 1}`,
      players: team.map(player => ({
        ...player,
        is_captain: player.id === captain?.id,
        is_vice_captain: player.id === viceCaptain?.id
      })),
      total_credits: 100 - remainingCredits,
      captain_name: captain?.name || 'Unknown',
      vice_captain_name: viceCaptain?.name || 'Unknown',
      strategy_confidence: Math.max(70, avgScenarioScore * 5), // 70-100%
      scenario_alignment: Math.round(avgScenarioScore * 6), // 30-120 scale
      expected_ownership: Math.round(avgOwnership),
      risk_level: scenario.risk_level,
      scenario_id: scenario.id,
      customization_applied: {
        captaincy_style: customization.captaincy_style,
        budget_approach: customization.budget_distribution,
        selection_criteria: customization.player_selection_approach
      }
    };
  }

  private getScenarioRoleTargets(scenario: PresetScenario, teamIndex: number): { [key: string]: number } {
    // Default distribution
    let targets = { batsmen: 4, bowlers: 4, allRounders: 2, wicketKeepers: 1 };
    
    // Adjust based on scenario
    switch (scenario.id) {
      case 'powerplay_dominance':
        targets = { batsmen: 5, bowlers: 3, allRounders: 2, wicketKeepers: 1 };
        break;
      case 'middle_order_stability':
        targets = { batsmen: 3, bowlers: 3, allRounders: 4, wicketKeepers: 1 };
        break;
      case 'bowling_conditions':
        targets = { batsmen: 3, bowlers: 5, allRounders: 2, wicketKeepers: 1 };
        break;
      case 'spin_domination':
        targets = { batsmen: 4, bowlers: 4, allRounders: 2, wicketKeepers: 1 };
        break;
    }
    
    // Add some variation based on team index
    if (teamIndex % 2 === 1) {
      targets.batsmen = Math.max(3, targets.batsmen - 1);
      targets.allRounders = Math.min(4, targets.allRounders + 1);
    }
    
    return targets;
  }

  private normalizeRole(role: string): string {
    const roleLower = role?.toLowerCase() || '';
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
    const { selectedScenario, customization, teamCount, matchData } = body;

    console.log('Strategy 6 request:', {
      scenario: selectedScenario?.name,
      captaincy: customization?.captaincy_style,
      teamCount,
      matchId: matchData?.match?.id
    });

    if (!selectedScenario) {
      return NextResponse.json(
        { error: 'No scenario selected', strategy: 'Strategy 6: Preset Scenarios' },
        { status: 400 }
      );
    }

    // Get players from match data
    let players = matchData?.players || [];
    
    // Add mock enhanced stats if missing
    players = players.map((player: any) => ({
      ...player,
      credits: player.credits || (8 + Math.random() * 4),
      recent_form: player.recent_form || (6 + Math.random() * 4),
      consistency_score: Math.random() * 10,
      batting_order: Math.floor(Math.random() * 11) + 1,
      strike_rate: 100 + Math.random() * 50,
      wickets_per_match: Math.random() * 3,
      bowling_style: Math.random() > 0.6 ? 'spin' : 'pace',
      spin_bowling_average: 20 + Math.random() * 15,
      short_format_average: 25 + Math.random() * 20
    }));

    console.log(`Processing ${players.length} players for ${selectedScenario.name} scenario`);

    // Initialize service and generate teams
    const scenarioService = new PresetScenarioService();
    const teams = scenarioService.generateTeams(players, selectedScenario, customization, teamCount, matchData);
    
    console.log(`Generated ${teams.length} teams using ${selectedScenario.name} scenario`);

    // Calculate aggregate statistics
    const avgConfidence = teams.reduce((sum, team) => sum + (team.strategy_confidence || 0), 0) / teams.length;
    const avgOwnership = teams.reduce((sum, team) => sum + (team.expected_ownership || 0), 0) / teams.length;
    const avgScenarioAlignment = teams.reduce((sum, team) => sum + (team.scenario_alignment || 0), 0) / teams.length;
    
    const result = {
      teams,
      strategy: 'Strategy 6: Preset Scenarios',
      total_teams: teams.length,
      scenario_used: {
        name: selectedScenario.name,
        description: selectedScenario.description,
        risk_level: selectedScenario.risk_level,
        expected_ownership_range: selectedScenario.expected_ownership,
        key_features: selectedScenario.key_features
      },
      customization_applied: customization,
      analytics: {
        average_confidence: Math.round(avgConfidence * 100) / 100,
        average_ownership: Math.round(avgOwnership * 100) / 100,
        scenario_alignment_score: Math.round(avgScenarioAlignment * 100) / 100,
        risk_distribution: teams.reduce((acc: any, team) => {
          acc[team.risk_level] = (acc[team.risk_level] || 0) + 1;
          return acc;
        }, {}),
        captaincy_distribution: teams.reduce((acc: any, team) => {
          const style = team.customization_applied.captaincy_style;
          acc[style] = (acc[style] || 0) + 1;
          return acc;
        }, {})
      },
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Strategy 6 generation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate Strategy 6 teams',
        details: error instanceof Error ? error.message : 'Unknown error',
        strategy: 'Strategy 6: Preset Scenarios'
      },
      { status: 500 }
    );
  }
}
