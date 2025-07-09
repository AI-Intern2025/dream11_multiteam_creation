import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';

// Import the dummy data script
import { insertDummyData } from '@/scripts/insert-dummy-data';

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const verification = authService.verifyToken(token);
    
    if (!verification.valid || !verification.user || verification.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    // Check if dummy data already exists
    const { force = false } = await request.json().catch(() => ({}));
    
    console.log('🚀 Starting dummy data insertion...');
    
    // Run the dummy data insertion script
    const result = await insertDummyData();

    return NextResponse.json({
      success: true,
      message: 'Dummy data inserted successfully',
      data: result
    });

  } catch (error) {
    console.error('❌ Error inserting dummy data:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to insert dummy data',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
