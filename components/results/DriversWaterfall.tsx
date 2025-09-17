'use client';

import React from 'react';
import { EstimationResult, RiskDriver } from '@/lib/model/types';
import { formatProbability } from '@/lib/math/stats';

interface DriversWaterfallProps {
  result: EstimationResult;
}

export function DriversWaterfall({ result }: DriversWaterfallProps) {
  const baselineRisk = result.baselineRisk1y;
  const finalRisk = result.risk1y;
  
  // Calculate cumulative risk as we add each driver
  let cumulativeRisk = baselineRisk;
  const waterfallData = [
    {
      name: 'Baseline (age, sex)',
      risk: baselineRisk,
      delta: 0,
      impact: 'neutral' as const,
      description: `Population average for your age and sex`,
    },
    ...result.drivers.map(driver => {
      const newRisk = cumulativeRisk + driver.deltaQ1y;
      const delta = driver.deltaQ1y;
      cumulativeRisk = newRisk;
      
      return {
        name: driver.name,
        risk: newRisk,
        delta: delta,
        impact: driver.impact,
        description: driver.description,
      };
    }),
  ];

  const maxRisk = Math.max(...waterfallData.map(d => d.risk));
  const minRisk = Math.min(...waterfallData.map(d => d.risk));
  const riskRange = maxRisk - minRisk;

  const getImpactColor = (impact: 'increase' | 'decrease' | 'neutral') => {
    switch (impact) {
      case 'increase':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'decrease':
        return 'bg-green-100 border-green-300 text-green-800';
      default:
        return 'bg-neutral-100 border-neutral-300 text-neutral-800';
    }
  };

  const getImpactIcon = (impact: 'increase' | 'decrease' | 'neutral') => {
    switch (impact) {
      case 'increase':
        return '↗️';
      case 'decrease':
        return '↘️';
      default:
        return '➡️';
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-neutral-900">
          Risk Factor Impact
        </h2>
        <div className="text-sm text-neutral-500">
          How each factor affects your risk
        </div>
      </div>

      {/* Waterfall Chart */}
      <div className="space-y-4 mb-6">
        {waterfallData.map((item, index) => {
          const isLast = index === waterfallData.length - 1;
          const riskPercentage = (item.risk / maxRisk) * 100;
          const barWidth = Math.max(10, riskPercentage);
          
          return (
            <div key={index} className="flex items-center">
              <div className="w-32 text-sm text-neutral-700 text-right pr-4">
                {item.name}
              </div>
              
              <div className="flex-1 relative">
                <div className="h-8 bg-neutral-200 rounded-md relative overflow-hidden">
                  <div
                    className={`h-full rounded-md transition-all duration-500 ${
                      isLast 
                        ? 'bg-primary-500' 
                        : item.impact === 'increase'
                        ? 'bg-red-400'
                        : item.impact === 'decrease'
                        ? 'bg-green-400'
                        : 'bg-neutral-400'
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                    {formatProbability(item.risk)}
                  </div>
                </div>
              </div>
              
              <div className="w-24 text-sm text-right pl-4">
                {item.delta !== 0 && (
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    item.delta > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {item.delta > 0 ? '+' : ''}{formatProbability(item.delta)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Risk Factor Details */}
      <div className="space-y-3 mb-6">
        {result.drivers.map((driver, index) => (
          <div
            key={index}
            className={`border rounded-md p-3 ${getImpactColor(driver.impact)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-lg mr-2">{getImpactIcon(driver.impact)}</span>
                <span className="font-medium capitalize">{driver.name}</span>
              </div>
              <div className="text-sm">
                {driver.deltaQ1y > 0 ? '+' : ''}{formatProbability(driver.deltaQ1y)}
              </div>
            </div>
            <p className="text-sm mt-1 opacity-90">{driver.description}</p>
            <div className="flex items-center mt-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                driver.confidence === 'high' 
                  ? 'bg-blue-100 text-blue-800'
                  : driver.confidence === 'medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {driver.confidence} confidence
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-neutral-800 mb-2">
          Summary
        </h4>
        <div className="text-sm text-neutral-700 space-y-1">
          <p>
            <strong>Baseline risk:</strong> {formatProbability(baselineRisk)} 
            (population average)
          </p>
          <p>
            <strong>Your adjusted risk:</strong> {formatProbability(finalRisk)} 
            (with your risk factors)
          </p>
          <p>
            <strong>Total impact:</strong> {
              finalRisk > baselineRisk ? '+' : ''
            }{formatProbability(finalRisk - baselineRisk)} 
            ({finalRisk > baselineRisk ? 'increased' : 'decreased'} risk)
          </p>
        </div>
      </div>

      {/* Actionable Insights */}
      {result.drivers.some(d => d.impact === 'increase') && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mt-4">
          <h4 className="text-sm font-medium text-amber-800 mb-2">
            💡 Actionable Insights
          </h4>
          <div className="text-sm text-amber-700 space-y-1">
            {result.drivers
              .filter(d => d.impact === 'increase')
              .map((driver, index) => (
                <p key={index}>
                  • Consider addressing <strong>{driver.name}</strong> to reduce risk
                </p>
              ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-4 text-xs text-neutral-500">
        <p>
          <strong>Note:</strong> Risk factor impacts are estimated based on population 
          studies. Individual responses to risk factor changes may vary significantly.
        </p>
      </div>
    </div>
  );
}
