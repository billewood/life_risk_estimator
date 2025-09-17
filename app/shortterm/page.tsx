'use client';

import React, { useState } from 'react';
import { ShortTermRiskForm } from '@/components/shortterm/ShortTermRiskForm';
import { ShortTermRiskResults } from '@/components/shortterm/ShortTermRiskResults';
import { ShortTermRiskProfile, ShortTermRiskResult } from '@/lib/shortterm/types';
import { calculateShortTermRisk } from '@/lib/shortterm/engine';
import { useProfileStore } from '@/state/profileStore';

export default function ShortTermRiskPage() {
  const [result, setResult] = useState<ShortTermRiskResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { profile } = useProfileStore();

  const handleCalculate = async (shortTermProfile: ShortTermRiskProfile) => {
    setLoading(true);
    
    try {
      // Get age and sex from main profile
      const age = profile.age || 50; // Default fallback
      const sex = profile.sex === 'other' ? 'male' : (profile.sex || 'male'); // Map 'other' to 'male' for baseline
      
      // Calculate short-term risk
      const shortTermResult = calculateShortTermRisk(shortTermProfile, age, sex);
      
      setResult(shortTermResult);
    } catch (error) {
      console.error('Error calculating short-term risk:', error);
      // Handle error appropriately
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setResult(null);
  };

  if (result) {
    return <ShortTermRiskResults result={result} onBack={handleBack} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <ShortTermRiskForm onCalculate={handleCalculate} loading={loading} />
      </div>
    </div>
  );
}