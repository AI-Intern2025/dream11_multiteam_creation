import { neonDB, Player, Match } from './neon-db';

interface AITeamAnalysis {
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

interface PresetTeamRequest {
  matchId: number;
  presetId: string;
  teamCount: number;
  teamNames: {
    teamA: string;
    teamB: string;
  };
  matchConditions?: {
    format: string;
    pitch: string;
    weather: string;
    venue: string;
  };
}

interface PresetConfiguration {
  id: string;
  name: string;
  description: string;
  strategy: string;
  focus: Record<string, any>;
  riskLevel: 'low' | 'medium' | 'high';
  tags: string[];
  constraints: any;
}

class PresetStrategyService {
  private presetConfigurations: PresetConfiguration[] = [
    {
      id: 'team-a-high-total',
      name: 'Team A High Total, Team B Collapse',
      description: 'Stack Team A batsmen and Team B bowlers',
      strategy: 'team-a-batting-heavy',
      focus: { teamA: 'batsmen', teamB: 'bowlers' },
      riskLevel: 'medium',
      tags: ['batting-pitch', 'one-sided'],
      constraints: { teamABatsmen: 5, teamBBowlers: 3 }
    },
    {
      id: 'team-b-high-total',
      name: 'Team B High Total, Team A Collapse',
      description: 'Stack Team B batsmen and Team A bowlers',
      strategy: 'team-b-batting-heavy',
      focus: { teamA: 'bowlers', teamB: 'batsmen' },
      riskLevel: 'medium',
      tags: ['batting-pitch', 'one-sided'],
      constraints: { teamBBatsmen: 5, teamABowlers: 3 }
    },
    {
      id: 'high-differentials',
      name: 'High Differentials Strategy',
      description: 'Focus on low-ownership, high-upside players',
      strategy: 'differential',
      focus: { ownership: 'low', upside: 'high' },
      riskLevel: 'high',
      tags: ['differential', 'contrarian', 'high-risk'],
      constraints: { maxOwnership: 20 }
    },
    {
      id: 'balanced-roles',
      name: 'Balanced Roles (4 BAT, 3 BOWL, 2 AR, 1 WK)',
      description: 'Traditional balanced team composition',
      strategy: 'balanced',
      focus: { batsmen: 4, bowlers: 3, allRounders: 2, wicketKeepers: 1 },
      riskLevel: 'low',
      tags: ['balanced', 'traditional', 'safe'],
      constraints: { minBatsmen: 4, minBowlers: 3, minAllRounders: 2, minWicketKeepers: 1 }
    },
    {
      id: 'all-rounder-heavy',
      name: 'All-Rounder Heavy Lineup',
      description: 'Stack all-rounders for maximum versatility',
      strategy: 'all-rounder-heavy',
      focus: { allRounders: 4, versatility: 'high' },
      riskLevel: 'medium',
      tags: ['all-rounders', 'versatile', 'captaincy'],
      constraints: { minAllRounders: 4 }
    },
    {
      id: 'top-order-stack',
      name: 'Top Order Batting Stack',
      description: 'Focus on openers and #3 batsmen',
      strategy: 'top-order-batting',
      focus: { battingOrder: 'top', position: '1-3' },
      riskLevel: 'medium',
      tags: ['top-order', 'batting', 'powerplay'],
      constraints: { topOrderBatsmen: 4 }
    },
    {
      id: 'bowling-pitch',
      name: 'Bowling Pitch Special',
      description: 'Bowler-heavy lineup for seaming/spinning conditions',
      strategy: 'bowling-heavy',
      focus: { bowlers: 5, wickets: 'high' },
      riskLevel: 'high',
      tags: ['bowling', 'conditions', 'low-scoring'],
      constraints: { minBowlers: 5 }
    },
    {
      id: 'death-specialists',
      name: 'Death Overs Specialists',
      description: 'Focus on players who excel in death overs',
      strategy: 'death-overs',
      focus: { phase: 'death', specialists: 'high' },
      riskLevel: 'medium',
      tags: ['death-overs', 'finishers', 'specialist'],
      constraints: { deathSpecialists: 4 }
    }
  ];

