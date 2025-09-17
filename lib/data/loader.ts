import Papa from 'papaparse';
import { 
  MortalityTableRow, 
  CauseFraction, 
  HRPrior, 
  Sex, 
  CauseCategory 
} from '@/lib/model/types';
import { 
  validateMortalityTableRow, 
  validateCauseFraction, 
  validateHRPrior,
  validateLifeTableConsistency,
  validateCauseFractionsConsistency,
  validateHRPriorsConsistency
} from './schemas';
import { getCurrentVersions, getLifeTablePath, getCauseFractionsPath, getHRPriorsPath } from './versions';

// Cache for loaded data
let lifeTableCache: Map<string, MortalityTableRow[]> | null = null;
let causeFractionsCache: Map<string, CauseFraction[]> | null = null;
let hrPriorsCache: Map<string, HRPrior[]> | null = null;

export interface DataLoadResult<T> {
  data: T[];
  version: string;
  loadedAt: Date;
  isValid: boolean;
  errors?: string[];
}

/**
 * Load and validate life table data
 */
export async function loadLifeTable(version?: string): Promise<DataLoadResult<MortalityTableRow>> {
  const dataVersion = version || getCurrentVersions().dataVersion;
  const cacheKey = `${dataVersion}-life-table`;
  
  if (lifeTableCache?.has(cacheKey)) {
    const cached = lifeTableCache.get(cacheKey)!;
    return {
      data: cached,
      version: dataVersion,
      loadedAt: new Date(),
      isValid: true,
    };
  }

  try {
    const response = await fetch(getLifeTablePath(dataVersion));
    if (!response.ok) {
      throw new Error(`Failed to load life table: ${response.statusText}`);
    }

    const csvText = await response.text();
    const parseResult = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    
    if (parseResult.errors.length > 0) {
      throw new Error(`CSV parse errors: ${parseResult.errors.map(e => e.message).join(', ')}`);
    }

    const validatedRows: MortalityTableRow[] = [];
    const errors: string[] = [];

    for (const [index, row] of parseResult.data.entries()) {
      try {
        const validated = validateMortalityTableRow(row);
        validatedRows.push(validated);
      } catch (error) {
        errors.push(`Row ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    const isValid = errors.length === 0 && validateLifeTableConsistency(validatedRows);

    // Cache the result
    if (!lifeTableCache) lifeTableCache = new Map();
    lifeTableCache.set(cacheKey, validatedRows);

    return {
      data: validatedRows,
      version: dataVersion,
      loadedAt: new Date(),
      isValid,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    throw new Error(`Failed to load life table data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Load and validate cause fraction data
 */
export async function loadCauseFractions(version?: string): Promise<DataLoadResult<CauseFraction>> {
  const dataVersion = version || getCurrentVersions().dataVersion;
  const cacheKey = `${dataVersion}-cause-fractions`;
  
  if (causeFractionsCache?.has(cacheKey)) {
    const cached = causeFractionsCache.get(cacheKey)!;
    return {
      data: cached,
      version: dataVersion,
      loadedAt: new Date(),
      isValid: true,
    };
  }

  try {
    const response = await fetch(getCauseFractionsPath(dataVersion));
    if (!response.ok) {
      throw new Error(`Failed to load cause fractions: ${response.statusText}`);
    }

    const csvText = await response.text();
    const parseResult = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    
    if (parseResult.errors.length > 0) {
      throw new Error(`CSV parse errors: ${parseResult.errors.map(e => e.message).join(', ')}`);
    }

    const validatedRows: CauseFraction[] = [];
    const errors: string[] = [];

    for (const [index, row] of parseResult.data.entries()) {
      try {
        const validated = validateCauseFraction(row);
        validatedRows.push(validated);
      } catch (error) {
        errors.push(`Row ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    const isValid = errors.length === 0 && validateCauseFractionsConsistency(validatedRows);

    // Cache the result
    if (!causeFractionsCache) causeFractionsCache = new Map();
    causeFractionsCache.set(cacheKey, validatedRows);

    return {
      data: validatedRows,
      version: dataVersion,
      loadedAt: new Date(),
      isValid,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    throw new Error(`Failed to load cause fractions data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Load and validate hazard ratio priors
 */
export async function loadHRPriors(version?: string): Promise<DataLoadResult<HRPrior>> {
  const dataVersion = version || getCurrentVersions().dataVersion;
  const cacheKey = `${dataVersion}-hr-priors`;
  
  if (hrPriorsCache?.has(cacheKey)) {
    const cached = hrPriorsCache.get(cacheKey)!;
    return {
      data: cached,
      version: dataVersion,
      loadedAt: new Date(),
      isValid: true,
    };
  }

  try {
    const response = await fetch(getHRPriorsPath(dataVersion));
    if (!response.ok) {
      throw new Error(`Failed to load HR priors: ${response.statusText}`);
    }

    const csvText = await response.text();
    const parseResult = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    
    if (parseResult.errors.length > 0) {
      throw new Error(`CSV parse errors: ${parseResult.errors.map(e => e.message).join(', ')}`);
    }

    const validatedRows: HRPrior[] = [];
    const errors: string[] = [];

    for (const [index, row] of parseResult.data.entries()) {
      try {
        const validated = validateHRPrior(row);
        validatedRows.push(validated);
      } catch (error) {
        errors.push(`Row ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    const isValid = errors.length === 0 && validateHRPriorsConsistency(validatedRows);

    // Cache the result
    if (!hrPriorsCache) hrPriorsCache = new Map();
    hrPriorsCache.set(cacheKey, validatedRows);

    return {
      data: validatedRows,
      version: dataVersion,
      loadedAt: new Date(),
      isValid,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    throw new Error(`Failed to load HR priors data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get baseline mortality data for a specific age and sex
 */
export async function getBaselineMortality(age: number, sex: Sex): Promise<MortalityTableRow> {
  const lifeTable = await loadLifeTable();
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
export async function getCauseFractions(ageBand: string, sex: Sex): Promise<CauseFraction[]> {
  const causeFractions = await loadCauseFractions();
  if (!causeFractions.isValid) {
    throw new Error('Invalid cause fractions data');
  }

  return causeFractions.data.filter(f => f.ageBand === ageBand && f.sex === sex);
}

/**
 * Get hazard ratio priors for a specific factor
 */
export async function getHRPriors(factor: string): Promise<HRPrior[]> {
  const hrPriors = await loadHRPriors();
  if (!hrPriors.isValid) {
    throw new Error('Invalid HR priors data');
  }

  return hrPriors.data.filter(p => p.factor === factor);
}

/**
 * Get hazard ratio prior for a specific factor and level
 */
export async function getHRPrior(factor: string, level: string): Promise<HRPrior | null> {
  const priors = await getHRPriors(factor);
  return priors.find(p => p.level === level) || null;
}

/**
 * Clear all caches (useful for testing or data updates)
 */
export function clearDataCache(): void {
  lifeTableCache = null;
  causeFractionsCache = null;
  hrPriorsCache = null;
}

/**
 * Get baseline mortality data for a specific age and sex (exported for testing)
 */
export { getBaselineMortality as getBaseline1YearRisk };

/**
 * Get baseline life expectancy for a specific age and sex (exported for testing)
 */
export async function getBaselineLifeExpectancy(age: number, sex: Sex): Promise<number> {
  const row = await getBaselineMortality(age, sex);
  return row.ex;
}

/**
 * Get sequence of baseline mortality probabilities (exported for testing)
 */
export async function sequenceFrom(age: number, sex: Sex, maxAge: number = 110): Promise<number[]> {
  const lifeTable = await loadLifeTable();
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
export function getAgeBand(age: number): string {
  if (age < 25) return '18-24';
  if (age < 35) return '25-34';
  if (age < 45) return '35-44';
  if (age < 55) return '45-54';
  if (age < 65) return '55-64';
  if (age < 75) return '65-74';
  if (age < 85) return '75-84';
  return '85+';
}
