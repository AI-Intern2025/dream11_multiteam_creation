import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { team1, team2, format, venue, pitch, weather, userPredictions } = body;

    if (!team1 || !team2 || !format) {
      return NextResponse.json(
        { error: 'Team names and format are required' },
        { status: 400 }
      );
    }

    let analysisResult;
    
    try {
      // Use the existing AI service to generate analysis
      const analysisPrompt = `
        Analyze the cricket match and user predictions:
        
        Match: ${team1} vs ${team2}
        Format: ${format}
        Pitch Condition: ${pitch}
        Weather: ${weather}
        Venue: ${venue}
        
        ${userPredictions ? `User Predictions: ${JSON.stringify(userPredictions)}` : ''}
        
        Provide analysis in this JSON format:
        {
          "format": "${format}",
          "predictions": {
            "teamA": {"runsExpected": "high/medium/low", "wicketsConceded": "high/medium/low"},
            "teamB": {"runsExpected": "high/medium/low", "wicketsConceded": "high/medium/low"},
            "favoredRoles": ["BAT", "BWL", "AR", "WK"],
            "corePlayerCount": 8,
            "strategy": "Strategic recommendation based on conditions and user predictions"
          }
        }
        
        Consider:
        - ${format === 'T20' ? 'Fast-paced explosive batting vs bowling dominance' : format === 'ODI' ? 'Balanced 50-over strategy' : 'Test match endurance and skill'}
        - Pitch favoring batting or bowling
        - Weather impact on play style
        - User predictions and insights
      `;

      // Use the existing AI service for analysis
      analysisResult = await aiService.generateAnalysis(analysisPrompt);

    } catch (aiError) {
      console.error('AI service failed:', aiError);
      
      // Rule-based fallback
      analysisResult = JSON.stringify({
        format: format,
        predictions: {
          teamA: { runsExpected: "medium", wicketsConceded: "medium" },
          teamB: { runsExpected: "medium", wicketsConceded: "medium" },
          favoredRoles: ["BAT", "BWL", "AR"],
          corePlayerCount: 8,
          strategy: `For ${format} format at ${venue}, consider balanced team selection with equal focus on batting and bowling. Weather conditions (${weather}) and pitch (${pitch}) suggest standard playing conditions.`
        }
      });
    }

    // Return the analysis result as a string (the frontend will parse it)
    return NextResponse.json({ analysis: analysisResult });

  } catch (error) {
    console.error('AI analysis API error:', error);
    return NextResponse.json(
      { error: 'Internal server error during AI analysis' },
      { status: 500 }
    );
  }
}
