/**
 * Real data loader that integrates with the data processing pipeline
 * 
 * This module provides the same interface as the original loader
 * but uses real data sources and the data processing pipeline.
 */

import { Sex, CauseCategory, MortalityTableRow, CauseFraction, HRPrior } from '@/lib/model/types';
import { dataProcessor, ProcessedLifeTable, ProcessedCauseFractions, ProcessedRiskFactors } from './processor';

/**
 * Load real life table data from the data processor
 */
export async function loadRealLifeTable(): Promise<{
  data: MortalityTableRow[];
  version: string;
  loadedAt: Date;
  isValid: boolean;
  errors?: string[];
}> {
  try {
    const processedData = await dataProcessor.processLifeTables();
    
    // Convert processed data to the expected format
    const mortalityRows: MortalityTableRow[] = processedData.map(row => ({
      age: row.age,
      sex: row.sex,
      qx: row.qx,
      ex: row.ex,
      source: row.source,
      lastUpdated: row.lastUpdated
    }));

    return {
      data: mortalityRows,
      version: '2025-01-real',
      loadedAt: new Date(),
      isValid: true,
    };
  } catch (error) {
    console.error('Failed to load real life table data:', error);
    return {
      data: [],
      version: '2025-01-real',
      loadedAt: new Date(),
      isValid: false,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}

/**
 * Load real cause fraction data from the data processor
 */
export async function loadRealCauseFractions(): Promise<{
  data: CauseFraction[];
  version: string;
  loadedAt: Date;
  isValid: boolean;
  errors?: string[];
}> {
  try {
    const processedData = await dataProcessor.processCauseFractions();
    
    // Convert processed data to the expected format
    const causeFractions: CauseFraction[] = processedData.flatMap(row => 
      Object.entries(row.causeFractions).map(([cause, fraction]) => ({
        ageBand: row.ageBand,
        sex: row.sex,
        cause: cause as CauseCategory,
        fraction,
        source: row.source,
        lastUpdated: row.lastUpdated
      }))
    );

    return {
      data: causeFractions,
      version: '2025-01-real',
      loadedAt: new Date(),
      isValid: true,
    };
  } catch (error) {
    console.error('Failed to load real cause fractions data:', error);
    return {
      data: [],
      version: '2025-01-real',
      loadedAt: new Date(),
      isValid: false,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}

/**
 * Load real risk factor data from the data processor
 */
export async function loadRealHRPriors(): Promise<{
  data: HRPrior[];
  version: string;
  loadedAt: Date;
  isValid: boolean;
  errors?: string[];
}> {
  try {
    const processedData = await dataProcessor.processRiskFactors();
    
    // Convert processed data to the expected format
    const hrPriors: HRPrior[] = processedData.map(row => ({
      factor: row.factor,
      level: row.level,
      hrCentral: row.hazardRatio,
      logSd: Math.log(row.confidenceInterval[1] / row.hazardRatio) / 1.96, // Convert CI to log-normal SD
      source: row.source
    }));

    return {
      data: hrPriors,
      version: '2025-01-real',
      loadedAt: new Date(),
      isValid: true,
    };
  } catch (error) {
    console.error('Failed to load real HR priors data:', error);
    return {
      data: [],
      version: '2025-01-real',
      loadedAt: new Date(),
      isValid: false,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}

/**
 * Get baseline mortality data for a specific age and sex
 */
export async function getRealBaselineMortality(age: number, sex: Sex): Promise<MortalityTableRow> {
  const lifeTable = await loadRealLifeTable();
  if (!lifeTable.isValid) {
    throw new Error('Invalid life table data');
  }

  const row = lifeTable.data.find(r => r.age === age && r.sex === sex);
  if (!row) {
    throw new Error(`No mortality data found for age ${age}, sex ${sex}`);
  }

  return row;
}

/**
 * Get cause fractions for a specific age band and sex
 */
export async function getRealCauseFractions(ageBand: string, sex: Sex): Promise<CauseFraction[]> {
  const causeFractions = await loadRealCauseFractions();
  if (!causeFractions.isValid) {
    throw new Error('Invalid cause fractions data');
  }

  return causeFractions.data.filter(f => f.ageBand === ageBand && f.sex === sex);
}

/**
 * Get hazard ratio priors for a specific factor
 */
export async function getRealHRPriors(factor: string): Promise<HRPrior[]> {
  const hrPriors = await loadRealHRPriors();
  if (!hrPriors.isValid) {
    throw new Error('Invalid HR priors data');
  }

  return hrPriors.data.filter(p => p.factor === factor);
}

/**
 * Get hazard ratio prior for a specific factor and level
 */
export async function getRealHRPrior(factor: string, level: string): Promise<HRPrior | null> {
  const priors = await getRealHRPriors(factor);
  return priors.find(p => p.level === level) || null;
}

/**
 * Get baseline life expectancy for a specific age and sex
 */
export async function getRealBaselineLifeExpectancy(age: number, sex: Sex): Promise<number> {
  const row = await getRealBaselineMortality(age, sex);
  return row.ex;
}

/**
 * Get sequence of baseline mortality probabilities
 */
export async function getRealSequenceFrom(age: number, sex: Sex, maxAge: number = 100): Promise<number[]> {
  const lifeTable = await loadRealLifeTable();
  if (!lifeTable.isValid) {
    throw new Error('Invalid life table data');
  }

  const sequence: number[] = [];
  
  for (let currentAge = age; currentAge <= maxAge; currentAge++) {
    const row = lifeTable.data.find(r => r.age === currentAge && r.sex === sex);
    if (row) {
      sequence.push(row.qx);
    } else {
      // If no data for this age, use the last available probability
      const lastAvailable = sequence[sequence.length - 1] || 0.5;
      sequence.push(lastAvailable);
    }
  }

  return sequence;
}

/**
 * Get age band from age (for cause fraction lookups)
 */
export function getRealAgeBand(age: number): string {
  if (age < 26) return '18-25';
  if (age < 36) return '26-35';
  if (age < 46) return '36-45';
  if (age < 56) return '46-55';
  if (age < 66) return '56-65';
  return '65+';
}

/**
 * Clear all caches (useful for testing or data updates)
 */
export function clearRealDataCache(): void {
  dataProcessor.clearCache();
}
