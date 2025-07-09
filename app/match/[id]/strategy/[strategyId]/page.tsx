"use client";

import { useState, use } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, MessageCircle, Send, Users, Trophy, Target, BarChart3, Bot, Sparkles, Plus } from 'lucide-react';
import Link from 'next/link';
import { useMatchData, useChatbot } from '@/hooks/use-cricket-data';

const strategyConfigs = {
  'ai-chatbot': {
    title: 'AI-Guided Assistant',
    description: 'Interactive AI chatbot with live match insights',
    icon: MessageCircle,
    color: 'bg-blue-50 border-blue-200'
  },
  'same-xi': {
    title: 'Same XI, Different Captains',
    description: 'Keep the same team, vary captaincy choices',
    icon: Users,
    color: 'bg-purple-50 border-purple-200'
  },
  'score-prediction': {
    title: 'Score & Storyline Prediction',
    description: 'Predict match outcomes and storylines',
    icon: BarChart3,
    color: 'bg-green-50 border-green-200'
  },
  'core-hedge': {
    title: 'Core-Hedge Player Selection',
    description: 'Select core players and hedge with differentials',
    icon: Target,
    color: 'bg-yellow-50 border-yellow-200'
  },
  'stats-driven': {
    title: 'Stats-Driven Guardrails',
    description: 'Use statistical filters and constraints',
    icon: BarChart3,
    color: 'bg-red-50 border-red-200'
  },
  'preset-scenarios': {
    title: 'Preset Scenarios',
    description: 'Choose from predefined configurations',
    icon: Target,
    color: 'bg-gray-50 border-gray-200'
  },
  'role-split': {
    title: 'Role-Split Lineups',
    description: 'Define role ratios and team balance',
    icon: Users,
    color: 'bg-indigo-50 border-indigo-200'
  },
  'base-team': {
    title: 'Base Team + Rule-Based Edits',
    description: 'Start with base team and apply rules',
    icon: Target,
    color: 'bg-teal-50 border-teal-200'
  }
};

const chatbotQuestions = [
  {
    id: 1,
    question: "Who do you think will win?",
    options: ["England", "India", "Close Match"],
    type: "single"
  },
  {
    id: 2,
    question: "What final score range do you expect?",
    options: ["High (180+)", "Medium (150-180)", "Low (<150)"],
    type: "single"
  },
  {
    id: 3,
    question: "Any players you're backing?",
    options: ["Virat Kohli", "Joe Root", "Jasprit Bumrah", "Other"],
    type: "multiple"
  },
  {
    id: 4,
    question: "Which story will unfold?",
    options: ["Batting Paradise", "Bowlers' Game", "Balanced Contest", "Weather Interruption"],
    type: "single"
  }
];

