'use client';

import React from 'react';
import { ShortTermRiskResult, ShortTermRiskLevel } from '@/lib/shortterm/types';

interface ShortTermRiskResultsProps {
  result: ShortTermRiskResult;
  onBack: () => void;
}

export function ShortTermRiskResults({ result, onBack }: ShortTermRiskResultsProps) {
  const getRiskLevelColor = (level: ShortTermRiskLevel) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'very_high': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatRisk = (risk: number) => {
    if (risk < 0.01) {
      return `${(risk * 1000).toFixed(1)} per 1,000 people`;
    } else {
      return `${(risk * 100).toFixed(1)}%`;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          6-Month Mortality Risk Assessment
        </h2>
        <p className="text-gray-600">
          Results based on proximal risk factors for short-term mortality
        </p>
      </div>

      {/* Risk Summary */}
      <div className={`border-2 rounded-lg p-6 ${getRiskLevelColor(result.riskLevel)}`}>
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">
            Risk Level: {result.riskLevel.replace('_', ' ').toUpperCase()}
          </h3>
          <p className="text-lg mb-4">
            6-Month Mortality Risk: <strong>{formatRisk(result.risk6Months)}</strong>
          </p>
          <p className="text-sm">
            Risk Score: {result.riskScore.toFixed(0)}/100
          </p>
        </div>
      </div>

      {/* Top Risk Factors */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Top Risk Factors Contributing to Your Risk
        </h3>
        <div className="space-y-3">
          {result.topRiskFactors.map((factor, index) => (
            <div key={factor.factor} className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">
                  {factor.factor.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {factor.description}
                </p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    +{((factor.impact) * 100).toFixed(0)}% risk increase
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mitigation Strategies */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recommended Actions to Reduce Risk
        </h3>
        <div className="space-y-4">
          {result.mitigationStrategies.map((strategy, index) => (
            <div key={index} className="border-l-4 border-blue-400 pl-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {strategy.factor.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {strategy.strategy}
                  </p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    strategy.impact === 'high' ? 'bg-red-100 text-red-800' :
                    strategy.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {strategy.impact} impact
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    strategy.urgency === 'immediate' ? 'bg-red-100 text-red-800' :
                    strategy.urgency === 'within_week' ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {strategy.urgency.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Resources */}
      {result.emergencyResources.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-4">
            Emergency Resources
          </h3>
          <div className="space-y-3">
            {result.emergencyResources.map((resource, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                    {resource.type === 'crisis_line' ? '📞' :
                     resource.type === 'emergency_room' ? '🚑' :
                     resource.type === 'urgent_care' ? '🏥' : '👩‍⚕️'}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-red-900">
                    {resource.description}
                  </h4>
                  <p className="text-sm text-red-700">
                    Contact: {resource.contact}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Important:</strong> {result.disclaimer}
        </p>
      </div>

      {/* Back Button */}
      <div className="flex justify-center">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium"
        >
          Back to Assessment
        </button>
      </div>
    </div>
  );
}