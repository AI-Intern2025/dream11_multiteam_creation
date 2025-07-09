"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Download, Search, Users, Trophy, TrendingUp, Target, BarChart3, Eye, RefreshCw, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useTeamGeneration, useMatchData, useChatbot } from '@/hooks/use-cricket-data';
import { useParams, useSearchParams } from 'next/navigation';

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
  const {
    teams,
    loading,
    error,
    generateTeams
  } = useTeamGeneration();
  const { data: matchData } = useMatchData(matchId);

  // Handler to trigger team generation from wizard
  const onGenerate = async (userPreferences: any, teamCount: number) => {
    setHasGenerated(false);
    await generateTeams(matchId, 'strategy1', teamCount, userPreferences);
    setHasGenerated(true);
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);

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

  // If no teams generated yet, show AI chatbot wizard
  if (!hasGenerated) {
    return (
      <Strategy1Wizard matchId={matchId} onGenerate={onGenerate} />
    );
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
            <Button className="bg-red-600 hover:bg-red-700">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
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
                      <CardTitle className="text-lg">{team.name || team.teamName || `Team ${team.id || 'Unknown'}`}</CardTitle>
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
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          Edit
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
                        {teams.find(t => t.id === selectedTeam)?.players?.map((player: any, index: number) => (
                          <tr key={index} className="border-b">
                            <td className="p-2 font-medium">{
                              player?.name || `Player ${index + 1}`
                            }</td>
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
                        ))}
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

// Strategy 1: AI-Guided Chatbot Wizard
function Strategy1Wizard({ matchId, onGenerate }: { matchId: string; onGenerate: (prefs: any, count: number) => void }) {
  const [selectedPills, setSelectedPills] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [messages, setMessages] = useState<{ sender: 'user' | 'ai'; text: string }[]>([]);
  const { sendMessage, loading: chatbotLoading, error: chatbotError } = useChatbot();
  const [teamCount, setTeamCount] = useState(10);
  const [stage, setStage] = useState<'pills' | 'analysis' | 'distribution'>('pills');
  const pillOptions = ['Balance Bat/Bowl', 'Aggressive Batting', 'All-round Strength', 'Pitch-friendly Picks', 'Weather-proof Picks'];
  // Fetch match analysis for default captaincy options
  const { data: matchData } = useMatchData(matchId);
  const capAnalysis = matchData?.analysis?.captaincy;
  const defaultCombos = capAnalysis ? [
    { captain: capAnalysis.primary.name, viceCaptain: capAnalysis.secondary.name, percentage: 50 },
    { captain: capAnalysis.secondary.name, viceCaptain: capAnalysis.primary.name, percentage: 50 }
  ] : [];
  const [combos, setCombos] = useState<{ captain: string; viceCaptain: string; percentage: number }[]>(defaultCombos);

  const handlePillClick = (pill: string) => {
    if (!selectedPills.includes(pill)) setSelectedPills([...selectedPills, pill]);
  };
  const handleRemovePill = (pill: string) => setSelectedPills(selectedPills.filter(p => p !== pill));
  const handleAddCustom = () => {
    if (customInput) {
      setSelectedPills([...selectedPills, customInput]);
      setCustomInput('');
    }
  };

  const handleAnalyze = async () => {
    const userMsg = `Preferences: ${selectedPills.join(', ')}.`;
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    const aiResp = await sendMessage(userMsg, matchId, null);
    setMessages(prev => [...prev, { sender: 'ai', text: aiResp }]);
    setStage('distribution');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">AI-Guided Team Creation Assistant</h2>
      <p className="mb-2">Select preferences or add your own:</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {pillOptions.map(p => (
          <Button key={p} variant={selectedPills.includes(p) ? 'secondary' : 'outline'} onClick={() => handlePillClick(p)}>
            {p}
          </Button>
        ))}
      </div>
      <div className="flex items-center gap-2 mb-4">
        <Input placeholder="Custom preference" value={customInput} onChange={e => setCustomInput(e.target.value)} className="flex-1" />
        <Button onClick={handleAddCustom}>Add</Button>
      </div>
      <div className="mb-4">
        {selectedPills.map(p => (
          <Badge key={p} className="mr-2 cursor-pointer" onClick={() => handleRemovePill(p)}>
            {p} ×
          </Badge>
        ))}
      </div>
      <div className="mb-4">
        <label className="block mb-1">Number of Teams:</label>
        <Input type="number" min={1} max={20} value={teamCount} onChange={e => setTeamCount(parseInt(e.target.value) || 1)} />
      </div>
      {stage === 'pills' && (
        <Button onClick={handleAnalyze} disabled={chatbotLoading} className="mb-4">
          {chatbotLoading ? 'Analyzing...' : 'Get Recommendations'}
        </Button>
      )}
      {chatbotError && <div className="text-red-500 mb-2">{chatbotError}</div>}
      {stage === 'analysis' || stage === 'distribution' ? (
       <div className="bg-gray-100 p-4 rounded space-y-2 h-64 overflow-y-auto">
         {messages.map((m, i) => (
           <div key={i} className={m.sender === 'user' ? 'text-right' : 'text-left'}>
             <span className={`inline-block p-2 rounded ${m.sender === 'user' ? 'bg-blue-200' : 'bg-gray-200'}`}>{m.text}</span>
           </div>
         ))}
       </div>
      ) : null}
      {stage === 'distribution' && combos.length > 0 && (
        <div className="mt-4 bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Captain/Vice-Captain Distribution:</h3>
          {combos.map((c, idx) => (
            <div key={idx} className="flex items-center mb-2">
              <span className="mr-2">C: {c.captain}, VC: {c.viceCaptain}</span>
              <Input type="number" min={0} max={100} value={c.percentage}
                onChange={e => {
                  const val = parseInt(e.target.value) || 0;
                  setCombos(prev => prev.map((item, i) => i === idx ? { ...item, percentage: val } : item));
                }}
                className="w-16 mr-2" />
              %
            </div>
          ))}
          <Button onClick={() => onGenerate({ aiPrompt: messages.find(m => m.sender==='ai')?.text, distribution: combos }, teamCount)}>
            Finalize Teams
          </Button>
        </div>
      )}
    </div>
  );
}