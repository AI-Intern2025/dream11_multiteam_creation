// Preset Strategy Service for Strategy 6: Preset Scenarios / Configurations
// This service handles the core logic for applying preset constraints to team generation

import { neonDB, Player, Match } from './neon-db';
import { PRESET_CONFIGURATIONS, PresetConfiguration, getPresetById } from './preset-configurations';
import { AIPlayerRecommendation, TeamGenerationRequest, AITeamAnalysis } from './ai-service-enhanced';
import Dream11TeamValidator, { DREAM11_RULES } from './dream11-validator';

export interface PresetTeamRequest {
  matchId: number;
  presetId: string;
  teamCount: number;
  teamNames: {
    teamA: string;
    teamB: string;
  };
  matchConditions?: {
    pitch?: string;
    weather?: string;
    venue?: string;
  };
}

export interface PresetPlayerFilter {
  player: Player;
  score: number;
  reason: string;
  matchesConstraints: boolean;
}

export class PresetStrategyService {
  
  /**
   * Generate teams based on preset configuration
   */
  async generatePresetTeams(request: PresetTeamRequest): Promise<AITeamAnalysis[]> {
    const preset = getPresetById(request.presetId);
    if (!preset) {
      throw new Error(`Preset configuration not found: ${request.presetId}`);
    }

    console.log(`🎯 Generating ${request.teamCount} teams with preset: ${preset.name}`);

    // Fetch players for the match
    const players = await this.fetchMatchPlayers(request.matchId);
    if (players.length === 0) {
      throw new Error(`No players found for match ${request.matchId}`);
    }

    // Apply preset constraints to filter and score players
    const filteredPlayers = await this.applyPresetConstraints(players, preset, request);
    
    // Generate teams with diversity constraints
    const teams: AITeamAnalysis[] = [];
    const generatedTeams: Player[][] = []; // Track all generated teams for diversity check
    
    for (let i = 0; i < request.teamCount; i++) {
      const team = await this.generateDiversePresetTeam(
        filteredPlayers, 
        preset, 
        request, 
        i, 
        generatedTeams
      );
      teams.push(team);
      generatedTeams.push(team.players);
    }

    return teams;
  }

  /**
   * Fetch players for a specific match
   */
  private async fetchMatchPlayers(matchId: number): Promise<Player[]> {
    try {
      const players = await neonDB.getPlayingPlayersForMatch(matchId);
      return players.filter((p: Player) => p.is_playing_today === true);
    } catch (error) {
      console.error('Error fetching match players:', error);
      return [];
    }
  }

  /**
   * Apply preset constraints to filter and score players
   */
  private async applyPresetConstraints(
    players: Player[],
    preset: PresetConfiguration,
    request: PresetTeamRequest
  ): Promise<PresetPlayerFilter[]> {
    const constraints = preset.constraints;
    const filteredPlayers: PresetPlayerFilter[] = [];

    for (const player of players) {
      const filter = this.evaluatePlayerAgainstConstraints(player, constraints, request, preset);
      if (filter.matchesConstraints) {
        filteredPlayers.push(filter);
      }
    }

    // Sort by score (higher is better)
    return filteredPlayers.sort((a, b) => b.score - a.score);
  }

