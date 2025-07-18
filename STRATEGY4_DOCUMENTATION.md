# Strategy 4: Core-Hedge Comprehensive Strategy

## 1. Introduction
**Strategy 4** (Core-Hedge) lets you lock in a set of high-confidence "core" players across most teams, rotate in "hedge" picks in about half of the lineups, and sprinkle in low-ownership "differential" players in one or two teams. This hybrid approach balances safety and upside, with flexible captaincy priority ordering.

## 2. User Workflow

1. **Player Categorization** (`components/strategies/Strategy4Wizard.tsx`, *selection* stage)
   - Fetch active players for both teams via `useMatchData(matchId)` → `/api/players?matchId&teamName&onlyActive=true`.
   - Click **Core**, **Hedge**, **Diff** buttons to assign players into three pools (`core`, `hedge`, `differential`).
   - Selections stored in state: `{ core: Player[], hedge: Player[], differential: Player[] }`.
   - Click **Save Plan & Set Captains** to advance.

2. **Captain Priority Ordering** (`*captaincy*` stage)
   - All selected players listed; click **Add** to push names into `captainOrder` array.
   - Drag or click to reorder; the index in `captainOrder` determines priority per team.
   - Click **Review & Generate** to advance.

3. **Summary & Generate** (`*summary*` stage)
   - Review counts: core, hedge, differential and preview captain priority.
   - Adjust number of teams via `setTeamCount(1–30)`.
   - Click **Generate X Teams** → calls:
     ```ts
     onGenerate({
       selections,            // { core, hedge, differential }
       captainOrder,          // string[] of player names
       teamNames: {           // from matchData.match.team_name.split(' vs ')
         team1, team2
       }
     }, teamCount);
     ```

4. **Team Generation Request**
   - In `app/api/teams/generate/route.ts`, middleware validates:
     - `strategy === 'core-hedge'`
     - Required `userPreferences`: `selections`, `captainOrder`, `teamNames`.
   - Delegates to `aiService.generateTeamsWithAIStrategy(request)`.

### 2.1 Frontend Workflow Diagram
```mermaid
flowchart LR
  A[Load Active Players] --> B[Categorize Players]
  B --> C[Save Plan & Set Captains]
  C --> D[Order Captain Priority]
  D --> E[Review & Set Team Count]
  E --> F[Generate Teams (onGenerate)]
```  
**Diagram Explanation:**
- A→B: categorize into core/hedge/differential.
- B→C: lock selections.
- C→D: build captain priority list.
- E→F: final generate call passes structured prefs.

## 3. Backend Logic

### 3.1 API Route
- **File**: `app/api/teams/generate/route.ts`
- Parses JSON body: `{ matchId, strategy, teamCount, userPreferences }`.
- Validates `strategy === 'core-hedge'` and presence of:
  - `userPreferences.selections` (core, hedge, differential arrays)
  - `userPreferences.captainOrder`
  - `userPreferences.teamNames`
- Calls:
  ```ts
  aiService.generateTeamsWithAIStrategy({
    matchId,
    strategy: 'core-hedge',
    teamCount,
    userPreferences
  });
  ```
- Returns array of `AITeamAnalysis`.

### 3.2 AI Service Pipeline
**File**: `lib/ai-service-enhanced.ts`

1. **Entry Point**: `generateTeamsWithAIStrategy(request)`
   ```ts
   if (request.strategy === 'core-hedge' && request.userPreferences?.selections) {
     // Loop through teamCount
     return Array.from({ length: request.teamCount }, (_, i) =>
       this.generateCoreHedgeTeam(recommendations, request, i)
     );
   }
   ```

2. **generateCoreHedgeTeam(recommendations, request, teamIndex)**
   ```ts
   // Map selection objects to Player[] via recommendations.find(r => r.player.id === id)
   const corePlayers = getPlayersFromSelections(userPrefs.selections.core);
   const hedgePlayers = getPlayersFromSelections(userPrefs.selections.hedge);
   const diffPlayers = getPlayersFromSelections(userPrefs.selections.differential);
   const captainOrder = userPrefs.captainOrder;
   const selected: Player[] = [];

   // 1. Core inclusion
   const coreToInclude = clamp(corePlayers.length, 6, 9);         // 6–9 core picks
   for (let j = 0; j < coreToInclude; j++) {
     const idx = (teamIndex + j) % corePlayers.length;
     selected.push(corePlayers[idx]);
   }

   // 2. Hedge rotation (~50% teams)
   if (teamIndex % 2 === 0 && hedgePlayers.length) {
     const hedgeCount = Math.min(
       Math.ceil(hedgePlayers.length / 2),
       11 - selected.length - 1
     );
     for (let j = 0; j < hedgeCount; j++) {
       const idx = (teamIndex + j) % hedgePlayers.length;
       selected.push(hedgePlayers[idx]);
     }
   }

   // 3. Differential picks (teams 0 and 1)
   if (teamIndex < Math.min(2, diffPlayers.length)) {
     selected.push(diffPlayers[teamIndex]);
   }

   // 4. Fill remaining slots
   //    - Compute roleBalance via calculateRoleBalance(selected)
   //    - Determine role shortfall against standard composition
   //    - Sort remaining recommendations by shortfall priority, then quality score
   //    - Append valid picks respecting 100-credit & max 7-per-side

   // 5. Final validation
   if (!validateTeamComposition(selected)) {
     return generateFallbackTeam(...);
   }

   // 6. Captain & VC assignment
   const { captain, viceCaptain } = selectCaptainFromOrder(
     selected, captainOrder, teamIndex
   );

   // 7. Compute metrics & insights
   return {
     players: selected,
     captain,
     viceCaptain,
     totalCredits,
     roleBalance,
     riskScore,
     expectedPoints,
     confidence,
     insights,
     reasoning
   };
   ```

