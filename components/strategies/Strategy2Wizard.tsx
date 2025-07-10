"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMatchData } from '@/hooks/use-cricket-data';

interface Strategy2WizardProps {
  matchId: string;
  onGenerate: (prefs: any, count: number) => void;
}

export default function Strategy2Wizard({ matchId, onGenerate }: Strategy2WizardProps) {
  const { data: matchData, loading: matchLoading } = useMatchData(matchId);
  const [stage, setStage] = useState<'selection' | 'distribution'>('selection');
  const [selectedPlayers, setSelectedPlayers] = useState<any[]>([]);
  const [combos, setCombos] = useState<{ captain: string; viceCaptain: string; percentage: number }[]>([]);
  const [teamCount, setTeamCount] = useState(15);
  // Active players per team
  const [players1, setPlayers1] = useState<any[]>([]);
  const [players2, setPlayers2] = useState<any[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);

  // Fetch active players per team
  useEffect(() => {
    if (!matchData?.match?.id) return;
    
    async function fetchPlayers() {
      setLoadingPlayers(true);
      try {
        const matchName = matchData.match.team_name as string;
        const [team1Name, team2Name] = matchName.split(' vs ');
        
        const res1 = await fetch(`/api/players?matchId=${matchData.match.id}&teamName=${encodeURIComponent(team1Name)}&onlyActive=true`);
        const { data: d1 } = await res1.json();
        const res2 = await fetch(`/api/players?matchId=${matchData.match.id}&teamName=${encodeURIComponent(team2Name)}&onlyActive=true`);
        const { data: d2 } = await res2.json();
        setPlayers1(d1 || []);
        setPlayers2(d2 || []);
      } catch (error) {
        console.error('Error fetching players:', error);
        setPlayers1([]);
        setPlayers2([]);
      }
      setLoadingPlayers(false);
    }
    
    fetchPlayers();
  }, [matchData]);

  if (matchLoading) return <div>Loading player pool...</div>;

  const players: any[] = matchData?.players || [];
  // Determine team names from matchData
  const matchName = matchData.match.team_name as string;
  const [team1Name, team2Name] = matchName.split(' vs ');

  // Selection and distribution logic
  const togglePlayer = (player: any) => {
    if (selectedPlayers.some(p => p.id === player.id)) {
      setSelectedPlayers(selectedPlayers.filter(p => p.id !== player.id));
    } else {
      const totalCredits = selectedPlayers.reduce((sum, p) => sum + (p.credits || 0), 0);
      if (selectedPlayers.length < 11 && totalCredits + (player.credits || 0) <= 100) {
        setSelectedPlayers([...selectedPlayers, player]);
      }
    }
  };

  const handleAddCombo = () => {
    setCombos([...combos, { captain: '', viceCaptain: '', percentage: 0 }]);
  };

  const updateCombo = (index: number, field: 'captain' | 'viceCaptain' | 'percentage', value: string | number) => {
    setCombos(prev => prev.map((combo, i) => 
      i === index ? { ...combo, [field]: value } : combo
    ));
  };

  const removeCombo = (index: number) => {
    setCombos(prev => prev.filter((_, i) => i !== index));
  };

  if (stage === 'selection') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
        <div className="container mx-auto p-4">
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Same XI, Different Captains
            </h2>
            <p className="text-gray-600 mb-4">Select 11 players from both teams to create your base XI. You&apos;ll then distribute different captain combinations across multiple teams.</p>
            
            <div className="flex items-center gap-8 mb-4">
              <div className="flex items-center text-sm bg-blue-100 px-3 py-1 rounded-full">
                <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                {team1Name} ({players1.length} players)
              </div>
              <div className="flex items-center text-sm bg-red-100 px-3 py-1 rounded-full">
                <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                {team2Name} ({players2.length} players)
              </div>
            </div>
          </div>

          {loadingPlayers ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading players...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[
                { players: players1, teamName: team1Name, color: 'blue' },
                { players: players2, teamName: team2Name, color: 'red' }
              ].map(({ players, teamName, color }, colIdx) => (
                <div key={colIdx} className="bg-white border-2 border-purple-100 rounded-xl shadow-lg">
                  <div className={`p-4 ${color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-red-500 to-red-600'} rounded-t-xl`}>
                    <h3 className="font-bold text-white text-lg">
                      {teamName}
                    </h3>
                    <p className="text-blue-100 text-sm">{players.length} active players</p>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {players.map((player: any) => {
                      const isSelected = selectedPlayers.some(sp => sp.id === player.id);
                      const totalCredits = selectedPlayers.reduce((sum, pl) => sum + (pl.credits || 0), 0);
                      const canSelect = selectedPlayers.length < 11 && totalCredits + (player.credits || 0) <= 100;
                      
                      return (
                        <div key={player.id} className={`flex items-center justify-between p-4 border-b hover:bg-purple-50 transition-colors ${isSelected ? 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200' : ''}`}>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-800">{player.name}</div>
                            <div className="text-sm text-gray-600 flex items-center gap-4 mt-1">
                              <span className="bg-purple-100 px-2 py-1 rounded-full text-purple-700 text-xs">
                                {player.player_role || 'Unknown'}
                              </span>
                              <span className="text-green-600 font-medium">
                                {player.points || 0} pts
                              </span>
                              <span className="text-orange-600 font-medium">
                                {player.credits || 0} cr
                              </span>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant={isSelected ? "destructive" : "default"}
                            onClick={() => togglePlayer(player)} 
                            disabled={!isSelected && !canSelect}
                            className={`ml-3 w-8 h-8 rounded-full ${isSelected ? 'bg-red-500 hover:bg-red-600' : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'} text-white border-0`}
                          >
                            {isSelected ? '−' : '+'}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 p-6 bg-gradient-to-r from-purple-100 via-blue-100 to-green-100 rounded-xl border-2 border-purple-200">
            <div className="flex items-center justify-between text-lg font-medium mb-3">
              <span>Selected Players: <strong className="text-purple-600">{selectedPlayers.length}/11</strong></span>
              <span>Credits Used: <strong className="text-green-600">{selectedPlayers.reduce((sum, pl) => sum + (pl.credits || 0), 0)}/100</strong></span>
            </div>
            {selectedPlayers.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedPlayers.map((player, idx) => (
                  <span key={player.id} className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm rounded-full shadow-sm">
                    {player.name}
                    <button 
                      onClick={() => togglePlayer(player)}
                      className="ml-2 text-white hover:text-red-200 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-between items-center">
            <Button variant="outline" onClick={() => window.history.back()} className="border-2 border-gray-300 hover:border-gray-400">
              Back to Match
            </Button>
            <Button 
              disabled={selectedPlayers.length !== 11} 
              onClick={() => setStage('distribution')}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg px-6 py-2"
            >
              Next: Set Captains ({selectedPlayers.length}/11)
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Distribution stage UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Captain and Vice-Captain Distribution
          </h2>
          <p className="text-gray-600 mb-4">
            Create different captain/vice-captain combinations for your teams. Each combination will generate teams with the same 11 players but different leadership.
          </p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Number of Teams to Generate</label>
            <Input 
              type="number" 
              min={1} 
              max={50} 
              value={teamCount} 
              onChange={e => setTeamCount(parseInt(e.target.value) || 15)}
              className="w-32 border-2 border-purple-200 focus:border-purple-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          {combos.map((combo, idx) => (
            <div key={idx} className="bg-white border-2 border-purple-100 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {idx + 1}
                  </div>
                  <div className="font-semibold text-gray-800">Combination {idx + 1}</div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => removeCombo(idx)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                >
                  Remove
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Captain</label>
                  <select 
                    value={combo.captain} 
                    onChange={e => updateCombo(idx, 'captain', e.target.value)}
                    className="w-full border-2 border-purple-200 rounded-lg px-3 py-2 focus:border-purple-500 focus:outline-none bg-white"
                  >
                    <option value="">Select Captain</option>
                    {selectedPlayers.map(player => (
                      <option key={player.id} value={player.name}>{player.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Vice-Captain</label>
                  <select 
                    value={combo.viceCaptain} 
                    onChange={e => updateCombo(idx, 'viceCaptain', e.target.value)}
                    className="w-full border-2 border-purple-200 rounded-lg px-3 py-2 focus:border-purple-500 focus:outline-none bg-white"
                  >
                    <option value="">Select Vice-Captain</option>
                    {selectedPlayers
                      .filter(player => player.name !== combo.captain)
                      .map(player => (
                        <option key={player.id} value={player.name}>{player.name}</option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Percentage (%)</label>
                  <Input 
                    type="number" 
                    min={0} 
                    max={100} 
                    value={combo.percentage} 
                    onChange={e => updateCombo(idx, 'percentage', parseInt(e.target.value) || 0)}
                    className="border-2 border-purple-200 focus:border-purple-500"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          ))}
          
          {/* Percentage Summary */}
          {combos.length > 0 && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="font-medium text-gray-800">
                  Total Percentage: <span className={`font-bold ${
                    combos.reduce((sum, combo) => sum + combo.percentage, 0) === 100 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {combos.reduce((sum, combo) => sum + combo.percentage, 0)}%
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Must equal 100% to generate teams
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-between items-center">
          <Button 
            variant="outline"
            onClick={handleAddCombo}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 hover:from-purple-600 hover:to-blue-600 shadow-md"
          >
            Add Another Combination
          </Button>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStage('selection')} className="border-2 border-gray-300 hover:border-gray-400">
              Back to Selection
            </Button>
            <Button 
              onClick={() => {
                const validCombos = combos.filter(c => c.captain && c.viceCaptain && c.percentage > 0);
                const totalPercentage = validCombos.reduce((sum, combo) => sum + combo.percentage, 0);
                
                if (totalPercentage !== 100) {
                  alert(`Total percentage must equal 100%. Current total: ${totalPercentage}%`);
                  return;
                }
                
                onGenerate({ 
                  strategy: 'same-xi',
                  players: selectedPlayers, 
                  combos: validCombos,
                  teamCount 
                }, teamCount);
              }} 
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg"
              disabled={combos.filter(c => c.captain && c.viceCaptain && c.percentage > 0).length === 0}
            >
              Generate {teamCount} Teams
            </Button>
          </div>
        </div>

        {/* Selected Players Summary */}
        <div className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-2 border-purple-100">
          <h3 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
            <span className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs">
              ✓
            </span>
            Selected XI:
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedPlayers.map((player) => (
              <span key={player.id} className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm rounded-full shadow-sm">
                {player.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
