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
      usage: ['baseline-mortality-rates', 'life-expectancy'],
      assumptions: ['ssa-parameter-estimation', 'age-interpolation'],
      quality: {
        completeness: 100,
        accuracy: 95,
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
      lastUpdated: '2024-01-01',
      version: '2024.1',
      usage: ['cause-of-death-fractions', 'mortality-validation'],
      assumptions: ['icd-10-mapping', 'cause-categorization'],
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
  }

  private initializeAssumptions() {
    // Mortality rate calculation assumptions
    this.assumptions.set('gompertz-makeham', {
      id: 'gompertz-makeham',
      description: 'Gompertz-Makeham model for mortality rates: μ(x) = a + b * exp(c * x)',
      source: 'Actuarial literature and SSA life tables',
      justification: 'Standard model for mortality rate calculation, well-established in actuarial science',
      impact: 'high',
      lastReviewed: '2024-01-01',
      nextReview: '2025-01-01'
    });

    // Parameter estimation assumptions
    this.assumptions.set('parameter-estimation', {
      id: 'parameter-estimation',
      description: 'Mortality parameters estimated from SSA life tables using least squares fitting',
      source: 'SSA life tables, statistical fitting methods',
      justification: 'Standard statistical approach for parameter estimation',
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
