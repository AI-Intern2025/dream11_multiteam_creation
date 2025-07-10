"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMatchData } from '@/hooks/use-cricket-data';

interface Strategy3WizardProps {
  matchId: string;
  onGenerate: (prefs: any, count: number) => void;
}

export default function Strategy3Wizard({ matchId, onGenerate }: Strategy3WizardProps) {
  const { data: matchData } = useMatchData(matchId);
  const [teamCount, setTeamCount] = useState(15);
  const [stage, setStage] = useState<'predictions' | 'summary'>('predictions');
  const [predictions, setPredictions] = useState({
    teamA: {
      runs: 'medium' as 'high' | 'medium' | 'low',
      wickets: 'medium' as 'high' | 'medium' | 'low'
    },
    teamB: {
      runs: 'medium' as 'high' | 'medium' | 'low',
      wickets: 'medium' as 'high' | 'medium' | 'low'
    }
  });

  const matchName = matchData?.match?.team_name || 'Team A vs Team B';
  const [teamAName, teamBName] = matchName.split(' vs ');

  const updatePrediction = (team: 'teamA' | 'teamB', type: 'runs' | 'wickets', value: 'high' | 'medium' | 'low') => {
    setPredictions(prev => ({
      ...prev,
      [team]: {
        ...prev[team],
        [type]: value
      }
    }));
  };

  const generateSummary = () => {
    const { teamA, teamB } = predictions;
    let summary = '';
    
    if (teamA.runs === 'high' && teamB.runs === 'low') {
      summary = `You expect a batting pitch favoring ${teamAName}; ${teamAName} will rack up 200+, ${teamBName} will struggle.`;
    } else if (teamA.runs === 'low' && teamB.runs === 'high') {
      summary = `You expect ${teamBName} to dominate with the bat while ${teamAName} will collapse.`;
    } else if (teamA.runs === 'high' && teamB.runs === 'high') {
      summary = `You expect a high-scoring thriller with both teams posting big totals.`;
    } else if (teamA.runs === 'low' && teamB.runs === 'low') {
      summary = `You expect a low-scoring affair with bowlers dominating both sides.`;
    } else {
      summary = `You expect a balanced contest with moderate scoring from both teams.`;
    }

    return summary;
  };

  const handleSavePredictions = () => {
    setStage('summary');
  };

  const handleGenerateTeams = () => {
    const strategyData = {
      predictions,
      summary: generateSummary(),
      teamNames: { teamA: teamAName, teamB: teamBName }
    };
    onGenerate(strategyData, teamCount);
  };

  if (stage === 'predictions') {
    return (
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Score & Storyline Prediction</h2>
          <p className="text-gray-600 mb-4">
            Predict how the match will unfold to generate teams that align with your expectations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Team A Predictions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-blue-600">{teamAName}</CardTitle>
              <CardDescription>Predict their performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Runs Expected</label>
                <div className="flex gap-2">
                  {(['high', 'medium', 'low'] as const).map((level) => (
                    <Button
                      key={level}
                      variant={predictions.teamA.runs === level ? 'default' : 'outline'}
                      onClick={() => updatePrediction('teamA', 'runs', level)}
                      className="flex-1"
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  High: 200+ | Medium: 140-200 | Low: &lt;140
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Wickets They&apos;ll Concede</label>
                <div className="flex gap-2">
                  {(['high', 'medium', 'low'] as const).map((level) => (
                    <Button
                      key={level}
                      variant={predictions.teamA.wickets === level ? 'default' : 'outline'}
                      onClick={() => updatePrediction('teamA', 'wickets', level)}
                      className="flex-1"
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  High: 8+ wickets | Medium: 5-7 wickets | Low: &lt;5 wickets
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Team B Predictions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-red-600">{teamBName}</CardTitle>
              <CardDescription>Predict their performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Runs Expected</label>
                <div className="flex gap-2">
                  {(['high', 'medium', 'low'] as const).map((level) => (
                    <Button
                      key={level}
                      variant={predictions.teamB.runs === level ? 'default' : 'outline'}
                      onClick={() => updatePrediction('teamB', 'runs', level)}
                      className="flex-1"
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  High: 200+ | Medium: 140-200 | Low: &lt;140
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Wickets They&apos;ll Concede</label>
                <div className="flex gap-2">
                  {(['high', 'medium', 'low'] as const).map((level) => (
                    <Button
                      key={level}
                      variant={predictions.teamB.wickets === level ? 'default' : 'outline'}
                      onClick={() => updatePrediction('teamB', 'wickets', level)}
                      className="flex-1"
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  High: 8+ wickets | Medium: 5-7 wickets | Low: &lt;5 wickets
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">Match Conditions Context:</h3>
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
        </div>

        <div className="mt-6 flex justify-between items-center">
          <Button variant="outline" onClick={() => window.history.back()}>
            Back to Match
          </Button>
          <Button onClick={handleSavePredictions} className="bg-blue-600 hover:bg-blue-700">
            Save Predictions
          </Button>
        </div>
      </div>
    );
  }

  // Summary stage
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Match Storyline Summary</h2>
        <p className="text-gray-600 mb-4">
          Based on your predictions, here&apos;s your expected match storyline:
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Your Storyline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-gray-50 rounded-lg mb-4">
            <p className="text-gray-800 italic">&quot;{generateSummary()}&quot;</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-semibold mb-2">{teamAName} Predictions</h4>
              <div className="space-y-1">
                <Badge variant={predictions.teamA.runs === 'high' ? 'default' : 'secondary'}>
                  Runs: {predictions.teamA.runs}
                </Badge>
                <Badge variant={predictions.teamA.wickets === 'low' ? 'default' : 'secondary'}>
                  Wickets Given: {predictions.teamA.wickets}
                </Badge>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">{teamBName} Predictions</h4>
              <div className="space-y-1">
                <Badge variant={predictions.teamB.runs === 'high' ? 'default' : 'secondary'}>
                  Runs: {predictions.teamB.runs}
                </Badge>
                <Badge variant={predictions.teamB.wickets === 'low' ? 'default' : 'secondary'}>
                  Wickets Given: {predictions.teamB.wickets}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Team Generation Strategy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Number of Teams</label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setTeamCount(Math.max(1, teamCount - 1))}
                disabled={teamCount <= 1}
              >
                -
              </Button>
              <span className="px-4 py-2 bg-gray-100 rounded">{teamCount}</span>
              <Button
                variant="outline"
                onClick={() => setTeamCount(Math.min(50, teamCount + 1))}
                disabled={teamCount >= 50}
              >
                +
              </Button>
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">AI Strategy:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Teams will be optimized based on your storyline predictions</li>
              <li>• High-scoring teams will stack top-order batsmen</li>
              <li>• Low-scoring predictions will favor bowlers and all-rounders</li>
              <li>• Captain suggestions will align with expected standout performers</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-between items-center">
        <Button variant="outline" onClick={() => setStage('predictions')}>
          Back to Predictions
        </Button>
        <Button onClick={handleGenerateTeams} className="bg-blue-600 hover:bg-blue-700">
          Generate {teamCount} Teams
        </Button>
      </div>
    </div>
  );
}
