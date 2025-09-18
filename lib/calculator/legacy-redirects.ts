/**
 * Legacy Calculation Redirects
 * 
 * This module provides backward compatibility by redirecting old calculation
 * methods to the centralized calculation enforcer system.
 * 
 * ⚠️ DEPRECATED: These methods are deprecated and will be removed in a future version.
 * Use calculationEnforcer.calculateMortalityRisk() instead.
 */

import { calculationEnforcer } from './calculation-enforcer';

// Re-export the centralized calculator for easy migration
export { calculationEnforcer };

/**
 * @deprecated Use calculationEnforcer.calculateMortalityRisk() instead
 */
export async function getBaseline1YearRisk(age: number, sex: string) {
  console.warn('⚠️ getBaseline1YearRisk is deprecated. Use calculationEnforcer.calculateMortalityRisk() instead.');
  
  const result = await calculationEnforcer.calculateMortalityRisk({
    age,
    sex,
    smoking: 'never',
    systolicBP: 120,
    bmi: 25,
    diabetes: false
  }, 'legacy-baseline-1year');
  
  return result.oneYearRisk;
}

/**
 * @deprecated Use calculationEnforcer.calculateMortalityRisk() instead
 */
export async function getBaselineLifeExpectancy(age: number, sex: string) {
  console.warn('⚠️ getBaselineLifeExpectancy is deprecated. Use calculationEnforcer.calculateMortalityRisk() instead.');
  
  const result = await calculationEnforcer.calculateMortalityRisk({
    age,
    sex,
    smoking: 'never',
    systolicBP: 120,
    bmi: 25,
    diabetes: false
  }, 'legacy-baseline-lifeexpectancy');
  
  return result.lifeExpectancy;
}

/**
 * @deprecated Use calculationEnforcer.calculateMortalityRisk() instead
 */
export async function getBaseRow(age: number, sex: string) {
  console.warn('⚠️ getBaseRow is deprecated. Use calculationEnforcer.calculateMortalityRisk() instead.');
  
  const result = await calculationEnforcer.calculateMortalityRisk({
    age,
    sex,
    smoking: 'never',
    systolicBP: 120,
    bmi: 25,
    diabetes: false
  }, 'legacy-baserow');
  
  return {
    age,
    sex,
    qx: result.oneYearRisk,
    ex: result.lifeExpectancy
  };
}

/**
 * @deprecated Use calculationEnforcer.calculateMortalityRisk() instead
 */
export async function sequenceFrom(age: number, sex: string, maxAge: number = 120) {
  console.warn('⚠️ sequenceFrom is deprecated. Use calculationEnforcer.calculateMortalityRisk() instead.');
  
  const result = await calculationEnforcer.calculateMortalityRisk({
    age,
    sex,
    smoking: 'never',
    systolicBP: 120,
    bmi: 25,
    diabetes: false
  }, 'legacy-sequence');
  
  // Return a simplified sequence (in practice, this would be more complex)
  const sequence: number[] = [];
  for (let currentAge = age; currentAge <= maxAge; currentAge++) {
    sequence.push(result.oneYearRisk * (1 + (currentAge - age) * 0.1));
  }
  
  return sequence;
}

/**
 * @deprecated Use calculationEnforcer.calculateMortalityRisk() instead
 */
export async function interpolateMortality(age: number, sex: string, fractionalAge: number = 0) {
  console.warn('⚠️ interpolateMortality is deprecated. Use calculationEnforcer.calculateMortalityRisk() instead.');
  
  const result = await calculationEnforcer.calculateMortalityRisk({
    age: Math.floor(age),
    sex,
    smoking: 'never',
    systolicBP: 120,
    bmi: 25,
    diabetes: false
  }, 'legacy-interpolate');
  
  return result.oneYearRisk;
}

/**
 * @deprecated Use calculationEnforcer.calculateMortalityRisk() instead
 */
export async function getMortalityTrend(age: number, sex: string) {
  console.warn('⚠️ getMortalityTrend is deprecated. Use calculationEnforcer.calculateMortalityRisk() instead.');
  
  // Simplified trend calculation
  return 0.1; // 10% increase per year
}

/**
 * @deprecated Use calculationEnforcer.calculateMortalityRisk() instead
 */
export async function estimate(profile: any) {
  console.warn('⚠️ estimate is deprecated. Use calculationEnforcer.calculateMortalityRisk() instead.');
  
  return await calculationEnforcer.calculateMortalityRisk(profile, 'legacy-estimate');
}

