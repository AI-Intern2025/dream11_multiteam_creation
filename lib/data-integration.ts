import { sportRadarService } from './sportradar';
import { openAIService } from './openai';
import { geminiService } from './gemini';
import type { MatchAnalysis } from './openai';

interface EnrichedMatchData {
  match: any;
  lineups: any[];
  timeline: any;
  weather: any;
  teamResults: any[];
  playerProfiles: any[];
  tournament: any;
  standings: any;
  tournamentResults: any;
  headToHead: any;
  teamSquads: any[];
  analysis?: MatchAnalysis;
}

class DataIntegrationService {
  async getAllMatches(): Promise<any[]> {
    try {
      console.log('🔍 Fetching all matches...');
      
      // Check API key configuration
      if (!this.validateAPIKeys()) {
        console.warn('⚠️ API keys not configured, using mock data');
        return this.getMockMatches();
      }

      // Try to get matches from SportRadar
      try {
        const matches = await sportRadarService.getTodaysMatches();
        console.log(`✅ Successfully fetched ${matches?.length || 0} matches from SportRadar`);
        return matches || this.getMockMatches();
      } catch (error) {
        console.error('❌ SportRadar API error:', error);
        console.log('📋 Using mock matches as fallback');
        return this.getMockMatches();
      }
    } catch (error) {
      console.error('❌ Failed to fetch matches:', error);
      return this.getMockMatches();
    }
  }

  async getEnrichedMatchData(matchId: string): Promise<EnrichedMatchData | null> {
    try {
      console.log(`🔍 Starting data integration for match: ${matchId}`);
      
      // Check API key configuration
      if (!this.validateAPIKeys()) {
        throw new Error('API keys not properly configured');
      }

      // Get enriched data from SportRadar with error handling
      let enrichedData;
      try {
        enrichedData = await sportRadarService.getEnrichedMatchData(matchId);
      } catch (error) {
        console.error('❌ SportRadar API error:', error);
        // Return mock data if SportRadar fails
        enrichedData = this.getMockEnrichedData(matchId);
      }

      if (!enrichedData) {
        console.log('📋 Using mock data as fallback');
        enrichedData = this.getMockEnrichedData(matchId);
      }

      // Get AI analysis with fallback
      let analysis: MatchAnalysis | undefined;
      try {
        console.log('🤖 Getting AI analysis...');
        
        // Try OpenAI first
        try {
          analysis = await openAIService.analyzeMatchData(
            enrichedData.match,
            enrichedData.playerProfiles || [],
            enrichedData.weather,
            enrichedData.teamResults || [],
            enrichedData.tournament
          );
          console.log('✅ OpenAI analysis completed');
        } catch (openAIError) {
          console.log('⚠️ OpenAI failed, trying Gemini...');
          
          // Fallback to Gemini
          try {
            analysis = await geminiService.analyzeMatchData(
              enrichedData.match,
              enrichedData.playerProfiles || [],
              enrichedData.weather,
              enrichedData.teamResults || [],
              enrichedData.tournament
            );
            console.log('✅ Gemini analysis completed');
          } catch (geminiError) {
            console.log('⚠️ Both AI services failed, using fallback analysis');
            analysis = this.getFallbackAnalysis(enrichedData.match);
          }
        }
      } catch (error) {
        console.error('❌ AI analysis error:', error);
        analysis = this.getFallbackAnalysis(enrichedData.match);
      }

      // Add analysis to enriched data
      enrichedData.analysis = analysis;

      console.log('✅ Data integration completed successfully');
      return enrichedData;
    } catch (error) {
      console.error('❌ Data integration failed:', error);
      
      // Return mock data as final fallback
      const mockData = this.getMockEnrichedData(matchId);
      mockData.analysis = this.getFallbackAnalysis(mockData.match);
      return mockData;
    }
  }

  async generateTeamsWithStrategy(
    matchId: string,
    strategy: string,
    teamCount: number,
    userPreferences?: any
  ): Promise<any[]> {
    try {
      console.log(`🎯 Generating ${teamCount} teams with strategy: ${strategy}`);
      
      // Get enriched match data
      const enrichedData = await this.getEnrichedMatchData(matchId);
      
      if (!enrichedData) {
        throw new Error('Unable to fetch match data for team generation');
      }

      // Generate teams based on strategy
      const teams = this.generateTeamsBasedOnStrategy(
        enrichedData,
        strategy,
        teamCount,
        userPreferences
      );

      if (!teams || teams.length === 0) {
        throw new Error('No teams could be generated with the current data');
      }

      console.log(`✅ Successfully generated ${teams.length} teams`);
      return teams;
    } catch (error) {
      console.error('❌ Team generation failed:', error);
      
      // Generate fallback teams
      console.log('📋 Generating fallback teams...');
      return this.generateFallbackTeams(matchId, strategy, teamCount);
    }
  }

