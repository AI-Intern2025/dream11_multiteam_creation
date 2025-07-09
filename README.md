# Multi Team Creation Assistant

A comprehensive fantasy cricket platform powered by **SportRadar Cricket API** and **OpenAI** for intelligent team creation and analysis.

## 🏏 Features

### **Professional Cricket Data Integration**
- **SportRadar Cricket API**: Official cricket statistics and live data
- **Real-time Match Data**: Live scores, lineups, and match conditions
- **Comprehensive Player Stats**: Detailed batting, bowling, and fielding statistics
- **Weather Integration**: Professional weather data and pitch analysis
- **Tournament Context**: Competition details and standings

### **AI-Powered Analysis**
- **OpenAI Integration**: Intelligent match and player analysis
- **Predictive Insights**: Match outcome predictions and scoring forecasts
- **Player Recommendations**: Data-driven player selection advice
- **Captaincy Analysis**: Strategic captain and vice-captain suggestions
- **Risk Assessment**: Conservative, balanced, and aggressive strategies

### **8 Team Creation Strategies**
1. **AI-Guided Chatbot**: Interactive assistant with live insights
2. **Same XI, Different Captains**: Core team with captaincy variations
3. **Score & Storyline Prediction**: Teams based on match predictions
4. **Core-Hedge Selection**: Balanced portfolio approach
5. **Stats-Driven Guardrails**: Data-driven selection criteria
6. **Preset Scenarios**: Curated match-specific strategies
7. **Role-Split Lineups**: Optimized role distribution
8. **Base Team + Rule-Based Edits**: Foundation team with variations

### **Advanced Analytics**
- **Performance Tracking**: Historical team performance analysis
- **Strategy Comparison**: Multi-strategy effectiveness analysis
- **Confidence Scoring**: AI-powered prediction confidence
- **Portfolio Diversity**: Risk distribution across teams

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ and npm
- SportRadar API account and key
- OpenAI API account and key

### **API Setup**

