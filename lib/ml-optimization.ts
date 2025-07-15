import { Player } from './neon-db';

export interface MLPlayerScore {
  playerId: number;
  predictedPoints: number;
  confidence: number;
  volatility: number;
  recentForm: number;
  consistencyScore: number;
  versatilityScore: number;
  injuryRisk: number;
  venuePerformance: number;
  pitchSuitability: number;
  weatherAdaptability: number;
  oppositionStrength: number;
  headToHeadRecord: number;
  captainPotential: number;
  ownershipProjection: number;
  priceEfficiency: number;
  upsetPotential: number;
  performanceVolatility: number;
}

export interface MLTeamOptimization {
  teamComposition: Player[];
  expectedPoints: number;
  riskScore: number;
  diversityScore: number;
  confidenceScore: number;
  reasoning: string[];
}

export interface MLMatchContext {
  matchId: number;
  venue: string;
  pitchType: 'batting' | 'bowling' | 'balanced';
  weatherCondition: 'clear' | 'overcast' | 'rain' | 'hot' | 'cold';
  team1: string;
  team2: string;
  matchFormat: 'T20' | 'ODI' | 'Test';
  recentHead2Head: any[];
}

class MLOptimizationService {
  private readonly FEATURE_WEIGHTS = {
    recentForm: 0.25,
    consistency: 0.20,
    versatility: 0.15,
    venuePerformance: 0.12,
    oppositionStrength: 0.10,
    priceEfficiency: 0.08,
    captainPotential: 0.06,
    injuryRisk: 0.04
  };

  private readonly RISK_THRESHOLDS = {
    conservative: { maxVolatility: 0.3, minConsistency: 0.7 },
    balanced: { maxVolatility: 0.5, minConsistency: 0.5 },
    aggressive: { maxVolatility: 0.8, minConsistency: 0.3 }
  };

  /**
   * Generate ML-based player scores using multiple algorithms
   */
  async generateMLPlayerScores(
    players: Player[],
    matchContext: MLMatchContext
  ): Promise<MLPlayerScore[]> {
    console.log(`🤖 ML: Generating scores for ${players.length} players`);
    
    const scores: MLPlayerScore[] = [];
    
    for (const player of players) {
      const mlScore = await this.calculatePlayerMLScore(player, matchContext);
      scores.push(mlScore);
    }
    
    // Sort by predicted points (descending)
    return scores.sort((a, b) => b.predictedPoints - a.predictedPoints);
  }

  /**
   * Calculate comprehensive ML score for a player
   */
  private async calculatePlayerMLScore(
    player: Player,
    matchContext: MLMatchContext
  ): Promise<MLPlayerScore> {
    // Use actual player data if available, otherwise calculate
    const basePoints = player.points || 0;
    const baseCredits = player.credits || 8;
    const dreamTeamPct = player.dream_team_percentage || 0;
    const selectionPct = player.selection_percentage || 0;
    
    // Use advanced metrics from player data or calculate them
    const recentForm = player.recent_form_rating || this.calculateRecentForm(player, matchContext);
    const consistencyScore = player.consistency_score || this.calculateConsistencyScore(player);
    const versatilityScore = player.versatility_score || this.calculateVersatilityScore(player);
    const injuryRisk = player.injury_risk_score || this.calculateInjuryRisk(player);
    const venuePerformance = player.venue_performance || this.calculateVenuePerformance(player, matchContext);
    const pitchSuitability = player.pitch_suitability || this.calculatePitchSuitability(player, matchContext);
    const weatherAdaptability = player.weather_adaptability || this.calculateWeatherAdaptability(player, matchContext);
    const oppositionStrength = player.opposition_strength || this.calculateOppositionStrength(player, matchContext);
    const headToHeadRecord = player.head_to_head_record || this.calculateHeadToHeadRecord(player, matchContext);
    const captainPotential = player.captain_potential || this.calculateCaptainPotential(player);
    const ownershipProjection = player.ownership_projection || this.calculateOwnershipProjection(player);
    const priceEfficiency = player.price_efficiency || this.calculatePriceEfficiency(player);
    const upsetPotential = player.upset_potential || this.calculateUpsetPotential(player);
    
    // Advanced ML-based prediction using ensemble approach
    const predictedPoints = this.ensemblePrediction(player, {
      recentForm,
      consistencyScore,
      versatilityScore,
      venuePerformance,
      pitchSuitability,
      weatherAdaptability,
      oppositionStrength,
      headToHeadRecord,
      captainPotential,
      basePoints,
      dreamTeamPct,
      selectionPct,
      credits: baseCredits
    });
    
    const confidence = this.calculateConfidence(player, {
      consistencyScore,
      recentForm,
      versatilityScore,
      pitchSuitability,
      venuePerformance
    });
    
    const volatility = this.calculateVolatility(player, {
      consistencyScore,
      recentForm,
      injuryRisk,
      upsetPotential
    });
    
    const performanceVolatility = this.calculatePerformanceVolatility(player);
    
    return {
      playerId: player.id,
      predictedPoints,
      confidence,
      volatility,
      recentForm,
      consistencyScore,
      versatilityScore,
      injuryRisk,
      venuePerformance,
      pitchSuitability,
      weatherAdaptability,
      oppositionStrength,
      headToHeadRecord,
      captainPotential,
      ownershipProjection,
      priceEfficiency,
      upsetPotential,
      performanceVolatility
    };
  }

