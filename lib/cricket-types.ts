// Generic cricket data interfaces to replace SportRadar types
export interface CricketMatch {
  id: string;
  name: string;
  team_name?: string;  // Original team name format
  team_a_name?: string;  // Parsed team A name
  team_b_name?: string;  // Parsed team B name
  match_venue?: string;
  pitch_condition?: string;
  weather_condition?: string;
  venue_condition?: string;
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

export interface CricketPlayer {
  id: string;
  name: string;
  full_name?: string;
  team_name?: string;  // Added team name for team filtering
  role?: string;  // Added role property
  credits?: number;  // Added credits property
  is_active?: boolean;  // Added active status
  date_of_birth?: string;
  nationality?: string;
  country_code?: string;
  type?: string;
  jersey_number?: number;
  statistics?: {
    batting?: {
      matches: number;
      innings: number;
      runs: number;
      balls_faced: number;
      strike_rate: number;
      average: number;
      highest_score: number;
      centuries: number;
      half_centuries: number;
      fours: number;
      sixes: number;
      not_outs: number;
    };
    bowling?: {
      matches: number;
      innings: number;
      overs: number;
      balls: number;
      runs_conceded: number;
      wickets: number;
      economy_rate: number;
      average: number;
      strike_rate: number;
      best_figures: string;
      four_wickets: number;
      five_wickets: number;
      maidens: number;
    };
    fielding?: {
      matches: number;
      catches: number;
      run_outs: number;
      stumpings: number;
    };
  };
  playing_role?: string;
  batting_style?: string;
  bowling_style?: string;
}

export interface EnrichedMatchData {
  match: CricketMatch;
  players?: CricketPlayer[];  // Added players array
  lineups: any[];
  timeline: any;
  weather: any;
  teamResults: any[];
  playerProfiles: CricketPlayer[];
  tournament: any;
  standings: any;
  tournamentResults: any;
  headToHead: any;
  teamSquads: any[];
  analysis?: any;
}
