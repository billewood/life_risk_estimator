'use client';

import React from 'react';
import { InputWizard } from '@/components/forms/InputWizard';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-2 shadow-sm" style={{width: '100px', height: '100px'}}>
            <svg className="text-white w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-6">
            Life Risk Estimator
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
            Get personalized estimates of your life expectancy and mortality risk based on 
            population data and published risk factors. All calculations are performed 
            on your device to protect your privacy.
          </p>
        
          {/* Enhanced Disclaimer */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-8 mb-12 max-w-5xl mx-auto shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="bg-amber-100 rounded-full flex items-center justify-center" style={{width: '100px', height: '100px'}}>
                  <svg className="text-amber-600 w-12 h-12" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-6">
                <h2 className="text-xl font-bold text-amber-800 mb-4">
                  Important Disclaimers
                </h2>
                <div className="text-amber-700 space-y-3 leading-relaxed">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p><strong>Educational purposes only:</strong> This tool is not medical advice, a medical device, or a substitute for professional healthcare.</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p><strong>Not for medical decisions:</strong> Do not use these estimates to make decisions about your health, medications, or medical care.</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p><strong>Not for insurance or employment:</strong> This tool is not intended for use in insurance underwriting, employment screening, or credit decisions.</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p><strong>Consult healthcare providers:</strong> Always consult with qualified healthcare providers for personalized medical advice.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy & Safety Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center mb-6">
              <div className="bg-green-100 rounded-full flex items-center justify-center mr-2" style={{width: '100px', height: '100px'}}>
                <svg className="text-green-600 w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-green-800">
                Privacy Protection
              </h3>
            </div>
            <ul className="text-green-700 space-y-3 leading-relaxed">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                All calculations performed on your device
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                No personal data transmitted to servers
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                No account required
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                Data stays on your device
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                Optional analytics with differential privacy
              </li>
            </ul>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 rounded-full flex items-center justify-center mr-2" style={{width: '100px', height: '100px'}}>
                <svg className="text-blue-600 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-blue-800">
                What You'll Get
              </h3>
            </div>
            <ul className="text-blue-700 space-y-3 leading-relaxed">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                Life expectancy estimate with uncertainty ranges
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                1-year mortality risk probability
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                Cause-of-death distribution
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                Risk factor impact analysis
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                Evidence-based health recommendations
              </li>
            </ul>
          </div>
        </div>

        {/* Age Gate */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-12 shadow-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="bg-purple-100 rounded-full flex items-center justify-center" style={{width: '100px', height: '100px'}}>
                <svg className="text-purple-600 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Age Verification
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                This tool is designed for adults aged 18 and older. By proceeding, you confirm that you are 
                at least 18 years old and understand that this is an educational tool, not medical advice.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-start">
                  <div className="bg-red-100 rounded-full flex items-center justify-center mr-2" style={{width: '100px', height: '100px'}}>
                    <svg className="text-red-500 w-6 h-6" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-red-700 leading-relaxed">
                      <strong>Crisis Resources:</strong> If you are experiencing thoughts of self-harm, 
                      please contact the National Suicide Prevention Lifeline at <strong>988</strong> or 
                      <a href="https://suicidepreventionlifeline.org" className="underline ml-1 hover:text-red-800" target="_blank" rel="noopener noreferrer">
                        suicidepreventionlifeline.org
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assessment Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Annual/Lifetime Risk Assessment */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-2" style={{width: '100px', height: '100px'}}>
                <svg className="text-white w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Annual & Lifetime Risk Assessment
              </h3>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Comprehensive assessment of your life expectancy and mortality risk over the next year and lifetime.
            </p>
            <InputWizard />
          </div>
          
          {/* Short-Term Risk Assessment */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mr-2" style={{width: '100px', height: '100px'}}>
                <svg className="text-white w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Short-Term Risk Assessment
              </h3>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Focused assessment of proximal risk factors that may increase your risk of death in the next 6 months.
            </p>
            <div className="space-y-4 mb-6">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div className="text-sm text-gray-600">
                  <strong>Includes:</strong> Recent hospitalizations, falls, functional decline, social isolation, medication adherence, and more.
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div className="text-sm text-gray-600">
                  <strong>Focus:</strong> Immediate, actionable risk factors with specific mitigation strategies.
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div className="text-sm text-gray-600">
                  <strong>New:</strong> Transportation patterns, family history, and lifestyle factors.
                </div>
              </div>
            </div>
            <a 
              href="/shortterm" 
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 font-medium transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <svg className="mr-2 w-6 h-6" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Start 6-Month Risk Assessment
            </a>
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2" style={{width: '100px', height: '100px'}}>
              <svg className="text-blue-600 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              Evidence-Based
            </h3>
            <p className="text-sm text-neutral-600">
              Based on peer-reviewed research and population health data
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2" style={{width: '100px', height: '100px'}}>
              <svg className="text-green-600 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              Privacy-First
            </h3>
            <p className="text-sm text-neutral-600">
              All calculations happen on your device, no data shared
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2" style={{width: '100px', height: '100px'}}>
              <svg className="text-purple-600 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              Transparent
            </h3>
            <p className="text-sm text-neutral-600">
              Clear explanations of methods, data sources, and limitations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}