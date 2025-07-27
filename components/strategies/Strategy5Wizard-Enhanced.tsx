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
import { Switch } from '../ui/switch';
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
  Wind,
  Brain,
  Database,
  Filter,
  Settings,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Shield,
  TrendingDown,
  BarChart2,
  Percent
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { CricketPlayer, EnrichedMatchData } from '../../lib/cricket-types';

interface Strategy5Props {
  matchData: EnrichedMatchData | null;
  onStrategyComplete: (result: any) => void;
}

interface StatisticalGuardrails {
  minRecentFormScore: number;
  maxDreamsPriceCap: number;
  minOwnershipPercentage: number;
  maxOwnershipPercentage: number;
  recentMatchWindow: number;
  venueAdvantageWeight: number;
  injuryRiskTolerance: 'low' | 'medium' | 'high';
  consistencyWeight: number;
  opponentStrengthWeight: number;
}

interface MLOptimizationConfig {
  enableMLOptimization: boolean;
  optimizationObjective: 'balanced' | 'high_risk_high_reward' | 'safe_consistent' | 'contrarian';
  predictiveModelWeight: number;
  ensembleModels: string[];
  correlationAnalysis: boolean;
  volatilityAdjustment: boolean;
  momentumFactor: number;
}

interface AdvancedFilters {
  mustIncludePlayers: string[];
  avoidPlayers: string[];
  roleDistribution: {
    batsmen: [number, number];
    bowlers: [number, number];
    allRounders: [number, number];
    wicketKeepers: [number, number];
  };
  teamBalanceRequirement: 'strict' | 'flexible' | 'experimental';
  budgetAllocation: 'even' | 'star_heavy' | 'balanced_depth';
}