  /**
   * Evaluate a single player against preset constraints
   */
  private evaluatePlayerAgainstConstraints(
    player: Player,
    constraints: PresetConfiguration['constraints'],
    request: PresetTeamRequest,
    preset?: PresetConfiguration
  ): PresetPlayerFilter {
    let score = 0;
    let reasons: string[] = [];
    let matchesConstraints = true;

    const playerRole = Dream11TeamValidator.normalizeRole(player.player_role || '');
    const playerTeam = player.team_name || '';
    const selectionPercentage = player.selection_percentage || 0;
    const credits = player.credits || 8;
    const points = player.points || 0;

    // 1. Selection threshold constraints
    if (constraints.selectionThresholds) {
      const thresholds = constraints.selectionThresholds;
      
      if (thresholds.minSelectionPercentage && selectionPercentage < thresholds.minSelectionPercentage) {
        matchesConstraints = false;
        reasons.push(`Selection % too low (${selectionPercentage}%)`);
      }
      
      if (thresholds.maxSelectionPercentage && selectionPercentage > thresholds.maxSelectionPercentage) {
        matchesConstraints = false;
        reasons.push(`Selection % too high (${selectionPercentage}%)`);
      }
      
      if (thresholds.targetDifferentials && selectionPercentage > 20) {
        score -= 20; // Penalty for non-differential picks
        reasons.push('Not a differential pick');
      }
      
      if (thresholds.avoidPopular && selectionPercentage > 50) {
        score -= 30; // Penalty for popular picks
        reasons.push('Popular pick (avoided)');
      }
    }

    // 2. Team preference constraints
    if (constraints.teamPreferences) {
      const prefs = constraints.teamPreferences;
      
      if (prefs.prioritizeTeamA && playerTeam === request.teamNames.teamA) {
        score += 25;
        reasons.push('Team A priority');
      }
      
      if (prefs.prioritizeTeamB && playerTeam === request.teamNames.teamB) {
        score += 25;
        reasons.push('Team B priority');
      }
      
      if (prefs.avoidTeamA && playerTeam === request.teamNames.teamA) {
        score -= 25;
        reasons.push('Team A avoided');
      }
      
      if (prefs.avoidTeamB && playerTeam === request.teamNames.teamB) {
        score -= 25;
        reasons.push('Team B avoided');
      }
      
      // Apply team weights
      if (prefs.teamAWeight && playerTeam === request.teamNames.teamA) {
        score += prefs.teamAWeight * 30;
      }
      
      if (prefs.teamBWeight && playerTeam === request.teamNames.teamB) {
        score += prefs.teamBWeight * 30;
      }
    }

    // 3. Player type constraints
    if (constraints.playerTypes) {
      const types = constraints.playerTypes;
      
      if (types.prioritizeBatsmen && playerRole === 'batsmen') {
        score += 20;
        reasons.push('Batsman priority');
      }
      
      if (types.prioritizeBowlers && playerRole === 'bowlers') {
        score += 20;
        reasons.push('Bowler priority');
      }
      
      if (types.prioritizeAllRounders && playerRole === 'allRounders') {
        score += 20;
        reasons.push('All-rounder priority');
      }
      
      if (types.prioritizeInForm && points > 50) {
        score += 15;
        reasons.push('In-form player');
      }
      
      if (types.prioritizeMatchWinners && credits >= 9) {
        score += 10;
        reasons.push('Match winner potential');
      }
    }

    // 4. Enhanced preset-specific scoring
    if (preset) {
      score += this.applyPresetSpecificScoring(preset, player, playerRole, playerTeam, reasons);
    }

    // 4. Budget constraints
    if (constraints.budgetConstraints) {
      const budget = constraints.budgetConstraints;
      
      if (budget.minCreditsPerPlayer && credits < budget.minCreditsPerPlayer) {
        matchesConstraints = false;
        reasons.push(`Credits too low (${credits})`);
      }
      
      if (budget.maxCreditsPerPlayer && credits > budget.maxCreditsPerPlayer) {
        matchesConstraints = false;
        reasons.push(`Credits too high (${credits})`);
      }
    }

    // 5. Match context constraints
    if (constraints.matchContext) {
      const context = constraints.matchContext;
      
      if (context.highScoring && playerRole === 'batsmen') {
        score += 15;
        reasons.push('High-scoring context');
      }
      
      if (context.lowScoring && playerRole === 'bowlers') {
        score += 15;
        reasons.push('Low-scoring context');
      }
      
      if (context.battingFriendly && (playerRole === 'batsmen' || playerRole === 'allRounders')) {
        score += 10;
        reasons.push('Batting-friendly conditions');
      }
      
      if (context.bowlingFriendly && (playerRole === 'bowlers' || playerRole === 'allRounders')) {
        score += 10;
        reasons.push('Bowling-friendly conditions');
      }
    }

    // Base score from player attributes
    score += points * 0.5; // Recent performance
    score += (100 - credits) * 0.3; // Budget efficiency
    score += (100 - selectionPercentage) * 0.2; // Differential value

    return {
      player,
      score,
      reason: reasons.join(', ') || 'Meets preset criteria',
      matchesConstraints
    };
  }

