import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Settings, 
  Edit3, 
  Play, 
  RotateCcw,
  Target,
  Shuffle,
  TrendingUp,
  DollarSign,
  Crown,
  Star,
  Zap,
  Filter,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';

interface BaseTeamConfig {
  template_source: 'expert_consensus' | 'ai_generated' | 'statistical_optimal' | 'user_custom';
  risk_profile: 'conservative' | 'balanced' | 'aggressive' | 'contrarian';
  budget_allocation: 'premium_heavy' | 'balanced_spread' | 'value_hunting';
  formation_preference: '4-4-2-1' | '3-4-3-1' | '5-3-2-1' | 'auto_optimize';
  core_players_lock: number; // 1-11, how many players to keep fixed across variations
}

interface RuleBasedEdits {
  substitution_rules: {
    same_role_only: boolean;
    budget_constraint: 'strict' | 'flexible' | 'ignore';
    performance_upgrade: boolean;
    ownership_diversification: boolean;
  };
  captaincy_rules: {
    rotation_strategy: 'fixed' | 'performance_based' | 'ownership_based' | 'random';
    avoid_same_captain: boolean;
    vc_diversity: boolean;
  };
  team_balance_rules: {
    maintain_formation: boolean;
    team_spread_requirement: 'none' | 'balanced' | 'strict';
    role_distribution_flexibility: number; // 0-1
    budget_deviation_tolerance: number; // 0-20 credits
  };
  advanced_edits: {
    correlation_avoidance: boolean;
    matchup_optimization: boolean;
    weather_adjustments: boolean;
    venue_specialist_priority: boolean;
    injury_news_integration: boolean;
  };
}

interface Strategy8WizardProps {
  matchId: string;
  onGenerate: (config: any, count: number) => void;
  teamCount?: number;
}

