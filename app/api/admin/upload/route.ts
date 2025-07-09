import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Verify authentication and admin role
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get the uploaded file
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Read the CSV file content
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV file must contain at least header and one data row' }, { status: 400 });
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    // Determine if it's a player or match CSV based on headers
    const isPlayerCSV = headers.includes('name') && headers.includes('team') && headers.includes('role');
    const isMatchCSV = headers.includes('team1') && headers.includes('team2') && headers.includes('date');

    if (!isPlayerCSV && !isMatchCSV) {
      return NextResponse.json({ 
        error: 'Invalid CSV format. Must be either player CSV (name, team, role) or match CSV (team1, team2, date)' 
      }, { status: 400 });
    }

    let importedCount = 0;
    const errors: string[] = [];

    if (isPlayerCSV) {
      // Import players
      const { importPlayers } = await import('@/lib/neon-db');
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const playerData: any = {};
        
        headers.forEach((header, index) => {
          playerData[header] = values[index] || '';
        });

        try {
          await importPlayers([{
            name: playerData.name,
            team: playerData.team,
            role: playerData.role,
            stats: {
              runs: parseInt(playerData.runs) || 0,
              wickets: parseInt(playerData.wickets) || 0,
              catches: parseInt(playerData.catches) || 0,
              average: parseFloat(playerData.average) || 0,
              strikeRate: parseFloat(playerData.strikerate || playerData.strike_rate) || 0
            }
          }]);
          importedCount++;
        } catch (error) {
          errors.push(`Row ${i + 1}: ${(error as Error).message}`);
        }
      }
    } else if (isMatchCSV) {
      // Import matches
      const { importMatches } = await import('@/lib/neon-db');
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const matchData: any = {};
        
        headers.forEach((header, index) => {
          matchData[header] = values[index] || '';
        });

        try {
          await importMatches([{
            team1: matchData.team1,
            team2: matchData.team2,
            date: new Date(matchData.date),
            format: matchData.format || 'T20',
            venue: matchData.venue || ''
          }]);
          importedCount++;
        } catch (error) {
          errors.push(`Row ${i + 1}: ${(error as Error).message}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${importedCount} records`,
      importedCount,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 }
    );
  }
}
