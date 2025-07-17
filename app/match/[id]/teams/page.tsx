"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Download, Search, Users, Trophy, TrendingUp, Target, BarChart3, Eye, RefreshCw, Sparkles, Edit } from 'lucide-react';
import Link from 'next/link';
import { useTeamGeneration, useMatchData, useChatbot } from '@/hooks/use-cricket-data';
import { useParams, useSearchParams } from 'next/navigation';
import Strategy1Wizard from '@/components/strategies/Strategy1Wizard';
import Strategy2Wizard from '@/components/strategies/Strategy2Wizard';
import Strategy3Wizard from '@/components/strategies/Strategy3Wizard';
import Strategy4Wizard from '@/components/strategies/Strategy4Wizard';
import Strategy5Wizard from '@/components/strategies/Strategy5Wizard';
import Strategy6Wizard from '@/components/strategies/Strategy6Wizard';
import Strategy7Wizard from '@/components/strategies/Strategy7Wizard';
import Strategy8Wizard from '@/components/strategies/Strategy8Wizard';
import { getStrategyComponent } from '@/components/strategies';

export default function TeamsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  // Convert Next.js proxy params to plain object to avoid sync-access warnings
  const { id: matchId } = React.useMemo(() => JSON.parse(JSON.stringify(params)), [params]);
  const { strategy, teams: teamsParam } = React.useMemo(
    () => JSON.parse(JSON.stringify(Object.fromEntries(searchParams.entries()))),
    [searchParams]
  );

  // State to control strategy wizard and generation
  const [hasGenerated, setHasGenerated] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const {
    teams,
    loading,
    error,
    generateTeams,
    updateTeams
  } = useTeamGeneration();
  const { data: matchData } = useMatchData(matchId);

  // Handler to trigger team generation from wizard
  const onGenerate = async (userPreferences: any, teamCount: number) => {
    try {
      setHasGenerated(false);
      setGenerationError(null);
      const strategyName = userPreferences?.strategy || strategy || 'strategy1';
      const generatedTeams = await generateTeams(matchId, strategyName, teamCount, userPreferences);
      
      if (generatedTeams && generatedTeams.length > 0) {
        setHasGenerated(true);
      } else {
        setGenerationError(`Failed to generate teams using ${strategy} strategy. Please try again or choose a different strategy.`);
      }
    } catch (err) {
      setGenerationError(`Error generating teams: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [bulkEditFrom, setBulkEditFrom] = useState('');
  const [bulkEditTo, setBulkEditTo] = useState('');
  const [allPlayers, setAllPlayers] = useState<any[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<any[]>([]);

  // CSV Export Function
  const exportToCSV = () => {
    if (teams.length === 0) {
      alert('No teams to export');
      return;
    }

    const csvContent = teams.map((team, index) => {
      const players = team.players || [];
      const captain = team.captain?.name || team.captain || team.captainName || '';
      const viceCaptain = team.viceCaptain?.name || team.viceCaptain || team.viceCaptainName || '';
      
      return [
        `Team ${index + 1}`,
        captain,
        viceCaptain,
        ...players.map((p: any) => p.name || p).slice(0, 11),
        team.totalCredits || 100,
        team.confidence || 75
      ].join(',');
    }).join('\n');

    const header = 'Team Name,Captain,Vice Captain,Player1,Player2,Player3,Player4,Player5,Player6,Player7,Player8,Player9,Player10,Player11,Credits,Confidence\n';
    const finalContent = header + csvContent;

    const blob = new Blob([finalContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `fantasy_teams_${matchId}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fetch all available players for bulk edit
  useEffect(() => {
    const fetchAllPlayers = async () => {
      if (matchData?.match?.id) {
        try {
          const matchName = matchData.match.team_name as string;
          const [team1Name, team2Name] = matchName.split(' vs ');
          
          const res1 = await fetch(`/api/players?matchId=${matchData.match.id}&teamName=${encodeURIComponent(team1Name)}&onlyActive=true`);
          const { data: d1 } = await res1.json();
          const res2 = await fetch(`/api/players?matchId=${matchData.match.id}&teamName=${encodeURIComponent(team2Name)}&onlyActive=true`);
          const { data: d2 } = await res2.json();
          
          setAllPlayers([...(d1 || []), ...(d2 || [])]);
        } catch (error) {
          console.error('Error fetching players:', error);
        }
      }
    };
    
    fetchAllPlayers();
  }, [matchData]);

  // Extract selected players from generated teams
  useEffect(() => {
    if (teams.length > 0) {
      const allSelectedPlayers = new Set<string>();
      teams.forEach(team => {
        team.players?.forEach((player: any) => {
          const playerName = player.name || player;
          allSelectedPlayers.add(playerName);
        });
        // Also add captain and vice-captain
        const captainName = team.captain?.name || team.captain;
        const viceCaptainName = team.viceCaptain?.name || team.viceCaptain;
        if (captainName) allSelectedPlayers.add(captainName);
        if (viceCaptainName) allSelectedPlayers.add(viceCaptainName);
      });
      
      // Convert to array and find player objects
      const selectedPlayersList = Array.from(allSelectedPlayers).map(playerName => {
        const playerObj = allPlayers.find(p => (p.name || p) === playerName);
        return playerObj || { name: playerName };
      });
      
      setSelectedPlayers(selectedPlayersList);
    }
  }, [teams, allPlayers]);

  // Bulk Edit Functions
  const handleTeamSelection = (teamId: string) => {
    setSelectedTeams(prev => 
      prev.includes(teamId) 
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleSelectAllTeams = () => {
    setSelectedTeams(teams.map(team => team.id));
  };

  const handleDeselectAllTeams = () => {
    setSelectedTeams([]);
  };

  const applyBulkEdit = () => {
    if (!bulkEditFrom || !bulkEditTo || selectedTeams.length === 0) {
      alert('Please select teams and players for bulk edit');
      return;
    }

    if (bulkEditFrom === bulkEditTo) {
      alert('Please select different players for swap');
      return;
    }

    // Apply bulk edit logic - swap players in selected teams
    const updatedTeams = teams.map(team => {
      if (selectedTeams.includes(team.id)) {
        const updatedPlayers = team.players?.map((player: any) => {
          const playerName = player.name || player;
          if (playerName === bulkEditFrom) {
            return typeof player === 'string' ? bulkEditTo : { ...player, name: bulkEditTo };
          } else if (playerName === bulkEditTo) {
            return typeof player === 'string' ? bulkEditFrom : { ...player, name: bulkEditFrom };
          }
          return player;
        }) || [];

        // Also update captain and vice-captain if they were swapped
        let updatedCaptain = team.captain;
        let updatedViceCaptain = team.viceCaptain;
        
        const captainName = team.captain?.name || team.captain;
        const viceCaptainName = team.viceCaptain?.name || team.viceCaptain;
        
        if (captainName === bulkEditFrom) {
          updatedCaptain = typeof team.captain === 'string' ? bulkEditTo : { ...team.captain, name: bulkEditTo };
        } else if (captainName === bulkEditTo) {
          updatedCaptain = typeof team.captain === 'string' ? bulkEditFrom : { ...team.captain, name: bulkEditFrom };
        }
        
        if (viceCaptainName === bulkEditFrom) {
          updatedViceCaptain = typeof team.viceCaptain === 'string' ? bulkEditTo : { ...team.viceCaptain, name: bulkEditTo };
        } else if (viceCaptainName === bulkEditTo) {
          updatedViceCaptain = typeof team.viceCaptain === 'string' ? bulkEditFrom : { ...team.viceCaptain, name: bulkEditFrom };
        }

        return {
          ...team,
          players: updatedPlayers,
          captain: updatedCaptain,
          viceCaptain: updatedViceCaptain
        };
      }
      return team;
    });

    // Actually update the teams state
    updateTeams(updatedTeams);
    
    alert(`Successfully swapped ${bulkEditFrom} with ${bulkEditTo} in ${selectedTeams.length} teams`);
    setShowBulkEdit(false);
    setBulkEditFrom('');
    setBulkEditTo('');
    setSelectedTeams([]);
  };

  // Skip auto-generate; strategy is managed via wizard

  const filteredTeams = teams.filter(team => {
    if (!team) return false;

    // Handle different possible team structures
    const teamName = team.name || team.teamName || `Team ${team.id || Math.random()}`;
    const captain = team.captain?.name || team.captain || team.captainName || '';
    const viceCaptain = team.viceCaptain?.name || team.viceCaptain || team.viceCaptainName || '';

    return (
      teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      captain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      viceCaptain.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Debug logging to understand the teams structure
  useEffect(() => {
    if (teams.length > 0) {
      console.log('Teams data structure:', teams[0]);
      console.log('Available team properties:', Object.keys(teams[0] || {}));
    }
  }, [teams]);

  // If no teams generated yet, show appropriate strategy wizard
  if (!hasGenerated) {
    // Show error if generation failed
    if (generationError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <header className="gradient-bg text-white shadow-xl">
            <div className="container mx-auto px-4 py-6">
              <div className="flex items-center space-x-4">
                <Link href={`/match/${matchId}`}>
                  <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-black">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold">Team Generation Error</h1>
                  <p className="text-gray-300">Strategy {strategy} failed to generate teams</p>
                </div>
              </div>
            </div>
          </header>
          <main className="container mx-auto px-4 py-8">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-red-600">Generation Failed</CardTitle>
                <CardDescription>There was an issue generating teams with the selected strategy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-700">{generationError}</p>
                  </div>
                  <div className="flex gap-4">
                    <Button onClick={() => { setGenerationError(null); setHasGenerated(false); }} className="flex-1">
                      Try Again
                    </Button>
                    <Link href={`/match/${matchId}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        Choose Different Strategy
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      );
    }

    // Strategy routing logic
    switch (strategy) {
      case 'ai-guided':
      case 'strategy1':
      case 'ai-assistant':
        return <Strategy1Wizard matchId={matchId} onGenerate={onGenerate} />;
      
      case 'same-xi':
      case 'strategy2':
      case 'captain-rotation':
        return <Strategy2Wizard matchId={matchId} onGenerate={onGenerate} />;
      
      case 'differential':
      case 'strategy3':
      case 'score-prediction':
        return <Strategy3Wizard matchId={matchId} onGenerate={onGenerate} />;
      
      case 'core-hedge':
      case 'strategy4':
      case 'core-differential':
        return <Strategy4Wizard matchId={matchId} onGenerate={onGenerate} />;
      
      case 'stats-driven':
      case 'strategy5':
      case 'analytics-based':
        return <Strategy5Wizard matchId={matchId} onGenerate={onGenerate} />;
      
      case 'preset-scenarios':
      case 'strategy6':
      case 'templates':
        return <Strategy6Wizard matchId={matchId} onGenerate={onGenerate} />;
      
      case 'role-split':
      case 'strategy7':
      case 'lineup-optimization':
        return <Strategy7Wizard matchId={matchId} onGenerate={onGenerate} />;
      
      case 'base-edit':
      case 'strategy8':
      case 'iterative-editing':
        return <Strategy8Wizard matchId={matchId} onGenerate={onGenerate} />;
      
      default:
        // Default to AI-guided assistant for any unrecognized strategy
        return <Strategy1Wizard matchId={matchId} onGenerate={onGenerate} />;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="gradient-bg text-white shadow-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/match/${matchId}`}>
                <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-black">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Generated Teams</h1>
                <p className="text-gray-300 flex items-center space-x-2">
                  <span>{teamsParam || 10} AI-optimized teams using {strategy || 'strategy'}</span>
                  <Sparkles className="h-4 w-4 text-yellow-400" />
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={exportToCSV}
                className="bg-red-600 hover:bg-red-700"
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button 
                onClick={() => setShowBulkEdit(!showBulkEdit)}
                variant="outline" 
                className="bg-transparent border-white text-white hover:bg-white hover:text-black"
              >
                <Edit className="mr-2 h-4 w-4" />
                Bulk Edit
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
            <div className="text-gray-500 text-lg">Generating AI-optimized teams...</div>
            <p className="text-gray-400 mt-2">Analyzing player form, conditions, and match dynamics</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-red-500 text-lg">Error generating teams</div>
            <p className="text-gray-400 mt-2">{error}</p>
            <Button
              onClick={async () => {
                setHasGenerated(false);
                await generateTeams(matchId, 'strategy1', teamsParam || 10, {});
                setHasGenerated(true);
              }}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Bulk Edit Panel */}
        {showBulkEdit && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800">Bulk Edit Teams</CardTitle>
              <CardDescription>Select teams and swap players across multiple teams at once</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="text-sm font-medium">Selected: {selectedTeams.length} teams</div>
                  <Button 
                    onClick={handleSelectAllTeams} 
                    variant="outline" 
                    size="sm"
                  >
                    Select All
                  </Button>
                  <Button 
                    onClick={handleDeselectAllTeams} 
                    variant="outline" 
                    size="sm"
                  >
                    Deselect All
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Replace Player (from selected teams):</label>
                    <Select value={bulkEditFrom} onValueChange={setBulkEditFrom}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select player to replace" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedPlayers.map((player, index) => (
                          <SelectItem key={index} value={player.name || player}>
                            {player.name || player}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">With Player (from all available):</label>
                    <Select value={bulkEditTo} onValueChange={setBulkEditTo}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select replacement player" />
                      </SelectTrigger>
                      <SelectContent>
                        {allPlayers.map((player, index) => (
                          <SelectItem key={index} value={player.name || player}>
                            {player.name || player}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button 
                    onClick={applyBulkEdit}
                    disabled={!bulkEditFrom || !bulkEditTo || selectedTeams.length === 0}
                  >
                    Apply Changes
                  </Button>
                  <Button 
                    onClick={() => setShowBulkEdit(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="teams" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* Teams Tab */}
          <TabsContent value="teams" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search teams, captains, or players..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline">
                    View All
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* AI Analysis Summary */}
            {matchData?.analysis && !loading && (
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Sparkles className="h-5 w-5 text-green-500" />
                    <span className="font-semibold">AI Analysis Applied</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Teams generated using live match data, player form analysis, weather conditions, and AI predictions. 
                    Match type: <strong>{matchData.analysis.matchPrediction?.matchType}</strong>, 
                    Predicted winner: <strong>{matchData.analysis.matchPrediction?.winnerPrediction}</strong>
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Teams Grid */}
            {!loading && teams.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeams.map((team) => (
                <Card key={team.id || Math.random()} className="card-hover">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {showBulkEdit && (
                          <Checkbox
                            checked={selectedTeams.includes(team.id)}
                            onCheckedChange={() => handleTeamSelection(team.id)}
                          />
                        )}
                        <CardTitle className="text-lg">{team.name || team.teamName || `Team ${team.id || 'Unknown'}`}</CardTitle>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">{team.strategy || 'AI Generated'}</Badge>
                        <Badge variant="outline" className={
                          (team.riskProfile || 'balanced') === 'conservative' ? 'text-green-600' :
                          (team.riskProfile || 'balanced') === 'aggressive' ? 'text-red-600' : 'text-blue-600'
                        }>
                          {team.riskProfile || 'balanced'}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>
                      <div className="space-y-1">
                        <div><strong>C:</strong> {
                          team.captain?.name || team.captain || team.captainName || 'TBD'
                        }</div>
                        <div><strong>VC:</strong> {
                          team.viceCaptain?.name || team.viceCaptain || team.viceCaptainName || 'TBD'
                        }</div>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>AI Confidence:</span>
                        <span className="font-medium">{team.confidence || 75}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Strategy:</span>
                        <span className="font-medium text-blue-600">{team.strategy || 'AI Generated'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Risk Profile:</span>
                        <span className={`font-medium ${
                          (team.riskProfile || 'balanced') === 'conservative' ? 'text-green-600' :
                          (team.riskProfile || 'balanced') === 'aggressive' ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          {team.riskProfile || 'balanced'}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTeam(team.id)}
                          className="flex-1"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              </div>
            )}

            {/* Team Detail Modal */}
            {selectedTeam && (
              <Card className="mt-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Team {selectedTeam} Details</CardTitle>
                    <Button variant="outline" onClick={() => setSelectedTeam(null)}>
                      Close
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Player</th>
                          <th className="text-left p-2">Role</th>
                          <th className="text-left p-2">Reason</th>
                          <th className="text-left p-2">Confidence</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teams.find(t => t.id === selectedTeam)?.players?.map((player: any, index: number) => {
                          const selectedTeamData = teams.find(t => t.id === selectedTeam);
                          const isCaptain = selectedTeamData?.captain?.name === player.name || selectedTeamData?.captain === player.name;
                          const isViceCaptain = selectedTeamData?.viceCaptain?.name === player.name || selectedTeamData?.viceCaptain === player.name;
                          
                          return (
                            <tr key={index} className="border-b">
                              <td className="p-2 font-medium">
                                {player?.name || `Player ${index + 1}`}
                                {isCaptain && <span className="ml-2 text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-bold">(C)</span>}
                                {isViceCaptain && <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-bold">(VC)</span>}
                              </td>
                              <td className="p-2">{
                                player?.player_role || player?.role || 'Unknown'
                              }</td>
                              <td className="p-2 text-sm">{
                                player?.reason || 'AI recommended'
                              }</td>
                              <td className="p-2">{
                                player?.confidence || 75
                              }%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {!loading && teams.length === 0 && !error && (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">No teams generated yet</div>
                <p className="text-gray-400 mt-2">Use the strategy selection to create AI-optimized teams</p>
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Summary of Teams Created</CardTitle>
                <CardDescription>AI-powered portfolio analytics and team insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800">AI Optimization</h4>
                    <p className="text-2xl font-bold text-blue-600">Active</p>
                    <p className="text-sm text-blue-600">Live data integration</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800">Strategy Diversity</h4>
                    <p className="text-2xl font-bold text-green-600">{new Set(teams.map(t => t.riskProfile)).size}</p>
                    <p className="text-sm text-green-600">Risk profiles used</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-800">Avg Confidence</h4>
                    <p className="text-2xl font-bold text-purple-600">
                      {teams.length > 0 ? Math.round(teams.reduce((acc, t) => acc + t.confidence, 0) / teams.length) : 0}%
                    </p>
                    <p className="text-sm text-purple-600">AI prediction confidence</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{teams.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {teams.length > 0 ? Math.round(teams.reduce((acc, t) => acc + t.confidence, 0) / teams.length) : 0}%
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Strategies Used</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{new Set(teams.map(t => t.strategy)).size}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Top Player</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">
                    {teams.length > 0 ? teams[0]?.captain || 'N/A' : 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">Most selected</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>AI Strategy Analysis</CardTitle>
                <CardDescription>Breakdown of AI-generated team strategies and risk profiles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Risk Profile Distribution</h4>
                    <div className="flex flex-wrap gap-2">
                      {['conservative', 'balanced', 'aggressive'].map((profile) => {
                        const count = teams.filter(t => t.riskProfile === profile).length;
                        return count > 0 ? (
                          <Badge key={profile} variant="outline" className={
                            profile === 'conservative' ? 'text-green-600' :
                            profile === 'aggressive' ? 'text-red-600' : 'text-blue-600'
                          }>
                            {profile}: {count}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Captain Variety</h4>
                    <div className="text-2xl font-bold text-blue-600">
                      {new Set(teams.map(t => t.captain)).size} different captains
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Strategy Types</h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(new Set(teams.map(t => t.strategy))).map((strategy) => (
                        <Badge key={strategy} variant="default">{strategy}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Fantasy Performance Tracker</CardTitle>
                <CardDescription>AI-powered performance prediction and analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">AI Confidence</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          {teams.length > 0 ? Math.round(teams.reduce((acc, t) => acc + t.confidence, 0) / teams.length) : 0}%
                        </div>
                        <p className="text-xs text-gray-500">Average prediction confidence</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Strategy Diversity</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-lg font-bold">{new Set(teams.map(t => t.riskProfile)).size}/3</div>
                        <p className="text-xs text-gray-500">Risk profiles covered</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Data Integration</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-600">Live</div>
                        <p className="text-xs text-gray-500">Real-time cricket data</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Live Performance Tracking</h3>
                    <p className="text-gray-500">Real-time performance data and AI insights will appear here once the match begins</p>
                    <p className="text-sm text-gray-400 mt-2">Track team performance, rank changes, and AI prediction accuracy</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}