export default function Strategy5WizardEnhanced({ matchData, onStrategyComplete }: Strategy5Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [teamCount, setTeamCount] = useState(8);
  
  const [statisticalGuardrails, setStatisticalGuardrails] = useState<StatisticalGuardrails>({
    minRecentFormScore: 7.5,
    maxDreamsPriceCap: 11.0,
    minOwnershipPercentage: 5,
    maxOwnershipPercentage: 35,
    recentMatchWindow: 5,
    venueAdvantageWeight: 0.15,
    injuryRiskTolerance: 'medium',
    consistencyWeight: 0.25,
    opponentStrengthWeight: 0.20
  });

  const [mlConfig, setMLConfig] = useState<MLOptimizationConfig>({
    enableMLOptimization: true,
    optimizationObjective: 'balanced',
    predictiveModelWeight: 0.30,
    ensembleModels: ['xgboost', 'random_forest', 'neural_network'],
    correlationAnalysis: true,
    volatilityAdjustment: true,
    momentumFactor: 0.15
  });

  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    mustIncludePlayers: [],
    avoidPlayers: [],
    roleDistribution: {
      batsmen: [3, 5],
      bowlers: [3, 5],
      allRounders: [1, 3],
      wicketKeepers: [1, 2]
    },
    teamBalanceRequirement: 'flexible',
    budgetAllocation: 'balanced_depth'
  });

  const { toast } = useToast();

  const team1Name = matchData?.match?.team_a_name || 'Team A';
  const team2Name = matchData?.match?.team_b_name || 'Team B';
  const players = matchData?.players || [];

  const availableModels = [
    { id: 'xgboost', name: 'XGBoost', description: 'Gradient boosting for complex patterns' },
    { id: 'random_forest', name: 'Random Forest', description: 'Ensemble method for stability' },
    { id: 'neural_network', name: 'Neural Network', description: 'Deep learning for non-linear relationships' },
    { id: 'linear_regression', name: 'Linear Regression', description: 'Simple baseline model' },
    { id: 'svm', name: 'Support Vector Machine', description: 'Good for high-dimensional data' },
    { id: 'catboost', name: 'CatBoost', description: 'Categorical feature optimization' }
  ];

  const handleModelToggle = (modelId: string) => {
    setMLConfig(prev => ({
      ...prev,
      ensembleModels: prev.ensembleModels.includes(modelId)
        ? prev.ensembleModels.filter(m => m !== modelId)
        : [...prev.ensembleModels, modelId]
    }));
  };

  const handlePlayerToggle = (playerId: string, type: 'include' | 'avoid') => {
    if (type === 'include') {
      setAdvancedFilters(prev => ({
        ...prev,
        mustIncludePlayers: prev.mustIncludePlayers.includes(playerId)
          ? prev.mustIncludePlayers.filter(p => p !== playerId)
          : [...prev.mustIncludePlayers, playerId],
        avoidPlayers: prev.avoidPlayers.filter(p => p !== playerId)
      }));
    } else {
      setAdvancedFilters(prev => ({
        ...prev,
        avoidPlayers: prev.avoidPlayers.includes(playerId)
          ? prev.avoidPlayers.filter(p => p !== playerId)
          : [...prev.avoidPlayers, playerId],
        mustIncludePlayers: prev.mustIncludePlayers.filter(p => p !== playerId)
      }));
    }
  };

  const generateStrategy5Teams = async () => {
    if (mlConfig.enableMLOptimization && mlConfig.ensembleModels.length === 0) {
      toast({
        title: "ML Configuration Required",
        description: "Please select at least one ML model for optimization",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/strategies/strategy5', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          statisticalGuardrails,
          mlConfig,
          advancedFilters,
          teamCount,
          matchData
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        toast({
          title: "Strategy 5 Complete!",
          description: `Generated ${result.teams.length} ML-optimized teams with statistical guardrails`,
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
      case 1: return true; // Statistical guardrails always valid
      case 2: return !mlConfig.enableMLOptimization || mlConfig.ensembleModels.length > 0;
      case 3: return true; // Advanced filters always valid
      default: return false;
    }
  };

  const getStepIcon = (step: number) => {
    if (currentStep > step) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (currentStep === step) return <Database className="h-5 w-5 text-blue-500" />;
    return <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />;
  };

  const updateGuardrails = (key: keyof StatisticalGuardrails, value: any) => {
    setStatisticalGuardrails(prev => ({ ...prev, [key]: value }));
  };

  const updateMLConfig = (key: keyof MLOptimizationConfig, value: any) => {
    setMLConfig(prev => ({ ...prev, [key]: value }));
  };

  const updateAdvancedFilters = (key: keyof AdvancedFilters, value: any) => {
    setAdvancedFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3"
        >
          <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Strategy 5: Stats-Driven ML Optimization
            </h1>
            <p className="text-muted-foreground">Generate teams using statistical guardrails and ML optimization</p>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                {getStepIcon(step)}
                <span className="text-xs font-medium">
                  {step === 1 ? 'Guardrails' : step === 2 ? 'ML Config' : step === 3 ? 'Filters' : 'Generate'}
                </span>
              </div>
              {step < 4 && <div className="w-8 h-px bg-muted-foreground/30 mx-2" />}
            </div>
          ))}
        </div>

        <Progress value={(currentStep / 4) * 100} className="max-w-md mx-auto" variant="cricket" />
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Statistical Guardrails */}
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-6">
              {/* Form & Performance Metrics */}
              <Card variant="primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Form & Performance
                  </CardTitle>
                  <CardDescription>
                    Set minimum thresholds for player form and performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Minimum Recent Form Score</Label>
                      <Badge variant="default">{statisticalGuardrails.minRecentFormScore}/10</Badge>
                    </div>
                    <Slider
                      value={[statisticalGuardrails.minRecentFormScore]}
                      onValueChange={(value) => updateGuardrails('minRecentFormScore', value[0])}
                      min={5.0}
                      max={9.5}
                      step={0.5}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Recent Match Window</Label>
                      <Badge variant="default">{statisticalGuardrails.recentMatchWindow} matches</Badge>
                    </div>
                    <Slider
                      value={[statisticalGuardrails.recentMatchWindow]}
                      onValueChange={(value) => updateGuardrails('recentMatchWindow', value[0])}
                      min={3}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Consistency Weight</Label>
                      <Badge variant="default">{Math.round(statisticalGuardrails.consistencyWeight * 100)}%</Badge>
                    </div>
                    <Slider
                      value={[statisticalGuardrails.consistencyWeight * 100]}
                      onValueChange={(value) => updateGuardrails('consistencyWeight', value[0] / 100)}
                      min={10}
                      max={50}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Price & Ownership Constraints */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Price & Ownership
                  </CardTitle>
                  <CardDescription>
                    Control budget allocation and ownership ranges
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Max Dreams Price Cap</Label>
                      <Badge variant="default">{statisticalGuardrails.maxDreamsPriceCap} Cr</Badge>
                    </div>
                    <Slider
                      value={[statisticalGuardrails.maxDreamsPriceCap]}
                      onValueChange={(value) => updateGuardrails('maxDreamsPriceCap', value[0])}
                      min={8.5}
                      max={15.0}
                      step={0.5}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Ownership Range</Label>
                    <div className="flex items-center gap-2">
                      <Badge variant="default" size="sm">{statisticalGuardrails.minOwnershipPercentage}%</Badge>
                      <span className="text-muted-foreground">to</span>
                      <Badge variant="default" size="sm">{statisticalGuardrails.maxOwnershipPercentage}%</Badge>
                    </div>
                    <div className="space-y-2">
                      <Slider
                        value={[statisticalGuardrails.minOwnershipPercentage, statisticalGuardrails.maxOwnershipPercentage]}
                        onValueChange={(value) => {
                          updateGuardrails('minOwnershipPercentage', value[0]);
                          updateGuardrails('maxOwnershipPercentage', value[1]);
                        }}
                        min={1}
                        max={60}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Statistical Factors */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Advanced Statistical Factors
                </CardTitle>
                <CardDescription>
                  Fine-tune weights for various performance factors
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Venue Advantage Weight</Label>
                      <Badge variant="cricket">{Math.round(statisticalGuardrails.venueAdvantageWeight * 100)}%</Badge>
                    </div>
                    <Slider
                      value={[statisticalGuardrails.venueAdvantageWeight * 100]}
                      onValueChange={(value) => updateGuardrails('venueAdvantageWeight', value[0] / 100)}
                      min={5}
                      max={30}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Opponent Strength Weight</Label>
                      <Badge variant="cricket">{Math.round(statisticalGuardrails.opponentStrengthWeight * 100)}%</Badge>
                    </div>
                    <Slider
                      value={[statisticalGuardrails.opponentStrengthWeight * 100]}
                      onValueChange={(value) => updateGuardrails('opponentStrengthWeight', value[0] / 100)}
                      min={10}
                      max={40}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Injury Risk Tolerance</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: 'low', label: 'Low Risk', desc: 'Avoid injury-prone players', icon: Shield },
                      { key: 'medium', label: 'Medium Risk', desc: 'Balanced approach', icon: Activity },
                      { key: 'high', label: 'High Risk', desc: 'Include all players', icon: Zap }
                    ].map(({ key, label, desc, icon: Icon }) => (
                      <Button
                        key={key}
                        variant={statisticalGuardrails.injuryRiskTolerance === key ? "default" : "outline"}
                        onClick={() => updateGuardrails('injuryRiskTolerance', key)}
                        className="h-auto p-4 flex flex-col gap-2"
                      >
                        <Icon className="h-5 w-5" />
                        <div className="text-center">
                          <div className="font-medium">{label}</div>
                          <div className="text-xs text-muted-foreground">{desc}</div>
                        </div>
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
                Next: ML Configuration <Brain className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: ML Optimization Configuration */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* ML Enable/Disable */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Machine Learning Optimization
                </CardTitle>
                <CardDescription>
                  Enable AI-powered optimization for enhanced team selection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg">
                  <div>
                    <div className="font-medium">Enable ML Optimization</div>
                    <div className="text-sm text-muted-foreground">
                      Use machine learning models to optimize team selection
                    </div>
                  </div>
                  <Switch
                    checked={mlConfig.enableMLOptimization}
                    onCheckedChange={(checked) => updateMLConfig('enableMLOptimization', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {mlConfig.enableMLOptimization && (
              <>
                {/* Optimization Objective */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Optimization Objective
                    </CardTitle>
                    <CardDescription>
                      Choose your strategic approach for ML optimization
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        { 
                          key: 'balanced', 
                          label: 'Balanced Approach', 
                          desc: 'Even mix of safety and upside',
                          icon: BarChart2,
                          color: 'from-blue-500 to-blue-600'
                        },
                        { 
                          key: 'high_risk_high_reward', 
                          label: 'High Risk High Reward', 
                          desc: 'Maximum upside potential',
                          icon: TrendingUp,
                          color: 'from-red-500 to-red-600'
                        },
                        { 
                          key: 'safe_consistent', 
                          label: 'Safe & Consistent', 
                          desc: 'Minimize variance, steady returns',
                          icon: Shield,
                          color: 'from-green-500 to-green-600'
                        },
                        { 
                          key: 'contrarian', 
                          label: 'Contrarian Strategy', 
                          desc: 'Low ownership, high differentiation',
                          icon: TrendingDown,
                          color: 'from-purple-500 to-purple-600'
                        }
                      ].map(({ key, label, desc, icon: Icon, color }) => (
                        <motion.div
                          key={key}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            mlConfig.optimizationObjective === key
                            ? `border-purple-500 bg-gradient-to-r ${color} text-white`
                            : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => updateMLConfig('optimizationObjective', key)}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="h-6 w-6" />
                            <div>
                              <div className="font-medium">{label}</div>
                              <div className={`text-sm ${mlConfig.optimizationObjective === key ? 'text-white/80' : 'text-muted-foreground'}`}>
                                {desc}
                              </div>
                            </div>
                            {mlConfig.optimizationObjective === key && (
                              <CheckCircle className="h-5 w-5 ml-auto" />
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* ML Model Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Ensemble Models ({mlConfig.ensembleModels.length} selected)
                    </CardTitle>
                    <CardDescription>
                      Select machine learning models for ensemble optimization
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-3">
                      {availableModels.map((model) => {
                        const isSelected = mlConfig.ensembleModels.includes(model.id);
                        return (
                          <motion.div
                            key={model.id}
                            whileHover={{ scale: 1.01 }}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              isSelected 
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                              : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => handleModelToggle(model.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{model.name}</div>
                                <div className="text-xs text-muted-foreground">{model.description}</div>
                              </div>
                              {isSelected && <CheckCircle className="h-4 w-4 text-purple-500" />}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Advanced ML Configuration */}
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Advanced ML Parameters
                    </CardTitle>
                    <CardDescription>
                      Fine-tune machine learning optimization parameters
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Predictive Model Weight</Label>
                          <Badge variant="default">{Math.round(mlConfig.predictiveModelWeight * 100)}%</Badge>
                        </div>
                        <Slider
                          value={[mlConfig.predictiveModelWeight * 100]}
                          onValueChange={(value) => updateMLConfig('predictiveModelWeight', value[0] / 100)}
                          min={10}
                          max={60}
                          step={5}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Momentum Factor</Label>
                          <Badge variant="default">{Math.round(mlConfig.momentumFactor * 100)}%</Badge>
                        </div>
                        <Slider
                          value={[mlConfig.momentumFactor * 100]}
                          onValueChange={(value) => updateMLConfig('momentumFactor', value[0] / 100)}
                          min={5}
                          max={30}
                          step={5}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <div className="font-medium">Correlation Analysis</div>
                          <div className="text-sm text-muted-foreground">Player performance correlation</div>
                        </div>
                        <Switch
                          checked={mlConfig.correlationAnalysis}
                          onCheckedChange={(checked) => updateMLConfig('correlationAnalysis', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <div className="font-medium">Volatility Adjustment</div>
                          <div className="text-sm text-muted-foreground">Risk-adjusted scoring</div>
                        </div>
                        <Switch
                          checked={mlConfig.volatilityAdjustment}
                          onCheckedChange={(checked) => updateMLConfig('volatilityAdjustment', checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                Back
              </Button>
              <Button 
                onClick={() => setCurrentStep(3)} 
                disabled={!canProceedToNext()}
                className="flex items-center gap-2"
              >
                Next: Advanced Filters <Filter className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Advanced Filters */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Player Inclusion/Exclusion */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Must Include Players ({advancedFilters.mustIncludePlayers.length})
                  </CardTitle>
                  <CardDescription>
                    Players that must be in every team
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {players.slice(0, 8).map((player) => {
                      const isIncluded = advancedFilters.mustIncludePlayers.includes(player.id);
                      const isAvoided = advancedFilters.avoidPlayers.includes(player.id);
                      return (
                        <div
                          key={player.id}
                          className={`p-2 rounded border cursor-pointer transition-all ${
                            isIncluded ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 
                            isAvoided ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                            'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handlePlayerToggle(player.id, 'include')}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium">{player.name}</span>
                              <Badge variant="role" size="sm" className="ml-2">
                                {player.role}
                              </Badge>
                            </div>
                            {isIncluded && <CheckCircle className="h-4 w-4 text-green-500" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Avoid Players ({advancedFilters.avoidPlayers.length})
                  </CardTitle>
                  <CardDescription>
                    Players to exclude from all teams
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {players.slice(0, 8).map((player) => {
                      const isIncluded = advancedFilters.mustIncludePlayers.includes(player.id);
                      const isAvoided = advancedFilters.avoidPlayers.includes(player.id);
                      return (
                        <div
                          key={player.id}
                          className={`p-2 rounded border cursor-pointer transition-all ${
                            isAvoided ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 
                            isIncluded ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                            'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handlePlayerToggle(player.id, 'avoid')}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium">{player.name}</span>
                              <Badge variant="role" size="sm" className="ml-2">
                                {player.role}
                              </Badge>
                            </div>
                            {isAvoided && <AlertCircle className="h-4 w-4 text-red-500" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Role Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Role Distribution Requirements
                </CardTitle>
                <CardDescription>
                  Define minimum and maximum players per role
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(advancedFilters.roleDistribution).map(([role, range]) => (
                  <div key={role} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="capitalize">{role.replace(/([A-Z])/g, ' $1').trim()}</Label>
                      <Badge variant="default">
                        {range[0]} - {range[1]} players
                      </Badge>
                    </div>
                    <Slider
                      value={range}
                      onValueChange={(value) => updateAdvancedFilters('roleDistribution', {
                        ...advancedFilters.roleDistribution,
                        [role]: value as [number, number]
                      })}
                      min={0}
                      max={6}
                      step={1}
                      className="w-full"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Strategy Configuration */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Team Balance
                  </CardTitle>
                  <CardDescription>
                    How strict should role requirements be?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { key: 'strict', label: 'Strict Balance', desc: 'Enforce exact role distributions' },
                      { key: 'flexible', label: 'Flexible Balance', desc: 'Allow some variation in roles' },
                      { key: 'experimental', label: 'Experimental', desc: 'Creative role combinations' }
                    ].map(({ key, label, desc }) => (
                      <div
                        key={key}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          advancedFilters.teamBalanceRequirement === key
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => updateAdvancedFilters('teamBalanceRequirement', key)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{label}</div>
                            <div className="text-sm text-muted-foreground">{desc}</div>
                          </div>
                          {advancedFilters.teamBalanceRequirement === key && (
                            <CheckCircle className="h-4 w-4 text-purple-500" />
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
                    <Percent className="h-5 w-5" />
                    Budget Allocation
                  </CardTitle>
                  <CardDescription>
                    How should the 100 credit budget be distributed?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { key: 'even', label: 'Even Distribution', desc: 'Balanced spending across roles' },
                      { key: 'star_heavy', label: 'Star Heavy', desc: 'Invest in premium players' },
                      { key: 'balanced_depth', label: 'Balanced Depth', desc: 'Mix of stars and value picks' }
                    ].map(({ key, label, desc }) => (
                      <div
                        key={key}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          advancedFilters.budgetAllocation === key
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => updateAdvancedFilters('budgetAllocation', key)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{label}</div>
                            <div className="text-sm text-muted-foreground">{desc}</div>
                          </div>
                          {advancedFilters.budgetAllocation === key && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Team Count */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Number of Teams
                </CardTitle>
                <CardDescription>
                  How many optimized teams should be generated?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Team Count</Label>
                    <Badge variant="default" size="lg">{teamCount} Teams</Badge>
                  </div>
                  <Slider
                    value={[teamCount]}
                    onValueChange={(value) => setTeamCount(value[0])}
                    max={20}
                    min={5}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>5 teams</span>
                    <span>12 teams</span>
                    <span>20 teams</span>
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
                  <Brain className="h-5 w-5" />
                  ML-Optimized Strategy Summary
                </CardTitle>
                <CardDescription>
                  Review your statistical guardrails and ML configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Statistical Guardrails Summary */}
                <div>
                  <h4 className="font-medium mb-3">Statistical Guardrails</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-sm text-blue-700 dark:text-blue-300">Min Form Score</div>
                      <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                        {statisticalGuardrails.minRecentFormScore}/10
                      </div>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-sm text-green-700 dark:text-green-300">Max Price Cap</div>
                      <div className="text-lg font-bold text-green-900 dark:text-green-100">
                        {statisticalGuardrails.maxDreamsPriceCap} Cr
                      </div>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-sm text-purple-700 dark:text-purple-300">Ownership Range</div>
                      <div className="text-lg font-bold text-purple-900 dark:text-purple-100">
                        {statisticalGuardrails.minOwnershipPercentage}% - {statisticalGuardrails.maxOwnershipPercentage}%
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* ML Configuration Summary */}
                {mlConfig.enableMLOptimization && (
                  <div>
                    <h4 className="font-medium mb-3">ML Optimization</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Optimization Objective</span>
                        <Badge variant="default" className="capitalize">
                          {mlConfig.optimizationObjective.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Selected Models</span>
                        <div className="flex gap-1">
                          {mlConfig.ensembleModels.slice(0, 3).map(model => (
                            <Badge key={model} variant="cricket" size="sm">
                              {model.replace('_', ' ')}
                            </Badge>
                          ))}
                          {mlConfig.ensembleModels.length > 3 && (
                            <Badge variant="cricket" size="sm">
                              +{mlConfig.ensembleModels.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Model Weight</span>
                        <Badge variant="default">
                          {Math.round(mlConfig.predictiveModelWeight * 100)}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Advanced Filters Summary */}
                <div>
                  <h4 className="font-medium mb-3">Advanced Filters</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Must Include</div>
                      <div className="text-lg font-semibold">
                        {advancedFilters.mustIncludePlayers.length} players
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Avoid Players</div>
                      <div className="text-lg font-semibold">
                        {advancedFilters.avoidPlayers.length} players
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Team Balance</div>
                      <Badge variant="default" className="capitalize">
                        {advancedFilters.teamBalanceRequirement}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Budget Strategy</div>
                      <Badge variant="default" className="capitalize">
                        {advancedFilters.budgetAllocation.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Final Configuration */}
                <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {teamCount} Teams
                  </div>
                  <div className="text-sm text-purple-700 dark:text-purple-300">
                    ML-optimized with statistical guardrails
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(3)}>
                Back
              </Button>
              <Button 
                onClick={generateStrategy5Teams}
                disabled={isGenerating}
                className="flex items-center gap-2"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Optimizing Teams...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4" />
                    Generate ML-Optimized Teams
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
