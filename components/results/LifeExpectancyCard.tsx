'use client';

import React from 'react';
import { EstimationResult } from '@/lib/model/types';

interface LifeExpectancyCardProps {
  result: EstimationResult;
}

export function LifeExpectancyCard({ result }: LifeExpectancyCardProps) {
  const leMedian = Math.round(result.lifeExpectancyMedian * 10) / 10;
  const leCI = `${Math.round(result.lifeExpectancyCI80.lower * 10) / 10} - ${Math.round(result.lifeExpectancyCI80.upper * 10) / 10}`;
  const baselineLE = Math.round(result.baselineLifeExpectancy * 10) / 10;
  
  const leDifference = result.lifeExpectancyMedian - result.baselineLifeExpectancy;
  const leRelativeChange = result.baselineLifeExpectancy > 0 ? 
    (leDifference / result.baselineLifeExpectancy) * 100 : 0;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-neutral-900">
          Life Expectancy
        </h2>
        <div className="text-sm text-neutral-500">
          Years remaining
        </div>
      </div>

      {/* Main Life Expectancy Display */}
      <div className="text-center mb-6">
        <div className="text-4xl font-bold text-neutral-900 mb-2">
          {leMedian} years
        </div>
        <div className="text-sm text-neutral-600">
          80% confidence interval: {leCI} years
        </div>
        <div className="text-xs text-neutral-500 mt-1">
          Based on population survival curves and your risk factors
        </div>
      </div>

      {/* Comparison to Baseline */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          Comparison to Population Average
        </h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>
            <strong>Population average:</strong> {baselineLE} years remaining
          </p>
          <p>
            <strong>Your estimate:</strong> {leMedian} years remaining
          </p>
          <p>
            <strong>Difference:</strong> {
              leDifference > 0 ? '+' : ''
            }{Math.round(leDifference * 10) / 10} years 
            ({leRelativeChange > 0 ? '+' : ''}{Math.round(leRelativeChange)}%)
          </p>
        </div>
      </div>

      {/* Life Expectancy Interpretation */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-md p-4 mb-4">
        <h4 className="text-sm font-medium text-neutral-800 mb-2">
          What This Means
        </h4>
        <div className="text-sm text-neutral-700">
          {leDifference > 2 ? (
            <p>
              Your life expectancy is <strong>significantly higher</strong> than the 
              population average for your age and sex. Your risk factors appear to be 
              protective.
            </p>
          ) : leDifference > 0.5 ? (
            <p>
              Your life expectancy is <strong>higher</strong> than the population average 
              for your age and sex. Your risk factors are generally favorable.
            </p>
          ) : Math.abs(leDifference) <= 0.5 ? (
            <p>
              Your life expectancy is <strong>about average</strong> for your age and sex. 
              Your risk factors are close to population norms.
            </p>
          ) : leDifference > -2 ? (
            <p>
              Your life expectancy is <strong>lower</strong> than the population average 
              for your age and sex. Some risk factors may be contributing to increased risk.
            </p>
          ) : (
            <p>
              Your life expectancy is <strong>significantly lower</strong> than the 
              population average. Consider consulting with a healthcare provider about 
              modifiable risk factors.
            </p>
          )}
        </div>
      </div>

      {/* Uncertainty Explanation */}
      <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-amber-800 mb-2">
          Understanding Uncertainty
        </h4>
        <div className="text-sm text-amber-700">
          <p>
            The confidence interval shows the range of likely life expectancy estimates 
            based on uncertainty in the risk factor data. The true value is likely 
            within this range, but individual outcomes vary significantly.
          </p>
          <p className="mt-2">
            <strong>Key factors affecting uncertainty:</strong>
          </p>
          <ul className="mt-1 ml-4 list-disc space-y-1">
            <li>Variability in published risk factor studies</li>
            <li>Individual differences not captured by population data</li>
            <li>Changes in risk factors over time</li>
            <li>Medical advances and environmental changes</li>
          </ul>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-4 text-xs text-neutral-500">
        <p>
          <strong>Important:</strong> Life expectancy estimates are based on current 
          population data and risk factors. Individual outcomes vary significantly. 
          This is not a prediction of your actual lifespan.
        </p>
      </div>
    </div>
  );
}
