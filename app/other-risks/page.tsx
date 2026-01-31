'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import RiskPieChart from '../components/RiskPieChart';

// External causes breakdown (CDC data - annual U.S. deaths)
const externalCausesBreakdown = [
  { name: 'Drug Overdose/Poisoning', value: 39.3, id: 'overdose' },
  { name: 'Motor Vehicle Accidents', value: 14.0, id: 'motor_vehicle' },
  { name: 'Firearm Deaths', value: 16.5, id: 'firearm' },
  { name: 'Falls', value: 16.2, id: 'falls' },
  { name: 'Suffocation', value: 6.2, id: 'suffocation' },
  { name: 'Drowning', value: 1.5, id: 'drowning' },
  { name: 'Fire/Burns', value: 1.1, id: 'fire' },
  { name: 'Other Accidents', value: 5.2, id: 'other' },
];

export default function OtherRisksPage() {
  const router = useRouter();
  const [environmentalData, setEnvironmentalData] = useState<any>(null);
  const [showPersonalization, setShowPersonalization] = useState(false);
  
  // Personalization inputs (under construction)
  const [livesAlone, setLivesAlone] = useState(false);
  const [hasPool, setHasPool] = useState(false);
  const [usesLadders, setUsesLadders] = useState(false);
  const [ridesMotorcycle, setRidesMotorcycle] = useState(false);
  const [usesFirearms, setUsesFirearms] = useState(false);
  const [takesOpioids, setTakesOpioids] = useState(false);

  useEffect(() => {
    const storedData = sessionStorage.getItem('riskCalculationResult');
    if (storedData) {
      const parsed = JSON.parse(storedData);
      if (parsed.environmentalRisk) {
        setEnvironmentalData(parsed.environmentalRisk);
      }
    }
  }, []);

  const handleCauseClick = (item: { name: string; value: number; id?: string }) => {
    const id = item.id || item.name.toLowerCase().replace(/\s+/g, '-');
    router.push(`/risks/${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
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
            <div className="bg-amber-100 rounded-full p-3 mr-4">
              <svg className="w-8 h-8 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">External & Environmental Risks</h1>
              <p className="text-gray-600">Transportation, occupation, and other external factors</p>
            </div>
          </div>

          <p className="text-gray-700 mb-4">
            While chronic diseases account for the majority of deaths, external factors like accidents, 
            occupational hazards, and environmental exposures also contribute significantly to mortality risk.
            Many of these risks are modifiable through lifestyle choices and safety practices.
          </p>
        </div>

        {/* External Causes Breakdown Pie Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Breakdown of External Causes</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RiskPieChart
              title="External Causes of Death"
              subtitle="Click a slice to learn more"
              data={externalCausesBreakdown}
              height={320}
              colors={['#dc2626', '#ea580c', '#d97706', '#ca8a04', '#65a30d', '#16a34a', '#0891b2', '#6366f1']}
              clickable={true}
              onSliceClick={handleCauseClick}
            />

            <div className="space-y-2">
              {externalCausesBreakdown.map((cause) => (
                <div key={cause.id} className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800">{cause.name}</span>
                    <span className="text-sm font-semibold text-amber-600">{cause.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-4 text-center">
            Data source: CDC National Vital Statistics, 2022. Percentages are of total unintentional injury deaths.
          </p>
        </div>

        {/* Personalize Your Risk - Under Construction */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <button
            onClick={() => setShowPersonalization(!showPersonalization)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center">
              <div className="bg-yellow-100 rounded-full p-2 mr-3">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <div className="text-left">
                <h2 className="text-lg font-semibold text-gray-900">Personalize Your External Risk</h2>
                <p className="text-sm text-gray-500">Enter your lifestyle factors for tailored assessment</p>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full mr-2">Under Construction</span>
              <svg 
                className={`w-5 h-5 text-gray-400 transform transition-transform ${showPersonalization ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {showPersonalization && (
            <div className="mt-6 space-y-4 border-t pt-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Coming Soon:</strong> We're working on personalized risk calculations based on your lifestyle factors. 
                  For now, you can see what factors we'll be considering.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <label className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                  <input
                    type="checkbox"
                    checked={livesAlone}
                    onChange={(e) => setLivesAlone(e.target.checked)}
                    className="mr-3"
                  />
                  <span className="text-sm text-gray-700">Lives Alone</span>
                </label>
                
                <label className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                  <input
                    type="checkbox"
                    checked={hasPool}
                    onChange={(e) => setHasPool(e.target.checked)}
                    className="mr-3"
                  />
                  <span className="text-sm text-gray-700">Has Swimming Pool</span>
                </label>
                
                <label className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                  <input
                    type="checkbox"
                    checked={usesLadders}
                    onChange={(e) => setUsesLadders(e.target.checked)}
                    className="mr-3"
                  />
                  <span className="text-sm text-gray-700">Uses Ladders Regularly</span>
                </label>
                
                <label className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                  <input
                    type="checkbox"
                    checked={ridesMotorcycle}
                    onChange={(e) => setRidesMotorcycle(e.target.checked)}
                    className="mr-3"
                  />
                  <span className="text-sm text-gray-700">Rides Motorcycle</span>
                </label>
                
                <label className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                  <input
                    type="checkbox"
                    checked={usesFirearms}
                    onChange={(e) => setUsesFirearms(e.target.checked)}
                    className="mr-3"
                  />
                  <span className="text-sm text-gray-700">Owns/Uses Firearms</span>
                </label>
                
                <label className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                  <input
                    type="checkbox"
                    checked={takesOpioids}
                    onChange={(e) => setTakesOpioids(e.target.checked)}
                    className="mr-3"
                  />
                  <span className="text-sm text-gray-700">Takes Prescription Opioids</span>
                </label>
              </div>

              <button
                disabled
                className="w-full bg-gray-300 text-gray-500 py-3 px-4 rounded-lg font-medium cursor-not-allowed mt-4"
              >
                Personalized Calculation Coming Soon
              </button>
            </div>
          )}
        </div>

        {/* Your Environmental Risk Profile */}
        {environmentalData?.available && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Your Environmental Risk Profile</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {environmentalData.factors?.transportation && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-blue-600 mb-1">Transportation Mode</div>
                  <div className="text-lg font-bold text-blue-700 capitalize">
                    {environmentalData.factors.transportation.mode?.replace('_', ' ')}
                  </div>
                  <div className="text-xs text-blue-500 mt-1">
                    Adjusted RR: {environmentalData.factors.transportation.adjusted_rr}x
                  </div>
                </div>
              )}
              
              {environmentalData.factors?.occupation && (
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="text-sm text-orange-600 mb-1">Occupation Risk</div>
                  <div className="text-lg font-bold text-orange-700 capitalize">
                    {environmentalData.factors.occupation.level} Risk
                  </div>
                  <div className="text-xs text-orange-500 mt-1">
                    Adjusted RR: {environmentalData.factors.occupation.adjusted_rr}x
                  </div>
                </div>
              )}
              
              {environmentalData.factors?.firearm && (
                <div className={`${environmentalData.factors.firearm.present ? 'bg-red-50' : 'bg-green-50'} rounded-lg p-4`}>
                  <div className={`text-sm ${environmentalData.factors.firearm.present ? 'text-red-600' : 'text-green-600'} mb-1`}>
                    Firearm in Home
                  </div>
                  <div className={`text-lg font-bold ${environmentalData.factors.firearm.present ? 'text-red-700' : 'text-green-700'}`}>
                    {environmentalData.factors.firearm.present ? 'Yes' : 'No'}
                  </div>
                  {environmentalData.factors.firearm.present && (
                    <div className="text-xs text-red-500 mt-1">
                      Adjusted RR: {environmentalData.factors.firearm.adjusted_rr}x
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">
                Combined Environmental Risk Multiplier: 
                <span className="font-bold text-gray-800 ml-2">{environmentalData.combined_rr}x</span>
              </div>
            </div>
          </div>
        )}

        {/* Transportation Risks */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Transportation Risks</h2>
          
          <p className="text-gray-600 mb-4">
            Motor vehicle accidents are a leading cause of death, especially for younger adults. 
            Your choice of transportation significantly affects your risk.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4 font-semibold">Mode</th>
                  <th className="text-left py-3 px-4 font-semibold">Relative Risk vs Car</th>
                  <th className="text-left py-3 px-4 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Motorcycle</td>
                  <td className="py-3 px-4 text-red-600 font-bold">29x higher</td>
                  <td className="py-3 px-4">Per mile, most dangerous common transport</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Bicycle</td>
                  <td className="py-3 px-4 text-orange-600 font-bold">2.3x higher</td>
                  <td className="py-3 px-4">Per mile; health benefits may offset risk</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Walking</td>
                  <td className="py-3 px-4 text-yellow-600 font-bold">1.5x higher</td>
                  <td className="py-3 px-4">Per mile; health benefits significant</td>
                </tr>
                <tr className="border-b bg-blue-50">
                  <td className="py-3 px-4 font-medium">Car</td>
                  <td className="py-3 px-4 font-bold">1x (baseline)</td>
                  <td className="py-3 px-4">Reference category</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Public Transit</td>
                  <td className="py-3 px-4 text-green-600 font-bold">0.1x (10x safer)</td>
                  <td className="py-3 px-4">Bus, train, subway - safest per mile</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Safety Tips</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Always wear seatbelts</li>
              <li>• Never drink and drive</li>
              <li>• Avoid distracted driving (phones, etc.)</li>
              <li>• Wear helmets when cycling or motorcycling</li>
              <li>• Use high-visibility clothing when walking/cycling at night</li>
            </ul>
          </div>
        </div>

        {/* Occupational Risks */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Occupational Risks</h2>
          
          <p className="text-gray-600 mb-4">
            Some occupations carry significantly higher mortality risks due to workplace hazards.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <h3 className="font-semibold text-red-800 mb-2">Highest Risk Occupations</h3>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• <strong>Logging workers</strong> - 82.2 deaths per 100k</li>
                <li>• <strong>Fishing workers</strong> - 75.2 deaths per 100k</li>
                <li>• <strong>Aircraft pilots</strong> - 58.4 deaths per 100k</li>
                <li>• <strong>Roofers</strong> - 47.0 deaths per 100k</li>
                <li>• <strong>Construction laborers</strong> - 13.3 deaths per 100k</li>
              </ul>
              <p className="text-xs text-red-600 mt-2">Source: BLS Census of Fatal Occupational Injuries 2022</p>
            </div>
            
            <div className="border border-green-200 rounded-lg p-4 bg-green-50">
              <h3 className="font-semibold text-green-800 mb-2">Lowest Risk Occupations</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• <strong>Office workers</strong> - ~0.5 deaths per 100k</li>
                <li>• <strong>Education</strong> - ~0.8 deaths per 100k</li>
                <li>• <strong>Information technology</strong> - ~0.4 deaths per 100k</li>
                <li>• <strong>Healthcare (non-clinical)</strong> - ~1.0 deaths per 100k</li>
                <li>• <strong>Remote work</strong> - Minimal occupational risk</li>
              </ul>
              <p className="text-xs text-green-600 mt-2">Compared to average of 3.6 deaths per 100k workers</p>
            </div>
          </div>
        </div>

        {/* Firearm Risk */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Firearm Access</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-600 mb-4">
                Research shows that having a firearm in the home is associated with increased risk 
                of death by suicide and homicide, primarily among household members.
              </p>
              
              <div className="bg-amber-50 rounded-lg p-4 mb-4">
                <div className="text-2xl font-bold text-amber-700">1.9x</div>
                <div className="text-sm text-amber-600">
                  Higher risk of suicide/homicide death with firearm access
                </div>
                <p className="text-xs text-amber-500 mt-2">
                  Source: Anglemyer et al. 2014, Annals of Internal Medicine
                </p>
              </div>
            </div>

            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <h3 className="font-semibold text-blue-800 mb-2">Safety Recommendations</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Store firearms locked and unloaded</li>
                <li>• Keep ammunition stored separately</li>
                <li>• Use gun safes or lockboxes</li>
                <li>• Consider temporary removal during crises</li>
                <li>• Educate household members on safety</li>
                <li>• Consider alternatives for home protection</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Other External Risks */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Other External Factors</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Falls</h3>
              <p className="text-sm text-gray-600">
                Leading cause of injury death for those 65+. Use handrails, remove tripping hazards, 
                exercise for balance.
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Drug Overdose</h3>
              <p className="text-sm text-gray-600">
                Now leading cause of accidental death. Avoid opioids when possible, never mix 
                with alcohol or benzos.
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Drowning</h3>
              <p className="text-sm text-gray-600">
                Learn to swim, never swim alone, supervise children near water, wear life jackets.
              </p>
            </div>
          </div>
        </div>

        {/* Data Source */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Data sources: NHTSA, BLS, IIHS, CDC, Annals of Internal Medicine</p>
        </div>
      </div>
    </div>
  );
}
