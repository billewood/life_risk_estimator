import { MortalityTableRow, Sex } from './types';
import { getRealBaselineMortality, loadRealLifeTable } from '@/lib/data/realDataLoader';
import { BOUNDS } from './types';

// ⚠️ DEPRECATED: This file is deprecated. All calculations should go through calculationEnforcer.
// This file is kept for backward compatibility only.
console.warn('⚠️ lib/model/baselineMortality.ts is deprecated. Use calculationEnforcer.calculateMortalityRisk() instead.');

/**
 * Get baseline mortality data for a specific age and sex
 */
export async function getBaseRow(age: number, sex: Sex): Promise<MortalityTableRow> {
  if (age < BOUNDS.MIN_AGE || age > BOUNDS.MAX_AGE) {
    throw new Error(`Age ${age} is outside valid range [${BOUNDS.MIN_AGE}, ${BOUNDS.MAX_AGE}]`);
  }

  try {
    return await getRealBaselineMortality(age, sex);
  } catch (error) {
    throw new Error(`Failed to get baseline mortality for age ${age}, sex ${sex}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get sequence of baseline mortality probabilities from current age to maximum age
 */
export async function sequenceFrom(age: number, sex: Sex, maxAge: number = BOUNDS.MAX_AGE): Promise<number[]> {
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
      // This handles edge cases at very high ages
      const lastAvailable = sequence[sequence.length - 1] || 0.5;
      sequence.push(lastAvailable);
    }
  }

  return sequence;
}

/**
 * Get baseline life expectancy for a specific age and sex
 */
export async function getBaselineLifeExpectancy(age: number, sex: Sex): Promise<number> {
  const baseRow = await getBaseRow(age, sex);
  return baseRow.ex;
}

/**
 * Get baseline 1-year mortality risk for a specific age and sex
 */
export async function getBaseline1YearRisk(age: number, sex: Sex): Promise<number> {
  const baseRow = await getBaseRow(age, sex);
  console.log(`Baseline 1-year risk for age ${age}, sex ${sex}:`, baseRow.qx);
  return baseRow.qx;
}

/**
 * Interpolate mortality probability between ages
 */
export async function interpolateMortality(
  age: number, 
  sex: Sex, 
  fractionalAge: number = 0
): Promise<number> {
  if (fractionalAge === 0) {
    const baseRow = await getBaseRow(age, sex);
    return baseRow.qx;
  }

  const age1 = Math.floor(age);
  const age2 = age1 + 1;
  
  if (age2 > BOUNDS.MAX_AGE) {
    const baseRow = await getBaseRow(age1, sex);
    return baseRow.qx;
  }

  const row1 = await getBaseRow(age1, sex);
  const row2 = await getBaseRow(age2, sex);
  
  // Linear interpolation on log scale for mortality probabilities
  const logQ1 = Math.log(row1.qx);
  const logQ2 = Math.log(row2.qx);
  const interpolatedLogQ = logQ1 + (logQ2 - logQ1) * fractionalAge;
  
  return Math.exp(interpolatedLogQ);
}

/**
 * Get mortality trend (rate of change) for a specific age and sex
 */
export async function getMortalityTrend(age: number, sex: Sex): Promise<number> {
  if (age >= BOUNDS.MAX_AGE) return 0;
  
  const currentRow = await getBaseRow(age, sex);
  const nextRow = await getBaseRow(age + 1, sex);
  
  // Calculate relative change
  return (nextRow.qx - currentRow.qx) / currentRow.qx;
}

/**
 * Validate that baseline mortality data is available for the given parameters
 */
export async function validateBaselineData(age: number, sex: Sex): Promise<{ isValid: boolean; message?: string }> {
  try {
    await getBaseRow(age, sex);
    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      message: error instanceof Error ? error.message : 'Unknown validation error' 
    };
  }
}

/**
 * Get all available ages for a specific sex
 */
export async function getAvailableAges(sex: Sex): Promise<number[]> {
  const lifeTable = await loadRealLifeTable();
  if (!lifeTable.isValid) {
    throw new Error('Invalid life table data');
  }

  return lifeTable.data
    .filter(row => row.sex === sex)
    .map(row => row.age)
    .sort((a, b) => a - b);
}

/**
 * Get mortality statistics summary for an age range
 */
export async function getMortalitySummary(
  minAge: number, 
  maxAge: number, 
  sex: Sex
): Promise<{
  minRisk: number;
  maxRisk: number;
  avgRisk: number;
  minLifeExpectancy: number;
  maxLifeExpectancy: number;
  avgLifeExpectancy: number;
}> {
  const lifeTable = await loadRealLifeTable();
  if (!lifeTable.isValid) {
    throw new Error('Invalid life table data');
  }

  const relevantRows = lifeTable.data.filter(
    row => row.sex === sex && row.age >= minAge && row.age <= maxAge
  );

  if (relevantRows.length === 0) {
    throw new Error(`No mortality data available for age range ${minAge}-${maxAge}, sex ${sex}`);
  }

  const risks = relevantRows.map(row => row.qx);
  const lifeExpectancies = relevantRows.map(row => row.ex);

  return {
    minRisk: Math.min(...risks),
    maxRisk: Math.max(...risks),
    avgRisk: risks.reduce((sum, risk) => sum + risk, 0) / risks.length,
    minLifeExpectancy: Math.min(...lifeExpectancies),
    maxLifeExpectancy: Math.max(...lifeExpectancies),
    avgLifeExpectancy: lifeExpectancies.reduce((sum, le) => sum + le, 0) / lifeExpectancies.length,
  };
}
