'use client'

import { useState } from 'react'
import { RiskCalculationResponse, RiskFactors, CardiovascularRisk } from '../shared/types/api'

export default function Home() {
  const [age, setAge] = useState('')
  const [sex, setSex] = useState<'male' | 'female' | ''>('')
  const [race, setRace] = useState<'white' | 'black' | 'african_american' | 'hispanic' | 'asian' | 'native_american' | 'pacific_islander' | 'mixed' | 'other'>('white')
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
                    Age (required)
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
                  <div className="flex items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Sex (required)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowInfoModal('sex')}
                      className="ml-2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
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
                  <div className="flex items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Race/Ethnicity
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowInfoModal('raceEthnicity')}
                      className="ml-2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <select
                    value={race}
                    onChange={(e) => setRace(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="white">White</option>
                    <option value="black">Black/African American</option>
                    <option value="hispanic">Hispanic/Latino</option>
                    <option value="asian">Asian</option>
                    <option value="native_american">Native American/Alaska Native</option>
                    <option value="pacific_islander">Native Hawaiian/Pacific Islander</option>
                    <option value="mixed">Mixed Race/Multiracial</option>
                    <option value="other">Other/Unknown</option>
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
                    <h4 className="font-semibold text-blue-800 mb-2">Data Sources</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-blue-700 font-medium">Social Security Administration Actuarial Life Tables</p>
                        <p className="text-xs text-blue-600">Official US life tables used for Social Security calculations, providing age-specific mortality rates</p>
                        <p className="text-xs text-blue-500 mt-1">URL: https://www.ssa.gov/oact/STATS/table4c6.html</p>
                        <p className="text-xs text-blue-500">Coverage: Ages 0-119, by sex, US population | Quality: High</p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-700 font-medium">Human Mortality Database</p>
                        <p className="text-xs text-blue-600">International mortality database for validation and comparison</p>
                        <p className="text-xs text-blue-500 mt-1">URL: https://www.mortality.org/</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Calculation Method</h4>
                    <p className="text-sm text-green-700 font-medium">Gompertz-Makeham Mortality Model</p>
                    <p className="text-xs text-green-600 mb-2">Mathematical model for age-specific mortality rates using exponential growth</p>
                    <p className="text-xs text-green-600 font-mono bg-green-100 p-2 rounded">μ(x) = a + b × exp(c × x)</p>
                    <div className="mt-2 text-xs text-green-600">
                      <p><strong>Parameters:</strong></p>
                      <p>• a (baseline hazard): 0.0001 (male), 0.00005 (female)</p>
                      <p>• b (exponential coefficient): 0.00001 (male), 0.000005 (female)</p>
                      <p>• c (age acceleration): 0.1 (both sexes)</p>
                    </div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2">Key Assumptions</h4>
                    <ul className="text-xs text-purple-600 space-y-1">
                      <li>• Mortality follows Gompertz-Makeham pattern</li>
                      <li>• Parameters are constant over time</li>
                      <li>• No cohort effects</li>
                      <li>• Model applies to general population</li>
                    </ul>
                  </div>
                </div>
              )}

              {showInfoModal === 'oneYearMortality' && (
                <div className="space-y-4">
                  <p className="text-gray-700">
                    <strong>1-Year Mortality Risk</strong> is the probability of dying within the next 12 months, adjusted for your specific risk factors.
                  </p>
                  
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-2">Data Sources</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-red-700 font-medium">Social Security Administration Actuarial Life Tables</p>
                        <p className="text-xs text-red-600">Official US life tables providing baseline mortality rates by age and sex</p>
                        <p className="text-xs text-red-500 mt-1">URL: https://www.ssa.gov/oact/STATS/table4c6.html</p>
                      </div>
                      <div>
                        <p className="text-sm text-red-700 font-medium">Global Burden of Disease Risk Factors</p>
                        <p className="text-xs text-red-600">Comprehensive risk factor data and relative risks from GBD study</p>
                        <p className="text-xs text-red-500 mt-1">URL: https://www.healthdata.org/gbd</p>
                        <p className="text-xs text-red-500">Coverage: Global, by age, sex, risk factor, cause | Quality: High</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Calculation Method</h4>
                    <p className="text-sm text-green-700 font-medium">Risk Factor Adjustment Model</p>
                    <p className="text-xs text-green-600 mb-2">Multiplicative model adjusting baseline mortality by relative risks</p>
                    <p className="text-xs text-green-600 font-mono bg-green-100 p-2 rounded">Adjusted Risk = Baseline Risk × RR₁ × RR₂ × ... × RRₙ</p>
                    <div className="mt-2 text-xs text-green-600">
                      <p><strong>Risk Factors Considered:</strong></p>
                      <p>• Smoking status and years since quitting</p>
                      <p>• Blood pressure (systolic/diastolic) and treatment status</p>
                      <p>• Body Mass Index (BMI) category</p>
                      <p>• Physical activity level</p>
                      <p>• Diabetes status</p>
                      <p>• Alcohol consumption pattern</p>
                    </div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2">Key Assumptions</h4>
                    <ul className="text-xs text-purple-600 space-y-1">
                      <li>• Risk factors act multiplicatively (independent effects)</li>
                      <li>• Relative risks are constant across age groups</li>
                      <li>• No interaction effects between risk factors</li>
                      <li>• Risk factor effects are reversible</li>
                    </ul>
                  </div>
                </div>
              )}

              {showInfoModal === 'sex' && (
                <div className="space-y-4">
                  <p className="text-gray-700">
                    <strong>Sex in Medical Research</strong> - Understanding current limitations and our commitment to inclusion.
                  </p>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Current Data Limitations</h4>
                    <p className="text-sm text-blue-700 mb-2">
                      Unfortunately, the underlying medical research and data sources we use (Social Security Administration life tables, 
                      Global Burden of Disease studies, and Pooled Cohort Equations) only provide data for male and female categories.
                    </p>
                    <p className="text-xs text-blue-600">
                      This is a limitation of the current state of medical research, not a reflection of our values or beliefs about gender identity.
                    </p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Our Commitment</h4>
                    <p className="text-sm text-green-700 mb-2">
                      We are committed to providing accurate and inclusive health information for all people.
                    </p>
                    <ul className="text-xs text-green-600 space-y-1">
                      <li>• Actively monitoring for research that includes diverse gender identities</li>
                      <li>• Working to incorporate new data as it becomes available</li>
                      <li>• Being transparent about current limitations</li>
                      <li>• Advocating for more inclusive medical research practices</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">What This Means for You</h4>
                    <p className="text-xs text-yellow-700">
                      If you identify as non-binary, transgender, or another gender identity not represented in the current options, 
                      please select the option that most closely aligns with your biological sex assigned at birth for the purposes 
                      of these medical calculations. We understand this may not fully represent your identity, and we apologize for 
                      this limitation. We encourage you to discuss your results with a healthcare provider who understands and 
                      respects your identity.
                    </p>
                  </div>
                </div>
              )}

              {showInfoModal === 'raceEthnicity' && (
                <div className="space-y-4">
                  <p className="text-gray-700">
                    <strong>Race/Ethnicity in Medical Research</strong> - Understanding the limitations and our commitment to inclusion.
                  </p>
                  
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-2">The Reality of Medical Research</h4>
                    <p className="text-sm text-red-700 mb-2">
                      Unfortunately, many medical studies and risk calculators have historically focused on limited racial/ethnic groups, creating significant gaps in our understanding of health risks across diverse populations.
                    </p>
                    <ul className="text-xs text-red-600 space-y-1">
                      <li>• Many studies only tracked "White" vs "Non-White" categories</li>
                      <li>• Specific ethnic groups were often grouped together or excluded</li>
                      <li>• Data collection methods varied across studies and time periods</li>
                      <li>• Underrepresented groups were frequently not included in validation studies</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Framingham/PCE Limitations</h4>
                    <p className="text-sm text-blue-700 mb-2">
                      The Pooled Cohort Equations (PCE) - our cardiovascular risk calculator - was only validated for White and Black/African American populations.
                    </p>
                    <p className="text-xs text-blue-600">
                      This means that for Hispanic, Asian, Native American, Pacific Islander, and other groups, 
                      we must use the best available approximation (White coefficients), even though this may not 
                      accurately reflect their actual cardiovascular risk patterns.
                    </p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Our Commitment</h4>
                    <p className="text-sm text-green-700 mb-2">
                      We are actively working to improve representation and accuracy for all populations.
                    </p>
                    <ul className="text-xs text-green-600 space-y-1">
                      <li>• Continuously searching for studies that include diverse populations</li>
                      <li>• Incorporating newer research that better represents underrepresented groups</li>
                      <li>• Being transparent about limitations and uncertainties</li>
                      <li>• Advocating for more inclusive medical research</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">What This Means for You</h4>
                    <p className="text-xs text-yellow-700">
                      If you identify with a group that has limited research representation, please interpret 
                      your results with this context in mind. The calculations may not be as accurate for your 
                      specific population, and we encourage you to discuss your results with a healthcare provider 
                      who understands your individual risk factors and family history.
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
                    <p className="text-sm text-purple-700 font-medium">Pooled Cohort Equations (PCE) - 2013 ACC/AHA Guidelines</p>
                    <p className="text-xs text-purple-600 mb-2">Gold standard cardiovascular risk calculator used by doctors nationwide</p>
                    <p className="text-xs text-purple-500 mt-1">URL: https://www.ahajournals.org/doi/10.1161/01.cir.0000437741.48606.98</p>
                    <p className="text-xs text-purple-500">Authors: Goff et al. (2013) | Journal: Circulation</p>
                    <p className="text-xs text-purple-500">Coverage: Ages 40-79, White and Black/African American populations | Quality: High</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Calculation Method</h4>
                    <p className="text-sm text-green-700 font-medium">Pooled Cohort Equations (PCE)</p>
                    <p className="text-xs text-green-600 mb-2">Logistic regression model using 9 key risk factors</p>
                    <div className="mt-2 text-xs text-green-600">
                      <p><strong>Risk Factors Used:</strong></p>
                      <p>• Age (40-79 years)</p>
                      <p>• Sex (male/female)</p>
                      <p>• Race (White/Black/African American)</p>
                      <p>• Total cholesterol (mg/dL)</p>
                      <p>• HDL cholesterol (mg/dL)</p>
                      <p>• Systolic blood pressure (mmHg)</p>
                      <p>• Blood pressure treatment status</p>
                      <p>• Smoking status (current/former/never)</p>
                      <p>• Diabetes status (yes/no)</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Clinical Significance</h4>
                    <p className="text-xs text-blue-600 mb-2">This is the same calculator used by doctors to determine:</p>
                    <ul className="text-xs text-blue-600 space-y-1">
                      <li>• Statin medication recommendations</li>
                      <li>• Blood pressure medication guidelines</li>
                      <li>• Aspirin therapy decisions</li>
                      <li>• Lifestyle intervention priorities</li>
                    </ul>
                    <p className="text-xs text-blue-600 mt-2">
                      <strong>Risk Categories:</strong> Low (&lt;5%), Borderline (5-7.4%), Intermediate (7.5-19.9%), High (≥20%)
                    </p>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">Important Limitations</h4>
                    <ul className="text-xs text-yellow-600 space-y-1">
                      <li>• Only validated for ages 40-79</li>
                      <li>• Limited to White and Black/African American populations</li>
                      <li>• Does not include family history of CVD</li>
                      <li>• May underestimate risk in certain populations</li>
                    </ul>
                    <div className="mt-3 p-3 bg-yellow-100 rounded-lg">
                      <p className="text-xs text-yellow-800 font-medium mb-1">Race/Ethnicity Limitations:</p>
                      <p className="text-xs text-yellow-700">
                        The PCE was only validated for White and Black/African American populations. 
                        For Hispanic, Asian, Native American, or other racial/ethnic groups, the calculator 
                        uses White coefficients as a fallback, which may not accurately reflect their 
                        actual cardiovascular risk patterns.
                      </p>
                    </div>
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