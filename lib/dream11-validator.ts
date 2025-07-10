// Dream11 Team Composition Rules and Validation
export interface Dream11Rules {
  totalPlayers: 11;
  maxCredits: 100;
  maxPlayersFromOneTeam: 7;
  roles: {
    WK: { min: 1; max: 8 };
    BAT: { min: 1; max: 8 };
    AR: { min: 1; max: 8 };
    BWL: { min: 1; max: 8 };
  };
}

export const DREAM11_RULES: Dream11Rules = {
  totalPlayers: 11,
  maxCredits: 100,
  maxPlayersFromOneTeam: 7,
  roles: {
    WK: { min: 1, max: 8 },
    BAT: { min: 1, max: 8 },
    AR: { min: 1, max: 8 },
    BWL: { min: 1, max: 8 }
  }
};

export interface TeamComposition {
  WK: number;
  BAT: number;
  AR: number;
  BWL: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class Dream11TeamValidator {
  static validateTeamComposition(players: any[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (players.length !== DREAM11_RULES.totalPlayers) {
      errors.push(`Team must have exactly ${DREAM11_RULES.totalPlayers} players (currently has ${players.length})`);
    }

    // Count players by role
    const composition = this.getTeamComposition(players);
    
    // Validate role requirements
    Object.entries(DREAM11_RULES.roles).forEach(([role, rules]) => {
      const count = composition[role as keyof TeamComposition];
      if (count < rules.min) {
        errors.push(`Must have at least ${rules.min} ${this.getRoleDisplayName(role)} (currently has ${count})`);
      }
      if (count > rules.max) {
        errors.push(`Cannot have more than ${rules.max} ${this.getRoleDisplayName(role)} (currently has ${count})`);
      }
    });

    // Validate total credits
    const totalCredits = players.reduce((sum, p) => sum + (p.credits || 8), 0);
    if (totalCredits > DREAM11_RULES.maxCredits) {
      errors.push(`Total credits (${totalCredits}) cannot exceed ${DREAM11_RULES.maxCredits}`);
    } else if (totalCredits > 95) {
      warnings.push(`High credit usage (${totalCredits}/${DREAM11_RULES.maxCredits}) - consider budget players`);
    }

    // Validate max players from one team
    const teamCounts = this.getTeamCounts(players);
    const maxFromOneTeam = Math.max(...Object.values(teamCounts));
    if (maxFromOneTeam > DREAM11_RULES.maxPlayersFromOneTeam) {
      const teamName = Object.keys(teamCounts).find(team => teamCounts[team] === maxFromOneTeam);
      errors.push(`Cannot select more than ${DREAM11_RULES.maxPlayersFromOneTeam} players from one team (${teamName}: ${maxFromOneTeam})`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static getTeamComposition(players: any[]): TeamComposition {
    const composition: TeamComposition = { WK: 0, BAT: 0, AR: 0, BWL: 0 };
    
    players.forEach(player => {
      const role = this.normalizeRole(player.role || player.player_role);
      if (role && composition.hasOwnProperty(role)) {
        composition[role as keyof TeamComposition]++;
      }
    });

    return composition;
  }

  static getTeamCounts(players: any[]): Record<string, number> {
    const teamCounts: Record<string, number> = {};
    
    players.forEach(player => {
      const team = player.team || player.team_name || 'Unknown';
      teamCounts[team] = (teamCounts[team] || 0) + 1;
    });

    return teamCounts;
  }

  static normalizeRole(role: string): string {
    if (!role) return 'BAT';
    
    const roleUpper = role.toUpperCase();
    if (roleUpper.includes('WK') || roleUpper.includes('WICKET')) return 'WK';
    if (roleUpper.includes('BAT') || roleUpper.includes('BATS')) return 'BAT';
    if (roleUpper.includes('AR') || roleUpper.includes('ALL')) return 'AR';
    if (roleUpper.includes('BWL') || roleUpper.includes('BOWL') || roleUpper.includes('SPIN') || roleUpper.includes('PACE')) return 'BWL';
    
    return 'BAT'; // Default fallback
  }

  static getRoleDisplayName(role: string): string {
    switch (role) {
      case 'WK': return 'Wicket-Keeper(s)';
      case 'BAT': return 'Batsman/Batsmen';
      case 'AR': return 'All-Rounder(s)';
      case 'BWL': return 'Bowler(s)';
      default: return role;
    }
  }

  static generateValidTeamCompositions(): TeamComposition[] {
    // Generate common valid team compositions that follow Dream11 rules
    return [
      { WK: 1, BAT: 4, AR: 2, BWL: 4 }, // Balanced (most common)
      { WK: 1, BAT: 3, AR: 3, BWL: 4 }, // All-rounder heavy
      { WK: 1, BAT: 5, AR: 1, BWL: 4 }, // Batting heavy
      { WK: 1, BAT: 3, AR: 2, BWL: 5 }, // Bowling heavy
      { WK: 2, BAT: 4, AR: 1, BWL: 4 }, // Dual keeper
      { WK: 1, BAT: 4, AR: 1, BWL: 5 }, // Bowling attack
      { WK: 1, BAT: 2, AR: 4, BWL: 4 }, // All-rounder dominant
      { WK: 2, BAT: 3, AR: 2, BWL: 4 }, // Flexible keeper setup
    ];
  }

  static isValidComposition(composition: TeamComposition): boolean {
    const total = composition.WK + composition.BAT + composition.AR + composition.BWL;
    if (total !== DREAM11_RULES.totalPlayers) return false;

    // Check individual role constraints
    return Object.entries(DREAM11_RULES.roles).every(([role, rules]) => {
      const count = composition[role as keyof TeamComposition];
      return count >= rules.min && count <= rules.max;
    });
  }

  static suggestCompositionFix(composition: TeamComposition): string[] {
    const suggestions: string[] = [];
    const total = composition.WK + composition.BAT + composition.AR + composition.BWL;
    
    if (total < DREAM11_RULES.totalPlayers) {
      suggestions.push(`Add ${DREAM11_RULES.totalPlayers - total} more players`);
    } else if (total > DREAM11_RULES.totalPlayers) {
      suggestions.push(`Remove ${total - DREAM11_RULES.totalPlayers} players`);
    }

    Object.entries(DREAM11_RULES.roles).forEach(([role, rules]) => {
      const count = composition[role as keyof TeamComposition];
      if (count < rules.min) {
        suggestions.push(`Add ${rules.min - count} more ${this.getRoleDisplayName(role)}`);
      } else if (count > rules.max) {
        suggestions.push(`Remove ${count - rules.max} ${this.getRoleDisplayName(role)}`);
      }
    });

    return suggestions;
  }

  static getRandomValidComposition(): TeamComposition {
    const validCompositions = this.generateValidTeamCompositions();
    return validCompositions[Math.floor(Math.random() * validCompositions.length)];
  }
}

export default Dream11TeamValidator;
