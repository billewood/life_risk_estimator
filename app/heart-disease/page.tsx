'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function HeartDiseasePage() {
  const router = useRouter();
  const [showPreventCalculator, setShowPreventCalculator] = useState(false);
  
  // PREVENT calculator state (will be populated from stored data)
  const [preventData, setPreventData] = useState<any>(null);

  useEffect(() => {
    // Try to get stored calculation data
    const storedData = sessionStorage.getItem('riskCalculationResult');
    if (storedData) {
      const parsed = JSON.parse(storedData);
      if (parsed.preventRisk) {
        setPreventData(parsed.preventRisk);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Results
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className="bg-red-100 rounded-full p-3 mr-4">
              <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Heart Disease</h1>
              <p className="text-gray-600">Cardiovascular disease risk assessment</p>
            </div>
          </div>

          <p className="text-gray-700 mb-4">
            Heart disease is the leading cause of death in the United States, responsible for about 
            1 in every 5 deaths. The good news is that many risk factors are modifiable through 
            lifestyle changes and medical treatment.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-700">~700,000</div>
              <div className="text-sm text-red-600">Deaths per year in the U.S.</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-700">47%</div>
              <div className="text-sm text-orange-600">Of Americans have at least 1 risk factor</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-700">80%</div>
              <div className="text-sm text-green-600">Of heart disease is preventable</div>
            </div>
          </div>
        </div>

        {/* Risk Factors */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Key Risk Factors</h2>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-yellow-100 rounded-full p-2 mr-3 mt-1">
                <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">High Blood Pressure</h3>
                <p className="text-sm text-gray-600">The "silent killer" - often has no symptoms but damages arteries over time</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-yellow-100 rounded-full p-2 mr-3 mt-1">
                <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">High Cholesterol</h3>
                <p className="text-sm text-gray-600">LDL ("bad") cholesterol builds up in artery walls</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-yellow-100 rounded-full p-2 mr-3 mt-1">
                <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Smoking</h3>
                <p className="text-sm text-gray-600">Damages blood vessels and reduces oxygen in blood</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-yellow-100 rounded-full p-2 mr-3 mt-1">
                <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Diabetes</h3>
                <p className="text-sm text-gray-600">High blood sugar damages blood vessels and nerves</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-yellow-100 rounded-full p-2 mr-3 mt-1">
                <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Obesity</h3>
                <p className="text-sm text-gray-600">Increases strain on heart and raises other risk factors</p>
              </div>
            </div>
          </div>
        </div>

        {/* AHA PREVENT Calculator Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">AHA PREVENT Calculator</h2>
          <p className="text-gray-600 mb-4">
            The American Heart Association PREVENT equations provide personalized 10-year and 30-year 
            cardiovascular disease risk predictions based on your specific health data.
          </p>

          {preventData?.available ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-sm text-purple-600 mb-1">10-Year Total CVD Risk</div>
                  <div className="text-2xl font-bold text-purple-700">
                    {preventData.risk_10yr_cvd ? `${(preventData.risk_10yr_cvd * 100).toFixed(1)}%` : 'N/A'}
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-blue-600 mb-1">10-Year ASCVD Risk</div>
                  <div className="text-2xl font-bold text-blue-700">
                    {preventData.risk_10yr_ascvd ? `${(preventData.risk_10yr_ascvd * 100).toFixed(1)}%` : 'N/A'}
                  </div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="text-sm text-red-600 mb-1">10-Year Heart Failure Risk</div>
                  <div className="text-2xl font-bold text-red-700">
                    {preventData.risk_10yr_hf ? `${(preventData.risk_10yr_hf * 100).toFixed(1)}%` : 'N/A'}
                  </div>
                </div>
              </div>
              
              {preventData.risk_30yr_cvd && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">30-Year Projections</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">CVD: </span>
                      <span className="font-semibold">{(preventData.risk_30yr_cvd * 100).toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">ASCVD: </span>
                      <span className="font-semibold">{preventData.risk_30yr_ascvd ? `${(preventData.risk_30yr_ascvd * 100).toFixed(1)}%` : 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Heart Failure: </span>
                      <span className="font-semibold">{preventData.risk_30yr_hf ? `${(preventData.risk_30yr_hf * 100).toFixed(1)}%` : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-gray-600 mb-4">
                To get your personalized PREVENT risk score, we need additional health information 
                including blood pressure, cholesterol levels, and kidney function (eGFR).
              </p>
              <button
                onClick={() => router.push('/?showPrevent=true')}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Complete PREVENT Calculator
              </button>
            </div>
          )}
        </div>

        {/* Prevention Tips */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">How to Reduce Your Risk</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-green-200 rounded-lg p-4 bg-green-50">
              <h3 className="font-semibold text-green-800 mb-2">Lifestyle Changes</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Exercise 150+ minutes per week</li>
                <li>• Eat a heart-healthy diet (Mediterranean, DASH)</li>
                <li>• Maintain healthy weight (BMI 18.5-24.9)</li>
                <li>• Quit smoking</li>
                <li>• Limit alcohol consumption</li>
                <li>• Manage stress</li>
              </ul>
            </div>
            
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <h3 className="font-semibold text-blue-800 mb-2">Medical Management</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Regular blood pressure monitoring</li>
                <li>• Cholesterol screening and treatment</li>
                <li>• Blood sugar control if diabetic</li>
                <li>• Aspirin therapy (if recommended)</li>
                <li>• Statin therapy (if indicated)</li>
                <li>• Regular check-ups with your doctor</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Data Source */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Data sources: CDC, American Heart Association, Khan et al. 2024 (PREVENT Equations)</p>
        </div>
      </div>
    </div>
  );
}
