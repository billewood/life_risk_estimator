import { 
  UserProfile, 
  CauseCategory, 
  CauseMix, 
  SmokingStatus, 
  AlcoholConsumption, 
  BMIBand 
} from './types';
import { getRealCauseFractions, getRealAgeBand } from '@/lib/data/realDataLoader';
import { vaccinationModifiers } from './riskAdjustment';

/**
 * Get baseline cause fractions for age band and sex
 */
export async function baselineFractions(ageBand: string, sex: string): Promise<CauseMix> {
  const fractions = await getRealCauseFractions(ageBand, sex as any);
  
  const causeMix: CauseMix = {
    cvd: 0,
    cancer: 0,
    respiratory: 0,
    injury: 0,
    metabolic: 0,
    neuro: 0,
    infectious: 0,
    other: 0,
  };

  for (const fraction of fractions) {
    causeMix[fraction.cause] = fraction.fraction;
  }

  return causeMix;
}

/**
 * Reweight cause fractions based on user profile
 */
export function reweightForProfile(
  fractions: CauseMix,
  profile: UserProfile,
  horizon: '1y' | 'lifetime'
): CauseMix {
  const reweighted = { ...fractions };

  // Smoking effects
  if (profile.smoking === 'current') {
    // Increase respiratory and cancer, decrease others proportionally
    reweighted.respiratory *= 2.0;
    reweighted.cancer *= 1.5;
    
    // For 1-year horizon, smoking has stronger effect on respiratory
    if (horizon === '1y') {
      reweighted.respiratory *= 1.3;
    }
  } else if (profile.smoking === 'former') {
    // Moderate increases
    reweighted.respiratory *= 1.3;
    reweighted.cancer *= 1.2;
  }

  // Alcohol effects
  if (profile.alcohol === 'heavy') {
    reweighted.injury *= 2.0; // Accidents, violence
    reweighted.cancer *= 1.3; // Liver, esophageal cancer
  } else if (profile.alcohol === 'moderate') {
    // J-curve effect - slight reduction in CVD, slight increase in injury
    reweighted.cvd *= 0.95;
    reweighted.injury *= 1.1;
  }

  // Physical activity effects
  const activityLevel = getActivityLevel(profile.activityMinutesPerWeek);
  if (activityLevel === 'sedentary' || activityLevel === 'low') {
    reweighted.cvd *= 1.4;
    reweighted.metabolic *= 1.3;
  } else if (activityLevel === 'high') {
    reweighted.cvd *= 0.7;
    reweighted.metabolic *= 0.8;
  }

  // BMI effects
  if (profile.bmiBand === 'obese') {
    reweighted.cvd *= 1.3;
    reweighted.metabolic *= 1.5;
    reweighted.cancer *= 1.1;
  } else if (profile.bmiBand === 'overweight') {
    reweighted.cvd *= 1.1;
    reweighted.metabolic *= 1.2;
  } else if (profile.bmiBand === 'underweight') {
    reweighted.infectious *= 1.2;
    reweighted.cancer *= 1.1;
  }

  // Vaccination effects (only for 1-year horizon)
  if (horizon === '1y') {
    vaccinationModifiers(profile).then(modifiers => {
      reweighted.infectious *= modifiers.infectious;
      reweighted.respiratory *= modifiers.respiratory;
    });
  }

  // Normalize to sum to 1
  return normalizeCauseMix(reweighted);
}

/**
 * Allocate absolute risk to causes
 */
export function allocateToAbsoluteRisk(totalRisk: number, fractions: CauseMix): CauseMix {
  const allocated: CauseMix = {
    cvd: totalRisk * fractions.cvd,
    cancer: totalRisk * fractions.cancer,
    respiratory: totalRisk * fractions.respiratory,
    injury: totalRisk * fractions.injury,
    metabolic: totalRisk * fractions.metabolic,
    neuro: totalRisk * fractions.neuro,
    infectious: totalRisk * fractions.infectious,
    other: totalRisk * fractions.other,
  };

  return allocated;
}

/**
 * Estimate cause mix for a specific profile and horizon
 */
