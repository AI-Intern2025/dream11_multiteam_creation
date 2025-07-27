"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Calendar, 
  Filter, 
  TrendingUp, 
  Trophy, 
  RefreshCw, 
  LogOut, 
  ChevronRight,
  Clock,
  MapPin,
  Zap,
  Star,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { useCricketMatches } from '@/hooks/use-cricket-data';
import { motion, AnimatePresence, Variants } from 'framer-motion';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('all');
  const { matches, loading, error, refetch } = useCricketMatches();
  const { user, isAuthenticated, loading: isLoading, logout, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen dream11-gradient-bg flex items-center justify-center">
        <div className="flex items-center space-x-3 text-white">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <span className="text-xl font-semibold">Loading Your Experience...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const filteredMatches = matches.filter((match: any) => {
    if (!match) return false;
    const lowerSearchTerm = searchTerm.toLowerCase();
    const matchesSearch = (match.teams?.toLowerCase() || '').includes(lowerSearchTerm) ||
                         (match.venue?.toLowerCase() || '').includes(lowerSearchTerm);
    const matchesFormat = selectedFormat === 'all' || match.format === selectedFormat;
    return matchesSearch && matchesFormat;
  });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const getFormatBadgeClass = (format: string) => {
    switch (format?.toUpperCase()) {
      case 'T20':
        return 'format-t20';
      case 'ODI':
        return 'format-odi';
      case 'TEST':
        return 'format-test';
      default:
        return 'format-t20';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'live':
        return 'status-live';
      case 'scheduled':
        return 'status-scheduled';
      default:
        return 'status-scheduled';
    }
  };

  return (
    <div className="min-h-screen dream11-gradient-bg">
      {/* Dream11 Inspired Header */}
      <header className="dream11-header shadow-2xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="flex items-center space-x-4"
            >
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">MultiTeam Creator</h1>
                <p className="text-white/80 text-sm">Fantasy Cricket Platform</p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="flex items-center space-x-4"
            >
              <div className="text-right text-white hidden sm:block">
                <span className="text-sm font-semibold block">Welcome, {user?.username}</span>
                <span className="text-xs text-white/70 capitalize">{user?.role} Account</span>
              </div>
              
              {isAdmin && (
                <Link href="/admin">
                  <Button className="glass-effect text-white hover:bg-white/20 border-white/20">
                    Admin Panel
                  </Button>
                </Link>
              )}
              
              <Button 
                onClick={handleLogout}
                className="glass-effect text-white hover:bg-white/20 border-white/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          
          {/* Search Section */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="dream11-card p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search matches, teams, or venues..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input pl-12 h-12 text-base"
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <select
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="search-input px-4 py-3 min-w-[140px]"
                  >
                    <option value="all">All Formats</option>
                    <option value="T20">T20</option>
                    <option value="ODI">ODI</option>
                    <option value="Test">Test</option>
                  </select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={refetch}
                    disabled={loading}
                    className="h-12 w-12 glass-effect border-border/50 hover:bg-white/10"
                  >
                    <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
              
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                >
                  <p className="text-red-400 text-sm font-medium">
                    <strong>Connection Error:</strong> {error}. Using offline data.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Platform Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="stats-card">
              <div className="flex items-center justify-between mb-3">
                <Calendar className="h-6 w-6 text-primary" />
                <Badge className="bg-primary/20 text-primary border-primary/30">Live</Badge>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{matches.length}</div>
              <div className="text-sm text-muted-foreground">Active Matches</div>
            </div>
            
            <div className="stats-card">
              <div className="flex items-center justify-between mb-3">
                <Zap className="h-6 w-6 text-accent" />
                <Badge className="bg-accent/20 text-accent border-accent/30">AI</Badge>
              </div>
              <div className="text-3xl font-bold text-white mb-1">8</div>
              <div className="text-sm text-muted-foreground">Strategies</div>
            </div>
            
            <div className="stats-card">
              <div className="flex items-center justify-between mb-3">
                <Users className="h-6 w-6 text-blue-400" />
                <Badge className="bg-blue-400/20 text-blue-400 border-blue-400/30">Teams</Badge>
              </div>
              <div className="text-3xl font-bold text-white mb-1">100+</div>
              <div className="text-sm text-muted-foreground">Per Match</div>
            </div>
            
            <div className="stats-card">
              <div className="flex items-center justify-between mb-3">
                <Star className="h-6 w-6 text-yellow-500" />
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pro</Badge>
              </div>
              <div className="text-3xl font-bold text-white mb-1">95%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <motion.div variants={itemVariants} className="text-center py-20">
              <div className="loading-shimmer">
                <RefreshCw className="h-16 w-16 text-primary mx-auto mb-6 animate-spin" />
                <div className="text-2xl font-bold text-white mb-3">Loading Cricket Data...</div>
                <p className="text-muted-foreground text-lg">Fetching latest matches and insights</p>
              </div>
            </motion.div>
          )}

          {/* Matches Grid */}
          <AnimatePresence>
            {!loading && (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredMatches.map((match: any) => (
                  <motion.div 
                    variants={itemVariants} 
                    key={match.id}
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <div className="match-card group h-full">
                      <div className="flex justify-between items-start mb-4">
                        <Badge className={getFormatBadgeClass(match.format)}>
                          {match.format}
                        </Badge>
                        <Badge className={getStatusBadgeClass(match.status)}>
                          {match.status}
                        </Badge>
                      </div>

                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold text-white mb-3 leading-tight">
                          {match.teams}
                        </h3>
                        <div className="flex items-center justify-center text-muted-foreground text-sm mb-2">
                          <MapPin className="h-4 w-4 mr-2 text-primary" />
                          <span>{match.venue}</span>
                        </div>
                        <div className="flex items-center justify-center text-muted-foreground text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-accent" />
                          <span>{match.date}</span>
                          <Clock className="h-4 w-4 ml-4 mr-2 text-accent" />
                          <span>{match.time}</span>
                        </div>
                      </div>

                      <Link href={`/match/${match.id}`}>
                        <Button className="btn-primary w-full group">
                          <span className="font-semibold">CREATE TEAMS</span>
                          <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* No Matches State */}
          {!loading && filteredMatches.length === 0 && (
            <motion.div 
              variants={itemVariants} 
              className="text-center py-20 dream11-card"
            >
              <div className="text-8xl mb-6">🏏</div>
              <div className="text-2xl font-bold text-white mb-3">No matches found</div>
              <p className="text-muted-foreground text-lg mb-8">
                {searchTerm ? 'Try adjusting your search criteria' : 'No matches available at the moment'}
              </p>
              {searchTerm && (
                <Button 
                  onClick={() => {setSearchTerm(''); setSelectedFormat('all');}}
                  className="btn-secondary"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </motion.div>
          )}

        </motion.div>
      </main>
    </div>
  );
}
