"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useChatbot, useMatchData } from '@/hooks/use-cricket-data';

interface Strategy1WizardProps {
  matchId: string;
  onGenerate: (prefs: any, count: number) => void;
}

interface ChatMessage {
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: Date;
  questionId?: string;
}

interface UserInsights {
  matchWinner: string;
  scoreRange: string;
  backedPlayers: string[];
  matchNarrative: string;
  riskAppetite: string;
  customInputs: string[];
}

interface ConversationQuestion {
  id: string;
  question: string;
  description: string;
  pillOptions: string[];
  allowCustom: boolean;
  optional?: boolean;
}

export default function Strategy1Wizard({ matchId, onGenerate }: Strategy1WizardProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [customInput, setCustomInput] = useState('');
  const [userInsights, setUserInsights] = useState<UserInsights>({
    matchWinner: '',
    scoreRange: '',
    backedPlayers: [],
    matchNarrative: '',
    riskAppetite: '',
    customInputs: []
  });
  const [teamCount, setTeamCount] = useState(5);
  const [stage, setStage] = useState<'conversation' | 'analysis' | 'summary' | 'distribution'>('conversation');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [captainDistribution, setCaptainDistribution] = useState<{ captain: string; viceCaptain: string; percentage: number }[]>([]);
  
  const { sendMessage, loading: chatbotLoading, error: chatbotError } = useChatbot();
  const { data: matchData } = useMatchData(matchId);

  // Get team names from match data
  const teamAName = matchData?.match?.team_a_name || 'Team A';
  const teamBName = matchData?.match?.team_b_name || 'Team B';
  const matchName = `${teamAName} vs ${teamBName}`;

  // Conversation flow questions
  const conversationQuestions: ConversationQuestion[] = [
    {
      id: 'match_winner',
      question: `Who do you think will win the ${matchName} match?`,
      description: 'This helps us understand your team bias and which players to prioritize.',
      pillOptions: [teamAName, teamBName, 'Close Contest', 'Hard to Predict'],
      allowCustom: true
    },
    {
      id: 'score_range',
      question: 'What final score range do you anticipate?',
      description: 'This indicates whether the pitch will favor batters or bowlers.',
      pillOptions: ['Low-scoring (<150)', 'Par Score (150-180)', 'High-scoring (180-210)', 'Very High (210+)', 'Bowling Friendly'],
      allowCustom: true
    },
    {
      id: 'backed_players',
      question: 'Any specific players you\'re backing to perform well?',
      description: 'Tell us about players you believe will shine in this match.',
      pillOptions: ['Top Order Focus', 'All-rounders', 'Death Bowlers', 'Spinners', 'None in Mind'],
      allowCustom: true
    },
    {
      id: 'match_narrative',
      question: 'Which story do you think will unfold in this match?',
      description: 'Share your intuition about how the game might play out.',
      pillOptions: [
        'Batters dominate from start',
        'Bowlers have upper hand',
        `${teamAName} collapses early`,
        `${teamBName} collapses early`,
        'Last-over thriller',
        'Spinners will be key',
        'Pace bowlers dominate'
      ],
      allowCustom: true
    },
    {
      id: 'risk_appetite',
      question: 'What\'s your risk appetite for team selection?',
      description: 'This determines how bold or safe your team variations will be.',
      pillOptions: ['Play it Safe', 'Balanced Approach', 'High Risk/High Reward', 'Differential Focus'],
      allowCustom: true,
      optional: true
    }
  ];

  // Initialize conversation
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        sender: 'ai',
        text: `Welcome to the AI-Guided Team Creation Assistant! 🏏\n\nI'll help you build optimized fantasy teams for ${matchName} by understanding your match insights and predictions. Let's start with a few quick questions.`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      
      // Ask first question
      setTimeout(() => {
        askQuestion(0);
      }, 1000);
    }
  }, [matchName]);

  const askQuestion = (questionIndex: number) => {
    if (questionIndex >= conversationQuestions.length) {
      proceedToAnalysis();
      return;
    }

    const question = conversationQuestions[questionIndex];
    const questionMessage: ChatMessage = {
      sender: 'ai',
      text: `${question.question}\n\n${question.description}`,
      timestamp: new Date(),
      questionId: question.id
    };

    setMessages(prev => [...prev, questionMessage]);
  };

  const handlePillResponse = (response: string) => {
    const currentQuestion = conversationQuestions[currentQuestionIndex];
    
    // Add user response to chat
    const userMessage: ChatMessage = {
      sender: 'user',
      text: response,
      timestamp: new Date(),
      questionId: currentQuestion.id
    };
    setMessages(prev => [...prev, userMessage]);

    // Update insights based on question
    updateUserInsights(currentQuestion.id, response);

    // Acknowledge response and move to next question
    setTimeout(() => {
      const acknowledgment = generateAcknowledgment(currentQuestion.id, response);
      const ackMessage: ChatMessage = {
        sender: 'ai',
        text: acknowledgment,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, ackMessage]);

      // Move to next question
      setTimeout(() => {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        askQuestion(nextIndex);
      }, 1500);
    }, 500);
  };

  const handleCustomResponse = () => {
    if (!customInput.trim()) return;
    
    const currentQuestion = conversationQuestions[currentQuestionIndex];
    handlePillResponse(customInput.trim());
    setCustomInput('');
  };

  const updateUserInsights = (questionId: string, response: string) => {
    setUserInsights(prev => {
      const updated = { ...prev };
      
      switch (questionId) {
        case 'match_winner':
          updated.matchWinner = response;
          break;
        case 'score_range':
          updated.scoreRange = response;
          break;
        case 'backed_players':
          if (response !== 'None in Mind') {
            updated.backedPlayers = [...prev.backedPlayers, response];
          }
          break;
        case 'match_narrative':
          updated.matchNarrative = response;
          break;
        case 'risk_appetite':
          updated.riskAppetite = response;
          break;
        default:
          updated.customInputs = [...prev.customInputs, response];
      }
      
      return updated;
    });
  };

  const generateAcknowledgment = (questionId: string, response: string): string => {
    switch (questionId) {
      case 'match_winner':
        if (response.includes('Close') || response.includes('Hard')) {
          return "Interesting! A close contest means we'll balance players from both teams.";
        }
        return `Got it! You're leaning towards ${response}. We'll factor this into team composition.`;
      
      case 'score_range':
        if (response.includes('High') || response.includes('210')) {
          return "High-scoring match expected! We'll prioritize top-order batsmen and power hitters.";
        } else if (response.includes('Low') || response.includes('Bowling')) {
          return "Bowler-friendly conditions noted! We'll include extra bowlers and all-rounders.";
        }
        return "Perfect! This score expectation will guide our batting vs bowling balance.";
      
      case 'backed_players':
        return `Excellent insight! We'll make sure to consider ${response} in your team selections.`;
      
      case 'match_narrative':
        return "Great narrative! This storyline will help shape the team strategies and captaincy choices.";
      
      case 'risk_appetite':
        return `${response} approach noted! This will determine how bold we get with player selections.`;
      
      default:
        return "Thanks for that input! Moving on to the next question.";
    }
  };

  const proceedToAnalysis = async () => {
    setStage('analysis');
    setIsAnalyzing(true);

    // Summary message
    const summaryMessage: ChatMessage = {
      sender: 'ai',
      text: "Perfect! Let me analyze your insights and build optimized teams...",
      timestamp: new Date()
    };
    setMessages(prev => [...prev, summaryMessage]);

    try {
      // Create analysis prompt based on user insights
      const analysisPrompt = generateAnalysisPrompt();
      
      // Send to AI for analysis
      const aiAnalysis = await sendMessage(analysisPrompt, matchId, null);
      
      const analysisMessage: ChatMessage = {
        sender: 'ai',
        text: aiAnalysis,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, analysisMessage]);

      // Generate captain/vc distribution
      generateCaptainDistribution();
      
      setStage('summary');
    } catch (error) {
      console.error('Analysis error:', error);
      const errorMessage: ChatMessage = {
        sender: 'ai',
        text: "I encountered an issue during analysis. Let me proceed with the team generation based on your inputs.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setStage('summary');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateAnalysisPrompt = (): string => {
    const insights = userInsights;
    return `
Based on the following user predictions and insights for ${matchName}:

Match Winner Prediction: ${insights.matchWinner}
Expected Score Range: ${insights.scoreRange}
Backed Players/Types: ${insights.backedPlayers.join(', ') || 'None specified'}
Match Narrative: ${insights.matchNarrative}
Risk Appetite: ${insights.riskAppetite || 'Balanced'}

Please analyze these insights and provide:
1. Strategic team composition recommendations
2. Key players to prioritize based on the predicted scenario
3. Captain and Vice-Captain suggestions
4. Risk factors to consider
5. How to balance the user's predictions with data-driven selections

Consider the match conditions: ${matchData?.match?.pitch_condition || 'Unknown'} pitch, ${matchData?.match?.weather_condition || 'Unknown'} weather.
    `;
  };

  const generateCaptainDistribution = () => {
    // Mock captain/vc suggestions based on analysis
    const capAnalysis = matchData?.analysis?.captaincy;
    const suggestions = [];

    if (capAnalysis) {
      suggestions.push({
        captain: capAnalysis.primary.name,
        viceCaptain: capAnalysis.secondary.name,
        percentage: 60
      });
      suggestions.push({
        captain: capAnalysis.secondary.name,
        viceCaptain: capAnalysis.primary.name,
        percentage: 40
      });
    } else {
      // Intelligent suggestions based on user insights
      if (userInsights.scoreRange.includes('High')) {
        suggestions.push({
          captain: 'Top Order Batsman (Based on High Scoring Prediction)',
          viceCaptain: 'All-rounder',
          percentage: 70
        });
        suggestions.push({
          captain: 'Power Hitter',
          viceCaptain: 'Top Order Batsman',
          percentage: 30
        });
      } else if (userInsights.scoreRange.includes('Low')) {
        suggestions.push({
          captain: 'All-rounder (Based on Low Scoring Prediction)',
          viceCaptain: 'Premium Bowler',
          percentage: 60
        });
        suggestions.push({
          captain: 'Premium Bowler',
          viceCaptain: 'All-rounder',
          percentage: 40
        });
      } else {
        suggestions.push({
          captain: 'All-rounder',
          viceCaptain: 'Top Order Batsman',
          percentage: 50
        });
        suggestions.push({
          captain: 'Top Order Batsman',
          viceCaptain: 'All-rounder',
          percentage: 50
        });
      }
    }

    setCaptainDistribution(suggestions);
  };

  const handleGenerateTeams = () => {
    const strategyData = {
      strategy: 'ai-guided',
      userInsights: userInsights,
      conversationHistory: messages,
      captainDistribution: captainDistribution,
      matchAnalysis: matchData?.analysis,
      teamNames: { teamA: teamAName, teamB: teamBName }
    };
    
    onGenerate(strategyData, teamCount);
  };

  const getCurrentQuestion = () => {
    return conversationQuestions[currentQuestionIndex];
  };

  const isQuestionActive = () => {
    return stage === 'conversation' && currentQuestionIndex < conversationQuestions.length;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">AI-Guided Team Creation Assistant</h2>
          <p className="text-gray-600">
            Let me understand your match predictions to build optimized fantasy teams for {matchName}
          </p>
        </div>

        {/* Chat Interface */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Match Analysis Conversation</CardTitle>
            <CardDescription>
              Answer a few questions to help me understand your match predictions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg h-96 overflow-y-auto space-y-4 mb-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : message.sender === 'ai'
                      ? 'bg-white border shadow-sm'
                      : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    <p className="text-xs opacity-60 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {isAnalyzing && (
                <div className="flex justify-start">
                  <div className="bg-white border shadow-sm p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      <p className="text-sm">Analyzing your insights...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Reply Pills */}
            {isQuestionActive() && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {getCurrentQuestion()?.pillOptions.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handlePillResponse(option)}
                      className="hover:bg-blue-50"
                    >
                      {option}
                    </Button>
                  ))}
                </div>

                {/* Custom Input */}
                {getCurrentQuestion()?.allowCustom && (
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Or type your custom answer..."
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCustomResponse()}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleCustomResponse}
                      disabled={!customInput.trim()}
                      size="sm"
                    >
                      Send
                    </Button>
                  </div>
                )}

                {/* Skip option for optional questions */}
                {getCurrentQuestion()?.optional && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      const nextIndex = currentQuestionIndex + 1;
                      setCurrentQuestionIndex(nextIndex);
                      askQuestion(nextIndex);
                    }}
                  >
                    Skip this question
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error Display */}
        {chatbotError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {chatbotError}
          </div>
        )}

        {/* Insights Summary */}
        {stage !== 'conversation' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Your Match Insights Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {userInsights.matchWinner && (
                  <div>
                    <span className="font-medium">Match Winner:</span> {userInsights.matchWinner}
                  </div>
                )}
                {userInsights.scoreRange && (
                  <div>
                    <span className="font-medium">Score Range:</span> {userInsights.scoreRange}
                  </div>
                )}
                {userInsights.backedPlayers.length > 0 && (
                  <div>
                    <span className="font-medium">Backed Players:</span> {userInsights.backedPlayers.join(', ')}
                  </div>
                )}
                {userInsights.matchNarrative && (
                  <div>
                    <span className="font-medium">Match Story:</span> {userInsights.matchNarrative}
                  </div>
                )}
                {userInsights.riskAppetite && (
                  <div>
                    <span className="font-medium">Risk Appetite:</span> {userInsights.riskAppetite}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Captain/Vice-Captain Distribution */}
        {stage === 'summary' && captainDistribution.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Smart Team Generation Strategy</CardTitle>
              <CardDescription>
                AI-optimized teams with guaranteed diversity and intelligent captain selection
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Team Diversity Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500 rounded-full p-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900 mb-1">Team Diversity Guarantee</h4>
                    <p className="text-sm text-blue-700">
                      Each team will have <strong>minimum 25% different players</strong> (at least 3 unique players per team) 
                      to maximize your contest coverage and reduce risk.
                    </p>
                  </div>
                </div>
              </div>

              {/* Captain Strategy Information */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="bg-green-500 rounded-full p-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-green-900 mb-1">Smart Captain Selection</h4>
                    <p className="text-sm text-green-700">
                      Captains chosen based on your match insights: <strong>{userInsights.scoreRange}</strong> conditions, 
                      <strong> {userInsights.matchWinner}</strong> prediction, and <strong>{userInsights.riskAppetite}</strong> approach.
                    </p>
                  </div>
                </div>
              </div>

              <h4 className="font-medium mb-4">Captain/Vice-Captain Distribution</h4>
              <div className="space-y-4 mb-6">
                {captainDistribution.map((combo, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <span className="text-sm font-medium">
                        C: {combo.captain}, VC: {combo.viceCaptain}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={combo.percentage}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setCaptainDistribution(prev => prev.map((item, i) => 
                            i === idx ? { ...item, percentage: val } : item
                          ));
                        }}
                        className="w-20"
                      />
                      <span className="text-sm">%</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Number of Teams:</label>
                  <Input
                    type="number"
                    min={3}
                    max={15}
                    value={teamCount}
                    onChange={(e) => setTeamCount(parseInt(e.target.value) || 5)}
                    className="w-32"
                  />
                </div>
              </div>

              <Button 
                onClick={handleGenerateTeams}
                className="w-full md:w-auto bg-green-600 hover:bg-green-700"
                size="lg"
              >
                Generate {teamCount} AI-Optimized Diverse Teams
              </Button>
              
              {/* Debug Button - Remove in production */}
              <Button 
                onClick={() => {
                  console.log('🔍 Debug: Strategy Data:', {
                    strategy: 'ai-guided',
                    userInsights: userInsights,
                    conversationHistory: messages,
                    captainDistribution: captainDistribution,
                    matchAnalysis: matchData?.analysis,
                    teamNames: { teamA: teamAName, teamB: teamBName }
                  });
                }}
                variant="outline"
                size="sm"
                className="ml-2"
              >
                Debug Data
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Progress Indicator */}
        {stage === 'conversation' && (
          <div className="text-center text-sm text-gray-500">
            Question {Math.min(currentQuestionIndex + 1, conversationQuestions.length)} of {conversationQuestions.length}
          </div>
        )}
      </div>
    </div>
  );
}
