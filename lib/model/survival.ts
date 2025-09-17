import { SurvivalCurve } from './types';
import { BOUNDS } from './types';

/**
 * Convert annual probability of death to hazard rate
 */
export function probToHazard(q: number): number {
  const clampedQ = Math.max(BOUNDS.MIN_SURVIVAL_PROBABILITY, Math.min(0.5, q));
  return -Math.log(1 - clampedQ);
}

/**
 * Convert hazard rate to annual probability of death
 */
export function hazardToProb(h: number): number {
  return 1 - Math.exp(-h);
}

/**
 * Apply hazard ratio to an annual probability of death
 */
export function applyHRToAnnualProb(q: number, hr: number): number {
  const hazard = probToHazard(q);
  const adjustedHazard = hazard * hr;
  return hazardToProb(adjustedHazard);
}

/**
 * Build survival curve from age-specific mortality probabilities
 */
export function buildSurvivalCurve(
  startAge: number,
  annualQSequence: number[],
  maxAge: number = 110
): SurvivalCurve[] {
  const curve: SurvivalCurve[] = [];
  let cumulativeSurvival = 1.0;
  let currentAge = startAge;

  for (let i = 0; i < annualQSequence.length && currentAge <= maxAge; i++) {
    const qx = annualQSequence[i];
    const hazard = probToHazard(qx);
    
    // Update cumulative survival
    cumulativeSurvival *= (1 - qx);
    
    curve.push({
      age: currentAge,
      survival: cumulativeSurvival,
      hazard: hazard,
      qx: qx,
    });
    
    currentAge++;
  }

  return curve;
}

/**
 * Calculate remaining life expectancy from survival curve
 */
export function calculateLifeExpectancy(curve: SurvivalCurve[]): number {
  if (curve.length === 0) return 0;
  
  let lifeExpectancy = 0;
  
  // Add half year for the current age
  lifeExpectancy += 0.5;
  
  // Add years for each subsequent age
  for (let i = 0; i < curve.length - 1; i++) {
    lifeExpectancy += curve[i].survival;
  }
  
  return lifeExpectancy;
}

/**
 * Find median survival time from survival curve
 */
export function findMedianSurvival(curve: SurvivalCurve[]): number {
  if (curve.length === 0) return 0;
  
  const startAge = curve[0].age;
  
  for (let i = 0; i < curve.length; i++) {
    if (curve[i].survival <= 0.5) {
      return curve[i].age - startAge;
    }
  }
  
  // If survival never drops below 0.5, return the full curve length
  return curve.length;
}

/**
 * Find quantile survival time from survival curve
 */
export function findQuantileSurvival(curve: SurvivalCurve[], quantile: number): number {
  if (curve.length === 0 || quantile <= 0 || quantile >= 1) return 0;
  
  const startAge = curve[0].age;
  
  for (let i = 0; i < curve.length; i++) {
    if (curve[i].survival <= 1 - quantile) {
      return curve[i].age - startAge;
    }
  }
  
  // If survival never drops below the quantile, return the full curve length
  return curve.length;
}

/**
 * Calculate years of life lost (YLL) compared to a reference curve
 */
export function calculateYearsOfLifeLost(
  targetCurve: SurvivalCurve[],
  referenceCurve: SurvivalCurve[]
): number {
  const targetLE = calculateLifeExpectancy(targetCurve);
  const referenceLE = calculateLifeExpectancy(referenceCurve);
  return Math.max(0, referenceLE - targetLE);
}

/**
 * Validate survival curve consistency
 */
export function validateSurvivalCurve(curve: SurvivalCurve[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (curve.length === 0) {
    errors.push('Survival curve is empty');
    return { isValid: false, errors };
  }
  
  // Check that survival is non-increasing
  for (let i = 1; i < curve.length; i++) {
    if (curve[i].survival > curve[i - 1].survival) {
      errors.push(`Survival increased at age ${curve[i].age}`);
    }
  }
  
  // Check that survival starts at 1.0
  if (Math.abs(curve[0].survival - 1.0) > 1e-6) {
    errors.push(`Survival does not start at 1.0 (starts at ${curve[0].survival})`);
  }
  
  // Check that all survival values are between 0 and 1
  for (const point of curve) {
    if (point.survival < 0 || point.survival > 1) {
      errors.push(`Invalid survival value ${point.survival} at age ${point.age}`);
    }
  }
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Smooth survival curve using moving average
 */
export function smoothSurvivalCurve(curve: SurvivalCurve[], windowSize: number = 3): SurvivalCurve[] {
  if (curve.length <= windowSize) return curve;
  
  const smoothed: SurvivalCurve[] = [];
  const halfWindow = Math.floor(windowSize / 2);
  
  for (let i = 0; i < curve.length; i++) {
    let sum = 0;
    let count = 0;
    
    for (let j = Math.max(0, i - halfWindow); j <= Math.min(curve.length - 1, i + halfWindow); j++) {
      sum += curve[j].survival;
      count++;
    }
    
    smoothed.push({
      ...curve[i],
      survival: sum / count,
    });
  }
  
  return smoothed;
}
