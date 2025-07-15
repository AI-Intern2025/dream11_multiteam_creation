# Strategy 5 Captain Rotation Fix - Implementation Summary

## Problem Statement
When Strategy 5 (Stats-Driven Guardrails) filters resulted in fewer than 11 players passing the criteria, the system would:
1. Fill remaining slots with random players from the full pool
2. Select captains from the entire final team (including random players)
3. **NOT rotate captains among the players who actually passed the guardrails**

This meant that the captain selection wasn't respecting the user's statistical preferences.

## Solution Implemented

### 1. **Track Filter-Passing Players**
```typescript
const playersPassingFilters: Player[] = []; // Track players who passed filters
```

### 2. **Separate Captain Selection Logic**
```typescript
// Use filter-passing players for captain selection when possible
const captainCandidates = playersPassingFilters.length >= 2 ? playersPassingFilters : selectedPlayers;
const { captain, viceCaptain } = this.selectCaptainsFromFilteredPlayers(captainCandidates, teamIndex);
```

### 3. **New Captain Selection Method**
```typescript
private selectCaptainsFromFilteredPlayers(
  filterPassingPlayers: Player[],
  teamIndex: number
): { captain: Player; viceCaptain: Player }
```

This method:
- Prioritizes captain-suitable roles (BAT, AR, WK)
- Sorts by performance metrics (points, dream team %, selection %)
- Implements rotation based on team index
- Ensures captain and vice-captain are different

### 4. **Enhanced Team Generation Flow**
```typescript
// 1. Select players according to role composition
Object.entries(targetComposition).forEach(([role, count]) => {
  // Add selected players to both arrays
  selectedPlayers.push(player);
  playersPassingFilters.push(player); // Track filter-passing players
});

// 2. Fill remaining slots with filtered players
while (selectedPlayers.length < 11) {
  // Continue adding to both arrays
  playersPassingFilters.push(availablePlayer.player);
}

// 3. Fill remaining slots with random players (NOT tracked as filter-passing)
if (selectedPlayers.length < 11) {
  // Only add to selectedPlayers, not playersPassingFilters
  selectedPlayers.push(player);
}

// 4. Select captains from filter-passing players only
const captainCandidates = playersPassingFilters.length >= 2 ? playersPassingFilters : selectedPlayers;
```

## Key Features

### **Captain Rotation Algorithm**
- **Team 1**: Captain A, Vice-Captain B
- **Team 2**: Captain B, Vice-Captain C  
- **Team 3**: Captain C, Vice-Captain D
- **Team 4**: Captain D, Vice-Captain E
- **Team 5**: Captain E, Vice-Captain A (cycles back)

### **Performance-Based Sorting**
```typescript
const sortedCandidates = finalCandidates.sort((a, b) => {
  const aScore = (a.points || 0) * 0.5 + (a.dream_team_percentage || 0) * 0.3 + (a.selection_percentage || 0) * 0.2;
  const bScore = (b.points || 0) * 0.5 + (b.dream_team_percentage || 0) * 0.3 + (b.selection_percentage || 0) * 0.2;
  return bScore - aScore;
});
```

### **Fallback Handling**
- If fewer than 2 filter-passing players: use all available players
- If no suitable captain roles: use all filter-passing players
- Prevents crashes and ensures valid captain selection

## Example Scenario

**Input**: 7 players pass guardrails (Virat, Rohit, Bumrah, Hardik, Dhoni, Jadeja, Shami)

**Output**: 
- Team 1: C: Virat Kohli, VC: Rohit Sharma
- Team 2: C: Rohit Sharma, VC: Hardik Pandya  
- Team 3: C: Hardik Pandya, VC: Jadeja
- Team 4: C: Jadeja, VC: MS Dhoni
- Team 5: C: MS Dhoni, VC: Virat Kohli (cycles back)

## Benefits

1. **Respects User Preferences**: Captains are selected from players who meet statistical criteria
2. **Proper Rotation**: Different teams have different captain combinations
3. **Performance-Based**: Better players are prioritized for captaincy
4. **Robust Fallback**: Handles edge cases gracefully
5. **Consistent Logic**: Same approach for both traditional and ML-optimized teams

## Files Modified

- `lib/ai-service-enhanced.ts`: 
  - `generateTeamFromFilteredRecommendations()` method
  - New `selectCaptainsFromFilteredPlayers()` method
  - Enhanced tracking of filter-passing players

## Testing

The fix has been tested with:
- 7 players passing guardrails
- 12 different teams showing proper rotation
- Performance-based captain selection
- Edge cases with insufficient players

## Result

✅ **Fixed**: Captains now rotate among players who actually passed the guardrails criteria
✅ **Maintained**: Team composition and fallback logic still work correctly  
✅ **Enhanced**: Better captain selection based on player performance metrics
