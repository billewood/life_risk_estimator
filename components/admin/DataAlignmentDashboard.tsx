'use client';

import React, { useEffect, useState } from 'react';
import { ValidationResult, ValidationIssue } from '@/lib/validation/data-alignment-validator';
import { ChangeDetection } from '@/lib/data/data-versioning';
import { dataAlignmentValidator } from '@/lib/validation/data-alignment-validator';
import { dataVersioningSystem } from '@/lib/data/data-versioning';

export function DataAlignmentDashboard() {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [changeHistory, setChangeHistory] = useState<ChangeDetection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    runValidation();
    
    if (autoRefresh) {
      const interval = setInterval(runValidation, 5 * 60 * 1000); // Every 5 minutes
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const runValidation = async () => {
    setIsLoading(true);
    try {
      const result = await dataAlignmentValidator.validateAlignment();
      setValidationResult(result);
      setChangeHistory(dataVersioningSystem.getChangeHistory());
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  if (!validationResult) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Data Alignment Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Monitor data source alignment and calculation accuracy
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-600">Auto-refresh</span>
            </label>
            <button
              onClick={runValidation}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Validating...' : 'Run Validation'}
            </button>
          </div>
        </div>

        {/* Overall Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className={`text-3xl font-bold ${getScoreColor(validationResult.score)}`}>
                {validationResult.score}
              </div>
              <div className="ml-2 text-gray-600">
                <div className="text-sm">Alignment Score</div>
                <div className="text-xs">out of 100</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className={`text-3xl font-bold ${validationResult.isValid ? 'text-green-600' : 'text-red-600'}`}>
                {validationResult.isValid ? '✓' : '✗'}
              </div>
              <div className="ml-2 text-gray-600">
                <div className="text-sm">Status</div>
                <div className="text-xs">{validationResult.isValid ? 'Valid' : 'Issues Found'}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="text-3xl font-bold text-gray-900">
                {validationResult.issues.length}
              </div>
              <div className="ml-2 text-gray-600">
                <div className="text-sm">Total Issues</div>
                <div className="text-xs">across all sources</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="text-3xl font-bold text-gray-900">
                {changeHistory.length}
              </div>
              <div className="ml-2 text-gray-600">
                <div className="text-sm">Data Changes</div>
                <div className="text-xs">detected recently</div>
              </div>
            </div>
          </div>
        </div>

        {/* Issues by Severity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Issues by Severity</h3>
            <div className="space-y-3">
              {['critical', 'high', 'medium', 'low'].map(severity => {
                const count = validationResult.issues.filter(i => i.severity === severity).length;
                return (
                  <div key={severity} className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(severity)}`}>
                      {severity.charAt(0).toUpperCase() + severity.slice(1)}
                    </span>
                    <span className="text-lg font-semibold text-gray-900">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Issues by Category</h3>
            <div className="space-y-3">
              {['data-drift', 'calculation-error', 'parameter-mismatch', 'source-unavailable'].map(category => {
                const count = validationResult.issues.filter(i => i.category === category).length;
                return (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <span className="text-lg font-semibold text-gray-900">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Detailed Issues */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Issues</h3>
          <div className="space-y-4">
            {validationResult.issues.map((issue, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(issue.severity)}`}>
                      {issue.severity}
                    </span>
                    <span className="ml-2 text-sm text-gray-600">{issue.category}</span>
                  </div>
                  <span className="text-sm text-gray-500">{issue.affectedMetric}</span>
                </div>
                <p className="text-gray-900 mb-2">{issue.description}</p>
                {issue.expectedValue !== undefined && issue.actualValue !== undefined && (
                  <div className="text-sm text-gray-600 mb-2">
                    Expected: {issue.expectedValue.toFixed(6)}, Actual: {issue.actualValue.toFixed(6)}
                    {issue.tolerance && ` (Tolerance: ±${issue.tolerance.toFixed(6)})`}
                  </div>
                )}
                {issue.fix && (
                  <div className="text-sm text-blue-600">
                    <strong>Fix:</strong> {issue.fix}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        {validationResult.recommendations.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
            <div className="space-y-2">
              {validationResult.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span className="text-gray-700">{recommendation}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Changes */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Data Changes</h3>
          <div className="space-y-3">
            {changeHistory.slice(-10).reverse().map((change, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{change.source}</div>
                  <div className="text-sm text-gray-600">
                    {change.changes.length} changes detected
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(change.severity)}`}>
                    {change.severity}
                  </span>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(change.detectedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-center text-sm text-gray-500 mt-8">
          Last validation: {new Date(validationResult.lastChecked).toLocaleString()}
          <br />
          Next check: {new Date(validationResult.nextCheck).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