  /**
   * Generate a single team based on preset constraints
   */
  private async generateSinglePresetTeam(
    filteredPlayers: PresetPlayerFilter[],
    preset: PresetConfiguration,
    request: PresetTeamRequest,
    teamIndex: number
  ): Promise<AITeamAnalysis> {
    const targetRoles = preset.constraints.roleDistribution || {
      batsmen: 4,
      bowlers: 3,
      allRounders: 2,
      wicketKeepers: 1
    };

    const selectedPlayers: Player[] = [];
    let totalCredits = 0;
    const maxCredits = DREAM11_RULES.maxCredits;
    const teamCounts: Record<string, number> = {};

    // Group players by role
    const playersByRole = this.groupPlayersByRole(filteredPlayers);

    // Select players for each role
    for (const [role, count] of Object.entries(targetRoles)) {
      const rolePlayers = playersByRole[role as keyof typeof playersByRole] || [];
      let selected = 0;

      // Add some variation for different teams
      const startIndex = teamIndex % Math.max(1, Math.floor(rolePlayers.length / 3));
      const rotatedPlayers = [...rolePlayers.slice(startIndex), ...rolePlayers.slice(0, startIndex)];

      for (const filter of rotatedPlayers) {
        if (selected >= count) break;
        
        const player = filter.player;
        const playerCredits = player.credits || 8;
        const playerTeam = player.team_name || 'Unknown';
        
        // Check Dream11 constraints
        if (totalCredits + playerCredits <= maxCredits &&
            (teamCounts[playerTeam] || 0) < DREAM11_RULES.maxPlayersFromOneTeam &&
            !selectedPlayers.some(p => p.id === player.id)) {
          
          selectedPlayers.push(player);
          totalCredits += playerCredits;
          teamCounts[playerTeam] = (teamCounts[playerTeam] || 0) + 1;
          selected++;
        }
      }
    }

    // Fill remaining slots if under 11 players
    for (const filter of filteredPlayers) {
      if (selectedPlayers.length >= DREAM11_RULES.totalPlayers) break;
      
      const player = filter.player;
      if (selectedPlayers.some(p => p.id === player.id)) continue;
      
      const playerCredits = player.credits || 8;
      const playerTeam = player.team_name || 'Unknown';
      
      if (totalCredits + playerCredits <= maxCredits &&
          (teamCounts[playerTeam] || 0) < DREAM11_RULES.maxPlayersFromOneTeam) {
        selectedPlayers.push(player);
        totalCredits += playerCredits;
        teamCounts[playerTeam] = (teamCounts[playerTeam] || 0) + 1;
      }
    }

    // Calculate role balance
    const roleBalance = {
      batsmen: selectedPlayers.filter(p => Dream11TeamValidator.normalizeRole(p.player_role || '') === 'batsmen').length,
      bowlers: selectedPlayers.filter(p => Dream11TeamValidator.normalizeRole(p.player_role || '') === 'bowlers').length,
      allRounders: selectedPlayers.filter(p => Dream11TeamValidator.normalizeRole(p.player_role || '') === 'allRounders').length,
      wicketKeepers: selectedPlayers.filter(p => Dream11TeamValidator.normalizeRole(p.player_role || '') === 'wicketKeepers').length
    };

    // Select captain and vice-captain
    const captaincy = this.selectCaptainAndViceCaptain(selectedPlayers, preset, request, teamIndex);

    // Calculate expected points and confidence
    const expectedPoints = selectedPlayers.reduce((sum, p) => sum + (p.points || 0), 0);
    const confidence = this.calculateTeamConfidence(selectedPlayers, preset);
    const riskScore = this.calculateRiskScore(selectedPlayers, preset);

    return {
      players: selectedPlayers,
      captain: captaincy.captain,
      viceCaptain: captaincy.viceCaptain,
      totalCredits,
      roleBalance,
      riskScore,
      expectedPoints,
      confidence,
      reasoning: `Generated using ${preset.name} preset strategy: ${preset.strategy}`,
      insights: [
        `Role distribution: ${roleBalance.batsmen}B-${roleBalance.bowlers}BOW-${roleBalance.allRounders}AR-${roleBalance.wicketKeepers}WK`,
        `Total credits: ${totalCredits}/${maxCredits}`,
        `Risk level: ${preset.riskLevel}`,
        `Expected points: ${expectedPoints.toFixed(1)}`
      ]
    };
  }

