# Strategy 6: Preset Scenarios / Configurations - Complete Implementation

## Overview

This document outlines the complete implementation of Strategy 6: Preset Scenarios / Configurations for the Dream11 multi-team creation system. The strategy allows users to select from predefined match scenarios and generate multiple diverse fantasy teams based on those selections.

## Implementation Structure

### 1. Core Files Created/Modified

#### `/lib/preset-configurations.ts`
- **Purpose**: Central configuration file containing all preset scenarios
- **Key Features**:
  - 11 predefined preset configurations
  - Role distribution constraints
  - Team preference settings
  - Selection threshold parameters
  - Match context considerations
  - Budget constraints

#### `/lib/preset-strategy-service.ts`
- **Purpose**: Business logic service for applying preset constraints
- **Key Features**:
  - Player filtering based on preset constraints
  - Team generation with preset-specific logic
  - Captain/Vice-captain selection
  - Risk and confidence scoring
  - Budget optimization

#### `/components/strategies/Strategy6Wizard.tsx`
- **Purpose**: User interface for preset selection and configuration
- **Key Features**:
  - Card-based preset selection interface
  - Real-time match condition display
  - Team count configuration
  - Strategy summary and confirmation

### 2. Integration Points

#### `/lib/ai-service-enhanced.ts`
- Added preset strategy handling in `generateTeamsWithAIStrategy()`
- New method `generatePresetScenarioTeams()` 
- Updated user preferences interface to include preset data
- Integrated with preset strategy service

#### `/app/match/[id]/teams/page.tsx`
- Updated `onGenerate()` handler to properly route preset scenarios
- Added strategy name normalization for preset scenarios

#### `/components/strategies/index.ts`
- Already includes Strategy6Wizard export and metadata

## Preset Configurations

### 1. Team-Based Strategies

#### **Team A High Total, Team B Collapse**
- **ID**: `team-a-high-total`
- **Focus**: Prioritize Team A batsmen, select Team B bowlers
- **Role Distribution**: 5 BAT, 3 BOWL, 2 AR, 1 WK
- **Risk Level**: Medium
- **Use Case**: When Team A is expected to dominate

#### **Team B High Total, Team A Collapse**
- **ID**: `team-b-high-total`
- **Focus**: Prioritize Team B batsmen, select Team A bowlers
- **Role Distribution**: 5 BAT, 3 BOWL, 2 AR, 1 WK
- **Risk Level**: Medium
- **Use Case**: When Team B is expected to dominate

### 2. Differential Strategies

#### **High Differentials Strategy**
- **ID**: `high-differentials`
- **Focus**: Players with <20% ownership, high upside
- **Selection Threshold**: Max 20% ownership
- **Risk Level**: High
- **Use Case**: Grand League differentiation

#### **Differential Gems**
- **ID**: `differential-gems`
- **Focus**: Ultra-differential picks (<10% ownership)
- **Selection Threshold**: Max 10% ownership
- **Risk Level**: High
- **Use Case**: Maximum differentiation in large contests

### 3. Balanced Strategies

#### **Balanced Roles (4-3-2-1)**
- **ID**: `balanced-roles`
- **Focus**: Traditional balanced composition
- **Role Distribution**: 4 BAT, 3 BOWL, 2 AR, 1 WK
- **Risk Level**: Low
- **Use Case**: Reliable, proven template

#### **Team Tag Balance**
- **ID**: `team-tag-balance`
- **Focus**: Mix of safe and risky picks
- **Selection Range**: 5-80% ownership
- **Risk Level**: Medium
- **Use Case**: Strategic balance approach

### 4. League-Specific Strategies

#### **Safe Picks for Small Leagues**
- **ID**: `safe-picks-small-leagues`
- **Focus**: Popular, consistent performers
- **Selection Threshold**: Min 40% ownership
- **Risk Level**: Low
- **Use Case**: Head-to-head contests

#### **Risky Picks for Grand Leagues**
- **ID**: `risky-picks-grand-leagues`
- **Focus**: High-risk, high-reward players
- **Selection Threshold**: Max 30% ownership
- **Risk Level**: High
- **Use Case**: Large league differentiation

### 5. Match Context Strategies

