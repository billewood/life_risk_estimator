'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!age || !sex) return;
    
    setIsSubmitting(true);
    
    // Store basic info in localStorage for the results page
    localStorage.setItem('userAge', age);
    localStorage.setItem('userSex', sex);
    
    // Navigate to results page
    router.push('/results');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-6">
            what's likely to kill me (and what to do about it)
          </h1>
          <p className="text-lg text-gray-600">
            Get your personalized mortality risk assessment
          </p>
        </div>

        {/* Simple Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                Age
              </label>
              <input
                type="number"
                id="age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min="18"
                max="120"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your age"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sex
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="sex"
                    value="male"
                    checked={sex === 'male'}
                    onChange={(e) => setSex(e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-gray-700">Male</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="sex"
                    value="female"
                    checked={sex === 'female'}
                    onChange={(e) => setSex(e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-gray-700">Female</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={!age || !sex || isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSubmitting ? 'Calculating...' : 'Get My Risk Assessment'}
            </button>
          </form>
        </div>

        {/* Simple Disclaimer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            This tool is for educational purposes only and not medical advice.
          </p>
        </div>
      </div>
    </div>
  );
}