  /**
   * Group players by role for team selection
   */
  private groupPlayersByRole(filteredPlayers: PresetPlayerFilter[]): Record<string, PresetPlayerFilter[]> {
    const groups: Record<string, PresetPlayerFilter[]> = {
      batsmen: [],
      bowlers: [],
      allRounders: [],
      wicketKeepers: []
    };

    for (const filter of filteredPlayers) {
      const role = Dream11TeamValidator.normalizeRole(filter.player.player_role || '');
      if (groups[role]) {
        groups[role].push(filter);
      }
    }

    return groups;
  }

  /**
   * Select captain and vice-captain based on preset strategy
   */
  private selectCaptainAndViceCaptain(
    players: Player[],
    preset: PresetConfiguration,
    request: PresetTeamRequest,
    teamIndex: number
  ): { captain: Player; viceCaptain: Player } {
    // Sort players by captaincy potential
    const captainCandidates = players
      .map(p => ({
        player: p,
        score: this.calculateCaptaincyScore(p, preset, request)
      }))
      .sort((a, b) => b.score - a.score);

    // Rotate captain selection across teams
    const captainIndex = teamIndex % captainCandidates.length;
    const viceCaptainIndex = (teamIndex + 1) % captainCandidates.length;

    const captain = captainCandidates[captainIndex].player;
    const viceCaptain = captainCandidates[viceCaptainIndex].player;

    return { captain, viceCaptain };
  }

  /**
   * Calculate captaincy score for a player
   */
  private calculateCaptaincyScore(
    player: Player,
    preset: PresetConfiguration,
    request: PresetTeamRequest
  ): number {
    let score = 0;
    
    // Base score from player attributes
    score += (player.points || 0) * 0.4;
    score += (player.credits || 8) * 5;
    
    // Role-based scoring
    const role = Dream11TeamValidator.normalizeRole(player.player_role || '');
    if (preset.constraints.playerTypes?.prioritizeBatsmen && role === 'batsmen') {
      score += 20;
    }
    if (preset.constraints.playerTypes?.prioritizeBowlers && role === 'bowlers') {
      score += 20;
    }
    if (preset.constraints.playerTypes?.prioritizeAllRounders && role === 'allRounders') {
      score += 25; // All-rounders get slight preference for captaincy
    }
    
    // Team preference scoring
    if (preset.constraints.teamPreferences?.prioritizeTeamA && player.team_name === request.teamNames.teamA) {
      score += 15;
    }
    if (preset.constraints.teamPreferences?.prioritizeTeamB && player.team_name === request.teamNames.teamB) {
      score += 15;
    }
    
    return score;
  }