const Strategy8Wizard: React.FC<Strategy8WizardProps> = ({ matchId, onGenerate, teamCount: initialTeamCount = 11 }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [teamCount, setTeamCount] = useState(initialTeamCount);

  // Base Team Configuration
  const [baseTeamConfig, setBaseTeamConfig] = useState<BaseTeamConfig>({
    template_source: 'expert_consensus',
    risk_profile: 'balanced',
    budget_allocation: 'balanced_spread',
    formation_preference: '4-4-2-1',
    core_players_lock: 6
  });

  // Rule-Based Edits Configuration
  const [ruleBasedEdits, setRuleBasedEdits] = useState<RuleBasedEdits>({
    substitution_rules: {
      same_role_only: true,
      budget_constraint: 'flexible',
      performance_upgrade: true,
      ownership_diversification: true
    },
    captaincy_rules: {
      rotation_strategy: 'performance_based',
      avoid_same_captain: true,
      vc_diversity: true
    },
    team_balance_rules: {
      maintain_formation: true,
      team_spread_requirement: 'balanced',
      role_distribution_flexibility: 0.3,
      budget_deviation_tolerance: 5
    },
    advanced_edits: {
      correlation_avoidance: true,
      matchup_optimization: true,
      weather_adjustments: false,
      venue_specialist_priority: true,
      injury_news_integration: false
    }
  });

  const steps = [
    { number: 1, title: 'Base Team Setup', icon: Users },
    { number: 2, title: 'Substitution Rules', icon: Edit3 },
    { number: 3, title: 'Advanced Rules', icon: Settings },
    { number: 4, title: 'Generate Teams', icon: Play }
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onGenerate({
        baseTeamConfig,
        ruleBasedEdits,
        strategy: 'strategy8'
      }, teamCount);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = currentStep === step.number;
        const isCompleted = currentStep > step.number;
        
        return (
          <React.Fragment key={step.number}>
            <div className="flex flex-col items-center">
              <motion.div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-600/20' 
                    : isCompleted 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                }`}
                animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
              </motion.div>
              <span className={`mt-2 text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-px mx-4 ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Base Team Configuration</h2>
        <p className="text-gray-600">Set up your foundation team template and core settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="group hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-blue-600" />
              Template Source
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select 
              value={baseTeamConfig.template_source} 
              onValueChange={(value: any) => setBaseTeamConfig(prev => ({ ...prev, template_source: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expert_consensus">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Expert Consensus
                  </div>
                </SelectItem>
                <SelectItem value="ai_generated">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-purple-500" />
                    AI Generated
                  </div>
                </SelectItem>
                <SelectItem value="statistical_optimal">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    Statistical Optimal
                  </div>
                </SelectItem>
                <SelectItem value="user_custom">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-gray-500" />
                    User Custom
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 mt-2">
              Choose how to generate the base team template
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Risk Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select 
              value={baseTeamConfig.risk_profile} 
              onValueChange={(value: any) => setBaseTeamConfig(prev => ({ ...prev, risk_profile: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conservative">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    Conservative - Safe picks
                  </div>
                </SelectItem>
                <SelectItem value="balanced">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    Balanced - Mixed approach
                  </div>
                </SelectItem>
                <SelectItem value="aggressive">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    Aggressive - High variance
                  </div>
                </SelectItem>
                <SelectItem value="contrarian">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    Contrarian - Low ownership
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
              Budget Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select 
              value={baseTeamConfig.budget_allocation} 
              onValueChange={(value: any) => setBaseTeamConfig(prev => ({ ...prev, budget_allocation: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="premium_heavy">Premium Heavy - Top players focus</SelectItem>
                <SelectItem value="balanced_spread">Balanced Spread - Even distribution</SelectItem>
                <SelectItem value="value_hunting">Value Hunting - Budget-conscious</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-indigo-600" />
              Formation Preference
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select 
              value={baseTeamConfig.formation_preference} 
              onValueChange={(value: any) => setBaseTeamConfig(prev => ({ ...prev, formation_preference: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4-4-2-1">4-4-2-1 Balanced</SelectItem>
                <SelectItem value="3-4-3-1">3-4-3-1 All-rounder Heavy</SelectItem>
                <SelectItem value="5-3-2-1">5-3-2-1 Batting Power</SelectItem>
                <SelectItem value="auto_optimize">Auto Optimize</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-blue-600" />
            Core Players Lock
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Number of core players to keep fixed across all teams</Label>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {baseTeamConfig.core_players_lock} players
              </Badge>
            </div>
            <Slider
              value={[baseTeamConfig.core_players_lock]}
              onValueChange={(value) => setBaseTeamConfig(prev => ({ ...prev, core_players_lock: value[0] }))}
              min={1}
              max={11}
              step={1}
              className="flex-1"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>1 (Maximum variety)</span>
              <span>11 (No changes)</span>
            </div>
            <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border">
              <Info className="h-4 w-4 inline mr-2 text-blue-600" />
              Core players will remain in all team variations. Other positions will be rotated based on your edit rules.
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Substitution Rules</h2>
        <p className="text-gray-600">Configure how players should be substituted across team variations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shuffle className="h-5 w-5 text-green-600" />
              Substitution Logic
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Same role only substitutions</Label>
              <Switch
                checked={ruleBasedEdits.substitution_rules.same_role_only}
                onCheckedChange={(checked) => 
                  setRuleBasedEdits(prev => ({
                    ...prev,
                    substitution_rules: { ...prev.substitution_rules, same_role_only: checked }
                  }))
                }
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Budget Constraint</Label>
              <Select
                value={ruleBasedEdits.substitution_rules.budget_constraint}
                onValueChange={(value: any) =>
                  setRuleBasedEdits(prev => ({
                    ...prev,
                    substitution_rules: { ...prev.substitution_rules, budget_constraint: value }
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strict">Strict - Exact price matching</SelectItem>
                  <SelectItem value="flexible">Flexible - ±2 credits tolerance</SelectItem>
                  <SelectItem value="ignore">Ignore - Any price allowed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Performance upgrade priority</Label>
              <Switch
                checked={ruleBasedEdits.substitution_rules.performance_upgrade}
                onCheckedChange={(checked) => 
                  setRuleBasedEdits(prev => ({
                    ...prev,
                    substitution_rules: { ...prev.substitution_rules, performance_upgrade: checked }
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Ownership diversification</Label>
              <Switch
                checked={ruleBasedEdits.substitution_rules.ownership_diversification}
                onCheckedChange={(checked) => 
                  setRuleBasedEdits(prev => ({
                    ...prev,
                    substitution_rules: { ...prev.substitution_rules, ownership_diversification: checked }
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-600" />
              Captaincy Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Rotation Strategy</Label>
              <Select
                value={ruleBasedEdits.captaincy_rules.rotation_strategy}
                onValueChange={(value: any) =>
                  setRuleBasedEdits(prev => ({
                    ...prev,
                    captaincy_rules: { ...prev.captaincy_rules, rotation_strategy: value }
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed - Same captain</SelectItem>
                  <SelectItem value="performance_based">Performance Based</SelectItem>
                  <SelectItem value="ownership_based">Ownership Based</SelectItem>
                  <SelectItem value="random">Random Selection</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Avoid same captain across teams</Label>
              <Switch
                checked={ruleBasedEdits.captaincy_rules.avoid_same_captain}
                onCheckedChange={(checked) => 
                  setRuleBasedEdits(prev => ({
                    ...prev,
                    captaincy_rules: { ...prev.captaincy_rules, avoid_same_captain: checked }
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Vice-captain diversity</Label>
              <Switch
                checked={ruleBasedEdits.captaincy_rules.vc_diversity}
                onCheckedChange={(checked) => 
                  setRuleBasedEdits(prev => ({
                    ...prev,
                    captaincy_rules: { ...prev.captaincy_rules, vc_diversity: checked }
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-green-600" />
            Team Balance Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Maintain formation structure</Label>
              <Switch
                checked={ruleBasedEdits.team_balance_rules.maintain_formation}
                onCheckedChange={(checked) => 
                  setRuleBasedEdits(prev => ({
                    ...prev,
                    team_balance_rules: { ...prev.team_balance_rules, maintain_formation: checked }
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Team spread requirement</Label>
              <Select
                value={ruleBasedEdits.team_balance_rules.team_spread_requirement}
                onValueChange={(value: any) =>
                  setRuleBasedEdits(prev => ({
                    ...prev,
                    team_balance_rules: { ...prev.team_balance_rules, team_spread_requirement: value }
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None - No requirement</SelectItem>
                  <SelectItem value="balanced">Balanced - Both teams</SelectItem>
                  <SelectItem value="strict">Strict - Equal players</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Role distribution flexibility</Label>
              <Badge variant="outline">{Math.round(ruleBasedEdits.team_balance_rules.role_distribution_flexibility * 100)}%</Badge>
            </div>
            <Slider
              value={[ruleBasedEdits.team_balance_rules.role_distribution_flexibility]}
              onValueChange={(value) => 
                setRuleBasedEdits(prev => ({
                  ...prev,
                  team_balance_rules: { ...prev.team_balance_rules, role_distribution_flexibility: value[0] }
                }))
              }
              min={0}
              max={1}
              step={0.1}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Budget deviation tolerance</Label>
              <Badge variant="outline">{ruleBasedEdits.team_balance_rules.budget_deviation_tolerance} credits</Badge>
            </div>
            <Slider
              value={[ruleBasedEdits.team_balance_rules.budget_deviation_tolerance]}
              onValueChange={(value) => 
                setRuleBasedEdits(prev => ({
                  ...prev,
                  team_balance_rules: { ...prev.team_balance_rules, budget_deviation_tolerance: value[0] }
                }))
              }
              min={0}
              max={20}
              step={1}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Advanced Rules</h2>
        <p className="text-gray-600">Fine-tune your team generation with advanced optimization rules</p>
      </div>

      <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-600" />
            Advanced Optimization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Correlation avoidance</Label>
                  <p className="text-xs text-gray-500">Avoid players with similar performance patterns</p>
                </div>
                <Switch
                  checked={ruleBasedEdits.advanced_edits.correlation_avoidance}
                  onCheckedChange={(checked) => 
                    setRuleBasedEdits(prev => ({
                      ...prev,
                      advanced_edits: { ...prev.advanced_edits, correlation_avoidance: checked }
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Matchup optimization</Label>
                  <p className="text-xs text-gray-500">Consider head-to-head historical performance</p>
                </div>
                <Switch
                  checked={ruleBasedEdits.advanced_edits.matchup_optimization}
                  onCheckedChange={(checked) => 
                    setRuleBasedEdits(prev => ({
                      ...prev,
                      advanced_edits: { ...prev.advanced_edits, matchup_optimization: checked }
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Weather adjustments</Label>
                  <p className="text-xs text-gray-500">Adjust picks based on weather conditions</p>
                </div>
                <Switch
                  checked={ruleBasedEdits.advanced_edits.weather_adjustments}
                  onCheckedChange={(checked) => 
                    setRuleBasedEdits(prev => ({
                      ...prev,
                      advanced_edits: { ...prev.advanced_edits, weather_adjustments: checked }
                    }))
                  }
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Venue specialist priority</Label>
                  <p className="text-xs text-gray-500">Prioritize players with good venue records</p>
                </div>
                <Switch
                  checked={ruleBasedEdits.advanced_edits.venue_specialist_priority}
                  onCheckedChange={(checked) => 
                    setRuleBasedEdits(prev => ({
                      ...prev,
                      advanced_edits: { ...prev.advanced_edits, venue_specialist_priority: checked }
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Injury news integration</Label>
                  <p className="text-xs text-gray-500">Factor in latest injury and team news</p>
                </div>
                <Switch
                  checked={ruleBasedEdits.advanced_edits.injury_news_integration}
                  onCheckedChange={(checked) => 
                    setRuleBasedEdits(prev => ({
                      ...prev,
                      advanced_edits: { ...prev.advanced_edits, injury_news_integration: checked }
                    }))
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">
                {Object.values(ruleBasedEdits.advanced_edits).filter(Boolean).length}
              </div>
              <div className="text-sm text-blue-600">Advanced Rules Active</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">
                {baseTeamConfig.core_players_lock}
              </div>
              <div className="text-sm text-green-600">Core Players Locked</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-700">
                {11 - baseTeamConfig.core_players_lock}
              </div>
              <div className="text-sm text-purple-600">Variable Positions</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );

  const renderStep4 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Generate Teams</h2>
        <p className="text-gray-600">Review your configuration and generate rule-based team variations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              Configuration Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Base Template:</span>
                <Badge variant="outline" className="bg-blue-50">
                  {baseTeamConfig.template_source.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Risk Profile:</span>
                <Badge variant="outline" className="bg-orange-50">
                  {baseTeamConfig.risk_profile.toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Formation:</span>
                <Badge variant="outline" className="bg-green-50">
                  {baseTeamConfig.formation_preference}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Core Players:</span>
                <Badge variant="outline" className="bg-purple-50">
                  {baseTeamConfig.core_players_lock} locked
                </Badge>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Active Rules:</h4>
              <div className="flex flex-wrap gap-1">
                {ruleBasedEdits.substitution_rules.same_role_only && (
                  <Badge variant="secondary" className="text-xs">Same Role Only</Badge>
                )}
                {ruleBasedEdits.substitution_rules.performance_upgrade && (
                  <Badge variant="secondary" className="text-xs">Performance Upgrade</Badge>
                )}
                {ruleBasedEdits.captaincy_rules.avoid_same_captain && (
                  <Badge variant="secondary" className="text-xs">Captain Diversity</Badge>
                )}
                {ruleBasedEdits.advanced_edits.correlation_avoidance && (
                  <Badge variant="secondary" className="text-xs">Correlation Avoid</Badge>
                )}
                {ruleBasedEdits.advanced_edits.matchup_optimization && (
                  <Badge variant="secondary" className="text-xs">Matchup Opt</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-green-600" />
              Generation Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Number of team variations to generate</Label>
              <div className="flex items-center space-x-4">
                <Slider
                  value={[teamCount]}
                  onValueChange={(value) => setTeamCount(value[0])}
                  min={2}
                  max={15}
                  step={1}
                  className="flex-1"
                />
                <Badge variant="outline" className="bg-blue-50 min-w-[60px] justify-center">
                  {teamCount} teams
                </Badge>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>2 teams</span>
                <span>15 teams</span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Expected Output:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 1 base team template</li>
                <li>• {teamCount - 1} rule-based variations</li>
                <li>• {baseTeamConfig.core_players_lock} consistent core players</li>
                <li>• {11 - baseTeamConfig.core_players_lock} positions with strategic substitutions</li>
                <li>• Optimized captaincy across all teams</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="pt-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              size="lg"
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                  Generating Rule-Based Teams...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  Generate {teamCount} Team Variations
                </>
              )}
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 rounded-full mb-4"
        >
          <Edit3 className="h-5 w-5 text-green-600" />
          <span className="font-semibold text-green-800">Strategy 8: Base Team + Rule-Based Edits</span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold text-gray-900 mb-2"
        >
          Rule-Based Team Generation
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gray-600 max-w-2xl mx-auto"
        >
          Create a strong base team and generate strategic variations using intelligent rule-based substitutions
        </motion.p>
      </div>

      {renderStepIndicator()}

      <AnimatePresence mode="wait">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </AnimatePresence>

      {currentStep < 4 && (
        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          <Button
            onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Strategy8Wizard;