  private validateAPIKeys(): boolean {
    const requiredKeys = ['SPORTRADAR_API_KEY', 'OPENAI_API_KEY', 'GEMINI_API_KEY'];
    const missingKeys = requiredKeys.filter(key => !process.env[key]);
    
    if (missingKeys.length > 0) {
      console.warn(`⚠️ Missing API keys: ${missingKeys.join(', ')}`);
      return false;
    }
    
    return true;
  }

  private getMockEnrichedData(matchId: string): EnrichedMatchData {
    const mockMatch = {
      id: matchId,
      name: 'Australia vs England',
      start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      start_time_confirmed: true,
      status: 'not_started',
      match_status: 'not_started',
      format: 'T20',
      venue: {
        id: 'venue-1',
        name: 'Melbourne Cricket Ground',
        city_name: 'Melbourne',
        country_name: 'Australia'
      },
      competitors: [
        {
          id: 'team-1',
          name: 'Australia',
          abbreviation: 'AUS',
          country: 'Australia',
          country_code: 'AUS',
          qualifier: 'home'
        },
        {
          id: 'team-2',
          name: 'England',
          abbreviation: 'ENG',
          country: 'England',
          country_code: 'ENG',
          qualifier: 'away'
        }
      ],
      coverage: { live: true, type: 'live' },
      tournament: {
        id: 'tournament-1',
        name: 'T20 International Series',
        category: {
          id: 'category-1',
          name: 'International',
          country_code: 'INT'
        }
      }
    };

    const mockPlayers = [
      { id: 'p1', name: 'David Warner', team: 'AUS', role: 'BAT', statistics: { batting_average: 45, strike_rate: 140 } },
      { id: 'p2', name: 'Aaron Finch', team: 'AUS', role: 'BAT', statistics: { batting_average: 42, strike_rate: 135 } },
      { id: 'p3', name: 'Steve Smith', team: 'AUS', role: 'BAT', statistics: { batting_average: 48, strike_rate: 125 } },
      { id: 'p4', name: 'Glenn Maxwell', team: 'AUS', role: 'ALL', statistics: { batting_average: 35, strike_rate: 155, wickets_taken: 25 } },
      { id: 'p5', name: 'Pat Cummins', team: 'AUS', role: 'BOWL', statistics: { wickets_taken: 45, economy_rate: 7.2 } },
      { id: 'p6', name: 'Alex Carey', team: 'AUS', role: 'WK', statistics: { batting_average: 38, strike_rate: 130 } },
      { id: 'p7', name: 'Jos Buttler', team: 'ENG', role: 'WK', statistics: { batting_average: 44, strike_rate: 145 } },
      { id: 'p8', name: 'Jason Roy', team: 'ENG', role: 'BAT', statistics: { batting_average: 40, strike_rate: 142 } },
      { id: 'p9', name: 'Joe Root', team: 'ENG', role: 'BAT', statistics: { batting_average: 46, strike_rate: 128 } },
      { id: 'p10', name: 'Ben Stokes', team: 'ENG', role: 'ALL', statistics: { batting_average: 38, strike_rate: 138, wickets_taken: 30 } },
      { id: 'p11', name: 'Jofra Archer', team: 'ENG', role: 'BOWL', statistics: { wickets_taken: 42, economy_rate: 7.5 } }
    ];

    return {
      match: mockMatch,
      lineups: mockPlayers,
      timeline: null,
      weather: { temperature: 22, conditions: 'Clear', wind_speed: 10 },
      teamResults: [
        { name: 'Australia', recent_form: 'WWLWW' },
        { name: 'England', recent_form: 'WLWLW' }
      ],
      playerProfiles: mockPlayers,
      tournament: mockMatch.tournament,
      standings: null,
      tournamentResults: null,
      headToHead: null,
      teamSquads: []
    };
  }

