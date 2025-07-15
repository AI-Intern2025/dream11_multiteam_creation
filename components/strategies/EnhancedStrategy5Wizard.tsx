import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Info, Zap, TrendingUp, Shield, Target, Brain } from 'lucide-react';

interface EnhancedStrategy5WizardProps {
  onComplete: (config: any) => void;
  onBack: () => void;
}

interface FilterState {
  // Core filters
  dreamTeamPercentage: { min: number; max: number };
  selectionPercentage: { min: number; max: number };
  averagePoints: { min: number; max: number };
  credits: { min: number; max: number };
  
  // Advanced performance filters
  recentForm: { min: number; max: number };
  consistencyScore: { min: number; max: number };
  versatilityScore: { min: number; max: number };
  injuryRisk: { min: number; max: number };
  
  // Venue & conditions filters
  venuePerformance: { min: number; max: number };
  pitchSuitability: { min: number; max: number };
  weatherAdaptability: { min: number; max: number };
  
  // Opposition & matchup filters
  oppositionStrength: { min: number; max: number };
  headToHeadRecord: { min: number; max: number };
  captainPotential: { min: number; max: number };
  
  // Fantasy-specific filters
  ownershipProjection: { min: number; max: number };
  priceEfficiency: { min: number; max: number };
  upsetPotential: { min: number; max: number };
  
  // ML-based predictions
  mlPredictedPoints: { min: number; max: number };
  mlConfidenceScore: { min: number; max: number };
  performanceVolatility: { min: number; max: number };
  
  // Role constraints
  playerRoles: {
    batsmen: { min: number; max: number };
    bowlers: { min: number; max: number };
    allRounders: { min: number; max: number };
    wicketKeepers: { min: number; max: number };
  };
}

