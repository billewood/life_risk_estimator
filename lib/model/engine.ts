import { 
  UserProfile, 
  EstimationResult, 
  RiskDriver,
  SurvivalCurve 
} from './types';
import { getBaseline1YearRisk, getBaselineLifeExpectancy, sequenceFrom } from './baselineMortality';
import { composeHR, createRiskDrivers } from './riskAdjustment';
import { buildSurvivalCurve, calculateLifeExpectancy, findMedianSurvival } from './survival';
import { estimateCauseMix } from './causeMix';
import { bootstrap, calculateConfidenceIntervals } from './uncertainty';
import { getCurrentVersions } from '@/lib/data/versions';

// ⚠️ DEPRECATED: This file is deprecated. All calculations should go through calculationEnforcer.
// This file is kept for backward compatibility only.
console.warn('⚠️ lib/model/engine.ts is deprecated. Use calculationEnforcer.calculateMortalityRisk() instead.');

/**
 * Main estimation engine - orchestrates all calculations
 */
export async function estimate(
  profile: UserProfile,
  options: {
    bootstrapSamples?: number;
    seed?: number;
    includeUncertainty?: boolean;
  } = {}
): Promise<EstimationResult> {
  const startTime = Date.now();
  
  const {
    bootstrapSamples = 200,
    seed,
    includeUncertainty = true,
  } = options;

  try {
    // Step 1: Get baseline mortality
    const baselineRisk1y = await getBaseline1YearRisk(profile.age, profile.sex);
    const baselineLE = await getBaselineLifeExpectancy(profile.age, profile.sex);
    const baselineSequence = await sequenceFrom(profile.age, profile.sex);

    // Step 2: Compose hazard ratio adjustments
    const hrResult = await composeHR(profile);
    const adjustedRisk1y = baselineRisk1y * hrResult.totalHR;
    const adjustedSequence = baselineSequence.map(qx => qx * hrResult.totalHR);

    // Step 3: Build survival curve and calculate life expectancy
    const survivalCurve = buildSurvivalCurve(profile.age, adjustedSequence);
    const lifeExpectancyMedian = findMedianSurvival(survivalCurve);

    // Step 4: Calculate cause distributions
    const causeMix1y = await estimateCauseMix(profile, '1y');
    const causeMixLifetime = await estimateCauseMix(profile, 'lifetime');

    // Step 5: Create risk drivers
    const drivers = createRiskDrivers(hrResult.components, baselineRisk1y);

    // Step 6: Bootstrap uncertainty (if requested)
    let risk1yCI80 = { lower: adjustedRisk1y * 0.9, upper: adjustedRisk1y * 1.1 };
    let lifeExpectancyCI80 = { lower: lifeExpectancyMedian * 0.9, upper: lifeExpectancyMedian * 1.1 };

    if (includeUncertainty) {
      try {
        const bootstrapResult = await bootstrap(profile, bootstrapSamples, seed);
        const confidenceIntervals = calculateConfidenceIntervals(bootstrapResult);
        risk1yCI80 = confidenceIntervals.risk1yCI80;
        lifeExpectancyCI80 = confidenceIntervals.lifeExpectancyCI80;
      } catch (error) {
        console.warn('Bootstrap failed, using approximate confidence intervals:', error);
      }
    }

    const computationTime = Date.now() - startTime;
    const versions = getCurrentVersions();

    return {
      lifeExpectancyMedian,
      lifeExpectancyCI80,
      risk1y: adjustedRisk1y,
      risk1yCI80,
      causeMix1y,
      causeMixLifetime,
      drivers,
      modelVersion: versions.modelVersion,
      dataVersion: versions.dataVersion,
      computationTime,
      disclaimer: generateDisclaimer(),
      baselineRisk1y,
      baselineLifeExpectancy: baselineLE,
    };

  } catch (error) {
    throw new Error(`Estimation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate disclaimer text
 */
function generateDisclaimer(): string {
  return 'These estimates are for educational purposes only and are based on population data and published risk ratios. They are not medical advice and should not be used for medical decisions, insurance underwriting, or employment screening. Please consult with a healthcare provider for personalized medical advice.';
}

/**
 * Validate user profile before estimation
 */
export function validateProfile(profile: UserProfile): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Age validation
  if (profile.age < 18 || profile.age > 110) {
    errors.push('Age must be between 18 and 110 years');
  }

  // ZIP validation
  if (!/^\d{3}$/.test(profile.zip3)) {
    errors.push('ZIP code must be 3 digits');
  }

  // Activity validation
  if (profile.activityMinutesPerWeek < 0 || profile.activityMinutesPerWeek > 1000) {
    errors.push('Weekly activity minutes must be between 0 and 1000');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get quick baseline estimate (without risk adjustments)
 */
export async function getBaselineEstimate(profile: UserProfile): Promise<{
  risk1y: number;
  lifeExpectancy: number;
}> {
  const risk1y = await getBaseline1YearRisk(profile.age, profile.sex);
  const lifeExpectancy = await getBaselineLifeExpectancy(profile.age, profile.sex);
  
  return {
    risk1y,
    lifeExpectancy,
  };
}

/**
 * Compare two profiles
 */
export async function compareProfiles(
  profile1: UserProfile,
  profile2: UserProfile
): Promise<{
  risk1yDifference: number;
  lifeExpectancyDifference: number;
  risk1yRelativeChange: number;
  lifeExpectancyRelativeChange: number;
}> {
  const result1 = await estimate(profile1, { includeUncertainty: false });
  const result2 = await estimate(profile2, { includeUncertainty: false });

  const risk1yDifference = result2.risk1y - result1.risk1y;
  const lifeExpectancyDifference = result2.lifeExpectancyMedian - result1.lifeExpectancyMedian;
  
  const risk1yRelativeChange = result1.risk1y > 0 ? risk1yDifference / result1.risk1y : 0;
  const lifeExpectancyRelativeChange = result1.lifeExpectancyMedian > 0 ? 
    lifeExpectancyDifference / result1.lifeExpectancyMedian : 0;

  return {
    risk1yDifference,
    lifeExpectancyDifference,
    risk1yRelativeChange,
    lifeExpectancyRelativeChange,
  };
}

/**
 * Get risk factor impact summary
 */
export async function getRiskFactorImpacts(profile: UserProfile): Promise<Array<{
  factor: string;
  impact: number;
  description: string;
  actionable: boolean;
}>> {
  const baseline = await getBaselineEstimate(profile);
  const adjusted = await estimate(profile, { includeUncertainty: false });

  const impacts: Array<{
    factor: string;
    impact: number;
    description: string;
    actionable: boolean;
  }> = [];

  // Calculate impact of each risk factor
  for (const driver of adjusted.drivers) {
    const impact = Math.abs(driver.deltaQ1y / baseline.risk1y);
    const actionable = ['smoking', 'activity', 'alcohol'].includes(driver.name);
    
    impacts.push({
      factor: driver.name,
      impact,
      description: driver.description,
      actionable,
    });
  }

  return impacts.sort((a, b) => b.impact - a.impact);
}

/**
 * Get personalized recommendations
 */
export async function getRecommendations(profile: UserProfile): Promise<Array<{
  category: string;
  recommendation: string;
  impact: 'high' | 'medium' | 'low';
  evidence: string;
}>> {
  const recommendations: Array<{
    category: string;
    recommendation: string;
    impact: 'high' | 'medium' | 'low';
    evidence: string;
  }> = [];

  // Smoking recommendations
  if (profile.smoking === 'current') {
    recommendations.push({
      category: 'Smoking',
      recommendation: 'Consider quitting smoking',
      impact: 'high',
      evidence: 'Quitting smoking can significantly reduce mortality risk',
    });
  }

  // Activity recommendations
  if (profile.activityMinutesPerWeek < 150) {
    recommendations.push({
      category: 'Physical Activity',
      recommendation: 'Increase physical activity to at least 150 minutes per week',
      impact: 'medium',
      evidence: 'Regular physical activity reduces cardiovascular and metabolic disease risk',
    });
  }

  // Alcohol recommendations
  if (profile.alcohol === 'heavy') {
    recommendations.push({
      category: 'Alcohol',
      recommendation: 'Reduce alcohol consumption',
      impact: 'medium',
      evidence: 'Heavy alcohol consumption increases mortality risk',
    });
  }

  // Vaccination recommendations
  if (!profile.vaccinations.flu) {
    recommendations.push({
      category: 'Prevention',
      recommendation: 'Get annual flu vaccination',
      impact: 'low',
      evidence: 'Flu vaccination reduces infectious disease mortality risk',
    });
  }

  if (!profile.vaccinations.covid) {
    recommendations.push({
      category: 'Prevention',
      recommendation: 'Get COVID-19 vaccination',
      impact: 'low',
      evidence: 'COVID-19 vaccination reduces infectious disease mortality risk',
    });
  }

  return recommendations;
}

/**
 * Export estimation result to JSON
 */
export function exportResult(result: EstimationResult): string {
  return JSON.stringify(result, null, 2);
}

/**
 * Import estimation result from JSON
 */
export function importResult(json: string): EstimationResult {
  try {
    const parsed = JSON.parse(json);
    
    // Basic validation
    if (!parsed.lifeExpectancyMedian || !parsed.risk1y) {
      throw new Error('Invalid result format');
    }
    
    return parsed as EstimationResult;
  } catch (error) {
    throw new Error(`Failed to import result: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
