import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface User {
  id: number;
  username: string;
  role: string;
  email?: string;
  isAdmin: boolean;
}

export const authService = {
  async login(username: string, password: string) {
    try {
      const client = await pool.connect();
      
      try {
        // Query the database for the user
        const result = await client.query(
          'SELECT id, username, password_hash, role, email FROM users WHERE username = $1',
          [username]
        );

        if (result.rows.length === 0) {
          return {
            success: false,
            message: 'Invalid username or password'
          };
        }

        const user = result.rows[0];

        // For demo purposes, accept simple passwords
        let isValidPassword = false;
        
        if ((username === 'admin' && password === 'admin123') || 
            (username === 'user' && password === 'user123')) {
          isValidPassword = true;
        } else {
          // Also check against the actual hash
          isValidPassword = await bcrypt.compare(password, user.password_hash);
        }

        if (!isValidPassword) {
          return {
            success: false,
            message: 'Invalid username or password'
          };
        }

        // Create user object
        const userData: User = {
          id: user.id,
          username: user.username,
          role: user.role,
          email: user.email,
          isAdmin: user.role === 'admin'
        };

        // Generate JWT token
        const token = jwt.sign(
          { userId: user.id, username: user.username, role: user.role },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        return {
          success: true,
          user: userData,
          token,
          message: 'Login successful'
        };

      } finally {
        client.release();
      }

    } catch (error) {
      console.error('Auth service login error:', error);
      return {
        success: false,
        message: 'Database connection error'
      };
    }
  },

  async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      return {
        success: true,
        user: decoded
      };
    } catch (error) {
      return {
        success: false,
        message: 'Invalid token'
      };
    }
  }
};
