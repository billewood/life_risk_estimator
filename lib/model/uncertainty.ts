import { UserProfile, BootstrapResult, UncertaintyInterval } from './types';
import { sampleHRs } from './riskAdjustment';
import { applyHRToAnnualProb } from './survival';
import { getBaseline1YearRisk, getBaselineLifeExpectancy, sequenceFrom } from './baselineMortality';
import { buildSurvivalCurve, calculateLifeExpectancy } from './survival';
import { confidenceInterval80 } from '@/lib/math/stats';
import { BOUNDS } from './types';

/**
 * Bootstrap uncertainty analysis for mortality estimates
 */
export async function bootstrap(
  profile: UserProfile,
  nSamples: number = 200,
  seed?: number
): Promise<BootstrapResult> {
  const risk1yResults: number[] = [];
  const lifeExpectancyResults: number[] = [];

  // Get baseline values
  const baselineRisk1y = await getBaseline1YearRisk(profile.age, profile.sex);
  const baselineLE = await getBaselineLifeExpectancy(profile.age, profile.sex);
  const baselineSequence = await sequenceFrom(profile.age, profile.sex);

  for (let i = 0; i < nSamples; i++) {
    try {
      // Sample hazard ratios
      const sampleSeed = seed ? seed + i : undefined;
      const hrResult = await sampleHRs(profile, sampleSeed);
      
      // Calculate 1-year risk
      const adjustedRisk1y = applyHRToAnnualProb(baselineRisk1y, hrResult.totalHR);
      risk1yResults.push(adjustedRisk1y);
      
      // Calculate life expectancy
      const adjustedSequence = baselineSequence.map(qx => applyHRToAnnualProb(qx, hrResult.totalHR));
      const survivalCurve = buildSurvivalCurve(profile.age, adjustedSequence);
      const lifeExpectancy = calculateLifeExpectancy(survivalCurve);
      lifeExpectancyResults.push(lifeExpectancy);
      
    } catch (error) {
      // If sampling fails, use baseline values
      risk1yResults.push(baselineRisk1y);
      lifeExpectancyResults.push(baselineLE);
    }
  }

  return {
    risk1y: risk1yResults,
    lifeExpectancy: lifeExpectancyResults,
  };
}

/**
 * Calculate confidence intervals from bootstrap results
 */
export function calculateConfidenceIntervals(
  bootstrapResult: BootstrapResult
): {
  risk1yCI80: UncertaintyInterval;
  lifeExpectancyCI80: UncertaintyInterval;
} {
  return {
    risk1yCI80: confidenceInterval80(bootstrapResult.risk1y),
    lifeExpectancyCI80: confidenceInterval80(bootstrapResult.lifeExpectancy),
  };
}

/**
 * Calculate sensitivity analysis - which factors contribute most to uncertainty
 */
export async function sensitivityAnalysis(
  profile: UserProfile,
  nSamples: number = 100
): Promise<Array<{
  factor: string;
  contribution: number;
  description: string;
}>> {
  const baselineRisk1y = await getBaseline1YearRisk(profile.age, profile.sex);
  const sensitivityResults: Array<{
    factor: string;
    contribution: number;
    description: string;
  }> = [];

  // Test each factor individually
  const factors = [
    { name: 'smoking', description: 'Smoking status uncertainty' },
    { name: 'alcohol', description: 'Alcohol consumption uncertainty' },
    { name: 'activity', description: 'Physical activity uncertainty' },
    { name: 'bmi', description: 'BMI uncertainty' },
  ];

  for (const factor of factors) {
    const factorResults: number[] = [];
    
    for (let i = 0; i < nSamples; i++) {
      try {
        const sampleSeed = Math.floor(Math.random() * 1000000);
        const hrResult = await sampleHRs(profile, sampleSeed);
        
        // Focus on this factor's contribution
        const factorHR = hrResult.components.find(c => c.factor === factor.name)?.hr || 1.0;
        const adjustedRisk = applyHRToAnnualProb(baselineRisk1y, factorHR);
        factorResults.push(adjustedRisk);
      } catch (error) {
        factorResults.push(baselineRisk1y);
      }
    }

    // Calculate variance contribution
    const mean = factorResults.reduce((sum, risk) => sum + risk, 0) / factorResults.length;
    const variance = factorResults.reduce((sum, risk) => sum + Math.pow(risk - mean, 2), 0) / factorResults.length;
    const standardDeviation = Math.sqrt(variance);
    
    sensitivityResults.push({
      factor: factor.name,
      contribution: standardDeviation,
      description: factor.description,
    });
  }

  // Sort by contribution (highest first)
  return sensitivityResults.sort((a, b) => b.contribution - a.contribution);
}

