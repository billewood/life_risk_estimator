'use client'

import { useState } from 'react'
import { RiskCalculationResponse, RiskFactors, CardiovascularRisk } from '../shared/types/api'
import RiskPieChart from './components/RiskPieChart'
import RiskIconArray from './components/RiskIconArray'

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
  
  // BMI Calculator state
  const [showBmiCalculator, setShowBmiCalculator] = useState(false)
  
  // Environmental factors section state
  const [showEnvironmentalFactors, setShowEnvironmentalFactors] = useState(false)
  const [bmiUnits, setBmiUnits] = useState<'imperial' | 'metric'>('imperial')
  const [heightFeet, setHeightFeet] = useState('')
  const [heightInches, setHeightInches] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [weightLbs, setWeightLbs] = useState('')
  const [weightKg, setWeightKg] = useState('')

  const calculateBmi = () => {
    let bmi: number | null = null
    
    if (bmiUnits === 'imperial') {
      const totalInches = (parseFloat(heightFeet) || 0) * 12 + (parseFloat(heightInches) || 0)
      const lbs = parseFloat(weightLbs) || 0
      if (totalInches > 0 && lbs > 0) {
        bmi = (lbs * 703) / (totalInches * totalInches)
      }
    } else {
      const cm = parseFloat(heightCm) || 0
      const kg = parseFloat(weightKg) || 0
      if (cm > 0 && kg > 0) {
        const meters = cm / 100
        bmi = kg / (meters * meters)
      }
    }
    
    if (bmi !== null && bmi >= 10 && bmi <= 60) {
      setRiskFactors({...riskFactors, bmi: Math.round(bmi * 10) / 10})
      setShowBmiCalculator(false)
    }
  }

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
                     <strong>Privacy Protected:</strong> We don't store, retrieve, or track any of your personal information. Completely anonymous.
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
            {/* Health Details Section */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Health Details</h3>
                  <p className="text-sm text-gray-500">Medical and lifestyle factors for cardiovascular risk assessment</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDetailedForm(!showDetailedForm)}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {showDetailedForm ? 'Hide Health Details' : 'Add Health Details'}
                </button>
              </div>
              
              {showDetailedForm && (
                <div className="space-y-6">
                  {/* PREVENT Calculator Section */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-purple-800 flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                          </svg>
                          AHA PREVENT Calculator Fields
                        </h4>
                        <p className="text-xs text-purple-600 mt-1">Complete these fields to get 10-year and 30-year cardiovascular risk from the official AHA equations</p>
                      </div>
                    </div>
                    
                    {/* Row 1: Blood Pressure & BMI */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Blood Pressure (mmHg)
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <input
                              type="number"
                              value={riskFactors.systolic_bp || ''}
                              onChange={(e) => setRiskFactors({...riskFactors, systolic_bp: parseInt(e.target.value) || undefined})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                              placeholder="120"
                              min="90"
                              max="200"
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
                        <label className="flex items-center mt-2">
                          <input
                            type="checkbox"
                            checked={riskFactors.bp_treated || false}
                            onChange={(e) => setRiskFactors({...riskFactors, bp_treated: e.target.checked})}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-600">On blood pressure medication</span>
                        </label>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-sm font-medium text-gray-700">
                            BMI (kg/m²)
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowBmiCalculator(!showBmiCalculator)}
                            className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                          >
                            {showBmiCalculator ? 'Hide calculator' : "Don't know? Calculate"}
                          </button>
                        </div>
                        <input
                          type="number"
                          value={riskFactors.bmi || ''}
                          onChange={(e) => setRiskFactors({...riskFactors, bmi: parseFloat(e.target.value) || undefined})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="25"
                          min="15"
                          max="50"
                          step="0.1"
                        />
                        <p className="text-xs text-gray-500 mt-1">Normal: 18.5-24.9 | PREVENT range: 18.5-39.9</p>
                        
                        {/* BMI Calculator */}
                        {showBmiCalculator && (
                          <div className="mt-3 p-3 bg-white border border-purple-200 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium text-gray-700">BMI Calculator</span>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setBmiUnits('imperial')}
                                  className={`px-2 py-1 text-xs rounded ${bmiUnits === 'imperial' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                                >
                                  ft/lbs
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setBmiUnits('metric')}
                                  className={`px-2 py-1 text-xs rounded ${bmiUnits === 'metric' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                                >
                                  cm/kg
                                </button>
                              </div>
                            </div>
                            
                            {bmiUnits === 'imperial' ? (
                              <div className="space-y-2">
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Height</label>
                                  <div className="flex gap-2">
                                    <div className="flex-1">
                                      <input
                                        type="number"
                                        value={heightFeet}
                                        onChange={(e) => setHeightFeet(e.target.value)}
                                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                                        placeholder="5"
                                        min="3"
                                        max="8"
                                      />
                                      <span className="text-xs text-gray-500">feet</span>
                                    </div>
                                    <div className="flex-1">
                                      <input
                                        type="number"
                                        value={heightInches}
                                        onChange={(e) => setHeightInches(e.target.value)}
                                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                                        placeholder="10"
                                        min="0"
                                        max="11"
                                      />
                                      <span className="text-xs text-gray-500">inches</span>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Weight (lbs)</label>
                                  <input
                                    type="number"
                                    value={weightLbs}
                                    onChange={(e) => setWeightLbs(e.target.value)}
                                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                                    placeholder="170"
                                    min="50"
                                    max="500"
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Height (cm)</label>
                                  <input
                                    type="number"
                                    value={heightCm}
                                    onChange={(e) => setHeightCm(e.target.value)}
                                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                                    placeholder="175"
                                    min="100"
                                    max="250"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Weight (kg)</label>
                                  <input
                                    type="number"
                                    value={weightKg}
                                    onChange={(e) => setWeightKg(e.target.value)}
                                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                                    placeholder="70"
                                    min="20"
                                    max="250"
                                  />
                                </div>
                              </div>
                            )}
                            
                            <button
                              type="button"
                              onClick={calculateBmi}
                              className="mt-3 w-full bg-purple-600 text-white py-1.5 px-3 rounded text-sm hover:bg-purple-700"
                            >
                              Calculate BMI
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Row 2: Cholesterol */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                          min="130"
                          max="320"
                        />
                        <p className="text-xs text-gray-500 mt-1">Desirable: &lt; 200 mg/dL</p>
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
                          max="100"
                        />
                        <p className="text-xs text-gray-500 mt-1">Good: &ge; 40 (men), &ge; 50 (women)</p>
                      </div>
                    </div>

                    {/* Row 3: eGFR */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          eGFR (mL/min/1.73m²)
                        </label>
                        <input
                          type="number"
                          value={riskFactors.egfr || ''}
                          onChange={(e) => setRiskFactors({...riskFactors, egfr: parseInt(e.target.value) || undefined})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="90"
                          min="1"
                          max="150"
                        />
                        <p className="text-xs text-gray-500 mt-1">Normal: &ge; 90 | Find on lab results or ask your doctor</p>
                      </div>
                    </div>

                    {/* Row 4: Medical History - checkboxes/toggles */}
                    <div className="bg-purple-100 rounded-lg p-3">
                      <p className="text-sm font-medium text-purple-800 mb-2">Medical History</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Diabetes
                          </label>
                          <select 
                            value={riskFactors.diabetes ? 'yes' : 'no'}
                            onChange={(e) => setRiskFactors({...riskFactors, diabetes: e.target.value === 'yes'})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                          >
                            <option value="no">No</option>
                            <option value="yes">Yes</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Current Smoker
                          </label>
                          <select 
                            value={riskFactors.smoking_status || 'never'}
                            onChange={(e) => setRiskFactors({...riskFactors, smoking_status: e.target.value as any})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                          >
                            <option value="never">Never smoked</option>
                            <option value="former">Former smoker</option>
                            <option value="current">Current smoker</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            On Statin
                          </label>
                          <select 
                            value={riskFactors.statin ? 'yes' : 'no'}
                            onChange={(e) => setRiskFactors({...riskFactors, statin: e.target.value === 'yes'})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                          >
                            <option value="no">No</option>
                            <option value="yes">Yes</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {riskFactors.smoking_status === 'former' && (
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Years since quitting smoking
                        </label>
                        <input
                          type="number"
                          value={riskFactors.years_since_quit || ''}
                          onChange={(e) => setRiskFactors({...riskFactors, years_since_quit: parseInt(e.target.value) || undefined})}
                          className="w-full md:w-1/4 px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="5"
                          min="0"
                          max="50"
                        />
                      </div>
                    )}
                  </div>

                  {/* Other Lifestyle Factors */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                      Other Lifestyle Factors
                    </h4>
                    <p className="text-xs text-gray-500 mb-3">These affect overall mortality risk but are not used in the PREVENT cardiovascular calculator</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
              )}
            </div>

            {/* Environmental & External Factors Section */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Environmental & External Factors</h3>
                  <p className="text-sm text-gray-500">Daily safety and environmental exposure risks</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEnvironmentalFactors(!showEnvironmentalFactors)}
                  className="text-green-600 hover:text-green-800 font-medium"
                >
                  {showEnvironmentalFactors ? 'Hide Factors' : 'Add Environmental Factors'}
                </button>
              </div>

              {showEnvironmentalFactors && (
                <div className="space-y-6">
                  {/* Daily Safety */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="font-semibold text-amber-800 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Daily Safety
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Primary Transportation Mode
                        </label>
                        <select 
                          value={riskFactors.transportation_mode || 'car'}
                          onChange={(e) => setRiskFactors({...riskFactors, transportation_mode: e.target.value as any})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="car">Car/Truck</option>
                          <option value="motorcycle">Motorcycle</option>
                          <option value="bicycle">Bicycle</option>
                          <option value="public_transit">Public Transit (bus, train, subway)</option>
                          <option value="walk">Walking</option>
                          <option value="work_from_home">Work from home / Minimal travel</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Motorcycles have ~29x higher fatality rate per mile vs cars</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Occupation Risk Level
                        </label>
                        <select 
                          value={riskFactors.occupation_risk || 'low'}
                          onChange={(e) => setRiskFactors({...riskFactors, occupation_risk: e.target.value as any})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="low">Low (office, education, IT, remote work)</option>
                          <option value="moderate">Moderate (retail, healthcare, manufacturing)</option>
                          <option value="high">High (construction, mining, agriculture)</option>
                          <option value="very_high">Very High (logging, fishing, roofing)</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Based on Bureau of Labor Statistics occupational fatality data</p>
                      </div>

                      <div className="md:col-span-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={riskFactors.firearm_in_home || false}
                            onChange={(e) => setRiskFactors({...riskFactors, firearm_in_home: e.target.checked})}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Firearm in household</span>
                        </label>
                        <p className="text-xs text-gray-500 mt-1 ml-5">Associated with ~1.9x higher risk of suicide/homicide mortality (Anglemyer et al. 2014)</p>
                      </div>
                    </div>
                  </div>

                  {/* Coming Soon placeholder */}
                  <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-500 mb-2 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      Environmental Exposure (Coming Soon)
                    </h4>
                    <p className="text-sm text-gray-500">Air quality (PM2.5), climate/heat risk, and geographic hazards</p>
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

            {/* AHA PREVENT Risk Calculator Results */}
            {result.preventRisk && result.preventRisk.available && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">AHA PREVENT Calculator</h2>
                    <p className="text-sm text-gray-500">Official AHA cardiovascular risk equations (Khan et al. 2024)</p>
                  </div>
                  <button
                    onClick={() => setShowInfoModal('preventRisk')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                
                {/* 10-Year Risks */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-3">10-Year Risk</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {result.preventRisk.risk_10yr_cvd?.toFixed(1) ?? 'N/A'}%
                      </div>
                      <div className="text-sm font-medium text-red-800">Total CVD</div>
                      <div className="text-xs text-red-600 mt-1">Heart attack, stroke, or HF</div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {result.preventRisk.risk_10yr_ascvd?.toFixed(1) ?? 'N/A'}%
                      </div>
                      <div className="text-sm font-medium text-orange-800">ASCVD</div>
                      <div className="text-xs text-orange-600 mt-1">Heart attack or stroke</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {result.preventRisk.risk_10yr_hf?.toFixed(1) ?? 'N/A'}%
                      </div>
                      <div className="text-sm font-medium text-purple-800">Heart Failure</div>
                      <div className="text-xs text-purple-600 mt-1">New-onset HF</div>
                    </div>
                  </div>
                </div>

                {/* 30-Year Risks (if available) */}
                {(result.preventRisk.risk_30yr_cvd !== null && result.preventRisk.risk_30yr_cvd !== undefined) && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-3">30-Year Risk (ages 30-59)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <div className="text-xl font-bold text-gray-700">
                          {result.preventRisk.risk_30yr_cvd?.toFixed(1) ?? 'N/A'}%
                        </div>
                        <div className="text-sm text-gray-600">Total CVD</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <div className="text-xl font-bold text-gray-700">
                          {result.preventRisk.risk_30yr_ascvd?.toFixed(1) ?? 'N/A'}%
                        </div>
                        <div className="text-sm text-gray-600">ASCVD</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <div className="text-xl font-bold text-gray-700">
                          {result.preventRisk.risk_30yr_hf?.toFixed(1) ?? 'N/A'}%
                        </div>
                        <div className="text-sm text-gray-600">Heart Failure</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Validation warnings */}
                {result.preventRisk.errors && result.preventRisk.errors.length > 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> {result.preventRisk.errors.join('. ')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* PREVENT not available message */}
            {result.preventRisk && !result.preventRisk.available && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-2">AHA PREVENT Calculator</h2>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">{result.preventRisk.message}</p>
                  {result.preventRisk.missing_fields && result.preventRisk.missing_fields.length > 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      Missing: {result.preventRisk.missing_fields.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            )}

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

            {/* 1-Year Mortality Visualization */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Your 1-Year Mortality Risk</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Icon Array */}
                <RiskIconArray
                  probability={result.oneYearMortality}
                  title="Visual Risk Representation"
                  subtitle="Each figure represents 1 person out of 100"
                />

                {/* Key Statistics */}
                <div className="flex flex-col justify-center space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-blue-700">
                      {(result.oneYearMortality * 100).toFixed(2)}%
                    </div>
                    <div className="text-sm text-blue-600">Probability of dying in the next year</div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-green-700">
                      {((1 - result.oneYearMortality) * 100).toFixed(2)}%
                    </div>
                    <div className="text-sm text-green-600">Probability of surviving the next year</div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-gray-700">
                      {result.lifeExpectancy.toFixed(1)} years
                    </div>
                    <div className="text-sm text-gray-600">Estimated life expectancy</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Causes of Death */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Most Likely Causes of Death (Next Year)</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div>
                  <RiskPieChart
                    title="Risk Distribution"
                    subtitle="Relative probability by cause"
                    data={result.causesOfDeath.slice(0, 8).map((cause: any) => ({
                      name: cause.name,
                      value: parseFloat((cause.probability * 100).toFixed(2))
                    }))}
                    height={280}
                  />
                </div>

                {/* List View */}
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
            </div>

            {/* Data Sources */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Data Sources</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800">Baseline Mortality</h3>
                  <p className="text-sm text-blue-600">{result.data_sources.baseline_mortality.source}</p>
                  <a href={result.data_sources.baseline_mortality.url} className="text-xs text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
                    View Source
                  </a>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-800">CVD Risk (PCE)</h3>
                  <p className="text-sm text-green-600">{result.cardiovascularRisk.source.paper}</p>
                  <p className="text-xs text-green-500">
                    {result.cardiovascularRisk.source.authors} ({result.cardiovascularRisk.source.year})
                  </p>
                </div>
                {result.preventRisk?.available && result.preventRisk?.source && (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h3 className="font-semibold text-purple-800">PREVENT (AHA)</h3>
                    <p className="text-sm text-purple-600">{result.preventRisk.source.name}</p>
                    <a href={result.preventRisk.source.url} className="text-xs text-purple-500 hover:underline" target="_blank" rel="noopener noreferrer">
                      Khan et al. {result.preventRisk.source.year}
                    </a>
                  </div>
                )}
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
                  {showInfoModal === 'preventRisk' && 'AHA PREVENT Calculator'}
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

              {showInfoModal === 'preventRisk' && (
                <div className="space-y-4">
                  <p className="text-gray-700">
                    <strong>AHA PREVENT Equations</strong> are the newest cardiovascular risk prediction tool from the American Heart Association, published in 2024.
                  </p>
                  
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-2">Key Improvements Over PCE</h4>
                    <ul className="text-xs text-red-600 space-y-1">
                      <li>• Includes <strong>kidney function (eGFR)</strong> as a risk factor</li>
                      <li>• Predicts <strong>heart failure</strong> in addition to ASCVD</li>
                      <li>• Validated for ages <strong>30-79</strong> (vs 40-79 for PCE)</li>
                      <li>• Provides <strong>30-year risk</strong> for younger adults</li>
                      <li>• Race-free model - does not use race as a variable</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2">Data Source</h4>
                    <p className="text-sm text-purple-700 font-medium">AHA PREVENT Equations - Khan et al. 2024</p>
                    <p className="text-xs text-purple-600 mb-2">Official AHA cardiovascular risk equations</p>
                    <p className="text-xs text-purple-500">Journal: Circulation, Volume 149(6), Pages 430-449</p>
                    <p className="text-xs text-purple-500">DOI: 10.1161/CIRCULATIONAHA.123.067626</p>
                    <p className="text-xs text-purple-500 mt-1">
                      <a href="https://professional.heart.org/en/guidelines-and-statements/about-prevent-calculator" 
                         className="underline hover:text-purple-700" target="_blank" rel="noopener noreferrer">
                        Official AHA PREVENT Calculator
                      </a>
                    </p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Risk Factors Used</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs text-green-600">
                      <div>
                        <p>• Age (30-79 years)</p>
                        <p>• Sex</p>
                        <p>• Total cholesterol</p>
                        <p>• HDL cholesterol</p>
                        <p>• Systolic blood pressure</p>
                      </div>
                      <div>
                        <p>• BP treatment status</p>
                        <p>• Diabetes status</p>
                        <p>• Smoking status</p>
                        <p>• <strong>eGFR</strong> (kidney function)</p>
                        <p>• Statin use</p>
                        <p>• BMI (for heart failure)</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">What It Predicts</h4>
                    <ul className="text-xs text-blue-600 space-y-1">
                      <li>• <strong>Total CVD:</strong> Heart attack, stroke, or heart failure</li>
                      <li>• <strong>ASCVD:</strong> Heart attack or stroke only</li>
                      <li>• <strong>Heart Failure:</strong> New-onset heart failure</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">Implementation Note</h4>
                    <p className="text-xs text-yellow-700">
                      This implementation uses the official AHA PREVENT R package equations, 
                      faithfully ported to Python. The coefficients and formulas are unchanged 
                      from the original publication.
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