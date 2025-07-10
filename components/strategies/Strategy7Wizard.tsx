"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

interface Strategy7WizardProps {
  matchId: string;
  onGenerate: (prefs: any, count: number) => void;
}

export default function Strategy7Wizard({ matchId, onGenerate }: Strategy7WizardProps) {
  const [teamCount, setTeamCount] = useState(15);
  const [stage, setStage] = useState<'configuration' | 'summary'>('configuration');
  
  const [configuration, setConfiguration] = useState({
    battingOrder: {
      topOrder: 3, // 1-3
      middleOrder: 3, // 4-6
      lowerOrder: 2 // 7-11
    },
    bowlingStyle: {
      pacers: 3,
      spinners: 2,
      hybrid: 1 // all-rounders who bowl
    },
    roleDistribution: {
      batsmen: 4,
      bowlers: 3,
      allRounders: 3,
      wicketKeepers: 1
    },
    teamSplit: {
      teamA: 6,
      teamB: 5
    }
  });

  const updateBattingOrder = (type: string, value: number) => {
    setConfiguration(prev => ({
      ...prev,
      battingOrder: {
        ...prev.battingOrder,
        [type]: value
      }
    }));
  };

  const updateBowlingStyle = (type: string, value: number) => {
    setConfiguration(prev => ({
      ...prev,
      bowlingStyle: {
        ...prev.bowlingStyle,
        [type]: value
      }
    }));
  };

  const updateRoleDistribution = (type: string, value: number) => {
    setConfiguration(prev => ({
      ...prev,
      roleDistribution: {
        ...prev.roleDistribution,
        [type]: value
      }
    }));
  };

  const updateTeamSplit = (teamA: number) => {
    setConfiguration(prev => ({
      ...prev,
      teamSplit: {
        teamA,
        teamB: 11 - teamA
      }
    }));
  };

  const handleSaveConfig = () => {
    setStage('summary');
  };

  const handleGenerateTeams = () => {
    const strategyData = {
      configuration,
      summary: generateSummary()
    };
    onGenerate(strategyData, teamCount);
  };

  const generateSummary = () => {
    const { battingOrder, bowlingStyle, roleDistribution } = configuration;
    
    let summary = `Optimized lineups with ${battingOrder.topOrder} top-order, ${battingOrder.middleOrder} middle-order batsmen. `;
    
    if (bowlingStyle.pacers > bowlingStyle.spinners) {
      summary += `Pace-heavy attack (${bowlingStyle.pacers} pacers, ${bowlingStyle.spinners} spinners). `;
    } else if (bowlingStyle.spinners > bowlingStyle.pacers) {
      summary += `Spin-heavy attack (${bowlingStyle.spinners} spinners, ${bowlingStyle.pacers} pacers). `;
    } else {
      summary += `Balanced bowling attack. `;
    }
    
    if (roleDistribution.allRounders >= 3) {
      summary += `All-rounder heavy composition for flexibility.`;
    } else {
      summary += `Traditional role distribution.`;
    }
    
    return summary;
  };

  const getTotalPlayers = () => {
    return Object.values(configuration.roleDistribution).reduce((sum, count) => sum + count, 0);
  };

  const getTotalBowlers = () => {
    return Object.values(configuration.bowlingStyle).reduce((sum, count) => sum + count, 0);
  };

  if (stage === 'configuration') {
    return (
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Role-Split Lineups</h2>
          <p className="text-gray-600 mb-4">
            Define precise role ratios and batting order preferences to optimize team composition.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Batting Order Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Batting Order Split</CardTitle>
              <CardDescription>Define how many players from each batting position</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium">Top Order (1-3): {configuration.battingOrder.topOrder}</Label>
                <div className="mt-2">
                  <Slider
                    value={[configuration.battingOrder.topOrder]}
                    onValueChange={([value]) => updateBattingOrder('topOrder', value)}
                    min={1}
                    max={6}
                    step={1}
                    className="w-full"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Openers and #3 batsmen</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Middle Order (4-6): {configuration.battingOrder.middleOrder}</Label>
                <div className="mt-2">
                  <Slider
                    value={[configuration.battingOrder.middleOrder]}
                    onValueChange={([value]) => updateBattingOrder('middleOrder', value)}
                    min={1}
                    max={6}
                    step={1}
                    className="w-full"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Anchors and accelerators</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Lower Order (7-11): {configuration.battingOrder.lowerOrder}</Label>
                <div className="mt-2">
                  <Slider
                    value={[configuration.battingOrder.lowerOrder]}
                    onValueChange={([value]) => updateBattingOrder('lowerOrder', value)}
                    min={0}
                    max={5}
                    step={1}
                    className="w-full"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Finishers and tailenders</p>
              </div>
            </CardContent>
          </Card>

          {/* Bowling Style Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Bowling Attack Split</CardTitle>
              <CardDescription>Balance between pace and spin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium">Pace Bowlers: {configuration.bowlingStyle.pacers}</Label>
                <div className="mt-2">
                  <Slider
                    value={[configuration.bowlingStyle.pacers]}
                    onValueChange={([value]) => updateBowlingStyle('pacers', value)}
                    min={1}
                    max={6}
                    step={1}
                    className="w-full"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Fast and medium pacers</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Spin Bowlers: {configuration.bowlingStyle.spinners}</Label>
                <div className="mt-2">
                  <Slider
                    value={[configuration.bowlingStyle.spinners]}
                    onValueChange={([value]) => updateBowlingStyle('spinners', value)}
                    min={0}
                    max={5}
                    step={1}
                    className="w-full"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Leg and off spinners</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Hybrid Bowlers: {configuration.bowlingStyle.hybrid}</Label>
                <div className="mt-2">
                  <Slider
                    value={[configuration.bowlingStyle.hybrid]}
                    onValueChange={([value]) => updateBowlingStyle('hybrid', value)}
                    min={0}
                    max={4}
                    step={1}
                    className="w-full"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">All-rounders who bowl</p>
              </div>

              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm font-medium">Total Bowlers: {getTotalBowlers()}</div>
                <p className="text-xs text-gray-500">Recommended: 5-6 bowling options</p>
              </div>
            </CardContent>
          </Card>

          {/* Role Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Role Distribution</CardTitle>
              <CardDescription>Primary role-based team composition</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium">Batsmen: {configuration.roleDistribution.batsmen}</Label>
                <div className="mt-2">
                  <Slider
                    value={[configuration.roleDistribution.batsmen]}
                    onValueChange={([value]) => updateRoleDistribution('batsmen', value)}
                    min={2}
                    max={7}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Bowlers: {configuration.roleDistribution.bowlers}</Label>
                <div className="mt-2">
                  <Slider
                    value={[configuration.roleDistribution.bowlers]}
                    onValueChange={([value]) => updateRoleDistribution('bowlers', value)}
                    min={2}
                    max={6}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">All-Rounders: {configuration.roleDistribution.allRounders}</Label>
                <div className="mt-2">
                  <Slider
                    value={[configuration.roleDistribution.allRounders]}
                    onValueChange={([value]) => updateRoleDistribution('allRounders', value)}
                    min={1}
                    max={5}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Wicket-Keepers: {configuration.roleDistribution.wicketKeepers}</Label>
                <div className="mt-2">
                  <Slider
                    value={[configuration.roleDistribution.wicketKeepers]}
                    onValueChange={([value]) => updateRoleDistribution('wicketKeepers', value)}
                    min={1}
                    max={2}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm font-medium">Total Players: {getTotalPlayers()}</div>
                <p className="text-xs text-gray-500">Must equal 11</p>
                {getTotalPlayers() !== 11 && (
                  <p className="text-xs text-red-500 mt-1">⚠ Adjust roles to total 11 players</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Team Split */}
          <Card>
            <CardHeader>
              <CardTitle>Team Split</CardTitle>
              <CardDescription>Players from each team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium">
                  Team A: {configuration.teamSplit.teamA} | Team B: {configuration.teamSplit.teamB}
                </Label>
                <div className="mt-2">
                  <Slider
                    value={[configuration.teamSplit.teamA]}
                    onValueChange={([value]) => updateTeamSplit(value)}
                    min={3}
                    max={8}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>3 from A, 8 from B</span>
                  <span>8 from A, 3 from B</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 rounded border border-blue-200">
                  <div className="text-sm font-medium text-blue-800">Team A</div>
                  <div className="text-2xl font-bold text-blue-600">{configuration.teamSplit.teamA}</div>
                </div>
                <div className="p-3 bg-red-50 rounded border border-red-200">
                  <div className="text-sm font-medium text-red-800">Team B</div>
                  <div className="text-2xl font-bold text-red-600">{configuration.teamSplit.teamB}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">Configuration Preview:</h3>
          <p className="text-sm text-blue-700">{generateSummary()}</p>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <Button variant="outline" onClick={() => window.history.back()}>
            Back to Match
          </Button>
          <Button 
            onClick={handleSaveConfig}
            disabled={getTotalPlayers() !== 11}
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
        <h2 className="text-xl font-bold mb-2">Role-Split Configuration Summary</h2>
        <p className="text-gray-600 mb-4">
          Review your role-based lineup configuration.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Batting Order Composition</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-green-50 rounded border border-green-200">
                  <div className="text-sm font-medium text-green-800">Top Order</div>
                  <div className="text-xl font-bold text-green-600">{configuration.battingOrder.topOrder}</div>
                  <div className="text-xs text-green-600">Positions 1-3</div>
                </div>
                <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                  <div className="text-sm font-medium text-yellow-800">Middle</div>
                  <div className="text-xl font-bold text-yellow-600">{configuration.battingOrder.middleOrder}</div>
                  <div className="text-xs text-yellow-600">Positions 4-6</div>
                </div>
                <div className="p-3 bg-red-50 rounded border border-red-200">
                  <div className="text-sm font-medium text-red-800">Lower</div>
                  <div className="text-xl font-bold text-red-600">{configuration.battingOrder.lowerOrder}</div>
                  <div className="text-xs text-red-600">Positions 7-11</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bowling Attack</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-blue-50 rounded border border-blue-200">
                  <div className="text-sm font-medium text-blue-800">Pacers</div>
                  <div className="text-xl font-bold text-blue-600">{configuration.bowlingStyle.pacers}</div>
                </div>
                <div className="p-3 bg-purple-50 rounded border border-purple-200">
                  <div className="text-sm font-medium text-purple-800">Spinners</div>
                  <div className="text-xl font-bold text-purple-600">{configuration.bowlingStyle.spinners}</div>
                </div>
                <div className="p-3 bg-orange-50 rounded border border-orange-200">
                  <div className="text-sm font-medium text-orange-800">Hybrid</div>
                  <div className="text-xl font-bold text-orange-600">{configuration.bowlingStyle.hybrid}</div>
                </div>
              </div>
              <div className="text-center">
                <Badge variant="secondary">Total: {getTotalBowlers()} bowling options</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Role Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Batsmen:</span>
                <Badge variant="outline">{configuration.roleDistribution.batsmen}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Bowlers:</span>
                <Badge variant="outline">{configuration.roleDistribution.bowlers}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">All-Rounders:</span>
                <Badge variant="outline">{configuration.roleDistribution.allRounders}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Wicket-Keepers:</span>
                <Badge variant="outline">{configuration.roleDistribution.wicketKeepers}</Badge>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center font-semibold">
                  <span>Total:</span>
                  <Badge>{getTotalPlayers()}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Generation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Number of Teams</Label>
                <div className="flex items-center gap-2 mt-2">
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

              <div>
                <Label className="text-sm font-medium">Team Split:</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="p-2 bg-blue-50 rounded text-center">
                    <div className="text-sm font-medium">Team A: {configuration.teamSplit.teamA}</div>
                  </div>
                  <div className="p-2 bg-red-50 rounded text-center">
                    <div className="text-sm font-medium">Team B: {configuration.teamSplit.teamB}</div>
                  </div>
                </div>
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

      <div className="mt-6 flex justify-between items-center">
        <Button variant="outline" onClick={() => setStage('configuration')}>
          Back to Configuration
        </Button>
        <Button onClick={handleGenerateTeams} className="bg-blue-600 hover:bg-blue-700">
          Generate {teamCount} Teams
        </Button>
      </div>
    </div>
  );
}
