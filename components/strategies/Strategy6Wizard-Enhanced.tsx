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
  Gauge
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { CricketPlayer, EnrichedMatchData } from '../../lib/cricket-types';

interface Strategy6Props {
  matchData: EnrichedMatchData | null;
  onStrategyComplete: (result: any) => void;
}

interface PresetScenario {
  id: string;
  name: string;
  description: string;
  strategy: string;
  icon: React.ComponentType<any>;
  color: string;
  risk_level: 'Low' | 'Medium' | 'High';
  expected_ownership: string;
  best_for: string;
  key_features: string[];
}

interface ScenarioCustomization {
  captaincy_style: 'safe' | 'differential' | 'balanced';
  budget_distribution: 'conservative' | 'aggressive' | 'balanced';
  player_selection_approach: 'form_based' | 'fixture_based' | 'statistical';
  risk_tolerance: number; // 1-10 scale
  ownership_target: 'low' | 'medium' | 'high';
  team_diversity: boolean;
}

export default function Strategy6WizardEnhanced({ matchData, onStrategyComplete }: Strategy6Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedScenario, setSelectedScenario] = useState<PresetScenario | null>(null);
  const [customization, setCustomization] = useState<ScenarioCustomization>({
    captaincy_style: 'balanced',
    budget_distribution: 'balanced',
    player_selection_approach: 'form_based',
    risk_tolerance: 5,
    ownership_target: 'medium',
    team_diversity: true
  });
  const [teamCount, setTeamCount] = useState(6);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const team1Name = matchData?.match?.team_a_name || 'Team A';
  const team2Name = matchData?.match?.team_b_name || 'Team B';

  const presetScenarios: PresetScenario[] = [
    {
      id: 'powerplay_dominance',
      name: 'Powerplay Dominance',
      description: 'Focus on explosive starts and top-order batsmen who excel in powerplay',
      strategy: 'Prioritize aggressive openers, wicket-keepers who bat early, and death bowlers',
      icon: Zap,
      color: 'from-yellow-500 to-orange-600',
      risk_level: 'High',
      expected_ownership: '15-25%',
      best_for: 'High-scoring matches, flat pitches',
      key_features: ['Aggressive openers priority', 'Death bowling specialists', 'High strike-rate focus', 'Powerplay multipliers']
    },
    {
      id: 'middle_order_stability',
      name: 'Middle-Order Mastery',
      description: 'Build around reliable middle-order batsmen and all-rounders',
      strategy: 'Select consistent performers who anchor innings and provide flexibility',
      icon: Shield,
      color: 'from-green-500 to-emerald-600',
      risk_level: 'Low',
      expected_ownership: '25-35%',
      best_for: 'Tricky conditions, batting collapses expected',
      key_features: ['Consistent middle-order', 'All-rounder heavy', 'Anchoring specialists', 'Flexibility focus']
    },
    {
      id: 'bowling_conditions',
      name: 'Bowler-Friendly Pitch',
      description: 'Capitalize on bowling-friendly conditions with quality bowling attack',
      strategy: 'Load up on wicket-taking bowlers and economical options',
      icon: Target,
      color: 'from-blue-500 to-indigo-600',
      risk_level: 'Medium',
      expected_ownership: '20-30%',
      best_for: 'Overcast conditions, seaming pitches',
      key_features: ['Wicket-taking bowlers', 'Economy rate focus', 'Bowling all-rounders', 'Captaincy on bowlers']
    },
    {
      id: 'spin_domination',
      name: 'Spin Web Strategy',
      description: 'Target matches where spinners will dominate with turning conditions',
      strategy: 'Prioritize quality spinners and players who play spin well',
      icon: Activity,
      color: 'from-purple-500 to-pink-600',
      risk_level: 'Medium',
      expected_ownership: '18-28%',
      best_for: 'Turning tracks, subcontinental conditions',
      key_features: ['Spin bowling focus', 'Spin-playing batsmen', 'Slow pitch specialists', 'Middle-overs control']
    },
    {
      id: 'differential_captaincy',
      name: 'Differential Captain',
      description: 'Bold captaincy choices with lower ownership but high upside potential',
      strategy: 'Select unconventional captains with explosive potential',
      icon: Star,
      color: 'from-red-500 to-rose-600',
      risk_level: 'High',
      expected_ownership: '8-18%',
      best_for: 'Tournament situations, rank climbing',
      key_features: ['Low ownership captains', 'Explosive potential', 'Unconventional picks', 'High differentiation']
    },
    {
      id: 'safe_template',
      name: 'Template Safety',
      description: 'Conservative approach with proven performers and safe picks',
      strategy: 'Build around consistent, high-ownership players with reliable output',
      icon: CheckCircle,
      color: 'from-gray-500 to-slate-600',
      risk_level: 'Low',
      expected_ownership: '35-50%',
      best_for: 'H2H contests, consistent returns needed',
      key_features: ['High ownership players', 'Proven performers', 'Safe captaincy', 'Consistent returns']
    },
    {
      id: 'weather_disruption',
      name: 'Weather Wildcard',
      description: 'Optimize for rain-affected or weather-disrupted matches',
      strategy: 'Focus on players who perform in shortened games and changing conditions',
      icon: CloudRain,
      color: 'from-cyan-500 to-blue-600',
      risk_level: 'Medium',
      expected_ownership: '20-30%',
      best_for: 'Monsoon season, weather warnings',
      key_features: ['Shortened game specialists', 'Weather adaptability', 'Quick scorers', 'Bowling variety']
    },
    {
      id: 'venue_specialists',
      name: 'Venue Specialists',
      description: 'Target players with exceptional records at the specific venue',
      strategy: 'Prioritize players with strong historical performance at the ground',
      icon: MapPin,
      color: 'from-teal-500 to-green-600',
      risk_level: 'Medium',
      expected_ownership: '22-32%',
      best_for: 'Unique venues, historical ground advantages',
      key_features: ['Venue-specific records', 'Ground familiarity', 'Historical performance', 'Local conditions expertise']
    }
  ];

  const handleScenarioSelect = (scenario: PresetScenario) => {
    setSelectedScenario(scenario);
    
    // Auto-adjust customization based on scenario
    const scenarioCustomization: Partial<ScenarioCustomization> = {};
    
    switch (scenario.id) {
      case 'powerplay_dominance':
        scenarioCustomization.captaincy_style = 'differential';
        scenarioCustomization.budget_distribution = 'aggressive';
        scenarioCustomization.risk_tolerance = 8;
        break;
      case 'middle_order_stability':
        scenarioCustomization.captaincy_style = 'safe';
        scenarioCustomization.budget_distribution = 'conservative';
        scenarioCustomization.risk_tolerance = 3;
        break;
      case 'bowling_conditions':
        scenarioCustomization.captaincy_style = 'balanced';
        scenarioCustomization.budget_distribution = 'balanced';
        scenarioCustomization.risk_tolerance = 5;
        break;
      case 'differential_captaincy':
        scenarioCustomization.captaincy_style = 'differential';
        scenarioCustomization.ownership_target = 'low';
        scenarioCustomization.risk_tolerance = 9;
        break;
      case 'safe_template':
        scenarioCustomization.captaincy_style = 'safe';
        scenarioCustomization.ownership_target = 'high';
        scenarioCustomization.risk_tolerance = 2;
        break;
      default:
        scenarioCustomization.risk_tolerance = 5;
    }
    
    setCustomization(prev => ({ ...prev, ...scenarioCustomization }));
  };

  const generateStrategy6Teams = async () => {
    if (!selectedScenario) {
      toast({
        title: "Scenario Required",
        description: "Please select a preset scenario first",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/strategies/strategy6', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedScenario,
          customization,
          teamCount,
          matchData
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        toast({
          title: "Strategy 6 Complete!",
          description: `Generated ${result.teams.length} teams using ${selectedScenario.name} scenario`,
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
      case 1: return selectedScenario !== null;
      case 2: return true; // Customization always valid
      default: return false;
    }
  };

  const getStepIcon = (step: number) => {
    if (currentStep > step) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (currentStep === step) return <Layout className="h-5 w-5 text-blue-500" />;
    return <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />;
  };

  const updateCustomization = (key: keyof ScenarioCustomization, value: any) => {
    setCustomization(prev => ({ ...prev, [key]: value }));
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
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
            <Layout className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Strategy 6: Preset Scenarios
            </h1>
            <p className="text-muted-foreground">Choose from curated strategies optimized for specific match situations</p>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                {getStepIcon(step)}
                <span className="text-xs font-medium">
                  {step === 1 ? 'Scenario' : step === 2 ? 'Customize' : 'Generate'}
                </span>
              </div>
              {step < 3 && <div className="w-8 h-px bg-muted-foreground/30 mx-2" />}
            </div>
          ))}
        </div>

        <Progress value={(currentStep / 3) * 100} className="max-w-md mx-auto" variant="cricket" />
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Scenario Selection */}
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
                  <BookOpen className="h-5 w-5" />
                  Choose Your Strategy Scenario
                </CardTitle>
                <CardDescription>
                  Select a curated strategy based on match conditions and your objectives
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {presetScenarios.map((scenario) => {
                    const Icon = scenario.icon;
                    const isSelected = selectedScenario?.id === scenario.id;
                    
                    return (
                      <motion.div
                        key={scenario.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          isSelected 
                          ? 'border-indigo-500 shadow-lg shadow-indigo-500/20' 
                          : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                        }`}
                        onClick={() => handleScenarioSelect(scenario)}
                      >
                        <div className="space-y-3">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg bg-gradient-to-r ${scenario.color}`}>
                                <Icon className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-sm">{scenario.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge 
                                    variant={scenario.risk_level === 'High' ? 'destructive' : scenario.risk_level === 'Medium' ? 'default' : 'cricket'} 
                                    size="sm"
                                  >
                                    {scenario.risk_level} Risk
                                  </Badge>
                                  <Badge variant="outline" size="sm">
                                    {scenario.expected_ownership}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            {isSelected && <CheckCircle className="h-5 w-5 text-indigo-500" />}
                          </div>

                          {/* Description */}
                          <p className="text-sm text-muted-foreground">{scenario.description}</p>

                          {/* Best For */}
                          <div className="text-xs">
                            <span className="font-medium text-green-600">Best for:</span> {scenario.best_for}
                          </div>

                          {/* Key Features */}
                          <div className="flex flex-wrap gap-1">
                            {scenario.key_features.slice(0, 2).map((feature, idx) => (
                              <Badge key={idx} variant="outline" size="sm" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                            {scenario.key_features.length > 2 && (
                              <Badge variant="outline" size="sm" className="text-xs">
                                +{scenario.key_features.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {selectedScenario && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg"
                  >
                    <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2">Selected Strategy Details</h4>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300 mb-3">{selectedScenario.strategy}</p>
                    
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm text-indigo-800 dark:text-indigo-200">Key Features:</h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedScenario.key_features.map((feature, idx) => (
                          <Badge key={idx} variant="cricket" size="sm">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button 
                onClick={() => setCurrentStep(2)} 
                disabled={!canProceedToNext()}
                className="flex items-center gap-2"
                size="lg"
              >
                Next: Customize Strategy <Settings className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Customization */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Captaincy & Budget */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Captaincy Style
                  </CardTitle>
                  <CardDescription>
                    Choose your captaincy approach
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { key: 'safe', label: 'Safe Choice', desc: 'High ownership, reliable captains', icon: Shield },
                      { key: 'balanced', label: 'Balanced Pick', desc: 'Moderate risk, good upside', icon: BarChart2 },
                      { key: 'differential', label: 'Differential', desc: 'Low ownership, high reward', icon: TrendingUp }
                    ].map(({ key, label, desc, icon: Icon }) => (
                      <div
                        key={key}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          customization.captaincy_style === key
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => updateCustomization('captaincy_style', key)}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5" />
                          <div>
                            <div className="font-medium">{label}</div>
                            <div className="text-sm text-muted-foreground">{desc}</div>
                          </div>
                          {customization.captaincy_style === key && (
                            <CheckCircle className="h-4 w-4 text-indigo-500 ml-auto" />
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
                    Budget Distribution
                  </CardTitle>
                  <CardDescription>
                    How should credits be allocated?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { key: 'conservative', label: 'Conservative', desc: 'Balanced spending, safe picks', icon: Shield },
                      { key: 'balanced', label: 'Balanced', desc: 'Mix of premium and value', icon: BarChart3 },
                      { key: 'aggressive', label: 'Aggressive', desc: 'Premium heavy, risky picks', icon: Zap }
                    ].map(({ key, label, desc, icon: Icon }) => (
                      <div
                        key={key}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          customization.budget_distribution === key
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => updateCustomization('budget_distribution', key)}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5" />
                          <div>
                            <div className="font-medium">{label}</div>
                            <div className="text-sm text-muted-foreground">{desc}</div>
                          </div>
                          {customization.budget_distribution === key && (
                            <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Player Selection & Risk */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Player Selection Approach
                  </CardTitle>
                  <CardDescription>
                    Primary factor for player selection
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { key: 'form_based', label: 'Current Form', desc: 'Recent performance priority', icon: TrendingUp },
                      { key: 'fixture_based', label: 'Fixture Analysis', desc: 'Matchup and opposition focus', icon: Target },
                      { key: 'statistical', label: 'Statistical Edge', desc: 'Data-driven selections', icon: BarChart3 }
                    ].map(({ key, label, desc, icon: Icon }) => (
                      <div
                        key={key}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          customization.player_selection_approach === key
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => updateCustomization('player_selection_approach', key)}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5" />
                          <div>
                            <div className="font-medium">{label}</div>
                            <div className="text-sm text-muted-foreground">{desc}</div>
                          </div>
                          {customization.player_selection_approach === key && (
                            <CheckCircle className="h-4 w-4 text-purple-500 ml-auto" />
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
                    <Gauge className="h-5 w-5" />
                    Risk Tolerance
                  </CardTitle>
                  <CardDescription>
                    Set your overall risk appetite (1-10)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Risk Level</Label>
                      <Badge 
                        variant={customization.risk_tolerance <= 3 ? 'cricket' : customization.risk_tolerance <= 7 ? 'default' : 'destructive'}
                        size="lg"
                      >
                        {customization.risk_tolerance}/10 - {
                          customization.risk_tolerance <= 3 ? 'Conservative' :
                          customization.risk_tolerance <= 7 ? 'Moderate' : 'Aggressive'
                        }
                      </Badge>
                    </div>
                    <Slider
                      value={[customization.risk_tolerance]}
                      onValueChange={(value) => updateCustomization('risk_tolerance', value[0])}
                      min={1}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Conservative</span>
                      <span>Balanced</span>
                      <span>Aggressive</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Ownership Target</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: 'low', label: 'Low', desc: '5-20%' },
                        { key: 'medium', label: 'Medium', desc: '20-40%' },
                        { key: 'high', label: 'High', desc: '40%+' }
                      ].map(({ key, label, desc }) => (
                        <Button
                          key={key}
                          variant={customization.ownership_target === key ? "default" : "outline"}
                          onClick={() => updateCustomization('ownership_target', key)}
                          className="h-auto p-3 flex flex-col gap-1"
                          size="sm"
                        >
                          <span className="font-medium">{label}</span>
                          <span className="text-xs text-muted-foreground">{desc}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Team Settings */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Team Configuration
                </CardTitle>
                <CardDescription>
                  Final settings for team generation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Number of Teams</Label>
                      <Badge variant="default" size="lg">{teamCount} Teams</Badge>
                    </div>
                    <Slider
                      value={[teamCount]}
                      onValueChange={(value) => setTeamCount(value[0])}
                      max={12}
                      min={3}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>3 teams</span>
                      <span>7 teams</span>
                      <span>12 teams</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <div className="font-medium">Enable Team Diversity</div>
                      <div className="text-sm text-muted-foreground">
                        Generate varied team compositions
                      </div>
                    </div>
                    <Switch
                      checked={customization.team_diversity}
                      onCheckedChange={(checked) => updateCustomization('team_diversity', checked)}
                    />
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
                Review & Generate <Trophy className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Review and Generate */}
        {currentStep === 3 && selectedScenario && (
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
                  <Layout className="h-5 w-5" />
                  Preset Strategy Summary
                </CardTitle>
                <CardDescription>
                  Review your scenario selection and customizations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Selected Scenario */}
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <selectedScenario.icon className="h-6 w-6 text-indigo-600" />
                    <h4 className="font-semibold text-indigo-900 dark:text-indigo-100">{selectedScenario.name}</h4>
                    <Badge variant="outline">{selectedScenario.risk_level} Risk</Badge>
                  </div>
                  <p className="text-sm text-indigo-700 dark:text-indigo-300 mb-3">{selectedScenario.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedScenario.key_features.map((feature, idx) => (
                      <Badge key={idx} variant="cricket" size="sm">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Customization Summary */}
                <div>
                  <h4 className="font-medium mb-3">Strategy Customization</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Captaincy Style</span>
                        <Badge variant="default" className="capitalize">{customization.captaincy_style}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Budget Distribution</span>
                        <Badge variant="default" className="capitalize">{customization.budget_distribution}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Selection Approach</span>
                        <Badge variant="default" className="capitalize">{customization.player_selection_approach.replace('_', ' ')}</Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Risk Tolerance</span>
                        <Badge variant="default">{customization.risk_tolerance}/10</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Ownership Target</span>
                        <Badge variant="default" className="capitalize">{customization.ownership_target}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Team Diversity</span>
                        <Badge variant={customization.team_diversity ? "cricket" : "outline"}>
                          {customization.team_diversity ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Final Configuration */}
                <div className="text-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                    {teamCount} Teams
                  </div>
                  <div className="text-sm text-indigo-700 dark:text-indigo-300">
                    Using {selectedScenario.name} scenario
                  </div>
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                    Expected ownership: {selectedScenario.expected_ownership}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                Back
              </Button>
              <Button 
                onClick={generateStrategy6Teams}
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
                    <Layout className="h-4 w-4" />
                    Generate Preset Strategy Teams
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