#### **Batting Show: High Scoring Match**
- **ID**: `batting-show-high-scoring`
- **Focus**: Batsmen and all-rounders for 350+ scores
- **Role Distribution**: 6 BAT, 2 BOWL, 2 AR, 1 WK
- **Risk Level**: Medium
- **Use Case**: High-scoring, batting-friendly conditions

#### **Bowlers Paradise: Low Scoring Match**
- **ID**: `bowlers-paradise-low-scoring`
- **Focus**: Bowlers for <280 total scores
- **Role Distribution**: 3 BAT, 5 BOWL, 2 AR, 1 WK
- **Risk Level**: Medium
- **Use Case**: Low-scoring, bowling-friendly conditions

### 6. Specialized Strategies

#### **All-Rounder Heavy Lineup**
- **ID**: `all-rounder-heavy`
- **Focus**: Maximum versatility and captaincy options
- **Role Distribution**: 3 BAT, 3 BOWL, 4 AR, 1 WK
- **Risk Level**: Medium
- **Use Case**: Flexible captain selection

## Technical Implementation Details

### Player Filtering Algorithm

The preset strategy service uses a comprehensive scoring system:

1. **Base Scoring**:
   - Recent performance (points * 0.5)
   - Budget efficiency ((100 - credits) * 0.3)
   - Differential value ((100 - selection%) * 0.2)

2. **Constraint Application**:
   - Selection threshold filtering
   - Team preference bonuses/penalties
   - Player type prioritization
   - Budget constraint validation
   - Match context adjustments

3. **Team Generation**:
   - Role-based selection with rotation
   - Dream11 rule compliance
   - Captain/Vice-captain optimization
   - Risk/confidence calculation

### API Integration

The strategy integrates with the existing API structure:

```typescript
// Request format
{
  matchId: number,
  strategy: 'preset-scenarios',
  teamCount: number,
  userPreferences: {
    preset: {
      id: string,
      name: string,
      constraints: {...}
    },
    teamNames: {
      teamA: string,
      teamB: string
    },
    matchConditions: {
      format: string,
      pitch: string,
      weather: string,
      venue: string
    }
  }
}
```

## Usage Flow

1. **User Navigation**: User clicks on Strategy 6 from the strategy selection
2. **Preset Selection**: UI displays all available presets with descriptions
3. **Configuration**: User selects preset and adjusts team count
4. **Generation**: System applies preset constraints and generates teams
5. **Results**: Teams are displayed with preset-specific reasoning

## Error Handling

The implementation includes comprehensive error handling:

- **Preset Not Found**: Graceful fallback with error message
- **Invalid Constraints**: Validation with user feedback
- **API Failures**: Fallback to regular team generation
- **Player Data Issues**: Robust filtering and validation

## Performance Considerations

1. **Caching**: Preset configurations are statically defined
2. **Database Queries**: Optimized player fetching with filtering
3. **Memory Usage**: Efficient constraint application
4. **Response Time**: Parallel processing where possible

## Testing Strategy

The implementation can be tested through:

1. **Unit Tests**: Individual preset constraint validation
2. **Integration Tests**: End-to-end strategy flow
3. **UI Tests**: User interface interaction
4. **Performance Tests**: Large team generation scenarios

## Future Enhancements

1. **Dynamic Presets**: User-defined custom presets
2. **Machine Learning**: AI-optimized preset suggestions
3. **Historical Analysis**: Performance tracking of presets
4. **Advanced Constraints**: More sophisticated filtering options
5. **Real-time Updates**: Live preset adjustments based on team news

## Configuration Management

Presets are managed through the central configuration file, making it easy to:
- Add new presets
- Modify existing constraints
- Adjust risk levels
- Update role distributions
- Change selection thresholds

This modular design ensures the system can easily adapt to new scenarios and strategies while maintaining consistency and reliability.

## Conclusion

Strategy 6: Preset Scenarios / Configurations provides a comprehensive, user-friendly approach to fantasy team creation. By offering predefined scenarios for different match situations, it enables users to quickly generate optimized teams without deep cricket knowledge while still allowing for strategic differentiation.

The implementation is robust, scalable, and integrates seamlessly with the existing system architecture. The modular design ensures easy maintenance and future enhancements while providing immediate value to users across different contest types and playing styles.
