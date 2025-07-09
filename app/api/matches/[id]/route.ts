import { NextRequest, NextResponse } from 'next/server';
import { dataIntegrationService } from '@/lib/data-integration';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const matchId = params.id;
    
    // Validate matchId
    if (!matchId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Match ID is required'
        },
        { status: 400 }
      );
    }

    console.log(`🔍 Fetching match data for ID: ${matchId}`);
    
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

    const enrichedData = await dataIntegrationService.getEnrichedMatchData(matchId);
    
    if (!enrichedData) {
      console.log(`❌ No match data found for ID: ${matchId}`);
      return NextResponse.json(
        {
          success: false,
          error: 'Match not found',
          message: 'The requested match could not be found or is not available.'
        },
        { status: 404 }
      );
    }

    console.log(`✅ Successfully fetched match data for ID: ${matchId}`);
    return NextResponse.json({
      success: true,
      data: enrichedData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching match data:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      // Check for network/timeout errors
      if (error.message.includes('timeout') || error.message.includes('ECONNRESET')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Service timeout',
            message: 'The request timed out. Please try again in a moment.',
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
    }
    
    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred while fetching match data. Please try again.',
        retryable: true,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}