/**
 * Data Source Tracker
 * 
 * This module tracks all data sources used in the application,
 * including their URLs, update frequencies, and assumptions.
 */

export interface DataSource {
  id: string;
  name: string;
  url: string;
  description: string;
  updateFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'as-needed';
  dataFormat: string;
  coverage: string;
  lastUpdated: string;
  version: string;
  usage: string[];
  assumptions: string[];
  quality: {
    completeness: number; // 0-100
    accuracy: number; // 0-100
    timeliness: number; // 0-100
  };
}

export interface DataAssumption {
  id: string;
  description: string;
  source: string;
  justification: string;
  impact: 'low' | 'medium' | 'high';
  lastReviewed: string;
  nextReview: string;
}

export class DataSourceTracker {
  private sources: Map<string, DataSource> = new Map();
  private assumptions: Map<string, DataAssumption> = new Map();

  constructor() {
    this.initializeSources();
    this.initializeAssumptions();
  }

  private initializeSources() {
    // SSA Life Tables
    this.sources.set('ssa-life-tables', {
      id: 'ssa-life-tables',
      name: 'Social Security Administration Actuarial Life Tables',
      url: 'https://www.ssa.gov/oact/STATS/table4c6.html',
      description: 'Official US life tables used for Social Security calculations',
      updateFrequency: 'annually',
      dataFormat: 'HTML tables, CSV download',
      coverage: 'Ages 0-119, by sex',
      lastUpdated: '2024-01-01',
      version: '2024.1',
      usage: ['baseline-mortality-rates', 'life-expectancy', '6-month-probability', '5-year-probability'],
      assumptions: ['ssa-baseline-mortality', '6-month-approximation', '5-year-approximation'],
      quality: {
        completeness: 100,
        accuracy: 98,
        timeliness: 90
      }
    });

    // CDC WONDER
    this.sources.set('cdc-wonder', {
      id: 'cdc-wonder',
      name: 'CDC WONDER Mortality Statistics',
      url: 'https://wonder.cdc.gov/mortSQL.html',
      description: 'CDC web-based query system for mortality data',
      updateFrequency: 'annually',
      dataFormat: 'CSV download via web interface',
      coverage: 'US mortality by age, sex, cause of death',
      lastUpdated: '2022-01-01',
      version: '2022.1',
      usage: ['cause-of-death-fractions', 'mortality-validation', 'age-group-causes'],
      assumptions: ['icd-10-mapping', 'cause-categorization', 'age-group-approximation'],
      quality: {
        completeness: 95,
        accuracy: 98,
        timeliness: 85
      }
    });

    // Human Mortality Database
    this.sources.set('hmd', {
      id: 'hmd',
      name: 'Human Mortality Database',
      url: 'https://www.mortality.org/',
      description: 'Comprehensive international mortality database',
      updateFrequency: 'annually',
      dataFormat: 'CSV files',
      coverage: 'US and international mortality data',
      lastUpdated: '2024-01-01',
      version: '2024.1',
      usage: ['mortality-validation', 'international-comparison'],
      assumptions: ['data-harmonization', 'age-standardization'],
      quality: {
        completeness: 100,
        accuracy: 95,
        timeliness: 80
      }
    });

    // Global Burden of Disease
    this.sources.set('gbd', {
      id: 'gbd',
      name: 'Global Burden of Disease Collaborative Network',
      url: 'https://www.healthdata.org/gbd',
      description: 'Comprehensive global health data and risk factor estimates',
      updateFrequency: 'annually',
      dataFormat: 'CSV files, API access',
      coverage: 'Global risk factor data, US-specific estimates',
      lastUpdated: '2021-01-01',
      version: '2021.1',
      usage: ['risk-factor-relative-risks', 'dose-response-curves', 'population-attributable-fractions'],
      assumptions: ['multiplicative-risks', 'independent-risk-factors', 'continuous-dose-response'],
      quality: {
        completeness: 90,
        accuracy: 95,
        timeliness: 80
      }
    });
  }

