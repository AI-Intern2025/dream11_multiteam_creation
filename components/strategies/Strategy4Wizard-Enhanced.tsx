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
  Shield, 
  Target, 
  BarChart3,
  Trophy,
  CheckCircle,
  AlertCircle,
  Zap,
  Star,
  Users,
  TrendingUp,
  TrendingDown,
  Activity,
  LineChart,
  PieChart,
  Coins,
  DollarSign,
  Percent,
  Lock,
  Unlock,
  Layers
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { CricketPlayer, EnrichedMatchData } from '../../lib/cricket-types';

interface Strategy4Props {
  matchData: EnrichedMatchData | null;
  onStrategyComplete: (result: any) => void;
}

interface CoreHedgeConfig {
  corePlayerPercentage: number;
  hedgePlayerPercentage: number;
  riskTolerance: 'conservative' | 'balanced' | 'aggressive';
  budgetAllocation: {
    core: number;
    hedge: number;
    differentials: number;
  };
  teamCount: number;
  ownershipStrategy: 'contrarian' | 'mainstream' | 'balanced';
}

export default function Strategy4WizardEnhanced({ matchData, onStrategyComplete }: Strategy4Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [coreHedgeConfig, setCoreHedgeConfig] = useState<CoreHedgeConfig>({
    corePlayerPercentage: 60,
    hedgePlayerPercentage: 30,
    riskTolerance: 'balanced',
    budgetAllocation: {
      core: 60,
      hedge: 25,
      differentials: 15
    },
    teamCount: 8,
    ownershipStrategy: 'balanced'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const team1Name = matchData?.match?.team_a_name || 'Team A';
  const team2Name = matchData?.match?.team_b_name || 'Team B';

  const generateStrategy4Teams = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/strategies/strategy4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coreHedgeConfig,
          matchData
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        toast({
          title: "Strategy 4 Complete!",
          description: `Generated ${result.teams.length} teams with core-hedge portfolio approach`,
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
    return true; // All steps have default valid values
  };

  const getStepIcon = (step: number) => {
    if (currentStep > step) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (currentStep === step) return <Target className="h-5 w-5 text-blue-500" />;
    return <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />;
  };

  const updateConfig = (key: keyof CoreHedgeConfig, value: any) => {
    setCoreHedgeConfig(prev => ({ ...prev, [key]: value }));
  };

  const updateBudgetAllocation = (key: keyof CoreHedgeConfig['budgetAllocation'], value: number) => {
    setCoreHedgeConfig(prev => ({
      ...prev,
      budgetAllocation: {
        ...prev.budgetAllocation,
        [key]: value
      }
    }));
  };

  // Auto-balance budget allocation
  useEffect(() => {
    const total = coreHedgeConfig.budgetAllocation.core + 
                  coreHedgeConfig.budgetAllocation.hedge + 
                  coreHedgeConfig.budgetAllocation.differentials;
    
    if (Math.abs(total - 100) > 1) {
      // Auto-adjust differentials to make total 100
      const newDifferentials = 100 - coreHedgeConfig.budgetAllocation.core - coreHedgeConfig.budgetAllocation.hedge;
      if (newDifferentials >= 0 && newDifferentials <= 100) {
        updateBudgetAllocation('differentials', newDifferentials);
      }
    }
  }, [coreHedgeConfig.budgetAllocation.core, coreHedgeConfig.budgetAllocation.hedge]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3"
        >
          <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Strategy 4: Core-Hedge Selection
            </h1>
            <p className="text-muted-foreground">Portfolio approach with balanced risk distribution</p>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                {getStepIcon(step)}
                <span className="text-xs font-medium">
                  {step === 1 ? 'Portfolio' : step === 2 ? 'Budget' : step === 3 ? 'Strategy' : 'Generate'}
                </span>
              </div>
              {step < 4 && <div className="w-8 h-px bg-muted-foreground/30 mx-2" />}
            </div>
          ))}
        </div>

        <Progress value={(currentStep / 4) * 100} className="max-w-md mx-auto" variant="cricket" />
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Portfolio Balance */}
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
                  <Layers className="h-5 w-5" />
                  Portfolio Balance Configuration
                </CardTitle>
                <CardDescription>
                  Define the core-hedge player distribution strategy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Core Players */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-blue-500" />
                      <Label className="text-base font-medium">Core Players (Safe Picks)</Label>
                    </div>
                    <Badge variant="default" size="lg">
                      {coreHedgeConfig.corePlayerPercentage}%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Reliable, consistent performers with lower risk
                  </p>
                  <Slider
                    value={[coreHedgeConfig.corePlayerPercentage]}
                    onValueChange={(value) => updateConfig('corePlayerPercentage', value[0])}
                    max={80}
                    min={40}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>40% (Conservative)</span>
                    <span>60% (Balanced)</span>
                    <span>80% (Ultra-Safe)</span>
                  </div>
                </div>

                <Separator />

                {/* Hedge Players */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Unlock className="h-4 w-4 text-orange-500" />
                      <Label className="text-base font-medium">Hedge Players (Risk Mitigation)</Label>
                    </div>
                    <Badge variant="default" size="lg">
                      {coreHedgeConfig.hedgePlayerPercentage}%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Players to balance out risk from core selections
                  </p>
                  <Slider
                    value={[coreHedgeConfig.hedgePlayerPercentage]}
                    onValueChange={(value) => updateConfig('hedgePlayerPercentage', value[0])}
                    max={50}
                    min={20}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>20% (Minimal)</span>
                    <span>35% (Optimal)</span>
                    <span>50% (Maximum)</span>
                  </div>
                </div>

                {/* Differential Players */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-green-500" />
                      <Label className="text-base font-medium">Differential Players</Label>
                    </div>
                    <Badge variant="cricket" size="lg">
                      {100 - coreHedgeConfig.corePlayerPercentage - coreHedgeConfig.hedgePlayerPercentage}%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    High-upside players for tournament differentiation (auto-calculated)
                  </p>
                </div>

                {/* Risk Tolerance */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Overall Risk Tolerance</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: 'conservative', label: 'Conservative', desc: 'Low risk, steady returns', icon: Shield },
                      { key: 'balanced', label: 'Balanced', desc: 'Moderate risk-reward balance', icon: BarChart3 },
                      { key: 'aggressive', label: 'Aggressive', desc: 'High risk, high reward', icon: TrendingUp }
                    ].map(({ key, label, desc, icon: Icon }) => (
                      <Button
                        key={key}
                        variant={coreHedgeConfig.riskTolerance === key ? "default" : "outline"}
                        onClick={() => updateConfig('riskTolerance', key)}
                        className="h-auto p-4 flex flex-col gap-2"
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-sm font-medium">{label}</span>
                        <span className="text-xs text-muted-foreground">{desc}</span>
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
                Next: Budget Allocation <DollarSign className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Budget Allocation */}
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
                  <Coins className="h-5 w-5" />
                  Budget Allocation Strategy
                </CardTitle>
                <CardDescription>
                  Distribute your 100 credit budget across player categories
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Core Players Budget */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Core Players Budget</Label>
                    <Badge variant="default" size="lg">
                      {coreHedgeConfig.budgetAllocation.core} credits
                    </Badge>
                  </div>
                  <Slider
                    value={[coreHedgeConfig.budgetAllocation.core]}
                    onValueChange={(value) => updateBudgetAllocation('core', value[0])}
                    max={80}
                    min={40}
                    step={5}
                    className="w-full"
                  />
                </div>

                <Separator />

                {/* Hedge Players Budget */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Hedge Players Budget</Label>
                    <Badge variant="default" size="lg">
                      {coreHedgeConfig.budgetAllocation.hedge} credits
                    </Badge>
                  </div>
                  <Slider
                    value={[coreHedgeConfig.budgetAllocation.hedge]}
                    onValueChange={(value) => updateBudgetAllocation('hedge', value[0])}
                    max={40}
                    min={15}
                    step={5}
                    className="w-full"
                  />
                </div>

                <Separator />

                {/* Differential Players Budget */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Differential Players Budget</Label>
                    <Badge variant="cricket" size="lg">
                      {coreHedgeConfig.budgetAllocation.differentials} credits
                    </Badge>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Auto-calculated to ensure total budget equals 100 credits
                    </p>
                  </div>
                </div>

                {/* Budget Summary */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">Total Budget</span>
                    <Badge 
                      variant={
                        (coreHedgeConfig.budgetAllocation.core + 
                         coreHedgeConfig.budgetAllocation.hedge + 
                         coreHedgeConfig.budgetAllocation.differentials) === 100 
                        ? "cricket" : "destructive"
                      } 
                      size="lg"
                    >
                      {coreHedgeConfig.budgetAllocation.core + 
                       coreHedgeConfig.budgetAllocation.hedge + 
                       coreHedgeConfig.budgetAllocation.differentials} / 100
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-medium text-blue-600">Core</div>
                      <div>{coreHedgeConfig.budgetAllocation.core}%</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-orange-600">Hedge</div>
                      <div>{coreHedgeConfig.budgetAllocation.hedge}%</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-green-600">Differential</div>
                      <div>{coreHedgeConfig.budgetAllocation.differentials}%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                Back
              </Button>
              <Button 
                onClick={() => setCurrentStep(3)} 
                className="flex items-center gap-2"
              >
                Next: Ownership Strategy <Percent className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Ownership Strategy */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Ownership Strategy
                </CardTitle>
                <CardDescription>
                  Choose your approach to popular vs. contrarian player selections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    {
                      key: 'contrarian',
                      label: 'Contrarian',
                      desc: 'Avoid highly owned players',
                      longDesc: 'Focus on low-owned players to maximize differentiation',
                      icon: TrendingDown,
                      color: 'from-red-500 to-red-600'
                    },
                    {
                      key: 'balanced',
                      label: 'Balanced',
                      desc: 'Mix of popular and differentials',
                      longDesc: 'Balanced approach mixing popular and unique selections',
                      icon: BarChart3,
                      color: 'from-blue-500 to-blue-600'
                    },
                    {
                      key: 'mainstream',
                      label: 'Mainstream',
                      desc: 'Follow popular consensus',
                      longDesc: 'Focus on highly owned, consensus players',
                      icon: TrendingUp,
                      color: 'from-green-500 to-green-600'
                    }
                  ].map(({ key, label, desc, longDesc, icon: Icon, color }) => (
                    <Card 
                      key={key}
                      variant={coreHedgeConfig.ownershipStrategy === key ? "primary" : "default"}
                      className={`cursor-pointer transition-all hover:scale-105 ${
                        coreHedgeConfig.ownershipStrategy === key 
                        ? `bg-gradient-to-br ${color} text-white` 
                        : ''
                      }`}
                      onClick={() => updateConfig('ownershipStrategy', key)}
                    >
                      <CardContent className="p-6 text-center space-y-3">
                        <Icon className="h-8 w-8 mx-auto" />
                        <div>
                          <h3 className="font-semibold text-lg">{label}</h3>
                          <p className="text-sm opacity-80">{desc}</p>
                          <p className="text-xs mt-2 opacity-70">{longDesc}</p>
                        </div>
                        {coreHedgeConfig.ownershipStrategy === key && (
                          <CheckCircle className="h-5 w-5 mx-auto mt-2" />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Team Count */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Number of Teams</Label>
                    <Badge variant="default" size="lg">{coreHedgeConfig.teamCount} Teams</Badge>
                  </div>
                  <Slider
                    value={[coreHedgeConfig.teamCount]}
                    onValueChange={(value) => updateConfig('teamCount', value[0])}
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
                  <PieChart className="h-5 w-5" />
                  Core-Hedge Strategy Summary
                </CardTitle>
                <CardDescription>
                  Review your portfolio configuration before generating teams
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Portfolio Balance */}
                <div>
                  <h4 className="font-medium mb-3">Portfolio Balance</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Lock className="h-4 w-4 text-blue-500" />
                        <Badge variant="default">{coreHedgeConfig.corePlayerPercentage}%</Badge>
                      </div>
                      <div className="font-medium text-blue-900 dark:text-blue-100">Core Players</div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">Safe, reliable picks</div>
                    </div>
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Unlock className="h-4 w-4 text-orange-500" />
                        <Badge variant="default">{coreHedgeConfig.hedgePlayerPercentage}%</Badge>
                      </div>
                      <div className="font-medium text-orange-900 dark:text-orange-100">Hedge Players</div>
                      <div className="text-sm text-orange-700 dark:text-orange-300">Risk mitigation</div>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Zap className="h-4 w-4 text-green-500" />
                        <Badge variant="default">
                          {100 - coreHedgeConfig.corePlayerPercentage - coreHedgeConfig.hedgePlayerPercentage}%
                        </Badge>
                      </div>
                      <div className="font-medium text-green-900 dark:text-green-100">Differentials</div>
                      <div className="text-sm text-green-700 dark:text-green-300">Upside plays</div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Budget Allocation */}
                <div>
                  <h4 className="font-medium mb-3">Budget Allocation</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {coreHedgeConfig.budgetAllocation.core}
                      </div>
                      <div className="text-sm text-muted-foreground">Core Credits</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {coreHedgeConfig.budgetAllocation.hedge}
                      </div>
                      <div className="text-sm text-muted-foreground">Hedge Credits</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {coreHedgeConfig.budgetAllocation.differentials}
                      </div>
                      <div className="text-sm text-muted-foreground">Differential Credits</div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Strategy Settings */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="font-medium">Risk Tolerance</div>
                    <Badge variant="default" className="mt-1 capitalize">
                      {coreHedgeConfig.riskTolerance}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">Ownership Strategy</div>
                    <Badge variant="default" className="mt-1 capitalize">
                      {coreHedgeConfig.ownershipStrategy}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">Teams to Generate</div>
                    <Badge variant="default" className="mt-1">
                      {coreHedgeConfig.teamCount}
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
                onClick={generateStrategy4Teams}
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
                    Generate Core-Hedge Teams
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
