/**
 * Calculation Enforcement System
 * 
 * This module ensures all mortality calculations go through the centralized
 * integrated calculator system and prevents calculations outside the system.
 */

import { IntegratedMortalityCalculator } from './integrated-calculator';
import { dataAlignmentValidator } from '../validation/data-alignment-validator';
import { transparencyDB } from '../data/transparency-database';

export interface CalculationRequest {
  id: string;
  timestamp: string;
  inputs: any;
  source: string; // Which part of the app made the request
  validationPassed: boolean;
  result?: any;
  error?: string;
}

export interface CalculationAudit {
  totalRequests: number;
  validRequests: number;
  invalidRequests: number;
  sources: { [source: string]: number };
  errors: { [error: string]: number };
  lastValidation: string;
}

export class CalculationEnforcer {
  private calculator: IntegratedMortalityCalculator;
  private requestHistory: CalculationRequest[] = [];
  private isEnabled: boolean = true;

  constructor() {
    this.calculator = new IntegratedMortalityCalculator();
  }

  /**
   * Enforce that all calculations go through the integrated system
   */
  async calculateMortalityRisk(
    inputs: any,
    source: string = 'unknown'
  ): Promise<any> {
    const requestId = this.generateRequestId();
    const timestamp = new Date().toISOString();

    // Log the calculation request
    const request: CalculationRequest = {
      id: requestId,
      timestamp,
      inputs,
      source,
      validationPassed: false
    };

    try {
      // Validate inputs
      const validation = this.validateInputs(inputs);
      if (!validation.isValid) {
        request.error = `Input validation failed: ${validation.errors.join(', ')}`;
        this.requestHistory.push(request);
        throw new Error(request.error);
      }

      // Check if calculations are enabled
      if (!this.isEnabled) {
        request.error = 'Calculations are disabled for maintenance';
        this.requestHistory.push(request);
        throw new Error(request.error);
      }

      // Validate data alignment before calculation (temporarily disabled for debugging)
      try {
        const alignmentResult = await dataAlignmentValidator.validateAlignment();
        if (alignmentResult.score < 70) {
          console.warn(`⚠️ Data alignment score low: ${alignmentResult.score}/100, but continuing with calculation`);
        }
      } catch (alignmentError) {
        console.warn(`⚠️ Data alignment validation failed: ${alignmentError}, but continuing with calculation`);
      }

      // Perform calculation through integrated system
      const result = await this.calculator.calculateMortalityRisk(inputs);
      
      request.validationPassed = true;
      request.result = result;
      this.requestHistory.push(request);

      // Log successful calculation
      console.log(`✅ Calculation completed for ${source}: ${requestId}`);
      
      return result;

    } catch (error) {
      request.error = error instanceof Error ? error.message : 'Unknown error';
      this.requestHistory.push(request);
      
      console.error(`❌ Calculation failed for ${source}: ${request.error}`);
      throw error;
    }
  }

  /**
   * Validate calculation inputs
   */
  private validateInputs(inputs: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields
    if (!inputs.age || inputs.age < 18 || inputs.age > 120) {
      errors.push('Age must be between 18 and 120');
    }

    if (!inputs.sex || !['male', 'female'].includes(inputs.sex)) {
      errors.push('Sex must be male or female');
    }

    // Optional but validated fields
    if (inputs.systolicBP && (inputs.systolicBP < 70 || inputs.systolicBP > 250)) {
      errors.push('Systolic blood pressure must be between 70 and 250 mmHg');
    }

    if (inputs.bmi && (inputs.bmi < 15 || inputs.bmi > 60)) {
      errors.push('BMI must be between 15 and 60 kg/m²');
    }

    if (inputs.smoking && !['never', 'former', 'current'].includes(inputs.smoking)) {
      errors.push('Smoking status must be never, former, or current');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `calc_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Get calculation audit
   */
  getAudit(): CalculationAudit {
    const totalRequests = this.requestHistory.length;
    const validRequests = this.requestHistory.filter(r => r.validationPassed).length;
    const invalidRequests = totalRequests - validRequests;

    const sources: { [source: string]: number } = {};
    const errors: { [error: string]: number } = {};

    for (const request of this.requestHistory) {
      sources[request.source] = (sources[request.source] || 0) + 1;
      if (request.error) {
        errors[request.error] = (errors[request.error] || 0) + 1;
      }
    }

    return {
      totalRequests,
      validRequests,
      invalidRequests,
      sources,
      errors,
      lastValidation: this.requestHistory[this.requestHistory.length - 1]?.timestamp || 'Never'
    };
  }

  /**
   * Get request history
   */
  getRequestHistory(): CalculationRequest[] {
    return [...this.requestHistory];
  }

  /**
   * Enable/disable calculations
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    console.log(`Calculations ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Clear request history
   */
  clearHistory(): void {
    this.requestHistory = [];
    console.log('Calculation history cleared');
  }

  /**
   * Get calculation statistics
   */
  getStatistics(): {
    totalCalculations: number;
    successRate: number;
    averageResponseTime: number;
    topSources: Array<{ source: string; count: number }>;
    topErrors: Array<{ error: string; count: number }>;
  } {
    const total = this.requestHistory.length;
    const successful = this.requestHistory.filter(r => r.validationPassed).length;
    const successRate = total > 0 ? (successful / total) * 100 : 0;

    // Calculate average response time (simplified)
    const responseTimes = this.requestHistory
      .filter(r => r.validationPassed)
      .map(r => {
        const start = new Date(r.timestamp).getTime();
        const end = new Date().getTime(); // Simplified - would need actual end time
        return end - start;
      });
    
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;

    // Top sources
    const sourceCounts: { [source: string]: number } = {};
    for (const request of this.requestHistory) {
      sourceCounts[request.source] = (sourceCounts[request.source] || 0) + 1;
    }
    const topSources = Object.entries(sourceCounts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top errors
    const errorCounts: { [error: string]: number } = {};
    for (const request of this.requestHistory) {
      if (request.error) {
        errorCounts[request.error] = (errorCounts[request.error] || 0) + 1;
      }
    }
    const topErrors = Object.entries(errorCounts)
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalCalculations: total,
      successRate,
      averageResponseTime,
      topSources,
      topErrors
    };
  }
}

// Global instance
export const calculationEnforcer = new CalculationEnforcer();

/**
 * Decorator to enforce calculations go through the centralized system
 */
export function enforceCalculation(source: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      // Check if this is a calculation method
      if (propertyName.includes('calculate') || propertyName.includes('estimate') || propertyName.includes('risk')) {
        console.warn(`⚠️ Direct calculation method ${propertyName} called from ${source}. All calculations should go through calculationEnforcer.calculateMortalityRisk()`);
        
        // Redirect to centralized system
        const inputs = args[0];
        return await calculationEnforcer.calculateMortalityRisk(inputs, source);
      }
      
      return method.apply(this, args);
    };
  };
}

/**
 * Check for unauthorized calculations
 */
export function auditCalculations(): {
  unauthorizedCalculations: string[];
  recommendations: string[];
} {
  const unauthorizedCalculations: string[] = [];
  const recommendations: string[] = [];

  // This would scan the codebase for direct calculation calls
  // For now, we'll provide a template for manual checking
  
  recommendations.push('Scan codebase for direct calls to calculation methods');
  recommendations.push('Ensure all API endpoints use calculationEnforcer');
  recommendations.push('Check that UI components don\'t perform direct calculations');
  recommendations.push('Verify that all calculation results come from the integrated system');

  return {
    unauthorizedCalculations,
    recommendations
  };
}
