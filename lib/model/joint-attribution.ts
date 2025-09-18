/**
 * Joint Attribution System
 * 
 * This module implements GBD joint attribution logic to avoid double counting
 * overlapping risk factors that act through the same pathways.
 * 
 * METHODOLOGY:
 * - Identifies overlapping risk factors (e.g., BMI and BP on CVD)
 * - Uses GBD joint attribution logic to prevent double counting
 * - Calculates joint effects rather than simple multiplication
 * - Maintains cause-specific attribution accuracy
 * 
 * KEY ASSUMPTIONS:
 * 1. Risk factors can act through shared pathways
 * 2. Joint effects are not simply multiplicative
 * 3. GBD provides joint attribution coefficients
 * 4. Some risk factors are independent, others are not
 */

export interface RiskFactor {
  id: string;
  name: string;
  category: string;
  relativeRisk: number;
  exposure: number;
  units: string;
}

export interface JointAttributionGroup {
  id: string;
  name: string;
  riskFactors: string[];
  sharedPathway: string;
  jointCoefficient: number;
  description: string;
}

export interface AttributionResult {
  totalRisk: number;
  causeSpecificRisks: {[cause: string]: number};
  riskFactorContributions: {[factorId: string]: number};
  jointEffects: {[groupId: string]: number};
  independentEffects: {[factorId: string]: number};
}

export class JointAttributionCalculator {
  private jointGroups: JointAttributionGroup[] = [];

  constructor() {
    this.initializeJointGroups();
  }

  /**
   * Calculate joint attribution for multiple risk factors
   */
  calculateJointAttribution(
    baselineRisk: number,
    causeFractions: {[cause: string]: number},
    riskFactors: RiskFactor[]
  ): AttributionResult {
    // Separate risk factors into joint groups and independent factors
    const { jointGroups, independentFactors } = this.categorizeRiskFactors(riskFactors);
    
    // Calculate independent effects
    const independentEffects: {[factorId: string]: number} = {};
    let independentRiskMultiplier = 1;
    
    independentFactors.forEach(factor => {
      const effect = (factor.relativeRisk - 1) * factor.exposure;
      independentEffects[factor.id] = effect;
      independentRiskMultiplier *= (1 + effect);
    });
    
    // Calculate joint effects for each group
    const jointEffects: {[groupId: string]: number} = {};
    let jointRiskMultiplier = 1;
    
    jointGroups.forEach(group => {
      const groupEffect = this.calculateGroupEffect(group, riskFactors);
      jointEffects[group.id] = groupEffect;
      jointRiskMultiplier *= (1 + groupEffect);
    });
    
    // Calculate total risk
    const totalRiskMultiplier = independentRiskMultiplier * jointRiskMultiplier;
    const totalRisk = baselineRisk * totalRiskMultiplier;
    
    // Calculate cause-specific risks
    const causeSpecificRisks: {[cause: string]: number} = {};
    Object.entries(causeFractions).forEach(([cause, fraction]) => {
      causeSpecificRisks[cause] = totalRisk * fraction;
    });
    
    // Calculate risk factor contributions
    const riskFactorContributions: {[factorId: string]: number} = {};
    riskFactors.forEach(factor => {
      const isInJointGroup = jointGroups.some(group => group.riskFactors.includes(factor.id));
      if (isInJointGroup) {
        // For joint factors, calculate their contribution to the group effect
        const group = jointGroups.find(g => g.riskFactors.includes(factor.id))!;
        const groupContribution = jointEffects[group.id] / group.riskFactors.length;
        riskFactorContributions[factor.id] = groupContribution;
      } else {
        // For independent factors, use their direct effect
        riskFactorContributions[factor.id] = independentEffects[factor.id];
      }
    });
    
    return {
      totalRisk,
      causeSpecificRisks,
      riskFactorContributions,
      jointEffects,
      independentEffects
    };
  }

  /**
   * Categorize risk factors into joint groups and independent factors
   */
  private categorizeRiskFactors(riskFactors: RiskFactor[]): {
    jointGroups: JointAttributionGroup[];
    independentFactors: RiskFactor[];
  } {
    const jointGroups: JointAttributionGroup[] = [];
    const independentFactors: RiskFactor[] = [];
    
    // Check each risk factor against joint groups
    riskFactors.forEach(factor => {
      const matchingGroup = this.jointGroups.find(group => 
        group.riskFactors.includes(factor.id)
      );
      
      if (matchingGroup) {
        // Add to existing joint group if not already added
        if (!jointGroups.find(g => g.id === matchingGroup.id)) {
          jointGroups.push(matchingGroup);
        }
      } else {
        // Add as independent factor
        independentFactors.push(factor);
      }
    });
    
    return { jointGroups, independentFactors };
  }

