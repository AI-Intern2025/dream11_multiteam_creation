# GitHub Copilot Instructions - Dream11 Multi-Team Creation

## Project Overview
This is a fantasy cricket platform that generates multiple Dream11 teams using 8 distinct AI-powered strategies. It uses OpenAI/Gemini for intelligent analysis and Neon PostgreSQL for data persistence, with comprehensive mock data for development and testing.

## Architecture & Data Flow
The system follows a **multi-layered architecture**:
- **API Integration Layer**: `lib/openai.ts`, `lib/gemini.ts`
- **Data Processing**: `lib/data-integration.ts` orchestrates AI analysis with mock data providers
- **Strategy Engine**: `components/strategies/*` - 8 modular team generation wizards
- **Database Layer**: `lib/neon-db.ts` with PostgreSQL schema in `database/schema.sql`

**Critical Data Flow Pattern**: `Mock Data / Neon DB → Data Integration Service → AI Analysis → Strategy Engine → UI Components`

## Essential Development Patterns

### Data Integration with Mock Providers
All data sources use intelligent fallbacks to mock data. Follow this pattern from `lib/data-integration.ts`:
```typescript
// Always prioritize database data first
try {
  matches = await neonDB.getActiveMatches();
} catch (dbError) {
  console.warn('Database not available, using mock data');
  return this.getMockMatches();
}

// Generate enriched data with mock providers
const enrichedData = this.getMockEnrichedData(matchId);
```

### Strategy Component Architecture
Each strategy in `components/strategies/` follows this interface:
```tsx
interface StrategyWizardProps {
  matchId: string;
  onGenerate: (prefs: any, count: number) => void;
}
```
Strategies are modular React components with multi-step wizards. Study `Strategy1Wizard.tsx` for the conversation flow pattern.

### Database Integration
Use Neon DB with fallbacks to mock data. Pattern from `app/api/matches/route.ts`:
```typescript
try {
  matches = await neonDB.getActiveMatches();
} catch (dbError) {
  console.warn('Neon DB not available, falling back to mock data');
  matches = await dataIntegrationService.getMockMatches();
}
```

## Core Services & Their Responsibilities

### `lib/data-integration.ts` - Central Orchestrator
- Coordinates AI analysis and data enrichment with mock data providers
- Implements comprehensive error handling with mock data fallbacks
- Returns `EnrichedMatchData` objects containing match, players, analysis, and conditions

### `lib/openai.ts` & `lib/gemini.ts` - AI Analysis
- Generate `MatchAnalysis` objects with predictions, player recommendations, captaincy advice
- Provide fallback between OpenAI and Gemini APIs
- Structure responses for core/hedge/avoid player categorization

## Key Development Commands

### Environment Setup
```bash
cp .env.local.example .env.local  # Configure API keys
npm install
npm run dev  # Starts on localhost:3000
```

### Required Environment Variables
```
OPENAI_API_KEY=      # OpenAI API key  
DATABASE_URL=        # Neon PostgreSQL connection string
GEMINI_API_KEY=      # Google Gemini API key (optional)
```

### Testing Strategy Components
Use dedicated test scripts in project root:
- `node test-strategy1-debug.js` - Test AI-guided strategy
- `node test-strategy7-enhanced.js` - Test role-split strategy
- `node validate-strategy7.js` - Validate strategy outputs

### Database Operations
- `npm run setup-db` - Initialize database schema
- Scripts in `scripts/` folder for data population and testing

## Team Generation Strategies

The 8 strategies represent different approaches to fantasy team creation:
1. **AI-Guided Chatbot** - Conversational preference gathering
2. **Same XI, Different Captains** - Core team with captaincy variations  
3. **Score & Storyline Prediction** - Teams based on match predictions
4. **Core-Hedge Selection** - Portfolio approach with risk distribution
5. **Stats-Driven Guardrails** - Data-driven selection criteria
6. **Preset Scenarios** - Curated match-specific strategies
7. **Role-Split Lineups** - Optimized role distribution
8. **Base Team + Rule-Based Edits** - Foundation team with variations

Each strategy component manages its own UI flow and data transformation before calling the team generation API.

## Authentication & Security
- JWT-based auth with `lib/auth.ts`
- Demo mode fallbacks for development
- Middleware in `middleware.ts` handles route protection
- Client-side auth state managed via `hooks/use-auth.ts`

## UI Patterns & Components
- **shadcn/ui** components in `components/ui/`
- **Strategy wizards** use multi-step flows with progress indicators
- **Data fetching** via SWR hooks in `hooks/use-cricket-data.ts`
- **Responsive design** with Tailwind CSS utilities

## Error Handling Philosophy
Always provide graceful degradation:
- API failures → mock data
- Missing player data → default values  
- Network issues → cached responses
- Invalid configurations → sensible defaults

## Testing & Debugging
- Console logging is extensive for debugging API integrations
- Mock data providers exist for all external dependencies
- Individual strategy components can be tested in isolation
- Database schema includes both production and test data structures

When working on this codebase, prioritize maintaining the fallback patterns and modular strategy architecture. Each component should work independently even when external services fail.
