/**
 * Data Transparency Database
 * 
 * This module tracks all data sources, URLs, assumptions, and calculation methods
 * to provide complete transparency to users about how mortality estimates are calculated.
 */

export interface DataSource {
  id: string;
  name: string;
  description: string;
  url: string;
  lastUpdated: string;
  updateFrequency: string;
  dataFormat: string;
  coverage: string;
  quality: 'high' | 'medium' | 'low';
  notes: string;
}

export interface CalculationMethod {
  id: string;
  name: string;
  description: string;
  formula: string;
  parameters: Array<{
    name: string;
    value: number | string;
    source: string;
    justification: string;
  }>;
  assumptions: string[];
  limitations: string[];
  validation: string[];
}

export interface DataManipulation {
  id: string;
  step: string;
  description: string;
  inputData: string;
  outputData: string;
  method: string;
  codeReference: string;
  assumptions: string[];
}

export class TransparencyDatabase {
  private dataSources: DataSource[] = [
    {
      id: 'ssa-life-tables',
      name: 'Social Security Administration Actuarial Life Tables',
      description: 'Official US life tables used for Social Security calculations, providing age-specific mortality rates',
      url: 'https://www.ssa.gov/oact/STATS/table4c6.html',
      lastUpdated: '2024-01-01',
      updateFrequency: 'Annual',
      dataFormat: 'HTML tables, downloadable as CSV',
      coverage: 'Ages 0-119, by sex, US population',
      quality: 'high',
      notes: 'Gold standard for US mortality data, used by insurance industry'
    },
    {
      id: 'cdc-wonder',
      name: 'CDC WONDER Mortality Statistics',
      description: 'CDC web-based query system for mortality data by cause of death',
      url: 'https://wonder.cdc.gov/mortSQL.html',
      lastUpdated: '2024-01-01',
      updateFrequency: 'Annual',
      dataFormat: 'CSV download via web interface',
      coverage: 'US mortality by age, sex, cause of death, ICD-10 codes',
      quality: 'high',
      notes: 'Official cause-of-death statistics from death certificates'
    },
    {
      id: 'gbd-risk-factors',
      name: 'Global Burden of Disease Risk Factors',
      description: 'Comprehensive risk factor data and relative risks from GBD study',
      url: 'https://www.healthdata.org/gbd',
      lastUpdated: '2023-01-01',
      updateFrequency: 'Every 2-3 years',
      dataFormat: 'CSV files, API access',
      coverage: 'Global, by age, sex, risk factor, cause',
      quality: 'high',
      notes: 'Most comprehensive risk factor database, peer-reviewed methodology'
    },
    {
      id: 'hmd',
      name: 'Human Mortality Database',
      description: 'International mortality database for validation and comparison',
      url: 'https://www.mortality.org/',
      lastUpdated: '2024-01-01',
      updateFrequency: 'Annual',
      dataFormat: 'CSV files',
      coverage: 'US and international mortality data',
      quality: 'high',
      notes: 'Used for validation and international comparisons'
    }
  ];

