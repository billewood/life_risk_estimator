'use client';

import React, { useState } from 'react';
import { ShortTermRiskProfile } from '@/lib/shortterm/types';

interface ShortTermRiskFormProps {
  onCalculate: (profile: ShortTermRiskProfile) => void;
  loading?: boolean;
}

export function ShortTermRiskForm({ onCalculate, loading = false }: ShortTermRiskFormProps) {
  const [profile, setProfile] = useState<ShortTermRiskProfile>({
    recentHospitalization: false,
    recentFalls: 0,
    recentERVisits: 0,
    functionalDecline: false,
    mobilityIssues: false,
    cognitiveDecline: false,
    livingAlone: false,
    socialSupport: 'good',
    depressionAnxiety: false,
    alcoholUse: 'none',
    drugUse: false,
    medicationAdherence: 'good',
    recentMedChanges: false,
    weightLoss: false,
    poorNutrition: false,
    diabetes: false,
    heartDisease: false,
    copd: false,
    kidneyDisease: false,
    cancer: false,
    financialStress: false,
    drivingFrequency: 'moderate',
    cyclingActivity: 'none',
    familyHeartDisease: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate(profile);
  };

  const updateProfile = (updates: Partial<ShortTermRiskProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-6 h-6 bg-white/20 rounded-full mb-3">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Short-Term Risk Assessment
            </h2>
            <p className="text-orange-100 text-lg leading-relaxed max-w-2xl mx-auto">
              This assessment evaluates risk factors that may increase your risk of death in the next 6 months.
            </p>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-8">

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Recent Health Events */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-xl p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-red-800">Recent Health Events</h3>
              </div>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="recentHospitalization"
                checked={profile.recentHospitalization}
                onChange={(e) => updateProfile({ recentHospitalization: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="recentHospitalization" className="ml-2 text-sm text-gray-700">
                Hospitalized in the last 30 days
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of falls in the last 3 months
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={profile.recentFalls}
                onChange={(e) => updateProfile({ recentFalls: parseInt(e.target.value) || 0 })}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of emergency room visits in the last 6 months
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={profile.recentERVisits}
                onChange={(e) => updateProfile({ recentERVisits: parseInt(e.target.value) || 0 })}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Functional Status */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Functional Status</h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="functionalDecline"
                checked={profile.functionalDecline}
                onChange={(e) => updateProfile({ functionalDecline: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="functionalDecline" className="ml-2 text-sm text-gray-700">
                Recent decline in ability to perform daily activities
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="mobilityIssues"
                checked={profile.mobilityIssues}
                onChange={(e) => updateProfile({ mobilityIssues: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="mobilityIssues" className="ml-2 text-sm text-gray-700">
                Recent problems with walking or movement
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="cognitiveDecline"
                checked={profile.cognitiveDecline}
                onChange={(e) => updateProfile({ cognitiveDecline: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="cognitiveDecline" className="ml-2 text-sm text-gray-700">
                Recent changes in memory or thinking
              </label>
            </div>
          </div>
        </div>

        {/* Social Factors */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Support</h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="livingAlone"
                checked={profile.livingAlone}
                onChange={(e) => updateProfile({ livingAlone: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="livingAlone" className="ml-2 text-sm text-gray-700">
                Living alone
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Social support level
              </label>
              <select
                value={profile.socialSupport}
                onChange={(e) => updateProfile({ socialSupport: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="excellent">Excellent - Strong family and community support</option>
                <option value="good">Good - Regular social connections</option>
                <option value="limited">Limited - Some social connections</option>
                <option value="none">None - Very isolated</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="financialStress"
                checked={profile.financialStress}
                onChange={(e) => updateProfile({ financialStress: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="financialStress" className="ml-2 text-sm text-gray-700">
                Financial stress affecting healthcare access
              </label>
            </div>
          </div>
        </div>

        {/* Mental Health & Substance Use */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mental Health & Substance Use</h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="depressionAnxiety"
                checked={profile.depressionAnxiety}
                onChange={(e) => updateProfile({ depressionAnxiety: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="depressionAnxiety" className="ml-2 text-sm text-gray-700">
                Recent depression or anxiety
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alcohol use
              </label>
              <select
                value={profile.alcoholUse}
                onChange={(e) => updateProfile({ alcoholUse: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">None</option>
                <option value="light">Light (1-2 drinks per week)</option>
                <option value="moderate">Moderate (3-7 drinks per week)</option>
                <option value="heavy">Heavy (8+ drinks per week)</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="drugUse"
                checked={profile.drugUse}
                onChange={(e) => updateProfile({ drugUse: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="drugUse" className="ml-2 text-sm text-gray-700">
                Recreational drug use
              </label>
            </div>
          </div>
        </div>

        {/* Medication & Care */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Medication & Care</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medication adherence
              </label>
              <select
                value={profile.medicationAdherence}
                onChange={(e) => updateProfile({ medicationAdherence: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="excellent">Excellent - Never miss doses</option>
                <option value="good">Good - Rarely miss doses</option>
                <option value="poor">Poor - Sometimes miss doses</option>
                <option value="very_poor">Very poor - Often miss doses</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="recentMedChanges"
                checked={profile.recentMedChanges}
                onChange={(e) => updateProfile({ recentMedChanges: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="recentMedChanges" className="ml-2 text-sm text-gray-700">
                Recent medication changes in last month
              </label>
            </div>
          </div>
        </div>

        {/* Nutrition & Weight */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nutrition & Weight</h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="weightLoss"
                checked={profile.weightLoss}
                onChange={(e) => updateProfile({ weightLoss: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="weightLoss" className="ml-2 text-sm text-gray-700">
                Unintentional weight loss (10+ pounds in 6 months)
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="poorNutrition"
                checked={profile.poorNutrition}
                onChange={(e) => updateProfile({ poorNutrition: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="poorNutrition" className="ml-2 text-sm text-gray-700">
                Poor nutrition or eating patterns
              </label>
            </div>
          </div>
        </div>

        {/* Chronic Conditions */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Chronic Conditions</h3>
          <p className="text-sm text-gray-600 mb-4">
            Check if you have any of these conditions that may be poorly controlled or recently worsened:
          </p>
          
          <div className="space-y-3">
            {[
              { key: 'diabetes', label: 'Diabetes' },
              { key: 'heartDisease', label: 'Heart Disease' },
              { key: 'copd', label: 'COPD/Lung Disease' },
              { key: 'kidneyDisease', label: 'Kidney Disease' },
              { key: 'cancer', label: 'Cancer' }
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center">
                <input
                  type="checkbox"
                  id={key}
                  checked={profile[key as keyof ShortTermRiskProfile] as boolean}
                  onChange={(e) => updateProfile({ [key]: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={key} className="ml-2 text-sm text-gray-700">
                  {label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Transportation & Activity */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Transportation & Activity</h3>
          <p className="text-sm text-gray-600 mb-4">
            These factors affect both accident risk and cardiovascular health:
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How often do you drive a car?
              </label>
              <select
                value={profile.drivingFrequency}
                onChange={(e) => updateProfile({ drivingFrequency: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">Never drive</option>
                <option value="rare">Rarely (few times per month)</option>
                <option value="moderate">Moderately (few times per week)</option>
                <option value="frequent">Frequently (almost daily)</option>
                <option value="daily">Daily (multiple times per day)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How often do you ride a bicycle?
              </label>
              <select
                value={profile.cyclingActivity}
                onChange={(e) => updateProfile({ cyclingActivity: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">Never ride a bike</option>
                <option value="occasional">Occasionally (few times per month)</option>
                <option value="regular">Regularly (few times per week)</option>
                <option value="daily">Daily or almost daily</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Note: Regular cycling has cardiovascular benefits but also accident risks
              </p>
            </div>
          </div>
        </div>

        {/* Family History & Genetics */}
        <div className="pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Family History & Genetics</h3>
          <p className="text-sm text-gray-600 mb-4">
            Family history can indicate genetic predisposition to certain conditions:
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="familyHeartDisease"
                checked={profile.familyHeartDisease}
                onChange={(e) => updateProfile({ familyHeartDisease: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="familyHeartDisease" className="ml-2 text-sm text-gray-700">
                Family history of heart disease (parent, sibling, or grandparent)
              </label>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> More family history questions will be added in future updates, 
                including diabetes, cancer, and other hereditary conditions.
              </p>
            </div>
          </div>
        </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-8">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Calculating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Calculate 6-Month Risk
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}