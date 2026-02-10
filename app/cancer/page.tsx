'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RiskPieChart from '../components/RiskPieChart';

// Cancer type breakdown data (approximate U.S. mortality percentages)
const cancerBreakdown = [
  { name: 'Lung & Bronchus', value: 21.0, id: 'lung', prevention: 'Don\'t smoke, avoid secondhand smoke, test home for radon' },
  { name: 'Colorectal', value: 8.6, id: 'colorectal', prevention: 'Regular screening after 45, high-fiber diet, limit red meat' },
  { name: 'Pancreatic', value: 8.0, id: 'pancreatic', prevention: 'Don\'t smoke, maintain healthy weight, limit alcohol' },
  { name: 'Breast', value: 6.8, id: 'breast', prevention: 'Regular mammograms, maintain healthy weight, limit alcohol' },
  { name: 'Prostate', value: 5.7, id: 'prostate', prevention: 'Regular PSA screening, healthy diet, exercise' },
  { name: 'Liver', value: 5.2, id: 'liver', prevention: 'Hepatitis vaccination, limit alcohol, maintain healthy weight' },
  { name: 'Leukemia', value: 4.0, id: 'leukemia', prevention: 'Avoid benzene exposure, don\'t smoke' },
  { name: 'Non-Hodgkin Lymphoma', value: 3.5, id: 'lymphoma', prevention: 'Maintain healthy immune system, avoid certain chemicals' },
  { name: 'Brain & Nervous System', value: 3.2, id: 'brain', prevention: 'Limited known prevention methods' },
  { name: 'Other Cancers', value: 34.0, id: 'other', prevention: 'Varies by type - see your doctor for screenings' },
];

