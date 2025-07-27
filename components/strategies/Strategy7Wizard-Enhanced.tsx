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
  Layout,
  Layers,
  Globe,
  History,
  Compass,
  BookOpen,
  Lightbulb,
  Gauge,
  Split,
  Shuffle,
  RotateCcw,
  Grid3X3,
  Crosshair
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { CricketPlayer, EnrichedMatchData } from '../../lib/cricket-types';

interface Strategy7Props {
  matchData: EnrichedMatchData | null;
  onStrategyComplete: (result: any) => void;
}

interface RoleSplitConfig {
  batsmen_variations: {
    aggressive_openers: number;
    anchor_middle_order: number;
    finisher_specialists: number;
  };
  bowler_variations: {
    powerplay_specialists: number;
    middle_overs_control: number;
    death_bowling_experts: number;
  };
  allrounder_focus: 'batting_heavy' | 'bowling_heavy' | 'balanced' | 'utility';
  wicketkeeper_strategy: 'premium_single' | 'dual_keeper' | 'batting_focused';
}

interface OptimizationSettings {
  role_balance_strictness: 'strict' | 'flexible' | 'experimental';
  budget_distribution: 'role_heavy' | 'star_distributed' | 'value_balanced';
  diversity_factor: number; // 0-1 scale
  captaincy_rotation: boolean;
  complementary_skills: boolean;
  formation_style: '4-4-2-1' | '3-4-3-1' | '5-3-2-1' | 'custom';
}

interface FormationTemplate {
  id: string;
  name: string;
  description: string;
  distribution: {
    batsmen: number;
    bowlers: number;
    allRounders: number;
    wicketKeepers: number;
  };
  best_for: string;
  icon: React.ComponentType<any>;
}

