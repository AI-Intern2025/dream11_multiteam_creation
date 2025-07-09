import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { Pool } from "pg";

// Create a PostgreSQL connection pool for Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        // Get user role from database on first sign in
        const dbUser = await getUserByEmail(user.email!);
        if (dbUser) {
          token.role = dbUser.role;
        } else {
          // Create new user with default role
          await createUserWithRole(user.id, user.email!, 'user');
          token.role = 'user';
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user && token) {
        session.user.id = token.sub!;
        session.user.role = token.role || 'user';
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // Check if user exists and get their role
          const existingUser = await getUserByEmail(user.email!);
          
          if (!existingUser) {
            // New user - assign default role as 'user'
            await createUserWithRole(user.id, user.email!, 'user');
          }
          
          return true;
        } catch (error) {
          console.error('Error during sign in:', error);
          return false;
        }
      }
      return true;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
};

// Helper functions for user role management
async function getUserByEmail(email: string) {
  try {
    const result = await pool.query(
      'SELECT id, email, role FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
}

async function getUserWithRole(userId: string) {
  try {
    const result = await pool.query(
      'SELECT id, email, role FROM users WHERE id = $1',
      [userId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching user with role:', error);
    return null;
  }
}

async function createUserWithRole(userId: string, email: string, role: string = 'user') {
  try {
    // Generate a simple user ID based on email
    const userIdFromEmail = email.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    
    await pool.query(
      'INSERT INTO users (id, email, role) VALUES ($1, $2, $3) ON CONFLICT (email) DO UPDATE SET role = $3',
      [userIdFromEmail, email, role]
    );
  } catch (error) {
    console.error('Error creating user with role:', error);
  }
}

// Function to update user role (for admin use)
export async function updateUserRole(userId: string, role: 'user' | 'admin') {
  try {
    await pool.query(
      'UPDATE users SET role = $2 WHERE id = $1',
      [userId, role]
    );
    return { success: true };
  } catch (error) {
    console.error('Error updating user role:', error);
    return { success: false, error: 'Failed to update user role' };
  }
}

// Function to get all users (for admin use)
export async function getAllUsers() {
  try {
    const result = await pool.query(
      'SELECT id, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}
