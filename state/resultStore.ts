import { create } from 'zustand';
import { EstimationResult } from '@/lib/model/types';

interface ResultState {
  result: EstimationResult | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  // Actions
  setResult: (result: EstimationResult) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearResult: () => void;
}

export const useResultStore = create<ResultState>((set) => ({
  result: null,
  isLoading: false,
  error: null,
  lastUpdated: null,

  setResult: (result) => {
    set({
      result,
      isLoading: false,
      error: null,
      lastUpdated: new Date(),
    });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({
      error,
      isLoading: false,
    });
  },

  clearResult: () => {
    set({
      result: null,
      isLoading: false,
      error: null,
      lastUpdated: null,
    });
  },
}));
