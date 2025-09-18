/**
 * Intervention Simulation System
 * 
 * This module simulates the effects of risk factor changes on mortality risk
 * and provides recommendations for the top 3 habit changes by absolute risk reduction.
 * 
 * METHODOLOGY:
 * - Simulate deltas (quit smoking, -10 mmHg SBP, +2 METs CRF, -5% weight, etc.)
 * - Recompute absolute risk reduction by horizon and cause
 * - Use treatment-effect meta-analyses for changes where available
 * - Rank interventions by absolute risk reduction
 */

export interface Intervention {
  id: string;
  name: string;
  description: string;
  category: 'smoking' | 'blood-pressure' | 'fitness' | 'weight' | 'alcohol' | 'diet' | 'medication';
  delta: {
    smoking?: 'quit' | 'reduce';
    bloodPressure?: number; // mmHg change
    fitness?: number; // MET change
    weight?: number; // % change
    alcohol?: number; // drinks/week change
    diet?: 'improve' | 'deteriorate';
    medication?: string; // medication type
  };
  relativeRiskChange: number;
  absoluteRiskReduction: number;
  causeSpecificReduction: {[cause: string]: number};
  difficulty: 'easy' | 'medium' | 'hard';
  timeToEffect: string; // e.g., "immediate", "3 months", "1 year"
  evidence: string;
}

export interface InterventionResult {
  baselineRisk: number;
  adjustedRisk: number;
  absoluteRiskReduction: number;
  relativeRiskReduction: number;
  topInterventions: Intervention[];
  causeShifts: {[cause: string]: number};
  recommendations: string[];
}

export class InterventionSimulator {
  /**
   * Simulate a single intervention
   */
  simulateIntervention(
    baselineRisk: number,
    causeFractions: {[cause: string]: number},
    intervention: Intervention,
    age: number,
    sex: 'male' | 'female'
  ): InterventionResult {
    // Calculate new relative risk
    const newRelativeRisk = 1 + (intervention.relativeRiskChange - 1);
    const adjustedRisk = baselineRisk * newRelativeRisk;
    
    // Calculate absolute risk reduction
    const absoluteRiskReduction = baselineRisk - adjustedRisk;
    const relativeRiskReduction = (absoluteRiskReduction / baselineRisk) * 100;
    
    // Calculate cause-specific reductions
    const causeShifts: {[cause: string]: number} = {};
    Object.entries(causeFractions).forEach(([cause, fraction]) => {
      const causeSpecificReduction = absoluteRiskReduction * fraction;
      causeShifts[cause] = causeSpecificReduction;
    });
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(intervention, absoluteRiskReduction);
    
    return {
      baselineRisk,
      adjustedRisk,
      absoluteRiskReduction,
      relativeRiskReduction,
      topInterventions: [intervention],
      causeShifts,
      recommendations
    };
  }

  /**
   * Simulate multiple interventions and rank by absolute risk reduction
   */
  simulateMultipleInterventions(
    baselineRisk: number,
    causeFractions: {[cause: string]: number},
    age: number,
    sex: 'male' | 'female',
    currentRiskFactors: any
  ): InterventionResult {
    const interventions = this.getAvailableInterventions(age, sex, currentRiskFactors);
    const results: InterventionResult[] = [];
    
    // Simulate each intervention
    interventions.forEach(intervention => {
      const result = this.simulateIntervention(
        baselineRisk,
        causeFractions,
        intervention,
        age,
        sex
      );
      results.push(result);
    });
    
    // Sort by absolute risk reduction (descending)
    results.sort((a, b) => b.absoluteRiskReduction - a.absoluteRiskReduction);
    
    // Get top 3 interventions
    const topInterventions = results.slice(0, 3).map(r => r.topInterventions[0]);
    
    // Calculate combined effect of top 3 interventions
    const combinedRelativeRisk = topInterventions.reduce((acc, intervention) => {
      return acc * (1 + (intervention.relativeRiskChange - 1));
    }, 1);
    
    const combinedAdjustedRisk = baselineRisk * combinedRelativeRisk;
    const combinedAbsoluteRiskReduction = baselineRisk - combinedAdjustedRisk;
    
    // Calculate combined cause shifts
    const combinedCauseShifts: {[cause: string]: number} = {};
    Object.entries(causeFractions).forEach(([cause, fraction]) => {
      combinedCauseShifts[cause] = combinedAbsoluteRiskReduction * fraction;
    });
    
    // Generate combined recommendations
    const combinedRecommendations = this.generateCombinedRecommendations(topInterventions);
    
    return {
      baselineRisk,
      adjustedRisk: combinedAdjustedRisk,
      absoluteRiskReduction: combinedAbsoluteRiskReduction,
      relativeRiskReduction: (combinedAbsoluteRiskReduction / baselineRisk) * 100,
      topInterventions,
      causeShifts: combinedCauseShifts,
      recommendations: combinedRecommendations
    };
  }

