'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/enhanced-card';
import { Badge } from '../ui/enhanced-badge';
import { Progress } from '../ui/enhanced-progress';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Separator } from '@radix-ui/react-separator';
import { 
  TrendingUp, 
  Target, 
  BarChart3,
  Trophy,
  CheckCircle,
  AlertCircle,
  Zap,
  Star,
  Users,
  Clock,
  Activity,
  LineChart,
  PieChart,
  Calendar,
  MapPin,
  CloudRain,
  Sun,
  Wind
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { CricketPlayer, EnrichedMatchData } from '../../lib/cricket-types';

interface Strategy3Props {
  matchData: EnrichedMatchData | null;
  onStrategyComplete: (result: any) => void;
}

interface PredictionConfig {
  team1ScoreRange: [number, number];
  team2ScoreRange: [number, number];
  matchOutcome: 'team1_win' | 'team2_win' | 'close' | 'uncertain';
  keyStorylines: string[];
  weatherImpact: 'high' | 'medium' | 'low';
  pitchCondition: 'batting' | 'bowling' | 'balanced';
  teamCount: number;
}

export default function Strategy3WizardEnhanced({ matchData, onStrategyComplete }: Strategy3Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [predictionConfig, setPredictionConfig] = useState<PredictionConfig>({
    team1ScoreRange: [150, 180],
    team2ScoreRange: [140, 170],
    matchOutcome: 'uncertain',
    keyStorylines: [],
    weatherImpact: 'medium',
    pitchCondition: 'balanced',
    teamCount: 5
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStorylines, setSelectedStorylines] = useState<string[]>([]);
  const { toast } = useToast();

  const team1Name = matchData?.match?.team_a_name || 'Team A';
  const team2Name = matchData?.match?.team_b_name || 'Team B';

  const availableStorylines = [
    'Top-order batting dominance',
    'Spin bowling conditions favor',
    'Death bowling specialist crucial',
    'Weather interruption likely',
    'Pitch deteriorates in second innings',
    'Middle-order collapse expected',
    'Power-play advantage decisive',
    'Wicket-keeper batting crucial',
    'All-rounder impact high',
    'Home team pressure factor',
    'Overseas player advantage',
    'Captain\'s form decisive'
  ];

  const handleStorylineToggle = (storyline: string) => {
    setSelectedStorylines(prev => {
      if (prev.includes(storyline)) {
        return prev.filter(s => s !== storyline);
      } else if (prev.length < 4) {
        return [...prev, storyline];
      } else {
        toast({
          title: "Storyline Limit",
          description: "You can select maximum 4 key storylines",
        });
        return prev;
      }
    });
  };

  const generateStrategy3Teams = async () => {
    if (selectedStorylines.length === 0) {
      toast({
        title: "Missing Storylines",
        description: "Please select at least one key storyline",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/strategies/strategy3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          predictionConfig: {
            ...predictionConfig,
            keyStorylines: selectedStorylines
          },
          matchData
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        toast({
          title: "Strategy 3 Complete!",
          description: `Generated ${result.teams.length} teams based on score predictions and storylines`,
        });
        onStrategyComplete(result);
      } else {
        throw new Error(result.error || 'Failed to generate teams');
      }
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1: return true; // Score ranges can always proceed
      case 2: return selectedStorylines.length > 0;
      case 3: return true; // Match conditions always valid
      default: return false;
    }
  };

  const getStepIcon = (step: number) => {
    if (currentStep > step) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (currentStep === step) return <Target className="h-5 w-5 text-blue-500" />;
    return <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />;
  };

  const updatePredictionConfig = (key: keyof PredictionConfig, value: any) => {
    setPredictionConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3"
        >
          <div className="p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl">
            <LineChart className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              Strategy 3: Score & Storyline Prediction
            </h1>
            <p className="text-muted-foreground">Generate teams based on match predictions and key storylines</p>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                {getStepIcon(step)}
                <span className="text-xs font-medium">
                  {step === 1 ? 'Scores' : step === 2 ? 'Storylines' : step === 3 ? 'Conditions' : 'Generate'}
                </span>
              </div>
              {step < 4 && <div className="w-8 h-px bg-muted-foreground/30 mx-2" />}
            </div>
          ))}
        </div>

        <Progress value={(currentStep / 4) * 100} className="max-w-md mx-auto" variant="cricket" />
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Score Predictions */}
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <Card variant="primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Score Range Predictions
                </CardTitle>
                <CardDescription>
                  Set expected score ranges for both teams based on your analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Team A Score Range */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">{team1Name} Score Range</Label>
                    <Badge variant="default" size="lg">
                      {predictionConfig.team1ScoreRange[0]} - {predictionConfig.team1ScoreRange[1]}
                    </Badge>
                  </div>
                  <div className="px-3">
                    <Slider
                      value={predictionConfig.team1ScoreRange}
                      onValueChange={(value) => updatePredictionConfig('team1ScoreRange', value as [number, number])}
                      max={400}
                      min={50}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>50</span>
                      <span>225</span>
                      <span>400</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Team B Score Range */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">{team2Name} Score Range</Label>
                    <Badge variant="default" size="lg">
                      {predictionConfig.team2ScoreRange[0]} - {predictionConfig.team2ScoreRange[1]}
                    </Badge>
                  </div>
                  <div className="px-3">
                    <Slider
                      value={predictionConfig.team2ScoreRange}
                      onValueChange={(value) => updatePredictionConfig('team2ScoreRange', value as [number, number])}
                      max={400}
                      min={50}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>50</span>
                      <span>225</span>
                      <span>400</span>
                    </div>
                  </div>
                </div>

                {/* Match Outcome Prediction */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Match Outcome Prediction</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { key: 'team1_win', label: `${team1Name} Win`, icon: Trophy, color: 'from-blue-500 to-blue-600' },
                      { key: 'team2_win', label: `${team2Name} Win`, icon: Trophy, color: 'from-green-500 to-green-600' },
                      { key: 'close', label: 'Close Match', icon: Activity, color: 'from-orange-500 to-orange-600' },
                      { key: 'uncertain', label: 'Uncertain', icon: AlertCircle, color: 'from-gray-500 to-gray-600' }
                    ].map(({ key, label, icon: Icon, color }) => (
                      <Button
                        key={key}
                        variant={predictionConfig.matchOutcome === key ? "default" : "outline"}
                        onClick={() => updatePredictionConfig('matchOutcome', key)}
                        className={`h-auto p-4 flex flex-col gap-2 ${
                          predictionConfig.matchOutcome === key 
                          ? `bg-gradient-to-r ${color} text-white` 
                          : ''
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-sm">{label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button 
                onClick={() => setCurrentStep(2)} 
                className="flex items-center gap-2"
                size="lg"
              >
                Next: Key Storylines <TrendingUp className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Key Storylines */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Key Match Storylines
                </CardTitle>
                <CardDescription>
                  Select up to 4 key storylines that will influence team selection (Selected: {selectedStorylines.length}/4)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-3">
                  {availableStorylines.map((storyline) => {
                    const isSelected = selectedStorylines.includes(storyline);
                    return (
                      <motion.div
                        key={storyline}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          isSelected 
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                          : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                        }`}
                        onClick={() => handleStorylineToggle(storyline)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{storyline}</span>
                          {isSelected && <CheckCircle className="h-4 w-4 text-green-500" />}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {selectedStorylines.length > 0 && (
                  <div className="mt-6">
                    <Label className="text-sm font-medium">Selected Storylines:</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedStorylines.map((storyline) => (
                        <Badge 
                          key={storyline} 
                          variant="cricket" 
                          size="sm"
                          className="cursor-pointer"
                          onClick={() => handleStorylineToggle(storyline)}
                        >
                          {storyline} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                Back
              </Button>
              <Button 
                onClick={() => setCurrentStep(3)} 
                disabled={!canProceedToNext()}
                className="flex items-center gap-2"
              >
                Next: Match Conditions <CloudRain className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Match Conditions */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CloudRain className="h-5 w-5" />
                    Weather Impact
                  </CardTitle>
                  <CardDescription>
                    How much will weather affect the match?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { key: 'high', label: 'High Impact', desc: 'Significant weather interference expected', icon: Wind },
                      { key: 'medium', label: 'Medium Impact', desc: 'Some weather influence on play', icon: CloudRain },
                      { key: 'low', label: 'Low Impact', desc: 'Minimal weather disruption', icon: Sun }
                    ].map(({ key, label, desc, icon: Icon }) => (
                      <div
                        key={key}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          predictionConfig.weatherImpact === key
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => updatePredictionConfig('weatherImpact', key)}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5" />
                          <div>
                            <div className="font-medium">{label}</div>
                            <div className="text-sm text-muted-foreground">{desc}</div>
                          </div>
                          {predictionConfig.weatherImpact === key && (
                            <CheckCircle className="h-4 w-4 text-blue-500 ml-auto" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Pitch Condition
                  </CardTitle>
                  <CardDescription>
                    What type of pitch conditions are expected?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { key: 'batting', label: 'Batting Friendly', desc: 'High scores, favors batsmen', icon: Target },
                      { key: 'bowling', label: 'Bowling Friendly', desc: 'Low scores, favors bowlers', icon: Activity },
                      { key: 'balanced', label: 'Balanced Pitch', desc: 'Even contest between bat and ball', icon: BarChart3 }
                    ].map(({ key, label, desc, icon: Icon }) => (
                      <div
                        key={key}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          predictionConfig.pitchCondition === key
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => updatePredictionConfig('pitchCondition', key)}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5" />
                          <div>
                            <div className="font-medium">{label}</div>
                            <div className="text-sm text-muted-foreground">{desc}</div>
                          </div>
                          {predictionConfig.pitchCondition === key && (
                            <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Team Count Selection */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Number of Teams
                </CardTitle>
                <CardDescription>
                  How many teams would you like to generate?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Team Count</Label>
                    <Badge variant="default" size="lg">{predictionConfig.teamCount} Teams</Badge>
                  </div>
                  <Slider
                    value={[predictionConfig.teamCount]}
                    onValueChange={(value) => updatePredictionConfig('teamCount', value[0])}
                    max={15}
                    min={3}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>3 teams</span>
                    <span>9 teams</span>
                    <span>15 teams</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                Back
              </Button>
              <Button 
                onClick={() => setCurrentStep(4)} 
                className="flex items-center gap-2"
              >
                Review & Generate <Trophy className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Review and Generate */}
        {currentStep === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Strategy Summary
                </CardTitle>
                <CardDescription>
                  Review your predictions and storylines before generating teams
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Score Predictions Summary */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">{team1Name}</h4>
                    <div className="text-2xl font-bold text-blue-600">
                      {predictionConfig.team1ScoreRange[0]} - {predictionConfig.team1ScoreRange[1]}
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">Predicted Score Range</div>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">{team2Name}</h4>
                    <div className="text-2xl font-bold text-green-600">
                      {predictionConfig.team2ScoreRange[0]} - {predictionConfig.team2ScoreRange[1]}
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300">Predicted Score Range</div>
                  </div>
                </div>

                <Separator />

                {/* Match Outcome */}
                <div>
                  <h4 className="font-medium mb-2">Match Outcome Prediction</h4>
                  <Badge variant="default" size="lg" className="capitalize">
                    {predictionConfig.matchOutcome.replace('_', ' ')}
                  </Badge>
                </div>

                <Separator />

                {/* Key Storylines */}
                <div>
                  <h4 className="font-medium mb-2">Key Storylines ({selectedStorylines.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedStorylines.map((storyline) => (
                      <Badge key={storyline} variant="cricket" size="sm">
                        {storyline}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Conditions Summary */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="font-medium">Weather Impact</div>
                    <Badge variant="default" className="mt-1 capitalize">
                      {predictionConfig.weatherImpact}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">Pitch Condition</div>
                    <Badge variant="default" className="mt-1 capitalize">
                      {predictionConfig.pitchCondition}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">Teams to Generate</div>
                    <Badge variant="default" className="mt-1">
                      {predictionConfig.teamCount}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(3)}>
                Back
              </Button>
              <Button 
                onClick={generateStrategy3Teams}
                disabled={isGenerating}
                className="flex items-center gap-2"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating Teams...
                  </>
                ) : (
                  <>
                    <Trophy className="h-4 w-4" />
                    Generate Strategy 3 Teams
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