  /**
   * Ensemble prediction using multiple ML algorithms
   */
  private ensemblePrediction(player: Player, features: any): number {
    // Linear regression component with advanced features
    const linearPrediction = this.advancedLinearRegression(player, features);
    
    // Random forest component (simplified decision tree ensemble)
    const forestPrediction = this.randomForestPrediction(player, features);
    
    // Neural network component (multi-layer perceptron)
    const neuralPrediction = this.neuralNetworkPrediction(player, features);
    
    // Gradient boosting component (simplified)
    const boostingPrediction = this.gradientBoostingPrediction(player, features);
    
    // Support vector regression component
    const svrPrediction = this.supportVectorRegression(player, features);
    
    // Weighted ensemble with dynamic weights based on confidence
    const confidenceWeight = features.consistencyScore * 0.3 + features.recentForm * 0.7;
    
    const ensembleScore = (
      linearPrediction * (0.25 + confidenceWeight * 0.1) +
      forestPrediction * (0.20 + (1 - confidenceWeight) * 0.1) +
      neuralPrediction * 0.20 +
      boostingPrediction * 0.20 +
      svrPrediction * 0.15
    );
    
    return Math.max(0, Math.min(100, ensembleScore));
  }

  /**
   * Advanced linear regression with interaction terms
   */
  private advancedLinearRegression(player: Player, features: any): number {
    const weights = {
      // Primary features
      recentForm: 15.0,
      consistencyScore: 12.0,
      versatilityScore: 10.0,
      venuePerformance: 8.0,
      pitchSuitability: 7.0,
      weatherAdaptability: 6.0,
      oppositionStrength: 5.0,
      headToHeadRecord: 4.0,
      captainPotential: 3.0,
      dreamTeamPct: 0.25,
      selectionPct: 0.15,
      credits: 1.5,
      
      // Interaction terms
      formVersatility: 8.0, // recentForm * versatilityScore
      venueConsistency: 6.0, // venuePerformance * consistencyScore
      pitchOpposition: 4.0, // pitchSuitability * oppositionStrength
      priceEfficiency: 5.0 // (basePoints / credits) normalized
    };
    
    let prediction = (features.basePoints || 0) * 0.5; // Base score
    
    // Primary features
    prediction += features.recentForm * weights.recentForm;
    prediction += features.consistencyScore * weights.consistencyScore;
    prediction += features.versatilityScore * weights.versatilityScore;
    prediction += features.venuePerformance * weights.venuePerformance;
    prediction += features.pitchSuitability * weights.pitchSuitability;
    prediction += features.weatherAdaptability * weights.weatherAdaptability;
    prediction += features.oppositionStrength * weights.oppositionStrength;
    prediction += features.headToHeadRecord * weights.headToHeadRecord;
    prediction += features.captainPotential * weights.captainPotential;
    prediction += (features.dreamTeamPct / 100) * weights.dreamTeamPct;
    prediction += (features.selectionPct / 100) * weights.selectionPct;
    prediction += features.credits * weights.credits;
    
    // Interaction terms
    prediction += (features.recentForm * features.versatilityScore) * weights.formVersatility;
    prediction += (features.venuePerformance * features.consistencyScore) * weights.venueConsistency;
    prediction += (features.pitchSuitability * features.oppositionStrength) * weights.pitchOpposition;
    prediction += ((features.basePoints || 0) / Math.max(1, features.credits || 8)) * weights.priceEfficiency;
    
    return Math.max(0, prediction);
  }

  /**
   * Gradient boosting prediction (simplified)
   */
  private gradientBoostingPrediction(player: Player, features: any): number {
    // Stage 1: Base prediction
    let prediction = (features.basePoints || 0) * 0.6;
    
    // Stage 2: Residual correction for form
    const formResidual = features.recentForm > 0.7 ? 15 : features.recentForm < 0.3 ? -10 : 0;
    prediction += formResidual * 0.3;
    
    // Stage 3: Residual correction for consistency
    const consistencyResidual = features.consistencyScore > 0.8 ? 8 : features.consistencyScore < 0.4 ? -5 : 0;
    prediction += consistencyResidual * 0.25;
    
    // Stage 4: Residual correction for venue performance
    const venueResidual = features.venuePerformance > 0.7 ? 6 : features.venuePerformance < 0.3 ? -4 : 0;
    prediction += venueResidual * 0.2;
    
    // Stage 5: Final adjustment based on role-specific factors
    const roleMultiplier = this.getRoleMultiplier(player.player_role, features);
    prediction *= roleMultiplier;
    
    return Math.max(0, prediction);
  }

  /**
   * Support vector regression (simplified)
   */
  private supportVectorRegression(player: Player, features: any): number {
    // SVR with RBF kernel simulation
    const support_vectors = [
      { features: [0.8, 0.7, 0.6], weight: 0.5 },
      { features: [0.6, 0.8, 0.7], weight: 0.3 },
      { features: [0.7, 0.6, 0.8], weight: 0.2 }
    ];
    
    const gamma = 0.1;
    let prediction = 0;
    
    for (const sv of support_vectors) {
      const distance = Math.sqrt(
        Math.pow(features.recentForm - sv.features[0], 2) +
        Math.pow(features.consistencyScore - sv.features[1], 2) +
        Math.pow(features.versatilityScore - sv.features[2], 2)
      );
      
      const rbf_value = Math.exp(-gamma * distance * distance);
      prediction += sv.weight * rbf_value;
    }
    
    return Math.max(0, (features.basePoints || 0) * 0.7 + prediction * 30);
  }

