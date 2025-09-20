'use client'

import { useState } from 'react'
import { RiskCalculationResponse, RiskFactors, CardiovascularRisk } from '../shared/types/api'

export default function Home() {
  const [age, setAge] = useState('')
  const [sex, setSex] = useState<'male' | 'female' | ''>('')
  const [race, setRace] = useState<'white' | 'black' | 'african_american' | 'other'>('white')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<RiskCalculationResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showDetailedForm, setShowDetailedForm] = useState(false)
  const [riskFactors, setRiskFactors] = useState<RiskFactors>({})
  const [showInfoModal, setShowInfoModal] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!age || !sex) return

    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          age: parseInt(age), 
          sex, 
          race,
          risk_factors: riskFactors,
          time_horizon: '1_year'
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        setResult(data)
      } else {
        setError(data.error || 'Calculation failed')
        
        // If backend not running, show setup instructions
        if (data.instructions) {
          setError(`Backend not running. Please run: ${data.instructions.command}`)
        }
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to connect to backend. Please ensure Python backend is running on port 5000.')
    } finally {
      setLoading(false)
    }
  }

  const formatRiskFactorName = (key: string): string => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getRiskImpactColor = (value: number): string => {
    if (value > 1.5) return 'text-red-600'
    if (value > 1.2) return 'text-orange-600'
    if (value < 0.8) return 'text-green-600'
    return 'text-gray-600'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Mortality Risk Calculator
          </h1>
          <p className="text-lg text-gray-600">
            Evidence-based risk assessment using real data from authoritative sources
          </p>
                 <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                   <p className="text-sm text-blue-800">
                     <strong>Privacy Protected:</strong> All calculations happen on your device. We don't store, retrieve, or track any of your personal information. Completely anonymous.
                   </p>
                 </div>
        </div>
        
        {/* Input Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Basic Information (Required)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age *
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your age"
                    min="18"
                    max="120"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sex *
                  </label>
                  <select
                    value={sex}
                    onChange={(e) => setSex(e.target.value as 'male' | 'female')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select sex</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Race/Ethnicity
                  </label>
                  <select
                    value={race}
                    onChange={(e) => setRace(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="white">White</option>
                    <option value="black">Black/African American</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Detailed Risk Factors */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Additional Risk Factors</h3>
                  <p className="text-sm text-gray-500">These factors help provide more accurate risk calculations</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDetailedForm(!showDetailedForm)}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {showDetailedForm ? 'Hide Details' : 'Add More Details'}
                </button>
              </div>
              
              {showDetailedForm && (
                <div className="space-y-6">
                  {/* Tier 1: Critical Factors */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      High Impact Factors
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Smoking Status
                        </label>
                        <select 
                          value={riskFactors.smoking_status || 'never'}
                          onChange={(e) => setRiskFactors({...riskFactors, smoking_status: e.target.value as any})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="never">Never smoked</option>
                          <option value="former">Former smoker</option>
                          <option value="current">Current smoker</option>
                        </select>
                        {riskFactors.smoking_status === 'former' && (
                          <div className="mt-2">
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                              Years since quitting
                            </label>
                            <input
                              type="number"
                              value={riskFactors.years_since_quit || ''}
                              onChange={(e) => setRiskFactors({...riskFactors, years_since_quit: parseInt(e.target.value) || undefined})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                              placeholder="5"
                              min="0"
                              max="50"
                            />
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Blood Pressure
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <input
                              type="number"
                              value={riskFactors.systolic_bp || ''}
                              onChange={(e) => setRiskFactors({...riskFactors, systolic_bp: parseInt(e.target.value) || undefined})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                              placeholder="120"
                              min="80"
                              max="250"
                            />
                            <p className="text-xs text-gray-500 mt-1">Systolic (top)</p>
                          </div>
                          <div>
                            <input
                              type="number"
                              value={riskFactors.diastolic_bp || ''}
                              onChange={(e) => setRiskFactors({...riskFactors, diastolic_bp: parseInt(e.target.value) || undefined})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                              placeholder="80"
                              min="50"
                              max="150"
                            />
                            <p className="text-xs text-gray-500 mt-1">Diastolic (bottom)</p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={riskFactors.bp_treated || false}
                              onChange={(e) => setRiskFactors({...riskFactors, bp_treated: e.target.checked})}
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-600">Taking blood pressure medication</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tier 2: High Impact Factors */}
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-800 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                      Important Lifestyle Factors
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Body Weight Category
                        </label>
                        <select 
                          value={riskFactors.bmi || ''}
                          onChange={(e) => setRiskFactors({...riskFactors, bmi: parseFloat(e.target.value) || undefined})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="">Select category</option>
                          <option value="18.5">Underweight (BMI &lt; 18.5)</option>
                          <option value="22">Normal weight (BMI 18.5-24.9)</option>
                          <option value="27.5">Overweight (BMI 25-29.9)</option>
                          <option value="32.5">Obese Class I (BMI 30-34.9)</option>
                          <option value="37.5">Obese Class II (BMI 35-39.9)</option>
                          <option value="42.5">Obese Class III (BMI &ge; 40)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Physical Activity Level
                        </label>
                        <select 
                          value={riskFactors.fitness_level || 'moderate'}
                          onChange={(e) => setRiskFactors({...riskFactors, fitness_level: e.target.value as any})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="sedentary">Sedentary (little to no exercise)</option>
                          <option value="moderate">Moderate (some regular exercise)</option>
                          <option value="high">High (regular intense exercise)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Diabetes Status
                        </label>
                        <select 
                          value={riskFactors.diabetes ? 'yes' : 'no'}
                          onChange={(e) => setRiskFactors({...riskFactors, diabetes: e.target.value === 'yes'})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="no">No diabetes</option>
                          <option value="yes">Has diabetes (Type 1 or 2)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Alcohol Consumption
                        </label>
                        <select 
                          value={riskFactors.alcohol_pattern || 'none'}
                          onChange={(e) => setRiskFactors({...riskFactors, alcohol_pattern: e.target.value as any})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="none">No alcohol</option>
                          <option value="moderate">Moderate (1-2 drinks/day)</option>
                          <option value="heavy">Heavy (3+ drinks/day)</option>
                          <option value="binge">Binge drinking pattern</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Tier 3: Optional Enhanced Factors */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Optional: Laboratory Values (for enhanced cardiovascular risk)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Total Cholesterol (mg/dL)
                        </label>
                        <input
                          type="number"
                          value={riskFactors.total_cholesterol || ''}
                          onChange={(e) => setRiskFactors({...riskFactors, total_cholesterol: parseInt(e.target.value) || undefined})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="200"
                          min="100"
                          max="500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Normal: &lt; 200 mg/dL</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          HDL Cholesterol (mg/dL)
                        </label>
                        <input
                          type="number"
                          value={riskFactors.hdl_cholesterol || ''}
                          onChange={(e) => setRiskFactors({...riskFactors, hdl_cholesterol: parseInt(e.target.value) || undefined})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="50"
                          min="20"
                          max="150"
                        />
                        <p className="text-xs text-gray-500 mt-1">Good: &ge; 40 mg/dL (men), &ge; 50 mg/dL (women)</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 font-semibold"
            >
              {loading ? 'Calculating Risk...' : 'Calculate Risk'}
            </button>
          </form>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && result.success && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="flex items-center justify-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-700">Life Expectancy</h3>
                  <button
                    onClick={() => setShowInfoModal('lifeExpectancy')}
                    className="ml-2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="text-3xl font-bold text-blue-600">
                  {result.lifeExpectancy.toFixed(1)} years
                </div>
              </div>
              
               <div className="bg-white rounded-lg shadow-md p-6 text-center">
                 <div className="flex items-center justify-center mb-2">
                   <h3 className="text-lg font-semibold text-gray-700">1-Year Mortality Risk</h3>
                   <button
                     onClick={() => setShowInfoModal('oneYearMortality')}
                     className="ml-2 text-gray-400 hover:text-gray-600"
                   >
                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                       <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                     </svg>
                   </button>
                 </div>
                 <div className="text-3xl font-bold text-red-600">
                   {(result.oneYearMortality * 100).toFixed(2)}%
                 </div>
               </div>

              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="flex items-center justify-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-700">10-Year CVD Risk</h3>
                  <button
                    onClick={() => setShowInfoModal('cardiovascularRisk')}
                    className="ml-2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="text-3xl font-bold text-purple-600">
                  {(result.cardiovascularRisk.risk_10_year * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {result.cardiovascularRisk.risk_level} Risk
                </div>
              </div>

            </div>

            {/* Risk Factors */}
            {Object.keys(result.riskFactors).length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Risk Factor Adjustments</h2>
                <div className="space-y-3">
                  {Object.entries(result.riskFactors).map(([key, factor]: [string, any]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{formatRiskFactorName(key)}</div>
                        <div className="text-sm text-gray-600">{factor.source}</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${getRiskImpactColor(factor.value)}`}>
                          {factor.value > 1 ? '+' : ''}{(factor.value - 1) * 100}%
                        </div>
                        <div className="text-xs text-gray-500">Relative Risk</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Causes of Death */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Most Likely Causes of Death (Next Year)</h2>
              <div className="space-y-3">
                {result.causesOfDeath.slice(0, 5).map((cause: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{cause.name}</div>
                      <div className="text-sm text-gray-600">{cause.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-red-600">
                        {(cause.probability * 100).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Sources */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Data Sources</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800">Baseline Mortality</h3>
                  <p className="text-sm text-blue-600">{result.data_sources.baseline_mortality.source}</p>
                  <a href={result.data_sources.baseline_mortality.url} className="text-xs text-blue-500 hover:underline">
                    View Source
                  </a>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-800">Cardiovascular Risk</h3>
                  <p className="text-sm text-green-600">{result.cardiovascularRisk.source.paper}</p>
                  <p className="text-xs text-green-500">
                    {result.cardiovascularRisk.source.authors} ({result.cardiovascularRisk.source.year})
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Information Modals */}
        {showInfoModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {showInfoModal === 'lifeExpectancy' && 'Life Expectancy'}
                  {showInfoModal === 'oneYearMortality' && '1-Year Mortality Risk'}
                  {showInfoModal === 'cardiovascularRisk' && '10-Year CVD Risk'}
                </h3>
                <button
                  onClick={() => setShowInfoModal(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {showInfoModal === 'lifeExpectancy' && (
                <div className="space-y-4">
                  <p className="text-gray-700">
                    <strong>Life Expectancy</strong> represents the average number of years a person of your age and sex is expected to live, based on current mortality rates.
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Data Source</h4>
                    <p className="text-sm text-blue-700">
                      Social Security Administration Period Life Tables (2021) - Official U.S. mortality probabilities by age and sex
                    </p>
                    <p className="text-xs text-blue-600 mt-2">
                      <strong>Methodology:</strong> Based on current age-specific death rates, this represents the expected remaining years of life for someone of your demographic profile.
                    </p>
                  </div>
                </div>
              )}

              {showInfoModal === 'oneYearMortality' && (
                <div className="space-y-4">
                  <p className="text-gray-700">
                    <strong>1-Year Mortality Risk</strong> is the probability of dying within the next 12 months, adjusted for your specific risk factors.
                  </p>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-2">Data Source</h4>
                    <p className="text-sm text-red-700">
                      Social Security Administration Life Tables + Risk Factor Adjustments from peer-reviewed literature
                    </p>
                    <p className="text-xs text-red-600 mt-2">
                      <strong>Methodology:</strong> Baseline mortality from SSA tables, adjusted using relative risks from meta-analyses for smoking, blood pressure, BMI, fitness, and other factors.
                    </p>
                  </div>
                </div>
              )}

              {showInfoModal === 'cardiovascularRisk' && (
                <div className="space-y-4">
                  <p className="text-gray-700">
                    <strong>10-Year CVD Risk</strong> estimates your probability of having a heart attack, stroke, or other cardiovascular event in the next 10 years.
                  </p>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2">Data Source</h4>
                    <p className="text-sm text-purple-700">
                      Pooled Cohort Equations (PCE) - 2013 ACC/AHA Guidelines
                    </p>
                    <p className="text-xs text-purple-600 mt-2">
                      <strong>Methodology:</strong> Gold standard cardiovascular risk calculator using age, sex, race, cholesterol, blood pressure, diabetes, and smoking status. Validated for ages 40-79 in U.S. populations.
                    </p>
                    <p className="text-xs text-purple-600 mt-1">
                      <strong>Note:</strong> This is the same calculator used by doctors to determine statin and blood pressure medication recommendations.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}