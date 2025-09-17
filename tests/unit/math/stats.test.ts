import {
  clamp,
  quantile,
  confidenceInterval80,
  median,
  mean,
  standardDeviation,
  sampleLogNormal,
  sampleLogNormalFromCentral,
} from '@/lib/math/stats';

describe('Statistical Functions', () => {
  describe('clamp', () => {
    it('should clamp values to range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-1, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it('should handle edge cases', () => {
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(10, 0, 10)).toBe(10);
    });
  });

  describe('quantile', () => {
    it('should calculate quantiles correctly', () => {
      const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      
      expect(quantile(values, 0.5)).toBe(5.5); // median
      expect(quantile(values, 0.25)).toBe(3.25); // first quartile
      expect(quantile(values, 0.75)).toBe(7.75); // third quartile
    });

    it('should handle edge cases', () => {
      const values = [1, 2, 3];
      
      expect(quantile(values, 0)).toBe(1);
      expect(quantile(values, 1)).toBe(3);
    });

    it('should handle single value', () => {
      expect(quantile([5], 0.5)).toBe(5);
    });
  });

  describe('confidenceInterval80', () => {
    it('should calculate 80% confidence interval', () => {
      const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const ci = confidenceInterval80(values);
      
      expect(ci.lower).toBe(2.9); // 10th percentile
      expect(ci.upper).toBe(9.1); // 90th percentile
    });

    it('should handle edge cases', () => {
      const values = [1, 2, 3];
      const ci = confidenceInterval80(values);
      
      expect(ci.lower).toBeLessThanOrEqual(ci.upper);
    });
  });

  describe('median', () => {
    it('should calculate median correctly', () => {
      expect(median([1, 2, 3, 4, 5])).toBe(3);
      expect(median([1, 2, 3, 4, 5, 6])).toBe(3.5);
    });

    it('should handle single value', () => {
      expect(median([5])).toBe(5);
    });

    it('should handle empty array', () => {
      expect(median([])).toBe(0);
    });
  });

  describe('mean', () => {
    it('should calculate mean correctly', () => {
      expect(mean([1, 2, 3, 4, 5])).toBe(3);
      expect(mean([2, 4, 6])).toBe(4);
    });

    it('should handle empty array', () => {
      expect(mean([])).toBe(0);
    });
  });

  describe('standardDeviation', () => {
    it('should calculate standard deviation correctly', () => {
      const values = [1, 2, 3, 4, 5];
      const std = standardDeviation(values);
      
      expect(std).toBeGreaterThan(0);
      expect(std).toBeCloseTo(Math.sqrt(2), 1);
    });

    it('should handle single value', () => {
      expect(standardDeviation([5])).toBe(0);
    });

    it('should handle empty array', () => {
      expect(standardDeviation([])).toBe(0);
    });
  });

  describe('sampleLogNormal', () => {
    it('should generate log-normal samples', () => {
      const samples = Array.from({ length: 1000 }, () => 
        sampleLogNormal(0, 0.1)
      );
      
      // Check that all samples are positive
      expect(samples.every(s => s > 0)).toBe(true);
      
      // Check that mean is approximately exp(mu)
      const meanSample = mean(samples);
      expect(meanSample).toBeCloseTo(Math.exp(0), 0);
    });

    it('should handle different parameters', () => {
      const samples = Array.from({ length: 100 }, () => 
        sampleLogNormal(1, 0.5)
      );
      
      const meanSample = mean(samples);
      expect(meanSample).toBeCloseTo(Math.exp(1), 0);
    });
  });

  describe('sampleLogNormalFromCentral', () => {
    it('should generate samples with correct central value', () => {
      const samples = Array.from({ length: 1000 }, () => 
        sampleLogNormalFromCentral(2.0, 0.1)
      );
      
      const meanSample = mean(samples);
      expect(meanSample).toBeCloseTo(2.0, 0);
    });

    it('should handle zero log standard deviation', () => {
      const samples = Array.from({ length: 10 }, () => 
        sampleLogNormalFromCentral(1.5, 0)
      );
      
      // All samples should be exactly the central value
      expect(samples.every(s => s === 1.5)).toBe(true);
    });
  });
});
