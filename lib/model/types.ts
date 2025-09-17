// Domain types for the life expectancy estimation engine

export type Sex = 'male' | 'female' | 'other';

export type SmokingStatus = 'never' | 'former' | 'current';

export type AlcoholConsumption = 'none' | 'light' | 'moderate' | 'heavy';

export type BMIBand = 'underweight' | 'normal' | 'overweight' | 'obese';

export type ActivityLevel = 'sedentary' | 'low' | 'moderate' | 'high';

export type CauseCategory = 
  | 'cvd'        // Cardiovascular disease
  | 'cancer'     // Cancer
  | 'respiratory' // Respiratory disease
  | 'injury'     // External injuries/accidents
  | 'metabolic'  // Diabetes, metabolic disorders
  | 'neuro'      // Neurodegenerative diseases
  | 'infectious' // Infectious diseases
  | 'other';     // Other causes

export interface Vaccinations {
  flu: boolean;
  covid: boolean;
}

export interface UserProfile {
  age: number;
  sex: Sex;
  zip3: string;
  smoking: SmokingStatus;
  alcohol: AlcoholConsumption;
  activityMinutesPerWeek: number;
  vaccinations: Vaccinations;
  bmiBand?: BMIBand;
  medications?: string; // Free text, stored locally only
}

export interface MortalityTableRow {
  age: number;
  sex: Sex;
  qx: number; // Annual probability of death
  ex: number; // Remaining life expectancy
}

export interface CauseFraction {
  ageBand: string; // e.g., "40-44"
  sex: Sex;
  cause: CauseCategory;
  fraction: number; // Proportion of deaths from this cause
}

export interface HRPrior {
  factor: string;
  level: string;
  hrCentral: number; // Central hazard ratio
  logSd: number; // Log-normal standard deviation for uncertainty
  source: string; // Citation or data source
}

export interface RiskDriver {
  name: string;
  description: string;
  deltaQ1y: number; // Change in 1-year mortality risk
  impact: 'increase' | 'decrease' | 'neutral';
  confidence: 'high' | 'medium' | 'low';
}

export interface CauseMix {
  cvd: number;
  cancer: number;
  respiratory: number;
  injury: number;
  metabolic: number;
  neuro: number;
  infectious: number;
  other: number;
}

export interface UncertaintyInterval {
  lower: number;
  upper: number;
}

export interface EstimationResult {
  // Life expectancy
  lifeExpectancyMedian: number;
  lifeExpectancyCI80: UncertaintyInterval;
  
  // 1-year mortality risk
  risk1y: number;
  risk1yCI80: UncertaintyInterval;
  
  // Cause distributions
  causeMix1y: CauseMix;
  causeMixLifetime: CauseMix;
  
  // Risk drivers and explanations
  drivers: RiskDriver[];
  
  // Metadata
  modelVersion: string;
  dataVersion: string;
  computationTime: number;
  disclaimer: string;
  
  // Baseline comparison
  baselineRisk1y: number;
  baselineLifeExpectancy: number;
}

export interface BootstrapResult {
  risk1y: number[];
  lifeExpectancy: number[];
}

export interface SurvivalCurve {
  age: number;
  survival: number;
  hazard: number;
  qx: number;
}

// Configuration and bounds
export const BOUNDS = {
  MIN_AGE: 18,
  MAX_AGE: 110,
  MIN_ACTIVITY_MINUTES: 0,
  MAX_ACTIVITY_MINUTES: 1000,
  MAX_COMBINED_HR: 5.0, // Cap extreme risk combinations
  MIN_SURVIVAL_PROBABILITY: 1e-8,
} as const;

export const CAUSE_CATEGORIES: CauseCategory[] = [
  'cvd',
  'cancer', 
  'respiratory',
  'injury',
  'metabolic',
  'neuro',
  'infectious',
  'other'
];

export const CAUSE_LABELS: Record<CauseCategory, string> = {
  cvd: 'Cardiovascular Disease',
  cancer: 'Cancer',
  respiratory: 'Respiratory Disease',
  injury: 'Injuries & Accidents',
  metabolic: 'Metabolic Disorders',
  neuro: 'Neurodegenerative Diseases',
  infectious: 'Infectious Diseases',
  other: 'Other Causes'
};

export const SEX_LABELS: Record<Sex, string> = {
  male: 'Male',
  female: 'Female',
  other: 'Other/Non-binary'
};

export const SMOKING_LABELS: Record<SmokingStatus, string> = {
  never: 'Never smoked',
  former: 'Former smoker',
  current: 'Current smoker'
};

export const ALCOHOL_LABELS: Record<AlcoholConsumption, string> = {
  none: 'No alcohol',
  light: 'Light drinking',
  moderate: 'Moderate drinking',
  heavy: 'Heavy drinking'
};
