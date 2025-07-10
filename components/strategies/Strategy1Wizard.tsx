"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useChatbot, useMatchData } from '@/hooks/use-cricket-data';

interface Strategy1WizardProps {
  matchId: string;
  onGenerate: (prefs: any, count: number) => void;
}

export default function Strategy1Wizard({ matchId, onGenerate }: Strategy1WizardProps) {
  const [selectedPills, setSelectedPills] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [messages, setMessages] = useState<{ sender: 'user' | 'ai'; text: string }[]>([]);
  const { sendMessage, loading: chatbotLoading, error: chatbotError } = useChatbot();
  const [teamCount, setTeamCount] = useState(10);
  const [stage, setStage] = useState<'pills' | 'analysis' | 'distribution'>('pills');
  
  const pillOptions = [
    'Balance Bat/Bowl', 
    'Aggressive Batting', 
    'All-round Strength', 
    'Pitch-friendly Picks', 
    'Weather-proof Picks'
  ];
  
  // Fetch match analysis for default captaincy options
  const { data: matchData } = useMatchData(matchId);
  const capAnalysis = matchData?.analysis?.captaincy;
  const defaultCombos = capAnalysis ? [
    { captain: capAnalysis.primary.name, viceCaptain: capAnalysis.secondary.name, percentage: 50 },
    { captain: capAnalysis.secondary.name, viceCaptain: capAnalysis.primary.name, percentage: 50 }
  ] : [];
  const [combos, setCombos] = useState<{ captain: string; viceCaptain: string; percentage: number }[]>(defaultCombos);

  const handlePillClick = (pill: string) => {
    if (!selectedPills.includes(pill)) {
      setSelectedPills([...selectedPills, pill]);
    }
  };

  const handleRemovePill = (pill: string) => {
    setSelectedPills(selectedPills.filter(p => p !== pill));
  };

  const handleAddCustom = () => {
    if (customInput.trim()) {
      setSelectedPills([...selectedPills, customInput.trim()]);
      setCustomInput('');
    }
  };

  const handleAnalyze = async () => {
    const userMsg = `Preferences: ${selectedPills.join(', ')}.`;
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    const aiResp = await sendMessage(userMsg, matchId, null);
    setMessages(prev => [...prev, { sender: 'ai', text: aiResp }]);
    setStage('distribution');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">AI-Guided Team Creation Assistant</h2>
        
        {/* Pill Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Select Your Preferences</h3>
          <p className="text-gray-600 mb-4">Choose from common strategies or add your own:</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {pillOptions.map(pill => (
              <Button 
                key={pill} 
                variant={selectedPills.includes(pill) ? 'default' : 'outline'} 
                onClick={() => handlePillClick(pill)}
                className="mb-2"
              >
                {pill}
              </Button>
            ))}
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <Input 
              placeholder="Add custom preference..." 
              value={customInput} 
              onChange={e => setCustomInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddCustom()}
              className="flex-1" 
            />
            <Button onClick={handleAddCustom} disabled={!customInput.trim()}>
              Add
            </Button>
          </div>
          
          {selectedPills.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Selected Preferences:</p>
              <div className="flex flex-wrap gap-2">
                {selectedPills.map(pill => (
                  <Badge 
                    key={pill} 
                    variant="secondary" 
                    className="cursor-pointer hover:bg-red-100" 
                    onClick={() => handleRemovePill(pill)}
                  >
                    {pill} ×
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Number of Teams:</label>
            <Input 
              type="number" 
              min={1} 
              max={20} 
              value={teamCount} 
              onChange={e => setTeamCount(parseInt(e.target.value) || 1)}
              className="w-32"
            />
          </div>
          
          {stage === 'pills' && (
            <Button 
              onClick={handleAnalyze} 
              disabled={chatbotLoading || selectedPills.length === 0} 
              className="w-full md:w-auto"
            >
              {chatbotLoading ? 'Analyzing...' : 'Get AI Recommendations'}
            </Button>
          )}
        </div>

        {/* Error Display */}
        {chatbotError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {chatbotError}
          </div>
        )}

        {/* AI Analysis Chat */}
        {(stage === 'analysis' || stage === 'distribution') && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">AI Analysis</h3>
            <div className="bg-gray-50 p-4 rounded-lg h-64 overflow-y-auto space-y-3">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white border shadow-sm'
                  }`}>
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Captain/Vice-Captain Distribution */}
        {stage === 'distribution' && combos.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Captain/Vice-Captain Distribution</h3>
            <p className="text-gray-600 mb-4">Configure how you want to distribute captaincy across your teams:</p>
            
            <div className="space-y-4 mb-6">
              {combos.map((combo, idx) => (
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
                      onChange={e => {
                        const val = parseInt(e.target.value) || 0;
                        setCombos(prev => prev.map((item, i) => 
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
            
            <Button 
              onClick={() => onGenerate({ 
                aiPrompt: messages.find(m => m.sender === 'ai')?.text, 
                distribution: combos 
              }, teamCount)}
              className="w-full md:w-auto bg-green-600 hover:bg-green-700"
            >
              Generate {teamCount} AI-Optimized Teams
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
