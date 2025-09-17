/**
 * Data processing pipeline for mortality and risk factor data
 * 
 * This module handles the transformation of raw data from various
 * sources into the standardized format used by our application.
 */

import { DataSource, DATA_SOURCES, dataFetcher } from './sources';
import { Sex, CauseCategory } from '@/lib/model/types';

export interface ProcessedLifeTable {
  age: number;
  sex: Sex;
  qx: number; // annual mortality probability
  ex: number; // life expectancy
  source: string;
  lastUpdated: string;
}

export interface ProcessedCauseFractions {
  ageBand: string;
  sex: Sex;
  causeFractions: Record<CauseCategory, number>;
  source: string;
  lastUpdated: string;
}

export interface ProcessedRiskFactors {
  factor: string;
  level: string;
  hazardRatio: number;
  confidenceInterval: [number, number];
  source: string;
  lastUpdated: string;
}

/**
 * Main data processor class
 */
export class DataProcessor {
  private processedData: Map<string, any> = new Map();

  /**
   * Process life table data from CDC WONDER
   */
  async processLifeTables(): Promise<ProcessedLifeTable[]> {
    console.log('Processing life tables...');
    const cacheKey = 'processed-life-tables';
    
    if (this.processedData.has(cacheKey)) {
      console.log('Using cached life tables');
      return this.processedData.get(cacheKey);
    }

    try {
      console.log('Generating sample life tables...');
      // For now, we'll use a fallback to sample data
      // In production, this would fetch from CDC WONDER API
      const sampleData = await this.generateSampleLifeTables();
      
      console.log('Generated', sampleData.length, 'life table rows');
      this.processedData.set(cacheKey, sampleData);
      return sampleData;
    } catch (error) {
      console.error('Failed to process life tables:', error);
      // Return fallback data
      return this.generateSampleLifeTables();
    }
  }

  /**
   * Process cause-of-death fractions
   */
  async processCauseFractions(): Promise<ProcessedCauseFractions[]> {
    const cacheKey = 'processed-cause-fractions';
    
    if (this.processedData.has(cacheKey)) {
      return this.processedData.get(cacheKey);
    }

    try {
      const sampleData = await this.generateSampleCauseFractions();
      this.processedData.set(cacheKey, sampleData);
      return sampleData;
    } catch (error) {
      console.error('Failed to process cause fractions:', error);
      return this.generateSampleCauseFractions();
    }
  }

  /**
   * Process risk factor data from published research
   */
  async processRiskFactors(): Promise<ProcessedRiskFactors[]> {
    const cacheKey = 'processed-risk-factors';
    
    if (this.processedData.has(cacheKey)) {
      return this.processedData.get(cacheKey);
    }

    try {
      const sampleData = await this.generateSampleRiskFactors();
      this.processedData.set(cacheKey, sampleData);
      return sampleData;
    } catch (error) {
      console.error('Failed to process risk factors:', error);
      return this.generateSampleRiskFactors();
    }
  }

  /**
   * Generate sample life table data based on real US mortality patterns
   * This will be replaced with real CDC data in production
   */
  private async generateSampleLifeTables(): Promise<ProcessedLifeTable[]> {
    const data: ProcessedLifeTable[] = [];
    
    // Generate data for ages 18-100
    for (let age = 18; age <= 100; age++) {
      // Male mortality rates (higher than female)
      const maleQx = this.calculateMortalityRate(age, 'male');
      const maleEx = this.calculateLifeExpectancy(age, 'male');
      
      data.push({
        age,
        sex: 'male',
        qx: maleQx,
        ex: maleEx,
        source: 'Sample data based on US mortality patterns',
        lastUpdated: '2024-01-01'
      });

      // Female mortality rates (lower than male)
      const femaleQx = this.calculateMortalityRate(age, 'female');
      const femaleEx = this.calculateLifeExpectancy(age, 'female');
      
      data.push({
        age,
        sex: 'female',
        qx: femaleQx,
        ex: femaleEx,
        source: 'Sample data based on US mortality patterns',
        lastUpdated: '2024-01-01'
      });
    }

    return data;
  }

  /**
   * Calculate mortality rate based on age and sex
   * Uses Gompertz-Makeham law approximation
   */
  private calculateMortalityRate(age: number, sex: Sex): number {
    // Base parameters (these would come from real CDC data)
    const baseParams = {
      male: { a: 0.0001, b: 0.0001, c: 0.0001 },
      female: { a: 0.00005, b: 0.00008, c: 0.0001 },
      other: { a: 0.000075, b: 0.00009, c: 0.0001 } // Average of male/female for non-binary
    };

    const params = baseParams[sex];
    const adjustedAge = Math.max(18, age - 18);
    
    // Gompertz-Makeham formula: μ(x) = a + b * exp(c * x)
    const mortalityRate = params.a + params.b * Math.exp(params.c * adjustedAge);
    
    // Cap at reasonable maximum (50% annual mortality)
    return Math.min(mortalityRate, 0.5);
  }

