import { NextRequest, NextResponse } from 'next/server';
import { neonDB, Player } from '@/lib/neon-db';
import { authService } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const verification = authService.verifyToken(token);
    
    if (!verification.valid || !verification.user || verification.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { players } = body;

    if (!players || !Array.isArray(players)) {
      return NextResponse.json(
        { success: false, message: 'Players array is required' },
        { status: 400 }
      );
    }

    // Validate player data structure
    for (const player of players) {
      if (!player.name || !player.team_name || !player.player_role || 
          player.credits === undefined || player.selection_percentage === undefined ||
          player.points === undefined) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Invalid player data. Required fields: name, team_name, player_role, credits, selection_percentage, points' 
          },
          { status: 400 }
        );
      }
    }

    // Insert players into database
    const insertedPlayers = [];
    for (const player of players) {
      const result = await neonDB.query(
        `INSERT INTO players (
          name, full_name, team_name, player_role, credits, 
          selection_percentage, points, is_playing_today, country, 
          batting_style, bowling_style
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
        RETURNING *`,
        [
          player.name,
          player.full_name || player.name,
          player.team_name,
          player.player_role,
          player.credits,
          player.selection_percentage,
          player.points,
          player.is_playing_today !== false, // Default to true
          player.country || player.team_name,
          player.batting_style || 'Unknown',
          player.bowling_style || 'Unknown'
        ]
      );
      insertedPlayers.push(result.rows[0]);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${insertedPlayers.length} players`,
      data: insertedPlayers
    });

  } catch (error) {
    console.error('❌ Error uploading players:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to upload players',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const verification = authService.verifyToken(token);
    
    if (!verification.valid || !verification.user || verification.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get all players
    const result = await neonDB.query('SELECT * FROM players ORDER BY team_name, name');
    
    return NextResponse.json({
      success: true,
      data: result.rows
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

export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const verification = authService.verifyToken(token);
    
    if (!verification.valid || !verification.user || verification.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Player ID is required' },
        { status: 400 }
      );
    }

    // Build dynamic update query
    const setFields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined) {
        setFields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (setFields.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No fields to update' },
        { status: 400 }
      );
    }

    values.push(id);
    const query = `UPDATE players SET ${setFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    
    const result = await neonDB.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Player not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Player updated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error updating player:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update player',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const verification = authService.verifyToken(token);
    
    if (!verification.valid || !verification.user || verification.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Player ID is required' },
        { status: 400 }
      );
    }

    const result = await neonDB.query('DELETE FROM players WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Player not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Player deleted successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error deleting player:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete player',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