  /**
   * Calculate team confidence based on preset strategy
   */
  private calculateTeamConfidence(players: Player[], preset: PresetConfiguration): number {
    const avgPoints = players.reduce((sum, p) => sum + (p.points || 0), 0) / players.length;
    const avgCredits = players.reduce((sum, p) => sum + (p.credits || 8), 0) / players.length;
    
    let confidence = 50; // Base confidence
    
    // Adjust based on preset risk level
    if (preset.riskLevel === 'low') {
      confidence += 20;
    } else if (preset.riskLevel === 'high') {
      confidence -= 10;
    }
    
    // Adjust based on team quality
    confidence += Math.min(30, avgPoints * 0.3);
    confidence += Math.min(20, avgCredits * 2);
    
    return Math.max(0, Math.min(100, confidence));
  }

  /**
   * Calculate risk score for the team
   */
  private calculateRiskScore(players: Player[], preset: PresetConfiguration): number {
    const avgSelection = players.reduce((sum, p) => sum + (p.selection_percentage || 0), 0) / players.length;
    
    let riskScore = 50; // Base risk
    
    // Adjust based on preset risk level
    if (preset.riskLevel === 'low') {
      riskScore = 30;
    } else if (preset.riskLevel === 'high') {
      riskScore = 75;
    }
    
    // Adjust based on selection percentages
    riskScore += Math.max(-20, Math.min(20, (20 - avgSelection) * 2));
    
    return Math.max(0, Math.min(100, riskScore));
  }