  async generatePresetTeams(request: PresetTeamRequest): Promise<AITeamAnalysis[]> {
    console.log(`🎯 Generating preset teams for preset: ${request.presetId}`);
    
    const preset = this.getPresetById(request.presetId);
    if (!preset) {
      throw new Error(`Preset not found: ${request.presetId}`);
    }

    // Get match and player data
    const match = await neonDB.getMatchById(request.matchId);
    if (!match) {
      throw new Error(`Match not found: ${request.matchId}`);
    }

    // Get players specific to this match, not all players
    const players = await neonDB.getPlayingPlayersForMatch(request.matchId);
    console.log(`📊 Found ${players.length} players for match ${request.matchId}`);
    
    if (players.length === 0) {
      throw new Error(`No players found for match ${request.matchId}`);
    }

    const teams: AITeamAnalysis[] = [];

    // Generate teams based on preset configuration
    for (let i = 0; i < request.teamCount; i++) {
      const team = await this.generatePresetTeam(
        preset,
        players,
        match,
        request,
        i
      );
      teams.push(team);
    }

    return teams;
  }

  private getPresetById(presetId: string): PresetConfiguration | null {
    return this.presetConfigurations.find(p => p.id === presetId) || null;
  }

  private async generatePresetTeam(
    preset: PresetConfiguration,
    players: Player[],
    match: Match,
    request: PresetTeamRequest,
    teamIndex: number
  ): Promise<AITeamAnalysis> {
    console.log(`🏏 Generating preset team ${teamIndex + 1} using ${preset.name}`);

    // Apply preset-specific player selection logic
    const selectedPlayers = this.selectPlayersForPreset(preset, players, teamIndex);
    
    // Ensure we have exactly 11 players
    const finalPlayers = selectedPlayers.slice(0, 11);
    
    // Fill with random players if needed
    while (finalPlayers.length < 11) {
      const remainingPlayers = players.filter(p => !finalPlayers.some(fp => fp.id === p.id));
      if (remainingPlayers.length > 0) {
        finalPlayers.push(remainingPlayers[Math.floor(Math.random() * remainingPlayers.length)]);
      } else {
        break;
      }
    }

    // Select captain and vice-captain based on preset strategy
    const { captain, viceCaptain } = this.selectCaptainsForPreset(preset, finalPlayers, teamIndex);

    // Calculate team stats
    const totalCredits = finalPlayers.reduce((sum, p) => sum + (p.credits || 8), 0);
    const roleBalance = this.calculateRoleBalance(finalPlayers);
    const riskScore = this.calculatePresetRiskScore(preset, finalPlayers);
    const expectedPoints = this.calculateExpectedPoints(finalPlayers, captain, viceCaptain);

    return {
      players: finalPlayers,
      captain,
      viceCaptain,
      totalCredits,
      roleBalance,
      riskScore,
      expectedPoints,
      confidence: 80,
      reasoning: `Preset team ${teamIndex + 1} generated using ${preset.name} strategy`,
      insights: [
        `Strategy: ${preset.strategy}`,
        `Risk Level: ${preset.riskLevel}`,
        `Focus: ${Object.entries(preset.focus).map(([k, v]) => `${k}: ${((v as number) * 100).toFixed(0)}%`).join(', ')}`,
        `Tags: ${preset.tags.join(', ')}`
      ]
    };
  }