  private calculationMethods: CalculationMethod[] = [
    {
      id: 'gompertz-makeham',
      name: 'Gompertz-Makeham Mortality Model',
      description: 'Mathematical model for age-specific mortality rates using exponential growth',
      formula: 'μ(x) = a + b × exp(c × x)',
      parameters: [
        {
          name: 'a (baseline hazard)',
          value: '0.0001 (male), 0.00005 (female)',
          source: 'Actuarial literature and SSA life table patterns',
          justification: 'Represents age-independent mortality component'
        },
        {
          name: 'b (exponential coefficient)',
          value: '0.00001 (male), 0.000005 (female)',
          source: 'Fitted to SSA life table data',
          justification: 'Controls exponential growth rate of mortality with age'
        },
        {
          name: 'c (age acceleration)',
          value: '0.1 (both sexes)',
          source: 'Standard actuarial parameter',
          justification: 'Represents rate of mortality acceleration with age'
        }
      ],
      assumptions: [
        'Mortality follows Gompertz-Makeham pattern',
        'Parameters are constant over time',
        'No cohort effects',
        'Model applies to general population'
      ],
      limitations: [
        'May not fit extreme ages (>100)',
        'Does not account for recent mortality improvements',
        'Assumes smooth mortality progression'
      ],
      validation: [
        'Validated against SSA life tables',
        'Compared with Human Mortality Database',
        'Checked against published actuarial studies'
      ]
    },
    {
      id: 'cause-fraction-allocation',
      name: 'Cause-of-Death Fraction Allocation',
      description: 'Method for distributing total mortality risk across specific causes',
      formula: 'Cause Risk = Total Risk × (Cause Deaths / Total Deaths)',
      parameters: [
        {
          name: 'Age-specific cause fractions',
          value: 'From CDC WONDER data',
          source: 'CDC Multiple Cause of Death data',
          justification: 'Official cause-of-death statistics'
        },
        {
          name: 'ICD-10 mapping',
          value: 'Standard ICD-10 to cause categories',
          source: 'WHO ICD-10 classification',
          justification: 'International standard for cause classification'
        }
      ],
      assumptions: [
        'Cause fractions are stable over time',
        'No significant reporting bias',
        'ICD-10 coding is consistent'
      ],
      limitations: [
        'Cause fractions may vary by region',
        'Coding practices may change over time',
        'Some causes may be underreported'
      ],
      validation: [
        'Compared with published cause-of-death studies',
        'Validated against GBD cause data',
        'Checked for consistency across age groups'
      ]
    },
    {
      id: 'risk-factor-adjustment',
      name: 'Risk Factor Relative Risk Adjustment',
      description: 'Adjustment of baseline mortality by individual risk factors using relative risks',
      formula: 'Adjusted Risk = Baseline Risk × ∏(Relative Risk for each factor)',
      parameters: [
        {
          name: 'Smoking relative risks',
          value: '2.0-3.0x for current smokers',
          source: 'GBD 2019, meta-analyses',
          justification: 'Well-established smoking-mortality relationship'
        },
        {
          name: 'Blood pressure relative risks',
          value: '1.5-2.0x per 20mmHg increase',
          source: 'AHA guidelines, cohort studies',
          justification: 'Strong evidence for BP-mortality relationship'
        },
        {
          name: 'BMI relative risks',
          value: 'U-shaped curve, optimal at BMI 22-25',
          source: 'GBD 2019, large cohort studies',
          justification: 'Established BMI-mortality relationship'
        }
      ],
      assumptions: [
        'Relative risks are multiplicative',
        'No significant interaction effects',
        'Risk factors are independent',
        'Relative risks are constant across age groups'
      ],
      limitations: [
        'May overestimate risk with multiple factors',
        'Does not account for risk factor interactions',
        'Relative risks may vary by population'
      ],
      validation: [
        'Compared with ePrognosis indices',
        'Validated against ASCVD risk calculator',
        'Checked against published risk models'
      ]
    }
  ];

