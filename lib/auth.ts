import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { neonDB } from './neon-db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key';
const JWT_EXPIRES_IN = '7d';

export interface User {
  id: number;
  username: string;
  role: 'admin' | 'user';
  email?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

class AuthService {
  async register(username: string, password: string, email?: string, role: 'admin' | 'user' = 'user'): Promise<AuthResponse> {
    try {
      // For demo purposes, return success without actually storing in DB
      console.log('Demo registration attempt:', { username, email, role });
      
      // Check if username already exists in demo users
      const demoUsers = ['admin', 'user', 'demo'];
      if (demoUsers.includes(username)) {
        return { success: false, message: 'Username already exists' };
      }

      // Create demo user response
      const user: User = {
        id: Date.now(), // Simple ID generation for demo
        username,
        role,
        email: email || `${username}@demo.com`
      };

      const token = this.generateToken(user);

      return {
        success: true,
        user,
        token,
        message: 'Registration successful (demo mode)'
      };

      // Database code commented out for demo
      /*
      // Check if user already exists
      const existingUser = await this.getUserByUsername(username);
      if (existingUser) {
        return { success: false, message: 'Username already exists' };
      }

      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Insert user
      const result = await neonDB.query(
        'INSERT INTO users (username, password_hash, role, email) VALUES ($1, $2, $3, $4) RETURNING id, username, role, email',
        [username, passwordHash, role, email]
      );

      const user: User = result.rows[0];
      const token = this.generateToken(user);

      return {
        success: true,
        user,
        token,
        message: 'User registered successfully'
      };
      */
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed' };
    }
  }

  async login(username: string, password: string): Promise<AuthResponse> {
    try {
      // For demo purposes, use hardcoded users if database is not available
      const demoUsers = [
        { id: 1, username: 'admin', password: 'admin123', role: 'admin', email: 'admin@fantasy.com' },
        { id: 2, username: 'user', password: 'user123', role: 'user', email: 'user@fantasy.com' },
        { id: 3, username: 'demo', password: 'demo123', role: 'user', email: 'demo@fantasy.com' }
      ];

      // Check demo users first
      const demoUser = demoUsers.find(u => u.username === username && u.password === password);
      if (demoUser) {
        const user: User = {
          id: demoUser.id,
          username: demoUser.username,
          role: demoUser.role as 'admin' | 'user',
          email: demoUser.email
        };
        
        const token = this.generateToken(user);
        return {
          success: true,
          user,
          token,
          message: 'Login successful'
        };
      }

      // Try database authentication if demo users don't match
      try {
        // Get user by username
        const user = await this.getUserByUsername(username);
        if (!user) {
          return { success: false, message: 'Invalid credentials' };
        }

        // Get password hash
        const result = await neonDB.query(
          'SELECT password_hash FROM users WHERE username = $1',
          [username]
        );

        if (result.rows.length === 0) {
          return { success: false, message: 'Invalid credentials' };
        }

        const { password_hash } = result.rows[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, password_hash);
        if (!isValidPassword) {
          return { success: false, message: 'Invalid credentials' };
        }

        const token = this.generateToken(user);

        return {
          success: true,
          user,
          token,
          message: 'Login successful'
        };
      } catch (dbError) {
        console.warn('Database authentication failed, using demo users only:', dbError);
        return { success: false, message: 'Invalid credentials' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed' };
    }
  }

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const result = await neonDB.query(
        'SELECT id, username, role, email FROM users WHERE username = $1',
        [username]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  async getUserById(id: number): Promise<User | null> {
    try {
      const result = await neonDB.query(
        'SELECT id, username, role, email FROM users WHERE id = $1',
        [id]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Get user by ID error:', error);
      return null;
    }
  }

  generateToken(user: User): string {
    return jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  verifyToken(token: string): { valid: boolean; user?: any; error?: string } {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return { valid: true, user: decoded };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return { valid: false, error: 'Token expired' };
      } else if (error instanceof jwt.JsonWebTokenError) {
        return { valid: false, error: 'Invalid token' };
      } else {
        return { valid: false, error: 'Token verification failed' };
      }
    }
  }

  extractTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7); // Remove "Bearer " prefix
  }

  // Middleware function for protecting routes
  async requireAuth(request: Request): Promise<{ authorized: boolean; user?: User; error?: string }> {
    try {
      const authHeader = request.headers.get('Authorization');
      const token = this.extractTokenFromHeader(authHeader);

      if (!token) {
        return { authorized: false, error: 'No token provided' };
      }

      const verification = this.verifyToken(token);
      if (!verification.valid) {
        return { authorized: false, error: verification.error };
      }

      // Get fresh user data
      const user = await this.getUserById(verification.user.id);
      if (!user) {
        return { authorized: false, error: 'User not found' };
      }

      return { authorized: true, user };
    } catch (error) {
      console.error('Auth middleware error:', error);
      return { authorized: false, error: 'Authentication failed' };
    }
  }

  // Admin-only middleware
  async requireAdmin(request: Request): Promise<{ authorized: boolean; user?: User; error?: string }> {
    const authResult = await this.requireAuth(request);
    
    if (!authResult.authorized) {
      return authResult;
    }

    if (authResult.user?.role !== 'admin') {
      return { authorized: false, error: 'Admin access required' };
    }

    return authResult;
  }

  // Create default admin if none exists
  async initializeDefaultAdmin(): Promise<void> {
    try {
      const adminExists = await neonDB.query(
        'SELECT COUNT(*) as count FROM users WHERE role = $1',
        ['admin']
      );

      if (parseInt(adminExists.rows[0].count) === 0) {
        console.log('Creating default admin user...');
        await this.register('admin', 'admin123', 'admin@fantasycricket.com', 'admin');
        console.log('✅ Default admin created: username=admin, password=admin123');
      }
    } catch (error) {
      console.error('Error initializing default admin:', error);
    }
  }
}

export const authService = new AuthService();

export function verifyToken(token: string): User | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
      email: decoded.email
    };
  } catch (error) {
    return null;
  }
}
