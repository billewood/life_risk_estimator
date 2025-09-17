'use client';

import React, { useState } from 'react';
import { useProfileStore } from '@/state/profileStore';
import { StepAgeSex } from './StepAgeSex';
import { StepZip } from './StepZip';
import { StepHabits } from './StepHabits';
import { SubmitBar } from './SubmitBar';

export function InputWizard() {
  const { currentStep, profile, validateCurrentProfile, isProfileComplete, isCurrentStepValid } = useProfileStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    {
      title: 'Basic Information',
      description: 'Age and sex',
      component: StepAgeSex,
    },
    {
      title: 'Location',
      description: 'ZIP code for regional risk',
      component: StepZip,
    },
    {
      title: 'Health Habits',
      description: 'Lifestyle factors and vaccinations',
      component: StepHabits,
    },
  ];

  const CurrentStepComponent = steps[currentStep]?.component || StepAgeSex;

  const handleNext = () => {
    if (validateCurrentProfile() && currentStep < steps.length - 1) {
      useProfileStore.getState().setStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      useProfileStore.getState().setStep(currentStep - 1);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center ${
                index <= currentStep ? 'text-primary-600' : 'text-neutral-400'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index < currentStep
                    ? 'bg-primary-600 text-white'
                    : index === currentStep
                    ? 'bg-primary-100 text-primary-600 border-2 border-primary-600'
                    : 'bg-neutral-200 text-neutral-400'
                }`}
              >
                {index < currentStep ? '✓' : index + 1}
              </div>
              <div className="ml-2">
                <div className="text-sm font-medium">{step.title}</div>
                <div className="text-xs text-neutral-500">{step.description}</div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 ${
                    index < currentStep ? 'bg-primary-600' : 'bg-neutral-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current step content */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <CurrentStepComponent />
      </div>

      {/* Navigation */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="px-4 py-2 text-neutral-600 border border-neutral-300 rounded-md hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        {currentStep < steps.length - 1 && (
          <button
            onClick={handleNext}
            disabled={!isCurrentStepValid()}
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        )}
      </div>

      {/* Submit bar for final step */}
      {currentStep === steps.length - 1 && (
        <div className="mt-4">
          <SubmitBar />
        </div>
      )}
    </div>
  );
}