  /**
   * Get role-specific multiplier for predictions
   */
  private getRoleMultiplier(role: string, features: any): number {
    switch (role) {
      case 'BAT':
        return 1.0 + (features.venuePerformance * 0.2) + (features.pitchSuitability * 0.15);
      case 'BWL':
        return 1.0 + (features.weatherAdaptability * 0.2) + (features.oppositionStrength * 0.15);
      case 'AR':
        return 1.0 + (features.versatilityScore * 0.3) + (features.consistencyScore * 0.1);
      case 'WK':
        return 1.0 + (features.recentForm * 0.2) + (features.captainPotential * 0.1);
      default:
        return 1.0;
    }
  }

  /**
   * Random forest prediction (simplified decision tree ensemble)
   */
  private randomForestPrediction(player: Player, features: any): number {
    const trees = 5;
    let totalPrediction = 0;
    
    for (let i = 0; i < trees; i++) {
      let treePrediction = features.basePoints || 0;
      
      // Tree 1: Focus on recent form
      if (i === 0) {
        if (features.recentForm > 0.7) treePrediction += 15;
        else if (features.recentForm > 0.5) treePrediction += 8;
        else treePrediction += 2;
      }
      
      // Tree 2: Focus on consistency
      if (i === 1) {
        if (features.consistencyScore > 0.8) treePrediction += 12;
        else if (features.consistencyScore > 0.6) treePrediction += 6;
        else treePrediction += 1;
      }
      
      // Tree 3: Focus on venue performance
      if (i === 2) {
        if (features.venuePerformance > 0.7) treePrediction += 10;
        else if (features.venuePerformance > 0.5) treePrediction += 5;
        else treePrediction += 0;
      }
      
      // Tree 4: Focus on opposition strength
      if (i === 3) {
        if (features.oppositionStrength > 0.6) treePrediction += 8;
        else if (features.oppositionStrength > 0.4) treePrediction += 4;
        else treePrediction += 0;
      }
      
      // Tree 5: Focus on versatility
      if (i === 4) {
        if (features.versatilityScore > 0.8) treePrediction += 7;
        else if (features.versatilityScore > 0.6) treePrediction += 3;
        else treePrediction += 0;
      }
      
      totalPrediction += treePrediction;
    }
    
    return totalPrediction / trees;
  }

  /**
   * Neural network prediction (simplified)
   */
  private neuralNetworkPrediction(player: Player, features: any): number {
    // Input layer normalization
    const inputs = [
      features.recentForm || 0,
      features.consistencyScore || 0,
      features.versatilityScore || 0,
      features.venuePerformance || 0,
      features.pitchSuitability || 0,
      features.oppositionStrength || 0,
      (features.dreamTeamPct || 0) / 100,
      (features.selectionPct || 0) / 100
    ];
    
    // Hidden layer 1 (4 neurons)
    const hidden1 = [
      this.activationFunction(inputs[0] * 0.8 + inputs[1] * 0.6 + inputs[2] * 0.4 + inputs[3] * 0.2),
      this.activationFunction(inputs[1] * 0.9 + inputs[2] * 0.7 + inputs[4] * 0.5 + inputs[5] * 0.3),
      this.activationFunction(inputs[2] * 0.8 + inputs[3] * 0.8 + inputs[6] * 0.4 + inputs[7] * 0.2),
      this.activationFunction(inputs[4] * 0.9 + inputs[5] * 0.6 + inputs[0] * 0.5 + inputs[1] * 0.3)
    ];
    
    // Hidden layer 2 (2 neurons)
    const hidden2 = [
      this.activationFunction(hidden1[0] * 0.9 + hidden1[1] * 0.7 + hidden1[2] * 0.5),
      this.activationFunction(hidden1[1] * 0.8 + hidden1[2] * 0.8 + hidden1[3] * 0.6)
    ];
    
    // Output layer
    const output = this.activationFunction(hidden2[0] * 0.8 + hidden2[1] * 0.6) * 80; // Scale to points
    
    return (features.basePoints || 0) * 0.4 + output * 0.6;
  }

  /**
   * Activation function (ReLU)
   */
  private activationFunction(x: number): number {
    return Math.max(0, x);
  }

  /**
   * Calculate recent form score (0-1)
   */
  private calculateRecentForm(player: Player, context: MLMatchContext): number {
    // Simulate recent form based on current points and dream team percentage
    const baseForm = ((player.points || 0) / 100) * 0.6;
    const dreamTeamBonus = ((player.dream_team_percentage || 0) / 100) * 0.4;
    
    // Add some randomness for simulation
    const randomFactor = (Math.random() - 0.5) * 0.2;
    
    return Math.max(0, Math.min(1, baseForm + dreamTeamBonus + randomFactor));
  }

