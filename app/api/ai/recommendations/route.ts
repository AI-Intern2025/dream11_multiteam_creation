import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/ai-service-enhanced';
import { neonDB } from '@/lib/neon-db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { matchId, preferences } = body;

    if (!matchId) {
      return NextResponse.json(
        { success: false, message: 'Match ID is required' },
        { status: 400 }
      );
    }

    // Get match data from Neon DB
    const match = await neonDB.getMatchById(parseInt(matchId));
    if (!match) {
      return NextResponse.json(
        { success: false, message: 'Match not found' },
        { status: 404 }
      );
    }

    // Get players for this match
    const players = await neonDB.getPlayingPlayersForMatch(parseInt(matchId));
    if (players.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No players found for this match' },
        { status: 404 }
      );
    }

    // Get AI recommendations
    const recommendations = await aiService.generateAIPlayerRecommendations(parseInt(matchId));

    return NextResponse.json({
      success: true,
      data: {
        match,
        players: players.length,
        recommendations,
        analysis_timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error getting AI recommendations:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to get AI recommendations',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get('matchId');

    if (!matchId) {
      return NextResponse.json(
        { success: false, message: 'Match ID is required' },
        { status: 400 }
      );
    }

    // Get match analysis
    const match = await neonDB.getMatchById(parseInt(matchId));
    if (!match) {
      return NextResponse.json(
        { success: false, message: 'Match not found' },
        { status: 404 }
      );
    }

    const analysis = await neonDB.getMatchConditionsAnalysis(parseInt(matchId));

    return NextResponse.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    console.error('❌ Error getting match analysis:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to get match analysis',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
