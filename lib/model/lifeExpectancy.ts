import { SurvivalCurve, UncertaintyInterval } from './types';
import { 
  calculateLifeExpectancy, 
  findMedianSurvival, 
  findQuantileSurvival 
} from './survival';
import { confidenceInterval80, median } from '@/lib/math/stats';

/**
 * Calculate life expectancy statistics from survival curve
 */
export function summarizeLifeExpectancy(curve: SurvivalCurve[]): {
  median: number;
  mean: number;
  ci80: UncertaintyInterval;
} {
  if (curve.length === 0) {
    return {
      median: 0,
      mean: 0,
      ci80: { lower: 0, upper: 0 },
    };
  }

  const medianLE = findMedianSurvival(curve);
  const meanLE = calculateLifeExpectancy(curve);

  return {
    median: medianLE,
    mean: meanLE,
    ci80: { lower: 0, upper: 0 }, // Will be filled by bootstrap
  };
}

/**
 * Calculate life expectancy statistics from bootstrap results
 */
export function summarizeBootstrapLifeExpectancy(
  bootstrapResults: number[]
): {
  median: number;
  mean: number;
  ci80: UncertaintyInterval;
} {
  if (bootstrapResults.length === 0) {
    return {
      median: 0,
      mean: 0,
      ci80: { lower: 0, upper: 0 },
    };
  }

  const medianLE = median(bootstrapResults);
  const meanLE = bootstrapResults.reduce((sum, le) => sum + le, 0) / bootstrapResults.length;
  const ci80 = confidenceInterval80(bootstrapResults);

  return {
    median: medianLE,
    mean: meanLE,
    ci80,
  };
}

/**
 * Calculate years of life lost compared to reference
 */
export function calculateYearsOfLifeLost(
  targetLE: number,
  referenceLE: number
): number {
  return Math.max(0, referenceLE - targetLE);
}

/**
 * Calculate relative life expectancy (as percentage of reference)
 */
export function calculateRelativeLifeExpectancy(
  targetLE: number,
  referenceLE: number
): number {
  if (referenceLE === 0) return 0;
  return (targetLE / referenceLE) * 100;
}

/**
 * Get life expectancy percentile rank
 */
export function getLifeExpectancyPercentile(
  le: number,
  populationLEs: number[]
): number {
  if (populationLEs.length === 0) return 50;
  
  const sorted = [...populationLEs].sort((a, b) => a - b);
  let rank = 0;
  
  for (const populationLE of sorted) {
    if (le > populationLE) rank++;
  }
  
  return (rank / sorted.length) * 100;
}

/**
 * Calculate life expectancy at different ages
 */
export function calculateLifeExpectancyAtAges(
  curve: SurvivalCurve[],
  ages: number[]
): Record<number, number> {
  const results: Record<number, number> = {};
  
  for (const age of ages) {
    const ageIndex = curve.findIndex(point => point.age === age);
    if (ageIndex >= 0) {
      const remainingCurve = curve.slice(ageIndex);
      results[age] = calculateLifeExpectancy(remainingCurve);
    }
  }
  
  return results;
}

/**
 * Calculate healthy life expectancy (simplified - assumes same survival curve)
 */
export function calculateHealthyLifeExpectancy(
  curve: SurvivalCurve[],
  healthAdjustment: number = 0.9 // Assume 90% of years are healthy
): number {
  const totalLE = calculateLifeExpectancy(curve);
  return totalLE * healthAdjustment;
}

/**
 * Calculate disability-adjusted life years (DALYs)
 */
export function calculateDALYs(
  curve: SurvivalCurve[],
  disabilityWeight: number = 0.1 // Assume 10% disability weight
): number {
  const totalLE = calculateLifeExpectancy(curve);
  return totalLE * disabilityWeight;
}

/**
 * Get life expectancy milestones (e.g., 50%, 25%, 10% survival probability)
 */
export function getLifeExpectancyMilestones(curve: SurvivalCurve[]): {
  milestone50: number;
  milestone25: number;
  milestone10: number;
  milestone5: number;
} {
  const startAge = curve.length > 0 ? curve[0].age : 0;
  
  return {
    milestone50: findQuantileSurvival(curve, 0.5) + startAge,
    milestone25: findQuantileSurvival(curve, 0.25) + startAge,
    milestone10: findQuantileSurvival(curve, 0.1) + startAge,
    milestone5: findQuantileSurvival(curve, 0.05) + startAge,
  };
}

/**
 * Calculate life expectancy variance from bootstrap results
 */
export function calculateLifeExpectancyVariance(bootstrapResults: number[]): {
  variance: number;
  standardDeviation: number;
  coefficientOfVariation: number;
} {
  if (bootstrapResults.length === 0) {
    return {
      variance: 0,
      standardDeviation: 0,
      coefficientOfVariation: 0,
    };
  }

  const mean = bootstrapResults.reduce((sum, le) => sum + le, 0) / bootstrapResults.length;
  const variance = bootstrapResults.reduce((sum, le) => sum + Math.pow(le - mean, 2), 0) / bootstrapResults.length;
  const standardDeviation = Math.sqrt(variance);
  const coefficientOfVariation = mean > 0 ? standardDeviation / mean : 0;

  return {
    variance,
    standardDeviation,
    coefficientOfVariation,
  };
}

/**
 * Compare life expectancy to population benchmarks
 */
export function compareToPopulationBenchmarks(
  le: number,
  age: number,
  sex: string
): {
  percentile: number;
  comparison: string;
  benchmark: number;
} {
  // Simplified population benchmarks (in practice, these would come from data)
  const benchmarks: Record<string, Record<number, number>> = {
    male: {
      30: 47.5,
      40: 38.2,
      50: 29.8,
      60: 22.1,
      70: 15.3,
      80: 9.8,
    },
    female: {
      30: 52.1,
      40: 42.8,
      50: 33.9,
      60: 25.6,
      70: 18.1,
      80: 11.8,
    },
  };

  const benchmark = benchmarks[sex]?.[age] || 0;
  const difference = le - benchmark;
  
  let comparison: string;
  if (difference > 2) {
    comparison = 'significantly higher than average';
  } else if (difference > 0.5) {
    comparison = 'higher than average';
  } else if (difference > -0.5) {
    comparison = 'about average';
  } else if (difference > -2) {
    comparison = 'lower than average';
  } else {
    comparison = 'significantly lower than average';
  }

  // Simplified percentile calculation
  const percentile = Math.min(95, Math.max(5, 50 + (difference * 10)));

  return {
    percentile,
    comparison,
    benchmark,
  };
}