  /**
   * Calculate consistency score (0-1)
   */
  private calculateConsistencyScore(player: Player): number {
    // Higher consistency for players with moderate but steady performance
    const points = player.points || 0;
    const selectionPct = player.selection_percentage || 0;
    
    // Players with moderate selection % but decent points tend to be consistent
    const consistencyBase = Math.max(0, 1 - Math.abs(selectionPct - 50) / 50);
    const pointsBonus = Math.min(1, points / 60) * 0.3;
    
    return Math.max(0, Math.min(1, consistencyBase * 0.7 + pointsBonus));
  }

  /**
   * Calculate versatility score (0-1)
   */
  private calculateVersatilityScore(player: Player): number {
    const role = player.player_role;
    const credits = player.credits || 8;
    
    // All-rounders are naturally more versatile
    if (role === 'AR') return 0.9;
    
    // Players with higher credits in non-AR roles show versatility
    const creditBonus = Math.min(1, (credits - 7) / 4);
    
    return Math.max(0.3, Math.min(1, 0.5 + creditBonus * 0.4));
  }

  /**
   * Calculate injury risk score (1-10, 10 = low risk)
   */
  private calculateInjuryRisk(player: Player): number {
    // Simulate injury risk based on player age and recent activity
    const baseRisk = 7; // Most players have moderate risk
    const ageRisk = Math.random() * 2 - 1; // Simulate age factor
    const activityRisk = player.is_playing_today ? 1 : -2;
    
    return Math.max(1, Math.min(10, baseRisk + ageRisk + activityRisk));
  }

  /**
   * Calculate venue performance score (0-1)
   */
  private calculateVenuePerformance(player: Player, context: MLMatchContext): number {
    // Simulate venue-specific performance
    const role = player.player_role;
    const basePerformance = ((player.points || 0) / 100) * 0.8;
    
    // Different roles perform differently at different venues
    let venueBonus = 0;
    if (context.venue.includes('Wankhede') && role === 'BAT') venueBonus = 0.2;
    if (context.venue.includes('Lord') && role === 'BWL') venueBonus = 0.2;
    if (context.venue.includes('Adelaide') && role === 'AR') venueBonus = 0.15;
    
    return Math.max(0, Math.min(1, basePerformance + venueBonus));
  }

  /**
   * Calculate pitch suitability score (0-1)
   */
  private calculatePitchSuitability(player: Player, context: MLMatchContext): number {
    const role = player.player_role;
    const pitchType = context.pitchType;
    
    let suitability = 0.5; // Base suitability
    
    if (pitchType === 'batting' && (role === 'BAT' || role === 'AR')) suitability = 0.8;
    if (pitchType === 'bowling' && role === 'BWL') suitability = 0.8;
    if (pitchType === 'balanced') suitability = 0.6;
    
    return suitability;
  }

  /**
   * Calculate weather adaptability score (0-1)
   */
  private calculateWeatherAdaptability(player: Player, context: MLMatchContext): number {
    const country = player.country || 'Unknown';
    const weather = context.weatherCondition;
    
    let adaptability = 0.5;
    
    // Home advantage in familiar conditions
    if (country === 'India' && weather === 'hot') adaptability = 0.8;
    if (country === 'England' && weather === 'overcast') adaptability = 0.8;
    if (country === 'Australia' && weather === 'clear') adaptability = 0.8;
    
    return adaptability;
  }

  /**
   * Calculate opposition strength score (0-1)
   */
  private calculateOppositionStrength(player: Player, context: MLMatchContext): number {
    const playerTeam = player.team_name;
    const oppositionTeam = playerTeam === context.team1 ? context.team2 : context.team1;
    
    // Simulate opposition strength based on team rankings
    const teamStrengths: Record<string, number> = {
      'India': 0.9,
      'Australia': 0.85,
      'England': 0.8,
      'South Africa': 0.75,
      'New Zealand': 0.7,
      'Pakistan': 0.7,
      'West Indies': 0.6,
      'Sri Lanka': 0.55
    };
    
    const opponentStrength = teamStrengths[oppositionTeam] || 0.5;
    
    // Players perform differently against different opposition strengths
    const basePerformance = ((player.points || 0) / 100) * 0.8;
    const oppositionAdjustment = (1 - opponentStrength) * 0.3; // Easier opponents = better performance
    
    return Math.max(0, Math.min(1, basePerformance + oppositionAdjustment));
  }

  /**
   * Calculate head-to-head record score (0-1)
   */
  private calculateHeadToHeadRecord(player: Player, context: MLMatchContext): number {
    // Simulate H2H performance
    const baseH2H = 0.5;
    const performanceVariation = (Math.random() - 0.5) * 0.4;
    
    return Math.max(0, Math.min(1, baseH2H + performanceVariation));
  }

  /**
   * Calculate captain potential score (0-1)
   */
  private calculateCaptainPotential(player: Player): number {
    const role = player.player_role;
    const credits = player.credits || 8;
    const points = player.points || 0;
    
    // Batsmen and all-rounders are better captains
    let roleBonus = 0;
    if (role === 'BAT' || role === 'AR') roleBonus = 0.3;
    if (role === 'WK') roleBonus = 0.2;
    if (role === 'BWL') roleBonus = 0.1;
    
    const creditBonus = Math.min(1, credits / 12) * 0.4;
    const pointsBonus = Math.min(1, points / 80) * 0.3;
    
    return Math.max(0, Math.min(1, roleBonus + creditBonus + pointsBonus));
  }

