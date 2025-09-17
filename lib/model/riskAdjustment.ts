import { 
  UserProfile, 
  SmokingStatus, 
  AlcoholConsumption, 
  BMIBand, 
  HRPrior,
  RiskDriver 
} from './types';
import { getRealHRPrior, getRealHRPriors } from '@/lib/data/realDataLoader';
import { sampleLogNormalFromCentral } from '@/lib/math/stats';
import { BOUNDS } from './types';

export interface RiskAdjustmentResult {
  totalHR: number;
  components: Array<{
    factor: string;
    level: string;
    hr: number;
    rationale: string;
    source: string;
  }>;
}

/**
 * Get activity level from weekly minutes
 */
function getActivityLevel(activityMinutesPerWeek: number): 'sedentary' | 'low' | 'moderate' | 'high' {
  if (activityMinutesPerWeek === 0) return 'sedentary';
  if (activityMinutesPerWeek < 75) return 'low';
  if (activityMinutesPerWeek < 150) return 'moderate';
  return 'high';
}

/**
 * Compose hazard ratio from user profile
 */
export async function composeHR(profile: UserProfile): Promise<RiskAdjustmentResult> {
  const components: Array<{
    factor: string;
    level: string;
    hr: number;
    rationale: string;
    source: string;
  }> = [];

  let totalHR = 1.0;

  // Smoking status
  const smokingHR = await getRealHRPrior('smoking', profile.smoking);
  if (smokingHR) {
    totalHR *= smokingHR.hrCentral;
    components.push({
      factor: 'smoking',
      level: profile.smoking,
      hr: smokingHR.hrCentral,
      rationale: getSmokingRationale(profile.smoking),
      source: smokingHR.source,
    });
  }

  // Alcohol consumption
  const alcoholHR = await getRealHRPrior('alcohol', profile.alcohol);
  if (alcoholHR) {
    totalHR *= alcoholHR.hrCentral;
    components.push({
      factor: 'alcohol',
      level: profile.alcohol,
      hr: alcoholHR.hrCentral,
      rationale: getAlcoholRationale(profile.alcohol),
      source: alcoholHR.source,
    });
  }

  // Physical activity
  const activityLevel = getActivityLevel(profile.activityMinutesPerWeek);
  const activityHR = await getRealHRPrior('activity', activityLevel);
  if (activityHR) {
    totalHR *= activityHR.hrCentral;
    components.push({
      factor: 'activity',
      level: activityLevel,
      hr: activityHR.hrCentral,
      rationale: getActivityRationale(activityLevel, profile.activityMinutesPerWeek),
      source: activityHR.source,
    });
  }

  // BMI (if provided)
  if (profile.bmiBand) {
    const bmiHR = await getRealHRPrior('bmi', profile.bmiBand);
    if (bmiHR) {
      totalHR *= bmiHR.hrCentral;
      components.push({
        factor: 'bmi',
        level: profile.bmiBand,
        hr: bmiHR.hrCentral,
        rationale: getBMIRationale(profile.bmiBand),
        source: bmiHR.source,
      });
    }
  }

  // Cap extreme combined HR to avoid unrealistic estimates
  totalHR = Math.min(totalHR, BOUNDS.MAX_COMBINED_HR);

  return {
    totalHR,
    components,
  };
}

/**
 * Sample hazard ratios for uncertainty analysis
 */
export async function sampleHRs(
  profile: UserProfile, 
  seed?: number
): Promise<RiskAdjustmentResult> {
  // Create seeded random number generator
  const random = seed ? createSeededRandom(seed) : Math.random;
  
  const components: Array<{
    factor: string;
    level: string;
    hr: number;
    rationale: string;
    source: string;
  }> = [];

  let totalHR = 1.0;

  // Sample smoking HR
    const smokingPrior = await getRealHRPrior('smoking', profile.smoking);
  if (smokingPrior) {
    const sampledHR = sampleLogNormalFromCentral(smokingPrior.hrCentral, smokingPrior.logSd, random);
    totalHR *= sampledHR;
    components.push({
      factor: 'smoking',
      level: profile.smoking,
      hr: sampledHR,
      rationale: getSmokingRationale(profile.smoking),
      source: smokingPrior.source,
    });
  }

  // Sample alcohol HR
    const alcoholPrior = await getRealHRPrior('alcohol', profile.alcohol);
  if (alcoholPrior) {
    const sampledHR = sampleLogNormalFromCentral(alcoholPrior.hrCentral, alcoholPrior.logSd, random);
    totalHR *= sampledHR;
    components.push({
      factor: 'alcohol',
      level: profile.alcohol,
      hr: sampledHR,
      rationale: getAlcoholRationale(profile.alcohol),
      source: alcoholPrior.source,
    });
  }

  // Sample activity HR
  const activityLevel = getActivityLevel(profile.activityMinutesPerWeek);
    const activityPrior = await getRealHRPrior('activity', activityLevel);
  if (activityPrior) {
    const sampledHR = sampleLogNormalFromCentral(activityPrior.hrCentral, activityPrior.logSd, random);
    totalHR *= sampledHR;
    components.push({
      factor: 'activity',
      level: activityLevel,
      hr: sampledHR,
      rationale: getActivityRationale(activityLevel, profile.activityMinutesPerWeek),
      source: activityPrior.source,
    });
  }

  // Sample BMI HR (if provided)
  if (profile.bmiBand) {
    const bmiPrior = await getRealHRPrior('bmi', profile.bmiBand);
    if (bmiPrior) {
      const sampledHR = sampleLogNormalFromCentral(bmiPrior.hrCentral, bmiPrior.logSd, random);
      totalHR *= sampledHR;
      components.push({
        factor: 'bmi',
        level: profile.bmiBand,
        hr: sampledHR,
        rationale: getBMIRationale(profile.bmiBand),
        source: bmiPrior.source,
      });
    }
  }

  // Cap extreme combined HR
  totalHR = Math.min(totalHR, BOUNDS.MAX_COMBINED_HR);

  return {
    totalHR,
    components,
  };
}

