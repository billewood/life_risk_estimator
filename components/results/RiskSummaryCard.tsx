'use client';

import React from 'react';
import { EstimationResult } from '@/lib/model/types';
import { formatProbability } from '@/lib/math/stats';

interface RiskSummaryCardProps {
  result: EstimationResult;
}

export function RiskSummaryCard({ result }: RiskSummaryCardProps) {
  const riskPercentage = formatProbability(result.risk1y);
  const riskCI = `${formatProbability(result.risk1yCI80.lower)} - ${formatProbability(result.risk1yCI80.upper)}`;
  
  // Create icon array visualization (simplified)
  const totalDots = 100;
  const riskDots = Math.round(result.risk1y * totalDots);
  const safeDots = totalDots - riskDots;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-neutral-900">
          1-Year Mortality Risk
        </h2>
        <div className="text-sm text-neutral-500">
          Model v{result.modelVersion}
        </div>
      </div>

      {/* Main Risk Display */}
      <div className="text-center mb-6">
        <div className="text-4xl font-bold text-neutral-900 mb-2">
          {riskPercentage}
        </div>
        <div className="text-sm text-neutral-600">
          80% confidence interval: {riskCI}
        </div>
        <div className="text-xs text-neutral-500 mt-1">
          Based on population data and your risk factors
        </div>
      </div>

      {/* Icon Array Visualization */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-neutral-700 mb-3">
          Visual Risk Representation (100 people like you)
        </h3>
        <div className="grid grid-cols-10 gap-1 mb-3">
          {Array.from({ length: totalDots }, (_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-sm ${
                i < riskDots 
                  ? 'bg-red-500' 
                  : 'bg-green-500'
              }`}
              title={
                i < riskDots 
                  ? 'Would die within 1 year' 
                  : 'Would survive beyond 1 year'
              }
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-neutral-600">
          <span className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-sm mr-1"></div>
            {riskDots} deaths
          </span>
          <span className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-sm mr-1"></div>
            {safeDots} survivors
          </span>
        </div>
      </div>

      {/* Risk Context */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          Risk Context
        </h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>
            <strong>Baseline risk:</strong> {formatProbability(result.baselineRisk1y)} 
            (population average for your age/sex)
          </p>
          <p>
            <strong>Your risk:</strong> {riskPercentage} 
            (adjusted for your risk factors)
          </p>
          <p>
            <strong>Risk difference:</strong> {
              result.risk1y > result.baselineRisk1y ? '+' : ''
            }{formatProbability(result.risk1y - result.baselineRisk1y)}
          </p>
        </div>
      </div>

      {/* Risk Interpretation */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-neutral-800 mb-2">
          What This Means
        </h4>
        <div className="text-sm text-neutral-700">
          {result.risk1y < 0.01 ? (
            <p>
              You have a <strong>low</strong> 1-year mortality risk. 
              Most people with your profile would survive beyond the next year.
            </p>
          ) : result.risk1y < 0.05 ? (
            <p>
              You have a <strong>moderate</strong> 1-year mortality risk. 
              This is higher than average but still relatively low.
            </p>
          ) : (
            <p>
              You have an <strong>elevated</strong> 1-year mortality risk. 
              Consider consulting with a healthcare provider about your risk factors.
            </p>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-4 text-xs text-neutral-500">
        <p>
          <strong>Remember:</strong> This is an educational estimate based on population data. 
          Individual risk varies significantly. Consult healthcare providers for medical advice.
        </p>
      </div>
    </div>
  );
}
