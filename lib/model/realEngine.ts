/**
 * Real data estimation engine - uses real data sources and processing pipeline
 * 
 * This engine provides the same interface as the original engine but uses
 * real data from CDC, WHO, and other authoritative sources.
 */

import { 
  UserProfile, 
  EstimationResult, 
  RiskDriver,
  SurvivalCurve 
} from './types';
import { 
  getRealBaselineMortality, 
  getRealBaselineLifeExpectancy, 
  getRealSequenceFrom 
} from '@/lib/data/realDataLoader';
import { composeHR, createRiskDrivers } from './riskAdjustment';
import { buildSurvivalCurve, calculateLifeExpectancy, findMedianSurvival } from './survival';
import { estimateCauseMix } from './causeMix';
import { bootstrap, calculateConfidenceIntervals } from './uncertainty';
import { getCurrentVersions } from '@/lib/data/versions';

/**
 * Main real data estimation engine
 */
export async function estimateWithRealData(
  profile: UserProfile,
  options: {
    bootstrapSamples?: number;
    seed?: number;
    includeUncertainty?: boolean;
  } = {}
): Promise<EstimationResult> {
  console.log('Starting real data estimation with profile:', profile);
  const startTime = Date.now();
  
  const {
    bootstrapSamples = 200,
    seed,
    includeUncertainty = true,
  } = options;

  try {
    // Step 1: Get baseline mortality from real data
    const baselineRisk1y = await getRealBaselineMortality(profile.age, profile.sex);
    const baselineLE = await getRealBaselineLifeExpectancy(profile.age, profile.sex);
    const baselineSequence = await getRealSequenceFrom(profile.age, profile.sex);

    // Step 2: Compose hazard ratio adjustments
    const hrResult = await composeHR(profile);
    const adjustedRisk1y = baselineRisk1y.qx * hrResult.totalHR;
    const adjustedSequence = baselineSequence.map(qx => qx * hrResult.totalHR);

    // Step 3: Build survival curve and calculate life expectancy
    const survivalCurve = buildSurvivalCurve(profile.age, adjustedSequence);
    const lifeExpectancyMedian = findMedianSurvival(survivalCurve);

    // Step 4: Calculate cause distributions
    const causeMix1y = await estimateCauseMix(profile, '1y');
    const causeMixLifetime = await estimateCauseMix(profile, 'lifetime');

    // Step 5: Create risk drivers
    const drivers = createRiskDrivers(hrResult.components, baselineRisk1y.qx);

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
      dataVersion: '2025-01-real',
      computationTime,
      disclaimer: generateRealDataDisclaimer(),
      baselineRisk1y: baselineRisk1y.qx,
      baselineLifeExpectancy: baselineLE,
    };

  } catch (error) {
    throw new Error(`Real data estimation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate disclaimer text for real data
 */
function generateRealDataDisclaimer(): string {
  return 'These estimates are for educational purposes only and are based on real US mortality data from CDC and published risk factors from peer-reviewed research. They are not medical advice and should not be used for medical decisions, insurance underwriting, or employment screening. Please consult with a healthcare provider for personalized medical advice.';
}

/**
 * Validate user profile before estimation
 */
export function validateRealDataProfile(profile: UserProfile): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Age validation
  if (profile.age < 18 || profile.age > 100) {
    errors.push('Age must be between 18 and 100 years');
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
 * Get quick baseline estimate using real data
 */
export async function getRealBaselineEstimate(profile: UserProfile): Promise<{
  risk1y: number;
  lifeExpectancy: number;
  source: string;
}> {
  const risk1y = await getRealBaselineMortality(profile.age, profile.sex);
  const lifeExpectancy = await getRealBaselineLifeExpectancy(profile.age, profile.sex);
  
  return {
    risk1y: risk1y.qx,
    lifeExpectancy,
    source: 'Real data from CDC and research studies',
  };
}

/**
 * Compare two profiles using real data
 */
export async function compareRealDataProfiles(
  profile1: UserProfile,
  profile2: UserProfile
): Promise<{
  risk1yDifference: number;
  lifeExpectancyDifference: number;
  risk1yRelativeChange: number;
  lifeExpectancyRelativeChange: number;
}> {
  const result1 = await estimateWithRealData(profile1, { includeUncertainty: false });
  const result2 = await estimateWithRealData(profile2, { includeUncertainty: false });

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
 * Get risk factor impact summary using real data
 */
export async function getRealRiskFactorImpacts(profile: UserProfile): Promise<Array<{
  factor: string;
  impact: number;
  description: string;
  actionable: boolean;
  source: string;
}>> {
  const baseline = await getRealBaselineEstimate(profile);
  const adjusted = await estimateWithRealData(profile, { includeUncertainty: false });

  const impacts: Array<{
    factor: string;
    impact: number;
    description: string;
    actionable: boolean;
    source: string;
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
      source: 'Real data analysis',
    });
  }

  return impacts.sort((a, b) => b.impact - a.impact);
}

/**
 * Get personalized recommendations based on real data
 */
export async function getRealRecommendations(profile: UserProfile): Promise<Array<{
  category: string;
  recommendation: string;
  impact: 'high' | 'medium' | 'low';
  evidence: string;
  source: string;
}>> {
  const recommendations: Array<{
    category: string;
    recommendation: string;
    impact: 'high' | 'medium' | 'low';
    evidence: string;
    source: string;
  }> = [];

  // Smoking recommendations
  if (profile.smoking === 'current') {
    recommendations.push({
      category: 'Smoking',
      recommendation: 'Consider quitting smoking',
      impact: 'high',
      evidence: 'Quitting smoking can significantly reduce mortality risk',
      source: 'US Surgeon General Report 2014',
    });
  }

  // Activity recommendations
  if (profile.activityMinutesPerWeek < 150) {
    recommendations.push({
      category: 'Physical Activity',
      recommendation: 'Increase physical activity to at least 150 minutes per week',
      impact: 'medium',
      evidence: 'Regular physical activity reduces cardiovascular and metabolic disease risk',
      source: 'Physical Activity Guidelines for Americans, 2nd Edition',
    });
  }

  // Alcohol recommendations
  if (profile.alcohol === 'heavy') {
    recommendations.push({
      category: 'Alcohol',
      recommendation: 'Reduce alcohol consumption',
      impact: 'medium',
      evidence: 'Heavy alcohol consumption increases mortality risk',
      source: 'Global Burden of Disease Study 2019',
    });
  }

  // Vaccination recommendations
  if (!profile.vaccinations.flu) {
    recommendations.push({
      category: 'Prevention',
      recommendation: 'Get annual flu vaccination',
      impact: 'low',
      evidence: 'Flu vaccination reduces infectious disease mortality risk',
      source: 'CDC Vaccine Effectiveness Studies',
    });
  }

  if (!profile.vaccinations.covid) {
    recommendations.push({
      category: 'Prevention',
      recommendation: 'Get COVID-19 vaccination',
      impact: 'low',
      evidence: 'COVID-19 vaccination reduces infectious disease mortality risk',
      source: 'CDC COVID-19 Vaccine Studies',
    });
  }

  return recommendations;
}

/**
 * Export real data estimation result to JSON
 */
export function exportRealDataResult(result: EstimationResult): string {
  return JSON.stringify(result, null, 2);
}

/**
 * Import real data estimation result from JSON
 */
export function importRealDataResult(json: string): EstimationResult {
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
