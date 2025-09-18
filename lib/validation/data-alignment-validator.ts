/**
 * Data Alignment Validator
 * 
 * This module ensures our calculations stay aligned with actual data sources
 * and detects when our models drift from real-world data.
 */

import { transparencyDB } from '../data/transparency-database';

export interface ValidationResult {
  isValid: boolean;
  score: number; // 0-100, where 100 is perfect alignment
  issues: ValidationIssue[];
  recommendations: string[];
  lastChecked: string;
  nextCheck: string;
}

export interface ValidationIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'data-drift' | 'calculation-error' | 'parameter-mismatch' | 'source-unavailable';
  description: string;
  affectedMetric: string;
  expectedValue?: number;
  actualValue?: number;
  tolerance?: number;
  fix?: string;
}

export interface DataSnapshot {
  timestamp: string;
  source: string;
  dataHash: string;
  keyMetrics: {
    [key: string]: number;
  };
  sampleData: {
    [key: string]: any;
  };
}

export class DataAlignmentValidator {
  private validationHistory: ValidationResult[] = [];
  private dataSnapshots: DataSnapshot[] = [];

  /**
   * Validate alignment between our calculations and source data
   */
  async validateAlignment(): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];
    let totalScore = 100;

    // 1. Validate SSA Life Table Alignment
    const ssaValidation = await this.validateSSAAlignment();
    issues.push(...ssaValidation.issues);
    totalScore -= ssaValidation.scoreDeduction;

    // 2. Validate CDC Cause Data Alignment
    const cdcValidation = await this.validateCDCAlignment();
    issues.push(...cdcValidation.issues);
    totalScore -= cdcValidation.scoreDeduction;

    // 3. Validate GBD Risk Factor Alignment
    const gbdValidation = await this.validateGBDAlignment();
    issues.push(...gbdValidation.issues);
    totalScore -= gbdValidation.scoreDeduction;

    // 4. Validate Mathematical Model Parameters
    const modelValidation = await this.validateModelParameters();
    issues.push(...modelValidation.issues);
    totalScore -= modelValidation.scoreDeduction;

    // 5. Validate Data Freshness
    const freshnessValidation = await this.validateDataFreshness();
    issues.push(...freshnessValidation.issues);
    totalScore -= freshnessValidation.scoreDeduction;

    const result: ValidationResult = {
      isValid: issues.filter(i => i.severity === 'critical' || i.severity === 'high').length === 0,
      score: Math.max(0, totalScore),
      issues,
      recommendations: this.generateRecommendations(issues),
      lastChecked: new Date().toISOString(),
      nextCheck: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };

    this.validationHistory.push(result);
    return result;
  }

  /**
   * Validate SSA Life Table alignment
   */
  private async validateSSAAlignment(): Promise<{ issues: ValidationIssue[], scoreDeduction: number }> {
    const issues: ValidationIssue[] = [];
    let scoreDeduction = 0;

    try {
      // Check if we can access SSA data
      const ssaSource = transparencyDB.getDataSource('ssa-life-tables');
      if (!ssaSource) {
        issues.push({
          severity: 'critical',
          category: 'source-unavailable',
          description: 'SSA data source not found in transparency database',
          affectedMetric: 'life-expectancy',
          fix: 'Add SSA data source to transparency database'
        });
        scoreDeduction += 30;
        return { issues, scoreDeduction };
      }

      // Validate data freshness
      const lastUpdated = new Date(ssaSource.lastUpdated);
      const monthsSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24 * 30);
      
      if (monthsSinceUpdate > 12) {
        issues.push({
          severity: 'high',
          category: 'data-drift',
          description: `SSA data is ${monthsSinceUpdate.toFixed(1)} months old`,
          affectedMetric: 'life-expectancy',
          expectedValue: 12,
          actualValue: monthsSinceUpdate,
          fix: 'Update SSA data source or check for newer data'
        });
        scoreDeduction += 15;
      }

      // Validate key mortality rates against expected ranges
      const expectedMortalityRates = {
        'age-30-male': { min: 0.0005, max: 0.002 },
        'age-50-male': { min: 0.005, max: 0.015 },
        'age-70-male': { min: 0.02, max: 0.05 },
        'age-30-female': { min: 0.0003, max: 0.0015 },
        'age-50-female': { min: 0.003, max: 0.01 },
        'age-70-female': { min: 0.015, max: 0.035 }
      };

      // This would be implemented with actual data fetching
      // For now, we'll simulate the validation
      for (const [ageSex, range] of Object.entries(expectedMortalityRates)) {
        // In real implementation, we'd fetch actual data and compare
        const simulatedRate = this.simulateMortalityRate(ageSex);
        
        if (simulatedRate < range.min || simulatedRate > range.max) {
          issues.push({
            severity: 'medium',
            category: 'calculation-error',
            description: `Mortality rate for ${ageSex} (${simulatedRate.toFixed(6)}) outside expected range`,
            affectedMetric: 'life-expectancy',
            expectedValue: (range.min + range.max) / 2,
            actualValue: simulatedRate,
            tolerance: (range.max - range.min) / 2,
            fix: 'Check mortality rate calculation parameters'
          });
          scoreDeduction += 5;
        }
      }

    } catch (error) {
      issues.push({
        severity: 'high',
        category: 'source-unavailable',
        description: `Error validating SSA data: ${error}`,
        affectedMetric: 'life-expectancy',
        fix: 'Check SSA data source availability and format'
      });
      scoreDeduction += 20;
    }

    return { issues, scoreDeduction };
  }

  /**
   * Validate CDC Cause Data alignment
   */
  private async validateCDCAlignment(): Promise<{ issues: ValidationIssue[], scoreDeduction: number }> {
    const issues: ValidationIssue[] = [];
    let scoreDeduction = 0;

    try {
      const cdcSource = transparencyDB.getDataSource('cdc-wonder');
      if (!cdcSource) {
        issues.push({
          severity: 'critical',
          category: 'source-unavailable',
          description: 'CDC data source not found in transparency database',
          affectedMetric: 'cause-breakdown',
          fix: 'Add CDC data source to transparency database'
        });
        scoreDeduction += 30;
        return { issues, scoreDeduction };
      }

      // Validate cause fraction totals (should sum to ~1.0)
      const expectedCauseFractions = {
        'heart-disease': { min: 0.20, max: 0.30 },
        'cancer': { min: 0.20, max: 0.30 },
        'accidents': { min: 0.05, max: 0.10 },
        'stroke': { min: 0.05, max: 0.10 },
        'respiratory': { min: 0.05, max: 0.10 }
      };

      let totalFraction = 0;
      for (const [cause, range] of Object.entries(expectedCauseFractions)) {
        const simulatedFraction = this.simulateCauseFraction(cause);
        totalFraction += simulatedFraction;
        
        if (simulatedFraction < range.min || simulatedFraction > range.max) {
          issues.push({
            severity: 'medium',
            category: 'calculation-error',
            description: `Cause fraction for ${cause} (${simulatedFraction.toFixed(3)}) outside expected range`,
            affectedMetric: 'cause-breakdown',
            expectedValue: (range.min + range.max) / 2,
            actualValue: simulatedFraction,
            tolerance: (range.max - range.min) / 2,
            fix: 'Check cause fraction calculation and data source'
          });
          scoreDeduction += 3;
        }
      }

      // Check if total fractions sum to approximately 1.0
      if (Math.abs(totalFraction - 1.0) > 0.1) {
        issues.push({
          severity: 'high',
          category: 'calculation-error',
          description: `Total cause fractions sum to ${totalFraction.toFixed(3)}, expected ~1.0`,
          affectedMetric: 'cause-breakdown',
          expectedValue: 1.0,
          actualValue: totalFraction,
          tolerance: 0.1,
          fix: 'Check cause fraction normalization'
        });
        scoreDeduction += 10;
      }

    } catch (error) {
      issues.push({
        severity: 'high',
        category: 'source-unavailable',
        description: `Error validating CDC data: ${error}`,
        affectedMetric: 'cause-breakdown',
        fix: 'Check CDC data source availability and format'
      });
      scoreDeduction += 20;
    }

    return { issues, scoreDeduction };
  }

  /**
   * Validate GBD Risk Factor alignment
   */
  private async validateGBDAlignment(): Promise<{ issues: ValidationIssue[], scoreDeduction: number }> {
    const issues: ValidationIssue[] = [];
    let scoreDeduction = 0;

    try {
      const gbdSource = transparencyDB.getDataSource('gbd-risk-factors');
      if (!gbdSource) {
        issues.push({
          severity: 'critical',
          category: 'source-unavailable',
          description: 'GBD data source not found in transparency database',
          affectedMetric: 'one-year-risk',
          fix: 'Add GBD data source to transparency database'
        });
        scoreDeduction += 30;
        return { issues, scoreDeduction };
      }

      // Validate relative risk ranges
      const expectedRelativeRisks = {
        'smoking-current': { min: 1.5, max: 3.0 },
        'smoking-former': { min: 1.1, max: 1.5 },
        'blood-pressure-high': { min: 1.3, max: 2.0 },
        'bmi-obese': { min: 1.2, max: 1.8 },
        'physical-inactivity': { min: 1.1, max: 1.4 }
      };

      for (const [factor, range] of Object.entries(expectedRelativeRisks)) {
        const simulatedRR = this.simulateRelativeRisk(factor);
        
        if (simulatedRR < range.min || simulatedRR > range.max) {
          issues.push({
            severity: 'medium',
            category: 'parameter-mismatch',
            description: `Relative risk for ${factor} (${simulatedRR.toFixed(2)}) outside expected range`,
            affectedMetric: 'one-year-risk',
            expectedValue: (range.min + range.max) / 2,
            actualValue: simulatedRR,
            tolerance: (range.max - range.min) / 2,
            fix: 'Check GBD risk factor parameters and data source'
          });
          scoreDeduction += 5;
        }
      }

    } catch (error) {
      issues.push({
        severity: 'high',
        category: 'source-unavailable',
        description: `Error validating GBD data: ${error}`,
        affectedMetric: 'one-year-risk',
        fix: 'Check GBD data source availability and format'
      });
      scoreDeduction += 20;
    }

    return { issues, scoreDeduction };
  }

  /**
   * Validate mathematical model parameters
   */
  private async validateModelParameters(): Promise<{ issues: ValidationIssue[], scoreDeduction: number }> {
    const issues: ValidationIssue[] = [];
    let scoreDeduction = 0;

    try {
      const gompertzMethod = transparencyDB.getCalculationMethod('gompertz-makeham');
      if (!gompertzMethod) {
        issues.push({
          severity: 'critical',
          category: 'parameter-mismatch',
          description: 'Gompertz-Makeham method not found in transparency database',
          affectedMetric: 'life-expectancy',
          fix: 'Add Gompertz-Makeham method to transparency database'
        });
        scoreDeduction += 30;
        return { issues, scoreDeduction };
      }

      // Validate parameter ranges
      const expectedParameters = {
        'a-male': { min: 0.00005, max: 0.0002 },
        'b-male': { min: 0.000005, max: 0.00002 },
        'c-male': { min: 0.08, max: 0.12 },
        'a-female': { min: 0.00003, max: 0.0001 },
        'b-female': { min: 0.000003, max: 0.00001 },
        'c-female': { min: 0.08, max: 0.12 }
      };

      for (const [param, range] of Object.entries(expectedParameters)) {
        const simulatedParam = this.simulateGompertzParameter(param);
        
        if (simulatedParam < range.min || simulatedParam > range.max) {
          issues.push({
            severity: 'high',
            category: 'parameter-mismatch',
            description: `Gompertz parameter ${param} (${simulatedParam.toFixed(6)}) outside expected range`,
            affectedMetric: 'life-expectancy',
            expectedValue: (range.min + range.max) / 2,
            actualValue: simulatedParam,
            tolerance: (range.max - range.min) / 2,
            fix: 'Check Gompertz-Makeham parameter estimation'
          });
          scoreDeduction += 8;
        }
      }

    } catch (error) {
      issues.push({
        severity: 'high',
        category: 'parameter-mismatch',
        description: `Error validating model parameters: ${error}`,
        affectedMetric: 'life-expectancy',
        fix: 'Check mathematical model parameter validation'
      });
      scoreDeduction += 15;
    }

    return { issues, scoreDeduction };
  }

  /**
   * Validate data freshness
   */
  private async validateDataFreshness(): Promise<{ issues: ValidationIssue[], scoreDeduction: number }> {
    const issues: ValidationIssue[] = [];
    let scoreDeduction = 0;

    const sources = transparencyDB.getAllDataSources();
    const now = new Date();

    for (const source of sources) {
      const lastUpdated = new Date(source.lastUpdated);
      const monthsSinceUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24 * 30);
      
      let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
      let deduction = 0;

      if (monthsSinceUpdate > 24) {
        severity = 'critical';
        deduction = 20;
      } else if (monthsSinceUpdate > 12) {
        severity = 'high';
        deduction = 10;
      } else if (monthsSinceUpdate > 6) {
        severity = 'medium';
        deduction = 5;
      }

      if (deduction > 0) {
        issues.push({
          severity,
          category: 'data-drift',
          description: `${source.name} data is ${monthsSinceUpdate.toFixed(1)} months old`,
          affectedMetric: 'all',
          expectedValue: 6,
          actualValue: monthsSinceUpdate,
          fix: `Check for updated ${source.name} data`
        });
        scoreDeduction += deduction;
      }
    }

    return { issues, scoreDeduction };
  }

  /**
   * Generate recommendations based on validation issues
   */
  private generateRecommendations(issues: ValidationIssue[]): string[] {
    const recommendations: string[] = [];
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    const highIssues = issues.filter(i => i.severity === 'high');

    if (criticalIssues.length > 0) {
      recommendations.push('🚨 CRITICAL: Address critical data alignment issues immediately');
    }

    if (highIssues.length > 0) {
      recommendations.push('⚠️ HIGH: Review and fix high-priority alignment issues');
    }

    if (issues.some(i => i.category === 'data-drift')) {
      recommendations.push('📊 Update data sources to latest versions');
    }

    if (issues.some(i => i.category === 'parameter-mismatch')) {
      recommendations.push('🔧 Recalibrate mathematical model parameters');
    }

    if (issues.some(i => i.category === 'source-unavailable')) {
      recommendations.push('🔗 Check data source availability and connectivity');
    }

    if (issues.some(i => i.category === 'calculation-error')) {
      recommendations.push('🧮 Review calculation logic and validation');
    }

    return recommendations;
  }

  // Simulation methods (in real implementation, these would fetch actual data)
  private simulateMortalityRate(ageSex: string): number {
    // This would be replaced with actual data fetching
    const baseRates: { [key: string]: number } = {
      'age-30-male': 0.001,
      'age-50-male': 0.008,
      'age-70-male': 0.03,
      'age-30-female': 0.0008,
      'age-50-female': 0.005,
      'age-70-female': 0.02
    };
    return baseRates[ageSex] || 0.01;
  }

  private simulateCauseFraction(cause: string): number {
    const fractions: { [key: string]: number } = {
      'heart-disease': 0.25,
      'cancer': 0.22,
      'accidents': 0.07,
      'stroke': 0.06,
      'respiratory': 0.06
    };
    return fractions[cause] || 0.1;
  }

  private simulateRelativeRisk(factor: string): number {
    const risks: { [key: string]: number } = {
      'smoking-current': 2.2,
      'smoking-former': 1.3,
      'blood-pressure-high': 1.6,
      'bmi-obese': 1.4,
      'physical-inactivity': 1.2
    };
    return risks[factor] || 1.0;
  }

  private simulateGompertzParameter(param: string): number {
    const params: { [key: string]: number } = {
      'a-male': 0.0001,
      'b-male': 0.00001,
      'c-male': 0.1,
      'a-female': 0.00005,
      'b-female': 0.000005,
      'c-female': 0.1
    };
    return params[param] || 0.0001;
  }

  /**
   * Get validation history
   */
  getValidationHistory(): ValidationResult[] {
    return this.validationHistory;
  }

  /**
   * Get latest validation result
   */
  getLatestValidation(): ValidationResult | null {
    return this.validationHistory.length > 0 ? this.validationHistory[this.validationHistory.length - 1] : null;
  }

  /**
   * Schedule automatic validation
   */
  scheduleValidation(intervalHours: number = 24): void {
    setInterval(async () => {
      console.log('Running scheduled data alignment validation...');
      const result = await this.validateAlignment();
      console.log(`Validation complete. Score: ${result.score}/100, Issues: ${result.issues.length}`);
    }, intervalHours * 60 * 60 * 1000);
  }
}

export const dataAlignmentValidator = new DataAlignmentValidator();
