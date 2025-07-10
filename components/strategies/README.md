# Strategy Components

This directory contains modular strategy wizard components for Fantasy Cricket team creation. Each strategy provides a different approach to generating teams with unique UI flows and logic.

## Available Strategies

### Strategy 1: AI-Guided Assistant (`Strategy1Wizard.tsx`)
- **Purpose**: AI-powered team creation with intelligent recommendations
- **Features**: 
  - Preference selection via pill buttons
  - Custom preference input
  - AI chatbot integration for match analysis
  - Captain/Vice-Captain distribution settings
  - Real-time AI recommendations based on match data

### Strategy 2: Same XI, Different Captains (`Strategy2Wizard.tsx`)
- **Purpose**: Create multiple teams with the same 11 players but different captaincy combinations
- **Features**:
  - Two-column player selection UI (team vs team)
  - Credit budget system (100 credits max)
  - Dream11-style player picker
  - Multiple captain/vice-captain combinations
  - Team distribution percentage settings

### Strategy 3: Differential Team Generator (`Strategy3Wizard.tsx`)
- **Purpose**: Generate diverse team combinations with varying risk-reward profiles
- **Features**:
  - Risk level selection (Conservative/Medium/Aggressive)
  - Batting and bowling strategy preferences
  - Budget configuration
  - Strategy diversity optimization

## Architecture

### Component Structure
```
components/strategies/
├── index.ts                 # Main exports and strategy metadata
├── Strategy1Wizard.tsx      # AI-Guided Assistant
├── Strategy2Wizard.tsx      # Same XI, Different Captains
├── Strategy3Wizard.tsx      # Differential Team Generator
└── README.md               # This documentation
```

### Common Interface
All strategy components follow the same interface:

```tsx
interface StrategyWizardProps {
  matchId: string;
  onGenerate: (preferences: any, teamCount: number) => void;
}
```

### Usage in Main Application
```tsx
import Strategy1Wizard from '@/components/strategies/Strategy1Wizard';
import Strategy2Wizard from '@/components/strategies/Strategy2Wizard';
import Strategy3Wizard from '@/components/strategies/Strategy3Wizard';

// Or import all at once
import { Strategy1Wizard, Strategy2Wizard, Strategy3Wizard } from '@/components/strategies';
```

## Strategy Routing

The application supports multiple routing patterns for strategies:

- **New format**: `same-xi`, `ai-guided`, `differential`
- **Legacy format**: `strategy1`, `strategy2`, `strategy3`
- **Aliases**: `ai-assistant`, `captain-rotation`, `diverse-teams`

## Adding New Strategies

1. Create a new component file: `StrategyXWizard.tsx`
2. Follow the common interface pattern
3. Add export to `index.ts`
4. Update `STRATEGIES` metadata object
5. Add routing logic in the main teams page

### Example New Strategy:
```tsx
// components/strategies/Strategy4Wizard.tsx
export default function Strategy4Wizard({ matchId, onGenerate }: StrategyWizardProps) {
  // Your strategy logic here
  return (
    <div>
      {/* Your strategy UI */}
    </div>
  );
}
```

## Data Flow

1. **User Selection**: User chooses a strategy from the match page
2. **Route Navigation**: Application navigates to teams page with strategy parameter
3. **Strategy Loading**: Teams page loads appropriate strategy wizard
4. **User Input**: User configures preferences in the strategy wizard
5. **Team Generation**: Strategy calls `onGenerate` with preferences
6. **Results Display**: Teams page shows generated teams

## Dependencies

- **UI Components**: Uses shadcn/ui components (Button, Input, Card, etc.)
- **Data Hooks**: Integrates with custom hooks (`useMatchData`, `useChatbot`, etc.)
- **API Integration**: Fetches player data and match information from NeonDB

## Best Practices

1. **Modularization**: Keep each strategy in its own file
2. **Consistent Interface**: Follow the common props interface
3. **Error Handling**: Include proper loading states and error handling
4. **Type Safety**: Use TypeScript interfaces for all props and state
5. **Accessibility**: Ensure components are accessible with proper ARIA labels
6. **Responsive Design**: Design for mobile and desktop experiences

## Testing

Each strategy component should be tested for:
- Proper rendering with mock data
- User interaction flows
- Error handling scenarios
- Data validation
- Integration with parent components
