"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useMatchData } from '@/hooks/use-cricket-data';

interface Strategy7WizardProps {
  matchId: string;
  onGenerate: (prefs: any, count: number) => void;
}

interface RoleSplitConfig {
  // Batting order split
  topOrderBatsmen: number;    // Positions 1-3
  middleOrderBatsmen: number; // Positions 4-6
  lowerOrderBatsmen: number;  // Positions 7-11
  
  // Bowling type split
  spinners: number;
  pacers: number;
  
  // General role requirements
  wicketKeepers: number;
  allRounders: number;
  
  // Team generation settings
  teamCount: number;
  
  // Advanced options
  prioritizeForm: boolean;
  balanceCredits: boolean;
  diversityLevel: 'low' | 'medium' | 'high';
}

export default function Strategy7Wizard({ matchId, onGenerate }: Strategy7WizardProps) {
  const { data: matchData } = useMatchData(matchId);
  const [stage, setStage] = useState<'configure' | 'summary'>('configure');
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [config, setConfig] = useState<RoleSplitConfig>({
    topOrderBatsmen: 3,
    middleOrderBatsmen: 2,
    lowerOrderBatsmen: 1,
    spinners: 2,
    pacers: 1,
    wicketKeepers: 1,
    allRounders: 1,
    teamCount: 15,
    prioritizeForm: true,
    balanceCredits: true,
    diversityLevel: 'medium'
  });

  const matchName = matchData?.match?.team_a_name && matchData?.match?.team_b_name 
    ? `${matchData.match.team_a_name} vs ${matchData.match.team_b_name}`
    : 'Team A vs Team B';
  const [teamAName, teamBName] = matchName.split(' vs ');

  // Calculate total players - this should always be 11 for a valid Dream11 team
  const battingPositions = config.topOrderBatsmen + config.middleOrderBatsmen + config.lowerOrderBatsmen;
  const bowlingTypes = config.spinners + config.pacers;
  const coreRoles = config.wicketKeepers + config.allRounders;
  
  // Total of all role preferences should equal 11
  const totalRolePreferences = battingPositions + bowlingTypes + coreRoles;
  
  // Validation: total should be exactly 11
  const isConfigValid = totalRolePreferences === 11;

  const handleConfigChange = (field: keyof RoleSplitConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
    setSelectedPreset(null); // Reset preset selection when manually changing values
  };

  const handleSaveConfig = () => {
    if (!isConfigValid) {
      const errorMessage = `Invalid configuration: Total role preferences (${totalRolePreferences}) must equal exactly 11 players.\n\nCurrent breakdown:\n- Batting positions: ${battingPositions}\n- Bowling types: ${bowlingTypes}\n- Core roles: ${coreRoles}\n\nPlease adjust the numbers to total exactly 11.`;
      alert(errorMessage);
      return;
    }
    setStage('summary');
  };

  const handleGenerateTeams = () => {
    const strategyData = {
      roleSplitConfig: config,
      teamNames: { teamA: teamAName, teamB: teamBName },
      matchConditions: {
        pitch: matchData?.match?.pitch_condition,
        weather: matchData?.match?.weather_condition,
        venue: matchData?.match?.venue_condition
      }
    };
    onGenerate(strategyData, config.teamCount);
  };

  const presetConfigurations = [
    {
      name: 'Balanced Traditional',
      description: 'Balanced batting order with equal spin/pace',
      config: {
        topOrderBatsmen: 3,
        middleOrderBatsmen: 2,
        lowerOrderBatsmen: 1,
        spinners: 2,
        pacers: 1,
        wicketKeepers: 1,
        allRounders: 1
      }
    },
    {
      name: 'Top-Heavy Batting',
      description: 'Stack top-order batsmen',
      config: {
        topOrderBatsmen: 4,
        middleOrderBatsmen: 2,
        lowerOrderBatsmen: 1,
        spinners: 1,
        pacers: 1,
        wicketKeepers: 1,
        allRounders: 1
      }
    },
    {
      name: 'Bowling Heavy',
      description: 'More bowlers, fewer batsmen',
      config: {
        topOrderBatsmen: 2,
        middleOrderBatsmen: 1,
        lowerOrderBatsmen: 1,
        spinners: 2,
        pacers: 2,
        wicketKeepers: 1,
        allRounders: 2
      }
    },
    {
      name: 'Spin-Friendly Pitch',
      description: 'More spinners for turning tracks',
      config: {
        topOrderBatsmen: 2,
        middleOrderBatsmen: 2,
        lowerOrderBatsmen: 1,
        spinners: 3,
        pacers: 1,
        wicketKeepers: 1,
        allRounders: 1
      }
    }
  ];

  const applyPreset = (preset: any, index: number) => {
    setConfig(prev => ({
      ...prev,
      ...preset.config
    }));
    setSelectedPreset(index);
  };

  if (stage === 'configure') {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Role-Split Lineups Configuration</h2>
          <p className="text-gray-600 mb-4">
            Define specific role ratios for your fantasy teams including batting order and bowling type splits.
          </p>
        </div>

        {/* Preset Configurations */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Quick Presets</CardTitle>
            <CardDescription>Choose from pre-configured role splits or customize your own</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {presetConfigurations.map((preset, index) => (
                <div key={index} 
                     className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                       selectedPreset === index 
                         ? 'bg-blue-50 border-blue-500 shadow-md' 
                         : 'hover:bg-gray-50 border-gray-200'
                     }`}
                     onClick={() => applyPreset(preset, index)}>
                  <h3 className="font-semibold">{preset.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{preset.description}</p>
                  <div className="text-xs text-gray-500">
                    TOP: {preset.config.topOrderBatsmen} | MID: {preset.config.middleOrderBatsmen} | 
                    SPIN: {preset.config.spinners} | PACE: {preset.config.pacers} | 
                    AR: {preset.config.allRounders} | WK: {preset.config.wicketKeepers}
                  </div>
                  {selectedPreset === index && (
                    <div className="mt-2">
                      <Badge variant="default" className="text-xs">Selected</Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {selectedPreset !== null && (
              <div className="mt-4 flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedPreset(null)}
                >
                  Clear Selection & Customize
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Batting Order Split */}
          <Card>
            <CardHeader>
              <CardTitle>Batting Order Split</CardTitle>
              <CardDescription>Define batsmen distribution across batting positions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="topOrder">Top Order (Positions 1-3)</Label>
                <Input
                  id="topOrder"
                  type="number"
                  min="0"
                  max="5"
                  value={config.topOrderBatsmen}
                  onChange={(e) => handleConfigChange('topOrderBatsmen', parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div>
                <Label htmlFor="middleOrder">Middle Order (Positions 4-6)</Label>
                <Input
                  id="middleOrder"
                  type="number"
                  min="0"
                  max="5"
                  value={config.middleOrderBatsmen}
                  onChange={(e) => handleConfigChange('middleOrderBatsmen', parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div>
                <Label htmlFor="lowerOrder">Lower Order (Positions 7-11)</Label>
                <Input
                  id="lowerOrder"
                  type="number"
                  min="0"
                  max="3"
                  value={config.lowerOrderBatsmen}
                  onChange={(e) => handleConfigChange('lowerOrderBatsmen', parseInt(e.target.value) || 0)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Bowling Split */}
          <Card>
            <CardHeader>
              <CardTitle>Bowling Type Split</CardTitle>
              <CardDescription>Define spinner vs pacer distribution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="spinners">Spinners</Label>
                <Input
                  id="spinners"
                  type="number"
                  min="0"
                  max="5"
                  value={config.spinners}
                  onChange={(e) => handleConfigChange('spinners', parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div>
                <Label htmlFor="pacers">Pacers</Label>
                <Input
                  id="pacers"
                  type="number"
                  min="0"
                  max="5"
                  value={config.pacers}
                  onChange={(e) => handleConfigChange('pacers', parseInt(e.target.value) || 0)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Core Roles */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Core Roles</CardTitle>
            <CardDescription>Define essential player roles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="allRounders">All-Rounders</Label>
                <Input
                  id="allRounders"
                  type="number"
                  min="0"
                  max="4"
                  value={config.allRounders}
                  onChange={(e) => handleConfigChange('allRounders', parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div>
                <Label htmlFor="wicketKeepers">Wicket Keepers</Label>
                <Input
                  id="wicketKeepers"
                  type="number"
                  min="1"
                  max="2"
                  value={config.wicketKeepers}
                  onChange={(e) => handleConfigChange('wicketKeepers', parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Generation Settings */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Team Generation Settings</CardTitle>
            <CardDescription>Configure team generation parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="teamCount">Number of Teams</Label>
              <Input
                id="teamCount"
                type="number"
                min="1"
                max="50"
                value={config.teamCount}
                onChange={(e) => handleConfigChange('teamCount', parseInt(e.target.value) || 15)}
              />
            </div>
            
            <div>
              <Label htmlFor="diversity">Diversity Level</Label>
              <select 
                id="diversity"
                value={config.diversityLevel}
                onChange={(e) => handleConfigChange('diversityLevel', e.target.value as 'low' | 'medium' | 'high')}
                className="w-full p-2 border rounded-md"
              >
                <option value="low">Low (10-15% difference)</option>
                <option value="medium">Medium (20-30% difference)</option>
                <option value="high">High (35-50% difference)</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="prioritizeForm"
                checked={config.prioritizeForm}
                onChange={(e) => handleConfigChange('prioritizeForm', e.target.checked)}
              />
              <Label htmlFor="prioritizeForm">Prioritize current form</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="balanceCredits"
                checked={config.balanceCredits}
                onChange={(e) => handleConfigChange('balanceCredits', e.target.checked)}
              />
              <Label htmlFor="balanceCredits">Balance credit distribution</Label>
            </div>
          </CardContent>
        </Card>

        {/* Team Composition Summary */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Team Composition Summary</CardTitle>
            <CardDescription>Total role preferences must equal 11 players</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div className="text-sm">
                <span className="font-medium">Batting Positions:</span> {battingPositions}
              </div>
              <div className="text-sm">
                <span className="font-medium">Bowling Types:</span> {bowlingTypes}
              </div>
              <div className="text-sm">
                <span className="font-medium">Core Roles:</span> {coreRoles}
              </div>
            </div>
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              isConfigValid 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isConfigValid ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className={`font-medium ${
                isConfigValid ? 'text-green-700' : 'text-red-700'
              }`}>
                Total: {totalRolePreferences}/11 {isConfigValid ? '✓' : '✗'}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={() => setConfig({
            topOrderBatsmen: 3,
            middleOrderBatsmen: 2,
            lowerOrderBatsmen: 1,
            spinners: 2,
            pacers: 1,
            wicketKeepers: 1,
            allRounders: 1,
            teamCount: 15,
            prioritizeForm: true,
            balanceCredits: true,
            diversityLevel: 'medium'
          })}>
            Reset to Default
          </Button>
          <Button onClick={handleSaveConfig} disabled={!isConfigValid}>
            Continue to Summary
          </Button>
        </div>
      </div>
    );
  }

  if (stage === 'summary') {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Role-Split Configuration Summary</h2>
          <p className="text-gray-600 mb-4">
            Review your configuration and generate teams.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Configuration Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Batting Order:</h4>
                <p className="text-sm text-gray-600">Top Order: {config.topOrderBatsmen}</p>
                <p className="text-sm text-gray-600">Middle Order: {config.middleOrderBatsmen}</p>
                <p className="text-sm text-gray-600">Lower Order: {config.lowerOrderBatsmen}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Bowling Split:</h4>
                <p className="text-sm text-gray-600">Spinners: {config.spinners}</p>
                <p className="text-sm text-gray-600">Pacers: {config.pacers}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Core Roles:</h4>
                <p className="text-sm text-gray-600">All-Rounders: {config.allRounders}</p>
                <p className="text-sm text-gray-600">Wicket Keepers: {config.wicketKeepers}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Generation Settings:</h4>
                <p className="text-sm text-gray-600">Teams: {config.teamCount}</p>
                <p className="text-sm text-gray-600">Diversity: {config.diversityLevel}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">AI Strategy Summary:</h4>
              <p className="text-gray-800 italic">
                "Generating {config.teamCount} teams with role-split configuration: {config.topOrderBatsmen} top-order, {config.middleOrderBatsmen} middle-order batsmen, {config.spinners} spinners, {config.pacers} pacers, optimized for {matchData?.match?.pitch_condition || 'unknown'} pitch conditions."
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStage('configure')}>
            Back to Configuration
          </Button>
          <Button onClick={handleGenerateTeams} className="bg-green-600 hover:bg-green-700">
            Generate {config.teamCount} Teams
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