  /**
   * Generate a diverse team that has minimum 25% different players from existing teams
   */
  private async generateDiversePresetTeam(
    filteredPlayers: PresetPlayerFilter[],
    preset: PresetConfiguration,
    request: PresetTeamRequest,
    teamIndex: number,
    existingTeams: Player[][]
  ): Promise<AITeamAnalysis> {
    // Get enhanced role distribution based on preset focus
    const targetRoles = this.getEnhancedRoleDistribution(preset);

    const selectedPlayers: Player[] = [];
    let totalCredits = 0;
    const maxCredits = DREAM11_RULES.maxCredits;
    const teamCounts: Record<string, number> = {};
    const maxAttempts = 100; // Prevent infinite loops

    // Group players by role
    const playersByRole = this.groupPlayersByRole(filteredPlayers);

    // Calculate diversity requirements
    const minDifferentPlayers = Math.ceil(DREAM11_RULES.totalPlayers * 0.25); // 25% = 3 players minimum
    
    let attempt = 0;
    let validTeamFound = false;

    while (attempt < maxAttempts && !validTeamFound) {
      // Reset for new attempt
      selectedPlayers.length = 0;
      totalCredits = 0;
      Object.keys(teamCounts).forEach(key => teamCounts[key] = 0);

      // Select players for each role with diversity awareness
      for (const [role, count] of Object.entries(targetRoles)) {
        const roleCount = count as number;
        const rolePlayers = playersByRole[role as keyof typeof playersByRole] || [];
        let selected = 0;

        // Add variation based on team index and attempt
        const startIndex = (teamIndex + attempt) % Math.max(1, Math.floor(rolePlayers.length / 2));
        const rotatedPlayers = [...rolePlayers.slice(startIndex), ...rolePlayers.slice(0, startIndex)];

        // For diversity, prioritize players not commonly used in existing teams
        const scoredPlayers = rotatedPlayers.map(filter => ({
          filter,
          diversityScore: this.calculateDiversityScore(filter.player, existingTeams),
          originalScore: filter.score
        })).sort((a, b) => {
          // Balance original score with diversity score
          const aFinalScore = a.originalScore + (a.diversityScore * 50);
          const bFinalScore = b.originalScore + (b.diversityScore * 50);
          return bFinalScore - aFinalScore;
        });

        for (const { filter } of scoredPlayers) {
          if (selected >= roleCount) break;
          
          const player = filter.player;
          const playerCredits = player.credits || 8;
          const playerTeam = player.team_name || 'Unknown';
          
          // Check Dream11 constraints
          if (totalCredits + playerCredits <= maxCredits &&
              (teamCounts[playerTeam] || 0) < DREAM11_RULES.maxPlayersFromOneTeam &&
              !selectedPlayers.some(p => p.id === player.id)) {
            
            selectedPlayers.push(player);
            totalCredits += playerCredits;
            teamCounts[playerTeam] = (teamCounts[playerTeam] || 0) + 1;
            selected++;
          }
        }
      }

      // Fill remaining slots if under 11 players
      const remainingPlayers = filteredPlayers
        .filter(f => !selectedPlayers.some(p => p.id === f.player.id))
        .map(filter => ({
          filter,
          diversityScore: this.calculateDiversityScore(filter.player, existingTeams),
          originalScore: filter.score
        }))
        .sort((a, b) => {
          const aFinalScore = a.originalScore + (a.diversityScore * 50);
          const bFinalScore = b.originalScore + (b.diversityScore * 50);
          return bFinalScore - aFinalScore;
        });

      for (const { filter } of remainingPlayers) {
        if (selectedPlayers.length >= DREAM11_RULES.totalPlayers) break;
        
        const player = filter.player;
        const playerCredits = player.credits || 8;
        const playerTeam = player.team_name || 'Unknown';
        
        if (totalCredits + playerCredits <= maxCredits &&
            (teamCounts[playerTeam] || 0) < DREAM11_RULES.maxPlayersFromOneTeam) {
          selectedPlayers.push(player);
          totalCredits += playerCredits;
          teamCounts[playerTeam] = (teamCounts[playerTeam] || 0) + 1;
        }
      }

      // Check if we have enough players and meet diversity requirements
      if (selectedPlayers.length === DREAM11_RULES.totalPlayers) {
        if (existingTeams.length === 0) {
          // First team always valid
          validTeamFound = true;
        } else {
          // Check diversity against existing teams
          const diversityMet = this.checkTeamDiversity(selectedPlayers, existingTeams, minDifferentPlayers);
          if (diversityMet) {
            validTeamFound = true;
          }
        }
      }

      attempt++;
    }

    // If we couldn't find a diverse team, use the last generated team
    if (!validTeamFound && selectedPlayers.length < DREAM11_RULES.totalPlayers) {
      console.warn(`Could not generate diverse team ${teamIndex + 1}, using fallback`);
      return this.generateSinglePresetTeam(filteredPlayers, preset, request, teamIndex);
    }

    // Calculate role balance
    const roleBalance = {
      batsmen: selectedPlayers.filter(p => Dream11TeamValidator.normalizeRole(p.player_role || '') === 'batsmen').length,
      bowlers: selectedPlayers.filter(p => Dream11TeamValidator.normalizeRole(p.player_role || '') === 'bowlers').length,
      allRounders: selectedPlayers.filter(p => Dream11TeamValidator.normalizeRole(p.player_role || '') === 'allRounders').length,
      wicketKeepers: selectedPlayers.filter(p => Dream11TeamValidator.normalizeRole(p.player_role || '') === 'wicketKeepers').length
    };

    // Select captain and vice-captain
    const captaincy = this.selectCaptainAndViceCaptain(selectedPlayers, preset, request, teamIndex);

    // Calculate expected points and confidence
    const expectedPoints = selectedPlayers.reduce((sum, p) => sum + (p.points || 0), 0);
    const confidence = this.calculateTeamConfidence(selectedPlayers, preset);
    const riskScore = this.calculateRiskScore(selectedPlayers, preset);

    // Calculate diversity percentage for this team
    const diversityPercentage = existingTeams.length > 0 ? 
      this.calculateMinDiversityPercentage(selectedPlayers, existingTeams) : 100;

    return {
      players: selectedPlayers,
      captain: captaincy.captain,
      viceCaptain: captaincy.viceCaptain,
      totalCredits,
      roleBalance,
      riskScore,
      expectedPoints,
      confidence,
      reasoning: `Generated using ${preset.name} preset strategy with ${diversityPercentage.toFixed(1)}% diversity from other teams`,
      insights: [
        `Role distribution: ${roleBalance.batsmen}B-${roleBalance.bowlers}BOW-${roleBalance.allRounders}AR-${roleBalance.wicketKeepers}WK`,
        `Total credits: ${totalCredits}/${maxCredits}`,
        `Risk level: ${preset.riskLevel}`,
        `Expected points: ${expectedPoints.toFixed(1)}`,
        `Team diversity: ${diversityPercentage.toFixed(1)}% unique players`
      ]
    };
  }

