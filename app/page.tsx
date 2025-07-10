"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Calendar, Filter, TrendingUp, Users, Trophy, RefreshCw, Wifi, WifiOff, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useCricketMatches } from '@/hooks/use-cricket-data';
import { useAuth } from '@/hooks/use-auth';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('all');
  const { matches, loading, error, refetch } = useCricketMatches();
  const { user, isAuthenticated, isLoading, logout, isAdmin } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Loading...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const filteredMatches = matches.filter((match: any) => {
    if (!match) return false;
    const matchesSearch = (match.teams || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (match.venue || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFormat = selectedFormat === 'all' || match.format === selectedFormat;
    return matchesSearch && matchesFormat;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="gradient-bg text-white shadow-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Trophy className="h-8 w-8 text-red-400" />
              <div>
                <h1 className="text-3xl font-bold">Multi Team Creator</h1>
                <p className="text-gray-300 flex items-center space-x-2">
                  <span>Advanced Fantasy Cricket Platform</span>
                  {error ? (
                    <WifiOff className="h-4 w-4 text-red-400" />
                  ) : (
                    <Wifi className="h-4 w-4 text-green-400" />
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-right">
                <span className="text-sm font-medium block">Welcome, {user?.username}</span>
                <span className="text-xs text-gray-300 capitalize block">{user?.role} Account</span>
              </span>
              {isAdmin && (
                <Link href="/admin">
                  <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-black">
                    Admin Panel
                  </Button>
                </Link>
              )}
              <Button 
                variant="outline" 
                className="bg-transparent border-white text-white hover:bg-white hover:text-black"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
              <Link href="/analytics">
                <Button className="bg-red-600 hover:bg-red-700">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Analytics
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search and Filter Bar */}
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search matches, teams, or venues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Formats</option>
                <option value="T20">T20</option>
                <option value="ODI">ODI</option>
                <option value="Test">Test</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={refetch}
                disabled={loading}
                className="ml-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">
                <strong>Connection Error:</strong> {error}. Using offline mode.
              </p>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{matches.length}</div>
              <p className="text-xs text-muted-foreground">Active fixtures</p>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Teams Created</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Across all matches</p>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">No data yet</p>
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
            <div className="text-gray-500 text-lg">Loading live cricket data...</div>
            <p className="text-gray-400 mt-2">Fetching latest matches and analysis</p>
          </div>
        )}

        {/* Matches Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((match: any) => (
            <Card key={match.id} className="card-hover group">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {match.format}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {match.status}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold text-center">
                  {match.teams}
                </CardTitle>
                <CardDescription className="text-center">
                  {match.venue}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{match.date}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{match.time}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Teams Created:</span>
                    <span className="font-medium">0</span>
                  </div>
                  <div className="pt-2">
                    <Link href={`/match/${match.id}`}>
                      <Button className="w-full btn-primary group-hover:shadow-lg">
                        Create Teams
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        )}

        {!loading && filteredMatches.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No matches found matching your criteria</div>
            <p className="text-gray-400 mt-2">Try adjusting your search or filter options</p>
          </div>
        )}
      </main>
    </div>
  );
}