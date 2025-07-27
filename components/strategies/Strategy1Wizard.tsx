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
  teamCount?: number;
}

interface ChatMessage {
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: Date;
  questionId?: string;
}

interface UserInsights {
  matchOutcome: string;           // Simplified from multiple prediction fields
  keyPlayers: string[];          // Core player preferences
  riskAppetite: 'conservative' | 'balanced' | 'aggressive';
  additionalContext?: string;    // Optional additional context
}

interface MatchInsights {
  pitch: string;
  weather: string;
  venue: string;
  pastForm: Record<string, any>;
}

interface ConversationQuestion {
  id: string;
  question: string;
  description: string;
  pillOptions: string[];
  allowCustom: boolean;
  optional?: boolean;
}

export default function Strategy1Wizard({ matchId, onGenerate, teamCount: initialTeamCount = 11 }: Strategy1WizardProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [customInput, setCustomInput] = useState('');
  const [userInsights, setUserInsights] = useState<UserInsights>({
    matchOutcome: '',
    keyPlayers: [],
    riskAppetite: 'balanced',
    additionalContext: ''
  });
  const [teamCount, setTeamCount] = useState(initialTeamCount);
  const [stage, setStage] = useState<'conversation' | 'analysis' | 'summary' | 'distribution'>('conversation');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [captainDistribution, setCaptainDistribution] = useState<{ captain: string; viceCaptain: string; percentage: number }[]>([]);
  const [matchInsights, setMatchInsights] = useState<MatchInsights>({
    pitch: 'Balanced',
    weather: 'Clear',
    venue: 'Standard',
    pastForm: {}
  });
  
  const { sendMessage, loading: chatbotLoading, error: chatbotError } = useChatbot();
  const { data: matchData } = useMatchData(matchId);

  // Get team names from match data
  const teamAName = matchData?.match?.team_a_name || 'Team A';
  const teamBName = matchData?.match?.team_b_name || 'Team B';
  const matchName = `${teamAName} vs ${teamBName}`;

  // NEW: Simplified conversation flow with only 3-4 questions
  const conversationQuestions: ConversationQuestion[] = [
    {
      id: 'match_outcome',
      question: `What is your predicted match outcome for ${matchName}?`,
      description: 'Tell us who you think will win and your confidence level.',
      pillOptions: [`${teamAName} Wins (High Confidence)`, `${teamAName} Wins (Low Confidence)`, `${teamBName} Wins (High Confidence)`, `${teamBName} Wins (Low Confidence)`, 'Close Contest', 'Hard to Predict'],
      allowCustom: true
    },
    {
      id: 'key_players',
      question: 'Which key players do you want to focus on?',
      description: 'Select player types or specific players you believe will perform well.',
      pillOptions: ['Top Order Batsmen', 'Middle Order', 'All-rounders', 'Death Bowlers', 'Spinners', 'Wicket-keepers', 'Form Players'],
      allowCustom: true
    },
    {
      id: 'risk_appetite',
      question: 'What is your risk appetite for this match?',
      description: 'This helps us balance safe picks vs differential players.',
      pillOptions: ['Conservative (Safe picks)', 'Balanced (Mix of both)', 'Aggressive (High risk/reward)'],
      allowCustom: false
    },
    {
      id: 'additional_context',
      question: 'Any specific match insights or additional preferences?',
      description: 'Optional: Share any additional thoughts about the match.',
      pillOptions: ['Weather Impact', 'Venue Conditions', 'Recent Form', 'Head-to-Head', 'No additional insights'],
      allowCustom: true,
      optional: true
    }
  ];

  // Initialize conversation on component mount
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        sender: 'ai',
        text: `Welcome to the AI-Guided Team Creation Assistant! 🏏\\n\\nI'll help you build optimized fantasy teams for ${matchName} by understanding your match insights and predictions. Let's start with a few focused questions to understand your approach.\\n\\nReady to begin?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      
      // Load match insights
      setMatchInsights({
        pitch: matchData?.match?.pitch_condition || 'Balanced',
        weather: matchData?.match?.weather_condition || 'Clear',
        venue: matchData?.match?.match_venue || 'Standard',
        pastForm: {}
      });

      // Ask first question immediately
      setTimeout(() => {
        askQuestion(0);
      }, 1000);
    }
  }, [matchData, matchName]);

  const askQuestion = (questionIndex: number) => {
    if (questionIndex < conversationQuestions.length) {
      const question = conversationQuestions[questionIndex];
      const questionMessage: ChatMessage = {
        sender: 'ai',
        text: `**${question.question}**\\n\\n${question.description}`,
        timestamp: new Date(),
        questionId: question.id
      };
      setMessages(prev => [...prev, questionMessage]);
      setCurrentQuestionIndex(questionIndex);
    } else {
      proceedToAnalysis();
    }
  };

  const handlePillResponse = (response: string) => {
    const question = conversationQuestions[currentQuestionIndex];
    
    // Add user response to messages
    const userMessage: ChatMessage = {
      sender: 'user',
      text: response,
      timestamp: new Date(),
      questionId: question.id
    };
    setMessages(prev => [...prev, userMessage]);

    // Update user insights based on question
    setUserInsights(prev => {
      const updated = { ...prev };
      
      switch (question.id) {
        case 'match_outcome':
          updated.matchOutcome = response;
          break;
        case 'key_players':
          if (!updated.keyPlayers.includes(response)) {
            updated.keyPlayers = [...updated.keyPlayers, response];
          }
          break;
        case 'risk_appetite':
          if (response.includes('Conservative')) {
            updated.riskAppetite = 'conservative';
          } else if (response.includes('Aggressive')) {
            updated.riskAppetite = 'aggressive';
          } else {
            updated.riskAppetite = 'balanced';
          }
          break;
        case 'additional_context':
          updated.additionalContext = response;
          break;
      }
      
      return updated;
    });

    // AI acknowledgment and next question
    setTimeout(() => {
      const ackMessage: ChatMessage = {
        sender: 'ai',
        text: `Got it! ${getAcknowledgment(question.id, response)}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, ackMessage]);
      
      setTimeout(() => {
        askQuestion(currentQuestionIndex + 1);
      }, 1000);
    }, 500);
  };

  const handleCustomResponse = () => {
    if (!customInput.trim()) return;
    
    handlePillResponse(customInput);
    setCustomInput('');
  };

  const getAcknowledgment = (questionId: string, response: string): string => {
    switch (questionId) {
      case 'match_outcome':
        return `I'll factor in your match prediction for team selection.`;
      case 'key_players':
        return `I'll prioritize ${response.toLowerCase()} in your teams.`;
      case 'risk_appetite':
        return `Perfect! I'll build teams with a ${response.toLowerCase()} approach.`;
      case 'additional_context':
        return `I'll consider these insights while generating your teams.`;
      default:
        return `Thanks for the input!`;
    }
  };

  const proceedToAnalysis = () => {
    setStage('analysis');
    setIsAnalyzing(true);

    // Show analysis message
    const analysisMessage: ChatMessage = {
      sender: 'ai',
      text: `Excellent! Let me analyze all your inputs and match insights...\\n\\n**Your Preferences Summary:**\\n• Match Outcome: ${userInsights.matchOutcome}\\n• Key Players: ${userInsights.keyPlayers.join(', ') || 'General approach'}\\n• Risk Level: ${userInsights.riskAppetite}\\n• Additional Context: ${userInsights.additionalContext || 'None'}\\n\\n**Match Insights:**\\n• Pitch: ${matchInsights.pitch}\\n• Weather: ${matchInsights.weather}\\n• Venue: ${matchInsights.venue}\\n\\nI'll now create diverse team variations based on your inputs!`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, analysisMessage]);

    // Simulate analysis and move to summary
    setTimeout(() => {
      setIsAnalyzing(false);
      setStage('summary');
      generateCaptainDistribution();
    }, 3000);
  };

  const generateCaptainDistribution = () => {
    // Generate AI-recommended captain distribution based on user insights
    const distribution = [
      { captain: 'Top Performer', viceCaptain: 'Safe Option', percentage: 40 },
      { captain: 'Differential Pick', viceCaptain: 'Top Performer', percentage: 35 },
      { captain: 'Safe Option', viceCaptain: 'Form Player', percentage: 25 }
    ];
    
    setCaptainDistribution(distribution);
    setStage('distribution');
  };

  const handleGenerate = () => {
    const strategyData = {
      strategy: 'ai-guided',
      userInsights,
      conversationHistory: messages,
      matchInsights,
      captainDistribution,
      teamNames: { teamA: teamAName, teamB: teamBName }
    };
    
    onGenerate(strategyData, teamCount);
  };

  const currentQuestion = conversationQuestions[currentQuestionIndex];
  const isCurrentQuestionOptional = currentQuestion?.optional;

  return (
    <div className="space-y-6">
      {/* Enhanced Match Insights Display */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center space-x-2">
            <span>📊</span>
            <span>Live Match Insights</span>
          </CardTitle>
          <CardDescription className="text-blue-700">
            Real-time conditions for {matchName}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-blue-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="font-semibold">Pitch:</span> {matchInsights.pitch}
            </div>
            <div>
              <span className="font-semibold">Weather:</span> {matchInsights.weather}
            </div>
            <div>
              <span className="font-semibold">Venue:</span> {matchInsights.venue}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversation Stage */}
      {stage === 'conversation' && (
        <Card>
          <CardHeader>
            <CardTitle>AI Assistant Conversation</CardTitle>
            <CardDescription>
              Answer {conversationQuestions.length} focused questions to help us understand your approach
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Progress Indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{Math.max(0, currentQuestionIndex)}/{conversationQuestions.length} questions</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(Math.max(0, currentQuestionIndex) / conversationQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-4 max-h-96 overflow-y-auto mb-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    message.sender === 'ai'
                      ? 'bg-blue-50 border-l-4 border-blue-400'
                      : message.sender === 'user'
                      ? 'bg-green-50 border-l-4 border-green-400 ml-8'
                      : 'bg-gray-50 border-l-4 border-gray-400'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    <span className="text-sm font-semibold text-gray-600">
                      {message.sender === 'ai' ? '🤖 AI Assistant' : 
                       message.sender === 'user' ? '👤 You' : '💡 System'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="mt-2 text-gray-800 whitespace-pre-line">
                    {message.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Response Options */}
            {currentQuestion && (
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800">Choose your response:</h4>
                
                {/* Pill Options */}
                <div className="flex flex-wrap gap-2">
                  {currentQuestion.pillOptions.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handlePillResponse(option)}
                      className="hover:bg-blue-50 hover:border-blue-300"
                    >
                      {option}
                    </Button>
                  ))}
                </div>

                {/* Custom Input */}
                {currentQuestion.allowCustom && (
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Or type your custom response..."
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleCustomResponse()}
                    />
                    <Button onClick={handleCustomResponse} disabled={!customInput.trim()}>
                      Send
                    </Button>
                  </div>
                )}

                {/* Skip Option for Optional Questions */}
                {isCurrentQuestionOptional && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => askQuestion(currentQuestionIndex + 1)}
                    className="text-gray-500"
                  >
                    Skip this question →
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Analysis Stage */}
      {stage === 'analysis' && (
        <Card>
          <CardHeader>
            <CardTitle>AI Analysis in Progress</CardTitle>
            <CardDescription>
              Processing your inputs and match insights...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-4"></div>
              <span>Analyzing your preferences and generating strategy...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary and Distribution Stage */}
      {(stage === 'summary' || stage === 'distribution') && (
        <div className="space-y-6">
          {/* Insights Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Your Strategy Summary</CardTitle>
              <CardDescription>
                Based on your inputs, here&apos;s your personalized approach
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <span className="font-medium">Match Prediction:</span> {userInsights.matchOutcome}
                </div>
                <div>
                  <span className="font-medium">Key Focus Areas:</span> {userInsights.keyPlayers.join(', ') || 'Balanced approach'}
                </div>
                <div>
                  <span className="font-medium">Risk Appetite:</span> {userInsights.riskAppetite.charAt(0).toUpperCase() + userInsights.riskAppetite.slice(1)}
                </div>
                {userInsights.additionalContext && (
                  <div>
                    <span className="font-medium">Additional Context:</span> {userInsights.additionalContext}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Captain Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended Captain Distribution</CardTitle>
              <CardDescription>
                AI-suggested captain/vice-captain combinations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {captainDistribution.map((combo, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">C:</span> {combo.captain} | 
                      <span className="font-medium ml-2">VC:</span> {combo.viceCaptain}
                    </div>
                    <Badge variant="secondary">{combo.percentage}%</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Team Count and Generate */}
          <Card>
            <CardHeader>
              <CardTitle>Generate Teams</CardTitle>
              <CardDescription>
                Ready to create your personalized fantasy teams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of teams to generate (1-100):
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={teamCount}
                    onChange={(e) => setTeamCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-32"
                  />
                </div>
                
                <Button 
                  onClick={handleGenerate}
                  className="w-full"
                  size="lg"
                >
                  Generate {teamCount} AI-Optimized Teams 🚀
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
