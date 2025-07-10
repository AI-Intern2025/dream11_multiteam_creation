"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMatchData } from '@/hooks/use-cricket-data';

interface Strategy4WizardProps {
  matchId: string;
  onGenerate: (prefs: any, count: number) => void;
}

export default function Strategy4Wizard({ matchId, onGenerate }: Strategy4WizardProps) {
  const { data: matchData } = useMatchData(matchId);
  const [teamCount, setTeamCount] = useState(12);
  const [stage, setStage] = useState<'selection' | 'captaincy' | 'summary'>('selection');
  
  const [selections, setSelections] = useState({
    core: [] as any[], // 75%+ of teams
    hedge: [] as any[], // ~50% of teams  
    differential: [] as any[], // 1-2 teams
  });
  
  const [captainOrder, setCaptainOrder] = useState<string[]>([]);
  const [players1, setPlayers1] = useState<any[]>([]);
  const [players2, setPlayers2] = useState<any[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);

  const matchName = matchData?.match?.team_name || 'Team A vs Team B';
  const [team1Name, team2Name] = matchName.split(' vs ');

  // Fetch active players per team
  useEffect(() => {
    if (!matchData?.match?.id) return;
    
    async function fetchPlayers() {
      setLoadingPlayers(true);
      try {
        const res1 = await fetch(`/api/players?matchId=${matchData.match.id}&teamName=${encodeURIComponent(team1Name)}&onlyActive=true`);
        const { data: d1 } = await res1.json();
        const res2 = await fetch(`/api/players?matchId=${matchData.match.id}&teamName=${encodeURIComponent(team2Name)}&onlyActive=true`);
        const { data: d2 } = await res2.json();
        setPlayers1(d1 || []);
        setPlayers2(d2 || []);
      } catch (error) {
        console.error('Error fetching players:', error);
      }
      setLoadingPlayers(false);
    }
    
    fetchPlayers();
  }, [matchData, team1Name, team2Name]);

  const addToSelection = (player: any, type: 'core' | 'hedge' | 'differential') => {
    // Remove from other categories first
    setSelections(prev => ({
      core: prev.core.filter(p => p.id !== player.id),
      hedge: prev.hedge.filter(p => p.id !== player.id),
      differential: prev.differential.filter(p => p.id !== player.id),
      [type]: [...prev[type], player]
    }));
  };

  const removeFromSelection = (playerId: number, type: 'core' | 'hedge' | 'differential') => {
    setSelections(prev => ({
      ...prev,
      [type]: prev[type].filter(p => p.id !== playerId)
    }));
  };

  const getPlayerCategory = (playerId: number) => {
    if (selections.core.some(p => p.id === playerId)) return 'core';
    if (selections.hedge.some(p => p.id === playerId)) return 'hedge';
    if (selections.differential.some(p => p.id === playerId)) return 'differential';
    return null;
  };

  const handleSavePlan = () => {
    setStage('captaincy');
  };

  const handleGenerateTeams = () => {
    const strategyData = {
      selections,
      captainOrder,
      teamNames: { team1: team1Name, team2: team2Name }
    };
    onGenerate(strategyData, teamCount);
  };

  if (loadingPlayers) {
    return <div className="container mx-auto p-4">Loading players...</div>;
  }

  if (stage === 'selection') {
    return (
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Core-Hedge Player Selection</h2>
          <p className="text-gray-600 mb-4">
            Build your player pool by categorizing players into core picks, hedge options, and differentials.
          </p>
        </div>

        {/* Selection Categories Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-green-700">Core Players (75%+ teams)</CardTitle>
              <CardDescription className="text-xs">Safe, high-ownership picks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{selections.core.length}</div>
              <p className="text-xs text-gray-500">Selected players</p>
            </CardContent>
          </Card>
          
          <Card className="border-yellow-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-yellow-700">Hedge Players (~50% teams)</CardTitle>
              <CardDescription className="text-xs">Balanced risk-reward</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{selections.hedge.length}</div>
              <p className="text-xs text-gray-500">Selected players</p>
            </CardContent>
          </Card>
          
          <Card className="border-red-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-red-700">Differentials (1-2 teams)</CardTitle>
              <CardDescription className="text-xs">High-risk, low-ownership</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{selections.differential.length}</div>
              <p className="text-xs text-gray-500">Selected players</p>
            </CardContent>
          </Card>
        </div>

        {/* Player Selection Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[
            { players: players1, teamName: team1Name, color: 'blue' },
            { players: players2, teamName: team2Name, color: 'red' }
          ].map(({ players, teamName, color }, colIdx) => (
            <Card key={colIdx}>
              <CardHeader className={`${color === 'blue' ? 'bg-blue-50' : 'bg-red-50'} rounded-t-lg`}>
                <CardTitle className={`text-lg ${color === 'blue' ? 'text-blue-800' : 'text-red-800'}`}>
                  {teamName}
                </CardTitle>
                <CardDescription>{players.length} active players</CardDescription>
              </CardHeader>
              <CardContent className="p-0 max-h-96 overflow-y-auto">
                {players.map((player: any) => {
                  const category = getPlayerCategory(player.id);
                  
                  return (
                    <div key={player.id} className={`p-3 border-b hover:bg-gray-50 ${
                      category ? 'bg-gray-50' : ''
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{player.name}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-3">
                            <span>{player.player_role}</span>
                            <span>Pts: {player.points}</span>
                            <span>Cr: {player.credits}</span>
                            <span>Sel: {player.selection_percentage}%</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {category && (
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${
                                category === 'core' ? 'bg-green-100 text-green-700' :
                                category === 'hedge' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}
                            >
                              {category}
                            </Badge>
                          )}
                          
                          {category ? (
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => removeFromSelection(player.id, category)}
                            >
                              ×
                            </Button>
                          ) : (
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => addToSelection(player, 'core')}
                                className="text-xs px-2 py-1 text-green-600 border-green-300"
                              >
                                Core
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => addToSelection(player, 'hedge')}
                                className="text-xs px-2 py-1 text-yellow-600 border-yellow-300"
                              >
                                Hedge
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => addToSelection(player, 'differential')}
                                className="text-xs px-2 py-1 text-red-600 border-red-300"
                              >
                                Diff
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 flex justify-between items-center">
          <Button variant="outline" onClick={() => window.history.back()}>
            Back to Match
          </Button>
          <Button 
            onClick={handleSavePlan}
            disabled={selections.core.length === 0 && selections.hedge.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Save Plan & Set Captains
          </Button>
        </div>
      </div>
    );
  }

  if (stage === 'captaincy') {
    const allSelectedPlayers = [...selections.core, ...selections.hedge, ...selections.differential];
    
    return (
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Captain & Vice-Captain Order</h2>
          <p className="text-gray-600 mb-4">
            Order your preferred captains from most to least preferred. This will influence team generation.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Captain Priority Order</CardTitle>
            <CardDescription>Drag to reorder or click to add/remove</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Available Players */}
              <div>
                <h4 className="font-medium mb-3">Available Players</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {allSelectedPlayers
                    .filter(p => !captainOrder.includes(p.name))
                    .map((player) => (
                      <div key={player.id} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
                        <div>
                          <div className="font-medium text-sm">{player.name}</div>
                          <div className="text-xs text-gray-500">{player.player_role} • {player.credits} cr</div>
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => setCaptainOrder(prev => [...prev, player.name])}
                        >
                          Add
                        </Button>
                      </div>
                    ))}
                </div>
              </div>

              {/* Captain Order */}
              <div>
                <h4 className="font-medium mb-3">Captain Order</h4>
                <div className="space-y-2">
                  {captainOrder.map((playerName, index) => (
                    <div key={playerName} className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded">
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="font-medium text-sm">{playerName}</span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setCaptainOrder(prev => prev.filter(name => name !== playerName))}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-between items-center">
          <Button variant="outline" onClick={() => setStage('selection')}>
            Back to Selection
          </Button>
          <Button onClick={() => setStage('summary')} className="bg-blue-600 hover:bg-blue-700">
            Review & Generate
          </Button>
        </div>
      </div>
    );
  }

  // Summary stage
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Core-Hedge Strategy Summary</h2>
        <p className="text-gray-600 mb-4">
          Review your strategy before generating teams.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Player Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-green-50 rounded border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">Core Players ({selections.core.length})</h4>
                <div className="flex flex-wrap gap-1">
                  {selections.core.map(p => (
                    <Badge key={p.id} variant="secondary" className="text-xs">{p.name}</Badge>
                  ))}
                </div>
              </div>
              
              <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-2">Hedge Players ({selections.hedge.length})</h4>
                <div className="flex flex-wrap gap-1">
                  {selections.hedge.map(p => (
                    <Badge key={p.id} variant="secondary" className="text-xs">{p.name}</Badge>
                  ))}
                </div>
              </div>
              
              <div className="p-3 bg-red-50 rounded border border-red-200">
                <h4 className="font-semibold text-red-800 mb-2">Differentials ({selections.differential.length})</h4>
                <div className="flex flex-wrap gap-1">
                  {selections.differential.map(p => (
                    <Badge key={p.id} variant="secondary" className="text-xs">{p.name}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Number of Teams</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setTeamCount(Math.max(1, teamCount - 1))}
                  >
                    -
                  </Button>
                  <span className="px-4 py-2 bg-gray-100 rounded">{teamCount}</span>
                  <Button
                    variant="outline"
                    onClick={() => setTeamCount(Math.min(30, teamCount + 1))}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Captain Priority</h4>
                <div className="space-y-1">
                  {captainOrder.slice(0, 5).map((name, index) => (
                    <div key={name} className="text-sm flex items-center gap-2">
                      <span className="bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {index + 1}
                      </span>
                      {name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-800 italic">
              &quot;Your core {selections.core.length} players locked across most teams, hedging with {selections.hedge.length} picks across {teamCount} teams.&quot;
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-between items-center">
        <Button variant="outline" onClick={() => setStage('captaincy')}>
          Back to Captains
        </Button>
        <Button onClick={handleGenerateTeams} className="bg-blue-600 hover:bg-blue-700">
          Generate {teamCount} Teams
        </Button>
      </div>
    </div>
  );
}
