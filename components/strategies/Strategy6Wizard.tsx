"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMatchData } from '@/hooks/use-cricket-data';

interface Strategy6WizardProps {
  matchId: string;
  onGenerate: (prefs: any, count: number) => void;
}

export default function Strategy6Wizard({ matchId, onGenerate }: Strategy6WizardProps) {
  const { data: matchData } = useMatchData(matchId);
  const [teamCount, setTeamCount] = useState(15);
  const [stage, setStage] = useState<'presets' | 'summary'>('presets');
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  const matchName = matchData?.match?.team_name || 'Team A vs Team B';
  const [teamAName, teamBName] = matchName.split(' vs ');

  const presetConfigurations = [
    {
      id: 'team-a-high-total',
      name: 'Team A High Total, Team B Collapse',
      description: `Stack ${teamAName} batsmen and ${teamBName} bowlers`,
      strategy: 'Expect high scoring from Team A, early wickets for Team B',
      focus: { teamA: 'batsmen', teamB: 'bowlers' },
      riskLevel: 'medium',
      tags: ['batting-pitch', 'one-sided']
    },
    {
      id: 'team-b-high-total',
      name: 'Team B High Total, Team A Collapse',
      description: `Stack ${teamBName} batsmen and ${teamAName} bowlers`,
      strategy: 'Expect high scoring from Team B, early wickets for Team A',
      focus: { teamA: 'bowlers', teamB: 'batsmen' },
      riskLevel: 'medium',
      tags: ['batting-pitch', 'one-sided']
    },
    {
      id: 'high-differentials',
      name: 'High Differentials Strategy',
      description: 'Focus on low-ownership, high-upside players',
      strategy: 'Pick players with <20% ownership but high ceiling',
      focus: { ownership: 'low', upside: 'high' },
      riskLevel: 'high',
      tags: ['differential', 'contrarian', 'high-risk']
    },
    {
      id: 'balanced-roles',
      name: 'Balanced Roles (4 BAT, 3 BOWL, 2 AR, 1 WK)',
      description: 'Traditional balanced team composition',
      strategy: 'Equal weight to all departments',
      focus: { batsmen: 4, bowlers: 3, allRounders: 2, wicketKeepers: 1 },
      riskLevel: 'low',
      tags: ['balanced', 'traditional', 'safe']
    },
    {
      id: 'all-rounder-heavy',
      name: 'All-Rounder Heavy Lineup',
      description: 'Stack all-rounders for maximum versatility',
      strategy: 'Pick 4+ all-rounders for captaincy flexibility',
      focus: { allRounders: 4, versatility: 'high' },
      riskLevel: 'medium',
      tags: ['all-rounders', 'versatile', 'captaincy']
    },
    {
      id: 'top-order-stack',
      name: 'Top Order Batting Stack',
      description: 'Focus on openers and #3 batsmen',
      strategy: 'Stack top 3 batsmen from both teams',
      focus: { battingOrder: 'top', position: '1-3' },
      riskLevel: 'medium',
      tags: ['top-order', 'batting', 'powerplay']
    },
    {
      id: 'bowling-pitch',
      name: 'Bowling Pitch Special',
      description: 'Bowler-heavy lineup for seaming/spinning conditions',
      strategy: 'Pick 5+ bowlers expecting low-scoring game',
      focus: { bowlers: 5, wickets: 'high' },
      riskLevel: 'high',
      tags: ['bowling', 'conditions', 'low-scoring']
    },
    {
      id: 'death-specialists',
      name: 'Death Overs Specialists',
      description: 'Focus on players who excel in death overs',
      strategy: 'Pick finishers and death bowlers',
      focus: { phase: 'death', specialists: 'high' },
      riskLevel: 'medium',
      tags: ['death-overs', 'finishers', 'specialist']
    }
  ];

  const handleSelectPreset = (presetId: string) => {
    setSelectedPreset(presetId);
  };

  const handleSaveConfig = () => {
    setStage('summary');
  };

  const handleGenerateTeams = () => {
    const preset = presetConfigurations.find(p => p.id === selectedPreset);
    const strategyData = {
      preset,
      teamNames: { teamA: teamAName, teamB: teamBName },
      matchConditions: {
        pitch: matchData?.match?.pitch_condition,
        weather: matchData?.match?.weather_condition,
        venue: matchData?.match?.venue_condition
      }
    };
    onGenerate(strategyData, teamCount);
  };

  const selectedPresetData = presetConfigurations.find(p => p.id === selectedPreset);

  if (stage === 'presets') {
    return (
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Preset Scenarios & Configurations</h2>
          <p className="text-gray-600 mb-4">
            Choose from pre-built strategies optimized for different match scenarios and conditions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {presetConfigurations.map((preset) => (
            <Card 
              key={preset.id} 
              className={`cursor-pointer transition-all ${
                selectedPreset === preset.id 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleSelectPreset(preset.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{preset.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {preset.description}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={preset.riskLevel === 'high' ? 'destructive' : 
                            preset.riskLevel === 'medium' ? 'default' : 'secondary'}
                    className="ml-2"
                  >
                    {preset.riskLevel} risk
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Strategy:</h4>
                    <p className="text-sm text-gray-600">{preset.strategy}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Tags:</h4>
                    <div className="flex flex-wrap gap-1">
                      {preset.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">Match Conditions:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <strong>Pitch:</strong> {matchData?.match?.pitch_condition || 'Unknown'}
            </div>
            <div>
              <strong>Weather:</strong> {matchData?.match?.weather_condition || 'Unknown'}
            </div>
            <div>
              <strong>Venue:</strong> {matchData?.match?.venue_condition || 'Unknown'}
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-2">
            AI will adjust the selected preset based on these conditions.
          </p>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <Button variant="outline" onClick={() => window.history.back()}>
            Back to Match
          </Button>
          <Button 
            onClick={handleSaveConfig}
            disabled={!selectedPreset}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Save Configuration
          </Button>
        </div>
      </div>
    );
  }

  // Summary stage
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Preset Configuration Summary</h2>
        <p className="text-gray-600 mb-4">
          Review your selected preset before generating teams.
        </p>
      </div>

      {selectedPresetData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Selected Preset</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-blue-600">
                    {selectedPresetData.name}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {selectedPresetData.description}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-1">Strategy:</h4>
                  <p className="text-sm text-gray-600">{selectedPresetData.strategy}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Risk Level:</h4>
                  <Badge 
                    variant={selectedPresetData.riskLevel === 'high' ? 'destructive' : 
                            selectedPresetData.riskLevel === 'medium' ? 'default' : 'secondary'}
                  >
                    {selectedPresetData.riskLevel} risk
                  </Badge>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Tags:</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedPresetData.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Optimization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Match Context:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Pitch:</span>
                      <span className="font-medium">{matchData?.match?.pitch_condition || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Weather:</span>
                      <span className="font-medium">{matchData?.match?.weather_condition || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Venue:</span>
                      <span className="font-medium">{matchData?.match?.venue_condition || 'Unknown'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Team Count:</h4>
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
                      onClick={() => setTeamCount(Math.min(50, teamCount + 1))}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">AI Strategy Summary:</h4>
            <p className="text-gray-800 italic">
              &quot;Applying {selectedPresetData?.name} configuration with {teamCount} teams, adjusted for {matchData?.match?.pitch_condition || 'unknown'} pitch and {matchData?.match?.weather_condition || 'unknown'} weather conditions.&quot;
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="p-4 bg-green-50 rounded-lg border border-green-200 mb-6">
        <h4 className="font-semibold text-green-800 mb-2">Expected Optimizations:</h4>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Player selection aligned with preset strategy</li>
          <li>• Captaincy suggestions based on scenario expectations</li>
          <li>• Risk management according to preset risk level</li>
          <li>• Condition-based adjustments for pitch and weather</li>
        </ul>
      </div>

      <div className="mt-6 flex justify-between items-center">
        <Button variant="outline" onClick={() => setStage('presets')}>
          Back to Presets
        </Button>
        <Button onClick={handleGenerateTeams} className="bg-blue-600 hover:bg-blue-700">
          Generate {teamCount} Teams
        </Button>
      </div>
    </div>
  );
}
