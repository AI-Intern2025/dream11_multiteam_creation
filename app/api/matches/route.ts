import { NextRequest, NextResponse } from 'next/server';
import { dataIntegrationService } from '@/lib/data-integration';

export async function GET(request: NextRequest) {
  try {
    const matches = await dataIntegrationService.getAllMatches();
    
    return NextResponse.json({
      success: true,
      data: matches,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching matches:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch matches',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}