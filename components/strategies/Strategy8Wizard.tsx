"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMatchData } from '@/hooks/use-cricket-data';

interface Strategy8WizardProps {
  matchId: string;
  onGenerate: (prefs: any, count: number) => void;
}

export default function Strategy8Wizard({ matchId, onGenerate }: Strategy8WizardProps) {
  const { data: matchData } = useMatchData(matchId);
  const [teamCount, setTeamCount] = useState(15);
  const [stage, setStage] = useState<'baseTeam' | 'rules' | 'summary'>('baseTeam');
  
  const [baseTeam, setBaseTeam] = useState<any[]>([]);
  const [players1, setPlayers1] = useState<any[]>([]);
  const [players2, setPlayers2] = useState<any[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  
  const [optimizationRules, setOptimizationRules] = useState({
    primaryParameter: 'dreamTeamPercentage' as 'dreamTeamPercentage' | 'selectionPercentage' | 'averagePoints',
    guardrails: {
      maxPerRole: { batsmen: 6, bowlers: 5, allRounders: 4, wicketKeepers: 2 },
      maxPerTeam: { teamA: 7, teamB: 7 },
      minCredits: 95,
      maxCredits: 100
    },
    preferences: {
      bowlingStyle: 'balanced' as 'pace-heavy' | 'spin-heavy' | 'balanced',
      battingOrder: 'balanced' as 'top-heavy' | 'middle-heavy' | 'balanced',
      riskTolerance: 'medium' as 'conservative' | 'medium' | 'aggressive'
    },
    editIntensity: 'minor' as 'minor' | 'moderate' | 'major'
  });

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

  const togglePlayerInBaseTeam = (player: any) => {
    if (baseTeam.some(p => p.id === player.id)) {
      setBaseTeam(baseTeam.filter(p => p.id !== player.id));
    } else if (baseTeam.length < 11) {
      setBaseTeam([...baseTeam, player]);
    }
  };

  const getPlayerRole = (role: string) => {
    if (role.includes('BAT')) return 'batsmen';
    if (role.includes('BWL')) return 'bowlers';
    if (role.includes('AR')) return 'allRounders';
    if (role.includes('WK')) return 'wicketKeepers';
    return 'allRounders';
  };

  const getRoleCount = (role: string) => {
    return baseTeam.filter(p => getPlayerRole(p.player_role) === role).length;
  };

  const getTeamCount = (teamName: string) => {
    return baseTeam.filter(p => p.team_name === teamName).length;
  };

  const getTotalCredits = () => {
    return baseTeam.reduce((sum, p) => sum + (p.credits || 0), 0);
  };

  const handleDefineRules = () => {
    setStage('rules');
  };

  const handleGenerateTeams = () => {
    const strategyData = {
      baseTeam,
      optimizationRules,
      teamNames: { team1: team1Name, team2: team2Name },
      summary: generateSummary()
    };
    onGenerate(strategyData, teamCount);
  };

  const generateSummary = () => {
    const editTypes = {
      minor: '1-2 player swaps',
      moderate: '3-4 player changes',
      major: '5+ strategic overhauls'
    };
    
    return `Base team with ${optimizationRules.editIntensity} edits (${editTypes[optimizationRules.editIntensity]}) optimizing for ${optimizationRules.primaryParameter.replace(/([A-Z])/g, ' $1').toLowerCase()}.`;
  };

  if (loadingPlayers) {
    return <div className="container mx-auto p-4">Loading players...</div>;
  }

  if (stage === 'baseTeam') {
    return (
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Base Team + Rule-Based Edits</h2>
          <p className="text-gray-600 mb-4">
            Create a baseline XI, then define optimization rules for generating variations.
          </p>
        </div>

        {/* Base Team Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{baseTeam.length}</div>
              <div className="text-sm text-gray-600">Players Selected</div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{getTotalCredits().toFixed(1)}</div>
              <div className="text-sm text-gray-600">Total Credits</div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {getTeamCount(team1Name)}-{getTeamCount(team2Name)}
              </div>
              <div className="text-sm text-gray-600">Team Split</div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {getRoleCount('batsmen')}-{getRoleCount('bowlers')}-{getRoleCount('allRounders')}-{getRoleCount('wicketKeepers')}
              </div>
              <div className="text-sm text-gray-600">BAT-BWL-AR-WK</div>
            </div>
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
                <CardDescription>
                  {getTeamCount(teamName)} selected • {players.length} available
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 max-h-96 overflow-y-auto">
                {players.map((player: any) => {
                  const isSelected = baseTeam.some(p => p.id === player.id);
                  const canSelect = baseTeam.length < 11;
                  
                  return (
                    <div key={player.id} className={`p-3 border-b hover:bg-gray-50 ${
                      isSelected ? 'bg-green-50 border-green-200' : ''
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{player.name}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-3">
                            <span>{player.player_role}</span>
                            <span>Pts: {player.points}</span>
                            <span>Cr: {player.credits}</span>
                          </div>
                        </div>
                        
                        <Button 
                          size="sm" 
                          variant={isSelected ? "destructive" : "default"}
                          onClick={() => togglePlayerInBaseTeam(player)} 
                          disabled={!isSelected && !canSelect}
                        >
                          {isSelected ? '−' : '+'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selected Players Summary */}
        {baseTeam.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Base Team XI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {baseTeam.map((player, idx) => (
                  <div key={player.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium text-sm">{player.name}</div>
                      <div className="text-xs text-gray-500">{player.player_role} • {player.credits} cr</div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => togglePlayerInBaseTeam(player)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-6 flex justify-between items-center">
          <Button variant="outline" onClick={() => window.history.back()}>
            Back to Match
          </Button>
          <Button 
            onClick={handleDefineRules}
            disabled={baseTeam.length !== 11}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Define Optimization Rules ({baseTeam.length}/11)
          </Button>
        </div>
      </div>
    );
  }

  if (stage === 'rules') {
    return (
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Optimization Rules</h2>
          <p className="text-gray-600 mb-4">
            Define rules for how the AI should modify your base team across multiple variations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Primary Optimization Parameter */}
          <Card>
            <CardHeader>
              <CardTitle>Primary Optimization</CardTitle>
              <CardDescription>What should the AI primarily optimize for?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {[
                  { value: 'dreamTeamPercentage', label: 'Dream Team %', desc: 'How often players appear in dream teams' },
                  { value: 'selectionPercentage', label: 'Selection %', desc: 'Ownership percentage in contests' },
                  { value: 'averagePoints', label: 'Average Points', desc: 'Recent form and scoring consistency' }
                ].map((option) => (
                  <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="primaryParameter"
                      value={option.value}
                      checked={optimizationRules.primaryParameter === option.value}
                      onChange={(e) => setOptimizationRules(prev => ({
                        ...prev,
                        primaryParameter: e.target.value as any
                      }))}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-sm">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Guardrails */}
          <Card>
            <CardHeader>
              <CardTitle>Guardrails</CardTitle>
              <CardDescription>Constraints to maintain team balance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Max Players per Role</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <Label className="text-xs">Batsmen</Label>
                    <Input
                      type="number"
                      min={1}
                      max={8}
                      value={optimizationRules.guardrails.maxPerRole.batsmen}
                      onChange={(e) => setOptimizationRules(prev => ({
                        ...prev,
                        guardrails: {
                          ...prev.guardrails,
                          maxPerRole: {
                            ...prev.guardrails.maxPerRole,
                            batsmen: parseInt(e.target.value) || 6
                          }
                        }
                      }))}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Bowlers</Label>
                    <Input
                      type="number"
                      min={1}
                      max={6}
                      value={optimizationRules.guardrails.maxPerRole.bowlers}
                      onChange={(e) => setOptimizationRules(prev => ({
                        ...prev,
                        guardrails: {
                          ...prev.guardrails,
                          maxPerRole: {
                            ...prev.guardrails.maxPerRole,
                            bowlers: parseInt(e.target.value) || 5
                          }
                        }
                      }))}
                      className="h-8"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Credit Range</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <Label className="text-xs">Min Credits</Label>
                    <Input
                      type="number"
                      min={90}
                      max={100}
                      step={0.5}
                      value={optimizationRules.guardrails.minCredits}
                      onChange={(e) => setOptimizationRules(prev => ({
                        ...prev,
                        guardrails: {
                          ...prev.guardrails,
                          minCredits: parseFloat(e.target.value) || 95
                        }
                      }))}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Max Credits</Label>
                    <Input
                      type="number"
                      min={95}
                      max={100}
                      step={0.5}
                      value={optimizationRules.guardrails.maxCredits}
                      onChange={(e) => setOptimizationRules(prev => ({
                        ...prev,
                        guardrails: {
                          ...prev.guardrails,
                          maxCredits: parseFloat(e.target.value) || 100
                        }
                      }))}
                      className="h-8"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Bias towards certain player types</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Bowling Style Preference</Label>
                <select 
                  value={optimizationRules.preferences.bowlingStyle}
                  onChange={(e) => setOptimizationRules(prev => ({
                    ...prev,
                    preferences: {
                      ...prev.preferences,
                      bowlingStyle: e.target.value as any
                    }
                  }))}
                  className="w-full p-2 border rounded-md mt-1"
                >
                  <option value="pace-heavy">Pace-Heavy</option>
                  <option value="spin-heavy">Spin-Heavy</option>
                  <option value="balanced">Balanced</option>
                </select>
              </div>

              <div>
                <Label className="text-sm font-medium">Batting Order Preference</Label>
                <select 
                  value={optimizationRules.preferences.battingOrder}
                  onChange={(e) => setOptimizationRules(prev => ({
                    ...prev,
                    preferences: {
                      ...prev.preferences,
                      battingOrder: e.target.value as any
                    }
                  }))}
                  className="w-full p-2 border rounded-md mt-1"
                >
                  <option value="top-heavy">Top-Heavy</option>
                  <option value="middle-heavy">Middle-Heavy</option>
                  <option value="balanced">Balanced</option>
                </select>
              </div>

              <div>
                <Label className="text-sm font-medium">Risk Tolerance</Label>
                <select 
                  value={optimizationRules.preferences.riskTolerance}
                  onChange={(e) => setOptimizationRules(prev => ({
                    ...prev,
                    preferences: {
                      ...prev.preferences,
                      riskTolerance: e.target.value as any
                    }
                  }))}
                  className="w-full p-2 border rounded-md mt-1"
                >
                  <option value="conservative">Conservative</option>
                  <option value="medium">Medium</option>
                  <option value="aggressive">Aggressive</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Edit Intensity */}
          <Card>
            <CardHeader>
              <CardTitle>Edit Intensity</CardTitle>
              <CardDescription>How much should teams vary from the base?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { value: 'minor', label: 'Minor Edits', desc: '1-2 player swaps per team' },
                  { value: 'moderate', label: 'Moderate Changes', desc: '3-4 player changes per team' },
                  { value: 'major', label: 'Major Overhauls', desc: '5+ strategic changes per team' }
                ].map((option) => (
                  <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="editIntensity"
                      value={option.value}
                      checked={optimizationRules.editIntensity === option.value}
                      onChange={(e) => setOptimizationRules(prev => ({
                        ...prev,
                        editIntensity: e.target.value as any
                      }))}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-sm">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <Button variant="outline" onClick={() => setStage('baseTeam')}>
            Back to Base Team
          </Button>
          <Button onClick={() => setStage('summary')} className="bg-blue-600 hover:bg-blue-700">
            Review Summary
          </Button>
        </div>
      </div>
    );
  }

  // Summary stage
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Base Team + Rules Summary</h2>
        <p className="text-gray-600 mb-4">
          Review your base team and optimization rules.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Base Team Composition</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 bg-blue-50 rounded">
                  <div className="font-bold text-blue-600">{getRoleCount('batsmen')}</div>
                  <div className="text-xs text-blue-800">BAT</div>
                </div>
                <div className="p-2 bg-green-50 rounded">
                  <div className="font-bold text-green-600">{getRoleCount('bowlers')}</div>
                  <div className="text-xs text-green-800">BWL</div>
                </div>
                <div className="p-2 bg-purple-50 rounded">
                  <div className="font-bold text-purple-600">{getRoleCount('allRounders')}</div>
                  <div className="text-xs text-purple-800">AR</div>
                </div>
                <div className="p-2 bg-orange-50 rounded">
                  <div className="font-bold text-orange-600">{getRoleCount('wicketKeepers')}</div>
                  <div className="text-xs text-orange-800">WK</div>
                </div>
              </div>
              
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Total Credits:</span>
                  <span className="font-medium">{getTotalCredits().toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Team Split:</span>
                  <span className="font-medium">{getTeamCount(team1Name)}-{getTeamCount(team2Name)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Optimization Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Primary Parameter:</span>
                <Badge variant="default">
                  {optimizationRules.primaryParameter.replace(/([A-Z])/g, ' $1')}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Edit Intensity:</span>
                <Badge variant="secondary">{optimizationRules.editIntensity}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Bowling Style:</span>
                <span className="font-medium">{optimizationRules.preferences.bowlingStyle}</span>
              </div>
              <div className="flex justify-between">
                <span>Risk Tolerance:</span>
                <span className="font-medium">{optimizationRules.preferences.riskTolerance}</span>
              </div>
              <div className="flex justify-between">
                <span>Credit Range:</span>
                <span className="font-medium">
                  {optimizationRules.guardrails.minCredits}-{optimizationRules.guardrails.maxCredits}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Strategy Summary:</h4>
            <p className="text-gray-800 italic">
              &quot;{generateSummary()}&quot;
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Team Generation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label>Number of Teams</Label>
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
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-between items-center">
        <Button variant="outline" onClick={() => setStage('rules')}>
          Back to Rules
        </Button>
        <Button onClick={handleGenerateTeams} className="bg-blue-600 hover:bg-blue-700">
          Generate {teamCount} Teams
        </Button>
      </div>
    </div>
  );
}
