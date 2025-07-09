import { NextRequest, NextResponse } from 'next/server';
import { dataIntegrationService } from '@/lib/data-integration';

export async function GET(
  request: NextRequest,
  // Unwrap params promise for Next.js route handler
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const { id: matchId } = await params;

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
}