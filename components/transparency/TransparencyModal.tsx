'use client';

import React from 'react';
import { DataSource, CalculationMethod, DataManipulation } from '@/lib/data/transparency-database';

interface TransparencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  dataSources: DataSource[];
  calculationMethods: CalculationMethod[];
  dataManipulations: DataManipulation[];
}

export function TransparencyModal({
  isOpen,
  onClose,
  title,
  dataSources,
  calculationMethods,
  dataManipulations
}: TransparencyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Data Sources */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Data Sources
            </h3>
            <div className="space-y-4">
              {dataSources.map((source) => (
                <div key={source.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{source.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      source.quality === 'high' ? 'bg-green-100 text-green-800' :
                      source.quality === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {source.quality} quality
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{source.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">URL:</span>
                      <a 
                        href={source.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 ml-1 break-all"
                      >
                        {source.url}
                      </a>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Last Updated:</span>
                      <span className="ml-1 text-gray-600">{source.lastUpdated}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Update Frequency:</span>
                      <span className="ml-1 text-gray-600">{source.updateFrequency}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Coverage:</span>
                      <span className="ml-1 text-gray-600">{source.coverage}</span>
                    </div>
                  </div>
                  {source.notes && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Notes:</strong> {source.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Calculation Methods */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Calculation Methods
            </h3>
            <div className="space-y-4">
              {calculationMethods.map((method) => (
                <div key={method.id} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">{method.name}</h4>
                  <p className="text-gray-600 mb-3">{method.description}</p>
                  
                  <div className="mb-4">
                    <span className="font-medium text-gray-700">Formula:</span>
                    <code className="ml-2 bg-gray-200 px-2 py-1 rounded text-sm font-mono">
                      {method.formula}
                    </code>
                  </div>

                  <div className="mb-4">
                    <h5 className="font-medium text-gray-700 mb-2">Parameters:</h5>
                    <div className="space-y-2">
                      {method.parameters.map((param, index) => (
                        <div key={index} className="bg-white rounded p-3">
                          <div className="font-medium text-gray-800">{param.name}</div>
                          <div className="text-sm text-gray-600 mb-1">
                            <strong>Value:</strong> {param.value}
                          </div>
                          <div className="text-sm text-gray-600 mb-1">
                            <strong>Source:</strong> {param.source}
                          </div>
                          <div className="text-sm text-gray-600">
                            <strong>Justification:</strong> {param.justification}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Assumptions:</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {method.assumptions.map((assumption, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {assumption}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Limitations:</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {method.limitations.map((limitation, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {limitation}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Validation:</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {method.validation.map((validation, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {validation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Data Manipulations */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Data Processing Steps
            </h3>
            <div className="space-y-4">
              {dataManipulations.map((manipulation, index) => (
                <div key={manipulation.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                      {index + 1}
                    </div>
                    <h4 className="font-semibold text-gray-900">{manipulation.step}</h4>
                  </div>
                  <p className="text-gray-600 mb-3">{manipulation.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Input Data:</span>
                      <p className="text-gray-600 mt-1">{manipulation.inputData}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Output Data:</span>
                      <p className="text-gray-600 mt-1">{manipulation.outputData}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Method:</span>
                      <p className="text-gray-600 mt-1">{manipulation.method}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Code Reference:</span>
                      <p className="text-gray-600 mt-1 font-mono">{manipulation.codeReference}</p>
                    </div>
                  </div>
                  {manipulation.assumptions.length > 0 && (
                    <div className="mt-3">
                      <h5 className="font-medium text-gray-700 mb-2">Assumptions:</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {manipulation.assumptions.map((assumption, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {assumption}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