  /**
   * Calculate ownership projection (0-100)
   */
  private calculateOwnershipProjection(player: Player): number {
    const selectionPct = player.selection_percentage || 0;
    const dreamTeamPct = player.dream_team_percentage || 0;
    
    // Expected ownership based on selection and dream team percentages
    const baseOwnership = (selectionPct * 0.6 + dreamTeamPct * 0.4);
    const variation = (Math.random() - 0.5) * 10; // ±5% variation
    
    return Math.max(0, Math.min(100, baseOwnership + variation));
  }

  /**
   * Calculate price efficiency score (0-1)
   */
  private calculatePriceEfficiency(player: Player): number {
    const credits = player.credits || 8;
    const points = player.points || 0;
    
    const efficiency = points / credits;
    const maxEfficiency = 10; // Assume max 10 points per credit
    
    return Math.max(0, Math.min(1, efficiency / maxEfficiency));
  }

  /**
   * Calculate upset potential score (0-1)
   */
  private calculateUpsetPotential(player: Player): number {
    const selectionPct = player.selection_percentage || 0;
    const dreamTeamPct = player.dream_team_percentage || 0;
    const points = player.points || 0;
    
    // Players with low selection but decent points/potential have high upset potential
    const lowOwnership = Math.max(0, 1 - selectionPct / 100);
    const decentPotential = Math.min(1, points / 40);
    
    return Math.max(0, Math.min(1, lowOwnership * 0.7 + decentPotential * 0.3));
  }

  /**
   * Calculate confidence score (0-1)
   */
  private calculateConfidence(player: Player, features: any): number {
    const consistencyWeight = 0.4;
    const recentFormWeight = 0.3;
    const versatilityWeight = 0.3;
    
    return Math.max(0, Math.min(1,
      features.consistencyScore * consistencyWeight +
      features.recentForm * recentFormWeight +
      features.versatilityScore * versatilityWeight
    ));
  }

  /**
   * Calculate volatility score (0-1)
   */
  private calculateVolatility(player: Player, features: any): number {
    const consistencyImpact = 1 - features.consistencyScore;
    const formImpact = 1 - features.recentForm;
    const injuryImpact = (10 - features.injuryRisk) / 10;
    
    return Math.max(0, Math.min(1,
      consistencyImpact * 0.5 +
      formImpact * 0.3 +
      injuryImpact * 0.2
    ));
  }

  /**
   * Calculate performance volatility score (0-1)
   */
  private calculatePerformanceVolatility(player: Player): number {
    const selectionPct = player.selection_percentage || 0;
    const dreamTeamPct = player.dream_team_percentage || 0;
    
    // Higher gap between dream team % and selection % indicates volatility
    const gap = Math.abs(dreamTeamPct - selectionPct);
    const volatility = Math.min(1, gap / 50);
    
    return volatility;
  }

  /**
   * Optimize team composition using ML scores
   */
  async optimizeTeamComposition(
    players: Player[],
    mlScores: MLPlayerScore[],
    matchContext: MLMatchContext,
    riskProfile: 'conservative' | 'balanced' | 'aggressive' = 'balanced'
  ): Promise<MLTeamOptimization> {
    console.log(`🤖 ML: Optimizing team composition with ${riskProfile} risk profile`);
    
    const riskThreshold = this.RISK_THRESHOLDS[riskProfile];
    
    // Filter players based on risk profile
    const filteredScores = mlScores.filter(score => 
      score.volatility <= riskThreshold.maxVolatility &&
      score.consistencyScore >= riskThreshold.minConsistency
    );
    
    // Multi-objective optimization
    const optimizedTeam = await this.optimizeTeamWithGeneticAlgorithm(
      players,
      filteredScores,
      { riskProfile },
      50,
      100
    );
    
    return optimizedTeam;
  }

