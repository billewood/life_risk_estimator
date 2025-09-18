'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TransparencyModal } from '@/components/transparency/TransparencyModal';
import { transparencyDB } from '@/lib/data/transparency-database';

interface MortalityResult {
  lifeExpectancy: number;
  oneYearRisk: number;
  topCauses: Array<{
    cause: string;
    percentage: number;
  }>;
  age: number;
  sex: string;
}

export default function ResultsPage() {
  const [result, setResult] = useState<MortalityResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRiskFactors, setShowRiskFactors] = useState(false);
  const [transparencyModal, setTransparencyModal] = useState<{
    isOpen: boolean;
    title: string;
    metric: 'life-expectancy' | 'one-year-risk' | 'cause-breakdown';
  }>({
    isOpen: false,
    title: '',
    metric: 'life-expectancy'
  });
  const router = useRouter();

  useEffect(() => {
    const calculateRisk = async () => {
      try {
        // Get basic info from localStorage
        const age = localStorage.getItem('userAge');
        const sex = localStorage.getItem('userSex');
        
        if (!age || !sex) {
          router.push('/');
          return;
        }

        // Call the API to calculate mortality risk
        const response = await fetch('/api/calculate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            age: parseInt(age),
            sex: sex,
            // Add minimal risk factors for baseline calculation
            smoking: 'never',
            bloodPressure: 120,
            bmi: 25,
            diabetes: false,
            physicalActivity: 'moderate'
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to calculate risk');
        }

        const data = await response.json();
        
        // Transform the data to our simplified format
        const topCauses = Object.entries(data.causeSpecificRisks || {})
          .map(([cause, risk]: [string, any]) => ({
            cause: cause.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            percentage: (risk.adjustedRisk * 100)
          }))
          .sort((a, b) => b.percentage - a.percentage)
          .slice(0, 5);

        setResult({
          lifeExpectancy: data.lifeExpectancy || 0,
          oneYearRisk: (data.oneYearRisk * 100) || 0,
          topCauses,
          age: parseInt(age),
          sex: sex
        });
      } catch (err) {
        setError('Failed to calculate your risk assessment. Please try again.');
        console.error('Error calculating risk:', err);
      } finally {
        setLoading(false);
      }
    };

    calculateRisk();
  }, [router]);

  const openTransparencyModal = (metric: 'life-expectancy' | 'one-year-risk' | 'cause-breakdown', title: string) => {
    setTransparencyModal({
      isOpen: true,
      title,
      metric
    });
  };

  const closeTransparencyModal = () => {
    setTransparencyModal({
      isOpen: false,
      title: '',
      metric: 'life-expectancy'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Calculating your risk assessment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
            Your Risk Assessment
          </h1>
          <p className="text-lg text-gray-600">
            {result.age} year old {result.sex}
          </p>
        </div>

        {/* Three Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Life Expectancy */}
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow cursor-pointer relative">
            <button
              onClick={() => openTransparencyModal('life-expectancy', 'How We Calculate Life Expectancy')}
              className="absolute top-4 right-4 w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
              title="Learn how we calculate this"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {result.lifeExpectancy.toFixed(1)} years
            </h3>
            <p className="text-gray-600">Expected years left alive</p>
          </div>

          {/* 1-Year Risk */}
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow cursor-pointer relative">
            <button
              onClick={() => openTransparencyModal('one-year-risk', 'How We Calculate 1-Year Mortality Risk')}
              className="absolute top-4 right-4 w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
              title="Learn how we calculate this"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {result.oneYearRisk.toFixed(2)}%
            </h3>
            <p className="text-gray-600">Chance of dying within 1 year</p>
          </div>

          {/* Top Cause */}
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow cursor-pointer relative">
            <button
              onClick={() => openTransparencyModal('cause-breakdown', 'How We Calculate Cause of Death Breakdown')}
              className="absolute top-4 right-4 w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
              title="Learn how we calculate this"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <div className="bg-orange-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {result.topCauses[0]?.percentage.toFixed(1)}%
            </h3>
            <p className="text-gray-600">Most likely cause: {result.topCauses[0]?.cause}</p>
          </div>
        </div>

        {/* Top 5 Causes Breakdown */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Top 5 Most Likely Causes of Death
          </h2>
          <div className="space-y-4">
            {result.topCauses.map((cause, index) => (
              <div key={cause.cause} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="flex items-center">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">
                    {index + 1}
                  </div>
                  <span className="text-lg font-medium text-gray-900">{cause.cause}</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{cause.percentage.toFixed(1)}%</div>
                  <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min(cause.percentage * 2, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Risk Factors Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Want More Details?
            </h2>
            <p className="text-gray-600">
              Add your risk factors to get a personalized assessment
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Smoking */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 text-center hover:shadow-md transition-shadow cursor-pointer">
              <div className="bg-red-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Smoking</h3>
              <p className="text-sm text-gray-600">Add smoking status</p>
            </div>

            {/* Blood Pressure */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 text-center hover:shadow-md transition-shadow cursor-pointer">
              <div className="bg-orange-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Blood Pressure</h3>
              <p className="text-sm text-gray-600">Add BP readings</p>
            </div>

            {/* Weight */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center hover:shadow-md transition-shadow cursor-pointer">
              <div className="bg-green-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3-1m-3 1l-6-2" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Weight</h3>
              <p className="text-sm text-gray-600">Add BMI/weight</p>
            </div>

            {/* Activity */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center hover:shadow-md transition-shadow cursor-pointer">
              <div className="bg-blue-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Activity</h3>
              <p className="text-sm text-gray-600">Add exercise level</p>
            </div>
          </div>

          <div className="text-center mt-6">
            <button
              onClick={() => setShowRiskFactors(!showRiskFactors)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
            >
              {showRiskFactors ? 'Hide' : 'Add'} Risk Factors
            </button>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-gray-800 underline"
          >
            ← Start Over
          </button>
        </div>
      </div>

      {/* Transparency Modal */}
      <TransparencyModal
        isOpen={transparencyModal.isOpen}
        onClose={closeTransparencyModal}
        title={transparencyModal.title}
        {...transparencyDB.getMethodologyForMetric(transparencyModal.metric)}
      />
    </div>
  );
}