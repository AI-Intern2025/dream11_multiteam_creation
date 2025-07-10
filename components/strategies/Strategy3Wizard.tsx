"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useMatchData } from '@/hooks/use-cricket-data';

interface Strategy3WizardProps {
  matchId: string;
  onGenerate: (prefs: any, count: number) => void;
}

export default function Strategy3Wizard({ matchId, onGenerate }: Strategy3WizardProps) {
  const { data: matchData } = useMatchData(matchId);
  const [teamCount, setTeamCount] = useState(15);
  const [currentStep, setCurrentStep] = useState<'conditions' | 'predictions' | 'analysis' | 'generation'>('conditions');
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Extract match conditions automatically from database
  const format = matchData?.match?.match_format || 'T20';
  const pitch = matchData?.match?.pitch_condition || 'Unknown';
  const weather = matchData?.match?.weather_condition || 'Unknown';
  const venue = matchData?.match?.venue_condition || 'Unknown';
  
  // Parse team names from team_name field (usually "Team A vs Team B" format)
  const teamNames = matchData?.match?.team_name?.split(' vs ') || ['Team A', 'Team B'];
  const team1Name = teamNames[0] || 'Team A';
  const team2Name = teamNames[1] || 'Team B';

  // User predictions state
  const [userPredictions, setUserPredictions] = useState<any>({});

  // Initialize predictions based on format
  useEffect(() => {
    if (format && format !== 'Unknown') {
      if (format === 'T20') {
        setUserPredictions({
          teamA: { runsExpected: '', wicketsConceded: '' },
          teamB: { runsExpected: '', wicketsConceded: '' }
        });
      } else if (format === 'ODI') {
        setUserPredictions({
          teamA: { runs50Overs: '', wicketsConceded: '' },
          teamB: { runs50Overs: '', wicketsConceded: '' }
        });
      } else if (format === 'Test') {
        setUserPredictions({
          teamA: { firstInnings: '', secondInnings: '', wicketsTaken: '' },
          teamB: { firstInnings: '', secondInnings: '', wicketsTaken: '' },
          topRunScorer: '',
          topWicketTaker: ''
        });
      }
    }
  }, [format]);

  // Auto-advance to predictions step once match data is loaded
  useEffect(() => {
    if (matchData && currentStep === 'conditions' && format !== 'Unknown') {
      // Small delay to show the conditions first
      setTimeout(() => setCurrentStep('predictions'), 1000);
    }
  }, [matchData, currentStep, format]);

  // AI Analysis function
  const generateAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          team1: team1Name,
          team2: team2Name,
          format,
          venue,
          pitch,
          weather,
          userPredictions
        }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Parse the analysis result
      try {
        const parsedAnalysis = JSON.parse(result.analysis);
        setAiAnalysis(parsedAnalysis);
      } catch (parseError) {
        console.error('Failed to parse AI response, using fallback:', parseError);
        setAiAnalysis(getFallbackAnalysis());
      }
      setCurrentStep('generation');
    } catch (error) {
      console.error('AI analysis failed:', error);
      setAiAnalysis(getFallbackAnalysis());
      setCurrentStep('generation');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Fallback analysis
  const getFallbackAnalysis = () => {
    return {
      format,
      predictions: {
        teamA: { runsExpected: 'medium', wicketsConceded: 'medium' },
        teamB: { runsExpected: 'medium', wicketsConceded: 'medium' },
        favoredRoles: ['BAT', 'BWL', 'AR'],
        corePlayerCount: 8,
        strategy: 'Balanced approach based on conditions and user predictions'
      }
    };
  };

  // Validation function to check if predictions are complete
  const arePredictionsComplete = () => {
    if (!userPredictions || Object.keys(userPredictions).length === 0) return false;
    
    if (format === 'T20') {
      return userPredictions.teamA?.runsExpected && userPredictions.teamA?.wicketsConceded &&
             userPredictions.teamB?.runsExpected && userPredictions.teamB?.wicketsConceded;
    } else if (format === 'ODI') {
      return userPredictions.teamA?.runs50Overs && userPredictions.teamA?.wicketsConceded &&
             userPredictions.teamB?.runs50Overs && userPredictions.teamB?.wicketsConceded;
    } else if (format === 'Test') {
      return userPredictions.teamA?.firstInnings && userPredictions.teamA?.secondInnings && 
             userPredictions.teamA?.wicketsTaken && userPredictions.teamB?.firstInnings && 
             userPredictions.teamB?.secondInnings && userPredictions.teamB?.wicketsTaken &&
             userPredictions.topRunScorer && userPredictions.topWicketTaker;
    }
    return false;
  };

  // Step 1: Match Conditions (Auto-detected)
  if (currentStep === 'conditions') {
    return (
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Strategy 3: Score & Storyline Prediction</h2>
        <p className="text-gray-600 mb-6">
          This strategy analyzes match conditions and your predictions to generate optimized teams with strategic variation.
        </p>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Step 1: Auto-Detected Match Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <strong className="text-blue-700">Format</strong>
                <p className="text-sm">{format}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <strong className="text-green-700">Pitch</strong>
                <p className="text-sm">{pitch}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <strong className="text-yellow-700">Weather</strong>
                <p className="text-sm">{weather}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <strong className="text-purple-700">Venue</strong>
                <p className="text-sm">{venue}</p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <Button onClick={() => setCurrentStep('predictions')} className="bg-blue-600 hover:bg-blue-700">
                Next: Make Your Predictions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 2: User Predictions Input
  if (currentStep === 'predictions') {
    return (
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Step 2: Make Your Match Predictions</h2>
        <p className="text-gray-600 mb-6">
          Based on the match conditions, predict how you think the match will unfold. AI will analyze your predictions.
        </p>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Match Predictions: {team1Name} vs {team2Name}</CardTitle>
          </CardHeader>
          <CardContent>
            {format === 'T20' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-blue-600">{team1Name} Predictions</h4>
                  <div>
                    <label className="block text-sm font-medium mb-1">Runs Expected</label>
                    <Select value={userPredictions.teamA?.runsExpected} onValueChange={(value) => 
                      setUserPredictions((prev: any) => ({...prev, teamA: {...prev.teamA, runsExpected: value}}))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select runs expectation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High (170+ runs)</SelectItem>
                        <SelectItem value="medium">Medium (140-170 runs)</SelectItem>
                        <SelectItem value="low">Low (&lt; 140 runs)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Wickets They'll Concede</label>
                    <Select value={userPredictions.teamA?.wicketsConceded} onValueChange={(value) => 
                      setUserPredictions((prev: any) => ({...prev, teamA: {...prev.teamA, wicketsConceded: value}}))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select wickets conceded" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High (7+ wickets)</SelectItem>
                        <SelectItem value="medium">Medium (4-6 wickets)</SelectItem>
                        <SelectItem value="low">Low (&lt; 4 wickets)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-red-600">{team2Name} Predictions</h4>
                  <div>
                    <label className="block text-sm font-medium mb-1">Runs Expected</label>
                    <Select value={userPredictions.teamB?.runsExpected} onValueChange={(value) => 
                      setUserPredictions((prev: any) => ({...prev, teamB: {...prev.teamB, runsExpected: value}}))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select runs expectation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High (170+ runs)</SelectItem>
                        <SelectItem value="medium">Medium (140-170 runs)</SelectItem>
                        <SelectItem value="low">Low (&lt; 140 runs)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Wickets They'll Concede</label>
                    <Select value={userPredictions.teamB?.wicketsConceded} onValueChange={(value) => 
                      setUserPredictions((prev: any) => ({...prev, teamB: {...prev.teamB, wicketsConceded: value}}))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select wickets conceded" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High (7+ wickets)</SelectItem>
                        <SelectItem value="medium">Medium (4-6 wickets)</SelectItem>
                        <SelectItem value="low">Low (&lt; 4 wickets)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {format === 'ODI' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-blue-600">{team1Name} Predictions (50 Overs)</h4>
                  <div>
                    <label className="block text-sm font-medium mb-1">Runs in 50 Overs</label>
                    <Input
                      type="number"
                      placeholder="e.g., 280"
                      value={userPredictions.teamA?.runs50Overs}
                      onChange={(e) => setUserPredictions((prev: any) => ({...prev, teamA: {...prev.teamA, runs50Overs: e.target.value}}))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Wickets Conceded</label>
                    <Input
                      type="number"
                      placeholder="e.g., 6"
                      max="10"
                      value={userPredictions.teamA?.wicketsConceded}
                      onChange={(e) => setUserPredictions((prev: any) => ({...prev, teamA: {...prev.teamA, wicketsConceded: e.target.value}}))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-red-600">{team2Name} Predictions (50 Overs)</h4>
                  <div>
                    <label className="block text-sm font-medium mb-1">Runs in 50 Overs</label>
                    <Input
                      type="number"
                      placeholder="e.g., 270"
                      value={userPredictions.teamB?.runs50Overs}
                      onChange={(e) => setUserPredictions((prev: any) => ({...prev, teamB: {...prev.teamB, runs50Overs: e.target.value}}))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Wickets Conceded</label>
                    <Input
                      type="number"
                      placeholder="e.g., 7"
                      max="10"
                      value={userPredictions.teamB?.wicketsConceded}
                      onChange={(e) => setUserPredictions((prev: any) => ({...prev, teamB: {...prev.teamB, wicketsConceded: e.target.value}}))}
                    />
                  </div>
                </div>
              </div>
            )}

            {format === 'Test' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-blue-600">{team1Name} Innings</h4>
                    <div>
                      <label className="block text-sm font-medium mb-1">First Innings Runs</label>
                      <Input
                        type="number"
                        placeholder="e.g., 350"
                        value={userPredictions.teamA?.firstInnings}
                        onChange={(e) => setUserPredictions((prev: any) => ({...prev, teamA: {...prev.teamA, firstInnings: e.target.value}}))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Second Innings Runs</label>
                      <Input
                        type="number"
                        placeholder="e.g., 200"
                        value={userPredictions.teamA?.secondInnings}
                        onChange={(e) => setUserPredictions((prev: any) => ({...prev, teamA: {...prev.teamA, secondInnings: e.target.value}}))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Wickets Taken</label>
                      <Input
                        type="number"
                        placeholder="e.g., 15"
                        max="20"
                        value={userPredictions.teamA?.wicketsTaken}
                        onChange={(e) => setUserPredictions((prev: any) => ({...prev, teamA: {...prev.teamA, wicketsTaken: e.target.value}}))}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-red-600">{team2Name} Innings</h4>
                    <div>
                      <label className="block text-sm font-medium mb-1">First Innings Runs</label>
                      <Input
                        type="number"
                        placeholder="e.g., 320"
                        value={userPredictions.teamB?.firstInnings}
                        onChange={(e) => setUserPredictions((prev: any) => ({...prev, teamB: {...prev.teamB, firstInnings: e.target.value}}))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Second Innings Runs</label>
                      <Input
                        type="number"
                        placeholder="e.g., 180"
                        value={userPredictions.teamB?.secondInnings}
                        onChange={(e) => setUserPredictions((prev: any) => ({...prev, teamB: {...prev.teamB, secondInnings: e.target.value}}))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Wickets Taken</label>
                      <Input
                        type="number"
                        placeholder="e.g., 12"
                        max="20"
                        value={userPredictions.teamB?.wicketsTaken}
                        onChange={(e) => setUserPredictions((prev: any) => ({...prev, teamB: {...prev.teamB, wicketsTaken: e.target.value}}))}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Top Run-Scorer (Player Name)</label>
                    <Input
                      placeholder="e.g., Virat Kohli"
                      value={userPredictions.topRunScorer}
                      onChange={(e) => setUserPredictions((prev: any) => ({...prev, topRunScorer: e.target.value}))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Top Wicket-Taker (Player Name)</label>
                    <Input
                      placeholder="e.g., Jasprit Bumrah"
                      value={userPredictions.topWicketTaker}
                      onChange={(e) => setUserPredictions((prev: any) => ({...prev, topWicketTaker: e.target.value}))}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('conditions')}>
                Back to Conditions
              </Button>
              <Button 
                onClick={() => setCurrentStep('analysis')} 
                className="bg-green-600 hover:bg-green-700"
                disabled={!arePredictionsComplete()}
              >
                Next: AI Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 3: AI Analysis
  if (currentStep === 'analysis') {
    return (
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Step 3: AI Analysis Based on Your Predictions</h2>
        <p className="text-gray-600 mb-6">
          AI will analyze your match predictions combined with the detected conditions to recommend optimal team strategies.
        </p>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Your Predictions Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-700 mb-2">{team1Name}</h4>
                {format === 'T20' && (
                  <>
                    <p className="text-sm">Runs Expected: {userPredictions.teamA?.runsExpected}</p>
                    <p className="text-sm">Wickets Conceded: {userPredictions.teamA?.wicketsConceded}</p>
                  </>
                )}
                {format === 'ODI' && (
                  <>
                    <p className="text-sm">Runs (50 overs): {userPredictions.teamA?.runs50Overs}</p>
                    <p className="text-sm">Wickets Conceded: {userPredictions.teamA?.wicketsConceded}</p>
                  </>
                )}
                {format === 'Test' && (
                  <>
                    <p className="text-sm">1st Innings: {userPredictions.teamA?.firstInnings}</p>
                    <p className="text-sm">2nd Innings: {userPredictions.teamA?.secondInnings}</p>
                    <p className="text-sm">Wickets Taken: {userPredictions.teamA?.wicketsTaken}</p>
                  </>
                )}
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <h4 className="font-semibold text-red-700 mb-2">{team2Name}</h4>
                {format === 'T20' && (
                  <>
                    <p className="text-sm">Runs Expected: {userPredictions.teamB?.runsExpected}</p>
                    <p className="text-sm">Wickets Conceded: {userPredictions.teamB?.wicketsConceded}</p>
                  </>
                )}
                {format === 'ODI' && (
                  <>
                    <p className="text-sm">Runs (50 overs): {userPredictions.teamB?.runs50Overs}</p>
                    <p className="text-sm">Wickets Conceded: {userPredictions.teamB?.wicketsConceded}</p>
                  </>
                )}
                {format === 'Test' && (
                  <>
                    <p className="text-sm">1st Innings: {userPredictions.teamB?.firstInnings}</p>
                    <p className="text-sm">2nd Innings: {userPredictions.teamB?.secondInnings}</p>
                    <p className="text-sm">Wickets Taken: {userPredictions.teamB?.wicketsTaken}</p>
                  </>
                )}
              </div>
            </div>

            <div className="text-center">
              <Button 
                onClick={generateAIAnalysis} 
                disabled={isAnalyzing}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isAnalyzing ? 'AI Analyzing...' : 'Generate AI Analysis'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 4: Generation with AI Analysis
  if (currentStep === 'generation' && aiAnalysis) {
    return (
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Step 4: AI-Driven Team Generation</h2>
        <p className="text-gray-600 mb-6">
          Based on your predictions and match conditions, AI has analyzed the optimal strategy for team generation.
        </p>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">AI Strategy Recommendation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-indigo-50 rounded-lg mb-4">
              <h4 className="font-semibold text-indigo-800 mb-2">AI Analysis Result</h4>
              <p className="text-sm text-indigo-700">{aiAnalysis.predictions?.strategy}</p>
              <p className="text-xs text-indigo-600 mt-2">
                Core Players: {aiAnalysis.predictions?.corePlayerCount} | Favored Roles: {aiAnalysis.predictions?.favoredRoles?.join(', ')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-3 bg-green-50 rounded-lg">
                <h5 className="font-medium text-green-800">Team Generation Process:</h5>
                <ul className="text-sm text-green-700 mt-2 space-y-1">
                  <li>• {aiAnalysis.predictions?.corePlayerCount || 8} core players based on your predictions</li>
                  <li>• {11 - (aiAnalysis.predictions?.corePlayerCount || 8)} differential players for variation</li>
                  <li>• Captain/Vice-Captain rotation based on match expectations</li>
                  <li>• Dream11 constraints: ≤100 credits, ≤7 from one team</li>
                </ul>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg">
                <h5 className="font-medium text-blue-800">Match Conditions Applied:</h5>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• Format: {format}</li>
                  <li>• Pitch: {pitch}</li>
                  <li>• Weather: {weather}</li>
                  <li>• Venue: {venue}</li>
                </ul>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Number of Teams to Generate</label>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setTeamCount(Math.max(1, teamCount - 1))} disabled={teamCount <= 1}>-</Button>
                <span className="px-4 py-2 bg-gray-100 rounded">{teamCount}</span>
                <Button variant="outline" onClick={() => setTeamCount(Math.min(50, teamCount + 1))} disabled={teamCount >= 50}>+</Button>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('predictions')}>
                Back to Predictions
              </Button>
              <Button 
                onClick={() => onGenerate({ 
                  strategy: 'differential',
                  aiAnalysis, 
                  userPredictions, 
                  matchConditions: { format, pitch, weather, venue },
                  team1Name,
                  team2Name
                }, teamCount)} 
                className="bg-blue-600 hover:bg-blue-700"
              >
                Generate {teamCount} Teams
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Strategy 3: Score & Storyline Prediction</h2>
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading match data...</p>
        </div>
      </div>
    </div>
  );
}
