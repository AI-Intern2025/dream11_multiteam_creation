// Strategy Components Index
// This file exports all strategy wizards for easy importing

export { default as Strategy1Wizard } from './Strategy1Wizard';
export { default as Strategy2Wizard } from './Strategy2Wizard';
export { default as Strategy3Wizard } from './Strategy3Wizard';
export { default as Strategy4Wizard } from './Strategy4Wizard';
export { default as Strategy5Wizard } from './Strategy5Wizard';
export { default as Strategy6Wizard } from './Strategy6Wizard';
export { default as Strategy7Wizard } from './Strategy7Wizard';
export { default as Strategy8Wizard } from './Strategy8Wizard';

// Strategy metadata for dynamic loading
export const STRATEGIES = {
  'ai-guided': {
    id: 'ai-guided',
    name: 'AI-Guided Assistant',
    description: 'Let AI analyze match data and guide your team creation with intelligent recommendations',
    component: 'Strategy1Wizard',
    aliases: ['strategy1', 'ai-assistant']
  },
  'same-xi': {
    id: 'same-xi',
    name: 'Same XI, Different Captains',
    description: 'Create multiple teams with the same 11 players but different captain combinations',
    component: 'Strategy2Wizard',
    aliases: ['strategy2', 'captain-rotation']
  },
  'differential': {
    id: 'differential',
    name: 'Score & Storyline Prediction',
    description: 'Generate teams based on predicted match scenarios and storylines',
    component: 'Strategy3Wizard',
    aliases: ['strategy3', 'score-prediction']
  },
  'core-hedge': {
    id: 'core-hedge',
    name: 'Core-Hedge Player Selection',
    description: 'Build teams with core reliable players and hedge with differential picks',
    component: 'Strategy4Wizard',
    aliases: ['strategy4', 'core-differential']
  },
  'stats-driven': {
    id: 'stats-driven',
    name: 'Stats-Driven Guardrails',
    description: 'Create teams using statistical analysis and performance guardrails',
    component: 'Strategy5Wizard',
    aliases: ['strategy5', 'analytics-based']
  },
  'preset-scenarios': {
    id: 'preset-scenarios',
    name: 'Preset Scenarios / Configurations',
    description: 'Choose from pre-configured team templates for different match scenarios',
    component: 'Strategy6Wizard',
    aliases: ['strategy6', 'templates']
  },
  'role-split': {
    id: 'role-split',
    name: 'Role-Split Lineups',
    description: 'Generate teams with different role distributions and batting orders',
    component: 'Strategy7Wizard',
    aliases: ['strategy7', 'lineup-optimization']
  },
  'base-edit': {
    id: 'base-edit',
    name: 'Base Team + Rule-Based Edits',
    description: 'Start with a base team and apply rule-based modifications',
    component: 'Strategy8Wizard',
    aliases: ['strategy8', 'iterative-editing']
  }
};

export type StrategyId = keyof typeof STRATEGIES;

// Helper function to get strategy component by ID or alias
export function getStrategyComponent(strategyKey: string): string | null {
  // Check direct match
  if (strategyKey in STRATEGIES) {
    return STRATEGIES[strategyKey as StrategyId].component;
  }
  
  // Check aliases
  for (const strategy of Object.values(STRATEGIES)) {
    if (strategy.aliases.includes(strategyKey)) {
      return strategy.component;
    }
  }
  
  return null;
}