#### 3.3 Backend Workflow Diagram
```mermaid
flowchart TD
  A[API receives core-hedge request] --> B[generateTeamsWithAIStrategy]
  B --> C{strategy == 'core-hedge'}
  C --> D[generateCoreHedgeTeam(i=0)]
  C --> E[generateCoreHedgeTeam(i=1)]
  C --> F[...repeat for each team]
  D --> G[Return AITeamAnalysis[]]
```  
**Diagram Explanation:**
- The API handler routes to `generateCoreHedgeTeam` for each team index.
- Core/Hedge/Differential pools drive selection rotations for variation.
- Final teams are validated and enriched with captain, VC, metrics.

### 3.4 Detailed Core/Hedge/Differential Mechanics

After the main generation flow, each team’s roster is built by iterating through the user-provided pools with rotation logic:

1. Core Players:
   - Compute `coreToInclude = clamp(corePlayers.length, 6, 9)`.
   - For team index `i`, include players at indices `(i + j) % corePlayers.length` for `j = 0…coreToInclude-1`.
   - Ensures each team has a stable base of high-confidence picks, with one new core pick rotating in each lineup.

2. Hedge Players:
   - Include hedge picks only on even‐indexed teams (`i % 2 === 0`), yielding ~50% coverage.
   - Determine `hedgeCount = min(ceil(hedgePlayers.length / 2), 11 - coreToInclude - 1)`.
   - Rotate through hedgePlayers with index `(i + j) % hedgePlayers.length` for `j = 0…hedgeCount-1`.

3. Differential Players:
   - Only first two teams (`i < min(2, diffPlayers.length)`) get a single differential pick at `diffPlayers[i]`.
   - Ensures low-ownership upside is sprinkled sparingly.

4. Filling Remaining Slots:
   - Compute current role balance vs. standard composition.
   - Sort remaining candidates by role shortfall and quality score.
   - Append players until 11 slots are filled, respecting credits and team limits.

### Example Walkthrough
Assume:
- `corePlayers = [A,B,C,D,E,F,G]` (7 players)
- `hedgePlayers = [H1,H2,H3,H4]` (4 players)
- `diffPlayers = [X,Y]` (2 players)
- `teamCount = 3`, `coreToInclude = clamp(7,6,9) = 6`, `hedgeCount = ceil(4/2)=2`

Team 0 (`i = 0`):
```
 core picks: indices 0–5 → [A,B,C,D,E,F]
 hedge picks: i%2==0 → yes → indices [0,1] → [H1,H2]
 diff pick: i<2 → yes → diffPlayers[0] = X
 total selected before fill: [A,B,C,D,E,F,H1,H2,X] (9 players)
 fill 2 slots with top recommendations → complete 11
```

Team 1 (`i = 1`):
```
 core picks: indices 1–6 → [B,C,D,E,F,G]
 hedge picks: i%2==1 → no
 diff pick: i<2 → yes → diffPlayers[1] = Y
 selected: [B,C,D,E,F,G,Y] (7 players)
 fill 4 slots via sorted recs → total 11
```

Team 2 (`i = 2`):
```
 core picks: indices 2–7%7→0 → [C,D,E,F,G,A]
 hedge picks: i%2==0 → yes → hedge [2,3] → [H3,H4]
 diff pick: i<2 → no
 selected: [C,D,E,F,G,A,H3,H4] (8 players)
 fill 3 slots → total 11
```

This rotation scheme ensures variation across teams while honoring user selections.

## 4. Key Formulas & Rules

- **Core Count**: `coreToInclude = clamp(coreCount, 6, 9)`
- **Hedge Inclusion**: `includeHedge = (teamIndex % 2 === 0)` → ~50% teams
- **Hedge Count**: 
```ts
hedgeCount = min(
  ceil(hedgePlayers.length / 2),
  DREAM11_RULES.totalPlayers - coreToInclude - 1
);
```
- **Differential Teams**: `isDiffTeam = teamIndex < min(2, diffPlayers.length)`
- **Rotation Index**: `poolIdx = (teamIndex + offset) % poolSize`
- **Dream11 Constraints**:
  - Exactly 11 players, ≤100 credits
  - ≤7 players from one real team
  - Role composition via `Dream11TeamValidator.generateValidTeamCompositions()`

## 5. Data Sources & Dependencies

- **Match Data**: `useMatchData(matchId)` → pitch, weather, teams
- **Player Pool**: `/api/players?matchId&teamName&onlyActive=true`
- **AI Service**: `lib/ai-service-enhanced.ts`
- **Validator**: `Dream11TeamValidator`

## 6. AI Confidence & Insights

- **Confidence**: `calculateTeamConfidence` returns 0–100 score
- **Risk Score**: weighted based on hedge/differential picks
- **Insights**: Descriptive strings summarizing counts and pick types

## 7. Next Steps

- Expose **coreToInclude**, **hedgePercentage** as UI inputs
- Add **bias control** sliders for rotation aggressiveness
- Visualize draft preview of each team in UI
- Integrate **user risk appetite** into hedge inclusion logic

---
*Generated on {{date}} by Dream11 AI-Intern2025*
