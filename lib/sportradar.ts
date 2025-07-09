import axios from 'axios';

export interface SportRadarMatch {
  id: string;
  name: string;
  start_time: string;
  start_time_confirmed: boolean;
  status: string;
  match_status: string;
  format: string;
  venue: {
    id: string;
    name: string;
    city_name: string;
    country_name: string;
    capacity?: number;
  };
  competitors: Array<{
    id: string;
    name: string;
    abbreviation: string;
    country: string;
    country_code: string;
    qualifier: string;
  }>;
  coverage: {
    live: boolean;
    type: string;
  };
  tournament: {
    id: string;
    name: string;
    category: {
      id: string;
      name: string;
      country_code: string;
    };
  };
  sport_event_context?: {
    sport: { id: string; name: string };
    category: { id: string; name: string; country_code: string };
    competition: { id: string; name: string; gender: string };
    season: { id: string; name: string; start_date: string; end_date: string; year: string };
    stage?: { order: number; type: string; phase: string };
    round?: { type: string; number: number };
  };
}

export interface SportRadarPlayer {
  id: string;
  name: string;
  full_name?: string;
  type: string;
  date_of_birth: string;
  nationality: string;
  country_code: string;
  height?: number;
  weight?: number;
  jersey_number?: number;
  role?: string;
  team?: string;
  statistics?: {
    matches_played: number;
    runs_scored: number;
    batting_average: number;
    strike_rate: number;
    highest_score: number;
    centuries: number;
    half_centuries: number;
    wickets_taken: number;
    bowling_average: number;
    economy_rate: number;
    best_bowling: string;
    catches: number;
    stumpings: number;
    recent_form?: string;
  };
}

export interface SportRadarLineup {
  match: {
    id: string;
    start_time: string;
  };
  lineups: Array<{
    competitor: {
      id: string;
      name: string;
      abbreviation: string;
    };
    players: Array<{
      id: string;
      name: string;
      type: string;
      jersey_number?: number;
      position?: string;
      starter: boolean;
      captain?: boolean;
      wicket_keeper?: boolean;
    }>;
  }>;
}

export interface SportRadarSchedule {
  generated_at: string;
  sport_events: Array<{
    id: string;
    start_time: string;
    start_time_confirmed: boolean;
    sport_event_context: {
      sport: { id: string; name: string };
      category: { id: string; name: string; country_code: string };
      competition: { id: string; name: string; gender: string };
      season: { id: string; name: string; start_date: string; end_date: string; year: string };
      stage?: { order: number; type: string; phase: string };
      round?: { type: string; number: number };
    };
    status: string;
    competitors: Array<{
      id: string;
      name: string;
      country: string;
      country_code: string;
      abbreviation: string;
      qualifier: string;
    }>;
    venue: {
      id: string;
      name: string;
      city_name: string;
      country_name: string;
      country_code: string;
    };
  }>;
}

export interface SportRadarTeamProfile {
  competitor: {
    id: string;
    name: string;
    abbreviation: string;
    country: string;
    country_code: string;
  };
  players?: Array<{
    id: string;
    name: string;
    type: string;
    date_of_birth: string;
    nationality: string;
  }>;
}

export interface SportRadarTournament {
  tournament: {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    category: {
      id: string;
      name: string;
      country_code: string;
    };
    current_season: {
      id: string;
      name: string;
      start_date: string;
      end_date: string;
      year: string;
    };
  };
}

export interface SportRadarTimeline {
  sport_event: {
    id: string;
    start_time: string;
  };
  timeline: Array<{
    id: string;
    type: string;
    time: string;
    match_time: string;
    period: string;
    period_name: string;
    competitor?: {
      id: string;
      name: string;
    };
    player?: {
      id: string;
      name: string;
    };
    method?: string;
    runs?: number;
    wickets?: number;
    description?: string;
  }>;
}

export interface SportRadarStandings {
  tournament: {
    id: string;
    name: string;
  };
  standings: Array<{
    type: string;
    groups: Array<{
      id: string;
      name: string;
      group_standings: Array<{
        rank: number;
        competitor: {
          id: string;
          name: string;
          abbreviation: string;
        };
        played: number;
        won: number;
        lost: number;
        tied: number;
        no_result: number;
        points: number;
        net_run_rate: number;
      }>;
    }>;
  }>;
}

class SportRadarService {
  private apiKey: string;
  private baseURL: string = 'https://api.sportradar.com/cricket-t2';
  private locale: string = 'en';
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue: boolean = false;
  private lastRequestTime: number = 0;
  private minRequestInterval: number = 1000; // 1 second between requests
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheExpiry: number = 5 * 60 * 1000; // 5 minutes cache

