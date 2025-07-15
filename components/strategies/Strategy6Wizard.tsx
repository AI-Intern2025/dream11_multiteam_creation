"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useMatchData } from '@/hooks/use-cricket-data';
import { PRESET_CONFIGURATIONS } from '@/lib/preset-configurations';

interface Strategy6WizardProps {
  matchId: string;
  onGenerate: (prefs: any, count: number) => void;
}

export default function Strategy6Wizard({ matchId, onGenerate }: Strategy6WizardProps) {
  const { data: matchData } = useMatchData(matchId);
  const [teamCount, setTeamCount] = useState(15);
  const [stage, setStage] = useState<'presets' | 'summary'>('presets');
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  
  // User input match conditions
  const [matchConditions, setMatchConditions] = useState({
    format: 'T20',
    pitch: 'Flat',
    weather: 'Clear',
    venue: 'Dry'
  });

  const matchName = matchData?.match?.team_name || 'Team A vs Team B';
  const [teamAName, teamBName] = matchName.split(' vs ');

  // Use imported preset configurations
  const presetConfigurations = PRESET_CONFIGURATIONS.map(preset => ({
    ...preset,
    // Update descriptions to include actual team names
    description: preset.description.replace('Team A', teamAName).replace('Team B', teamBName)
  }));

  const handleSelectPreset = (presetId: string) => {
    setSelectedPreset(presetId);
  };

  const handleSaveConfig = () => {
    setStage('summary');
  };

  const handleGenerateTeams = () => {
    const preset = presetConfigurations.find(p => p.id === selectedPreset);
    if (!preset) {
      console.error('No preset selected');
      return;
    }

    const strategyData = {
      preset: {
        id: preset.id,
        name: preset.name,
        description: preset.description,
        strategy: preset.strategy,
        focus: preset.focus,
        riskLevel: preset.riskLevel,
        tags: preset.tags,
        constraints: preset.constraints
      },
      teamNames: { teamA: teamAName, teamB: teamBName },
      matchConditions: matchConditions
    };
    
    console.log('🎯 Generating teams with preset strategy:', strategyData);
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
          <h3 className="font-semibold text-blue-800 mb-4">Match Conditions:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="format" className="text-sm font-medium text-gray-700">Format</Label>
              <Select value={matchConditions.format} onValueChange={(value) => setMatchConditions({...matchConditions, format: value})}>
                <SelectTrigger id="format" className="mt-1">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="T20">T20</SelectItem>
                  <SelectItem value="ODI">ODI</SelectItem>
                  <SelectItem value="Test">Test</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="pitch" className="text-sm font-medium text-gray-700">Pitch</Label>
              <Select value={matchConditions.pitch} onValueChange={(value) => setMatchConditions({...matchConditions, pitch: value})}>
                <SelectTrigger id="pitch" className="mt-1">
                  <SelectValue placeholder="Select pitch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Flat">Flat (Batting Friendly)</SelectItem>
                  <SelectItem value="Green">Green (Bowling Friendly)</SelectItem>
                  <SelectItem value="Dusty">Dusty (Spin Friendly)</SelectItem>
                  <SelectItem value="Slow">Slow (Low Bounce)</SelectItem>
                  <SelectItem value="Bouncy">Bouncy (High Bounce)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="weather" className="text-sm font-medium text-gray-700">Weather</Label>
              <Select value={matchConditions.weather} onValueChange={(value) => setMatchConditions({...matchConditions, weather: value})}>
                <SelectTrigger id="weather" className="mt-1">
                  <SelectValue placeholder="Select weather" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Clear">Clear</SelectItem>
                  <SelectItem value="Cloudy">Cloudy</SelectItem>
                  <SelectItem value="Overcast">Overcast</SelectItem>
                  <SelectItem value="Humid">Humid</SelectItem>
                  <SelectItem value="Windy">Windy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="venue" className="text-sm font-medium text-gray-700">Venue</Label>
              <Select value={matchConditions.venue} onValueChange={(value) => setMatchConditions({...matchConditions, venue: value})}>
                <SelectTrigger id="venue" className="mt-1">
                  <SelectValue placeholder="Select venue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dry">Dry</SelectItem>
                  <SelectItem value="Dew">Dew Expected</SelectItem>
                  <SelectItem value="Indoor">Indoor/Covered</SelectItem>
                  <SelectItem value="Coastal">Coastal</SelectItem>
                  <SelectItem value="High-Altitude">High Altitude</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-3">
            AI will adjust the selected preset based on these conditions.
          </p>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Selected conditions:</span> {matchConditions.format} • {matchConditions.pitch} • {matchConditions.weather} • {matchConditions.venue}
          </div>
          <div className="flex gap-2">
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
                      <span>Format:</span>
                      <span className="font-medium">{matchConditions.format}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pitch:</span>
                      <span className="font-medium">{matchConditions.pitch}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Weather:</span>
                      <span className="font-medium">{matchConditions.weather}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Venue:</span>
                      <span className="font-medium">{matchConditions.venue}</span>
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
              &quot;Applying {selectedPresetData?.name} configuration with {teamCount} teams, adjusted for {matchConditions.pitch} pitch and {matchConditions.weather} weather conditions.&quot;
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