  private initializeAssumptions() {
    // SSA baseline mortality assumptions
    this.assumptions.set('ssa-baseline-mortality', {
      id: 'ssa-baseline-mortality',
      description: 'Baseline mortality rates derived from SSA life tables using Gompertz-Makeham model: μ(x) = a + b * exp(c * x)',
      source: 'SSA Life Tables 2024, actuarial literature',
      justification: 'SSA life tables are the canonical US source for short-horizon death probabilities. Gompertz-Makeham is the standard actuarial model.',
      impact: 'high',
      lastReviewed: '2024-01-01',
      nextReview: '2025-01-01'
    });

    // 6-month probability approximation
    this.assumptions.set('6-month-approximation', {
      id: '6-month-approximation',
      description: '6-month mortality probability approximated as: 1 - (1 - qx)^(1/2)',
      source: 'Actuarial literature, probability theory',
      justification: 'Standard actuarial approximation for converting annual to semi-annual probabilities',
      impact: 'medium',
      lastReviewed: '2024-01-01',
      nextReview: '2025-01-01'
    });

    // 5-year probability approximation
    this.assumptions.set('5-year-approximation', {
      id: '5-year-approximation',
      description: '5-year mortality probability approximated as: 1 - (1 - qx)^5',
      source: 'Actuarial literature, probability theory',
      justification: 'Standard actuarial approximation for converting annual to 5-year probabilities',
      impact: 'medium',
      lastReviewed: '2024-01-01',
      nextReview: '2025-01-01'
    });

    // Parameter estimation assumptions
    this.assumptions.set('parameter-estimation', {
      id: 'parameter-estimation',
      description: 'Gompertz-Makeham parameters derived from actuarial literature and SSA life table characteristics',
      source: 'Actuarial literature, SSA life table patterns, established mortality models',
      justification: 'Parameters chosen to produce realistic mortality rates that match official statistics for typical age ranges',
      impact: 'high',
      lastReviewed: '2024-01-01',
      nextReview: '2025-01-01'
    });

    // Age interpolation assumptions
    this.assumptions.set('age-interpolation', {
      id: 'age-interpolation',
      description: 'Linear interpolation between integer ages for fractional ages',
      source: 'Actuarial literature',
      justification: 'Standard practice for age interpolation in life tables',
      impact: 'medium',
      lastReviewed: '2024-01-01',
      nextReview: '2025-01-01'
    });

    // Cause categorization assumptions
    this.assumptions.set('cause-categorization', {
      id: 'cause-categorization',
      description: 'ICD-10 codes mapped to simplified cause categories',
      source: 'CDC WONDER data, medical literature',
      justification: 'Simplified categories for user understanding while maintaining accuracy',
      impact: 'medium',
      lastReviewed: '2024-01-01',
      nextReview: '2025-01-01'
    });

    // Age group approximation for cause data
    this.assumptions.set('age-group-approximation', {
      id: 'age-group-approximation',
      description: 'Individual ages mapped to age groups: 18-29, 30-44, 45-59, 60-74, 75+',
      source: 'CDC WONDER age group definitions',
      justification: 'CDC data is reported by age groups, so individual ages are mapped to the appropriate group',
      impact: 'medium',
      lastReviewed: '2024-01-01',
      nextReview: '2025-01-01'
    });

    // Cause fraction allocation
    this.assumptions.set('cause-fraction-allocation', {
      id: 'cause-fraction-allocation',
      description: 'Baseline mortality risk allocated across causes using CDC age/sex-specific fractions',
      source: 'CDC WONDER cause-of-death data by age group and sex',
      justification: 'CDC is the gold standard for US cause-of-death distributions. Fractions sum to 1.0 within each age/sex group.',
      impact: 'high',
      lastReviewed: '2024-01-01',
      nextReview: '2025-01-01'
    });

    // Multiplicative risk factors
    this.assumptions.set('multiplicative-risks', {
      id: 'multiplicative-risks',
      description: 'Relative risks are multiplied together: Adjusted_Risk = Baseline_Risk × RR1 × RR2 × ... × RRn',
      source: 'GBD methodology, epidemiological literature',
      justification: 'Standard epidemiological approach for combining multiple risk factors. Assumes independent effects.',
      impact: 'high',
      lastReviewed: '2024-01-01',
      nextReview: '2025-01-01'
    });

    // Independent risk factors
    this.assumptions.set('independent-risk-factors', {
      id: 'independent-risk-factors',
      description: 'Risk factors are assumed to be independent with no interaction effects',
      source: 'GBD methodology, epidemiological literature',
      justification: 'Simplifies modeling and is often reasonable for major risk factors. GBD uses joint attribution to avoid double counting.',
      impact: 'medium',
      lastReviewed: '2024-01-01',
      nextReview: '2025-01-01'
    });

    // Continuous dose-response relationships
    this.assumptions.set('continuous-dose-response', {
      id: 'continuous-dose-response',
      description: 'Dose-response relationships are continuous and follow established curves (linear, log-linear, quadratic, exponential)',
      source: 'GBD methodology, meta-analyses',
      justification: 'Allows for more precise risk estimation based on exposure level. Curves are based on epidemiological evidence.',
      impact: 'medium',
      lastReviewed: '2024-01-01',
      nextReview: '2025-01-01'
    });

    // Data caching strategy
    this.assumptions.set('data-caching', {
      id: 'data-caching',
      description: 'Data is cached for 30 days to avoid repeated API calls and improve performance',
      source: 'Performance optimization best practices',
      justification: 'External data sources are slow to load. Caching improves user experience while maintaining data freshness.',
      impact: 'low',
      lastReviewed: '2024-01-01',
      nextReview: '2025-01-01'
    });

    // Cache refresh strategy
    this.assumptions.set('cache-refresh', {
      id: 'cache-refresh',
      description: 'Cache is refreshed when data is older than 30 days or when force refreshed',
      source: 'Data freshness requirements',
      justification: 'Balances performance with data freshness. 30 days is appropriate for annual data sources.',
      impact: 'low',
      lastReviewed: '2024-01-01',
      nextReview: '2025-01-01'
    });
  }

