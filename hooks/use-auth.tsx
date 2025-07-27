'use client';

// hooks/use-auth.tsx
import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';

// User type matching the database structure
export interface User {
  id: number;
  username: string;
  role: string;
  email?: string;
  isAdmin: boolean;
}

// Auth service using the API
const authService = {
  login: async (username: string, password: string): Promise<User | null> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (result.success) {
        const user = result.user;
        // Store user data and token in localStorage
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', result.token);
        return user;
      } else {
        console.error('Login failed:', result.message);
        return null;
      }
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  },

  logout: async (): Promise<void> => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  },

  getCurrentUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        const token = authService.getToken();
        
        // If we have a user and token, verify the token is still valid
        if (currentUser && token) {
          // You could add token verification here if needed
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid data
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const loggedInUser = await authService.login(username, password);
      setUser(loggedInUser);
      return loggedInUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin ?? false,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