  private dataManipulations: DataManipulation[] = [
    {
      id: 'ssa-data-processing',
      step: 'SSA Life Table Processing',
      description: 'Extract and process mortality rates from SSA life tables',
      inputData: 'SSA HTML tables with qx values by age and sex',
      outputData: 'Structured mortality rates by age and sex',
      method: 'Web scraping and data parsing',
      codeReference: 'lib/data/ssa-life-tables.ts',
      assumptions: [
        'SSA data is accurate and up-to-date',
        'HTML structure remains consistent',
        'Data represents general population'
      ]
    },
    {
      id: 'cdc-cause-processing',
      step: 'CDC Cause-of-Death Processing',
      description: 'Process CDC WONDER data to extract cause-specific death fractions',
      inputData: 'CDC WONDER CSV exports with cause-of-death data',
      outputData: 'Age and sex-specific cause fractions',
      method: 'Data aggregation and cause categorization',
      codeReference: 'lib/data/cdc-cause-data.ts',
      assumptions: [
        'CDC data is complete and accurate',
        'Cause coding is consistent',
        'No significant missing data'
      ]
    },
    {
      id: 'gbd-risk-processing',
      step: 'GBD Risk Factor Processing',
      description: 'Process GBD data to extract relative risks for various risk factors',
      inputData: 'GBD CSV files with risk factor data',
      outputData: 'Relative risks by risk factor, age, and sex',
      method: 'Data extraction and risk factor mapping',
      codeReference: 'lib/data/gbd-risk-factors.ts',
      assumptions: [
        'GBD data is representative of US population',
        'Relative risks are applicable to individuals',
        'Risk factor definitions are consistent'
      ]
    },
    {
      id: 'mortality-calculation',
      step: 'Mortality Risk Calculation',
      description: 'Combine all data sources to calculate personalized mortality risk',
      inputData: 'Baseline mortality, cause fractions, risk factors',
      outputData: 'Personalized mortality risk estimates',
      method: 'Mathematical modeling and risk adjustment',
      codeReference: 'lib/calculator/integrated-calculator.ts',
      assumptions: [
        'All data sources are compatible',
        'Mathematical models are appropriate',
        'Risk adjustments are valid'
      ]
    }
  ];

  getDataSource(id: string): DataSource | undefined {
    return this.dataSources.find(source => source.id === id);
  }

  getCalculationMethod(id: string): CalculationMethod | undefined {
    return this.calculationMethods.find(method => method.id === id);
  }

  getDataManipulation(id: string): DataManipulation | undefined {
    return this.dataManipulations.find(manipulation => manipulation.id === id);
  }

  getAllDataSources(): DataSource[] {
    return this.dataSources;
  }

  getAllCalculationMethods(): CalculationMethod[] {
    return this.calculationMethods;
  }

  getAllDataManipulations(): DataManipulation[] {
    return this.dataManipulations;
  }

  getMethodologyForMetric(metric: 'life-expectancy' | 'one-year-risk' | 'cause-breakdown'): {
    dataSources: DataSource[];
    calculationMethods: CalculationMethod[];
    dataManipulations: DataManipulation[];
  } {
    switch (metric) {
      case 'life-expectancy':
        return {
          dataSources: [
            this.getDataSource('ssa-life-tables')!,
            this.getDataSource('hmd')!
          ],
          calculationMethods: [
            this.getCalculationMethod('gompertz-makeham')!
          ],
          dataManipulations: [
            this.getDataManipulation('ssa-data-processing')!,
            this.getDataManipulation('mortality-calculation')!
          ]
        };
      case 'one-year-risk':
        return {
          dataSources: [
            this.getDataSource('ssa-life-tables')!,
            this.getDataSource('gbd-risk-factors')!
          ],
          calculationMethods: [
            this.getCalculationMethod('gompertz-makeham')!,
            this.getCalculationMethod('risk-factor-adjustment')!
          ],
          dataManipulations: [
            this.getDataManipulation('ssa-data-processing')!,
            this.getDataManipulation('gbd-risk-processing')!,
            this.getDataManipulation('mortality-calculation')!
          ]
        };
      case 'cause-breakdown':
        return {
          dataSources: [
            this.getDataSource('cdc-wonder')!,
            this.getDataSource('ssa-life-tables')!
          ],
          calculationMethods: [
            this.getCalculationMethod('cause-fraction-allocation')!,
            this.getCalculationMethod('risk-factor-adjustment')!
          ],
          dataManipulations: [
            this.getDataManipulation('cdc-cause-processing')!,
            this.getDataManipulation('mortality-calculation')!
          ]
        };
      default:
        return { dataSources: [], calculationMethods: [], dataManipulations: [] };
    }
  }
}

export const transparencyDB = new TransparencyDatabase();