export async function estimateCauseMix(
  profile: UserProfile,
  horizon: '1y' | 'lifetime'
): Promise<CauseMix> {
  const ageBand = getRealAgeBand(profile.age);
  const baselineFracs = await baselineFractions(ageBand, profile.sex);
  const reweightedFractions = reweightForProfile(baselineFracs, profile, horizon);
  return reweightedFractions;
}

/**
 * Get top 5 causes by fraction
 */
export function getTop5Causes(causeMix: CauseMix): Array<{ cause: CauseCategory; fraction: number }> {
  return Object.entries(causeMix)
    .map(([cause, fraction]) => ({ cause: cause as CauseCategory, fraction }))
    .sort((a, b) => b.fraction - a.fraction)
    .slice(0, 5);
}

/**
 * Calculate years of life lost by cause
 */
export function calculateYLLByCause(
  causeMix: CauseMix,
  totalYLL: number
): CauseMix {
  return allocateToAbsoluteRisk(totalYLL, causeMix);
}

/**
 * Compare cause mixes
 */
export function compareCauseMixes(
  mix1: CauseMix,
  mix2: CauseMix
): Array<{ cause: CauseCategory; difference: number; relativeChange: number }> {
  const causes: CauseCategory[] = ['cvd', 'cancer', 'respiratory', 'injury', 'metabolic', 'neuro', 'infectious', 'other'];
  
  return causes.map(cause => {
    const difference = mix2[cause] - mix1[cause];
    const relativeChange = mix1[cause] > 0 ? difference / mix1[cause] : 0;
    
    return {
      cause,
      difference,
      relativeChange,
    };
  });
}

/**
 * Get cause-specific risk factors
 */
export function getCauseSpecificRiskFactors(profile: UserProfile): Record<CauseCategory, string[]> {
  const factors: Record<CauseCategory, string[]> = {
    cvd: [],
    cancer: [],
    respiratory: [],
    injury: [],
    metabolic: [],
    neuro: [],
    infectious: [],
    other: [],
  };

  // Smoking effects
  if (profile.smoking === 'current') {
    factors.respiratory.push('Current smoking');
    factors.cancer.push('Current smoking');
  } else if (profile.smoking === 'former') {
    factors.respiratory.push('Former smoking');
    factors.cancer.push('Former smoking');
  }

  // Alcohol effects
  if (profile.alcohol === 'heavy') {
    factors.injury.push('Heavy alcohol consumption');
    factors.cancer.push('Heavy alcohol consumption');
  }

  // Activity effects
  const activityLevel = getActivityLevel(profile.activityMinutesPerWeek);
  if (activityLevel === 'sedentary' || activityLevel === 'low') {
    factors.cvd.push('Low physical activity');
    factors.metabolic.push('Low physical activity');
  }

  // BMI effects
  if (profile.bmiBand === 'obese') {
    factors.cvd.push('Obesity');
    factors.metabolic.push('Obesity');
    factors.cancer.push('Obesity');
  } else if (profile.bmiBand === 'underweight') {
    factors.infectious.push('Underweight');
  }

  // Vaccination effects
  if (profile.vaccinations.flu) {
    factors.infectious.push('Flu vaccination (protective)');
    factors.respiratory.push('Flu vaccination (protective)');
  }
  if (profile.vaccinations.covid) {
    factors.infectious.push('COVID-19 vaccination (protective)');
  }

  return factors;
}

/**
 * Normalize cause mix to sum to 1
 */
function normalizeCauseMix(causeMix: CauseMix): CauseMix {
  const sum = Object.values(causeMix).reduce((total, fraction) => total + fraction, 0);
  
  if (sum === 0) return causeMix;
  
  const normalized: CauseMix = {
    cvd: causeMix.cvd / sum,
    cancer: causeMix.cancer / sum,
    respiratory: causeMix.respiratory / sum,
    injury: causeMix.injury / sum,
    metabolic: causeMix.metabolic / sum,
    neuro: causeMix.neuro / sum,
    infectious: causeMix.infectious / sum,
    other: causeMix.other / sum,
  };

  return normalized;
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