  private selectPlayersForPreset(preset: PresetConfiguration, players: Player[], teamIndex: number): Player[] {
    const selectedPlayers: Player[] = [];
    
    // Group players by role
    const playersByRole = {
      WK: players.filter(p => p.player_role === 'WK'),
      BAT: players.filter(p => p.player_role === 'BAT'),
      AR: players.filter(p => p.player_role === 'AR'),
      BWL: players.filter(p => p.player_role === 'BWL')
    };

    // Group players by team using team_name
    const teamNames = Array.from(new Set(players.map(p => p.team_name)));
    const teamAPlayers = players.filter(p => p.team_name === teamNames[0]);
    const teamBPlayers = players.filter(p => p.team_name === teamNames[1]);
    
    console.log(`🏏 Match teams: ${teamNames.join(' vs ')}`);
    console.log(`📊 Team A (${teamNames[0]}): ${teamAPlayers.length} players`);
    console.log(`📊 Team B (${teamNames[1]}): ${teamBPlayers.length} players`);

    // Select based on preset strategy
    switch (preset.strategy) {
      case 'team-a-batting-heavy':
        // Stack Team A batsmen, Team B bowlers
        selectedPlayers.push(...this.selectTopPlayers(playersByRole.WK, 1));
        selectedPlayers.push(...this.selectTopPlayers(teamAPlayers.filter(p => p.player_role === 'BAT'), 4));
        selectedPlayers.push(...this.selectTopPlayers(teamAPlayers.filter(p => p.player_role === 'AR'), 2));
        selectedPlayers.push(...this.selectTopPlayers(teamBPlayers.filter(p => p.player_role === 'BWL'), 3));
        selectedPlayers.push(...this.selectTopPlayers(playersByRole.BWL, 1));
        break;
      
      case 'team-b-batting-heavy':
        // Stack Team B batsmen, Team A bowlers
        selectedPlayers.push(...this.selectTopPlayers(playersByRole.WK, 1));
        selectedPlayers.push(...this.selectTopPlayers(teamBPlayers.filter(p => p.player_role === 'BAT'), 4));
        selectedPlayers.push(...this.selectTopPlayers(teamBPlayers.filter(p => p.player_role === 'AR'), 2));
        selectedPlayers.push(...this.selectTopPlayers(teamAPlayers.filter(p => p.player_role === 'BWL'), 3));
        selectedPlayers.push(...this.selectTopPlayers(playersByRole.BWL, 1));
        break;
      
      case 'differential':
        // Select lower-owned players with high upside
        selectedPlayers.push(...this.selectDifferentialPlayers(playersByRole.WK, 1));
        selectedPlayers.push(...this.selectDifferentialPlayers(playersByRole.BAT, 4));
        selectedPlayers.push(...this.selectDifferentialPlayers(playersByRole.AR, 2));
        selectedPlayers.push(...this.selectDifferentialPlayers(playersByRole.BWL, 4));
        break;
      
      case 'balanced':
        // Traditional balanced composition: 4 BAT, 3 BOWL, 2 AR, 1 WK
        selectedPlayers.push(...this.selectTopPlayers(playersByRole.WK, 1));
        selectedPlayers.push(...this.selectTopPlayers(playersByRole.BAT, 4));
        selectedPlayers.push(...this.selectTopPlayers(playersByRole.AR, 2));
        selectedPlayers.push(...this.selectTopPlayers(playersByRole.BWL, 4));
        break;
      
      case 'all-rounder-heavy':
        // Stack all-rounders for maximum versatility
        selectedPlayers.push(...this.selectTopPlayers(playersByRole.WK, 1));
        selectedPlayers.push(...this.selectTopPlayers(playersByRole.BAT, 2));
        selectedPlayers.push(...this.selectTopPlayers(playersByRole.AR, 4));
        selectedPlayers.push(...this.selectTopPlayers(playersByRole.BWL, 4));
        break;
      
      case 'top-order-batting':
        // Focus on top-order batsmen (use points as proxy for batting order)
        const topOrderBatsmen = playersByRole.BAT
          .sort((a, b) => (b.points || 0) - (a.points || 0))
          .slice(0, 6); // Take top 6 batsmen as "top order"
        selectedPlayers.push(...this.selectTopPlayers(playersByRole.WK, 1));
        selectedPlayers.push(...this.selectTopPlayers(topOrderBatsmen, 4));
        selectedPlayers.push(...this.selectTopPlayers(playersByRole.AR, 2));
        selectedPlayers.push(...this.selectTopPlayers(playersByRole.BWL, 4));
        break;
      
      case 'bowling-heavy':
        // Bowler-heavy lineup for low-scoring conditions
        selectedPlayers.push(...this.selectTopPlayers(playersByRole.WK, 1));
        selectedPlayers.push(...this.selectTopPlayers(playersByRole.BAT, 3));
        selectedPlayers.push(...this.selectTopPlayers(playersByRole.AR, 2));
        selectedPlayers.push(...this.selectTopPlayers(playersByRole.BWL, 5));
        break;
      
      case 'death-overs':
        // Focus on death overs specialists (use high point bowlers and all-rounders)
        const deathBowlers = playersByRole.BWL
          .sort((a, b) => (b.points || 0) - (a.points || 0))
          .slice(0, 8); // Take top bowlers as "death specialists"
        const finishers = [...playersByRole.BAT, ...playersByRole.AR]
          .sort((a, b) => (b.points || 0) - (a.points || 0))
          .slice(0, 8); // Take top finishers
        selectedPlayers.push(...this.selectTopPlayers(playersByRole.WK, 1));
        selectedPlayers.push(...this.selectTopPlayers(finishers, 4));
        selectedPlayers.push(...this.selectTopPlayers(playersByRole.AR, 2));
        selectedPlayers.push(...this.selectTopPlayers(deathBowlers, 4));
        break;
      
      default:
        // Default balanced approach
        selectedPlayers.push(...this.selectTopPlayers(playersByRole.WK, 1));
        selectedPlayers.push(...this.selectTopPlayers(playersByRole.BAT, 4));
        selectedPlayers.push(...this.selectTopPlayers(playersByRole.AR, 2));
        selectedPlayers.push(...this.selectTopPlayers(playersByRole.BWL, 4));
        break;
    }

    return selectedPlayers;
  }

