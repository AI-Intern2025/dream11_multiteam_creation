import { NextRequest, NextResponse } from 'next/server';
import { neonDB } from '@/lib/neon-db';
import { dataIntegrationService } from '@/lib/data-integration';
import { authService } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching matches from Neon DB...');

    // Check if user is authenticated (optional for viewing matches)
    const authHeader = request.headers.get('Authorization');
    let isAuthenticated = false;
    let user = null;

    if (authHeader) {
      const authResult = await authService.requireAuth(request);
      isAuthenticated = authResult.authorized;
      user = authResult.user;
    }

    // Get matches from Neon DB
    let matches;
    try {
      matches = await neonDB.getActiveMatches();
      console.log(`✅ Found ${matches.length} matches in Neon DB`);
    } catch (dbError) {
      console.warn('⚠️ Neon DB not available, falling back to SportRadar');
      // Fallback to original SportRadar integration
      matches = await dataIntegrationService.getAllMatches();
    }

    // Transform matches to the expected format
    const transformedMatches = matches.map(match => {
      // Handle both Neon DB format and SportRadar format
      if ('team_name' in match) {
        // Neon DB format
        return {
          id: match.id.toString(),
          teams: match.team_name,
          date: match.match_date instanceof Date ? match.match_date.toISOString().split('T')[0] : match.match_date,
          time: match.start_time,
          format: match.match_format,
          venue: match.match_venue,
          status: match.status,
          isActive: match.is_active,
          isUpcoming: match.is_upcoming,
          conditions: {
            venue: match.venue_condition,
            pitch: match.pitch_condition,
            weather: match.weather_condition
          }
        };
      } else {
        // SportRadar format (fallback)
        return {
          id: match.id || Math.random().toString(),
          teams: match.competitors ? 
            `${match.competitors[0]?.name || 'Team A'} vs ${match.competitors[1]?.name || 'Team B'}` :
            match.name || 'Match',
          date: match.start_time ? new Date(match.start_time).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          time: match.start_time ? new Date(match.start_time).toTimeString().split(' ')[0] : '00:00:00',
          format: match.format || 'T20',
          venue: match.venue?.name || 'TBD',
          status: match.status || 'Scheduled',
          isActive: true,
          isUpcoming: true,
          conditions: {
            venue: 'Neutral',
            pitch: 'Balanced',
            weather: 'Clear'
          }
        };
      }
    });

    return NextResponse.json({
      success: true,
      data: transformedMatches,
      message: `Found ${transformedMatches.length} matches`,
      authenticated: isAuthenticated,
      user: user ? { id: user.id, username: user.username, role: user.role } : null,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error fetching matches:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch matches',
        message: error instanceof Error ? error.message : 'Unknown error',
        data: []
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication for creating matches
    const authResult = await authService.requireAdmin(request);
    if (!authResult.authorized) {
      return NextResponse.json(
        { 
          success: false, 
          message: authResult.error || 'Admin access required' 
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      team_name, 
      match_venue, 
      match_date, 
      match_format, 
      start_time, 
      end_time,
      venue_condition, 
      pitch_condition, 
      weather_condition 
    } = body;

    // Validate required fields
    if (!team_name || !match_venue || !match_date || !match_format || !start_time) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Missing required fields: team_name, match_venue, match_date, match_format, start_time' 
        },
        { status: 400 }
      );
    }

    const match = await neonDB.insertMatch({
      team_name,
      match_venue,
      match_date: new Date(match_date),
      match_format,
      is_active: true,
      start_time,
      end_time,
      is_upcoming: true,
      status: 'Scheduled',
      venue_condition: venue_condition || 'Neutral',
      pitch_condition: pitch_condition || 'Balanced',
      weather_condition: weather_condition || 'Clear'
    });

    return NextResponse.json({
      success: true,
      data: match,
      message: 'Match created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating match:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create match',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}