  /**
   * Optimize team using genetic algorithm
   */
  async optimizeTeamWithGeneticAlgorithm(
    players: Player[],
    mlScores: MLPlayerScore[],
    userPreferences: any,
    generations: number = 50,
    populationSize: number = 100
  ): Promise<MLTeamOptimization> {
    console.log(`🧬 Starting genetic algorithm optimization (${generations} generations, ${populationSize} population)`);
    
    // Initialize population
    let population = this.initializePopulation(players, mlScores, populationSize);
    
    // Evolution loop
    for (let generation = 0; generation < generations; generation++) {
      // Evaluate fitness for each individual
      const evaluatedPopulation = population.map(individual => ({
        team: individual,
        fitness: this.calculateTeamFitness(individual, mlScores, userPreferences)
      }));
      
      // Sort by fitness (descending)
      evaluatedPopulation.sort((a, b) => b.fitness - a.fitness);
      
      // Select top performers for breeding
      const eliteCount = Math.floor(populationSize * 0.2);
      const elite = evaluatedPopulation.slice(0, eliteCount).map(e => e.team);
      
      // Generate new population
      const newPopulation = [...elite];
      
      while (newPopulation.length < populationSize) {
        // Tournament selection
        const parent1 = this.tournamentSelection(evaluatedPopulation, 3);
        const parent2 = this.tournamentSelection(evaluatedPopulation, 3);
        
        // Crossover
        const offspring = this.crossover(parent1.team, parent2.team, players);
        
        // Mutation
        const mutatedOffspring = this.mutate(offspring, players, 0.1);
        
        // Validate and add to population
        if (this.isValidTeam(mutatedOffspring)) {
          newPopulation.push(mutatedOffspring);
        }
      }
      
      population = newPopulation;
      
      // Log progress every 10 generations
      if (generation % 10 === 0) {
        console.log(`🧬 Generation ${generation}: Best fitness = ${evaluatedPopulation[0].fitness.toFixed(2)}`);
      }
    }
    
    // Final evaluation
    const finalEvaluated = population.map(individual => ({
      team: individual,
      fitness: this.calculateTeamFitness(individual, mlScores, userPreferences)
    }));
    
    finalEvaluated.sort((a, b) => b.fitness - a.fitness);
    const bestTeam = finalEvaluated[0].team;
    
    console.log(`🏆 Genetic algorithm completed. Best fitness: ${finalEvaluated[0].fitness.toFixed(2)}`);
    
    return {
      teamComposition: bestTeam,
      expectedPoints: this.calculateExpectedPoints(bestTeam, mlScores),
      riskScore: this.calculateTeamRisk(bestTeam, mlScores),
      diversityScore: this.calculateDiversityScore(bestTeam, mlScores),
      confidenceScore: this.calculateTeamConfidence(bestTeam, mlScores),
      reasoning: this.generateOptimizationReasoning(bestTeam, mlScores, 'genetic-algorithm')
    };
  }

  /**
   * Initialize population for genetic algorithm
   */
  private initializePopulation(players: Player[], mlScores: MLPlayerScore[], populationSize: number): Player[][] {
    const population: Player[][] = [];
    
    for (let i = 0; i < populationSize; i++) {
      const team = this.generateRandomValidTeam(players);
      if (team.length === 11) {
        population.push(team);
      } else {
        i--; // Retry if invalid team
      }
    }
    
    return population;
  }

  /**
   * Generate a random valid team
   */
  private generateRandomValidTeam(players: Player[]): Player[] {
    const team: Player[] = [];
    const usedPlayers = new Set<number>();
    const teamCounts: Record<string, number> = {};
    let totalCredits = 0;
    
    // Role requirements
    const roleRequirements = {
      'WK': { min: 1, max: 2, current: 0 },
      'BAT': { min: 3, max: 5, current: 0 },
      'AR': { min: 2, max: 4, current: 0 },
      'BWL': { min: 3, max: 5, current: 0 }
    };
    
    // Group players by role
    const playersByRole = {
      'WK': players.filter(p => p.player_role === 'WK'),
      'BAT': players.filter(p => p.player_role === 'BAT'),
      'AR': players.filter(p => p.player_role === 'AR'),
      'BWL': players.filter(p => p.player_role === 'BWL')
    };
    
    // Fill minimum requirements first
    for (const [role, requirement] of Object.entries(roleRequirements)) {
      const rolePlayers = playersByRole[role as keyof typeof playersByRole];
      
      for (let i = 0; i < requirement.min; i++) {
        const availablePlayers = rolePlayers.filter(p => {
          const playerTeam = p.team_name || 'Unknown';
          const playerCredits = p.credits || 8;
          
          return !usedPlayers.has(p.id) &&
                 totalCredits + playerCredits <= 100 &&
                 (teamCounts[playerTeam] || 0) < 7;
        });
        
        if (availablePlayers.length > 0) {
          const randomIndex = Math.floor(Math.random() * availablePlayers.length);
          const selectedPlayer = availablePlayers[randomIndex];
          
          team.push(selectedPlayer);
          usedPlayers.add(selectedPlayer.id);
          totalCredits += selectedPlayer.credits || 8;
          
          const playerTeam = selectedPlayer.team_name || 'Unknown';
          teamCounts[playerTeam] = (teamCounts[playerTeam] || 0) + 1;
          requirement.current++;
        }
      }
    }
    
    // Fill remaining slots
    while (team.length < 11) {
      const availablePlayers = players.filter(p => {
        const playerTeam = p.team_name || 'Unknown';
        const playerCredits = p.credits || 8;
        const role = p.player_role || 'BAT';
        const roleReq = roleRequirements[role as keyof typeof roleRequirements];
        
        return !usedPlayers.has(p.id) &&
               totalCredits + playerCredits <= 100 &&
               (teamCounts[playerTeam] || 0) < 7 &&
               roleReq && roleReq.current < roleReq.max;
      });
      
      if (availablePlayers.length === 0) break;
      
      const randomIndex = Math.floor(Math.random() * availablePlayers.length);
      const selectedPlayer = availablePlayers[randomIndex];
      
      team.push(selectedPlayer);
      usedPlayers.add(selectedPlayer.id);
      totalCredits += selectedPlayer.credits || 8;
      
      const playerTeam = selectedPlayer.team_name || 'Unknown';
      teamCounts[playerTeam] = (teamCounts[playerTeam] || 0) + 1;
      
      const role = selectedPlayer.player_role || 'BAT';
      const roleReq = roleRequirements[role as keyof typeof roleRequirements];
      if (roleReq) roleReq.current++;
    }
    
    return team;
  }