const EnhancedStrategy5Wizard: React.FC<EnhancedStrategy5WizardProps> = ({ onComplete, onBack }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState('core');
  const [riskProfile, setRiskProfile] = useState<'conservative' | 'balanced' | 'aggressive'>('balanced');
  const [useMLOptimization, setUseMLOptimization] = useState(true);
  const [enabledFilters, setEnabledFilters] = useState({
    core: true,
    advanced: false,
    venue: false,
    opposition: false,
    fantasy: false,
    ml: true
  });
  
  const [filters, setFilters] = useState<FilterState>({
    // Core filters (mandatory)
    dreamTeamPercentage: { min: 30, max: 100 },
    selectionPercentage: { min: 0, max: 100 },
    averagePoints: { min: 0, max: 100 },
    credits: { min: 6, max: 15 },
    
    // Advanced performance filters
    recentForm: { min: 0, max: 1 },
    consistencyScore: { min: 0, max: 1 },
    versatilityScore: { min: 0, max: 1 },
    injuryRisk: { min: 1, max: 10 },
    
    // Venue & conditions filters
    venuePerformance: { min: 0, max: 1 },
    pitchSuitability: { min: 0, max: 1 },
    weatherAdaptability: { min: 0, max: 1 },
    
    // Opposition & matchup filters
    oppositionStrength: { min: 0, max: 1 },
    headToHeadRecord: { min: 0, max: 1 },
    captainPotential: { min: 0, max: 1 },
    
    // Fantasy-specific filters
    ownershipProjection: { min: 0, max: 100 },
    priceEfficiency: { min: 0, max: 1 },
    upsetPotential: { min: 0, max: 1 },
    
    // ML-based predictions
    mlPredictedPoints: { min: 0, max: 100 },
    mlConfidenceScore: { min: 0, max: 1 },
    performanceVolatility: { min: 0, max: 1 },
    
    // Role constraints
    playerRoles: {
      batsmen: { min: 3, max: 6 },
      bowlers: { min: 3, max: 6 },
      allRounders: { min: 1, max: 4 },
      wicketKeepers: { min: 1, max: 2 }
    }
  });

  const steps = [
    { title: 'Risk Profile', icon: <Shield className="w-4 h-4" /> },
    { title: 'Core Filters', icon: <Target className="w-4 h-4" /> },
    { title: 'Advanced Filters', icon: <TrendingUp className="w-4 h-4" /> },
    { title: 'ML Optimization', icon: <Brain className="w-4 h-4" /> },
    { title: 'Summary', icon: <Info className="w-4 h-4" /> }
  ];

  const updateFilter = (filterName: string, value: { min: number; max: number }) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const updateRoleFilter = (role: string, value: { min: number; max: number }) => {
    setFilters(prev => ({
      ...prev,
      playerRoles: {
        ...prev.playerRoles,
        [role]: value
      }
    }));
  };

  const toggleFilter = (category: string, enabled: boolean) => {
    setEnabledFilters(prev => ({
      ...prev,
      [category]: enabled
    }));
  };

  const validateFilters = () => {
    // At least Dream Team % and one other filter must be set
    const hasCore = filters.dreamTeamPercentage.min > 0 || filters.dreamTeamPercentage.max < 100;
    const hasAdditional = 
      enabledFilters.advanced ||
      enabledFilters.venue ||
      enabledFilters.opposition ||
      enabledFilters.fantasy ||
      enabledFilters.ml;
    
    return hasCore && hasAdditional;
  };

  const getRiskProfileDescription = (profile: string) => {
    switch (profile) {
      case 'conservative':
        return 'Focus on consistent performers with low volatility. Safer picks with predictable returns.';
      case 'balanced':
        return 'Mix of safe and risky picks. Balanced approach between consistency and upside potential.';
      case 'aggressive':
        return 'High-risk, high-reward picks. Focus on players with high upside potential and volatility.';
      default:
        return '';
    }
  };

  const getFilterCount = () => {
    return Object.values(enabledFilters).filter(Boolean).length;
  };

  const renderRiskProfileStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Choose Your Risk Profile</h3>
        <p className="text-sm text-gray-600">This determines the ML optimization strategy and filter preferences</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(['conservative', 'balanced', 'aggressive'] as const).map((profile) => (
          <Card 
            key={profile}
            className={`cursor-pointer transition-all ${
              riskProfile === profile ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
            }`}
            onClick={() => setRiskProfile(profile)}
          >
            <CardContent className="p-4 text-center">
              <div className="mb-3">
                {profile === 'conservative' && <Shield className="w-8 h-8 mx-auto text-green-500" />}
                {profile === 'balanced' && <Target className="w-8 h-8 mx-auto text-blue-500" />}
                {profile === 'aggressive' && <Zap className="w-8 h-8 mx-auto text-red-500" />}
              </div>
              <h4 className="font-medium capitalize mb-2">{profile}</h4>
              <p className="text-xs text-gray-600">{getRiskProfileDescription(profile)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            checked={useMLOptimization}
            onCheckedChange={setUseMLOptimization}
          />
          <label className="text-sm font-medium">Enable ML Optimization</label>
        </div>
        <Badge variant={useMLOptimization ? 'default' : 'secondary'}>
          {useMLOptimization ? 'ML Enhanced' : 'Traditional'}
        </Badge>
      </div>
    </div>
  );

  const renderFilterSlider = (
    label: string,
    filterName: string,
    min: number,
    max: number,
    step: number = 1,
    unit: string = '',
    enabled: boolean = true
  ) => {
    const filterValue = filters[filterName as keyof FilterState];
    
    // Handle playerRoles separately
    if (filterName === 'playerRoles') {
      return null; // playerRoles should be handled separately
    }
    
    // Type guard to ensure we have a min/max object
    const hasMinMax = filterValue && typeof filterValue === 'object' && 'min' in filterValue && 'max' in filterValue;
    const currentMin = hasMinMax ? filterValue.min : min;
    const currentMax = hasMinMax ? filterValue.max : max;
    
    return (
      <div className={`space-y-2 ${!enabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium">{label}</label>
          <span className="text-xs text-gray-500">
            {currentMin}{unit} - {currentMax}{unit}
          </span>
        </div>
        <Slider
          value={[currentMin, currentMax]}
          onValueChange={(value) => updateFilter(filterName, { min: value[0], max: value[1] })}
          min={min}
          max={max}
          step={step}
          className="w-full"
        />
      </div>
    );
  };

  const renderCoreFiltersStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Core Statistical Filters</h3>
        <p className="text-sm text-gray-600">Essential filters that every team must meet</p>
      </div>
      
      <div className="space-y-4">
        {renderFilterSlider('Dream Team %', 'dreamTeamPercentage', 0, 100, 1, '%')}
        {renderFilterSlider('Selection %', 'selectionPercentage', 0, 100, 1, '%')}
        {renderFilterSlider('Average Points', 'averagePoints', 0, 100, 1, ' pts')}
        {renderFilterSlider('Credits', 'credits', 6, 15, 0.5, ' cr')}
      </div>
      
      <div className="mt-6">
        <h4 className="font-medium mb-3">Role Distribution</h4>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(filters.playerRoles).map(([role, range]) => (
            <div key={role} className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium capitalize">{role}</label>
                <span className="text-xs text-gray-500">{range.min} - {range.max}</span>
              </div>
              <Slider
                value={[range.min, range.max]}
                onValueChange={(value) => updateRoleFilter(role, { min: value[0], max: value[1] })}
                min={role === 'wicketKeepers' ? 1 : 1}
                max={role === 'batsmen' || role === 'bowlers' ? 6 : role === 'allRounders' ? 4 : 2}
                step={1}
                className="w-full"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAdvancedFiltersStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Advanced Statistical Filters</h3>
        <p className="text-sm text-gray-600">Optional filters for more precise player selection</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="advanced">Performance</TabsTrigger>
          <TabsTrigger value="venue">Venue</TabsTrigger>
          <TabsTrigger value="opposition">Opposition</TabsTrigger>
          <TabsTrigger value="fantasy">Fantasy</TabsTrigger>
        </TabsList>
        
        <TabsContent value="advanced" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Performance Filters</h4>
            <Switch
              checked={enabledFilters.advanced}
              onCheckedChange={(checked) => toggleFilter('advanced', checked)}
            />
          </div>
          {renderFilterSlider('Recent Form', 'recentForm', 0, 1, 0.1, '', enabledFilters.advanced)}
          {renderFilterSlider('Consistency Score', 'consistencyScore', 0, 1, 0.1, '', enabledFilters.advanced)}
          {renderFilterSlider('Versatility Score', 'versatilityScore', 0, 1, 0.1, '', enabledFilters.advanced)}
          {renderFilterSlider('Injury Risk', 'injuryRisk', 1, 10, 1, '/10', enabledFilters.advanced)}
        </TabsContent>
        
        <TabsContent value="venue" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Venue & Conditions</h4>
            <Switch
              checked={enabledFilters.venue}
              onCheckedChange={(checked) => toggleFilter('venue', checked)}
            />
          </div>
          {renderFilterSlider('Venue Performance', 'venuePerformance', 0, 1, 0.1, '', enabledFilters.venue)}
          {renderFilterSlider('Pitch Suitability', 'pitchSuitability', 0, 1, 0.1, '', enabledFilters.venue)}
          {renderFilterSlider('Weather Adaptability', 'weatherAdaptability', 0, 1, 0.1, '', enabledFilters.venue)}
        </TabsContent>
        
        <TabsContent value="opposition" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Opposition & Matchups</h4>
            <Switch
              checked={enabledFilters.opposition}
              onCheckedChange={(checked) => toggleFilter('opposition', checked)}
            />
          </div>
          {renderFilterSlider('Opposition Strength', 'oppositionStrength', 0, 1, 0.1, '', enabledFilters.opposition)}
          {renderFilterSlider('Head-to-Head Record', 'headToHeadRecord', 0, 1, 0.1, '', enabledFilters.opposition)}
          {renderFilterSlider('Captain Potential', 'captainPotential', 0, 1, 0.1, '', enabledFilters.opposition)}
        </TabsContent>
        
        <TabsContent value="fantasy" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Fantasy-Specific</h4>
            <Switch
              checked={enabledFilters.fantasy}
              onCheckedChange={(checked) => toggleFilter('fantasy', checked)}
            />
          </div>
          {renderFilterSlider('Ownership Projection', 'ownershipProjection', 0, 100, 1, '%', enabledFilters.fantasy)}
          {renderFilterSlider('Price Efficiency', 'priceEfficiency', 0, 1, 0.1, '', enabledFilters.fantasy)}
          {renderFilterSlider('Upset Potential', 'upsetPotential', 0, 1, 0.1, '', enabledFilters.fantasy)}
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderMLOptimizationStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">ML Optimization Settings</h3>
        <p className="text-sm text-gray-600">Configure machine learning-based optimization</p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium">ML Prediction Filters</h4>
          <Switch
            checked={enabledFilters.ml}
            onCheckedChange={(checked) => toggleFilter('ml', checked)}
          />
        </div>
        
        {renderFilterSlider('ML Predicted Points', 'mlPredictedPoints', 0, 100, 1, ' pts', enabledFilters.ml)}
        {renderFilterSlider('ML Confidence Score', 'mlConfidenceScore', 0, 1, 0.1, '', enabledFilters.ml)}
        {renderFilterSlider('Performance Volatility', 'performanceVolatility', 0, 1, 0.1, '', enabledFilters.ml)}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">ML Optimization Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Ensemble Prediction</span>
            <Badge variant="outline">Linear + Forest + Neural</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Genetic Algorithm</span>
            <Badge variant="outline">Multi-objective</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Risk Optimization</span>
            <Badge variant="outline">{riskProfile.charAt(0).toUpperCase() + riskProfile.slice(1)}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Captain Selection</span>
            <Badge variant="outline">ML-based</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSummaryStep = () => {
    const activeFilters = Object.entries(enabledFilters).filter(([_, enabled]) => enabled);
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Configuration Summary</h3>
          <p className="text-sm text-gray-600">Review your enhanced strategy configuration</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Risk Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="capitalize font-medium">{riskProfile}</span>
                <Badge variant={riskProfile === 'conservative' ? 'secondary' : riskProfile === 'balanced' ? 'default' : 'destructive'}>
                  {riskProfile}
                </Badge>
              </div>
              <p className="text-xs text-gray-600 mt-2">{getRiskProfileDescription(riskProfile)}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">ML Optimization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="font-medium">Status</span>
                <Badge variant={useMLOptimization ? 'default' : 'secondary'}>
                  {useMLOptimization ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {useMLOptimization ? 'Using advanced ML algorithms for optimization' : 'Using traditional statistical methods'}
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active Filters ({getFilterCount()})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {activeFilters.map(([category, enabled]) => (
                <div key={category} className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Your configuration will generate teams using {useMLOptimization ? 'ML-enhanced' : 'traditional'} algorithms
            with {getFilterCount()} active filter categories and {riskProfile} risk profile.
          </AlertDescription>
        </Alert>
      </div>
    );
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const handleComplete = () => {
    if (!validateFilters()) {
      alert('Please configure at least Dream Team % and one additional filter category.');
      return;
    }
    
    // Build final configuration
    const config = {
      strategy: 'stats-driven',
      riskProfile,
      useMLOptimization,
      filters: {
        ...filters,
        // Only include enabled filters
        ...(enabledFilters.advanced ? {
          recentForm: filters.recentForm,
          consistencyScore: filters.consistencyScore,
          versatilityScore: filters.versatilityScore,
          injuryRisk: filters.injuryRisk
        } : {}),
        ...(enabledFilters.venue ? {
          venuePerformance: filters.venuePerformance,
          pitchSuitability: filters.pitchSuitability,
          weatherAdaptability: filters.weatherAdaptability
        } : {}),
        ...(enabledFilters.opposition ? {
          oppositionStrength: filters.oppositionStrength,
          headToHeadRecord: filters.headToHeadRecord,
          captainPotential: filters.captainPotential
        } : {}),
        ...(enabledFilters.fantasy ? {
          ownershipProjection: filters.ownershipProjection,
          priceEfficiency: filters.priceEfficiency,
          upsetPotential: filters.upsetPotential
        } : {}),
        ...(enabledFilters.ml ? {
          mlPredictedPoints: filters.mlPredictedPoints,
          mlConfidenceScore: filters.mlConfidenceScore,
          performanceVolatility: filters.performanceVolatility
        } : {})
      }
    };
    
    onComplete(config);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Progress Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Enhanced Strategy 5: ML-Driven Guardrails</h2>
          <Badge variant="outline">
            Step {currentStep + 1} of {steps.length}
          </Badge>
        </div>
        
        <Progress value={((currentStep + 1) / steps.length) * 100} className="w-full" />
        
        <div className="flex justify-between items-center">
          {steps.map((step, index) => (
            <div key={index} className={`flex items-center space-x-2 ${
              index === currentStep ? 'text-blue-600' : 
              index < currentStep ? 'text-green-600' : 'text-gray-400'
            }`}>
              {step.icon}
              <span className="text-sm font-medium">{step.title}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {currentStep === 0 && renderRiskProfileStep()}
          {currentStep === 1 && renderCoreFiltersStep()}
          {currentStep === 2 && renderAdvancedFiltersStep()}
          {currentStep === 3 && renderMLOptimizationStep()}
          {currentStep === 4 && renderSummaryStep()}
        </CardContent>
      </Card>
      
      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          {currentStep === 0 ? 'Back to Strategy Selection' : 'Previous'}
        </Button>
        
        <div className="flex space-x-2">
          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button onClick={handleComplete} disabled={!validateFilters()}>
              Generate Teams
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedStrategy5Wizard;
