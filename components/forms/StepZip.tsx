'use client';

import React from 'react';
import { useProfileStore } from '@/state/profileStore';

export function StepZip() {
  const { profile, updateProfile, errors } = useProfileStore();

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    const zip3 = value.substring(0, 3); // Take first 3 digits
    updateProfile({ zip3 });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">
          Location
        </h2>
        <p className="text-neutral-600">
          We use your ZIP code to approximate regional mortality patterns. This helps account for environmental and socioeconomic factors that vary by location.
        </p>
      </div>

      {/* ZIP Code Input */}
      <div>
        <label htmlFor="zip3" className="block text-sm font-medium text-neutral-700 mb-2">
          ZIP Code (first 3 digits) *
        </label>
        <input
          id="zip3"
          type="text"
          maxLength={3}
          value={profile.zip3 || ''}
          onChange={handleZipChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            errors.zip3 ? 'border-red-500' : 'border-neutral-300'
          }`}
          placeholder="e.g., 902 (for Beverly Hills) or 100 (for New York)"
        />
        {errors.zip3 && (
          <p className="mt-1 text-sm text-red-600">{errors.zip3}</p>
        )}
        <p className="mt-1 text-xs text-neutral-500">
          We only use the first 3 digits to protect privacy and get regional averages
        </p>
      </div>

      {/* Regional Risk Note */}
      {profile.zip3 && profile.zip3.length === 3 && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-amber-800 mb-2">
            Regional Risk Adjustment
          </h3>
          <p className="text-sm text-amber-700">
            ZIP code {profile.zip3} will be used to apply a small regional adjustment 
            (±10-20%) to account for local environmental and socioeconomic factors 
            that affect population mortality rates.
          </p>
          <p className="text-xs text-amber-600 mt-2">
            This is a modest adjustment based on county-level mortality data.
          </p>
        </div>
      )}

      {/* Privacy Note */}
      <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <h3 className="text-sm font-medium text-green-800 mb-2">
          Privacy Protection
        </h3>
        <p className="text-sm text-green-700">
          We only store the first 3 digits of your ZIP code and use it solely 
          to approximate regional population risk patterns. Your exact location 
          is never stored or transmitted.
        </p>
      </div>
    </div>
  );
}
