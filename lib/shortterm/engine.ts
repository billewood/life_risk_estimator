// Short-term (6-month) mortality risk calculation engine
// Completely separate from annual/lifetime risk calculations

import { 
  ShortTermRiskProfile, 
  ShortTermRiskResult, 
  ShortTermRiskLevel,
  ShortTermRiskFactor,
  RISK_LEVEL_THRESHOLDS 
} from './types';
import { SHORT_TERM_RISK_DATA, BASELINE_6MONTH_RISK, EMERGENCY_RESOURCES, TRANSPORTATION_RISK_MULTIPLIERS } from './data';

/**
 * Calculate 6-month mortality risk from profile
 */
export function calculateShortTermRisk(
  profile: ShortTermRiskProfile,
  age: number,
  sex: 'male' | 'female'
): ShortTermRiskResult {
  // Get baseline risk for age group
  const ageGroup = getAgeGroup(age);
  const baselineRisk = BASELINE_6MONTH_RISK[ageGroup][sex];
  
  // Calculate risk score (0-100)
  const riskScore = calculateRiskScore(profile);
  
  // Apply risk multipliers
  let adjustedRisk: number = baselineRisk;
  const topRiskFactors: Array<{
    factor: ShortTermRiskFactor;
    impact: number;
    description: string;
  }> = [];
  
  // Check each risk factor
  if (profile.recentHospitalization) {
    adjustedRisk *= SHORT_TERM_RISK_DATA.recent_hospitalization.riskMultiplier;
    topRiskFactors.push({
      factor: 'recent_hospitalization',
      impact: SHORT_TERM_RISK_DATA.recent_hospitalization.riskMultiplier - 1,
      description: SHORT_TERM_RISK_DATA.recent_hospitalization.description
    });
  }
  
  if (profile.recentFalls > 0) {
    const fallMultiplier = Math.min(1 + (profile.recentFalls * 0.5), 2.8);
    adjustedRisk *= fallMultiplier;
    topRiskFactors.push({
      factor: 'recent_falls',
      impact: fallMultiplier - 1,
      description: `${profile.recentFalls} recent falls increase mortality risk`
    });
  }
  
  if (profile.recentERVisits > 0) {
    const erMultiplier = Math.min(1 + (profile.recentERVisits * 0.3), 2.3);
    adjustedRisk *= erMultiplier;
    topRiskFactors.push({
      factor: 'emergency_care',
      impact: erMultiplier - 1,
      description: `${profile.recentERVisits} recent ER visits increase mortality risk`
    });
  }
  
  if (profile.functionalDecline) {
    adjustedRisk *= SHORT_TERM_RISK_DATA.functional_decline.riskMultiplier;
    topRiskFactors.push({
      factor: 'functional_decline',
      impact: SHORT_TERM_RISK_DATA.functional_decline.riskMultiplier - 1,
      description: SHORT_TERM_RISK_DATA.functional_decline.description
    });
  }
  
  if (profile.cognitiveDecline) {
    adjustedRisk *= SHORT_TERM_RISK_DATA.cognitive_decline.riskMultiplier;
    topRiskFactors.push({
      factor: 'cognitive_decline',
      impact: SHORT_TERM_RISK_DATA.cognitive_decline.riskMultiplier - 1,
      description: SHORT_TERM_RISK_DATA.cognitive_decline.description
    });
  }
  
  if (profile.weightLoss) {
    adjustedRisk *= SHORT_TERM_RISK_DATA.weight_loss.riskMultiplier;
    topRiskFactors.push({
      factor: 'weight_loss',
      impact: SHORT_TERM_RISK_DATA.weight_loss.riskMultiplier - 1,
      description: SHORT_TERM_RISK_DATA.weight_loss.description
    });
  }
  
  if (profile.socialSupport === 'none' || profile.livingAlone) {
    adjustedRisk *= SHORT_TERM_RISK_DATA.social_isolation.riskMultiplier;
    topRiskFactors.push({
      factor: 'social_isolation',
      impact: SHORT_TERM_RISK_DATA.social_isolation.riskMultiplier - 1,
      description: SHORT_TERM_RISK_DATA.social_isolation.description
    });
  }
  
  if (profile.depressionAnxiety) {
    adjustedRisk *= SHORT_TERM_RISK_DATA.depression_anxiety.riskMultiplier;
    topRiskFactors.push({
      factor: 'depression_anxiety',
      impact: SHORT_TERM_RISK_DATA.depression_anxiety.riskMultiplier - 1,
      description: SHORT_TERM_RISK_DATA.depression_anxiety.description
    });
  }
  
  if (profile.alcoholUse === 'heavy' || profile.drugUse) {
    adjustedRisk *= SHORT_TERM_RISK_DATA.substance_use.riskMultiplier;
    topRiskFactors.push({
      factor: 'substance_use',
      impact: SHORT_TERM_RISK_DATA.substance_use.riskMultiplier - 1,
      description: SHORT_TERM_RISK_DATA.substance_use.description
    });
  }
  
  if (profile.medicationAdherence === 'poor' || profile.medicationAdherence === 'very_poor') {
    adjustedRisk *= SHORT_TERM_RISK_DATA.medication_adherence.riskMultiplier;
    topRiskFactors.push({
      factor: 'medication_adherence',
      impact: SHORT_TERM_RISK_DATA.medication_adherence.riskMultiplier - 1,
      description: SHORT_TERM_RISK_DATA.medication_adherence.description
    });
  }
  
  if (profile.poorNutrition) {
    adjustedRisk *= SHORT_TERM_RISK_DATA.nutritional_status.riskMultiplier;
    topRiskFactors.push({
      factor: 'nutritional_status',
      impact: SHORT_TERM_RISK_DATA.nutritional_status.riskMultiplier - 1,
      description: SHORT_TERM_RISK_DATA.nutritional_status.description
    });
  }
  
  if (profile.mobilityIssues) {
    adjustedRisk *= SHORT_TERM_RISK_DATA.mobility_issues.riskMultiplier;
    topRiskFactors.push({
      factor: 'mobility_issues',
      impact: SHORT_TERM_RISK_DATA.mobility_issues.riskMultiplier - 1,
      description: SHORT_TERM_RISK_DATA.mobility_issues.description
    });
  }
  
  if (profile.financialStress) {
    adjustedRisk *= SHORT_TERM_RISK_DATA.financial_stress.riskMultiplier;
    topRiskFactors.push({
      factor: 'financial_stress',
      impact: SHORT_TERM_RISK_DATA.financial_stress.riskMultiplier - 1,
      description: SHORT_TERM_RISK_DATA.financial_stress.description
    });
  }
  
  // Transportation factors
  const drivingMultiplier = TRANSPORTATION_RISK_MULTIPLIERS.driving[profile.drivingFrequency];
  adjustedRisk *= drivingMultiplier;
  if (drivingMultiplier !== 1.0) {
    topRiskFactors.push({
      factor: 'driving_frequency',
      impact: drivingMultiplier - 1,
      description: `${profile.drivingFrequency} driving frequency affects accident risk`
    });
  }
  
  const cyclingMultiplier = TRANSPORTATION_RISK_MULTIPLIERS.cycling[profile.cyclingActivity];
  adjustedRisk *= cyclingMultiplier;
  if (cyclingMultiplier !== 1.0) {
    topRiskFactors.push({
      factor: 'cycling_activity',
      impact: cyclingMultiplier - 1,
      description: `${profile.cyclingActivity} cycling activity affects health and accident risk`
    });
  }
  
  // Family history
  if (profile.familyHeartDisease) {
    adjustedRisk *= SHORT_TERM_RISK_DATA.family_heart_disease.riskMultiplier;
    topRiskFactors.push({
      factor: 'family_heart_disease',
      impact: SHORT_TERM_RISK_DATA.family_heart_disease.riskMultiplier - 1,
      description: SHORT_TERM_RISK_DATA.family_heart_disease.description
    });
  }
  
  // Cap the risk at reasonable maximum (50% for 6 months)
  adjustedRisk = Math.min(adjustedRisk, 0.5);
  
  // Determine risk level
  const riskLevel = determineRiskLevel(riskScore);
  
  // Generate mitigation strategies
  const mitigationStrategies = generateMitigationStrategies(topRiskFactors);
  
  // Determine emergency resources needed
  const emergencyResources = determineEmergencyResources(riskLevel, topRiskFactors);
  
  return {
    risk6Months: adjustedRisk,
    riskLevel,
    riskScore,
    topRiskFactors: topRiskFactors.slice(0, 5), // Top 5 risk factors
    mitigationStrategies,
    emergencyResources,
    calculationDate: new Date().toISOString(),
    modelVersion: 'v1.0',
    disclaimer: 'This assessment is for educational purposes only and not a substitute for professional medical evaluation. Seek immediate medical attention for urgent health concerns.'
  };
}

