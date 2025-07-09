import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions, updateUserRole, getAllUsers } from "@/lib/auth";

// Promote a user to admin by email
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only existing admins can promote others
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user exists by email
    const users = await getAllUsers();
    const userToPromote = users.find(user => user.email.toLowerCase() === email.toLowerCase());
    
    if (!userToPromote) {
      return NextResponse.json({ 
        error: 'User not found. The user must sign in with Google at least once before being promoted to admin.' 
      }, { status: 404 });
    }

    // Promote user to admin
    const result = await updateUserRole(userToPromote.id, 'admin');
    
    if (result.success) {
      return NextResponse.json({ 
        message: `Successfully promoted ${email} to admin`,
        user: userToPromote 
      });
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