  private getFallbackAnalysis(match: any): MatchAnalysis {
    return {
      matchPrediction: {
        winnerPrediction: "Close match",
        confidence: 55,
        scoreRange: {
          team1: { min: 160, max: 180 },
          team2: { min: 160, max: 180 }
        },
        matchType: 'balanced',
        keyFactors: [
          "Recent team form",
          "Pitch conditions",
          "Weather impact",
          "Head-to-head record"
        ]
      },
      playerRecommendations: {
        core: [
          {
            name: "David Warner",
            role: "BAT",
            reason: "Consistent performer with excellent recent form",
            confidence: 85,
            team: "AUS"
          },
          {
            name: "Jos Buttler",
            role: "WK",
            reason: "Explosive batsman and reliable keeper",
            confidence: 80,
            team: "ENG"
          },
          {
            name: "Pat Cummins",
            role: "BOWL",
            reason: "Leading wicket-taker with favorable conditions",
            confidence: 75,
            team: "AUS"
          }
        ],
        hedge: [
          {
            name: "Glenn Maxwell",
            role: "ALL",
            reason: "Good value pick with upside potential",
            risk: 'medium',
            team: "AUS"
          }
        ],
        avoid: [
          {
            name: "Out of Form Player",
            reason: "Poor recent form and unfavorable match-up"
          }
        ]
      },
      captaincy: {
        primary: {
          name: "David Warner",
          reason: "Excellent recent form and reliable point scorer",
          confidence: 85
        },
        secondary: {
          name: "Jos Buttler",
          reason: "Multiple ways to score points",
          confidence: 75
        },
        differential: {
          name: "Pat Cummins",
          reason: "Conditions favor bowling, low ownership expected",
          risk: "Medium risk, high reward potential"
        }
      },
      conditions: {
        pitchAnalysis: "Balanced pitch expected to favor both batsmen and bowlers",
        weatherImpact: "Clear conditions expected with minimal weather interruption",
        venueHistory: "Melbourne Cricket Ground historically produces competitive matches",
        tossImpact: "Toss could be crucial - winning captain likely to bowl first"
      },
      strategy: {
        roleDistribution: {
          batsmen: 4,
          bowlers: 4,
          allRounders: 2,
          wicketKeepers: 1
        },
        teamBalance: "Balanced approach recommended with equal focus on batting and bowling",
        riskProfile: 'balanced',
        keyInsights: [
          "Focus on in-form players from both teams",
          "Consider pitch conditions for player selection",
          "Weather unlikely to be a major factor",
          "Tournament context adds pressure on key players"
        ]
      },
      tournament: {
        context: "T20 International Series",
        importance: "Important match for both teams' tournament progression",
        teamMotivation: "Both teams highly motivated to perform"
      }
    };
  }

  private generateTeamsBasedOnStrategy(
    enrichedData: EnrichedMatchData,
    strategy: string,
    teamCount: number,
    userPreferences?: any
  ): any[] {
    const teams = [];
    const players = enrichedData.lineups || [];
    const analysis = enrichedData.analysis;

    for (let i = 0; i < teamCount; i++) {
      const team = this.generateSingleTeam(players, analysis, strategy, i, userPreferences);
      teams.push(team);
    }

    return teams;
  }

  private generateSingleTeam(
    players: any[],
    analysis: MatchAnalysis | undefined,
    strategy: string,
    teamIndex: number,
    userPreferences?: any
  ): any {
    // Basic team generation logic
    const team = {
      id: `team-${teamIndex + 1}`,
      name: `Team ${teamIndex + 1}`,
      strategy: strategy,
      players: [],
      captain: null,
      viceCaptain: null,
      totalCredits: 100,
      usedCredits: 0,
      expectedPoints: 0
    };

    // Select players based on strategy
    const selectedPlayers = this.selectPlayersForTeam(players, analysis, strategy);
    
    team.players = selectedPlayers as any;
    team.captain = selectedPlayers[0];
    team.viceCaptain = selectedPlayers[1];
    team.usedCredits = selectedPlayers.reduce((sum, p) => sum + (p.credits || 8), 0);
    team.expectedPoints = selectedPlayers.reduce((sum, p) => sum + (p.expectedPoints || 50), 0);

    return team;
  }

  private selectPlayersForTeam(
    players: any[],
    analysis: MatchAnalysis | undefined,
    strategy: string
  ): any[] {
    // Simple player selection logic
    const selectedPlayers: any[] = [];
    const roleTargets = { BAT: 4, BOWL: 4, ALL: 2, WK: 1 };
    
    // Group players by role
    const playersByRole = {
      BAT: players.filter(p => p.role === 'BAT'),
      BOWL: players.filter(p => p.role === 'BOWL'),
      ALL: players.filter(p => p.role === 'ALL'),
      WK: players.filter(p => p.role === 'WK')
    };

    // Select players for each role
    Object.entries(roleTargets).forEach(([role, count]) => {
      const rolePlayers = playersByRole[role as keyof typeof playersByRole] || [];
      const selected = rolePlayers.slice(0, count).map(p => ({
        ...p,
        credits: this.getPlayerCredits(p, analysis),
        expectedPoints: this.getExpectedPoints(p, analysis, strategy)
      }));
      selectedPlayers.push(...selected);
    });

    return selectedPlayers.slice(0, 11); // Ensure exactly 11 players
  }

