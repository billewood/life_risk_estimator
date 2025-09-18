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
          {activeTab === '1y' 
            ? 'Distribution of causes within the very low 1-year death risk' 
            : 'Distribution of causes within lifetime mortality risk'
          }
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

      {/* Simple List of Causes */}
      <div className="mb-6">
        <div className="space-y-3">
          {topCauses.map(({ cause, fraction }) => (
            <div key={cause} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
              <div className="flex items-center">
                <div 
                  className="w-4 h-4 rounded-full mr-3" 
                  style={{ backgroundColor: colors[cause] }}
                ></div>
                <span className="font-medium text-neutral-800">{CAUSE_LABELS[cause]}</span>
              </div>
              <span className="text-lg font-semibold text-neutral-900">
                {(fraction * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-md p-4 mb-4">
        <h4 className="text-sm font-medium text-neutral-800 mb-2">
          Top 5 Causes Summary
        </h4>
        <div className="text-sm text-neutral-700">
          <p className="mb-2">
            The top 5 causes account for{' '}
            <strong>
              {formatProbability(
                topCauses.reduce((sum, cause) => sum + cause.fraction, 0)
              )}
            </strong>{' '}
            of {title.toLowerCase()} mortality risk.
          </p>
          <div className="space-y-1">
            {topCauses.map(({ cause, fraction }, index) => (
              <p key={cause} className="flex justify-between">
                <span>
                  <strong>{index + 1}.</strong> {CAUSE_LABELS[cause]}
                </span>
                <span className="font-medium">
                  {formatProbability(fraction)}
                </span>
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Risk Factor Impact */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          How Your Risk Factors Affect Causes
        </h4>
        <div className="text-sm text-blue-700 space-y-1">
          {result.drivers && result.drivers.length > 0 ? (
            result.drivers.map((driver, index) => (
              <p key={index}>
                • <strong>{driver.name.charAt(0).toUpperCase() + driver.name.slice(1)}:</strong>{' '}
                {driver.impact === 'increase' ? 'Increases' : 'Decreases'} risk
                {driver.deltaQ1y !== 0 && ` (${Math.abs(driver.deltaQ1y * 100).toFixed(1)}% change)`}
              </p>
            ))
          ) : (
            <p>• No significant risk factor impacts detected</p>
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