  /**
   * Calculate diversity score for a player based on usage in existing teams
   */
  private calculateDiversityScore(player: Player, existingTeams: Player[][]): number {
    if (existingTeams.length === 0) return 0;
    
    const usageCount = existingTeams.reduce((count, team) => {
      return count + (team.some(p => p.id === player.id) ? 1 : 0);
    }, 0);
    
    const usagePercentage = usageCount / existingTeams.length;
    
    // Higher score for less used players (inverse relationship)
    return 1 - usagePercentage;
  }

  /**
   * Check if a team meets minimum diversity requirements
   */
  private checkTeamDiversity(
    newTeam: Player[], 
    existingTeams: Player[][], 
    minDifferentPlayers: number
  ): boolean {
    for (const existingTeam of existingTeams) {
      const commonPlayers = newTeam.filter(p => 
        existingTeam.some(ep => ep.id === p.id)
      ).length;
      
      const differentPlayers = DREAM11_RULES.totalPlayers - commonPlayers;
      
      if (differentPlayers < minDifferentPlayers) {
        return false;
      }
    }
    return true;
  }

  /**
   * Calculate minimum diversity percentage of a team compared to existing teams
   */
  private calculateMinDiversityPercentage(newTeam: Player[], existingTeams: Player[][]): number {
    if (existingTeams.length === 0) return 100;
    
    let minDiversityPercentage = 100;
    
    for (const existingTeam of existingTeams) {
      const commonPlayers = newTeam.filter(p => 
        existingTeam.some(ep => ep.id === p.id)
      ).length;
      
      const differentPlayers = DREAM11_RULES.totalPlayers - commonPlayers;
      const diversityPercentage = (differentPlayers / DREAM11_RULES.totalPlayers) * 100;
      
      minDiversityPercentage = Math.min(minDiversityPercentage, diversityPercentage);
    }
    
    return minDiversityPercentage;
  }

  /**
   * Apply preset-specific scoring based on preset name and focus
   */
  private applyPresetSpecificScoring(
    preset: PresetConfiguration,
    player: Player,
    playerRole: string,
    playerTeam: string,
    reasons: string[]
  ): number {
    let additionalScore = 0;
    const presetName = preset.name.toLowerCase();
    
    // Bowling-focused presets
    if (presetName.includes('bowling') || presetName.includes('bowler')) {
      if (playerRole === 'bowlers') {
        additionalScore += 35;
        reasons.push('Bowling-focused preset: Bowler priority');
      } else if (playerRole === 'allRounders') {
        additionalScore += 15;
        reasons.push('Bowling-focused preset: All-rounder bonus');
      }
    }
    
    // Batting-focused presets
    if (presetName.includes('batting') || presetName.includes('batsmen') || presetName.includes('run')) {
      if (playerRole === 'batsmen') {
        additionalScore += 35;
        reasons.push('Batting-focused preset: Batsman priority');
      } else if (playerRole === 'allRounders') {
        additionalScore += 15;
        reasons.push('Batting-focused preset: All-rounder bonus');
      }
    }
    
    // Team A powerful presets - check for Team A priority
    if ((presetName.includes('team a') || presetName.includes('powerful') || presetName.includes('home')) &&
        preset.constraints.teamPreferences?.prioritizeTeamA) {
      additionalScore += 40;
      reasons.push('Team A focused preset: Team A player priority');
    }
    
    // Team B focused presets - check for Team B priority
    if ((presetName.includes('team b') || presetName.includes('away')) &&
        preset.constraints.teamPreferences?.prioritizeTeamB) {
      additionalScore += 40;
      reasons.push('Team B focused preset: Team B player priority');
    }
    
    // Spin-friendly conditions
    if (presetName.includes('spin') || presetName.includes('turning')) {
      if (player.player_role?.toLowerCase().includes('spin')) {
        additionalScore += 30;
        reasons.push('Spin-friendly preset: Spinner priority');
      }
    }
    
    // Pace-friendly conditions
    if (presetName.includes('pace') || presetName.includes('fast') || presetName.includes('seam')) {
      if (player.player_role?.toLowerCase().includes('fast') || 
          player.player_role?.toLowerCase().includes('medium') ||
          player.player_role?.toLowerCase().includes('pace')) {
        additionalScore += 30;
        reasons.push('Pace-friendly preset: Fast bowler priority');
      }
    }
    
    // High-scoring match presets
    if (presetName.includes('high') || presetName.includes('run') || presetName.includes('flat')) {
      if (playerRole === 'batsmen') {
        additionalScore += 25;
        reasons.push('High-scoring preset: Batsman boost');
      }
    }
    
    // Low-scoring/defensive presets
    if (presetName.includes('low') || presetName.includes('defend') || presetName.includes('tight')) {
      if (playerRole === 'bowlers') {
        additionalScore += 25;
        reasons.push('Low-scoring preset: Bowler boost');
      }
    }
    
    return additionalScore;
  }

