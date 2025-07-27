'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/enhanced-card';
import { Badge } from '../ui/enhanced-badge';
import { Progress } from '../ui/enhanced-progress';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '@radix-ui/react-separator';
import { 
  Upload, 
  Users, 
  Crown, 
  Star, 
  Target,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Camera,
  Zap,
  BarChart3,
  Trophy
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { CricketPlayer, EnrichedMatchData } from '../../lib/cricket-types';

interface Strategy2Props {
  matchData: EnrichedMatchData | null;
  onStrategyComplete: (result: any) => void;
}

interface CaptaincyDistribution {
  player: string;
  percentage: number;
  team: number;
}

export default function Strategy2WizardEnhanced({ matchData, onStrategyComplete }: Strategy2Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPlayers, setSelectedPlayers] = useState<CricketPlayer[]>([]);
  const [captaincyDistribution, setCaptaincyDistribution] = useState<CaptaincyDistribution[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [ocrResults, setOcrResults] = useState<CricketPlayer[]>([]);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const { toast } = useToast();

  // Get team players for selection
  const teamAPlayers = matchData?.players?.filter((p: any) => p.team_name === matchData.match?.team_a_name && p.is_active) || [];
  const teamBPlayers = matchData?.players?.filter((p: any) => p.team_name === matchData.match?.team_b_name && p.is_active) || [];
  const allPlayers = [...teamAPlayers, ...teamBPlayers];

  // OCR Mock Processing Function
  const processImageWithOCR = async (imageFile: File) => {
    setIsProcessingOCR(true);
    
    // Mock OCR processing - In real implementation, this would call an OCR service
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time
      
      // Mock detected players (randomly select 11 players)
      const shuffled = [...allPlayers].sort(() => 0.5 - Math.random());
      const mockDetectedPlayers = shuffled.slice(0, 11);
      
      setOcrResults(mockDetectedPlayers);
      setSelectedPlayers(mockDetectedPlayers);
      
      toast({
        title: "OCR Processing Complete",
        description: `Detected ${mockDetectedPlayers.length} players from your team screenshot`,
      });
      
      setCurrentStep(2); // Auto advance to next step
    } catch (error) {
      toast({
        title: "OCR Processing Failed",
        description: "Failed to process the image. Please try again or select players manually.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingOCR(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        processImageWithOCR(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const togglePlayerSelection = (player: CricketPlayer) => {
    setSelectedPlayers(prev => {
      const isSelected = prev.some(p => p.id === player.id);
      if (isSelected) {
        return prev.filter(p => p.id !== player.id);
      } else if (prev.length < 11) {
        return [...prev, player];
      } else {
        toast({
          title: "Team Limit Reached",
          description: "You can only select 11 players for your team",
        });
        return prev;
      }
    });
  };

  const updateCaptaincyPercentage = (playerId: string, percentage: number) => {
    setCaptaincyDistribution(prev => {
      const existing = prev.find(c => c.player === playerId);
      if (existing) {
        return prev.map(c => c.player === playerId ? { ...c, percentage } : c);
      } else {
        return [...prev, { player: playerId, percentage, team: 1 }];
      }
    });
  };

  const generateStrategy2Teams = async () => {
    if (selectedPlayers.length !== 11) {
      toast({
        title: "Invalid Selection",
        description: "Please select exactly 11 players",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/strategies/strategy2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedPlayers,
          captaincyDistribution,
          matchData
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        toast({
          title: "Strategy 2 Complete!",
          description: `Generated ${result.teams.length} teams with optimal captain rotation`,
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
      case 1: return selectedPlayers.length === 11;
      case 2: return captaincyDistribution.length > 0;
      default: return false;
    }
  };

  const getStepIcon = (step: number) => {
    if (currentStep > step) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (currentStep === step) return <Target className="h-5 w-5 text-blue-500" />;
    return <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />;
  };

  const renderPlayerCard = (player: any, isSelected: boolean) => (
    <motion.div
      key={player.id}
      layout
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => togglePlayerSelection(player)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="font-semibold text-sm">{player.name}</div>
          <div className="text-xs text-muted-foreground">{player.team_name}</div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="role" size="sm">{player.role}</Badge>
          <Badge variant="default" size="sm">{player.credits}cr</Badge>
          {isSelected && <CheckCircle className="h-4 w-4 text-green-500" />}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3"
        >
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Strategy 2: SAME XI DIFF C VC
            </h1>
            <p className="text-muted-foreground">Same 11 players, different captain combinations</p>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                {getStepIcon(step)}
                <span className="text-xs font-medium">
                  {step === 1 ? 'Select' : step === 2 ? 'Captaincy' : 'Generate'}
                </span>
              </div>
              {step < 3 && <div className="w-8 h-px bg-muted-foreground/30 mx-2" />}
            </div>
          ))}
        </div>

        <Progress value={(currentStep / 3) * 100} className="max-w-md mx-auto" variant="cricket" />
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Player Selection */}
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* OCR Upload Option */}
            <Card variant="glass" className="overflow-hidden">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Camera className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Upload Team Screenshot (OCR)</CardTitle>
                </div>
                <CardDescription>
                  Upload a screenshot of your Dream11 team and we&apos;ll automatically detect the players
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isProcessingOCR}
                    />
                    <Button 
                      variant="outline" 
                      size="lg" 
                      disabled={isProcessingOCR}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {isProcessingOCR ? 'Processing...' : 'Choose Image'}
                    </Button>
                  </div>
                  
                  {uploadedImage && (
                    <div className="relative">
                      <img src={uploadedImage} alt="Uploaded team" className="max-w-xs rounded-lg shadow-md" />
                      {isProcessingOCR && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                          <div className="text-white text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                            <p className="text-sm">Processing...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <div className="flex items-center gap-4 justify-center mb-4">
                <div className="h-px bg-border flex-1"></div>
                <span className="text-sm text-muted-foreground">or select manually</span>
                <div className="h-px bg-border flex-1"></div>
              </div>
            </div>

            {/* Manual Selection */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Team A */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {matchData?.match?.team_a_name || 'Team A'}
                    <Badge variant="default" size="sm">
                      {selectedPlayers.filter(p => p.team_name === matchData?.match?.team_a_name).length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                  {teamAPlayers.map((player: any) => 
                    renderPlayerCard(player, selectedPlayers.some(p => p.id === player.id))
                  )}
                </CardContent>
              </Card>

              {/* Team B */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {matchData?.match?.team_b_name || 'Team B'}
                    <Badge variant="default" size="sm">
                      {selectedPlayers.filter(p => p.team_name === matchData?.match?.team_b_name).length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                  {teamBPlayers.map((player: any) => 
                    renderPlayerCard(player, selectedPlayers.some(p => p.id === player.id))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Selection Summary */}
            <Card variant="primary">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{selectedPlayers.length}/11</div>
                    <div className="text-sm text-muted-foreground">Players Selected</div>
                  </div>
                  <Separator orientation="vertical" className="h-8" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                        {selectedPlayers.filter(p => p.team_name === matchData?.match?.team_a_name).length}-
                        {selectedPlayers.filter(p => p.team_name === matchData?.match?.team_b_name).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Team Split</div>
                  </div>
                  <Separator orientation="vertical" className="h-8" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedPlayers.reduce((sum, p) => sum + (p.credits || 0), 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Credits</div>
                  </div>
                </div>
                <Button 
                  onClick={() => setCurrentStep(2)} 
                  disabled={!canProceedToNext()}
                  className="flex items-center gap-2"
                >
                  Next: Set Captaincy <Crown className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Captaincy Distribution */}
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
                  <Crown className="h-5 w-5" />
                  Captain Distribution
                </CardTitle>
                <CardDescription>
                  Set what percentage of teams each player should captain
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedPlayers.map((player) => {
                  const currentDistribution = captaincyDistribution.find(c => c.player === player.id);
                  return (
                    <div key={player.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{player.name}</div>
                        <div className="text-sm text-muted-foreground">{player.team_name}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`captain-${player.id}`} className="text-sm">
                          Captain % (Team {1})
                        </Label>
                        <Input
                          id={`captain-${player.id}`}
                          type="number"
                          min="0"
                          max="100"
                          value={currentDistribution?.percentage || 0}
                          onChange={(e) => updateCaptaincyPercentage(player.id, parseInt(e.target.value) || 0)}
                          className="w-20"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                Back
              </Button>
              <Button 
                onClick={() => setCurrentStep(3)} 
                disabled={!canProceedToNext()}
                className="flex items-center gap-2"
              >
                Review & Generate <TrendingUp className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Review and Generate */}
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
                  <BarChart3 className="h-5 w-5" />
                  Strategy Summary
                </CardTitle>
                <CardDescription>
                  Review your team configuration before generating
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Selected Players ({selectedPlayers.length})</h4>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {selectedPlayers.map((player) => (
                        <div key={player.id} className="flex justify-between items-center p-2 bg-muted rounded">
                          <span className="text-sm">{player.name}</span>
                          <Badge variant="role" size="sm">{player.role}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Captain Distribution</h4>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {captaincyDistribution
                        .filter(d => d.percentage > 0)
                        .map((distribution, index) => {
                          const player = selectedPlayers.find(p => p.id === distribution.player);
                          return (
                            <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                              <span className="text-sm">{player?.name}</span>
                              <Badge variant="captain" size="sm">{distribution.percentage}%</Badge>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                Back
              </Button>
              <Button 
                onClick={generateStrategy2Teams}
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
                    Generate Strategy 2 Teams
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