/**
 * Get vaccination modifiers for infectious/respiratory mortality (next-year only)
 */
export async function vaccinationModifiers(profile: UserProfile): Promise<{
  infectious: number;
  respiratory: number;
}> {
  let infectiousModifier = 1.0;
  let respiratoryModifier = 1.0;

  // Flu vaccination
  if (profile.vaccinations.flu) {
    const fluHR = await getRealHRPrior('vaccination', 'flu');
    if (fluHR) {
      infectiousModifier *= fluHR.hrCentral;
      respiratoryModifier *= fluHR.hrCentral;
    }
  }

  // COVID vaccination
  if (profile.vaccinations.covid) {
    const covidHR = await getRealHRPrior('vaccination', 'covid');
    if (covidHR) {
      infectiousModifier *= covidHR.hrCentral;
      respiratoryModifier *= covidHR.hrCentral;
    }
  }

  return {
    infectious: infectiousModifier,
    respiratory: respiratoryModifier,
  };
}

/**
 * Create risk drivers from adjustment components
 */
export function createRiskDrivers(
  components: RiskAdjustmentResult['components'],
  baselineRisk: number
): RiskDriver[] {
  return components.map(comp => {
    const deltaRisk = baselineRisk * (comp.hr - 1);
    let impact: 'increase' | 'decrease' | 'neutral';
    
    if (comp.hr > 1.1) impact = 'increase';
    else if (comp.hr < 0.9) impact = 'decrease';
    else impact = 'neutral';

    let confidence: 'high' | 'medium' | 'low' = 'medium';
    if (comp.factor === 'smoking' || comp.factor === 'activity') confidence = 'high';
    if (comp.factor === 'bmi') confidence = 'low';

    return {
      name: comp.factor,
      description: comp.rationale,
      deltaQ1y: deltaRisk,
      impact,
      confidence,
    };
  });
}

// Rationale functions
function getSmokingRationale(status: SmokingStatus): string {
  switch (status) {
    case 'never':
      return 'Never smoking reduces risk compared to population average';
    case 'former':
      return 'Former smoking increases risk but less than current smoking';
    case 'current':
      return 'Current smoking significantly increases mortality risk';
    default:
      return 'Smoking status affects mortality risk';
  }
}

function getAlcoholRationale(consumption: AlcoholConsumption): string {
  switch (consumption) {
    case 'none':
      return 'No alcohol consumption is generally protective';
    case 'moderate':
      return 'Moderate alcohol consumption has minimal impact on mortality';
    case 'heavy':
      return 'Heavy alcohol consumption increases mortality risk';
    default:
      return 'Alcohol consumption affects mortality risk';
  }
}

function getActivityRationale(level: string, minutes: number): string {
  switch (level) {
    case 'sedentary':
      return `No physical activity (${minutes} min/week) increases mortality risk`;
    case 'low':
      return `Low physical activity (${minutes} min/week) slightly increases risk`;
    case 'moderate':
      return `Moderate physical activity (${minutes} min/week) reduces mortality risk`;
    case 'high':
      return `High physical activity (${minutes} min/week) significantly reduces mortality risk`;
    default:
      return `Physical activity level (${minutes} min/week) affects mortality risk`;
  }
}

function getBMIRationale(band: BMIBand): string {
  switch (band) {
    case 'underweight':
      return 'Underweight BMI increases mortality risk';
    case 'normal':
      return 'Normal BMI is associated with lowest mortality risk';
    case 'overweight':
      return 'Overweight BMI slightly increases mortality risk';
    case 'obese':
      return 'Obese BMI increases mortality risk';
    default:
      return 'BMI affects mortality risk';
  }
}

// Simple seeded random number generator (Linear Congruential Generator)
function createSeededRandom(seed: number): () => number {
  let current = seed;
  return () => {
    current = (current * 1664525 + 1013904223) % Math.pow(2, 32);
    return current / Math.pow(2, 32);
  };
}