export default function CancerPage() {
  const router = useRouter();
  const [showRiskFactors, setShowRiskFactors] = useState(false);

  const handleCancerClick = (item: { name: string; value: number; id?: string }) => {
    const id = item.id || item.name.toLowerCase().replace(/\s+/g, '-');
    router.push(`/cancers/${id}`);
  };
  
  // Personalized risk factor inputs
  const [smokingStatus, setSmokingStatus] = useState<'never' | 'former' | 'current'>('never');
  const [packYears, setPackYears] = useState('');
  const [alcoholDrinks, setAlcoholDrinks] = useState('');
  const [bmi, setBmi] = useState('');
  const [familyHistory, setFamilyHistory] = useState<string[]>([]);
  const [sunExposure, setSunExposure] = useState<'low' | 'moderate' | 'high'>('moderate');
  const [exerciseHours, setExerciseHours] = useState('');
  const [redMeatServings, setRedMeatServings] = useState('');
  const [processedMeatServings, setProcessedMeatServings] = useState('');

  const toggleFamilyHistory = (cancer: string) => {
    if (familyHistory.includes(cancer)) {
      setFamilyHistory(familyHistory.filter(c => c !== cancer));
    } else {
      setFamilyHistory([...familyHistory, cancer]);
    }
  };

  // TODO: Implement personalized risk calculation
  // For now, this just shows the form - calculation logic to be added
  const hasPersonalizedData = smokingStatus !== 'never' || alcoholDrinks || bmi || familyHistory.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => {
            window.location.href = '/?view=results'
          }}
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
            <div className="bg-purple-100 rounded-full p-3 mr-4">
              <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Cancer</h1>
              <p className="text-gray-600">Understanding and preventing cancer risks</p>
            </div>
          </div>

          <p className="text-gray-700 mb-4">
            Cancer is the second leading cause of death in the United States. While not all cancers 
            are preventable, up to 50% of cancer deaths could be prevented through lifestyle changes 
            and early detection through screening.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-700">~600,000</div>
              <div className="text-sm text-purple-600">Deaths per year in the U.S.</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-700">40%</div>
              <div className="text-sm text-blue-600">Of Americans will be diagnosed</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-700">50%</div>
              <div className="text-sm text-green-600">Of deaths are potentially preventable</div>
            </div>
          </div>
        </div>

        {/* Personalized Risk Factors Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <button
            onClick={() => setShowRiskFactors(!showRiskFactors)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center">
              <div className="bg-orange-100 rounded-full p-2 mr-3">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="text-left">
                <h2 className="text-lg font-semibold text-gray-900">Personalize Your Cancer Risk</h2>
                <p className="text-sm text-gray-500">Enter your lifestyle factors for a tailored assessment</p>
              </div>
            </div>
            <svg 
              className={`w-5 h-5 text-gray-400 transform transition-transform ${showRiskFactors ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showRiskFactors && (
            <div className="mt-6 space-y-6 border-t pt-6">
              {/* Smoking */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Smoking Status</label>
                <div className="flex gap-3">
                  {(['never', 'former', 'current'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setSmokingStatus(status)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        smokingStatus === status
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {status === 'never' ? 'Never Smoked' : status === 'former' ? 'Former Smoker' : 'Current Smoker'}
                    </button>
                  ))}
                </div>
                {(smokingStatus === 'former' || smokingStatus === 'current') && (
                  <div className="mt-3">
                    <label className="block text-xs text-gray-600 mb-1">Pack-years (packs/day × years smoked)</label>
                    <input
                      type="number"
                      value={packYears}
                      onChange={(e) => setPackYears(e.target.value)}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="e.g., 20"
                    />
                  </div>
                )}
              </div>

              {/* Alcohol */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alcohol Consumption</label>
                <p className="text-xs text-gray-500 mb-2">Average drinks per week (1 drink = 12oz beer, 5oz wine, 1.5oz spirits)</p>
                <input
                  type="number"
                  value={alcoholDrinks}
                  onChange={(e) => setAlcoholDrinks(e.target.value)}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="0"
                />
              </div>

              {/* BMI */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">BMI</label>
                <input
                  type="number"
                  value={bmi}
                  onChange={(e) => setBmi(e.target.value)}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="25"
                  step="0.1"
                />
                <p className="text-xs text-gray-500 mt-1">Normal: 18.5-24.9 | Overweight: 25-29.9 | Obese: 30+</p>
              </div>

              {/* Diet */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Red Meat (servings/week)</label>
                  <input
                    type="number"
                    value={redMeatServings}
                    onChange={(e) => setRedMeatServings(e.target.value)}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Processed Meat (servings/week)</label>
                  <input
                    type="number"
                    value={processedMeatServings}
                    onChange={(e) => setProcessedMeatServings(e.target.value)}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="2"
                  />
                </div>
              </div>

              {/* Exercise */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exercise (hours/week of moderate activity)</label>
                <input
                  type="number"
                  value={exerciseHours}
                  onChange={(e) => setExerciseHours(e.target.value)}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="2.5"
                  step="0.5"
                />
              </div>

              {/* Sun Exposure */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sun Exposure (without protection)</label>
                <div className="flex gap-3">
                  {(['low', 'moderate', 'high'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setSunExposure(level)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        sunExposure === level
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Family History */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Family History of Cancer (first-degree relatives)</label>
                <div className="flex flex-wrap gap-2">
                  {['Breast', 'Colorectal', 'Lung', 'Prostate', 'Ovarian', 'Pancreatic', 'Melanoma'].map((cancer) => (
                    <button
                      key={cancer}
                      onClick={() => toggleFamilyHistory(cancer)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        familyHistory.includes(cancer)
                          ? 'bg-red-100 text-red-700 border-2 border-red-400'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      {cancer}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculate Button - Placeholder for now */}
              <div className="pt-4 border-t">
                <button
                  disabled
                  className="w-full bg-gray-300 text-gray-500 py-3 px-4 rounded-lg font-medium cursor-not-allowed"
                >
                  Personalized Calculation Coming Soon
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  We're working on integrating evidence-based relative risk data to provide personalized cancer risk estimates.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Cancer Type Breakdown */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Cancer Deaths by Type</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RiskPieChart
              title="Distribution of Cancer Deaths"
              subtitle="Click a slice to learn more"
              data={cancerBreakdown}
              height={320}
              clickable={true}
              onSliceClick={handleCancerClick}
            />

            <div className="space-y-2">
              {cancerBreakdown.slice(0, 9).map((cancer) => (
                <div key={cancer.id} className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-800">{cancer.name}</span>
                    <span className="text-sm font-semibold text-purple-600">{cancer.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Prevention by Cancer Type */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Prevention Strategies</h2>
          
          <div className="space-y-4">
            {cancerBreakdown.slice(0, 9).map((cancer) => (
              <div key={cancer.id} className="border-l-4 border-purple-400 pl-4 py-2">
                <h3 className="font-semibold text-gray-800">{cancer.name}</h3>
                <p className="text-sm text-gray-600">{cancer.prevention}</p>
              </div>
            ))}
          </div>
        </div>

        {/* General Prevention */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">General Cancer Prevention</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-green-200 rounded-lg p-4 bg-green-50">
              <h3 className="font-semibold text-green-800 mb-2">Lifestyle Factors</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• <strong>Don't smoke</strong> - Causes ~30% of cancer deaths</li>
                <li>• <strong>Maintain healthy weight</strong> - Obesity linked to 13 cancers</li>
                <li>• <strong>Exercise regularly</strong> - Reduces risk of several cancers</li>
                <li>• <strong>Eat healthy</strong> - Fruits, vegetables, whole grains</li>
                <li>• <strong>Limit alcohol</strong> - No safe level for cancer prevention</li>
                <li>• <strong>Protect from sun</strong> - Prevents skin cancer</li>
              </ul>
            </div>
            
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <h3 className="font-semibold text-blue-800 mb-2">Screening & Medical</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>Colonoscopy</strong> - Starting at age 45</li>
                <li>• <strong>Mammogram</strong> - Starting at age 40-50</li>
                <li>• <strong>Pap smear</strong> - Starting at age 21</li>
                <li>• <strong>Low-dose CT</strong> - For heavy smokers 50-80</li>
                <li>• <strong>HPV vaccine</strong> - Prevents cervical cancer</li>
                <li>• <strong>Hepatitis B vaccine</strong> - Prevents liver cancer</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Screening Guidelines */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recommended Screening Schedule</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-semibold">Cancer Type</th>
                  <th className="text-left py-2 font-semibold">Screening Test</th>
                  <th className="text-left py-2 font-semibold">When to Start</th>
                  <th className="text-left py-2 font-semibold">Frequency</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                <tr className="border-b">
                  <td className="py-2">Colorectal</td>
                  <td>Colonoscopy / FIT test</td>
                  <td>Age 45</td>
                  <td>Every 10 years / annually</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Breast</td>
                  <td>Mammogram</td>
                  <td>Age 40-50</td>
                  <td>Every 1-2 years</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Cervical</td>
                  <td>Pap smear + HPV test</td>
                  <td>Age 21</td>
                  <td>Every 3-5 years</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Lung</td>
                  <td>Low-dose CT scan</td>
                  <td>Age 50 (if smoker)</td>
                  <td>Annually</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Prostate</td>
                  <td>PSA test (discuss with doctor)</td>
                  <td>Age 50-55</td>
                  <td>Varies</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Data Source */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Data sources: American Cancer Society, CDC, National Cancer Institute</p>
        </div>
      </div>
    </div>
  );
}
