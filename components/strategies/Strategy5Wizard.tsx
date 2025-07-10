"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface Strategy5WizardProps {
  matchId: string;
  onGenerate: (prefs: any, count: number) => void;
}

export default function Strategy5Wizard({ matchId, onGenerate }: Strategy5WizardProps) {
  const [teamCount, setTeamCount] = useState(15);
  const [stage, setStage] = useState<'filters' | 'summary'>('filters');
  
  const [filters, setFilters] = useState({
    dreamTeamPercentage: { min: 0, max: 100 },
    selectionPercentage: { min: 0, max: 100 },
    averagePoints: { min: 0, max: 200 },
    credits: { min: 6, max: 12 },
    playerRoles: {
      batsmen: { min: 3, max: 6 },
      bowlers: { min: 3, max: 6 },
      allRounders: { min: 1, max: 4 },
      wicketKeepers: { min: 1, max: 2 }
    }
  });

  const updateFilter = (category: string, field: string, value: number, isMax = false) => {
    setFilters(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [isMax ? 'max' : 'min']: value
      }
    }));
  };

  const updateRoleFilter = (role: string, field: string, value: number) => {
    setFilters(prev => ({
      ...prev,
      playerRoles: {
        ...prev.playerRoles,
        [role]: {
          ...prev.playerRoles[role as keyof typeof prev.playerRoles],
          [field]: value
        }
      }
    }));
  };

  const handleSaveGuardrails = () => {
    setStage('summary');
  };

  const handleGenerateTeams = () => {
    const strategyData = {
      filters,
      summary: generateSummary()
    };
    onGenerate(strategyData, teamCount);
  };

  const generateSummary = () => {
    const { dreamTeamPercentage, selectionPercentage, averagePoints, playerRoles } = filters;
    
    let summary = 'Generating teams with ';
    
    if (selectionPercentage.min > 20) {
      summary += 'high-ownership players, ';
    } else if (selectionPercentage.max < 10) {
      summary += 'differential picks, ';
    } else {
      summary += 'balanced ownership, ';
    }
    
    if (averagePoints.min > 100) {
      summary += 'in-form performers, ';
    }
    
    if (playerRoles.allRounders.min >= 3) {
      summary += 'all-rounder heavy lineups, ';
    }
    
    if (dreamTeamPercentage.min > 50) {
      summary += 'and proven high-value players.';
    } else {
      summary += 'and value picks.';
    }
    
    return summary;
  };

  if (stage === 'filters') {
    return (
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Stats-Driven Guardrails</h2>
          <p className="text-gray-600 mb-4">
            Set numerical filters to generate teams with players meeting your specific criteria.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Player Performance Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Player Performance Filters</CardTitle>
              <CardDescription>Set ranges for player statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium">Dream Team Percentage</Label>
                <div className="mt-2 space-y-2">
                  <Slider
                    value={[filters.dreamTeamPercentage.min, filters.dreamTeamPercentage.max]}
                    onValueChange={([min, max]) => setFilters(prev => ({
                      ...prev,
                      dreamTeamPercentage: { min, max }
                    }))}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{filters.dreamTeamPercentage.min}%</span>
                    <span>{filters.dreamTeamPercentage.max}%</span>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Selection Percentage</Label>
                <div className="mt-2 space-y-2">
                  <Slider
                    value={[filters.selectionPercentage.min, filters.selectionPercentage.max]}
                    onValueChange={([min, max]) => setFilters(prev => ({
                      ...prev,
                      selectionPercentage: { min, max }
                    }))}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{filters.selectionPercentage.min}%</span>
                    <span>{filters.selectionPercentage.max}%</span>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Average Points</Label>
                <div className="mt-2 space-y-2">
                  <Slider
                    value={[filters.averagePoints.min, filters.averagePoints.max]}
                    onValueChange={([min, max]) => setFilters(prev => ({
                      ...prev,
                      averagePoints: { min, max }
                    }))}
                    max={200}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{filters.averagePoints.min} pts</span>
                    <span>{filters.averagePoints.max} pts</span>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Credit Range</Label>
                <div className="mt-2 space-y-2">
                  <Slider
                    value={[filters.credits.min, filters.credits.max]}
                    onValueChange={([min, max]) => setFilters(prev => ({
                      ...prev,
                      credits: { min, max }
                    }))}
                    min={6}
                    max={12}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{filters.credits.min} cr</span>
                    <span>{filters.credits.max} cr</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role Composition Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Role Composition</CardTitle>
              <CardDescription>Define team structure requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium">Batsmen Count</Label>
                <div className="mt-2 space-y-2">
                  <Slider
                    value={[filters.playerRoles.batsmen.min, filters.playerRoles.batsmen.max]}
                    onValueChange={([min, max]) => setFilters(prev => ({
                      ...prev,
                      playerRoles: {
                        ...prev.playerRoles,
                        batsmen: { min, max }
                      }
                    }))}
                    min={1}
                    max={8}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{filters.playerRoles.batsmen.min}</span>
                    <span>{filters.playerRoles.batsmen.max}</span>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Bowlers Count</Label>
                <div className="mt-2 space-y-2">
                  <Slider
                    value={[filters.playerRoles.bowlers.min, filters.playerRoles.bowlers.max]}
                    onValueChange={([min, max]) => setFilters(prev => ({
                      ...prev,
                      playerRoles: {
                        ...prev.playerRoles,
                        bowlers: { min, max }
                      }
                    }))}
                    min={1}
                    max={8}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{filters.playerRoles.bowlers.min}</span>
                    <span>{filters.playerRoles.bowlers.max}</span>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">All-Rounders Count</Label>
                <div className="mt-2 space-y-2">
                  <Slider
                    value={[filters.playerRoles.allRounders.min, filters.playerRoles.allRounders.max]}
                    onValueChange={([min, max]) => setFilters(prev => ({
                      ...prev,
                      playerRoles: {
                        ...prev.playerRoles,
                        allRounders: { min, max }
                      }
                    }))}
                    min={0}
                    max={5}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{filters.playerRoles.allRounders.min}</span>
                    <span>{filters.playerRoles.allRounders.max}</span>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Wicket-Keepers Count</Label>
                <div className="mt-2 space-y-2">
                  <Slider
                    value={[filters.playerRoles.wicketKeepers.min, filters.playerRoles.wicketKeepers.max]}
                    onValueChange={([min, max]) => setFilters(prev => ({
                      ...prev,
                      playerRoles: {
                        ...prev.playerRoles,
                        wicketKeepers: { min, max }
                      }
                    }))}
                    min={1}
                    max={3}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{filters.playerRoles.wicketKeepers.min}</span>
                    <span>{filters.playerRoles.wicketKeepers.max}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">Filter Preview:</h3>
          <p className="text-sm text-blue-700">{generateSummary()}</p>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <Button variant="outline" onClick={() => window.history.back()}>
            Back to Match
          </Button>
          <Button onClick={handleSaveGuardrails} className="bg-blue-600 hover:bg-blue-700">
            Save Guardrails
          </Button>
        </div>
      </div>
    );
  }

  // Summary stage
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Stats-Driven Guardrails Summary</h2>
        <p className="text-gray-600 mb-4">
          Review your statistical filters before generating teams.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Criteria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm font-medium text-gray-600">Dream Team %</div>
                <div className="text-lg font-bold">{filters.dreamTeamPercentage.min}% - {filters.dreamTeamPercentage.max}%</div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm font-medium text-gray-600">Selection %</div>
                <div className="text-lg font-bold">{filters.selectionPercentage.min}% - {filters.selectionPercentage.max}%</div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm font-medium text-gray-600">Avg Points</div>
                <div className="text-lg font-bold">{filters.averagePoints.min} - {filters.averagePoints.max}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm font-medium text-gray-600">Credits</div>
                <div className="text-lg font-bold">{filters.credits.min} - {filters.credits.max}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Composition</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Batsmen:</span>
                <span className="font-bold">{filters.playerRoles.batsmen.min} - {filters.playerRoles.batsmen.max}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Bowlers:</span>
                <span className="font-bold">{filters.playerRoles.bowlers.min} - {filters.playerRoles.bowlers.max}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">All-Rounders:</span>
                <span className="font-bold">{filters.playerRoles.allRounders.min} - {filters.playerRoles.allRounders.max}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Wicket-Keepers:</span>
                <span className="font-bold">{filters.playerRoles.wicketKeepers.min} - {filters.playerRoles.wicketKeepers.max}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-800 italic">
              &quot;{generateSummary()}&quot;
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Team Generation Settings</CardTitle>
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
                onClick={() => setTeamCount(Math.min(50, teamCount + 1))}
              >
                +
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-between items-center">
        <Button variant="outline" onClick={() => setStage('filters')}>
          Back to Filters
        </Button>
        <Button onClick={handleGenerateTeams} className="bg-blue-600 hover:bg-blue-700">
          Generate {teamCount} Teams
        </Button>
      </div>
    </div>
  );
}