/**
 * Calculate Monte Carlo error (convergence check)
 */
export function calculateMonteCarloError(
  bootstrapResult: BootstrapResult,
  targetPrecision: number = 0.01
): {
  risk1yConverged: boolean;
  lifeExpectancyConverged: boolean;
  recommendedSamples: number;
} {
  const risk1yStdErr = Math.sqrt(
    bootstrapResult.risk1y.reduce((sum, risk, i, arr) => {
      const mean = arr.reduce((s, r) => s + r, 0) / arr.length;
      return sum + Math.pow(risk - mean, 2);
    }, 0) / (bootstrapResult.risk1y.length - 1)
  ) / Math.sqrt(bootstrapResult.risk1y.length);

  const leStdErr = Math.sqrt(
    bootstrapResult.lifeExpectancy.reduce((sum, le, i, arr) => {
      const mean = arr.reduce((s, l) => s + l, 0) / arr.length;
      return sum + Math.pow(le - mean, 2);
    }, 0) / (bootstrapResult.lifeExpectancy.length - 1)
  ) / Math.sqrt(bootstrapResult.lifeExpectancy.length);

  const risk1yConverged = risk1yStdErr < targetPrecision;
  const lifeExpectancyConverged = leStdErr < 0.1; // 0.1 year precision

  // Estimate required samples for convergence
  const risk1yRequired = risk1yConverged ? bootstrapResult.risk1y.length : Math.ceil(Math.pow(risk1yStdErr / targetPrecision, 2));
  const leRequired = lifeExpectancyConverged ? bootstrapResult.lifeExpectancy.length : Math.ceil(Math.pow(leStdErr / 0.1, 2));
  const recommendedSamples = Math.max(risk1yRequired, leRequired, 100);

  return {
    risk1yConverged,
    lifeExpectancyConverged,
    recommendedSamples: Math.min(recommendedSamples, 1000), // Cap at 1000
  };
}

/**
 * Adaptive bootstrap - increase samples if not converged
 */
export async function adaptiveBootstrap(
  profile: UserProfile,
  initialSamples: number = 200,
  maxSamples: number = 1000,
  targetPrecision: number = 0.01
): Promise<{
  result: BootstrapResult;
  finalSamples: number;
  converged: boolean;
}> {
  let currentSamples = initialSamples;
  let bootstrapResult: BootstrapResult;
  let converged = false;

  do {
    bootstrapResult = await bootstrap(profile, currentSamples);
    const mce = calculateMonteCarloError(bootstrapResult, targetPrecision);
    
    converged = mce.risk1yConverged && mce.lifeExpectancyConverged;
    
    if (!converged && currentSamples < maxSamples) {
      currentSamples = Math.min(maxSamples, mce.recommendedSamples);
    }
  } while (!converged && currentSamples < maxSamples);

  return {
    result: bootstrapResult,
    finalSamples: currentSamples,
    converged,
  };
}

/**
 * Calculate prediction intervals (broader than confidence intervals)
 */
export function calculatePredictionIntervals(
  bootstrapResult: BootstrapResult,
  coverage: number = 0.8
): {
  risk1yPrediction: UncertaintyInterval;
  lifeExpectancyPrediction: UncertaintyInterval;
} {
  const alpha = (1 - coverage) / 2;
  const lowerPercentile = alpha;
  const upperPercentile = 1 - alpha;

  const risk1ySorted = [...bootstrapResult.risk1y].sort((a, b) => a - b);
  const leSorted = [...bootstrapResult.lifeExpectancy].sort((a, b) => a - b);

  const risk1yLower = risk1ySorted[Math.floor(lowerPercentile * risk1ySorted.length)];
  const risk1yUpper = risk1ySorted[Math.floor(upperPercentile * risk1ySorted.length)];
  
  const leLower = leSorted[Math.floor(lowerPercentile * leSorted.length)];
  const leUpper = leSorted[Math.floor(upperPercentile * leSorted.length)];

  return {
    risk1yPrediction: { lower: risk1yLower, upper: risk1yUpper },
    lifeExpectancyPrediction: { lower: leLower, upper: leUpper },
  };
}
