// Preset Configurations for Strategy 6: Preset Scenarios / Configurations
// This file contains all predefined team creation scenarios with their constraints

export interface PresetConfiguration {
  id: string;
  name: string;
  description: string;
  strategy: string;
  focus: Record<string, any>;
  riskLevel: 'low' | 'medium' | 'high';
  tags: string[];
  constraints: {
    roleDistribution?: {
      batsmen: number;
      bowlers: number;
      allRounders: number;
      wicketKeepers: number;
    };
    teamPreferences?: {
      prioritizeTeamA?: boolean;
      prioritizeTeamB?: boolean;
      avoidTeamA?: boolean;
      avoidTeamB?: boolean;
      teamAWeight?: number; // 0-1 scale
      teamBWeight?: number; // 0-1 scale
    };
    selectionThresholds?: {
      minSelectionPercentage?: number;
      maxSelectionPercentage?: number;
      targetDifferentials?: boolean; // Focus on < 20% selection
      avoidPopular?: boolean; // Avoid > 50% selection
    };
    playerTypes?: {
      prioritizeBatsmen?: boolean;
      prioritizeBowlers?: boolean;
      prioritizeAllRounders?: boolean;
      prioritizeInForm?: boolean;
      prioritizeMatchWinners?: boolean;
    };
    budgetConstraints?: {
      minCreditsPerPlayer?: number;
      maxCreditsPerPlayer?: number;
      totalBudgetUtilization?: number; // 0-1 scale
    };
    matchContext?: {
      highScoring?: boolean;
      lowScoring?: boolean;
      battingFriendly?: boolean;
      bowlingFriendly?: boolean;
    };
  };
}

