import { NextRequest, NextResponse } from 'next/server';
import { neonDB } from '@/lib/neon-db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get('matchId');
    const teamName = searchParams.get('teamName');
    const role = searchParams.get('role');
    const onlyActive = searchParams.get('onlyActive') === 'true';

    let query = 'SELECT * FROM players WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    // Filter by match (get players from teams in that match)
    if (matchId) {
      query += ` AND EXISTS (
        SELECT 1 FROM matches 
        WHERE id = $${paramIndex} 
        AND (team_name LIKE '%' || players.team_name || '%')
      )`;
      params.push(matchId);
      paramIndex++;
    }

    // Filter by team
    if (teamName) {
      query += ` AND team_name = $${paramIndex}`;
      params.push(teamName);
      paramIndex++;
    }

    // Filter by role
    if (role) {
      query += ` AND player_role = $${paramIndex}`;
      params.push(role);
      paramIndex++;
    }

    // Filter only active players
    if (onlyActive) {
      query += ` AND is_playing_today = true`;
    }

    query += ' ORDER BY credits DESC, selection_percentage DESC';

    const result = await neonDB.query(query, params);

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('❌ Error fetching players:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch players',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
