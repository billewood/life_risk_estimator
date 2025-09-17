'use client';

import React from 'react';
import { useProfileStore } from '@/state/profileStore';
import { Sex, SEX_LABELS } from '@/lib/model/types';

export function StepAgeSex() {
  const { profile, updateProfile, errors } = useProfileStore();

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const age = parseInt(e.target.value, 10);
    updateProfile({ age: isNaN(age) ? undefined : age });
  };

  const handleSexChange = (sex: Sex) => {
    updateProfile({ sex });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">
          Basic Information
        </h2>
        <p className="text-neutral-600">
          We need your age and sex to get baseline mortality estimates from population life tables.
        </p>
      </div>

      {/* Age Input */}
      <div>
        <label htmlFor="age" className="block text-sm font-medium text-neutral-700 mb-2">
          Age *
        </label>
        <input
          id="age"
          type="number"
          min="18"
          max="110"
          value={profile.age || ''}
          onChange={handleAgeChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            errors.age ? 'border-red-500' : 'border-neutral-300'
          }`}
          placeholder="Enter your age"
        />
        {errors.age && (
          <p className="mt-1 text-sm text-red-600">{errors.age}</p>
        )}
        <p className="mt-1 text-xs text-neutral-500">
          Must be between 18 and 110 years
        </p>
      </div>

      {/* Sex Selection */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Sex *
        </label>
        <div className="space-y-2">
          {Object.entries(SEX_LABELS).map(([value, label]) => (
            <label key={value} className="flex items-center">
              <input
                type="radio"
                name="sex"
                value={value}
                checked={profile.sex === value}
                onChange={() => handleSexChange(value as Sex)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
              />
              <span className="ml-2 text-sm text-neutral-700">{label}</span>
            </label>
          ))}
        </div>
        {errors.sex && (
          <p className="mt-1 text-sm text-red-600">{errors.sex}</p>
        )}
        <p className="mt-1 text-xs text-neutral-500">
          We use population life tables that are sex-specific. For non-binary users, we'll use the closest available data with a disclaimer.
        </p>
      </div>

      {/* Baseline Preview */}
      {profile.age && profile.sex && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            Baseline Estimate Preview
          </h3>
          <p className="text-sm text-blue-700">
            Based on population averages for {profile.sex} at age {profile.age}, 
            the baseline 1-year mortality risk is approximately 0.3-0.8% 
            and life expectancy is around 40-65 years remaining.
          </p>
          <p className="text-xs text-blue-600 mt-2">
            Your personal risk factors will adjust these estimates.
          </p>
        </div>
      )}
    </div>
  );
}
