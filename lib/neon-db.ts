import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export interface Match {
  id: number;
  team_name: string;
  match_venue: string;
  match_date: Date;
  match_format: string;
  is_active: boolean;
  start_time: string;
  end_time?: string;
  is_upcoming: boolean;
  status: string;
  venue_condition: string;
  pitch_condition: string;
  weather_condition: string;
}

export interface Player {
  id: number;
  name: string;
  full_name: string;
  team_name: string;
  player_role: string;
  credits: number;
  selection_percentage: number;
  points: number;
  is_playing_today: boolean;
  country: string;
  batting_style: string;
  bowling_style: string;
}

class NeonDBService {
  async query(text: string, params?: any[]) {
    const client = await pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  // Match operations
  async getAllMatches(): Promise<Match[]> {
    const result = await this.query('SELECT * FROM matches ORDER BY match_date ASC');
    return result.rows;
  }

  async getActiveMatches(): Promise<Match[]> {
    const result = await this.query('SELECT * FROM matches WHERE is_active = true ORDER BY match_date ASC');
    return result.rows;
  }

  async getUpcomingMatches(): Promise<Match[]> {
    const result = await this.query('SELECT * FROM matches WHERE is_upcoming = true ORDER BY match_date ASC');
    return result.rows;
  }

  async getMatchById(id: number): Promise<Match | null> {
    const result = await this.query('SELECT * FROM matches WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async insertMatch(match: Omit<Match, 'id'>): Promise<Match> {
    const query = `
      INSERT INTO matches (team_name, match_venue, match_date, match_format, is_active, start_time, end_time, is_upcoming, status, venue_condition, pitch_condition, weather_condition)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    const values = [
      match.team_name, match.match_venue, match.match_date, match.match_format,
      match.is_active, match.start_time, match.end_time, match.is_upcoming,
      match.status, match.venue_condition, match.pitch_condition, match.weather_condition
    ];
    const result = await this.query(query, values);
    return result.rows[0];
  }

  // Player operations
  async getAllPlayers(): Promise<Player[]> {
    const result = await this.query('SELECT * FROM players ORDER BY credits DESC');
    return result.rows;
  }

  async getPlayersByTeam(teamName: string): Promise<Player[]> {
    const result = await this.query('SELECT * FROM players WHERE team_name = $1 ORDER BY credits DESC', [teamName]);
    return result.rows;
  }

  async getPlayingPlayersForMatch(matchId: number): Promise<Player[]> {
    // Get match teams first
    const match = await this.getMatchById(matchId);
    if (!match) return [];

    const teams = match.team_name.split(' vs ');
    const result = await this.query(
      'SELECT * FROM players WHERE team_name = ANY($1) AND is_playing_today = true ORDER BY credits DESC',
      [teams]
    );
    return result.rows;
  }

  async insertPlayer(player: Omit<Player, 'id'>): Promise<Player> {
    const query = `
      INSERT INTO players (name, full_name, team_name, player_role, credits, selection_percentage, points, is_playing_today, country, batting_style, bowling_style)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    const values = [
      player.name, player.full_name, player.team_name, player.player_role,
      player.credits, player.selection_percentage, player.points, player.is_playing_today,
      player.country, player.batting_style, player.bowling_style
    ];
    const result = await this.query(query, values);
    return result.rows[0];
  }

  async updatePlayer(id: number, updates: Partial<Player>): Promise<Player | null> {
    const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = [id, ...Object.values(updates)];
    
    const query = `UPDATE players SET ${setClause} WHERE id = $1 RETURNING *`;
    const result = await this.query(query, values);
    return result.rows[0] || null;
  }

  // Analytics operations
  async getPlayerFormAnalysis(playerId: number): Promise<any> {
    const result = await this.query(`
      SELECT 
        p.*,
        CASE 
          WHEN points > 50 THEN 'Excellent'
          WHEN points > 30 THEN 'Good'
          WHEN points > 15 THEN 'Average'
          ELSE 'Poor'
        END as form_rating
      FROM players p WHERE id = $1
    `, [playerId]);
    return result.rows[0];
  }

  async getMatchConditionsAnalysis(matchId: number): Promise<any> {
    const result = await this.query(`
      SELECT 
        *,
        CASE 
          WHEN pitch_condition = 'Spin-friendly' THEN 'Favor spinners and batting-friendly'
          WHEN pitch_condition = 'Seam-friendly' THEN 'Favor fast bowlers'
          WHEN pitch_condition = 'Flat' THEN 'Batting paradise'
          WHEN pitch_condition = 'Bouncy' THEN 'Favor fast bowlers and aggressive batsmen'
          ELSE 'Neutral conditions'
        END as pitch_analysis,
        CASE 
          WHEN weather_condition = 'Overcast' THEN 'Favor swing bowlers'
          WHEN weather_condition = 'Clear' THEN 'Good for batting'
          WHEN weather_condition = 'Humid' THEN 'Slower wicket, favor spinners'
          WHEN weather_condition = 'Rainy' THEN 'Reduced overs, favor power hitters'
          ELSE 'Standard conditions'
        END as weather_analysis
      FROM matches WHERE id = $1
    `, [matchId]);
    return result.rows[0];
  }
}

// Bulk import functions for admin uploads
export async function importPlayers(players: Array<{
  name: string;
  team: string;
  role: string;
  stats: {
    runs?: number;
    wickets?: number;
    catches?: number;
    average?: number;
    strikeRate?: number;
  };
}>): Promise<void> {
  for (const player of players) {
    await neonDB.query(
      'INSERT INTO players (name, team, role, runs, wickets, catches, average, strike_rate) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [
        player.name,
        player.team,
        player.role,
        player.stats.runs || 0,
        player.stats.wickets || 0,
        player.stats.catches || 0,
        player.stats.average || 0,
        player.stats.strikeRate || 0
      ]
    );
  }
}

export async function importMatches(matches: Array<{
  team1: string;
  team2: string;
  date: Date;
  format?: string;
  venue?: string;
}>): Promise<void> {
  for (const match of matches) {
    await neonDB.query(
      'INSERT INTO matches (team1, team2, date, format, venue) VALUES ($1, $2, $3, $4, $5)',
      [
        match.team1,
        match.team2,
        match.date.toISOString(),
        match.format || 'T20',
        match.venue || ''
      ]
    );
  }
}

export const neonDB = new NeonDBService();
