'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useResultStore } from '@/state/resultStore';
import { useProfileStore } from '@/state/profileStore';
import { RiskSummaryCard } from '@/components/results/RiskSummaryCard';
import { LifeExpectancyCard } from '@/components/results/LifeExpectancyCard';
import { CauseMixChart } from '@/components/results/CauseMixChart';
import { DriversWaterfall } from '@/components/results/DriversWaterfall';
import { DataSourceCitation } from '@/components/results/DataSourceCitation';

export default function ResultsPage() {
  const { result, isLoading, error } = useResultStore();
  const { getCompleteProfile } = useProfileStore();
  const router = useRouter();
  const profile = getCompleteProfile();

  useEffect(() => {
    // Check if we have a result, if not redirect to home
    if (!result && !isLoading && !error) {
      router.push('/');
    }
  }, [result, isLoading, error, router]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">
            Calculating Your Estimates
          </h2>
          <p className="text-neutral-600">
            This may take a few moments while we process your risk factors...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Calculation Error
          </h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">
            No Results Available
          </h2>
          <p className="text-yellow-700 mb-4">
            Please complete the input form to get your estimates.
          </p>
          <button
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            Get Started
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          Your Mortality Risk Estimates
        </h1>
        <p className="text-neutral-600">
          Educational estimates based on population data and your risk factors
        </p>
        <div className="mt-4 text-sm text-neutral-500">
          Calculated in {result.computationTime}ms • Model v{result.modelVersion} • Data v{result.dataVersion}
        </div>
      </div>

      {/* Main Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <RiskSummaryCard result={result} />
        <LifeExpectancyCard result={result} />
      </div>

      {/* Secondary Results */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <CauseMixChart result={result} profile={profile || undefined} />
        <DriversWaterfall result={result} />
      </div>

      {/* Recommendations */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">
          Evidence-Based Recommendations
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lifestyle Recommendations */}
          <div>
            <h3 className="font-semibold text-neutral-800 mb-3">Lifestyle Changes</h3>
            <div className="space-y-3">
              {result.drivers.some(d => d.name === 'smoking' && d.impact === 'increase') && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <h4 className="font-medium text-red-800 mb-1">Quit Smoking</h4>
                  <p className="text-sm text-red-700">
                    Smoking is one of the strongest modifiable risk factors. 
                    Quitting can significantly reduce mortality risk.
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    Resources: <a href="https://smokefree.gov" target="_blank" rel="noopener noreferrer" className="underline">
                      smokefree.gov
                    </a>
                  </p>
                </div>
              )}
              
              {result.drivers.some(d => d.name === 'activity' && d.impact === 'increase') && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <h4 className="font-medium text-green-800 mb-1">Increase Physical Activity</h4>
                  <p className="text-sm text-green-700">
                    Aim for at least 150 minutes of moderate-intensity activity per week 
                    to reduce cardiovascular and metabolic disease risk.
                  </p>
                </div>
              )}
              
              {result.drivers.some(d => d.name === 'alcohol' && d.impact === 'increase') && (
                <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
                  <h4 className="font-medium text-orange-800 mb-1">Reduce Alcohol Consumption</h4>
                  <p className="text-sm text-orange-700">
                    Heavy alcohol consumption increases mortality risk. Consider reducing 
                    or eliminating alcohol intake.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Prevention Recommendations */}
          <div>
            <h3 className="font-semibold text-neutral-800 mb-3">Prevention & Screening</h3>
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <h4 className="font-medium text-blue-800 mb-1">Regular Health Checkups</h4>
                <p className="text-sm text-blue-700">
                  Schedule regular preventive care visits with your healthcare provider 
                  for age-appropriate screenings and risk factor management.
                </p>
              </div>
              
              {!profile?.vaccinations?.flu && (
                <div className="bg-purple-50 border border-purple-200 rounded-md p-3">
                  <h4 className="font-medium text-purple-800 mb-1">Annual Flu Vaccination</h4>
                  <p className="text-sm text-purple-700">
                    Get vaccinated annually to reduce infectious disease mortality risk.
                  </p>
                </div>
              )}
              
              {!profile?.vaccinations?.covid && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-md p-3">
                  <h4 className="font-medium text-indigo-800 mb-1">COVID-19 Vaccination</h4>
                  <p className="text-sm text-indigo-700">
                    Stay up to date with COVID-19 vaccinations to reduce infectious disease risk.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Data Sources & Assumptions */}
      <div className="mb-8">
        <DataSourceCitation 
          sources={['ssa-life-tables', 'cdc-wonder']}
          assumptions={['gompertz-makeham', 'parameter-estimation']}
        />
      </div>

      {/* Important Disclaimers */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-red-800 mb-3">
          ⚠️ Important Disclaimers
        </h2>
        <div className="text-sm text-red-700 space-y-2">
          <p>
            <strong>Not Medical Advice:</strong> These estimates are for educational purposes only 
            and are not medical advice, diagnosis, or treatment recommendations.
          </p>
          <p>
            <strong>Not for Medical Decisions:</strong> Do not use these estimates to make decisions 
            about your health, medications, or medical care without consulting healthcare providers.
          </p>
          <p>
            <strong>Not for Insurance/Employment:</strong> This tool is not intended for use in 
            insurance underwriting, employment screening, or credit decisions.
          </p>
          <p>
            <strong>Individual Variation:</strong> Individual risk varies significantly from 
            population averages. These estimates cannot predict your actual lifespan or health outcomes.
          </p>
          <p>
            <strong>Consult Healthcare Providers:</strong> Always consult with qualified healthcare 
            providers for personalized medical advice and risk factor management.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => router.push('/')}
          className="btn-secondary"
        >
          Start New Estimate
        </button>
        <button
          onClick={() => window.print()}
          className="btn-secondary"
        >
          Print Results
        </button>
      </div>
    </div>
  );
}