export default function Strategy7WizardEnhanced({ matchData, onStrategyComplete }: Strategy7Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [teamCount, setTeamCount] = useState(8);
  
  const [roleSplitConfig, setRoleSplitConfig] = useState<RoleSplitConfig>({
    batsmen_variations: {
      aggressive_openers: 2,
      anchor_middle_order: 2,
      finisher_specialists: 1
    },
    bowler_variations: {
      powerplay_specialists: 1,
      middle_overs_control: 2,
      death_bowling_experts: 1
    },
    allrounder_focus: 'balanced',
    wicketkeeper_strategy: 'premium_single'
  });

  const [optimizationSettings, setOptimizationSettings] = useState<OptimizationSettings>({
    role_balance_strictness: 'flexible',
    budget_distribution: 'star_distributed',
    diversity_factor: 0.6,
    captaincy_rotation: true,
    complementary_skills: true,
    formation_style: '4-4-2-1'
  });

  const { toast } = useToast();

  const team1Name = matchData?.match?.team_a_name || 'Team A';
  const team2Name = matchData?.match?.team_b_name || 'Team B';

  const formationTemplates: FormationTemplate[] = [
    {
      id: '4-4-2-1',
      name: 'Balanced Formation',
      description: '4 Batsmen, 4 Bowlers, 2 All-rounders, 1 Wicket-keeper',
      distribution: { batsmen: 4, bowlers: 4, allRounders: 2, wicketKeepers: 1 },
      best_for: 'Balanced conditions, versatile lineups',
      icon: Grid3X3
    },
    {
      id: '3-4-3-1',
      name: 'All-rounder Heavy',
      description: '3 Batsmen, 4 Bowlers, 3 All-rounders, 1 Wicket-keeper',
      distribution: { batsmen: 3, bowlers: 4, allRounders: 3, wicketKeepers: 1 },
      best_for: 'Flexible conditions, utility focus',
      icon: Shuffle
    },
    {
      id: '5-3-2-1',
      name: 'Batting Power',
      description: '5 Batsmen, 3 Bowlers, 2 All-rounders, 1 Wicket-keeper',
      distribution: { batsmen: 5, bowlers: 3, allRounders: 2, wicketKeepers: 1 },
      best_for: 'High-scoring matches, batting-friendly',
      icon: TrendingUp
    },
    {
      id: 'custom',
      name: 'Custom Split',
      description: 'Define your own role distribution',
      distribution: { batsmen: 4, bowlers: 4, allRounders: 2, wicketKeepers: 1 },
      best_for: 'Specific match requirements',
      icon: Settings
    }
  ];

  const generateStrategy7Teams = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/strategies/strategy7', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleSplitConfig,
          optimizationSettings,
          teamCount,
          matchData
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        toast({
          title: "Strategy 7 Complete!",
          description: `Generated ${result.teams.length} teams with optimized role distribution`,
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
      case 1: return true; // Formation selection always valid
      case 2: return true; // Role splits always valid
      case 3: return true; // Optimization always valid
      default: return false;
    }
  };

  const getStepIcon = (step: number) => {
    if (currentStep > step) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (currentStep === step) return <Split className="h-5 w-5 text-blue-500" />;
    return <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />;
  };

  const updateRoleSplitConfig = (key: keyof RoleSplitConfig, value: any) => {
    setRoleSplitConfig(prev => ({ ...prev, [key]: value }));
  };

  const updateOptimizationSettings = (key: keyof OptimizationSettings, value: any) => {
    setOptimizationSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleFormationSelect = (formation: FormationTemplate) => {
    updateOptimizationSettings('formation_style', formation.id as any);
    
    // Auto-adjust role variations based on formation
    if (formation.id !== 'custom') {
      const { distribution } = formation;
      setRoleSplitConfig(prev => ({
        ...prev,
        batsmen_variations: {
          aggressive_openers: Math.min(2, Math.floor(distribution.batsmen / 2)),
          anchor_middle_order: Math.max(1, Math.floor(distribution.batsmen / 2)),
          finisher_specialists: Math.max(1, distribution.batsmen - Math.floor(distribution.batsmen / 2) - Math.min(2, Math.floor(distribution.batsmen / 2)))
        },
        bowler_variations: {
          powerplay_specialists: Math.max(1, Math.floor(distribution.bowlers / 3)),
          middle_overs_control: Math.max(1, Math.floor(distribution.bowlers / 2)),
          death_bowling_experts: Math.max(1, distribution.bowlers - Math.floor(distribution.bowlers / 3) - Math.floor(distribution.bowlers / 2))
        }
      }));
    }
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
          <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
            <Split className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Strategy 7: Role-Split Lineups
            </h1>
            <p className="text-muted-foreground">Create optimized teams with strategic role distribution and specialization</p>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                {getStepIcon(step)}
                <span className="text-xs font-medium">
                  {step === 1 ? 'Formation' : step === 2 ? 'Role Split' : step === 3 ? 'Optimize' : 'Generate'}
                </span>
              </div>
              {step < 4 && <div className="w-8 h-px bg-muted-foreground/30 mx-2" />}
            </div>
          ))}
        </div>

        <Progress value={(currentStep / 4) * 100} className="max-w-md mx-auto" variant="cricket" />
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Formation Selection */}
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
                  <Grid3X3 className="h-5 w-5" />
                  Choose Formation Template
                </CardTitle>
                <CardDescription>
                  Select a base formation that defines the role distribution structure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {formationTemplates.map((formation) => {
                    const Icon = formation.icon;
                    const isSelected = optimizationSettings.formation_style === formation.id;
                    
                    return (
                      <motion.div
                        key={formation.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          isSelected 
                          ? 'border-orange-500 shadow-lg shadow-orange-500/20' 
                          : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                        }`}
                        onClick={() => handleFormationSelect(formation)}
                      >
                        <div className="space-y-3">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600">
                                <Icon className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-sm">{formation.name}</h3>
                                <p className="text-xs text-muted-foreground mt-1">{formation.description}</p>
                              </div>
                            </div>
                            {isSelected && <CheckCircle className="h-5 w-5 text-orange-500" />}
                          </div>

                          {/* Distribution */}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex justify-between">
                              <span>Batsmen:</span>
                              <Badge variant="default" size="sm">{formation.distribution.batsmen}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Bowlers:</span>
                              <Badge variant="default" size="sm">{formation.distribution.bowlers}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>All-rounders:</span>
                              <Badge variant="default" size="sm">{formation.distribution.allRounders}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Keepers:</span>
                              <Badge variant="default" size="sm">{formation.distribution.wicketKeepers}</Badge>
                            </div>
                          </div>

                          {/* Best For */}
                          <div className="text-xs">
                            <span className="font-medium text-orange-600">Best for:</span> {formation.best_for}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button 
                onClick={() => setCurrentStep(2)} 
                className="flex items-center gap-2"
                size="lg"
              >
                Next: Configure Role Splits <Layers className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Role Split Configuration */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Batsmen Variations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Batsmen Role Distribution
                </CardTitle>
                <CardDescription>
                  Define how batting roles should be split across different specializations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Aggressive Openers</Label>
                      <Badge variant="default">{roleSplitConfig.batsmen_variations.aggressive_openers}</Badge>
                    </div>
                    <Slider
                      value={[roleSplitConfig.batsmen_variations.aggressive_openers]}
                      onValueChange={(value) => updateRoleSplitConfig('batsmen_variations', {
                        ...roleSplitConfig.batsmen_variations,
                        aggressive_openers: value[0]
                      })}
                      min={0}
                      max={4}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">Powerplay specialists, high strike rate</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Anchor Middle Order</Label>
                      <Badge variant="default">{roleSplitConfig.batsmen_variations.anchor_middle_order}</Badge>
                    </div>
                    <Slider
                      value={[roleSplitConfig.batsmen_variations.anchor_middle_order]}
                      onValueChange={(value) => updateRoleSplitConfig('batsmen_variations', {
                        ...roleSplitConfig.batsmen_variations,
                        anchor_middle_order: value[0]
                      })}
                      min={0}
                      max={4}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">Consistent, stabilizing batsmen</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Finisher Specialists</Label>
                      <Badge variant="default">{roleSplitConfig.batsmen_variations.finisher_specialists}</Badge>
                    </div>
                    <Slider
                      value={[roleSplitConfig.batsmen_variations.finisher_specialists]}
                      onValueChange={(value) => updateRoleSplitConfig('batsmen_variations', {
                        ...roleSplitConfig.batsmen_variations,
                        finisher_specialists: value[0]
                      })}
                      min={0}
                      max={3}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">Death overs, boundary hitters</p>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground text-center">
                  Total Batting Slots: {
                    roleSplitConfig.batsmen_variations.aggressive_openers + 
                    roleSplitConfig.batsmen_variations.anchor_middle_order + 
                    roleSplitConfig.batsmen_variations.finisher_specialists
                  } / 11
                </div>
              </CardContent>
            </Card>

            {/* Bowler Variations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Bowling Role Distribution
                </CardTitle>
                <CardDescription>
                  Configure bowling specializations for different match phases
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Powerplay Specialists</Label>
                      <Badge variant="default">{roleSplitConfig.bowler_variations.powerplay_specialists}</Badge>
                    </div>
                    <Slider
                      value={[roleSplitConfig.bowler_variations.powerplay_specialists]}
                      onValueChange={(value) => updateRoleSplitConfig('bowler_variations', {
                        ...roleSplitConfig.bowler_variations,
                        powerplay_specialists: value[0]
                      })}
                      min={0}
                      max={3}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">New ball, swing bowlers</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Middle Overs Control</Label>
                      <Badge variant="default">{roleSplitConfig.bowler_variations.middle_overs_control}</Badge>
                    </div>
                    <Slider
                      value={[roleSplitConfig.bowler_variations.middle_overs_control]}
                      onValueChange={(value) => updateRoleSplitConfig('bowler_variations', {
                        ...roleSplitConfig.bowler_variations,
                        middle_overs_control: value[0]
                      })}
                      min={0}
                      max={4}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">Economy, spin bowlers</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Death Bowling Experts</Label>
                      <Badge variant="default">{roleSplitConfig.bowler_variations.death_bowling_experts}</Badge>
                    </div>
                    <Slider
                      value={[roleSplitConfig.bowler_variations.death_bowling_experts]}
                      onValueChange={(value) => updateRoleSplitConfig('bowler_variations', {
                        ...roleSplitConfig.bowler_variations,
                        death_bowling_experts: value[0]
                      })}
                      min={0}
                      max={3}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">Yorkers, variation specialists</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* All-rounder & Keeper Strategy */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shuffle className="h-5 w-5" />
                    All-rounder Focus
                  </CardTitle>
                  <CardDescription>
                    Choose the primary utility approach for all-rounders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { key: 'batting_heavy', label: 'Batting Heavy', desc: 'Primary batsmen who can bowl', icon: TrendingUp },
                      { key: 'bowling_heavy', label: 'Bowling Heavy', desc: 'Bowlers with batting ability', icon: Target },
                      { key: 'balanced', label: 'Balanced', desc: 'Equal batting and bowling skills', icon: BarChart3 },
                      { key: 'utility', label: 'Utility Focus', desc: 'Flexible, situational players', icon: Settings }
                    ].map(({ key, label, desc, icon: Icon }) => (
                      <div
                        key={key}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          roleSplitConfig.allrounder_focus === key
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => updateRoleSplitConfig('allrounder_focus', key)}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5" />
                          <div>
                            <div className="font-medium">{label}</div>
                            <div className="text-sm text-muted-foreground">{desc}</div>
                          </div>
                          {roleSplitConfig.allrounder_focus === key && (
                            <CheckCircle className="h-4 w-4 text-orange-500 ml-auto" />
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
                    <Shield className="h-5 w-5" />
                    Wicket-keeper Strategy
                  </CardTitle>
                  <CardDescription>
                    Define wicket-keeper selection approach
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { key: 'premium_single', label: 'Premium Single', desc: 'One high-value keeper-batsman', icon: Star },
                      { key: 'dual_keeper', label: 'Dual Keeper', desc: 'Two keepers for flexibility', icon: Users },
                      { key: 'batting_focused', label: 'Batting Focused', desc: 'Keeper selected for batting', icon: TrendingUp }
                    ].map(({ key, label, desc, icon: Icon }) => (
                      <div
                        key={key}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          roleSplitConfig.wicketkeeper_strategy === key
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => updateRoleSplitConfig('wicketkeeper_strategy', key)}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5" />
                          <div>
                            <div className="font-medium">{label}</div>
                            <div className="text-sm text-muted-foreground">{desc}</div>
                          </div>
                          {roleSplitConfig.wicketkeeper_strategy === key && (
                            <CheckCircle className="h-4 w-4 text-blue-500 ml-auto" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                Back
              </Button>
              <Button 
                onClick={() => setCurrentStep(3)} 
                className="flex items-center gap-2"
              >
                Next: Optimization Settings <Settings className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Optimization Settings */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Balance & Budget Settings */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Role Balance Strictness
                  </CardTitle>
                  <CardDescription>
                    How strictly should role requirements be enforced?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { key: 'strict', label: 'Strict Adherence', desc: 'Exact role counts, no flexibility', icon: Shield },
                      { key: 'flexible', label: 'Flexible Balance', desc: 'Allow minor role adjustments', icon: Activity },
                      { key: 'experimental', label: 'Experimental', desc: 'Creative role combinations allowed', icon: Sparkles }
                    ].map(({ key, label, desc, icon: Icon }) => (
                      <div
                        key={key}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          optimizationSettings.role_balance_strictness === key
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => updateOptimizationSettings('role_balance_strictness', key)}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5" />
                          <div>
                            <div className="font-medium">{label}</div>
                            <div className="text-sm text-muted-foreground">{desc}</div>
                          </div>
                          {optimizationSettings.role_balance_strictness === key && (
                            <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
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
                    <PieChart className="h-5 w-5" />
                    Budget Distribution Strategy
                  </CardTitle>
                  <CardDescription>
                    How should the 100 credit budget be allocated?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { key: 'role_heavy', label: 'Role Heavy', desc: 'Invest heavily in key role players', icon: Star },
                      { key: 'star_distributed', label: 'Star Distributed', desc: 'Spread premium players evenly', icon: Layers },
                      { key: 'value_balanced', label: 'Value Balanced', desc: 'Mix of premium and value picks', icon: BarChart2 }
                    ].map(({ key, label, desc, icon: Icon }) => (
                      <div
                        key={key}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          optimizationSettings.budget_distribution === key
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => updateOptimizationSettings('budget_distribution', key)}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5" />
                          <div>
                            <div className="font-medium">{label}</div>
                            <div className="text-sm text-muted-foreground">{desc}</div>
                          </div>
                          {optimizationSettings.budget_distribution === key && (
                            <CheckCircle className="h-4 w-4 text-purple-500 ml-auto" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Optimization */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Advanced Optimization
                </CardTitle>
                <CardDescription>
                  Fine-tune the team generation algorithm
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Diversity Factor ({Math.round(optimizationSettings.diversity_factor * 100)}%)</Label>
                    <Badge variant="default">{optimizationSettings.diversity_factor < 0.3 ? 'Similar' : optimizationSettings.diversity_factor < 0.7 ? 'Balanced' : 'Diverse'}</Badge>
                  </div>
                  <Slider
                    value={[optimizationSettings.diversity_factor * 100]}
                    onValueChange={(value) => updateOptimizationSettings('diversity_factor', value[0] / 100)}
                    min={0}
                    max={100}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Similar Teams</span>
                    <span>Balanced</span>
                    <span>Max Diversity</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <div className="font-medium">Captaincy Rotation</div>
                      <div className="text-sm text-muted-foreground">Vary captains across teams</div>
                    </div>
                    <Switch
                      checked={optimizationSettings.captaincy_rotation}
                      onCheckedChange={(checked) => updateOptimizationSettings('captaincy_rotation', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <div className="font-medium">Complementary Skills</div>
                      <div className="text-sm text-muted-foreground">Optimize skill combinations</div>
                    </div>
                    <Switch
                      checked={optimizationSettings.complementary_skills}
                      onCheckedChange={(checked) => updateOptimizationSettings('complementary_skills', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Count */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Number of Teams
                </CardTitle>
                <CardDescription>
                  How many role-optimized teams should be generated?
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
                    max={15}
                    min={4}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>4 teams</span>
                    <span>10 teams</span>
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
                  <Split className="h-5 w-5" />
                  Role-Split Strategy Summary
                </CardTitle>
                <CardDescription>
                  Review your formation and role distribution configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Formation Summary */}
                <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg">
                  <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                    Formation: {formationTemplates.find(f => f.id === optimizationSettings.formation_style)?.name}
                  </h4>
                  <div className="grid grid-cols-4 gap-3 text-sm">
                    <div className="text-center">
                      <div className="font-medium">Batsmen</div>
                      <Badge variant="default">{
                        roleSplitConfig.batsmen_variations.aggressive_openers + 
                        roleSplitConfig.batsmen_variations.anchor_middle_order + 
                        roleSplitConfig.batsmen_variations.finisher_specialists
                      }</Badge>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">Bowlers</div>
                      <Badge variant="default">{
                        roleSplitConfig.bowler_variations.powerplay_specialists + 
                        roleSplitConfig.bowler_variations.middle_overs_control + 
                        roleSplitConfig.bowler_variations.death_bowling_experts
                      }</Badge>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">All-rounders</div>
                      <Badge variant="default">2-3</Badge>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">Keepers</div>
                      <Badge variant="default">{roleSplitConfig.wicketkeeper_strategy === 'dual_keeper' ? '2' : '1'}</Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Role Split Details */}
                <div>
                  <h4 className="font-medium mb-3">Detailed Role Splits</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-orange-700 dark:text-orange-300">Batting Roles</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Aggressive Openers</span>
                          <Badge variant="cricket" size="sm">{roleSplitConfig.batsmen_variations.aggressive_openers}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Anchor Middle Order</span>
                          <Badge variant="cricket" size="sm">{roleSplitConfig.batsmen_variations.anchor_middle_order}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Finisher Specialists</span>
                          <Badge variant="cricket" size="sm">{roleSplitConfig.batsmen_variations.finisher_specialists}</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-blue-700 dark:text-blue-300">Bowling Roles</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Powerplay Specialists</span>
                          <Badge variant="cricket" size="sm">{roleSplitConfig.bowler_variations.powerplay_specialists}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Middle Overs Control</span>
                          <Badge variant="cricket" size="sm">{roleSplitConfig.bowler_variations.middle_overs_control}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Death Bowling Experts</span>
                          <Badge variant="cricket" size="sm">{roleSplitConfig.bowler_variations.death_bowling_experts}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Strategy Configuration */}
                <div>
                  <h4 className="font-medium mb-3">Strategy Configuration</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">All-rounder Focus</span>
                        <Badge variant="default" className="capitalize">{roleSplitConfig.allrounder_focus.replace('_', ' ')}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Keeper Strategy</span>
                        <Badge variant="default" className="capitalize">{roleSplitConfig.wicketkeeper_strategy.replace('_', ' ')}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Role Balance</span>
                        <Badge variant="default" className="capitalize">{optimizationSettings.role_balance_strictness}</Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Budget Strategy</span>
                        <Badge variant="default" className="capitalize">{optimizationSettings.budget_distribution.replace('_', ' ')}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Diversity Factor</span>
                        <Badge variant="default">{Math.round(optimizationSettings.diversity_factor * 100)}%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Captaincy Rotation</span>
                        <Badge variant={optimizationSettings.captaincy_rotation ? "cricket" : "outline"}>
                          {optimizationSettings.captaincy_rotation ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Final Configuration */}
                <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {teamCount} Teams
                  </div>
                  <div className="text-sm text-orange-700 dark:text-orange-300">
                    With optimized role distribution and specialization
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(3)}>
                Back
              </Button>
              <Button 
                onClick={generateStrategy7Teams}
                disabled={isGenerating}
                className="flex items-center gap-2"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Optimizing Roles...
                  </>
                ) : (
                  <>
                    <Split className="h-4 w-4" />
                    Generate Role-Split Teams
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