/**
 * Calculate risk score (0-100) based on profile
 */
function calculateRiskScore(profile: ShortTermRiskProfile): number {
  let score = 0;
  
  // Health factors (higher weight)
  if (profile.recentHospitalization) score += 25;
  if (profile.recentFalls > 0) score += profile.recentFalls * 8;
  if (profile.recentERVisits > 0) score += profile.recentERVisits * 10;
  if (profile.weightLoss) score += 15;
  if (profile.functionalDecline) score += 20;
  if (profile.cognitiveDecline) score += 18;
  if (profile.mobilityIssues) score += 12;
  if (profile.poorNutrition) score += 10;
  
  // Social factors
  if (profile.socialSupport === 'none') score += 15;
  if (profile.livingAlone) score += 8;
  if (profile.financialStress) score += 10;
  
  // Mental health
  if (profile.depressionAnxiety) score += 12;
  
  // Substance use
  if (profile.alcoholUse === 'heavy') score += 15;
  if (profile.drugUse) score += 20;
  
  // Care factors
  if (profile.medicationAdherence === 'poor') score += 8;
  if (profile.medicationAdherence === 'very_poor') score += 15;
  if (profile.recentMedChanges) score += 5;
  
  // Transportation factors
  const drivingScore = {
    none: 0,     // No additional risk
    rare: 2,     // Minimal risk
    moderate: 5, // Baseline
    frequent: 8, // Increased risk
    daily: 12    // Highest risk
  };
  score += drivingScore[profile.drivingFrequency];
  
  const cyclingScore = {
    none: 0,        // No risk or benefit
    occasional: -1, // Slight benefit
    regular: -2,    // Good benefit
    daily: -3       // Strong benefit
  };
  score += cyclingScore[profile.cyclingActivity];
  
  // Family history
  if (profile.familyHeartDisease) score += 8;
  
  return Math.min(score, 100);
}

