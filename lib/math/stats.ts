// Statistical utility functions for the life expectancy model

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculate quantiles from an array of values
 */
export function quantile(values: number[], p: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const index = p * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  if (upper >= sorted.length) return sorted[sorted.length - 1];
  if (lower === upper) return sorted[lower];

  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/**
 * Calculate 80% confidence interval (10th and 90th percentiles)
 */
export function confidenceInterval80(values: number[]): { lower: number; upper: number } {
  return {
    lower: quantile(values, 0.1),
    upper: quantile(values, 0.9),
  };
}

/**
 * Calculate 95% confidence interval (2.5th and 97.5th percentiles)
 */
export function confidenceInterval95(values: number[]): { lower: number; upper: number } {
  return {
    lower: quantile(values, 0.025),
    upper: quantile(values, 0.975),
  };
}

/**
 * Sample from a log-normal distribution
 */
export function sampleLogNormal(mu: number, sigma: number, random: () => number = Math.random): number {
  // mu and sigma are the mean and std dev of the underlying normal distribution
  const normal = Math.sqrt(-2 * Math.log(random())) * Math.cos(2 * Math.PI * random());
  return Math.exp(mu + sigma * normal);
}

/**
 * Sample from a log-normal distribution with central value and log-standard-deviation
 */
export function sampleLogNormalFromCentral(central: number, logSd: number, random: () => number = Math.random): number {
  const mu = Math.log(central);
  return sampleLogNormal(mu, logSd, random);
}

/**
 * Calculate median from an array of values
 */
export function median(values: number[]): number {
  return quantile(values, 0.5);
}

/**
 * Calculate mean from an array of values
 */
export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Calculate standard deviation from an array of values
 */
export function standardDeviation(values: number[]): number {
  if (values.length <= 1) return 0;
  const m = mean(values);
  const variance = values.reduce((sum, val) => sum + Math.pow(val - m, 2), 0) / (values.length - 1);
  return Math.sqrt(variance);
}

/**
 * Linear interpolation between two points
 */
export function interpolate(x: number, x1: number, y1: number, x2: number, y2: number): number {
  if (x1 === x2) return y1;
  return y1 + (y2 - y1) * (x - x1) / (x2 - x1);
}

/**
 * Check if a value is within a confidence interval
 */
export function isWithinInterval(value: number, ci: { lower: number; upper: number }): boolean {
  return value >= ci.lower && value <= ci.upper;
}

/**
 * Calculate relative risk increase/decrease
 */
export function calculateRelativeRisk(baseline: number, adjusted: number): number {
  if (baseline === 0) return 0;
  return (adjusted - baseline) / baseline;
}

/**
 * Format a probability as a percentage with appropriate precision
 */
export function formatProbability(p: number, decimals: number = 1): string {
  return `${(p * 100).toFixed(decimals)}%`;
}

/**
 * Format a number with appropriate precision based on magnitude
 */
export function formatNumber(value: number, decimals: number = 1): string {
  if (Math.abs(value) >= 100) return value.toFixed(0);
  if (Math.abs(value) >= 10) return value.toFixed(1);
  if (Math.abs(value) >= 1) return value.toFixed(2);
  return value.toFixed(3);
}