#### **1. SportRadar Cricket API**
1. Visit [SportRadar Developer Portal](https://developer.sportradar.com/)
2. Sign up for a trial account (if you don't have one)
3. Navigate to "My Account" → "Applications" 
4. Create a new application or select existing one
5. Copy your API key from the application details
6. Add to `.env.local`: `SPORTRADAR_API_KEY=your_actual_api_key_here`

**Important Notes:**
- Make sure your API key is active and not expired
- Trial accounts have limited requests per day
- Ensure your key has access to Cricket API endpoints
- Remove any extra spaces or characters from the API key

#### **2. OpenAI API**
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account and generate an API key
3. Add to `.env.local`: `OPENAI_API_KEY=your_api_key_here`

### **Installation**
```bash
# Clone the repository
git clone <repository-url>
cd multi-team-creator

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your API keys

# Start development server
npm run dev
```

### **Environment Variables**
```env
# Required
SPORTRADAR_API_KEY=your_sportradar_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Optional
WEATHER_API_KEY=your_weather_api_key_here
```

## 📊 SportRadar API Integration

### **Key Endpoints Used**
- `/schedules/{date}/schedule.json` - Daily match schedules
- `/matches/{id}/summary.json` - Detailed match information
- `/matches/{id}/lineups.json` - Official team lineups
- `/players/{id}/profile.json` - Comprehensive player statistics
- `/matches/{id}/weather_info.json` - Weather and pitch conditions
- `/competitors/{id}/results.json` - Team performance history
- `/tournaments/{id}/info.json` - Tournament details

### **Data Processing Flow**
1. **Fetch**: Retrieve comprehensive match data from SportRadar
2. **Enrich**: Combine match, player, weather, and team data
3. **Analyze**: Process data through OpenAI for insights
4. **Generate**: Create optimized teams using AI strategies
5. **Present**: Display insights and recommendations

## 🤖 AI Analysis Features

### **Match Prediction**
- Winner prediction with confidence scoring
- Score range forecasting for both teams
- Match type classification (high-scoring/low-scoring/balanced)
- Key factors influencing the match outcome

### **Player Recommendations**
- **Core Players**: High-confidence selections based on form and conditions
- **Hedge Players**: Differential picks with risk assessment
- **Avoid List**: Players to avoid with specific reasons

### **Captaincy Analysis**
- **Primary Captain**: Highest confidence choice with detailed reasoning
- **Secondary Captain**: Alternative option with analysis
- **Differential Captain**: High-risk, high-reward option

### **Conditions Analysis**
- **Pitch Analysis**: Surface conditions and their impact
- **Weather Impact**: How weather affects player performance
- **Venue History**: Historical trends and ground characteristics
- **Toss Impact**: Importance of toss and strategic implications

## 🎯 Team Creation Strategies

### **AI-Guided Chatbot**
Interactive assistant providing real-time advice based on:
- Live match conditions and analysis
- Player form and recent performances
- Weather and pitch conditions
- Tournament context and team motivation

### **Same XI, Different Captains**
- Consistent core team across multiple entries
- Strategic captaincy variations based on AI analysis
- Risk mitigation through diversified leadership

### **Score & Storyline Prediction**
- Teams optimized for predicted match scenarios
- Player selection based on expected match dynamics
- Adaptation to high-scoring vs. low-scoring predictions

### **Core-Hedge Selection**
- Portfolio approach with core and differential players
- Risk distribution across conservative and aggressive picks
- Balanced exposure to both teams

### **Stats-Driven Guardrails**
- Data-driven selection criteria and filters
- Minimum performance thresholds
- Form-based player qualification

### **Preset Scenarios**
- Pre-configured strategies for common match types
- Scenario-based team compositions
- Quick deployment for specific conditions

### **Role-Split Lineups**
- Optimized role distribution (batsmen, bowlers, all-rounders, wicket-keepers)
- Balance based on match conditions and analysis
- Strategic team composition

### **Base Team + Rule-Based Edits**
- Foundation team with systematic variations
- Rule-based modifications for diversity
- Structured approach to team creation

## 📈 Analytics Dashboard

### **Performance Metrics**
- Overall win rate and ranking trends
- Strategy-specific performance analysis
- Player selection success rates
- Captaincy choice effectiveness

### **Historical Analysis**
- Match-by-match performance tracking
- Long-term trend analysis
- Strategy comparison and optimization
- Learning from past decisions

## 🛠️ Technical Architecture

### **Frontend**
- **Next.js 13+**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Modern component library

### **Backend**
- **Next.js API Routes**: Serverless API endpoints
- **SportRadar Integration**: Professional cricket data
- **OpenAI Integration**: AI-powered analysis
- **Intelligent Caching**: Optimized data retrieval

### **Data Flow**
```
SportRadar API → Data Integration Service → OpenAI Analysis → Strategy Engine → UI Components
```

## 🔧 Development

### **Project Structure**
```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── match/             # Match-specific pages
│   └── components/        # React components
├── lib/                   # Core libraries
│   ├── sportradar.ts      # SportRadar API integration
│   ├── openai.ts          # OpenAI analysis service
│   └── data-integration.ts # Data processing service
├── hooks/                 # Custom React hooks
└── components/ui/         # UI components
```

### **Key Services**
- **SportRadarService**: API client for cricket data
- **OpenAIService**: AI analysis and insights
- **DataIntegrationService**: Data processing and caching
- **Team Generation**: Strategy-based team creation

## 📝 API Documentation

### **Match Data Endpoints**
- `GET /api/matches` - List available matches
- `GET /api/matches/[id]` - Get enriched match data
- `POST /api/teams/generate` - Generate teams with strategy
- `POST /api/chatbot` - AI chatbot interactions

### **Data Models**
- **SportRadarMatch**: Complete match information
- **SportRadarPlayer**: Player profiles and statistics
- **MatchAnalysis**: AI-generated insights
- **EnrichedMatchData**: Combined data for analysis

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the documentation
- Review API integration guides
- Contact the development team

---

**Powered by SportRadar Cricket API and OpenAI for the most comprehensive fantasy cricket experience available.**

# 🏏 Multi Team Creation Assistant — Detailed Project Workflow

Below is the comprehensive end‑to‑end workflow for both Admin and User sides of the project, including 8 distinct team‑creation strategies, and points where we integrate our three related internship modules:

- Pre‑Match Team Creation Assistant
- Summary of Teams Created
- Fantasy Performance Tracker

---

## 🚀 1. ADMIN FLOW

### 1. **Upload Fixture**
- Admin navigates to **Admin → Fixtures** and clicks **"Upload CSV"**.
- A CSV of upcoming fixtures (e.g. `ENG vs IND Test`, `PAK vs NZ ODI`, `AUS vs WI T20`) is ingested.

### 2. **Pull & Review Fixtures**
- System displays parsed fixtures.  
- Admin selects a fixture to configure.

### 3. **Upload Lineup Screenshot**
- Admin uploads the Dream11 "Create Team" screenshot for that fixture.
- E.g. the XI view showing credits, roles, selection %.

### 4. **OCR + Classification + CRUD Panel**
- **OCR** reads player names, roles, credits, teams.
- **CRUD panel** shows each record:
  - If "All values read correctly?" → click **Publish Match**  
  - If "No" → admin edits fields manually → then **Publish Match**  

### 5. **Upload Natural‐Language Match Data**
- Admin can paste or upload **pitch reports**, **form summaries**, **storyline notes** (leveraging Pre‑Match Team Creation Assistant's knowledge base).
- System "studies" these texts (indexed in our AI knowledge store).

### 6. **Publish Match**
- After either path, the fixture goes live for users:
  - **Player pool** imported  
  - **Credits & roles** stored  
  - **NL context** (pitch, narrative) tagged  

---

## 🎯 2. USER WORKFLOW

### 1. **List of Published Matches**  
- User opens the home page: sees cards for each fixture (e.g. `ENG vs IND`, `PAK vs NZ`, `AUS vs WI`).

### 2. **Select Match & Teams Count**  
- Clicks on the desired match.  
- Prompt: **"How many teams would you like to create?"** (e.g. 10, 15, 20).

### 3. **Choose Team‑Creation Strategy**  
- **Question**: "What do you want to base your teams on?"  
- Eight strategy flows branch out from here:

---

### 🔹 Strategy 1: AI‑Guided Chatbot (Pre‑Match Team Creation Assistant)
- **Opens Chatbot UI** (pill‑based Q&A):
  - "Who do you think will win?"  
  - "What final score range?"  
  - "Any players you're backing?"  
  - "Which story will unfold?"  
- **System** synthesizes answers into constraints.  
- **Selection Summariser** recap:
  > "You chose Team A to win, backing Player X as VC, focusing on high‑scoring batters."  
- **Generate X Teams** applying those constraints.

> *Integrates our "Pre‑Match Team Creation Assistant" module here.*

---

### 🔹 Strategy 2: Same XI, Different Captains
- **Opens Create‑Team UI** showing the 11 selected players.  
- User **orders** them by C/VC preference.
- (Optional) User can **upload** another XI screenshot to import new baseline.  
- **Selection Summariser**:
  > "Your core XI locked — rotating C/VC across 15 teams."  
- **Generate X Teams** varying only C/VC.

---

### 🔹 Strategy 3: Score & Storyline Prediction
- **Opens Prediction Form**:
  - "Will Team A score High/Medium/Low runs?"  
  - "Will Team A concede High/Medium/Low wickets?"  
  - Same for Team B.  
- **Save Predictions**.  
- **Summariser** explains:
  > "You expect a batting pitch; Team A will rack up 200+, Team B will collapse."  
- **Generate X Teams** stacking top‑order batters of Team A, bowlers of Team B.

---

### 🔹 Strategy 4: Core‑Hedge Player Selection
- **Opens Create‑Team UI**:
  - "Select players for 75%+ of teams"  
  - "Select players for ~50% of teams"  
  - "Select players for 1–2 teams"  
  - "Order your C/VC"  
- **Save Plan** then **Summariser**:
  > "Your core 6 locked, hedging 4 picks across 12 teams."  
- **Generate X Teams** mixing core and hedge picks.

---

### 🔹 Strategy 5: Stats‑Driven Guardrails
- **Form** to set numerical filters:
  - Dream Team % between X–Y  
  - Selection % between A–B  
  - Avg Points between M–N  
- **Save Guardrails**.  
- **Summariser**:
  > "Generating teams with only in‑form all‑rounders and high‑value batters."  
- **Generate X Teams** meeting those stats filters.

---

### 🔹 Strategy 6: Preset Scenarios / Configurations
- **Form** to choose from presets:
  - "Team A high total, Team B collapse"  
  - "High differentials"  
  - "Balanced roles: 4 BAT, 3 BOWL, 2 AR, 1 WK"  
  - Etc…  
- **Save Config** → **Summariser** → **Generate X Teams**.

---

### 🔹 Strategy 7: Role‑Split Lineups
- **Form** to define role ratios:
  - Top / Middle / Lower order split  
  - Spinners vs Pacers ratio  
- **Save Config** → **Summariser** → **Generate X Teams**.

---

### 🔹 Strategy 8: Base Team + Rule‑Based Edits
- **Opens Create‑Team UI** with baseline XI.  
- **Define Rules**:
  - Optimization parameter (e.g. Dream Team %)
  - Guardrails (# per role, # per real team)
  - Preferences (more spinners vs pacers, top vs middle order)  
- **Save Rules** → **Summariser** → **Generate X Teams** applying minor edits per team.

---

## 📊 3. POST‑GENERATION FEATURES

### 1. **Summary of Teams Created**  
- **Individual team insights** (role balance, credit usage, form alignment).  
- **Portfolio analytics** (player frequency, C/VC distribution).  
- **Performance metrics** (win‑rate simulation, past ROI).  
- *Integration Point:* **"Summary of Teams Created"** internship project.

### 2. **Bulk Actions**  
- **Search** by player across all teams.  
- **Bulk Edit** (swap player A ↔ B).  
- **Delete / Duplicate** teams.  
- **CSV Export** in Dream11 format.

### 3. **Export Teams**
- Final teams can be:
  - Downloaded in .CSV format compatible with Dream11 import
  - Exported as JSON/XML for internal analytics

### 4. **Fantasy Performance Tracker**  
- **Live Simulation**: Rank probability, what‑if scenarios.  
- **After‑Match Analytics**: Chart how each event affected your rank.  
- **Historical Trends**: Aggregate performance across days/tours.  
- *Integration Point:* **"Fantasy Performance Tracker"** internship project.

---

## 📦 4. TECHNOLOGY & COMPONENTS

- **Frontend:** Next.js + Tailwind (black/white/red theme), PWA  
- **Backend:** Next.js API Routes + External APIs (SportRadar, OpenAI, Gemini)
- **AI Modules:** Chatbot (Pre‑Match), Summarizer (Teams Created), Tracker (Performance)  
- **Data Flow:**  
  - Admin → publish match & player data  
  - User → select match → strategy → generate teams  
  - System → summary & analytics  

---

## 🔄 Complete User Journey Example

### Example: User Creating 15 Teams for ENG vs IND Test

1. **Match Selection**: User clicks "ENG vs IND Test" card on homepage
2. **Team Count**: Selects "15 teams" from dropdown
3. **Strategy Choice**: Chooses "AI-Guided Chatbot" strategy
4. **Chatbot Interaction**:
   - "I think India will win by 50+ runs"
   - "Expecting 350+ first innings total"
   - "Backing Kohli and Bumrah strongly"
   - "Weather will favor spinners"
5. **AI Processing**: System synthesizes preferences into team generation constraints
6. **Team Generation**: 15 teams created with varied compositions but aligned to user preferences
7. **Summary View**: Portfolio analysis showing player distribution and strategy effectiveness
8. **Export**: Teams downloaded in Dream11-compatible CSV format

This workflow captures the entire journey from fixture ingestion through team creation and performance tracking, with clear integration points for our three related internship projects.