export default function StrategyPage({ 
  params,
  searchParams
}: {
  params: Promise<{ id: string; strategyId: string }>;
  searchParams: Promise<{ teams?: string }>;
}) {
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);
  const [chatResponses, setChatResponses] = useState<Record<number, string[]>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [generatedTeams, setGeneratedTeams] = useState<Array<{ captain: string; viceCaptain: string; players?: string[] }>>([]);
  
  const { data: matchData } = useMatchData(resolvedParams.id);
  const { sendMessage, loading: chatLoading } = useChatbot();

  const strategy = strategyConfigs[resolvedParams.strategyId as keyof typeof strategyConfigs];
  const teamCount = resolvedSearchParams.teams || '10';

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage = currentMessage;
    setCurrentMessage('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    const response = await sendMessage(userMessage, resolvedParams.id);
    setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
  };

  const handleChatbotResponse = (questionId: number, answer: string, isMultiple: boolean) => {
    setChatResponses(prev => {
      const current = prev[questionId] || [];
      if (isMultiple) {
        if (current.includes(answer)) {
          return { ...prev, [questionId]: current.filter(a => a !== answer) };
        } else {
          return { ...prev, [questionId]: [...current, answer] };
        }
      } else {
        return { ...prev, [questionId]: [answer] };
      }
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < chatbotQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setIsComplete(true);
    }
  };

  const renderAIChatbot = () => (
    <div className="space-y-6">
      {/* AI Analysis Summary */}
      {matchData?.analysis && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-blue-500" />
              <span>AI Match Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Match Prediction:</strong> {matchData.analysis.matchPrediction?.winnerPrediction} 
                ({matchData.analysis.matchPrediction?.confidence}% confidence)
              </div>
              <div>
                <strong>Top Captain:</strong> {matchData.analysis.captaincy?.primary?.name}
              </div>
              <div>
                <strong>Match Type:</strong> {matchData.analysis.matchPrediction?.matchType}
              </div>
              <div>
                <strong>Weather Impact:</strong> {matchData.analysis.conditions?.weatherImpact}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interactive Chat */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-blue-500" />
            <span>AI Cricket Expert</span>
          </CardTitle>
          <CardDescription>Ask me anything about this match, players, or team creation strategy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Chat Messages */}
            <div className="h-64 overflow-y-auto border rounded-lg p-4 bg-gray-50">
              {chatMessages.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                  <Bot className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>Hi! I'm your AI cricket expert. Ask me about:</p>
                  <ul className="text-sm mt-2 space-y-1">
                    <li>• Player form and recommendations</li>
                    <li>• Match conditions and weather impact</li>
                    <li>• Captain and vice-captain choices</li>
                    <li>• Team composition strategies</li>
                  </ul>
                </div>
              )}
              
              {chatMessages.map((message, index) => (
                <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block p-3 rounded-lg max-w-xs ${
                    message.role === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white border'
                  }`}>
                    {message.content}
                  </div>
                </div>
              ))}
              
              {chatLoading && (
                <div className="text-left">
                  <div className="inline-block p-3 rounded-lg bg-white border">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      <span>AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Chat Input */}
            <div className="flex space-x-2">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Ask about players, conditions, or strategy..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={chatLoading}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={chatLoading || !currentMessage.trim()}
                className="btn-primary"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Quick Questions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                "Who should I captain?",
                "What's the weather impact?",
                "Which players are in form?",
                "How will the pitch play?"
              ].map((question) => (
                <Button
                  key={question}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentMessage(question);
                    handleSendMessage();
                  }}
                  disabled={chatLoading}
                  className="text-xs"
                >
                  {question}
                </Button>
              ))}
            </div>
            
            <Link href={`/match/${resolvedParams.id}/teams?strategy=${resolvedParams.strategyId}&teams=${teamCount}`}>
              <Button className="w-full btn-primary">
                <Send className="mr-2 h-4 w-4" />
                Generate {teamCount} AI-Optimized Teams
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSameXI = () => {
    const allPlayers = matchData?.playerProfiles || matchData?.lineups || [];
    // Get the two teams' ids, abbreviations, and names from the match object
    const getTeamKeys = (teamObj: any) => [teamObj?.id, teamObj?.abbreviation, teamObj?.name].filter(Boolean);
    const team1Keys = getTeamKeys(matchData?.match?.competitors?.[0] || {}).map((k: any) => String(k).toLowerCase());
    const team2Keys = getTeamKeys(matchData?.match?.competitors?.[1] || {}).map((k: any) => String(k).toLowerCase());
    // Helper to get all possible team keys from a player object
    const getPlayerTeamKeys = (p: any) => [p.team, p.teamId, p.team_id, p.team_name, p.teamAbbreviation, p.team_abbreviation, p.teamName].filter(Boolean).map((k: any) => String(k).toLowerCase());
    const team1Players = allPlayers.filter((p: any) => {
      const playerTeamKeys = getPlayerTeamKeys(p);
      return team1Keys.some(key => playerTeamKeys.includes(key));
    });
    const team2Players = allPlayers.filter((p: any) => {
      const playerTeamKeys = getPlayerTeamKeys(p);
      return team2Keys.some(key => playerTeamKeys.includes(key));
    });

    const handlePlayerSelection = (playerId: string) => {
      setSelectedPlayers(prev => {
        if (prev.includes(playerId)) {
          return prev.filter(id => id !== playerId);
        } else if (prev.length < 11) {
          return [...prev, playerId];
        }
        return prev;
      });
    };

    const totalCredits = selectedPlayers.length * 9; // Mock calculation

    const [showCaptainSelection, setShowCaptainSelection] = useState(false);
    const [captain, setCaptain] = useState<string | null>(null);
    const [viceCaptain, setViceCaptain] = useState<string | null>(null);
    const [combinations, setCombinations] = useState<Array<{ captain: string; viceCaptain: string; percentage?: number }>>([]);

    // Helper to get player name by id
    const getPlayerName = (id: string) => {
      const player = allPlayers.find((p: any) => p.id === id);
      return player ? player.name : id;
    };

    // Add combination handler
    const handleAddCombination = () => {
      if (captain && viceCaptain && captain !== viceCaptain) {
        const totalPercentage = combinations.reduce((sum, combo) => sum + (combo.percentage || 0), 0);
        if (totalPercentage > 100) {
          alert('Total percentage cannot exceed 100.');
          return;
        }
        setCombinations(prev => [...prev, { captain, viceCaptain }]);
        setCaptain(null);
        setViceCaptain(null);
      }
    };

    return (
      <div className="space-y-6">
        {/* Players Selection */}
        {!showCaptainSelection && (
          <Card>
            <CardHeader>
              <CardTitle>Available Players</CardTitle>
              <CardDescription>Select 11 players from both teams to create your base XI</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Team 1 Players List */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                    {matchData?.match?.competitors?.[0]?.name || 'Team 1'} ({team1Players.length})
                  </h4>
                  <div className="space-y-1 max-h-80 overflow-y-auto">
                    {team1Players.map((player: any, index: number) => {
                      const selPct = player.statistics?.selectionPercentage ? `${player.statistics.selectionPercentage}%` : '0%';
                      const pts = player.statistics?.points || 0;
                      return (
                      <div key={player.id || index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">{index + 1}</span>
                          <span className="text-sm font-medium">{player.name}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-xs text-gray-500">{selPct}</span>
                          <span className="text-xs text-gray-500">{pts}</span>
                          <Button variant="outline" size="icon" onClick={() => handlePlayerSelection(player.id)}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>);
                    })}
                  </div>
                </div>

                {/* Team 2 Players List */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                    {matchData?.match?.competitors?.[1]?.name || 'Team 2'} ({team2Players.length})
                  </h4>
                  <div className="space-y-1 max-h-80 overflow-y-auto">
                    {team2Players.map((player: any, index: number) => {
                      const selPct = player.statistics?.selectionPercentage ? `${player.statistics.selectionPercentage}%` : '0%';
                      const pts = player.statistics?.points || 0;
                      return (
                      <div key={player.id || index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">{index + 1}</span>
                          <span className="text-sm font-medium">{player.name}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-xs text-gray-500">{selPct}</span>
                          <span className="text-xs text-gray-500">{pts}</span>
                          <Button variant="outline" size="icon" onClick={() => handlePlayerSelection(player.id)}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>);
                    })}
                  </div>
                </div>
              </div>
              
              {/* Team Summary */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">Selected Players: {selectedPlayers.length}/11</p>
                    <p className="text-xs text-gray-500">Credits Used: {totalCredits}/100</p>
                  </div>
                  <Button 
                    disabled={selectedPlayers.length !== 11}
                    className="btn-primary"
                    onClick={() => setShowCaptainSelection(true)}
                  >
                    Complete Selection
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Captain/Vice-Captain Selection */}
        {showCaptainSelection && (
          <Card>
            <CardHeader>
              <CardTitle>Select Captain & Vice Captain</CardTitle>
              <CardDescription>Choose a captain and vice captain from your selected XI</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Captain</label>
                    <select
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      value={captain || ''}
                      onChange={e => setCaptain(e.target.value)}
                    >
                      <option value="" disabled>Select Captain</option>
                      {selectedPlayers.map(pid => (
                        <option key={pid} value={pid}>{getPlayerName(pid)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Vice Captain</label>
                    <select
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      value={viceCaptain || ''}
                      onChange={e => setViceCaptain(e.target.value)}
                    >
                      <option value="" disabled>Select Vice Captain</option>
                      {selectedPlayers
                        .filter(pid => pid !== captain)
                        .map(pid => (
                          <option key={pid} value={pid}>{getPlayerName(pid)}</option>
                        ))}
                    </select>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row justify-end gap-2 mt-4">
                  <Button
                    className="btn-secondary"
                    disabled={!captain || !viceCaptain || captain === viceCaptain}
                    onClick={handleAddCombination}
                  >
                    Add Combination
                  </Button>
                </div>
                {/* Show saved combinations with percentage input */}
                {combinations.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-2">Saved Combinations</h4>
                    <ul className="space-y-2">
                      {combinations.map((combo, idx) => (
                        <li key={idx} className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{getPlayerName(combo.captain)}</span>
                            <span className="text-xs text-gray-500">(C)</span>
                            <span className="mx-2">/</span>
                            <span className="font-semibold">{getPlayerName(combo.viceCaptain)}</span>
                            <span className="text-xs text-gray-500">(VC)</span>
                          </div>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            placeholder="%"
                            className="w-16"
                            value={combo.percentage || ''}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              setCombinations(prev => {
                                const updated = prev.map((c, i) => i === idx ? { ...c, percentage: value } : c);
                                const totalPercentage = updated.reduce((sum, c) => sum + (c.percentage || 0), 0);
                                if (totalPercentage > 100) {
                                  alert('Total percentage cannot exceed 100.');
                                  return prev;
                                }
                                return updated;
                              });
                            }}
                          />
                          <span className="text-xs text-gray-500">%</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Generate Teams Button */}
                {combinations.length > 0 && combinations.every(combo => combo.percentage && combo.percentage > 0) && (
                  <div className="mt-6 text-right">
                    <Button
                      className="btn-primary"
                      onClick={() => {
                        const totalTeams = parseInt(teamCount, 10);
                        const generatedTeams: Array<{ captain: string; viceCaptain: string }> = [];

                        combinations.forEach(combo => {
                          if (combo.percentage) {
                            const teamCountForCombo = Math.round((combo.percentage / 100) * totalTeams);
                            for (let i = 0; i < teamCountForCombo; i++) {
                              generatedTeams.push({
                                captain: getPlayerName(combo.captain),
                                viceCaptain: getPlayerName(combo.viceCaptain),
                              });
                            }
                          }
                        });

                        // Shuffle the generated teams to randomize the order
                        for (let i = generatedTeams.length - 1; i > 0; i--) {
                          const j = Math.floor(Math.random() * (i + 1));
                          [generatedTeams[i], generatedTeams[j]] = [generatedTeams[j], generatedTeams[i]];
                        }

                        setGeneratedTeams(generatedTeams);
                      }}
                    >
                      Generate {teamCount} Teams
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        {/* Generated Teams Display */}
        {generatedTeams.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {generatedTeams.map((team, index) => (
              <div key={index} className="border border-gray-300 rounded-lg p-4">
                <h4 className="font-medium mb-2">Team {index + 1}</h4>
                <ul className="list-disc pl-5">
                  {selectedPlayers.map(player => (
                    <li key={player}>
                      {getPlayerName(player)} {team.captain === getPlayerName(player) ? '(C)' : ''} {team.viceCaptain === getPlayerName(player) ? '(VC)' : ''}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderScorePrediction = () => (
    <Card>
      <CardHeader>
        <CardTitle>Score & Storyline Prediction</CardTitle>
        <CardDescription>Predict match outcomes to guide team selection</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-3">England Prediction</h4>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Runs</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option>High (180+)</option>
                    <option>Medium (150-180)</option>
                    <option>{'Low (<150)'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Wickets</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option>High (8-10)</option>
                    <option>Medium (5-7)</option>
                    <option>Low (1-4)</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">India Prediction</h4>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Runs</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option>High (180+)</option>
                    <option>Medium (150-180)</option>
                    <option>{'Low (<150)'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Wickets</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option>High (8-10)</option>
                    <option>Medium (5-7)</option>
                    <option>Low (1-4)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Match Storyline</label>
            <Textarea 
              placeholder="Describe the key storylines you expect..."
              rows={3}
            />
          </div>
          
          <Link href={`/match/${resolvedParams.id}/teams?strategy=${resolvedParams.strategyId}&teams=${teamCount}`}>
            <Button className="w-full btn-primary">
              Generate {teamCount} Teams
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );

  if (!strategy) {
    return <div>Strategy not found</div>;
  }

  const IconComponent = strategy?.icon || (() => null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="gradient-bg text-white shadow-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/match/${resolvedParams.id}`}>
                <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-black">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <IconComponent className="h-8 w-8 text-red-400" />
                <div>
                  <h1 className="text-2xl font-bold">{strategy.title}</h1>
                  <p className="text-gray-300">{strategy.description}</p>
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {teamCount} Teams
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {resolvedParams.strategyId === 'ai-chatbot' && renderAIChatbot()}
        {resolvedParams.strategyId === 'same-xi' && renderSameXI()}
        {resolvedParams.strategyId === 'score-prediction' && renderScorePrediction()}
        {resolvedParams.strategyId === 'core-hedge' && renderSameXI()}
        {resolvedParams.strategyId === 'stats-driven' && renderScorePrediction()}
        {resolvedParams.strategyId === 'preset-scenarios' && renderSameXI()}
        {resolvedParams.strategyId === 'role-split' && renderScorePrediction()}
        {resolvedParams.strategyId === 'base-team' && renderSameXI()}
      </main>
    </div>
  );
}