  getSource(id: string): DataSource | undefined {
    return this.sources.get(id);
  }

  getAllSources(): DataSource[] {
    return Array.from(this.sources.values());
  }

  getAssumption(id: string): DataAssumption | undefined {
    return this.assumptions.get(id);
  }

  getAllAssumptions(): DataAssumption[] {
    return Array.from(this.assumptions.values());
  }

  getSourcesByUsage(usage: string): DataSource[] {
    return Array.from(this.sources.values()).filter(source => 
      source.usage.includes(usage)
    );
  }

  getAssumptionsByImpact(impact: 'low' | 'medium' | 'high'): DataAssumption[] {
    return Array.from(this.assumptions.values()).filter(assumption => 
      assumption.impact === impact
    );
  }

  updateSource(id: string, updates: Partial<DataSource>): void {
    const source = this.sources.get(id);
    if (source) {
      this.sources.set(id, { ...source, ...updates });
    }
  }

  addAssumption(assumption: DataAssumption): void {
    this.assumptions.set(assumption.id, assumption);
  }

  getDataQualityReport(): {
    overall: number;
    bySource: Record<string, number>;
    byUsage: Record<string, number>;
  } {
    const sources = Array.from(this.sources.values());
    const overall = sources.reduce((sum, source) => 
      sum + (source.quality.completeness + source.quality.accuracy + source.quality.timeliness) / 3, 0
    ) / sources.length;

    const bySource: Record<string, number> = {};
    sources.forEach(source => {
      bySource[source.id] = (source.quality.completeness + source.quality.accuracy + source.quality.timeliness) / 3;
    });

    const byUsage: Record<string, number> = {};
    const usageTypes = new Set(sources.flatMap(s => s.usage));
    usageTypes.forEach(usage => {
      const usageSources = this.getSourcesByUsage(usage);
      byUsage[usage] = usageSources.reduce((sum, source) => 
        sum + (source.quality.completeness + source.quality.accuracy + source.quality.timeliness) / 3, 0
      ) / usageSources.length;
    });

    return { overall, bySource, byUsage };
  }
}

export const dataSourceTracker = new DataSourceTracker();