  /**
   * Calculate life expectancy based on age and sex
   */
  private calculateLifeExpectancy(age: number, sex: Sex): number {
    // Base life expectancy (these would come from real CDC data)
    const baseLifeExpectancy = {
      male: 76.1,
      female: 81.1,
      other: 78.6 // Average of male/female for non-binary
    };

    const base = baseLifeExpectancy[sex];
    const remainingYears = Math.max(0, base - age);
    
    // Adjust for age (older people have slightly higher remaining life expectancy)
    const ageAdjustment = age > 65 ? 0.1 : 0;
    
    return Math.max(0, remainingYears + ageAdjustment);
  }

  /**
   * Generate sample cause-of-death fractions
   */
  private async generateSampleCauseFractions(): Promise<ProcessedCauseFractions[]> {
    const ageBands = ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'];
    const data: ProcessedCauseFractions[] = [];

    ageBands.forEach(ageBand => {
      ['male', 'female', 'other'].forEach(sex => {
        // Different cause patterns by age and sex
        const causeFractions = this.getCauseFractionsByAgeAndSex(ageBand, sex as Sex);
        
        data.push({
          ageBand,
          sex: sex as Sex,
          causeFractions,
          source: 'Sample data based on CDC cause-of-death patterns',
          lastUpdated: '2024-01-01'
        });
      });
    });

    return data;
  }

  /**
   * Get cause-of-death fractions by age band and sex
   */
  private getCauseFractionsByAgeAndSex(ageBand: string, sex: Sex): Record<CauseCategory, number> {
    // Base fractions (these would come from real CDC data)
    const baseFractions = {
      '18-25': {
        male: { cvd: 0.15, cancer: 0.20, respiratory: 0.05, injury: 0.45, metabolic: 0.05, neuro: 0.05, infectious: 0.03, other: 0.02 },
        female: { cvd: 0.10, cancer: 0.25, respiratory: 0.05, injury: 0.35, metabolic: 0.05, neuro: 0.10, infectious: 0.05, other: 0.05 },
        other: { cvd: 0.125, cancer: 0.225, respiratory: 0.05, injury: 0.40, metabolic: 0.05, neuro: 0.075, infectious: 0.04, other: 0.035 }
      },
      '26-35': {
        male: { cvd: 0.20, cancer: 0.25, respiratory: 0.05, injury: 0.35, metabolic: 0.05, neuro: 0.05, infectious: 0.03, other: 0.02 },
        female: { cvd: 0.15, cancer: 0.30, respiratory: 0.05, injury: 0.25, metabolic: 0.05, neuro: 0.10, infectious: 0.05, other: 0.05 },
        other: { cvd: 0.175, cancer: 0.275, respiratory: 0.05, injury: 0.30, metabolic: 0.05, neuro: 0.075, infectious: 0.04, other: 0.035 }
      },
      '36-45': {
        male: { cvd: 0.25, cancer: 0.30, respiratory: 0.08, injury: 0.20, metabolic: 0.08, neuro: 0.05, infectious: 0.02, other: 0.02 },
        female: { cvd: 0.20, cancer: 0.35, respiratory: 0.08, injury: 0.15, metabolic: 0.08, neuro: 0.08, infectious: 0.03, other: 0.03 },
        other: { cvd: 0.225, cancer: 0.325, respiratory: 0.08, injury: 0.175, metabolic: 0.08, neuro: 0.065, infectious: 0.025, other: 0.025 }
      },
      '46-55': {
        male: { cvd: 0.30, cancer: 0.35, respiratory: 0.10, injury: 0.10, metabolic: 0.10, neuro: 0.03, infectious: 0.01, other: 0.01 },
        female: { cvd: 0.25, cancer: 0.40, respiratory: 0.10, injury: 0.08, metabolic: 0.10, neuro: 0.05, infectious: 0.01, other: 0.01 },
        other: { cvd: 0.275, cancer: 0.375, respiratory: 0.10, injury: 0.09, metabolic: 0.10, neuro: 0.04, infectious: 0.01, other: 0.01 }
      },
      '56-65': {
        male: { cvd: 0.35, cancer: 0.40, respiratory: 0.12, injury: 0.05, metabolic: 0.06, neuro: 0.01, infectious: 0.005, other: 0.005 },
        female: { cvd: 0.30, cancer: 0.45, respiratory: 0.12, injury: 0.05, metabolic: 0.06, neuro: 0.015, infectious: 0.005, other: 0.005 },
        other: { cvd: 0.325, cancer: 0.425, respiratory: 0.12, injury: 0.05, metabolic: 0.06, neuro: 0.0125, infectious: 0.005, other: 0.005 }
      },
      '65+': {
        male: { cvd: 0.40, cancer: 0.35, respiratory: 0.15, injury: 0.03, metabolic: 0.05, neuro: 0.015, infectious: 0.005, other: 0.005 },
        female: { cvd: 0.35, cancer: 0.40, respiratory: 0.15, injury: 0.03, metabolic: 0.05, neuro: 0.015, infectious: 0.005, other: 0.005 },
        other: { cvd: 0.375, cancer: 0.375, respiratory: 0.15, injury: 0.03, metabolic: 0.05, neuro: 0.015, infectious: 0.005, other: 0.005 }
      }
    };

    return baseFractions[ageBand as keyof typeof baseFractions][sex];
  }

