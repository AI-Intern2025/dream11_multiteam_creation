'use client';

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';

export interface User {
  id: number;
  username: string;
  role: string;
  email?: string;
  isAdmin: boolean;
}

// API-based auth service
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

      const data = await response.json();

      if (data.success && data.user && data.token) {
        // Store token and user data
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data.user;
      }

      return null;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  getCurrentUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('auth_token');
    
    if (!userStr || !token) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
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
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    const loggedInUser = await authService.login(username, password);
    setUser(loggedInUser);
    setLoading(false);
    return loggedInUser;
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

  return React.createElement(AuthContext.Provider, { value }, children);
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