  private selectTopPlayers(rolePlayers: Player[], count: number): Player[] {
    return rolePlayers
      .sort((a, b) => (b.points || 0) - (a.points || 0))
      .slice(0, count);
  }

  private selectDifferentialPlayers(rolePlayers: Player[], count: number): Player[] {
    return rolePlayers
      .sort((a, b) => {
        const aScore = (a.points || 0) - (a.selection_percentage || 0);
        const bScore = (b.points || 0) - (b.selection_percentage || 0);
        return bScore - aScore;
      })
      .slice(0, count);
  }

  private selectCaptainsForPreset(preset: PresetConfiguration, players: Player[], teamIndex: number): { captain: Player; viceCaptain: Player } {
    // Filter for captain-worthy players
    const captainCandidates = players.filter(p => 
      p.player_role === 'BAT' || p.player_role === 'AR' || p.player_role === 'WK'
    );

    if (captainCandidates.length < 2) {
      return { captain: players[0], viceCaptain: players[1] };
    }

    // Sort by points for basic captain selection
    const sortedCandidates = captainCandidates.sort((a, b) => (b.points || 0) - (a.points || 0));
    
    // Vary captain selection based on team index
    const captainIndex = teamIndex % sortedCandidates.length;
    const viceCaptainIndex = (teamIndex + 1) % sortedCandidates.length;

    return {
      captain: sortedCandidates[captainIndex],
      viceCaptain: sortedCandidates[viceCaptainIndex === captainIndex ? 
        (viceCaptainIndex + 1) % sortedCandidates.length : viceCaptainIndex]
    };
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

  private calculatePresetRiskScore(preset: PresetConfiguration, players: Player[]): number {
    const baseRisk = preset.riskLevel === 'low' ? 20 : preset.riskLevel === 'medium' ? 50 : 80;
    const avgSelection = players.reduce((sum, p) => sum + (p.selection_percentage || 0), 0) / players.length;
    
    // Adjust risk based on average selection percentage
    const selectionRisk = avgSelection < 20 ? 30 : avgSelection < 40 ? 10 : -10;
    
    return Math.max(0, Math.min(100, baseRisk + selectionRisk));
  }

  private calculateExpectedPoints(players: Player[], captain: Player, viceCaptain: Player): number {
    const basePoints = players.reduce((sum, p) => sum + (p.points || 0), 0);
    const captainBonus = (captain.points || 0) * 1.0; // 2x - 1x = 1x bonus
    const viceCaptainBonus = (viceCaptain.points || 0) * 0.5; // 1.5x - 1x = 0.5x bonus
    
    return basePoints + captainBonus + viceCaptainBonus;
  }

  // Method to get all available presets
  getAvailablePresets(): PresetConfiguration[] {
    return this.presetConfigurations;
  }

  // Method to validate preset request
  validatePresetRequest(request: PresetTeamRequest): boolean {
    return !!(request.matchId && request.presetId && request.teamCount && request.teamNames);
  }
}

export const presetStrategyService = new PresetStrategyService();
