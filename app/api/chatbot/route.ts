import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/ai-service-enhanced';
import { neonDB } from '@/lib/neon-db';

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
      // Get match data from Neon DB
      const match = await neonDB.getMatchById(parseInt(matchId));
      
      if (match) {
        response = await aiService.generateChatbotResponse(
          message,
          match,
          context || {}
        );
      } else {
        response = "I'd be happy to help with your team selection! However, I couldn't fetch the match data at the moment.";
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