import { NextRequest, NextResponse } from 'next/server';
import { dataIntegrationService } from '@/lib/data-integration';

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body',
          message: 'Request body must be valid JSON.'
        },
        { status: 400 }
      );
    }

    const { matchId, strategy, teamCount, userPreferences } = body;

    // Validate required parameters
    if (!matchId || !strategy || !teamCount) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters',
          message: 'matchId, strategy, and teamCount are required.',
          required: ['matchId', 'strategy', 'teamCount']
        },
        { status: 400 }
      );
    }

    // Validate teamCount
    const parsedTeamCount = parseInt(teamCount);
    if (isNaN(parsedTeamCount) || parsedTeamCount < 1 || parsedTeamCount > 50) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid team count',
          message: 'Team count must be a number between 1 and 50.'
        },
        { status: 400 }
      );
    }

    console.log(`🔍 Generating ${parsedTeamCount} teams for match ${matchId} with strategy ${strategy}`);

    // Check if required API keys are configured
    const requiredKeys = ['SPORTRADAR_API_KEY', 'OPENAI_API_KEY', 'GEMINI_API_KEY'];
    const missingKeys = requiredKeys.filter(key => !process.env[key]);
    
    if (missingKeys.length > 0) {
      console.warn(`⚠️ Missing API keys: ${missingKeys.join(', ')}`);
      return NextResponse.json(
        {
          success: false,
          error: 'API configuration incomplete',
          message: `Missing required API keys: ${missingKeys.join(', ')}. Please check your .env.local file.`,
          missingKeys
        },
        { status: 503 }
      );
    }

    const teams = await dataIntegrationService.generateTeamsWithStrategy(
      matchId,
      strategy,
      parsedTeamCount,
      userPreferences
    );

    if (!teams || teams.length === 0) {
      console.log(`❌ No teams generated for match ${matchId}`);
      return NextResponse.json(
        {
          success: false,
          error: 'Team generation failed',
          message: 'Unable to generate teams. This may be due to insufficient match data or API issues.',
          retryable: true
        },
        { status: 422 }
      );
    }

    console.log(`✅ Successfully generated ${teams.length} teams for match ${matchId}`);
    return NextResponse.json({
      success: true,
      data: {
        teams,
        strategy,
        teamCount: teams.length,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Error generating teams:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      // Check for network/timeout errors
      if (error.message.includes('timeout') || error.message.includes('ECONNRESET')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Service timeout',
            message: 'The request timed out while generating teams. Please try again.',
            retryable: true
          },
          { status: 504 }
        );
      }
      
      // Check for API key errors
      if (error.message.includes('401') || error.message.includes('403') || error.message.includes('authentication')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Authentication failed',
            message: 'API authentication failed. Please check your API keys configuration.',
            retryable: false
          },
          { status: 401 }
        );
      }
      
      // Check for rate limit errors
      if (error.message.includes('429') || error.message.includes('rate limit')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Rate limit exceeded',
            message: 'API rate limit exceeded. Please try again later.',
            retryable: true
          },
          { status: 429 }
        );
      }

      // Check for insufficient data errors
      if (error.message.includes('insufficient') || error.message.includes('no data')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Insufficient data',
            message: 'Not enough match data available to generate teams. Please try a different match.',
            retryable: false
          },
          { status: 422 }
        );
      }
    }
    
    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred while generating teams. Please try again.',
        retryable: true,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}