  constructor() {
    this.apiKey = process.env.SPORTRADAR_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️  SportRadar API key not configured. Please update SPORTRADAR_API_KEY in .env.local');
    }
  }

  private async makeRequest<T>(endpoint: string, useCache: boolean = true): Promise<T | null> {
    // Check cache first
    if (useCache) {
      const cached = this.cache.get(endpoint);
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        console.log(`📋 Using cached data for: ${endpoint}`);
        return cached.data;
      }
    }

    // Add request to queue
    return new Promise((resolve) => {
      this.requestQueue.push(async () => {
        try {
          const result = await this.executeRequest<T>(endpoint);
          
          // Cache successful results
          if (result && useCache) {
            this.cache.set(endpoint, {
              data: result,
              timestamp: Date.now()
            });
          }
          
          resolve(result);
        } catch (error) {
          console.error(`❌ Request failed for ${endpoint}:`, error);
          resolve(null);
        }
      });
      
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (!request) continue;

      // Ensure minimum interval between requests
      const timeSinceLastRequest = Date.now() - this.lastRequestTime;
      if (timeSinceLastRequest < this.minRequestInterval) {
        const delay = this.minRequestInterval - timeSinceLastRequest;
        console.log(`⏳ Rate limiting: waiting ${delay}ms before next request`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      await request();
      this.lastRequestTime = Date.now();
    }

    this.isProcessingQueue = false;
  }

  private async executeRequest<T>(endpoint: string): Promise<T | null> {
    try {
      if (!this.apiKey) {
        console.warn('⚠️  SportRadar API request skipped - API key not configured');
        return null;
      }

      const url = `${this.baseURL}/${this.locale}${endpoint}?api_key=${this.apiKey}`;
      console.log(`📡 SportRadar API: ${endpoint}`);
      
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Fantasy-Cricket-App/1.0',
          'Cache-Control': 'no-cache'
        }
      });
      
      console.log(`✅ SportRadar API success: ${endpoint}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          console.error(`❌ SportRadar API Authentication Failed: Invalid or expired API key`);
          console.error('Please check your API key in .env.local');
          console.error('Visit https://developer.sportradar.com/ to verify your API key');
        } else if (error.response?.status === 404) {
          console.error(`❌ SportRadar API endpoint not found: ${endpoint}`);
        } else if (error.response?.status === 429) {
          console.error(`❌ SportRadar API rate limit exceeded for: ${endpoint}`);
        } else {
          console.error(`❌ SportRadar API error (${error.response?.status}) for ${endpoint}:`, error.response?.data || error.message);
        }
      } else {
        console.error(`❌ Network error for SportRadar API ${endpoint}:`, error);
      }
      return null;
    }
  }

  // ===== SCHEDULE ENDPOINTS =====

  // GET /{locale}/schedules/{date}/schedule - lists all scheduled sport event on a date
  async getSchedule(date: string): Promise<SportRadarSchedule | null> {
    console.log(`📅 Getting schedule for date: ${date}`);
    
    const response = await this.makeRequest<SportRadarSchedule>(`/schedules/${date}/schedule.json`);
    
    if (response) {
      return response;
    } else {
      console.log('📅 Using mock schedule data as fallback');
      return this.getMockSchedule(date);
    }
  }

  // GET /{locale}/schedules/live/schedule - lists all live scheduled sport events
  async getLiveSchedule(): Promise<SportRadarSchedule | null> {
    console.log('📺 Getting live schedule...');
    return await this.makeRequest<SportRadarSchedule>('/schedules/live/schedule.json');
  }

  // GET /{locale}/schedules/{urn_date}/results - lists results for a date
  async getResults(date: string): Promise<any> {
    console.log(`📊 Getting results for date: ${date}`);
    return await this.makeRequest<any>(`/schedules/${date}/results.json`);
  }

  // GET /{locale}/teams/{urn_competitor}/schedule - lists all scheduled sport events for a team
  async getTeamSchedule(teamId: string): Promise<any> {
    console.log(`📅 Getting team schedule for: ${teamId}`);
    return await this.makeRequest<any>(`/teams/${teamId}/schedule.json`);
  }

  // GET /{locale}/tournaments/{urn_tournament}/schedule - lists all scheduled sport event in a tournament
  async getTournamentSchedule(tournamentId: string): Promise<any> {
    console.log(`📅 Getting tournament schedule for: ${tournamentId}`);
    return await this.makeRequest<any>(`/tournaments/${tournamentId}/schedule.json`);
  }

  // ===== SPORT EVENTS ENDPOINTS =====

  // GET /{locale}/matches/{urn_sport_event}/summary - show summary for one sport event
  async getMatchSummary(matchId: string): Promise<SportRadarMatch | null> {
    console.log(`🏏 Getting match summary for: ${matchId}`);
    
    // For mock matches, return mock data
    if (matchId.startsWith('mock') || matchId.startsWith('sr:match:mock')) {
      return this.getMockMatchSummary(matchId);
    }

    const response = await this.makeRequest<any>(`/matches/${matchId}/summary.json`);
    
    if (response && response.sport_event) {
      return this.transformSportEventToMatch(response.sport_event, response.sport_event_status);
    }
    
    return null;
  }

  // GET /{locale}/matches/{urn_sport_event}/lineups - show lineups one sport event
  async getMatchLineups(matchId: string): Promise<SportRadarLineup | null> {
    console.log(`👥 Getting lineups for match: ${matchId}`);
    
    // For mock matches, return mock lineups
    if (matchId.startsWith('mock') || matchId.startsWith('sr:match:mock')) {
      return this.getMockLineups(matchId);
    }

    const response = await this.makeRequest<any>(`/matches/${matchId}/lineups.json`);
    
    if (response && response.lineups) {
      return {
        match: {
          id: matchId,
          start_time: response.sport_event?.start_time || new Date().toISOString()
        },
        lineups: response.lineups
          .filter((lineup: any) => lineup && lineup.competitor && lineup.players)
          .map((lineup: any) => ({
            competitor: {
              id: lineup.competitor?.id || '',
              name: lineup.competitor?.name || 'Unknown Team',
              abbreviation: lineup.competitor?.abbreviation || 'UNK'
            },
            players: (lineup.players || [])
              .filter((player: any) => player && player.id && player.name)
              .map((player: any) => ({
                id: player.id,
                name: player.name,
                type: player.type || 'player',
                jersey_number: player.jersey_number,
                starter: true,
                captain: player.captain || false,
                wicket_keeper: player.wicket_keeper || false
              }))
          }))
      };
    }

    return null;
  }

  // ===== TIMELINE ENDPOINTS =====

  // GET /{locale}/matches/{urn_sport_event}/timeline - show timeline for one sport event
  async getMatchTimeline(matchId: string): Promise<SportRadarTimeline | null> {
    console.log(`⏱️ Getting timeline for match: ${matchId}`);
    
    const response = await this.makeRequest<any>(`/matches/${matchId}/timeline.json`);
    
    if (response && response.timeline) {
      return {
        sport_event: response.sport_event,
        timeline: response.timeline.map((event: any) => ({
          id: event.id,
          type: event.type,
          time: event.time,
          match_time: event.match_time,
          period: event.period,
          period_name: event.period_name,
          competitor: event.competitor,
          player: event.player,
          method: event.method,
          runs: event.runs,
          wickets: event.wickets,
          description: event.description
        }))
      };
    }
    
    return null;
  }

  // GET /{locale}/matches/{urn_sport_event}/timeline/delta - show timeline delta for one sport event
  async getMatchTimelineDelta(matchId: string): Promise<any> {
    console.log(`⏱️ Getting timeline delta for match: ${matchId}`);
    return await this.makeRequest<any>(`/matches/${matchId}/timeline/delta.json`);
  }

  // ===== PLAYERS ENDPOINTS =====

  // GET /{locale}/players/{urn_player}/profile - player profile with statistics
  async getPlayerProfile(playerId: string): Promise<SportRadarPlayer | null> {
    console.log(`👤 Getting player profile for: ${playerId}`);
    
    const response = await this.makeRequest<any>(`/players/${playerId}/profile.json`);
    
    if (response && response.player) {
      const player = response.player;
      return {
        id: player.id,
        name: player.name,
        full_name: player.full_name || player.name,
        type: player.type || 'batsman',
        date_of_birth: player.date_of_birth,
        nationality: player.nationality,
        country_code: player.country_code,
        height: player.height,
        weight: player.weight,
        jersey_number: player.jersey_number,
        statistics: this.extractPlayerStatistics(response.statistics)
      };
    }
    
    return null;
  }

  // ===== TEAMS ENDPOINTS =====

  // GET /{locale}/teams/{urn_competitor}/profile - get a team profile
  async getTeamProfile(teamId: string): Promise<SportRadarTeamProfile | null> {
    console.log(`🏏 Getting team profile for: ${teamId}`);
    
    const response = await this.makeRequest<any>(`/teams/${teamId}/profile.json`);
    
    if (response && response.competitor) {
      return {
        competitor: {
          id: response.competitor.id,
          name: response.competitor.name,
          abbreviation: response.competitor.abbreviation,
          country: response.competitor.country,
          country_code: response.competitor.country_code
        },
        players: response.players?.map((player: any) => ({
          id: player.id,
          name: player.name,
          type: player.type,
          date_of_birth: player.date_of_birth,
          nationality: player.nationality
        }))
      };
    }
    
    return null;
  }

  // GET /{locale}/teams/{urn_competitor}/results - lists results for a team
  async getTeamResults(teamId: string): Promise<any> {
    console.log(`📊 Getting team results for: ${teamId}`);
    return await this.makeRequest<any>(`/teams/${teamId}/results.json`);
  }

  // GET /{locale}/teams/{urn_competitor}/versus/{urn_competitor2}/matches - lists results and upcoming meetings between two teams
  async getHeadToHead(team1Id: string, team2Id: string): Promise<any> {
    console.log(`⚔️ Getting head-to-head for: ${team1Id} vs ${team2Id}`);
    return await this.makeRequest<any>(`/teams/${team1Id}/versus/${team2Id}/matches.json`);
  }

  // GET /{locale}/tournaments/{urn_tournament}/teams/{urn_competitor}/squads - squads for a team in a tournament
  async getTeamSquad(tournamentId: string, teamId: string): Promise<any> {
    console.log(`👥 Getting team squad for tournament: ${tournamentId}, team: ${teamId}`);
    return await this.makeRequest<any>(`/tournaments/${tournamentId}/teams/${teamId}/squads.json`);
  }

  // ===== TOURNAMENTS ENDPOINTS =====

  // GET /{locale}/tournaments - lists all tournaments
  async getTournaments(): Promise<any> {
    console.log('🏆 Getting all tournaments...');
    return await this.makeRequest<any>('/tournaments.json');
  }

  // GET /{locale}/tournaments/{urn_tournament}/info - info for a tournament
  async getTournamentInfo(tournamentId: string): Promise<SportRadarTournament | null> {
    console.log(`🏆 Getting tournament info for: ${tournamentId}`);
    return await this.makeRequest<SportRadarTournament>(`/tournaments/${tournamentId}/info.json`);
  }

  // GET /{locale}/tournaments/{urn_tournament}/results - lists results for a tournament
  async getTournamentResults(tournamentId: string): Promise<any> {
    console.log(`📊 Getting tournament results for: ${tournamentId}`);
    return await this.makeRequest<any>(`/tournaments/${tournamentId}/results.json`);
  }

  // GET /{locale}/tournaments/{urn_tournament}/leaders - leaders for a tournament
  async getTournamentLeaders(tournamentId: string): Promise<any> {
    console.log(`🏆 Getting tournament leaders for: ${tournamentId}`);
    return await this.makeRequest<any>(`/tournaments/${tournamentId}/leaders.json`);
  }

  // GET /{locale}/tournaments/{urn_tournament}/seasons - lists all seasons in a tournament
  async getTournamentSeasons(tournamentId: string): Promise<any> {
    console.log(`📅 Getting tournament seasons for: ${tournamentId}`);
    return await this.makeRequest<any>(`/tournaments/${tournamentId}/seasons.json`);
  }

  // ===== STANDINGS ENDPOINTS =====

  // GET /{locale}/tournaments/{urn_tournament}/standings - standings for a tournament
  async getTournamentStandings(tournamentId: string): Promise<SportRadarStandings | null> {
    console.log(`🏆 Getting tournament standings for: ${tournamentId}`);
    
    const response = await this.makeRequest<any>(`/tournaments/${tournamentId}/standings.json`);
    
    if (response && response.standings) {
      return {
        tournament: response.tournament,
        standings: response.standings.map((standing: any) => ({
          type: standing.type,
          groups: standing.groups?.map((group: any) => ({
            id: group.id,
            name: group.name,
            group_standings: group.group_standings?.map((team: any) => ({
              rank: team.rank,
              competitor: team.competitor,
              played: team.played,
              won: team.won,
              lost: team.lost,
              tied: team.tied,
              no_result: team.no_result,
              points: team.points,
              net_run_rate: team.net_run_rate
            }))
          }))
        }))
      };
    }
    
    return null;
  }

  // ===== TOURS ENDPOINTS =====

  // GET /{locale}/tours - lists all tours
  async getTours(): Promise<any> {
    console.log('🌍 Getting all tours...');
    return await this.makeRequest<any>('/tours.json');
  }

  // ===== COMPREHENSIVE MATCH DATA =====

  // Get enriched match data for analysis using multiple endpoints
  async getEnrichedMatchData(matchId: string): Promise<any> {
    try {
      console.log(`🔍 Getting comprehensive enriched data for match: ${matchId}`);
      
      // Get core match data sequentially to avoid rate limits
      console.log('🏏 Fetching core match data...');
      const matchSummary = await this.getMatchSummary(matchId);

      if (!matchSummary) {
        console.log('❌ No match summary found');
        return null;
      }

      console.log('👥 Fetching lineups...');
      const lineups = await this.getMatchLineups(matchId);
      
      console.log('⏱️ Fetching timeline...');
      const timeline = await this.getMatchTimeline(matchId);

      // Get team data sequentially for each team
      console.log('🏏 Fetching team data...');
      const teamData = [];
      for (const team of matchSummary.competitors.slice(0, 2)) { // Limit to 2 teams
        console.log(`📊 Getting data for team: ${team.name}`);
        const profile = await this.getTeamProfile(team.id);
        const results = await this.getTeamResults(team.id);
        
        teamData.push({
          id: team.id,
          name: team.name,
          profile,
          results,
          schedule: null // Skip schedule to reduce API calls
        });
      }

      // Get tournament data if available
      console.log('🏆 Fetching tournament data...');
      const tournament = matchSummary.tournament?.id ? 
        await this.getTournamentInfo(matchSummary.tournament.id) : null;

      // Get head-to-head data
      let headToHead = null;
      if (matchSummary.competitors.length === 2) {
        console.log('⚔️ Fetching head-to-head data...');
        headToHead = await this.getHeadToHead(
          matchSummary.competitors[0].id,
          matchSummary.competitors[1].id
        );
      }

      // Get limited player profiles to avoid rate limits
      let playerProfiles: SportRadarPlayer[] = [];
      if (lineups) {
        const allPlayers = this.extractPlayersFromLineup(lineups);
        const keyPlayers = allPlayers.slice(0, 6); // Limit to 6 key players
        console.log(`👥 Getting profiles for ${keyPlayers.length} key players`);
        
        for (const player of keyPlayers) {
          const profile = await this.getPlayerProfile(player.id);
          if (profile) {
            playerProfiles.push(profile);
          }
        }
        
        console.log(`✅ Retrieved ${playerProfiles.length} player profiles`);
      }

      console.log('✅ Successfully enriched match data with comprehensive information');
      return {
        match: matchSummary,
        lineups: lineups ? this.extractPlayersFromLineup(lineups) : [],
        timeline: timeline,
        weather: null, // Weather data would need separate API
        teamResults: teamData.filter(t => t.results !== null),
        playerProfiles,
        tournament,
        standings: null, // Skip to reduce API calls
        tournamentResults: null, // Skip to reduce API calls
        headToHead,
        teamSquads: [] // Skip to reduce API calls
      };
    } catch (error) {
      console.error('❌ Error getting enriched match data:', error);
      return null;
    }
  }

  // ===== UTILITY METHODS =====

  // Test API connection with tournaments endpoint
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing SportRadar API connection...');
      const tournaments = await this.makeRequest<any>('/tournaments.json');
      if (tournaments && tournaments.tournaments) {
        console.log('✅ SportRadar API connection successful!');
        return true;
      } else {
        console.log('❌ SportRadar API connection failed');
        return false;
      }
    } catch (error) {
      console.error('❌ SportRadar API connection test failed:', error);
      return false;
    }
  }

  // Get today's matches using multiple endpoints for comprehensive coverage
  async getTodaysMatches(): Promise<any[]> {
    console.log('📅 Getting today\'s matches with comprehensive data...');
    
    const today = new Date().toISOString().split('T')[0];
    
    // Get matches sequentially to avoid rate limits
    console.log('📅 Fetching today\'s schedule...');
    const schedule = await this.getSchedule(today);
    
    console.log('📺 Fetching live schedule...');
    const liveSchedule = await this.getLiveSchedule();
    
    let matches: any[] = [];
    
    // Combine matches from different sources
    if (schedule && schedule.sport_events && schedule.sport_events.length > 0) {
      matches = [...matches, ...schedule.sport_events];
      console.log(`📅 Found ${schedule.sport_events.length} scheduled matches for today`);
    }
    
    if (liveSchedule && liveSchedule.sport_events && liveSchedule.sport_events.length > 0) {
      // Filter out duplicates
      const liveMatches = liveSchedule.sport_events.filter(live => 
        !matches.some(existing => existing.id === live.id)
      );
      matches = [...matches, ...liveMatches];
      console.log(`📺 Found ${liveMatches.length} additional live matches`);
    }
    
    if (matches.length === 0) {
      console.log('📅 No matches found for today, returning mock matches');
      return this.getMockMatches();
    }

    // Transform and return top matches
    return matches.slice(0, 6).map(event => this.transformSportEventForUI(event));
  }

  // Clear cache method
  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ SportRadar cache cleared');
  }

  // Get cache stats
  getCacheStats(): { size: number; entries: number } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.values()).length
    };
  }

  // Helper method to transform SportRadar sport_event to our match format
  private transformSportEventToMatch(sportEvent: any, status?: any): SportRadarMatch {
    return {
      id: sportEvent.id,
      name: this.generateMatchName(sportEvent.competitors),
      start_time: sportEvent.start_time,
      start_time_confirmed: sportEvent.start_time_confirmed || false,
      status: status?.status || sportEvent.status || 'not_started',
      match_status: status?.match_status || 'not_started',
      format: this.determineFormat(sportEvent.sport_event_context?.competition?.name || ''),
      venue: {
        id: sportEvent.venue?.id || '',
        name: sportEvent.venue?.name || 'Unknown Venue',
        city_name: sportEvent.venue?.city_name || 'Unknown City',
        country_name: sportEvent.venue?.country_name || 'Unknown Country'
      },
      competitors: sportEvent.competitors?.map((comp: any) => ({
        id: comp.id,
        name: comp.name,
        abbreviation: comp.abbreviation,
        country: comp.country,
        country_code: comp.country_code,
        qualifier: comp.qualifier
      })) || [],
      coverage: {
        live: true,
        type: 'live'
      },
      tournament: {
        id: sportEvent.sport_event_context?.competition?.id || '',
        name: sportEvent.sport_event_context?.competition?.name || 'Unknown Tournament',
        category: {
          id: sportEvent.sport_event_context?.category?.id || '',
          name: sportEvent.sport_event_context?.category?.name || 'International',
          country_code: sportEvent.sport_event_context?.category?.country_code || 'INT'
        }
      },
      sport_event_context: sportEvent.sport_event_context
    };
  }

  // Helper method to generate match name from competitors
  private generateMatchName(competitors: any[]): string {
    if (!competitors || competitors.length < 2) {
      return 'Cricket Match';
    }
    return competitors.map(c => c.name).join(' vs ');
  }

  // Helper method to extract player statistics
  private extractPlayerStatistics(statistics: any): any {
    if (!statistics) return undefined;

    return {
      matches_played: statistics.matches_played || 0,
      runs_scored: statistics.runs_scored || 0,
      batting_average: statistics.batting_average || 0,
      strike_rate: statistics.strike_rate || 0,
      highest_score: statistics.highest_score || 0,
      centuries: statistics.centuries || 0,
      half_centuries: statistics.half_centuries || 0,
      wickets_taken: statistics.wickets_taken || 0,
      bowling_average: statistics.bowling_average || 0,
      economy_rate: statistics.economy_rate || 0,
      best_bowling: statistics.best_bowling || '',
      catches: statistics.catches || 0,
      stumpings: statistics.stumpings || 0,
      recent_form: statistics.recent_form || 'Unknown'
    };
  }

  // Helper method to determine format from competition name
  private determineFormat(competitionName: string): string {
    if (!competitionName || typeof competitionName !== 'string') {
      return 'T20'; // Default format
    }
    
    const name = competitionName.toLowerCase();
    if (name.includes('t20') || name.includes('twenty20')) {
      return 'T20';
    } else if (name.includes('odi') || name.includes('one day')) {
      return 'ODI';
    } else if (name.includes('test')) {
      return 'Test';
    }
    return 'T20'; // Default to T20
  }

  // Helper method to transform match for UI display
  transformMatchForUI(match: SportRadarMatch): any {
    return {
      id: match.id,
      teams: (match.competitors || []).map(c => c.name).join(' vs '),
      date: new Date(match.start_time).toLocaleDateString(),
      time: new Date(match.start_time).toLocaleTimeString(),
      format: match.format,
      venue: `${match.venue?.name || 'Unknown Venue'}, ${match.venue?.city_name || 'Unknown City'}`,
      status: match.status,
      tournament: match.tournament?.name || 'Unknown Tournament'
    };
  }

  // Helper method to extract players from lineup
  extractPlayersFromLineup(lineup: SportRadarLineup): any[] {
    const players: any[] = [];
    
    lineup.lineups.forEach(teamLineup => {
      teamLineup.players.forEach(player => {
        players.push({
          id: player.id,
          name: player.name,
          team: teamLineup.competitor.abbreviation,
          role: this.determinePlayerRole(player),
          isCaptain: player.captain || false,
          isWicketKeeper: player.wicket_keeper || false,
          isPlaying: player.starter
        });
      });
    });

    return players;
  }

  // Helper method to determine player role
  private determinePlayerRole(player: any): string {
    if (player.wicket_keeper) return 'WK';
    if (player.type === 'batsman') return 'BAT';
    if (player.type === 'bowler') return 'BOWL';
    if (player.type === 'all_rounder') return 'ALL';
    return 'BAT'; // Default
  }

  // Helper method to transform sport event for UI
  private transformSportEventForUI(event: any): any {
    return {
      id: event.id,
      teams: (event.competitors || []).map((c: any) => c.name).join(' vs '),
      date: new Date(event.start_time).toLocaleDateString(),
      time: new Date(event.start_time).toLocaleTimeString(),
      format: this.determineFormat(event.sport_event_context?.competition?.name || ''),
      venue: `${event.venue?.name || 'Unknown Venue'}, ${event.venue?.city_name || 'Unknown City'}`,
      status: event.status,
      tournament: event.sport_event_context?.competition?.name || 'Unknown Tournament'
    };
  }

  // ===== MOCK DATA METHODS =====

  private getMockSchedule(date: string): SportRadarSchedule {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return {
      generated_at: new Date().toISOString(),
      sport_events: [
        {
          id: 'sr:match:mock1',
          start_time: tomorrow.toISOString(),
          start_time_confirmed: true,
          sport_event_context: {
            sport: { id: 'sr:sport:21', name: 'Cricket' },
            category: { id: 'sr:category:1', name: 'International', country_code: 'INT' },
            competition: { id: 'sr:competition:1', name: 'T20 International', gender: 'men' },
            season: { 
              id: 'sr:season:1', 
              name: '2024', 
              start_date: '2024-01-01', 
              end_date: '2024-12-31', 
              year: '2024' 
            }
          },
          status: 'not_started',
          competitors: [
            {
              id: 'sr:competitor:142690',
              name: 'Australia',
              country: 'Australia',
              country_code: 'AUS',
              abbreviation: 'AUS',
              qualifier: 'home'
            },
            {
              id: 'sr:competitor:142648',
              name: 'England',
              country: 'England',
              country_code: 'ENG',
              abbreviation: 'ENG',
              qualifier: 'away'
            }
          ],
          venue: {
            id: 'sr:venue:1',
            name: 'Melbourne Cricket Ground',
            city_name: 'Melbourne',
            country_name: 'Australia',
            country_code: 'AUS'
          }
        }
      ]
    };
  }

  private getMockMatches(): any[] {
    return [
      {
        id: 'mock-1',
        teams: 'Australia vs England',
        date: new Date().toLocaleDateString(),
        time: '14:30',
        format: 'T20',
        venue: 'Melbourne Cricket Ground, Melbourne',
        status: 'upcoming',
        tournament: 'T20 International Series'
      },
      {
        id: 'mock-2',
        teams: 'India vs Pakistan',
        date: new Date().toLocaleDateString(),
        time: '18:00',
        format: 'ODI',
        venue: 'Wankhede Stadium, Mumbai',
        status: 'upcoming',
        tournament: 'ODI Bilateral Series'
      },
      {
        id: 'mock-3',
        teams: 'South Africa vs New Zealand',
        date: new Date().toLocaleDateString(),
        time: '16:00',
        format: 'T20',
        venue: 'Newlands, Cape Town',
        status: 'upcoming',
        tournament: 'T20 Series'
      }
    ];
  }

  private getMockMatchSummary(matchId: string): SportRadarMatch {
    const mockMatches: Record<string, SportRadarMatch> = {
      'mock-1': {
        id: 'sr:match:mock1',
        name: 'Australia vs England',
        start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        start_time_confirmed: true,
        status: 'not_started',
        match_status: 'not_started',
        format: 'T20',
        venue: {
          id: 'sr:venue:1',
          name: 'Melbourne Cricket Ground',
          city_name: 'Melbourne',
          country_name: 'Australia'
        },
        competitors: [
          {
            id: 'sr:competitor:142690',
            name: 'Australia',
            abbreviation: 'AUS',
            country: 'Australia',
            country_code: 'AUS',
            qualifier: 'home'
          },
          {
            id: 'sr:competitor:142648',
            name: 'England',
            abbreviation: 'ENG',
            country: 'England',
            country_code: 'ENG',
            qualifier: 'away'
          }
        ],
        coverage: { live: true, type: 'live' },
        tournament: {
          id: 'sr:tournament:1',
          name: 'T20 International Series',
          category: {
            id: 'sr:category:1',
            name: 'International',
            country_code: 'INT'
          }
        }
      }
    };

    return mockMatches[matchId] || mockMatches['mock-1'];
  }

  private getMockLineups(matchId: string): SportRadarLineup {
    return {
      match: {
        id: matchId,
        start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      },
      lineups: [
        {
          competitor: {
            id: 'sr:competitor:142690',
            name: 'Australia',
            abbreviation: 'AUS'
          },
          players: [
            { id: 'sr:player:1', name: 'David Warner', type: 'batsman', starter: true, captain: false, wicket_keeper: false },
            { id: 'sr:player:2', name: 'Aaron Finch', type: 'batsman', starter: true, captain: true, wicket_keeper: false },
            { id: 'sr:player:3', name: 'Steve Smith', type: 'batsman', starter: true, captain: false, wicket_keeper: false },
            { id: 'sr:player:4', name: 'Glenn Maxwell', type: 'all_rounder', starter: true, captain: false, wicket_keeper: false },
            { id: 'sr:player:5', name: 'Marcus Stoinis', type: 'all_rounder', starter: true, captain: false, wicket_keeper: false },
            { id: 'sr:player:6', name: 'Alex Carey', type: 'wicket_keeper', starter: true, captain: false, wicket_keeper: true },
            { id: 'sr:player:7', name: 'Pat Cummins', type: 'bowler', starter: true, captain: false, wicket_keeper: false },
            { id: 'sr:player:8', name: 'Mitchell Starc', type: 'bowler', starter: true, captain: false, wicket_keeper: false },
            { id: 'sr:player:9', name: 'Josh Hazlewood', type: 'bowler', starter: true, captain: false, wicket_keeper: false },
            { id: 'sr:player:10', name: 'Adam Zampa', type: 'bowler', starter: true, captain: false, wicket_keeper: false },
            { id: 'sr:player:11', name: 'Kane Richardson', type: 'bowler', starter: true, captain: false, wicket_keeper: false }
          ]
        },
        {
          competitor: {
            id: 'sr:competitor:142648',
            name: 'England',
            abbreviation: 'ENG'
          },
          players: [
            { id: 'sr:player:12', name: 'Jos Buttler', type: 'wicket_keeper', starter: true, captain: true, wicket_keeper: true },
            { id: 'sr:player:13', name: 'Jason Roy', type: 'batsman', starter: true, captain: false, wicket_keeper: false },
            { id: 'sr:player:14', name: 'Dawid Malan', type: 'batsman', starter: true, captain: false, wicket_keeper: false },
            { id: 'sr:player:15', name: 'Joe Root', type: 'batsman', starter: true, captain: false, wicket_keeper: false },
            { id: 'sr:player:16', name: 'Ben Stokes', type: 'all_rounder', starter: true, captain: false, wicket_keeper: false },
            { id: 'sr:player:17', name: 'Moeen Ali', type: 'all_rounder', starter: true, captain: false, wicket_keeper: false },
            { id: 'sr:player:18', name: 'Chris Woakes', type: 'all_rounder', starter: true, captain: false, wicket_keeper: false },
            { id: 'sr:player:19', name: 'Jofra Archer', type: 'bowler', starter: true, captain: false, wicket_keeper: false },
            { id: 'sr:player:20', name: 'Mark Wood', type: 'bowler', starter: true, captain: false, wicket_keeper: false },
            { id: 'sr:player:21', name: 'Adil Rashid', type: 'bowler', starter: true, captain: false, wicket_keeper: false },
            { id: 'sr:player:22', name: 'Tymal Mills', type: 'bowler', starter: true, captain: false, wicket_keeper: false }
          ]
        }
      ]
    };
  }
}

export const sportRadarService = new SportRadarService();