/**
 * Determine risk level from score
 */
function determineRiskLevel(score: number): ShortTermRiskLevel {
  if (score >= RISK_LEVEL_THRESHOLDS.very_high.min) return 'very_high';
  if (score >= RISK_LEVEL_THRESHOLDS.high.min) return 'high';
  if (score >= RISK_LEVEL_THRESHOLDS.moderate.min) return 'moderate';
  return 'low';
}

/**
 * Generate mitigation strategies based on risk factors
 */
function generateMitigationStrategies(topRiskFactors: Array<{ factor: ShortTermRiskFactor; impact: number; description: string }>) {
  const strategies: Array<{
    factor: ShortTermRiskFactor;
    strategy: string;
    impact: 'high' | 'medium' | 'low';
    urgency: 'immediate' | 'within_week' | 'within_month';
  }> = [];
  
  for (const factor of topRiskFactors) {
    const data = SHORT_TERM_RISK_DATA[factor.factor];
    strategies.push({
      factor: factor.factor,
      strategy: data.mitigation,
      impact: factor.impact > 1.5 ? 'high' as const : factor.impact > 1.2 ? 'medium' as const : 'low' as const,
      urgency: factor.impact > 2.0 ? 'immediate' as const : factor.impact > 1.5 ? 'within_week' as const : 'within_month' as const
    });
  }
  
  return strategies;
}

/**
 * Determine emergency resources needed
 */
function determineEmergencyResources(riskLevel: ShortTermRiskLevel, topRiskFactors: Array<{ factor: ShortTermRiskFactor; impact: number; description: string }>) {
  const resources = [];
  
  // Always include crisis line for high/very high risk
  if (riskLevel === 'very_high' || riskLevel === 'high') {
    resources.push(EMERGENCY_RESOURCES.crisis_line);
  }
  
  // Add specific resources based on risk factors
  const hasMentalHealthRisk = topRiskFactors.some(f => f.factor === 'depression_anxiety');
  const hasSubstanceRisk = topRiskFactors.some(f => f.factor === 'substance_use');
  const hasHealthRisk = topRiskFactors.some(f => 
    ['recent_hospitalization', 'emergency_care', 'functional_decline'].includes(f.factor)
  );
  
  if (hasMentalHealthRisk || hasSubstanceRisk) {
    resources.push(EMERGENCY_RESOURCES.crisis_line);
  }
  
  if (hasHealthRisk) {
    resources.push(EMERGENCY_RESOURCES.primary_care);
  }
  
  if (riskLevel === 'very_high') {
    resources.push(EMERGENCY_RESOURCES.emergency_room);
  }
  
  return resources;
}

/**
 * Get age group for baseline risk lookup
 */
function getAgeGroup(age: number): keyof typeof BASELINE_6MONTH_RISK {
  if (age <= 30) return '18-30';
  if (age <= 45) return '31-45';
  if (age <= 60) return '46-60';
  if (age <= 75) return '61-75';
  if (age <= 85) return '76-85';
  return '86+';
}