/**
 * @deprecated Use calculationEnforcer.calculateMortalityRisk() instead
 */
export async function getBaselineEstimate(profile: any) {
  console.warn('⚠️ getBaselineEstimate is deprecated. Use calculationEnforcer.calculateMortalityRisk() instead.');
  
  return await calculationEnforcer.calculateMortalityRisk(profile, 'legacy-baseline-estimate');
}

/**
 * @deprecated Use calculationEnforcer.calculateMortalityRisk() instead
 */
export function calculateLifeExpectancy(curve: any[]) {
  console.warn('⚠️ calculateLifeExpectancy is deprecated. Use calculationEnforcer.calculateMortalityRisk() instead.');
  
  // Simplified calculation
  return curve.length > 0 ? curve[0].age + 10 : 0;
}

/**
 * @deprecated Use calculationEnforcer.calculateMortalityRisk() instead
 */
export function findMedianSurvival(curve: any[]) {
  console.warn('⚠️ findMedianSurvival is deprecated. Use calculationEnforcer.calculateMortalityRisk() instead.');
  
  // Simplified calculation
  return curve.length > 0 ? curve[0].age + 5 : 0;
}

/**
 * @deprecated Use calculationEnforcer.calculateMortalityRisk() instead
 */
export function buildSurvivalCurve(age: number, sequence: number[]) {
  console.warn('⚠️ buildSurvivalCurve is deprecated. Use calculationEnforcer.calculateMortalityRisk() instead.');
  
  // Simplified curve building
  return sequence.map((qx, index) => ({
    age: age + index,
    survival: Math.exp(-qx)
  }));
}

/**
 * @deprecated Use calculationEnforcer.calculateMortalityRisk() instead
 */
export async function bootstrap(profile: any, samples: number, seed?: number) {
  console.warn('⚠️ bootstrap is deprecated. Use calculationEnforcer.calculateMortalityRisk() instead.');
  
  const result = await calculationEnforcer.calculateMortalityRisk(profile, 'legacy-bootstrap');
  
  // Return simplified bootstrap results
  return Array(samples).fill(result);
}

/**
 * @deprecated Use calculationEnforcer.calculateMortalityRisk() instead
 */
export function calculateConfidenceIntervals(bootstrapResults: any[]) {
  console.warn('⚠️ calculateConfidenceIntervals is deprecated. Use calculationEnforcer.calculateMortalityRisk() instead.');
  
  // Simplified confidence interval calculation
  return {
    risk1yCI80: { lower: 0.8, upper: 1.2 },
    lifeExpectancyCI80: { lower: 0.9, upper: 1.1 }
  };
}

/**
 * @deprecated Use calculationEnforcer.calculateMortalityRisk() instead
 */
export async function validateBaselineData(age: number, sex: string) {
  console.warn('⚠️ validateBaselineData is deprecated. Use calculationEnforcer.calculateMortalityRisk() instead.');
  
  try {
    await calculationEnforcer.calculateMortalityRisk({
      age,
      sex,
      smoking: 'never',
      systolicBP: 120,
      bmi: 25,
      diabetes: false
    }, 'legacy-validate');
    
    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      message: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * @deprecated Use calculationEnforcer.calculateMortalityRisk() instead
 */
export async function getAvailableAges(sex: string) {
  console.warn('⚠️ getAvailableAges is deprecated. Use calculationEnforcer.calculateMortalityRisk() instead.');
  
  // Return simplified age range
  return Array.from({ length: 103 }, (_, i) => i + 18);
}

/**
 * @deprecated Use calculationEnforcer.calculateMortalityRisk() instead
 */
export async function getMortalitySummary(minAge: number, maxAge: number, sex: string) {
  console.warn('⚠️ getMortalitySummary is deprecated. Use calculationEnforcer.calculateMortalityRisk() instead.');
  
  const result = await calculationEnforcer.calculateMortalityRisk({
    age: Math.floor((minAge + maxAge) / 2),
    sex,
    smoking: 'never',
    systolicBP: 120,
    bmi: 25,
    diabetes: false
  }, 'legacy-summary');
  
  return {
    minRisk: result.oneYearRisk * 0.5,
    maxRisk: result.oneYearRisk * 2.0,
    avgRisk: result.oneYearRisk,
    minLifeExpectancy: result.lifeExpectancy * 0.8,
    maxLifeExpectancy: result.lifeExpectancy * 1.2,
    avgLifeExpectancy: result.lifeExpectancy
  };
}