  /**
   * Get available interventions based on age, sex, and current risk factors
   */
  private getAvailableInterventions(
    age: number,
    sex: 'male' | 'female',
    currentRiskFactors: any
  ): Intervention[] {
    const interventions: Intervention[] = [];
    
    // Smoking interventions
    if (currentRiskFactors.smoking === 'current') {
      interventions.push({
        id: 'quit-smoking',
        name: 'Quit Smoking',
        description: 'Stop smoking completely',
        category: 'smoking',
        delta: { smoking: 'quit' },
        relativeRiskChange: 0.5, // 50% reduction in risk
        absoluteRiskReduction: 0,
        causeSpecificReduction: {},
        difficulty: 'hard',
        timeToEffect: '1 year',
        evidence: 'Meta-analyses show 50% risk reduction within 1 year of quitting'
      });
    }
    
    // Blood pressure interventions
    if (currentRiskFactors.systolicBP > 120) {
      interventions.push({
        id: 'reduce-bp-10',
        name: 'Reduce Blood Pressure by 10 mmHg',
        description: 'Lower systolic blood pressure by 10 mmHg through lifestyle or medication',
        category: 'blood-pressure',
        delta: { bloodPressure: -10 },
        relativeRiskChange: 0.8, // 20% reduction in risk
        absoluteRiskReduction: 0,
        causeSpecificReduction: {},
        difficulty: 'medium',
        timeToEffect: '3 months',
        evidence: 'Every 20 mmHg SBP reduction halves vascular mortality risk'
      });
    }
    
    // Fitness interventions
    interventions.push({
      id: 'increase-fitness-2-met',
      name: 'Increase Fitness by 2 METs',
      description: 'Improve cardiorespiratory fitness by 2 METs through regular exercise',
      category: 'fitness',
      delta: { fitness: 2 },
      relativeRiskChange: 0.85, // 15% reduction in risk
      absoluteRiskReduction: 0,
      causeSpecificReduction: {},
      difficulty: 'medium',
      timeToEffect: '6 months',
      evidence: 'Each +1 MET in CRF linked to 10-20% lower all-cause mortality'
    });
    
    // Weight interventions
    if (currentRiskFactors.bmi > 25) {
      interventions.push({
        id: 'lose-weight-5-percent',
        name: 'Lose 5% of Body Weight',
        description: 'Reduce body weight by 5% through diet and exercise',
        category: 'weight',
        delta: { weight: -5 },
        relativeRiskChange: 0.9, // 10% reduction in risk
        absoluteRiskReduction: 0,
        causeSpecificReduction: {},
        difficulty: 'medium',
        timeToEffect: '6 months',
        evidence: '5% weight loss reduces diabetes risk by 50% and CVD risk by 10%'
      });
    }
    
    // Alcohol interventions
    if (currentRiskFactors.alcohol > 14) { // More than 14 drinks/week
      interventions.push({
        id: 'reduce-alcohol',
        name: 'Reduce Alcohol Consumption',
        description: 'Reduce alcohol consumption to moderate levels (≤14 drinks/week)',
        category: 'alcohol',
        delta: { alcohol: -7 }, // Reduce by 7 drinks/week
        relativeRiskChange: 0.95, // 5% reduction in risk
        absoluteRiskReduction: 0,
        causeSpecificReduction: {},
        difficulty: 'medium',
        timeToEffect: 'immediate',
        evidence: 'Moderate alcohol consumption reduces mortality risk compared to heavy drinking'
      });
    }
    
    // Diet interventions
    interventions.push({
      id: 'improve-diet',
      name: 'Improve Diet Quality',
      description: 'Adopt a Mediterranean-style diet with more fruits, vegetables, and whole grains',
      category: 'diet',
      delta: { diet: 'improve' },
      relativeRiskChange: 0.9, // 10% reduction in risk
      absoluteRiskReduction: 0,
      causeSpecificReduction: {},
      difficulty: 'medium',
      timeToEffect: '3 months',
      evidence: 'Mediterranean diet reduces cardiovascular mortality by 30%'
    });
    
    return interventions;
  }

  /**
   * Generate recommendations for a single intervention
   */
  private generateRecommendations(intervention: Intervention, absoluteRiskReduction: number): string[] {
    const recommendations: string[] = [];
    
    recommendations.push(`${intervention.name} could reduce your mortality risk by ${(absoluteRiskReduction * 100).toFixed(1)}%`);
    
    switch (intervention.category) {
      case 'smoking':
        recommendations.push('Consider nicotine replacement therapy or prescription medications');
        recommendations.push('Join a smoking cessation program for support');
        break;
      case 'blood-pressure':
        recommendations.push('Discuss blood pressure management with your healthcare provider');
        recommendations.push('Consider DASH diet and regular exercise');
        break;
      case 'fitness':
        recommendations.push('Start with 150 minutes of moderate exercise per week');
        recommendations.push('Consider working with a personal trainer or physical therapist');
        break;
      case 'weight':
        recommendations.push('Focus on sustainable lifestyle changes, not crash diets');
        recommendations.push('Consider working with a registered dietitian');
        break;
      case 'alcohol':
        recommendations.push('Set specific goals for alcohol reduction');
        recommendations.push('Consider alternative social activities that don\'t involve drinking');
        break;
      case 'diet':
        recommendations.push('Focus on whole foods, fruits, vegetables, and lean proteins');
        recommendations.push('Reduce processed foods, added sugars, and saturated fats');
        break;
    }
    
    return recommendations;
  }

  /**
   * Generate combined recommendations for multiple interventions
   */
  private generateCombinedRecommendations(interventions: Intervention[]): string[] {
    const recommendations: string[] = [];
    
    recommendations.push(`Implementing these ${interventions.length} changes could significantly reduce your mortality risk`);
    
    interventions.forEach((intervention, index) => {
      recommendations.push(`${index + 1}. ${intervention.name}: ${intervention.description}`);
    });
    
    recommendations.push('Start with the easiest changes and gradually add more challenging ones');
    recommendations.push('Consider working with healthcare providers for personalized guidance');
    
    return recommendations;
  }
}

export const interventionSimulator = new InterventionSimulator();
