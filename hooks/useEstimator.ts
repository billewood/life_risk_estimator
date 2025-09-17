import { useCallback, useState } from 'react';
import { UserProfile, EstimationResult } from '@/lib/model/types';
import { estimate } from '@/lib/model/engine';
import { estimateWithRealData } from '@/lib/model/realEngine';
import { useResultStore } from '@/state/resultStore';

export interface UseEstimatorOptions {
  bootstrapSamples?: number;
  seed?: number;
  includeUncertainty?: boolean;
}

export function useEstimator() {
  const [isComputing, setIsComputing] = useState(false);
  const { setResult, setLoading, setError, clearResult } = useResultStore();

  const runEstimation = useCallback(async (
    profile: UserProfile,
    options: UseEstimatorOptions = {}
  ): Promise<EstimationResult | null> => {
    setIsComputing(true);
    setLoading(true);
    setError(null);

    try {
      const result = await estimateWithRealData(profile, {
        bootstrapSamples: options.bootstrapSamples || 200,
        seed: options.seed,
        includeUncertainty: options.includeUncertainty !== false,
      });

      setResult(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Estimation failed';
      setError(errorMessage);
      return null;
    } finally {
      setIsComputing(false);
      setLoading(false);
    }
  }, [setResult, setLoading, setError]);

  const clearEstimation = useCallback(() => {
    clearResult();
  }, [clearResult]);

  return {
    runEstimation,
    clearEstimation,
    isComputing,
  };
}

export function useDebouncedState<T>(
  initialValue: T,
  delay: number = 300
): [T, (value: T) => void, boolean] {
  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);
  const [isPending, setIsPending] = useState(false);

  const setDebounced = useCallback((newValue: T) => {
    setValue(newValue);
    setIsPending(true);

    const timeout = setTimeout(() => {
      setDebouncedValue(newValue);
      setIsPending(false);
    }, delay);

    return () => clearTimeout(timeout);
  }, [delay]);

  return [debouncedValue, setDebounced, isPending];
}
