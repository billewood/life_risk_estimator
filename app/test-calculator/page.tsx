'use client';

import React, { useState } from 'react';
import { integratedCalculator } from '@/lib/calculator/integrated-calculator';

export default function TestCalculatorPage() {
  const [inputs, setInputs] = useState({
    age: 45,
    sex: 'male' as 'male' | 'female',
    smoking: 'never' as 'never' | 'former' | 'current',
    systolicBP: 120,
    onBPMedication: false,
    bmi: 25,
    diabetes: false,
    cardiorespiratoryFitness: 10
  });
  
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const calculationResult = await integratedCalculator.calculateMortalityRisk(inputs);
      setResult(calculationResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Integrated Mortality Risk Calculator - Test Page
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Input Parameters</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  value={inputs.age}
                  onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="18"
                  max="100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sex
                </label>
                <select
                  value={inputs.sex}
                  onChange={(e) => handleInputChange('sex', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Smoking Status
                </label>
                <select
                  value={inputs.smoking}
                  onChange={(e) => handleInputChange('smoking', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="never">Never</option>
                  <option value="former">Former</option>
                  <option value="current">Current</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Systolic Blood Pressure (mmHg)
                </label>
                <input
                  type="number"
                  value={inputs.systolicBP}
                  onChange={(e) => handleInputChange('systolicBP', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="80"
                  max="200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  BMI (kg/m²)
                </label>
                <input
                  type="number"
                  value={inputs.bmi}
                  onChange={(e) => handleInputChange('bmi', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="15"
                  max="50"
                  step="0.1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cardiorespiratory Fitness (METs)
                </label>
                <input
                  type="number"
                  value={inputs.cardiorespiratoryFitness}
                  onChange={(e) => handleInputChange('cardiorespiratoryFitness', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="20"
                  step="0.1"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="diabetes"
                  checked={inputs.diabetes}
                  onChange={(e) => handleInputChange('diabetes', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="diabetes" className="ml-2 block text-sm text-gray-700">
                  Diabetes
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="onBPMedication"
                  checked={inputs.onBPMedication}
                  onChange={(e) => handleInputChange('onBPMedication', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="onBPMedication" className="ml-2 block text-sm text-gray-700">
                  On Blood Pressure Medication
                </label>
              </div>
              
              <button
                onClick={handleCalculate}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Calculating...' : 'Calculate Mortality Risk'}
              </button>
            </div>
          </div>
          
          {/* Results */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Results</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                <p className="text-red-800">Error: {error}</p>
              </div>
            )}
            
            {result && (
              <div className="space-y-4">
                {/* Baseline Risk */}
                <div className="border border-gray-200 rounded-md p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Baseline Risk</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">1-year mortality:</span>
                      <span className="ml-2 font-medium">{(result.baselineRisk.qx * 100).toFixed(2)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">6-month mortality:</span>
                      <span className="ml-2 font-medium">{(result.baselineRisk.qx6m * 100).toFixed(2)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">5-year mortality:</span>
                      <span className="ml-2 font-medium">{(result.baselineRisk.qx5y * 100).toFixed(2)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Life expectancy:</span>
                      <span className="ml-2 font-medium">{result.baselineRisk.lifeExpectancy.toFixed(1)} years</span>
                    </div>
                  </div>
                </div>
                
                {/* Top Causes */}
                <div className="border border-gray-200 rounded-md p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Top Causes of Death</h3>
                  <div className="space-y-2">
                    {(Object.entries(result.causeSpecificRisks) as Array<[string, { adjustedRisk: number }]>)
                      .sort(([,a], [,b]) => b.adjustedRisk - a.adjustedRisk)
                      .slice(0, 5)
                      .map(([cause, data]) => (
                        <div key={cause} className="flex justify-between text-sm">
                          <span className="text-gray-600">{cause}:</span>
                          <span className="font-medium">{(data.adjustedRisk * 100).toFixed(2)}%</span>
                        </div>
                      ))}
                  </div>
                </div>
                
                {/* Top Interventions */}
                <div className="border border-gray-200 rounded-md p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Top 3 Interventions</h3>
                  <div className="space-y-2">
                    {result.interventions.top3.map((intervention: any, index: number) => (
                      <div key={index} className="text-sm">
                        <div className="font-medium">{intervention.name}</div>
                        <div className="text-gray-600">
                          Risk reduction: {(intervention.absoluteRiskReduction * 100).toFixed(2)}%
                          ({intervention.difficulty} difficulty, {intervention.timeToEffect})
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Validation Results */}
                {result.validation.ePrognosis && (
                  <div className="border border-gray-200 rounded-md p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">ePrognosis Validation (≥65)</h3>
                    <div className="text-sm space-y-1">
                      <div>Lee Index: {(result.validation.ePrognosis.leeIndex * 100).toFixed(2)}%</div>
                      <div>Schonberg Index: {(result.validation.ePrognosis.schonbergIndex * 100).toFixed(2)}%</div>
                      <div className={result.validation.ePrognosis.withinRange ? 'text-green-600' : 'text-red-600'}>
                        Within range: {result.validation.ePrognosis.withinRange ? 'Yes' : 'No'}
                      </div>
                    </div>
                  </div>
                )}
                
                {result.validation.ascvd && (
                  <div className="border border-gray-200 rounded-md p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">ASCVD Validation (40-79)</h3>
                    <div className="text-sm space-y-1">
                      <div>10-year CVD risk: {(result.validation.ascvd.risk10Year * 100).toFixed(2)}%</div>
                      <div>Risk category: {result.validation.ascvd.riskCategory}</div>
                      <div className={result.validation.ascvd.withinRange ? 'text-green-600' : 'text-red-600'}>
                        Within range: {result.validation.ascvd.withinRange ? 'Yes' : 'No'}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Data Quality */}
                <div className="border border-gray-200 rounded-md p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Data Quality</h3>
                  <div className="text-sm space-y-1">
                    <div>Overall quality: <span className="font-medium">{result.dataQuality.overallQuality}</span></div>
                    <div>SSA data age: {result.dataQuality.ssaDataAge} days</div>
                    <div>CDC data age: {result.dataQuality.cdcDataAge} days</div>
                    <div>GBD data age: {result.dataQuality.gbdDataAge} days</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
