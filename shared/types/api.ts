// Shared TypeScript types for the mortality risk calculator
// These types match the Python backend API responses

export interface RiskCalculationRequest {
  age: number
  sex: 'male' | 'female'
  race?: 'white' | 'black' | 'african_american' | 'hispanic' | 'asian' | 'native_american' | 'pacific_islander' | 'mixed' | 'other'
  risk_factors: RiskFactors
  time_horizon?: '1_year' | '5_year' | '10_year'
}

export interface RiskFactors {
  smoking_status?: 'never' | 'former' | 'current'
  years_since_quit?: number
  systolic_bp?: number
  diastolic_bp?: number
  bp_treated?: boolean
  bmi?: number
  fitness_level?: 'sedentary' | 'moderate' | 'high'
  alcohol_pattern?: 'none' | 'moderate' | 'heavy' | 'binge'
  diabetes?: boolean
  total_cholesterol?: number
  hdl_cholesterol?: number
}

export interface RiskFactorAdjustment {
  value: number
  source: string
  url: string
  notes: string
}

export interface CauseOfDeath {
  name: string
  probability: number
  description: string
  dataSource: string
}

export interface CardiovascularRisk {
  risk_10_year: number
  risk_1_year: number
  risk_level: 'Low' | 'Intermediate' | 'High'
  population: string
  available: boolean
  source: {
    paper: string
    authors: string
    journal: string
    year: number
    doi: string
    table: string
  }
  error?: string
}

export interface CalculationMetadata {
  baseline_risk: number
  risk_level: string
  time_horizon: string
  input_summary: {
    age: number
    sex: string
    risk_factors_count: number
  }
  summary_comparison: {
    all_cause_1_year: number
    cardiovascular_10_year: number
    cardiovascular_1_year: number
    risk_level_mortality: string
    risk_level_cardiovascular: string
  }
}

export interface DataSources {
  baseline_mortality: {
    source: string
    url: string
  }
  cardiovascular_risk: {
    source: string
    url: string
  }
}

export interface RiskCalculationResponse {
  success: boolean
  lifeExpectancy: number
  oneYearMortality: number
  riskFactors: Record<string, RiskFactorAdjustment>
  causesOfDeath: CauseOfDeath[]
  cardiovascularRisk: CardiovascularRisk
  metadata: CalculationMetadata
  data_sources: DataSources
}

// Risk Factor Schema Types
export interface RiskFactorField {
  type: 'integer' | 'number' | 'string' | 'boolean'
  description: string
  range?: [number, number]
  options?: string[]
  default?: any
  required: boolean
  conditional_on?: {
    field: string
    value: any
  }
  ui_type: 'number' | 'radio' | 'dropdown' | 'checkbox'
  ui_label: string
  ui_hint: string
}

export interface RiskFactorSchema {
  metadata: {
    version: string
    description: string
    notes: string
    required_fields: string[]
    optional_risk_factors: string[]
  }
  fields: Record<string, RiskFactorField>
  ui_sections: Record<string, {
    title: string
    fields: string[]
    description: string
  }>
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  validated_data: Record<string, any>
}