  /**
   * Calculate team fitness for genetic algorithm
   */
  private calculateTeamFitness(team: Player[], mlScores: MLPlayerScore[], userPreferences: any): number {
    if (team.length !== 11) return 0;
    
    let fitness = 0;
    
    // Expected points (40% weight)
    const expectedPoints = this.calculateExpectedPoints(team, mlScores);
    fitness += (expectedPoints / 500) * 0.4;
    
    // Risk management (20% weight)
    const riskScore = this.calculateTeamRisk(team, mlScores);
    const riskProfile = userPreferences?.riskProfile || 'balanced';
    
    if (riskProfile === 'conservative') {
      fitness += (1 - riskScore) * 0.2;
    } else if (riskProfile === 'aggressive') {
      fitness += riskScore * 0.2;
    } else {
      fitness += (0.5 - Math.abs(riskScore - 0.5)) * 0.2;
    }
    
    // Diversity (15% weight)
    const diversityScore = this.calculateDiversityScore(team, mlScores);
    fitness += diversityScore * 0.15;
    
    // Confidence (15% weight)
    const confidenceScore = this.calculateTeamConfidence(team, mlScores);
    fitness += confidenceScore * 0.15;
    
    // Budget efficiency (10% weight)
    const totalCredits = team.reduce((sum, p) => sum + (p.credits || 8), 0);
    const budgetEfficiency = Math.min(1, totalCredits / 100);
    fitness += budgetEfficiency * 0.1;
    
    return fitness;
  }

  /**
   * Tournament selection for genetic algorithm
   */
  private tournamentSelection(population: { team: Player[]; fitness: number }[], tournamentSize: number): { team: Player[]; fitness: number } {
    const tournament: { team: Player[]; fitness: number }[] = [];
    
    for (let i = 0; i < tournamentSize; i++) {
      const randomIndex = Math.floor(Math.random() * population.length);
      tournament.push(population[randomIndex]);
    }
    
    return tournament.reduce((best, current) => 
      current.fitness > best.fitness ? current : best
    );
  }

  /**
   * Crossover operation for genetic algorithm
   */
  private crossover(parent1: Player[], parent2: Player[], allPlayers: Player[]): Player[] {
    const offspring: Player[] = [];
    const usedPlayers = new Set<number>();
    
    // Take first half from parent1
    for (let i = 0; i < 5; i++) {
      if (parent1[i] && !usedPlayers.has(parent1[i].id)) {
        offspring.push(parent1[i]);
        usedPlayers.add(parent1[i].id);
      }
    }
    
    // Take second half from parent2
    for (let i = 5; i < 11; i++) {
      if (parent2[i] && !usedPlayers.has(parent2[i].id)) {
        offspring.push(parent2[i]);
        usedPlayers.add(parent2[i].id);
      }
    }
    
    // Fill remaining slots with random valid players
    while (offspring.length < 11) {
      const availablePlayers = allPlayers.filter(p => !usedPlayers.has(p.id));
      if (availablePlayers.length === 0) break;
      
      const randomIndex = Math.floor(Math.random() * availablePlayers.length);
      const selectedPlayer = availablePlayers[randomIndex];
      
      offspring.push(selectedPlayer);
      usedPlayers.add(selectedPlayer.id);
    }
    
    return offspring;
  }

  /**
   * Mutation operation for genetic algorithm
   */
  private mutate(individual: Player[], allPlayers: Player[], mutationRate: number): Player[] {
    const mutated = [...individual];
    
    for (let i = 0; i < mutated.length; i++) {
      if (Math.random() < mutationRate) {
        const usedPlayers = new Set(mutated.map(p => p.id));
        usedPlayers.delete(mutated[i].id);
        
        const availablePlayers = allPlayers.filter(p => !usedPlayers.has(p.id));
        if (availablePlayers.length > 0) {
          const randomIndex = Math.floor(Math.random() * availablePlayers.length);
          mutated[i] = availablePlayers[randomIndex];
        }
      }
    }
    
    return mutated;
  }

  /**
   * Check if team is valid according to Dream11 rules
   */
  private isValidTeam(team: Player[]): boolean {
    if (team.length !== 11) return false;
    
    const roleCount = { WK: 0, BAT: 0, AR: 0, BWL: 0 };
    const teamCounts: Record<string, number> = {};
    let totalCredits = 0;
    
    for (const player of team) {
      const role = player.player_role || 'BAT';
      const playerTeam = player.team_name || 'Unknown';
      const credits = player.credits || 8;
      
      roleCount[role as keyof typeof roleCount] = (roleCount[role as keyof typeof roleCount] || 0) + 1;
      teamCounts[playerTeam] = (teamCounts[playerTeam] || 0) + 1;
      totalCredits += credits;
    }
    
    // Check role constraints
    if (roleCount.WK < 1 || roleCount.WK > 2) return false;
    if (roleCount.BAT < 3 || roleCount.BAT > 5) return false;
    if (roleCount.AR < 2 || roleCount.AR > 4) return false;
    if (roleCount.BWL < 3 || roleCount.BWL > 5) return false;
    
    // Check team constraints
    if (Object.values(teamCounts).some(count => count > 7)) return false;
    
    // Check budget constraint
    if (totalCredits > 100) return false;
    
    return true;
  }

