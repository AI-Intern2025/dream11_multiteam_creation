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

**Powered by SportRadar Cricket API and OpenAI for the most comprehensive fantasy cricket experience available.**#   d r e a m 1 1 _ m u l t i t e a m _ c r e a t i o n  
 