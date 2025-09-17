'use client';

import React from 'react';
import { useProfileStore } from '@/state/profileStore';
import { 
  SmokingStatus, 
  AlcoholConsumption, 
  BMIBand,
  SMOKING_LABELS, 
  ALCOHOL_LABELS 
} from '@/lib/model/types';

export function StepHabits() {
  const { profile, updateProfile, errors } = useProfileStore();

  const handleSmokingChange = (smoking: SmokingStatus) => {
    updateProfile({ smoking });
  };

  const handleAlcoholChange = (alcohol: AlcoholConsumption) => {
    updateProfile({ alcohol });
  };

  const handleActivityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const minutes = parseInt(e.target.value, 10);
    updateProfile({ activityMinutesPerWeek: isNaN(minutes) ? 0 : minutes });
  };

  const handleBMIBandChange = (bmiBand: BMIBand | undefined) => {
    updateProfile({ bmiBand });
  };

  const handleVaccinationChange = (vaccine: 'flu' | 'covid', checked: boolean) => {
    updateProfile({
      vaccinations: {
        flu: profile.vaccinations?.flu || false,
        covid: profile.vaccinations?.covid || false,
        [vaccine]: checked,
      },
    });
  };

  const getActivityDescription = (minutes: number) => {
    if (minutes === 0) return 'Sedentary (no physical activity)';
    if (minutes < 75) return 'Low activity';
    if (minutes < 150) return 'Moderate activity (recommended minimum)';
    return 'High activity (excellent)';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">
          Health Habits & Risk Factors
        </h2>
        <p className="text-neutral-600">
          These lifestyle factors significantly influence mortality risk. Be honest for the most accurate estimates.
        </p>
      </div>

      {/* Smoking Status */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Smoking Status *
        </label>
        <div className="space-y-2">
          {Object.entries(SMOKING_LABELS).map(([value, label]) => (
            <label key={value} className="flex items-center">
              <input
                type="radio"
                name="smoking"
                value={value}
                checked={profile.smoking === value}
                onChange={() => handleSmokingChange(value as SmokingStatus)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
              />
              <span className="ml-2 text-sm text-neutral-700">{label}</span>
            </label>
          ))}
        </div>
        <p className="mt-1 text-xs text-neutral-500">
          Smoking is one of the strongest modifiable risk factors for mortality
        </p>
      </div>

      {/* Alcohol Consumption */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Alcohol Consumption *
        </label>
        <div className="space-y-2">
          {Object.entries(ALCOHOL_LABELS).map(([value, label]) => (
            <label key={value} className="flex items-center">
              <input
                type="radio"
                name="alcohol"
                value={value}
                checked={profile.alcohol === value}
                onChange={() => handleAlcoholChange(value as AlcoholConsumption)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
              />
              <span className="ml-2 text-sm text-neutral-700">{label}</span>
            </label>
          ))}
        </div>
        <p className="mt-1 text-xs text-neutral-500">
          Heavy drinking increases risk; moderate drinking has minimal impact
        </p>
      </div>

      {/* Physical Activity */}
      <div>
        <label htmlFor="activity" className="block text-sm font-medium text-neutral-700 mb-2">
          Weekly Physical Activity (minutes) *
        </label>
        <input
          id="activity"
          type="number"
          min="0"
          max="1000"
          value={profile.activityMinutesPerWeek || 0}
          onChange={handleActivityChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            errors.activity ? 'border-red-500' : 'border-neutral-300'
          }`}
          placeholder="e.g., 150 (recommended minimum)"
        />
        {errors.activity && (
          <p className="mt-1 text-sm text-red-600">{errors.activity}</p>
        )}
        <p className="mt-1 text-sm text-neutral-600">
          {getActivityDescription(profile.activityMinutesPerWeek || 0)}
        </p>
        <p className="mt-1 text-xs text-neutral-500">
          150+ minutes per week is recommended for optimal health
        </p>
      </div>

      {/* BMI Band (Optional) */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          BMI Category (Optional)
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="bmi"
              checked={profile.bmiBand === undefined}
              onChange={() => handleBMIBandChange(undefined)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
            />
            <span className="ml-2 text-sm text-neutral-700">Prefer not to specify</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="bmi"
              checked={profile.bmiBand === 'underweight'}
              onChange={() => handleBMIBandChange('underweight')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
            />
            <span className="ml-2 text-sm text-neutral-700">Underweight (BMI &lt; 18.5)</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="bmi"
              checked={profile.bmiBand === 'normal'}
              onChange={() => handleBMIBandChange('normal')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
            />
            <span className="ml-2 text-sm text-neutral-700">Normal (BMI 18.5-24.9)</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="bmi"
              checked={profile.bmiBand === 'overweight'}
              onChange={() => handleBMIBandChange('overweight')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
            />
            <span className="ml-2 text-sm text-neutral-700">Overweight (BMI 25-29.9)</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="bmi"
              checked={profile.bmiBand === 'obese'}
              onChange={() => handleBMIBandChange('obese')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
            />
            <span className="ml-2 text-sm text-neutral-700">Obese (BMI ≥ 30)</span>
          </label>
        </div>
        <p className="mt-1 text-xs text-neutral-500">
          BMI provides modest additional risk information
        </p>
      </div>

      {/* Vaccinations */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Vaccinations
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={profile.vaccinations?.flu || false}
              onChange={(e) => handleVaccinationChange('flu', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
            />
            <span className="ml-2 text-sm text-neutral-700">Annual flu vaccination</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={profile.vaccinations?.covid || false}
              onChange={(e) => handleVaccinationChange('covid', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
            />
            <span className="ml-2 text-sm text-neutral-700">COVID-19 vaccination</span>
          </label>
        </div>
        <p className="mt-1 text-xs text-neutral-500">
          Vaccinations reduce infectious disease mortality risk
        </p>
      </div>

      {/* Medications/Conditions (Optional) */}
      <div>
        <label htmlFor="medications" className="block text-sm font-medium text-neutral-700 mb-2">
          Medications/Conditions (Optional)
        </label>
        <textarea
          id="medications"
          value={profile.medications || ''}
          onChange={(e) => updateProfile({ medications: e.target.value })}
          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          rows={3}
          placeholder="e.g., High blood pressure medication, diabetes, etc. (This information is stored locally only and not used in calculations)"
        />
        <p className="mt-1 text-xs text-neutral-500">
          This information is stored locally only and not used in risk calculations for this version
        </p>
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">
          Risk Factor Summary
        </h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• Smoking: {profile.smoking === 'current' ? 'High risk' : profile.smoking === 'former' ? 'Moderate risk' : 'Low risk'}</p>
          <p>• Activity: {getActivityDescription(profile.activityMinutesPerWeek || 0)}</p>
          <p>• Alcohol: {profile.alcohol === 'heavy' ? 'High risk' : 'Low risk'}</p>
          {profile.bmiBand && <p>• BMI: {profile.bmiBand}</p>}
        </div>
      </div>
    </div>
  );
}