  /**
   * Calculate expected points for a team
   */
  private calculateExpectedPoints(team: Player[], mlScores: MLPlayerScore[]): number {
    let totalPoints = 0;
    
    for (const player of team) {
      const mlScore = mlScores.find(score => score.playerId === player.id);
      if (mlScore) {
        totalPoints += mlScore.predictedPoints;
      } else {
        totalPoints += player.points || 0;
      }
    }
    
    return totalPoints;
  }

  /**
   * Calculate team risk score
   */
  private calculateTeamRisk(team: Player[], mlScores: MLPlayerScore[]): number {
    let totalRisk = 0;
    let count = 0;
    
    for (const player of team) {
      const mlScore = mlScores.find(score => score.playerId === player.id);
      if (mlScore) {
        totalRisk += mlScore.volatility;
        count++;
      }
    }
    
    return count > 0 ? totalRisk / count : 0.5;
  }

  /**
   * Calculate diversity score for a team
   */
  private calculateDiversityScore(team: Player[], mlScores: MLPlayerScore[]): number {
    const roleDistribution = { WK: 0, BAT: 0, AR: 0, BWL: 0 };
    const teamDistribution: Record<string, number> = {};
    const creditDistribution: number[] = [];
    
    for (const player of team) {
      const role = player.player_role || 'BAT';
      const playerTeam = player.team_name || 'Unknown';
      const credits = player.credits || 8;
      
      roleDistribution[role as keyof typeof roleDistribution]++;
      teamDistribution[playerTeam] = (teamDistribution[playerTeam] || 0) + 1;
      creditDistribution.push(credits);
    }
    
    // Calculate diversity metrics
    const roleEntropy = this.calculateEntropy(Object.values(roleDistribution));
    const teamEntropy = this.calculateEntropy(Object.values(teamDistribution));
    const creditVariance = this.calculateVariance(creditDistribution);
    
    // Normalize and combine
    const normalizedRoleEntropy = roleEntropy / Math.log(4); // Max entropy for 4 roles
    const normalizedTeamEntropy = teamEntropy / Math.log(2); // Max entropy for 2 teams
    const normalizedCreditVariance = Math.min(1, creditVariance / 10); // Normalize credit variance
    
    return (normalizedRoleEntropy + normalizedTeamEntropy + normalizedCreditVariance) / 3;
  }

  /**
   * Calculate team confidence score
   */
  private calculateTeamConfidence(team: Player[], mlScores: MLPlayerScore[]): number {
    let totalConfidence = 0;
    let count = 0;
    
    for (const player of team) {
      const mlScore = mlScores.find(score => score.playerId === player.id);
      if (mlScore) {
        totalConfidence += mlScore.confidence;
        count++;
      }
    }
    
    return count > 0 ? totalConfidence / count : 0.5;
  }

  /**
   * Generate optimization reasoning
   */
  private generateOptimizationReasoning(team: Player[], mlScores: MLPlayerScore[], method: string): string[] {
    const reasoning: string[] = [];
    
    const expectedPoints = this.calculateExpectedPoints(team, mlScores);
    const riskScore = this.calculateTeamRisk(team, mlScores);
    const diversityScore = this.calculateDiversityScore(team, mlScores);
    const confidenceScore = this.calculateTeamConfidence(team, mlScores);
    
    reasoning.push(`Optimized using ${method} approach`);
    reasoning.push(`Expected Points: ${expectedPoints.toFixed(1)}`);
    reasoning.push(`Risk Score: ${(riskScore * 100).toFixed(1)}%`);
    reasoning.push(`Diversity Score: ${(diversityScore * 100).toFixed(1)}%`);
    reasoning.push(`Confidence: ${(confidenceScore * 100).toFixed(1)}%`);
    
    // Add top performers
    const topPerformers = team
      .map(player => {
        const mlScore = mlScores.find(score => score.playerId === player.id);
        return { player, score: mlScore?.predictedPoints || player.points || 0 };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    
    reasoning.push(`Top picks: ${topPerformers.map(p => p.player.name).join(', ')}`);
    
    return reasoning;
  }

  /**
   * Calculate entropy for diversity measurement
   */
  private calculateEntropy(values: number[]): number {
    const total = values.reduce((sum, val) => sum + val, 0);
    if (total === 0) return 0;
    
    let entropy = 0;
    for (const value of values) {
      if (value > 0) {
        const probability = value / total;
        entropy -= probability * Math.log(probability);
      }
    }
    
    return entropy;
  }

  /**
   * Calculate variance for diversity measurement
   */
  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return variance;
  }

  /**
   * Evaluate fitness for genetic algorithm (legacy method)
   */
  private evaluateFitness(team: Player[], mlScores: MLPlayerScore[], riskProfile: string): number {
    return this.calculateTeamFitness(team, mlScores, { riskProfile });
  }

  /**
   * Mutation operation (legacy method)
   */
  private mutation(individual: Player[], allPlayers: Player[], mutationRate: number): Player[] {
    return this.mutate(individual, allPlayers, mutationRate);
  }

  // ...existing code...
}

export const mlOptimizationService = new MLOptimizationService();
