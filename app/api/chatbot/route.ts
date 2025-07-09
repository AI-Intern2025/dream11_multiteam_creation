import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/ai-service';
import { dataIntegrationService } from '@/lib/data-integration';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, matchId, context } = body;

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          error: 'Message is required'
        },
        { status: 400 }
      );
    }

    let response = '';

    if (matchId) {
      // Get match analysis for context
      const enrichedData = await dataIntegrationService.getEnrichedMatchData(matchId);
      
      if (enrichedData) {
        response = await aiService.generateChatbotResponse(
          message,
          enrichedData.match,
          enrichedData.analysis
        );
      } else {
        response = "I'd be happy to help with your team selection! However, I couldn't fetch the latest match data at the moment.";
      }
    } else {
      // General cricket advice without specific match context
      response = await aiService.generateChatbotResponse(
        message,
        context || {},
        {} as any
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        response,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error generating chatbot response:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate response',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}