'use client';

import React from 'react';
import { dataSourceTracker } from '@/lib/data/source-tracker';

interface DataSourceCitationProps {
  sources?: string[];
  assumptions?: string[];
}

export function DataSourceCitation({ sources = [], assumptions = [] }: DataSourceCitationProps) {
  const allSources = dataSourceTracker.getAllSources();
  const allAssumptions = dataSourceTracker.getAllAssumptions();
  
  const relevantSources = sources.length > 0 
    ? allSources.filter(source => sources.includes(source.id))
    : allSources;
  
  const relevantAssumptions = assumptions.length > 0
    ? allAssumptions.filter(assumption => assumptions.includes(assumption.id))
    : allAssumptions;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-blue-800 mb-3">
        Data Sources & Assumptions
      </h3>
      
      <div className="space-y-4">
        {/* Data Sources */}
        <div>
          <h4 className="text-xs font-medium text-blue-700 mb-2">Data Sources</h4>
          <div className="space-y-2">
            {relevantSources.map(source => (
              <div key={source.id} className="text-xs text-blue-600">
                <div className="font-medium">{source.name}</div>
                <div className="text-blue-500">
                  {source.url} • Updated: {source.lastUpdated} • Quality: {source.quality.accuracy}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Assumptions */}
        <div>
          <h4 className="text-xs font-medium text-blue-700 mb-2">Key Assumptions</h4>
          <div className="space-y-1">
            {relevantAssumptions.map(assumption => (
              <div key={assumption.id} className="text-xs text-blue-600">
                <div className="font-medium">{assumption.description}</div>
                <div className="text-blue-500">
                  Source: {assumption.source} • Impact: {assumption.impact}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Quality */}
        <div>
          <h4 className="text-xs font-medium text-blue-700 mb-2">Data Quality</h4>
          <div className="text-xs text-blue-600">
            <div>Overall Quality: {Math.round(dataSourceTracker.getDataQualityReport().overall)}%</div>
            <div>Last Updated: {new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