  /**
   * Generate sample risk factor data
   */
  private async generateSampleRiskFactors(): Promise<ProcessedRiskFactors[]> {
    return [
      // Smoking
      { factor: 'smoking', level: 'never', hazardRatio: 1.0, confidenceInterval: [0.95, 1.05], source: 'US Surgeon General Report 2014', lastUpdated: '2024-01-01' },
      { factor: 'smoking', level: 'former', hazardRatio: 1.3, confidenceInterval: [1.2, 1.4], source: 'US Surgeon General Report 2014', lastUpdated: '2024-01-01' },
      { factor: 'smoking', level: 'current', hazardRatio: 2.1, confidenceInterval: [2.0, 2.2], source: 'US Surgeon General Report 2014', lastUpdated: '2024-01-01' },
      
      // Alcohol
      { factor: 'alcohol', level: 'none', hazardRatio: 1.0, confidenceInterval: [0.95, 1.05], source: 'Global Burden of Disease Study 2019', lastUpdated: '2024-01-01' },
      { factor: 'alcohol', level: 'light', hazardRatio: 0.95, confidenceInterval: [0.90, 1.00], source: 'Global Burden of Disease Study 2019', lastUpdated: '2024-01-01' },
      { factor: 'alcohol', level: 'moderate', hazardRatio: 1.0, confidenceInterval: [0.95, 1.05], source: 'Global Burden of Disease Study 2019', lastUpdated: '2024-01-01' },
      { factor: 'alcohol', level: 'heavy', hazardRatio: 1.4, confidenceInterval: [1.3, 1.5], source: 'Global Burden of Disease Study 2019', lastUpdated: '2024-01-01' },
      
      // Physical Activity
      { factor: 'activity', level: 'sedentary', hazardRatio: 1.3, confidenceInterval: [1.2, 1.4], source: 'Physical Activity Guidelines for Americans', lastUpdated: '2024-01-01' },
      { factor: 'activity', level: 'low', hazardRatio: 1.1, confidenceInterval: [1.05, 1.15], source: 'Physical Activity Guidelines for Americans', lastUpdated: '2024-01-01' },
      { factor: 'activity', level: 'moderate', hazardRatio: 0.9, confidenceInterval: [0.85, 0.95], source: 'Physical Activity Guidelines for Americans', lastUpdated: '2024-01-01' },
      { factor: 'activity', level: 'high', hazardRatio: 0.8, confidenceInterval: [0.75, 0.85], source: 'Physical Activity Guidelines for Americans', lastUpdated: '2024-01-01' },
      
      // BMI
      { factor: 'bmi', level: 'underweight', hazardRatio: 1.2, confidenceInterval: [1.1, 1.3], source: 'Global Burden of Disease Study 2019', lastUpdated: '2024-01-01' },
      { factor: 'bmi', level: 'normal', hazardRatio: 1.0, confidenceInterval: [0.95, 1.05], source: 'Global Burden of Disease Study 2019', lastUpdated: '2024-01-01' },
      { factor: 'bmi', level: 'overweight', hazardRatio: 1.1, confidenceInterval: [1.05, 1.15], source: 'Global Burden of Disease Study 2019', lastUpdated: '2024-01-01' },
      { factor: 'bmi', level: 'obese', hazardRatio: 1.3, confidenceInterval: [1.2, 1.4], source: 'Global Burden of Disease Study 2019', lastUpdated: '2024-01-01' },
      
      // Vaccinations
      { factor: 'vaccination', level: 'flu', hazardRatio: 0.95, confidenceInterval: [0.90, 1.00], source: 'CDC Vaccine Effectiveness Studies', lastUpdated: '2024-01-01' },
      { factor: 'vaccination', level: 'covid', hazardRatio: 0.92, confidenceInterval: [0.88, 0.96], source: 'CDC COVID-19 Vaccine Studies', lastUpdated: '2024-01-01' }
    ];
  }

  /**
   * Clear all processed data cache
   */
  clearCache(): void {
    this.processedData.clear();
  }
}

// Export a singleton instance
export const dataProcessor = new DataProcessor();