export const PRESET_CONFIGURATIONS: PresetConfiguration[] = [
  {
    id: 'team-a-high-total',
    name: 'Team A High Total, Team B Collapse',
    description: 'Prioritize Team A batsmen expecting high total, select Team B bowlers',
    strategy: 'Stack Team A key players while expecting Team B to collapse',
    focus: { teamA: 'batsmen', teamB: 'bowlers' },
    riskLevel: 'medium',
    tags: ['batting-pitch', 'one-sided', 'team-stack'],
    constraints: {
      roleDistribution: {
        batsmen: 5,
        bowlers: 3,
        allRounders: 2,
        wicketKeepers: 1
      },
      teamPreferences: {
        prioritizeTeamA: true,
        teamAWeight: 0.7,
        teamBWeight: 0.3
      },
      selectionThresholds: {
        minSelectionPercentage: 10,
        maxSelectionPercentage: 80
      },
      playerTypes: {
        prioritizeBatsmen: true,
        prioritizeInForm: true
      },
      matchContext: {
        highScoring: true,
        battingFriendly: true
      }
    }
  },
  {
    id: 'team-b-high-total',
    name: 'Team B High Total, Team A Collapse',
    description: 'Prioritize Team B batsmen expecting high total, select Team A bowlers',
    strategy: 'Stack Team B key players while expecting Team A to collapse',
    focus: { teamA: 'bowlers', teamB: 'batsmen' },
    riskLevel: 'medium',
    tags: ['batting-pitch', 'one-sided', 'team-stack'],
    constraints: {
      roleDistribution: {
        batsmen: 5,
        bowlers: 3,
        allRounders: 2,
        wicketKeepers: 1
      },
      teamPreferences: {
        prioritizeTeamB: true,
        teamAWeight: 0.3,
        teamBWeight: 0.7
      },
      selectionThresholds: {
        minSelectionPercentage: 10,
        maxSelectionPercentage: 80
      },
      playerTypes: {
        prioritizeBatsmen: true,
        prioritizeInForm: true
      },
      matchContext: {
        highScoring: true,
        battingFriendly: true
      }
    }
  },
  {
    id: 'high-differentials',
    name: 'High Differentials Strategy',
    description: 'Focus on low-ownership, high-upside players for Grand Leagues',
    strategy: 'Pick players with <20% ownership but high ceiling potential',
    focus: { ownership: 'low', upside: 'high' },
    riskLevel: 'high',
    tags: ['differential', 'contrarian', 'high-risk', 'grand-league'],
    constraints: {
      roleDistribution: {
        batsmen: 4,
        bowlers: 3,
        allRounders: 3,
        wicketKeepers: 1
      },
      selectionThresholds: {
        maxSelectionPercentage: 20,
        targetDifferentials: true
      },
      playerTypes: {
        prioritizeMatchWinners: true,
        prioritizeInForm: true
      },
      budgetConstraints: {
        minCreditsPerPlayer: 7,
        totalBudgetUtilization: 0.95
      }
    }
  },
  {
    id: 'balanced-roles',
    name: 'Balanced Roles (4 BAT, 3 BOWL, 2 AR, 1 WK)',
    description: 'Traditional balanced team composition with equal weight to all departments',
    strategy: 'Equal weight to all departments with proven template',
    focus: { batsmen: 4, bowlers: 3, allRounders: 2, wicketKeepers: 1 },
    riskLevel: 'low',
    tags: ['balanced', 'traditional', 'safe', 'head-to-head'],
    constraints: {
      roleDistribution: {
        batsmen: 4,
        bowlers: 3,
        allRounders: 2,
        wicketKeepers: 1
      },
      selectionThresholds: {
        minSelectionPercentage: 20,
        maxSelectionPercentage: 70
      },
      teamPreferences: {
        teamAWeight: 0.5,
        teamBWeight: 0.5
      },
      budgetConstraints: {
        totalBudgetUtilization: 0.85
      }
    }
  },
  {
    id: 'safe-picks-small-leagues',
    name: 'Safe Picks for Small Leagues',
    description: 'Popular players with high selection % who are expected to perform reliably',
    strategy: 'Minimize risk by selecting highly selected, consistent performers',
    focus: { safety: 'high', consistency: 'high' },
    riskLevel: 'low',
    tags: ['safe', 'popular', 'small-league', 'head-to-head'],
    constraints: {
      roleDistribution: {
        batsmen: 4,
        bowlers: 3,
        allRounders: 2,
        wicketKeepers: 1
      },
      selectionThresholds: {
        minSelectionPercentage: 40,
        avoidPopular: false
      },
      playerTypes: {
        prioritizeInForm: true
      },
      budgetConstraints: {
        minCreditsPerPlayer: 8,
        totalBudgetUtilization: 0.90
      }
    }
  },
  {
    id: 'risky-picks-grand-leagues',
    name: 'Risky Picks for Grand Leagues',
    description: 'High-risk, high-reward players for differentiation in large leagues',
    strategy: 'Pick low-selected players with potential for explosive performances',
    focus: { risk: 'high', reward: 'high', differentiation: 'high' },
    riskLevel: 'high',
    tags: ['risky', 'grand-league', 'differential', 'explosive'],
    constraints: {
      roleDistribution: {
        batsmen: 3,
        bowlers: 4,
        allRounders: 3,
        wicketKeepers: 1
      },
      selectionThresholds: {
        maxSelectionPercentage: 30,
        targetDifferentials: true
      },
      playerTypes: {
        prioritizeMatchWinners: true
      },
      budgetConstraints: {
        totalBudgetUtilization: 0.95
      }
    }
  },
  {
    id: 'batting-show-high-scoring',
    name: 'Batting Show: High Scoring Match',
    description: 'Prioritize batsmen and all-rounders for high-scoring matches',
    strategy: 'Focus on batsmen when expecting 350+ total scores',
    focus: { batsmen: 'high', allRounders: 'high' },
    riskLevel: 'medium',
    tags: ['batting', 'high-scoring', 'flat-pitch', 'runs'],
    constraints: {
      roleDistribution: {
        batsmen: 6,
        bowlers: 2,
        allRounders: 2,
        wicketKeepers: 1
      },
      playerTypes: {
        prioritizeBatsmen: true,
        prioritizeAllRounders: true
      },
      selectionThresholds: {
        minSelectionPercentage: 15,
        maxSelectionPercentage: 75
      },
      matchContext: {
        highScoring: true,
        battingFriendly: true
      }
    }
  },
  {
    id: 'bowlers-paradise-low-scoring',
    name: 'Bowlers Paradise: Low Scoring Match',
    description: 'Focus on bowlers and all-rounders for low-scoring, wicket-taking matches',
    strategy: 'Stack bowlers when expecting < 280 total scores',
    focus: { bowlers: 'high', wickets: 'high' },
    riskLevel: 'medium',
    tags: ['bowling', 'low-scoring', 'green-pitch', 'wickets'],
    constraints: {
      roleDistribution: {
        batsmen: 3,
        bowlers: 5,
        allRounders: 2,
        wicketKeepers: 1
      },
      playerTypes: {
        prioritizeBowlers: true,
        prioritizeAllRounders: true
      },
      selectionThresholds: {
        minSelectionPercentage: 10,
        maxSelectionPercentage: 70
      },
      matchContext: {
        lowScoring: true,
        bowlingFriendly: true
      }
    }
  },
  {
    id: 'differential-gems',
    name: 'Differential Gems',
    description: 'Ultra-differential picks for Grand Leagues with huge upside potential',
    strategy: 'Target players with < 10% selection but massive point potential',
    focus: { differentials: 'ultra', upside: 'massive' },
    riskLevel: 'high',
    tags: ['ultra-differential', 'grand-league', 'gems', 'explosive'],
    constraints: {
      roleDistribution: {
        batsmen: 4,
        bowlers: 3,
        allRounders: 3,
        wicketKeepers: 1
      },
      selectionThresholds: {
        maxSelectionPercentage: 10,
        targetDifferentials: true
      },
      playerTypes: {
        prioritizeMatchWinners: true
      },
      budgetConstraints: {
        totalBudgetUtilization: 0.98
      }
    }
  },
  {
    id: 'all-rounder-heavy',
    name: 'All-Rounder Heavy Lineup',
    description: 'Stack all-rounders for maximum versatility and captaincy options',
    strategy: 'Pick 4+ all-rounders for flexibility in captain selection',
    focus: { allRounders: 4, versatility: 'high' },
    riskLevel: 'medium',
    tags: ['all-rounders', 'versatile', 'captaincy', 'flexible'],
    constraints: {
      roleDistribution: {
        batsmen: 3,
        bowlers: 3,
        allRounders: 4,
        wicketKeepers: 1
      },
      playerTypes: {
        prioritizeAllRounders: true,
        prioritizeInForm: true
      },
      selectionThresholds: {
        minSelectionPercentage: 15,
        maxSelectionPercentage: 65
      }
    }
  },
  {
    id: 'team-tag-balance',
    name: 'Team Tag Balance',
    description: 'Mix of safe and risky picks using team tags for balanced approach',
    strategy: 'Alternate between safe choices and high-potential differentials',
    focus: { balance: 'high', tags: 'mixed' },
    riskLevel: 'medium',
    tags: ['balanced', 'mixed', 'team-tags', 'strategic'],
    constraints: {
      roleDistribution: {
        batsmen: 4,
        bowlers: 3,
        allRounders: 2,
        wicketKeepers: 1
      },
      selectionThresholds: {
        minSelectionPercentage: 5,
        maxSelectionPercentage: 80
      },
      playerTypes: {
        prioritizeInForm: true,
        prioritizeMatchWinners: true
      },
      budgetConstraints: {
        totalBudgetUtilization: 0.88
      }
    }
  }
];

// Helper function to get preset by ID
export function getPresetById(id: string): PresetConfiguration | undefined {
  return PRESET_CONFIGURATIONS.find(preset => preset.id === id);
}

// Helper function to get presets by risk level
export function getPresetsByRiskLevel(riskLevel: 'low' | 'medium' | 'high'): PresetConfiguration[] {
  return PRESET_CONFIGURATIONS.filter(preset => preset.riskLevel === riskLevel);
}

// Helper function to get presets by tag
export function getPresetsByTag(tag: string): PresetConfiguration[] {
  return PRESET_CONFIGURATIONS.filter(preset => preset.tags.includes(tag));
}

// Helper function to get all preset IDs
export function getAllPresetIds(): string[] {
  return PRESET_CONFIGURATIONS.map(preset => preset.id);
}