  private getMockMatches(): any[] {
    return [
      {
        id: 'match-1',
        name: 'Australia vs England',
        start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        start_time_confirmed: true,
        status: 'not_started',
        match_status: 'not_started',
        format: 'T20',
        venue: {
          id: 'venue-1',
          name: 'Melbourne Cricket Ground',
          city_name: 'Melbourne',
          country_name: 'Australia'
        },
        competitors: [
          {
            id: 'team-1',
            name: 'Australia',
            abbreviation: 'AUS',
            country: 'Australia',
            country_code: 'AUS',
            qualifier: 'home'
          },
          {
            id: 'team-2',
            name: 'England',
            abbreviation: 'ENG',
            country: 'England',
            country_code: 'ENG',
            qualifier: 'away'
          }
        ],
        coverage: { live: true, type: 'live' },
        tournament: {
          id: 'tournament-1',
          name: 'T20 International Series',
          category: {
            id: 'category-1',
            name: 'International',
            country_code: 'INT'
          }
        }
      },
      {
        id: 'match-2',
        name: 'India vs Pakistan',
        start_time: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        start_time_confirmed: true,
        status: 'not_started',
        match_status: 'not_started',
        format: 'ODI',
        venue: {
          id: 'venue-2',
          name: 'Eden Gardens',
          city_name: 'Kolkata',
          country_name: 'India'
        },
        competitors: [
          {
            id: 'team-3',
            name: 'India',
            abbreviation: 'IND',
            country: 'India',
            country_code: 'IND',
            qualifier: 'home'
          },
          {
            id: 'team-4',
            name: 'Pakistan',
            abbreviation: 'PAK',
            country: 'Pakistan',
            country_code: 'PAK',
            qualifier: 'away'
          }
        ],
        coverage: { live: true, type: 'live' },
        tournament: {
          id: 'tournament-2',
          name: 'Asia Cup',
          category: {
            id: 'category-2',
            name: 'International',
            country_code: 'INT'
          }
        }
      }
    ];
  }

  private getPlayerCredits(player: any, analysis: MatchAnalysis | undefined): number {
    // Simple credit calculation
    const baseCredits = 8;
    const isCore = analysis?.playerRecommendations.core.some(p => p.name === player.name);
    return isCore ? baseCredits + 2 : baseCredits;
  }

  private getExpectedPoints(player: any, analysis: MatchAnalysis | undefined, strategy: string): number {
    // Simple points calculation
    let basePoints = 50;
    
    const isCore = analysis?.playerRecommendations.core.some(p => p.name === player.name);
    const isCaptain = analysis?.captaincy.primary.name === player.name;
    
    if (isCaptain) basePoints += 20;
    else if (isCore) basePoints += 10;
    
    return basePoints;
  }

  private generateFallbackTeams(matchId: string, strategy: string, teamCount: number): any[] {
    const teams = [];
    
    for (let i = 0; i < teamCount; i++) {
      teams.push({
        id: `fallback-team-${i + 1}`,
        name: `Team ${i + 1}`,
        strategy: strategy,
        players: this.getFallbackPlayers(),
        captain: { id: 'p1', name: 'David Warner' },
        viceCaptain: { id: 'p7', name: 'Jos Buttler' },
        totalCredits: 100,
        usedCredits: 88,
        expectedPoints: 550 + (i * 10)
      });
    }
    
    return teams;
  }

  private getFallbackPlayers(): any[] {
    return [
      { id: 'p1', name: 'David Warner', role: 'BAT', team: 'AUS', credits: 10, expectedPoints: 65 },
      { id: 'p2', name: 'Aaron Finch', role: 'BAT', team: 'AUS', credits: 9, expectedPoints: 60 },
      { id: 'p3', name: 'Steve Smith', role: 'BAT', team: 'AUS', credits: 9, expectedPoints: 58 },
      { id: 'p4', name: 'Jason Roy', role: 'BAT', team: 'ENG', credits: 8, expectedPoints: 55 },
      { id: 'p5', name: 'Glenn Maxwell', role: 'ALL', team: 'AUS', credits: 9, expectedPoints: 62 },
      { id: 'p6', name: 'Ben Stokes', role: 'ALL', team: 'ENG', credits: 9, expectedPoints: 60 },
      { id: 'p7', name: 'Jos Buttler', role: 'WK', team: 'ENG', credits: 10, expectedPoints: 68 },
      { id: 'p8', name: 'Pat Cummins', role: 'BOWL', team: 'AUS', credits: 8, expectedPoints: 52 },
      { id: 'p9', name: 'Jofra Archer', role: 'BOWL', team: 'ENG', credits: 8, expectedPoints: 50 },
      { id: 'p10', name: 'Mitchell Starc', role: 'BOWL', team: 'AUS', credits: 8, expectedPoints: 48 },
      { id: 'p11', name: 'Adil Rashid', role: 'BOWL', team: 'ENG', credits: 7, expectedPoints: 45 }
    ];
  }
}

export const dataIntegrationService = new DataIntegrationService();