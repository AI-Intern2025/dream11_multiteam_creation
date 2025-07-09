'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: number;
  username: string;
  role: 'admin' | 'user';
  email?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export const useAuth = (): AuthContextType => {
  const [user, setUser] = React.useState<User | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    // Check for stored authentication data
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  // Auto-redirect based on authentication (but not for login page redirects)
  React.useEffect(() => {
    if (!isLoading && pathname !== '/login') {
      // Redirect to login if not authenticated
      if (!user || !token) {
        router.push('/login');
        return;
      }

      // Redirect non-admin users away from admin routes
      if (user.role !== 'admin' && pathname.startsWith('/admin')) {
        router.push('/');
        return;
      }
    }
  }, [user, token, isLoading, pathname, router]);

  return {
    user,
    token,
    isLoading,
    login,
    logout,
    isAuthenticated: !!(user && token),
    isAdmin: user?.role === 'admin'
  };
};
