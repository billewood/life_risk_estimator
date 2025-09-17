'use client';

import React from 'react';
import { useProfileStore } from '@/state/profileStore';
import { useEstimator } from '@/hooks/useEstimator';
import { useRouter } from 'next/navigation';

export function SubmitBar() {
  const { getCompleteProfile, isComplete } = useProfileStore();
  const { runEstimation, isComputing } = useEstimator();
  const router = useRouter();

  const handleSubmit = async () => {
    const profile = getCompleteProfile();
    if (!profile) return;

    try {
      const result = await runEstimation(profile);
      if (result) {
        // Navigate to results page
        router.push('/results');
      }
    } catch (error) {
      console.error('Estimation failed:', error);
    }
  };

  return (
    <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">
            Ready to Get Your Estimates?
          </h3>
          <p className="text-sm text-neutral-600 mt-1">
            We'll calculate your personalized life expectancy and mortality risk based on your profile.
          </p>
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={!isComplete || isComputing}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
        >
          {isComputing ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Calculating...
            </div>
          ) : (
            'Get My Estimates'
          )}
        </button>
      </div>
      
      <div className="flex justify-start">
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 text-neutral-600 border border-neutral-300 rounded-md hover:bg-neutral-50"
        >
          Previous
        </button>
      </div>
      
      <div className="mt-4 text-xs text-neutral-500">
        <p>
          ⚠️ <strong>Important:</strong> These estimates are for educational purposes only and are not medical advice. 
          All calculations are performed on your device to protect your privacy.
        </p>
      </div>
    </div>
  );
}
