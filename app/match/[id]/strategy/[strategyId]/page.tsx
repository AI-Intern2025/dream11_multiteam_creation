"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, MessageCircle, Send, Users, Trophy, Target, BarChart3, Bot, Sparkles } from 'lucide-react';
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
  params: { id: string; strategyId: string };
  searchParams: { teams?: string };
}) {
  const [chatResponses, setChatResponses] = useState<Record<number, string[]>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  
  const { data: matchData } = useMatchData(params.id);
  const { sendMessage, loading: chatLoading } = useChatbot();

  const strategy = strategyConfigs[params.strategyId as keyof typeof strategyConfigs];
  const teamCount = searchParams.teams || '10';

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage = currentMessage;
    setCurrentMessage('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    const response = await sendMessage(userMessage, params.id);
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
            
            <Link href={`/match/${params.id}/teams?strategy=${params.strategyId}&teams=${teamCount}`}>
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

  const renderSameXI = () => (
    <Card>
      <CardHeader>
        <CardTitle>Same XI, Different Captains</CardTitle>
        <CardDescription>Create your core XI and order captain/vice-captain preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-3">Create Your Base XI</h4>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <p className="text-sm text-gray-600 mb-4">Select 11 players for your base team</p>
              <Button variant="outline">Open Team Builder</Button>
            </div>
          </div>
          
          <div className="text-center text-gray-500">OR</div>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <p className="text-sm text-gray-600 mb-4">Upload your Dream11 team screenshot</p>
            <Button variant="outline">Choose File</Button>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium">Captain/Vice-Captain Priority</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">High Priority</label>
                <Input placeholder="e.g., Virat Kohli" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Medium Priority</label>
                <Input placeholder="e.g., Joe Root" />
              </div>
            </div>
          </div>
          
          <Link href={`/match/${params.id}/teams?strategy=${params.strategyId}&teams=${teamCount}`}>
            <Button className="w-full btn-primary">
              Generate {teamCount} Teams
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );

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
          
          <Link href={`/match/${params.id}/teams?strategy=${params.strategyId}&teams=${teamCount}`}>
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

  const IconComponent = strategy.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="gradient-bg text-white shadow-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/match/${params.id}`}>
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
        {params.strategyId === 'ai-chatbot' && renderAIChatbot()}
        {params.strategyId === 'same-xi' && renderSameXI()}
        {params.strategyId === 'score-prediction' && renderScorePrediction()}
        {params.strategyId === 'core-hedge' && renderSameXI()}
        {params.strategyId === 'stats-driven' && renderScorePrediction()}
        {params.strategyId === 'preset-scenarios' && renderSameXI()}
        {params.strategyId === 'role-split' && renderScorePrediction()}
        {params.strategyId === 'base-team' && renderSameXI()}
      </main>
    </div>
  );
}