'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(username, password);
      if (user) {
        if (user.isAdmin) {
          router.push('/admin');
        } else {
          router.push('/');
        }
      } else {
        setError('Invalid username or password. Please check the demo credentials below.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen dream11-gradient-bg p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md dream11-card border-border/50 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-black text-primary">Welcome Back</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-bold text-muted-foreground">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="admin or user"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-input border-border focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password"  className="text-sm font-bold text-muted-foreground">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="admin123 or user123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-input border-border focus:ring-primary"
                />
              </div>
              <div className="text-xs text-muted-foreground text-center">
                <p><strong>Demo Credentials:</strong></p>
                <p>Admin: admin / admin123</p>
                <p>User: user / user123</p>
              </div>
              {error && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm font-medium text-destructive text-center"
                >
                  {error}
                </motion.p>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full btn-primary" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