  /**
   * Get enhanced role distribution based on preset focus
   */
  private getEnhancedRoleDistribution(preset: PresetConfiguration): Record<string, number> {
    const defaultRoles = {
      batsmen: 4,
      bowlers: 3,
      allRounders: 2,
      wicketKeepers: 1
    };

    // Use preset's role distribution if specified
    if (preset.constraints.roleDistribution) {
      return preset.constraints.roleDistribution;
    }

    const presetName = preset.name.toLowerCase();
    const enhancedRoles = { ...defaultRoles };

    // Bowling-focused presets - maximize bowlers
    if (presetName.includes('bowling') || presetName.includes('bowler') || 
        presetName.includes('pace') || presetName.includes('spin')) {
      enhancedRoles.bowlers = 5; // Increase bowlers to 5
      enhancedRoles.batsmen = 3; // Reduce batsmen to 3
      enhancedRoles.allRounders = 2; // Keep all-rounders
      enhancedRoles.wicketKeepers = 1; // Keep wicket-keeper
    }

    // Batting-focused presets - maximize batsmen
    if (presetName.includes('batting') || presetName.includes('batsmen') || 
        presetName.includes('run') || presetName.includes('high')) {
      enhancedRoles.batsmen = 5; // Increase batsmen to 5
      enhancedRoles.bowlers = 2; // Reduce bowlers to 2
      enhancedRoles.allRounders = 3; // Increase all-rounders to 3
      enhancedRoles.wicketKeepers = 1; // Keep wicket-keeper
    }

    // All-rounder focused presets
    if (presetName.includes('balance') || presetName.includes('all-round') || 
        presetName.includes('versatile')) {
      enhancedRoles.batsmen = 3; // Reduce batsmen
      enhancedRoles.bowlers = 3; // Keep bowlers
      enhancedRoles.allRounders = 4; // Increase all-rounders to 4
      enhancedRoles.wicketKeepers = 1; // Keep wicket-keeper
    }

    // Wicket-keeper focused presets
    if (presetName.includes('keeper') || presetName.includes('wicket')) {
      enhancedRoles.batsmen = 4; // Keep batsmen
      enhancedRoles.bowlers = 3; // Keep bowlers
      enhancedRoles.allRounders = 1; // Reduce all-rounders
      enhancedRoles.wicketKeepers = 2; // Allow 2 wicket-keepers if available
    }

    return enhancedRoles;
  }
}

// Export singleton instance
export const presetStrategyService = new PresetStrategyService();
