"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Download, Search, Users, Trophy, TrendingUp, Target, BarChart3, Eye, RefreshCw, Sparkles, Edit, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useTeamGeneration, useMatchData } from '@/hooks/use-cricket-data';
import { useParams, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'framer-motion';

// Import all strategy wizards
import Strategy1Wizard from '@/components/strategies/Strategy1Wizard';
import Strategy2Wizard from '@/components/strategies/Strategy2Wizard';
import Strategy3Wizard from '@/components/strategies/Strategy3Wizard';
import Strategy4Wizard from '@/components/strategies/Strategy4Wizard';
import Strategy5Wizard from '@/components/strategies/Strategy5Wizard';
import Strategy6Wizard from '@/components/strategies/Strategy6Wizard';
import Strategy7Wizard from '@/components/strategies/Strategy7Wizard';
import Strategy8Wizard from '@/components/strategies/Strategy8Wizard-Enhanced';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

export default function TeamsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const { id: matchId, strategy } = useMemo(() => ({
    id: params.id as string,
    strategy: searchParams.get('strategy') || '1'
  }), [params, searchParams]);

  const teamsParam = useMemo(() => searchParams.get('teams') || '11', [searchParams]);

  const [hasGenerated, setHasGenerated] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const { teams, loading, error, generateTeams, updateTeams } = useTeamGeneration();
  const { data: matchData } = useMatchData(matchId);

  const onGenerate = async (userPreferences: any, teamCount: number) => {
    try {
      setHasGenerated(false);
      setGenerationError(null);
      const strategyId = userPreferences?.strategyId || strategy;
      const generatedTeams = await generateTeams(matchId, strategyId, teamCount, userPreferences);
      
      if (generatedTeams && generatedTeams.length > 0) {
        setHasGenerated(true);
      } else {
        setGenerationError(`Failed to generate teams using Strategy ${strategy}. Please try again or choose a different strategy.`);
      }
    } catch (err) {
      setGenerationError(`Error generating teams: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<any | null>(null);

  const exportToCSV = () => {
    if (teams.length === 0) return;
    const header = 'Team Name,Captain,Vice Captain,' + Array.from({ length: 11 }, (_, i) => `Player${i + 1}`).join(',') + ',Credits,Confidence\n';
    const csvContent = teams.map((team, index) => {
      const players = team.players || [];
      const captain = team.captain?.name || team.captain || '';
      const viceCaptain = team.viceCaptain?.name || team.viceCaptain || '';
      return [
        `Team ${index + 1}`, captain, viceCaptain,
        ...players.map((p: any) => p.name || p).slice(0, 11),
        team.totalCredits || 100, team.confidence || 75
      ].join(',');
    }).join('\n');
    const blob = new Blob([header + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `dream11_teams_${matchId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTeams = useMemo(() => teams.filter(team => {
    if (!team) return false;
    const captain = team.captain?.name || team.captain || '';
    const viceCaptain = team.viceCaptain?.name || team.viceCaptain || '';
    const players = (team.players || []).map((p: any) => p.name || p).join(' ');
    const searchText = searchTerm.toLowerCase();
    return captain.toLowerCase().includes(searchText) ||
           viceCaptain.toLowerCase().includes(searchText) ||
           players.toLowerCase().includes(searchText);
  }), [teams, searchTerm]);

  const StrategyComponent = useMemo(() => {
    switch (strategy) {
      case '1': return Strategy1Wizard;
      case '2': return Strategy2Wizard;
      case '3': return Strategy3Wizard;
      case '4': return Strategy4Wizard;
      case '5': return Strategy5Wizard;
      case '6': return Strategy6Wizard;
      case '7': return Strategy7Wizard;
      case '8': return Strategy8Wizard;
      default: return Strategy1Wizard;
    }
  }, [strategy]);

  if (loading && !hasGenerated) {
    return (
      <div className="min-h-screen main-gradient-bg flex items-center justify-center text-white">
        <div className="text-center">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
            <RefreshCw className="h-12 w-12 text-white/80 mx-auto mb-4" />
          </motion.div>
          <h2 className="text-2xl font-semibold tracking-wider animated-gradient-text">Generating AI Teams</h2>
          <p className="text-white/60 mt-2">Our AI is analyzing millions of data points...</p>
        </div>
      </div>
    );
  }

  if (!hasGenerated) {
    return (
      <div className="min-h-screen main-gradient-bg text-white">
        <AnimatePresence>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="container mx-auto px-4 py-8"
          >
            <motion.header variants={itemVariants} className="flex items-center justify-between mb-8">
              <Link href={`/match/${matchId}`}>
                <Button variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 transition-colors">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Strategy Selection
                </Button>
              </Link>
            </motion.header>
            
            {generationError ? (
              <motion.div variants={itemVariants} className="text-center p-8 bg-red-500/20 rounded-2xl shadow-lg backdrop-blur-md max-w-2xl mx-auto">
                <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-red-300">Generation Failed</h2>
                <p className="text-white/70 mt-2 mb-6">{generationError}</p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => { setGenerationError(null); setHasGenerated(false); }} className="btn-primary">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                  <Link href={`/match/${matchId}`}>
                    <Button variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 transition-colors">
                      Change Strategy
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ) : (
              <StrategyComponent matchId={matchId} onGenerate={onGenerate} teamCount={parseInt(teamsParam)} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen main-gradient-bg text-white">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-4 py-8"
      >
        <motion.header variants={itemVariants} className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex items-center space-x-4">
            <Link href={`/match/${matchId}`}>
              <Button variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight animated-gradient-text">Your Generated Teams</h1>
              <p className="text-white/70 flex items-center space-x-2">
                <span>{teams.length} AI teams via Strategy {strategy}</span>
                <Sparkles className="h-4 w-4 text-yellow-300" />
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={exportToCSV} className="btn-primary">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </motion.header>

        <motion.main variants={itemVariants}>
          <Tabs defaultValue="teams" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/5 border-white/10 p-1 h-auto rounded-lg">
              <TabsTrigger value="teams" className="data-[state=active]:bg-white/10 data-[state=active]:text-white rounded-md">Teams</TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-white/10 data-[state=active]:text-white rounded-md">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="teams" className="mt-6">
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <Input
                  placeholder="Search by captain, vice-captain, or player..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 w-full bg-white/10 border-white/20 h-12 text-base rounded-lg"
                />
              </div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredTeams.map((team, index) => (
                  <motion.div key={team.id || index} variants={itemVariants}>
                    <Card className="bg-white/5 border-white/10 h-full card-hover backdrop-blur-sm flex flex-col">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{team.name || `Team ${index + 1}`}</CardTitle>
                          <Badge variant="secondary" className="bg-white/10 text-white/80">{team.riskProfile || 'Balanced'}</Badge>
                        </div>
                        <CardDescription className="text-white/60 pt-2">
                          <div><strong>C:</strong> {team.captain?.name || team.captain}</div>
                          <div><strong>VC:</strong> {team.viceCaptain?.name || team.viceCaptain}</div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow flex flex-col justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTeam(team)}
                          className="w-full bg-white/10 border-white/20 hover:bg-white/20"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Team
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              {/* Analytics content here */}
            </TabsContent>
          </Tabs>
        </motion.main>
      </motion.div>

      <AnimatePresence>
        {selectedTeam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedTeam(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900/80 border border-white/20 rounded-2xl shadow-2xl w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl animated-gradient-text">{selectedTeam.name || 'Team Details'}</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedTeam(null)}><XCircle /></Button>
                </div>
                <CardDescription className="text-white/60">
                  <strong>C:</strong> {selectedTeam.captain?.name || selectedTeam.captain}, <strong>VC:</strong> {selectedTeam.viceCaptain?.name || selectedTeam.viceCaptain}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(selectedTeam.players || []).map((player: any, index: number) => (
                    <div key={index} className="bg-white/5 p-3 rounded-lg flex items-center gap-3">
                       <div className="text-lg">{player.role === 'Wicketkeeper' ? '🧤' : player.role === 'Batsman' ? '🏏' : '⚾️'}</div>
                       <div>
                        <p className="font-semibold">{player.name || player}</p>
                        <p className="text-sm text-white/50">{player.role || 'Player'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}