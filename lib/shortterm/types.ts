// Types for short-term (6-month) mortality risk assessment
// This is completely separate from the annual/lifetime risk calculations

export type ShortTermRiskFactor = 
  // Health Events
  | 'recent_hospitalization'    // Hospitalized in last 30 days
  | 'recent_falls'             // Falls in last 3 months
  | 'emergency_care'           // Recent ER visits
  
  // Functional Status
  | 'functional_decline'       // Recent functional decline
  | 'mobility_issues'          // Recent mobility problems
  | 'cognitive_decline'        // Recent cognitive changes
  
  // Social & Environmental
  | 'social_isolation'         // Living alone, no support
  | 'financial_stress'         // Financial hardship affecting care
  
  // Mental Health & Substance Use
  | 'depression_anxiety'       // Mental health concerns
  | 'substance_use'            // Alcohol/drug use patterns
  
  // Medical Care
  | 'medication_changes'       // Recent medication changes
  | 'medication_adherence'     // Medication compliance issues
  | 'chronic_conditions'       // Acute exacerbation of chronic conditions
  
  // Nutrition & Physical
  | 'weight_loss'              // Unintentional weight loss
  | 'nutritional_status'       // Poor nutrition, eating patterns
  
  // Transportation & Activity
  | 'driving_frequency'        // How much they drive (accident risk)
  | 'cycling_activity'         // Biking activity (accident risk + health benefit)
  
  // Family History & Genetics
  | 'family_heart_disease';    // Family history of heart disease

export type ShortTermRiskLevel = 'low' | 'moderate' | 'high' | 'very_high';

export interface ShortTermRiskProfile {
  // Recent health events
  recentHospitalization: boolean;
  recentFalls: number; // Number of falls in last 3 months
  recentERVisits: number; // Number of ER visits in last 6 months
  
  // Functional status
  functionalDecline: boolean;
  mobilityIssues: boolean;
  cognitiveDecline: boolean;
  
  // Social factors
  livingAlone: boolean;
  socialSupport: 'excellent' | 'good' | 'limited' | 'none';
  
  // Mental health
  depressionAnxiety: boolean;
  
  // Substance use
  alcoholUse: 'none' | 'light' | 'moderate' | 'heavy';
  drugUse: boolean;
  
  // Medication and care
  medicationAdherence: 'excellent' | 'good' | 'poor' | 'very_poor';
  recentMedChanges: boolean;
  
  // Nutritional status
  weightLoss: boolean;
  poorNutrition: boolean;
  
  // Chronic conditions (acute exacerbation risk)
  diabetes: boolean;
  heartDisease: boolean;
  copd: boolean;
  kidneyDisease: boolean;
  cancer: boolean;
  
  // Financial stress
  financialStress: boolean;
  
  // Transportation & Activity
  drivingFrequency: 'none' | 'rare' | 'moderate' | 'frequent' | 'daily';
  cyclingActivity: 'none' | 'occasional' | 'regular' | 'daily';
  
  // Family History & Genetics
  familyHeartDisease: boolean;
}

export interface ShortTermRiskResult {
  // Overall risk
  risk6Months: number; // Probability of death in next 6 months
  riskLevel: ShortTermRiskLevel;
  riskScore: number; // 0-100 risk score
  
  // Risk breakdown
  topRiskFactors: Array<{
    factor: ShortTermRiskFactor;
    impact: number; // Contribution to overall risk
    description: string;
  }>;
  
  // Mitigation strategies
  mitigationStrategies: Array<{
    factor: ShortTermRiskFactor;
    strategy: string;
    impact: 'high' | 'medium' | 'low';
    urgency: 'immediate' | 'within_week' | 'within_month';
  }>;
  
  // Emergency resources
  emergencyResources: Array<{
    type: 'crisis_line' | 'emergency_room' | 'urgent_care' | 'primary_care';
    description: string;
    contact: string;
  }>;
  
  // Metadata
  calculationDate: string;
  modelVersion: string;
  disclaimer: string;
}

export interface ShortTermRiskFactorData {
  factor: ShortTermRiskFactor;
  riskMultiplier: number; // How much this increases 6-month risk
  confidence: 'high' | 'medium' | 'low';
  source: string;
  description: string;
  mitigation: string;
}

export const RISK_LEVEL_THRESHOLDS = {
  low: { min: 0, max: 2 },
  moderate: { min: 2, max: 5 },
  high: { min: 5, max: 10 },
  very_high: { min: 10, max: 100 }
} as const;