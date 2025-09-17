'use client';

import React, { useState } from 'react';
import { EstimationResult, CauseCategory, CAUSE_LABELS, UserProfile } from '@/lib/model/types';
import { formatProbability } from '@/lib/math/stats';

interface CauseMixChartProps {
  result: EstimationResult;
  profile?: UserProfile;
}

export function CauseMixChart({ result, profile }: CauseMixChartProps) {
  const [activeTab, setActiveTab] = useState<'1y' | 'lifetime'>('1y');
  
  const causeMix = activeTab === '1y' ? result.causeMix1y : result.causeMixLifetime;
  const title = activeTab === '1y' ? 'Next Year' : 'Lifetime';
  
  // Get top 5 causes
  const topCauses = Object.entries(causeMix)
    .map(([cause, fraction]) => ({ cause: cause as CauseCategory, fraction }))
    .sort((a, b) => b.fraction - a.fraction)
    .slice(0, 5);

  const colors = {
    cvd: '#ef4444',
    cancer: '#f59e0b',
    respiratory: '#10b981',
    injury: '#8b5cf6',
    metabolic: '#f97316',
    neuro: '#06b6d4',
    infectious: '#84cc16',
    other: '#6b7280',
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-neutral-900">
          Cause of Death Distribution
        </h2>
        <div className="text-sm text-neutral-500">
          {title} probability
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-neutral-100 p-1 rounded-lg mb-6">
        <button
          onClick={() => setActiveTab('1y')}
          className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
            activeTab === '1y'
              ? 'bg-white text-neutral-900 shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          1-Year Risk
        </button>
        <button
          onClick={() => setActiveTab('lifetime')}
          className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'lifetime'
              ? 'bg-white text-neutral-900 shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Lifetime Risk
        </button>
      </div>

      {/* Chart */}
      <div className="space-y-3 mb-6">
        {topCauses.map(({ cause, fraction }) => (
          <div key={cause} className="flex items-center">
            <div className="w-20 text-xs text-neutral-600 text-right pr-2">
              {CAUSE_LABELS[cause]}
            </div>
            <div className="flex-1 mx-2">
              <div className="bg-neutral-200 rounded-full h-6 relative overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${fraction * 100}%`,
                    backgroundColor: colors[cause],
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                  {fraction > 0.05 ? `${(fraction * 100).toFixed(1)}%` : ''}
                </div>
              </div>
            </div>
            <div className="w-16 text-xs text-neutral-600 text-right">
              {formatProbability(fraction)}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-md p-4 mb-4">
        <h4 className="text-sm font-medium text-neutral-800 mb-2">
          Top 5 Causes Summary
        </h4>
        <div className="text-sm text-neutral-700">
          <p>
            The top 5 causes account for{' '}
            <strong>
              {formatProbability(
                topCauses.reduce((sum, cause) => sum + cause.fraction, 0)
              )}
            </strong>{' '}
            of {title.toLowerCase()} mortality risk.
          </p>
          <p className="mt-1">
            <strong>Leading cause:</strong>{' '}
            {CAUSE_LABELS[topCauses[0]?.cause] || 'Unknown'} (
            {formatProbability(topCauses[0]?.fraction || 0)})
          </p>
        </div>
      </div>

      {/* Risk Factor Impact */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          How Your Risk Factors Affect Causes
        </h4>
        <div className="text-sm text-blue-700 space-y-1">
          {result.drivers.some(d => d.name === 'smoking' && d.impact === 'increase') && (
            <p>• <strong>Smoking:</strong> Increases respiratory disease and cancer risk</p>
          )}
          {result.drivers.some(d => d.name === 'activity' && d.impact === 'decrease') && (
            <p>• <strong>Physical activity:</strong> Reduces cardiovascular and metabolic disease risk</p>
          )}
          {result.drivers.some(d => d.name === 'alcohol' && d.impact === 'increase') && (
            <p>• <strong>Alcohol:</strong> Increases injury and liver disease risk</p>
          )}
          {result.drivers.some(d => d.name === 'bmi' && d.impact === 'increase') && (
            <p>• <strong>BMI:</strong> Affects cardiovascular, metabolic, and cancer risk</p>
          )}
          {profile?.vaccinations?.flu && (
            <p>• <strong>Flu vaccination:</strong> Reduces infectious disease risk</p>
          )}
          {profile?.vaccinations?.covid && (
            <p>• <strong>COVID vaccination:</strong> Reduces infectious disease risk</p>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-4 text-xs text-neutral-500">
        <p>
          <strong>Note:</strong> Cause distributions are estimated based on population 
          data and may not reflect individual risk patterns. Actual causes of death 
          vary significantly between individuals.
        </p>
      </div>
    </div>
  );
}