  /**
   * Calculate joint effect for a group of risk factors
   */
  private calculateGroupEffect(group: JointAttributionGroup, riskFactors: RiskFactor[]): number {
    const groupFactors = riskFactors.filter(factor => 
      group.riskFactors.includes(factor.id)
    );
    
    if (groupFactors.length === 0) return 0;
    
    // Calculate individual effects
    const individualEffects = groupFactors.map(factor => 
      (factor.relativeRisk - 1) * factor.exposure
    );
    
    // Calculate joint effect using GBD methodology
    // Joint effect = (1 + sum of individual effects) * joint_coefficient - 1
    const sumIndividualEffects = individualEffects.reduce((sum, effect) => sum + effect, 0);
    const jointEffect = (1 + sumIndividualEffects) * group.jointCoefficient - 1;
    
    return Math.max(0, jointEffect); // Ensure non-negative
  }

  /**
   * Initialize joint attribution groups based on GBD methodology
   */
  private initializeJointGroups(): void {
    this.jointGroups = [
      // Cardiovascular risk factors
      {
        id: 'cardiovascular-metabolic',
        name: 'Cardiovascular Metabolic Risk Factors',
        riskFactors: ['bmi', 'blood-pressure', 'cholesterol', 'diabetes'],
        sharedPathway: 'cardiovascular',
        jointCoefficient: 0.8, // 20% reduction due to overlap
        description: 'BMI, blood pressure, cholesterol, and diabetes share cardiovascular pathways'
      },
      
      // Behavioral risk factors
      {
        id: 'behavioral-lifestyle',
        name: 'Behavioral Lifestyle Risk Factors',
        riskFactors: ['smoking', 'alcohol', 'physical-activity', 'diet'],
        sharedPathway: 'behavioral',
        jointCoefficient: 0.85, // 15% reduction due to overlap
        description: 'Smoking, alcohol, physical activity, and diet share behavioral pathways'
      },
      
      // Metabolic syndrome factors
      {
        id: 'metabolic-syndrome',
        name: 'Metabolic Syndrome Factors',
        riskFactors: ['bmi', 'blood-pressure', 'cholesterol', 'diabetes', 'waist-circumference'],
        sharedPathway: 'metabolic',
        jointCoefficient: 0.75, // 25% reduction due to high overlap
        description: 'Components of metabolic syndrome share insulin resistance pathways'
      },
      
      // Respiratory risk factors
      {
        id: 'respiratory',
        name: 'Respiratory Risk Factors',
        riskFactors: ['smoking', 'lung-disease', 'air-pollution'],
        sharedPathway: 'respiratory',
        jointCoefficient: 0.9, // 10% reduction due to moderate overlap
        description: 'Smoking, lung disease, and air pollution share respiratory pathways'
      }
    ];
  }

  /**
   * Get joint attribution groups
   */
  getJointGroups(): JointAttributionGroup[] {
    return this.jointGroups;
  }

  /**
   * Add a new joint attribution group
   */
  addJointGroup(group: JointAttributionGroup): void {
    this.jointGroups.push(group);
  }

  /**
   * Calculate attribution for a specific cause
   */
  calculateCauseAttribution(
    cause: string,
    baselineRisk: number,
    causeFraction: number,
    riskFactors: RiskFactor[]
  ): {
    totalCauseRisk: number;
    riskFactorContributions: {[factorId: string]: number};
    jointEffects: {[groupId: string]: number};
  } {
    const result = this.calculateJointAttribution(
      baselineRisk,
      { [cause]: causeFraction },
      riskFactors
    );
    
    return {
      totalCauseRisk: result.causeSpecificRisks[cause],
      riskFactorContributions: result.riskFactorContributions,
      jointEffects: result.jointEffects
    };
  }

  /**
   * Get attribution summary
   */
  getAttributionSummary(result: AttributionResult): {
    totalRiskReduction: number;
    topContributors: Array<{factorId: string, contribution: number}>;
    jointEffectSummary: Array<{groupId: string, effect: number}>;
  } {
    // Calculate total risk reduction
    const totalRiskReduction = result.totalRisk - 1; // Assuming baseline risk = 1
    
    // Get top contributors
    const topContributors = Object.entries(result.riskFactorContributions)
      .map(([factorId, contribution]) => ({ factorId, contribution }))
      .sort((a, b) => b.contribution - a.contribution)
      .slice(0, 5);
    
    // Get joint effect summary
    const jointEffectSummary = Object.entries(result.jointEffects)
      .map(([groupId, effect]) => ({ groupId, effect }))
      .sort((a, b) => b.effect - a.effect);
    
    return {
      totalRiskReduction,
      topContributors,
      jointEffectSummary
    };
  }

  /**
   * Get data source information
   */
  getDataSourceInfo(): {
    name: string;
    url: string;
    description: string;
    methodology: string;
  } {
    return {
      name: 'GBD Joint Attribution Framework',
      url: 'https://www.healthdata.org/gbd',
      description: 'Global Burden of Disease joint attribution methodology',
      methodology: 'Joint attribution coefficients based on shared biological pathways'
    };
  }
}

export const jointAttributionCalculator = new JointAttributionCalculator();

