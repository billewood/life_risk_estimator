import { estimate } from '@/lib/model/engine';
import { UserProfile } from '@/lib/model/types';

// Mock the data loader to return test data
jest.mock('@/lib/data/loader', () => ({
  getBaseline1YearRisk: jest.fn(),
  getBaselineLifeExpectancy: jest.fn(),
  sequenceFrom: jest.fn(),
  getCauseFractions: jest.fn(),
  getHRPrior: jest.fn(),
}));

import {
  getBaseline1YearRisk,
  getBaselineLifeExpectancy,
  sequenceFrom,
  getCauseFractions,
  getHRPrior,
} from '@/lib/data/loader';

describe('Engine Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock baseline mortality data
    (getBaseline1YearRisk as jest.Mock).mockResolvedValue(0.01);
    (getBaselineLifeExpectancy as jest.Mock).mockResolvedValue(50.0);
    (sequenceFrom as jest.Mock).mockResolvedValue(
      Array.from({ length: 50 }, (_, i) => 0.01 + i * 0.001)
    );
    
    // Mock cause fractions
    (getCauseFractions as jest.Mock).mockResolvedValue([
      { cause: 'cvd', fraction: 0.3 },
      { cause: 'cancer', fraction: 0.25 },
      { cause: 'respiratory', fraction: 0.1 },
      { cause: 'injury', fraction: 0.1 },
      { cause: 'metabolic', fraction: 0.1 },
      { cause: 'neuro', fraction: 0.1 },
      { cause: 'infectious', fraction: 0.03 },
      { cause: 'other', fraction: 0.02 },
    ]);
    
    // Mock HR priors
    (getHRPrior as jest.Mock).mockImplementation((factor, level) => {
      const hrMap: Record<string, Record<string, any>> = {
        smoking: {
          never: { hrCentral: 1.0, logSd: 0.0, source: 'reference' },
          former: { hrCentral: 1.3, logSd: 0.1, source: 'meta-analysis' },
          current: { hrCentral: 2.4, logSd: 0.15, source: 'meta-analysis' },
        },
        alcohol: {
          none: { hrCentral: 1.0, logSd: 0.0, source: 'reference' },
          moderate: { hrCentral: 1.02, logSd: 0.05, source: 'meta-analysis' },
          heavy: { hrCentral: 1.8, logSd: 0.12, source: 'meta-analysis' },
        },
        activity: {
          sedentary: { hrCentral: 1.0, logSd: 0.0, source: 'reference' },
          low: { hrCentral: 0.95, logSd: 0.05, source: 'meta-analysis' },
          moderate: { hrCentral: 0.8, logSd: 0.08, source: 'meta-analysis' },
          high: { hrCentral: 0.7, logSd: 0.1, source: 'meta-analysis' },
        },
        bmi: {
          normal: { hrCentral: 1.0, logSd: 0.0, source: 'reference' },
          overweight: { hrCentral: 1.05, logSd: 0.05, source: 'meta-analysis' },
          obese: { hrCentral: 1.2, logSd: 0.08, source: 'meta-analysis' },
        },
        vaccination_flu: {
          vaccinated: { hrCentral: 0.85, logSd: 0.1, source: 'CDC' },
        },
        vaccination_covid: {
          vaccinated: { hrCentral: 0.75, logSd: 0.12, source: 'CDC' },
        },
      };
      
      return Promise.resolve(hrMap[factor]?.[level] || null);
    });
  });

  describe('Basic Profile Tests', () => {
    it('should estimate for low-risk profile', async () => {
      const profile: UserProfile = {
        age: 30,
        sex: 'male',
        zip3: '902',
        smoking: 'never',
        alcohol: 'none',
        activityMinutesPerWeek: 150,
        vaccinations: { flu: true, covid: true },
      };

      const result = await estimate(profile, { includeUncertainty: false });

      expect(result).toBeDefined();
      expect(result.lifeExpectancyMedian).toBeGreaterThan(0);
      expect(result.risk1y).toBeGreaterThan(0);
      expect(result.risk1y).toBeLessThan(1);
      expect(result.drivers).toBeDefined();
      expect(result.modelVersion).toBeDefined();
      expect(result.dataVersion).toBeDefined();
    });

    it('should estimate for high-risk profile', async () => {
      const profile: UserProfile = {
        age: 60,
        sex: 'male',
        zip3: '902',
        smoking: 'current',
        alcohol: 'heavy',
        activityMinutesPerWeek: 0,
        vaccinations: { flu: false, covid: false },
        bmiBand: 'obese',
      };

      const result = await estimate(profile, { includeUncertainty: false });

      expect(result).toBeDefined();
      expect(result.risk1y).toBeGreaterThan(0.01); // Higher than baseline
      expect(result.lifeExpectancyMedian).toBeLessThan(50); // Lower than baseline
      expect(result.drivers.length).toBeGreaterThan(0);
    });

    it('should estimate for female profile', async () => {
      const profile: UserProfile = {
        age: 40,
        sex: 'female',
        zip3: '100',
        smoking: 'former',
        alcohol: 'moderate',
        activityMinutesPerWeek: 120,
        vaccinations: { flu: true, covid: false },
      };

      const result = await estimate(profile, { includeUncertainty: false });

      expect(result).toBeDefined();
      expect(result.lifeExpectancyMedian).toBeGreaterThan(0);
      expect(result.risk1y).toBeGreaterThan(0);
      expect(result.risk1y).toBeLessThan(1);
    });
  });

  describe('Risk Factor Impact Tests', () => {
    it('should increase risk with smoking', async () => {
      const baseProfile: UserProfile = {
        age: 40,
        sex: 'male',
        zip3: '902',
        smoking: 'never',
        alcohol: 'none',
        activityMinutesPerWeek: 150,
        vaccinations: { flu: true, covid: true },
      };

      const smokingProfile: UserProfile = {
        ...baseProfile,
        smoking: 'current',
      };

      const baseResult = await estimate(baseProfile, { includeUncertainty: false });
      const smokingResult = await estimate(smokingProfile, { includeUncertainty: false });

      expect(smokingResult.risk1y).toBeGreaterThan(baseResult.risk1y);
      expect(smokingResult.lifeExpectancyMedian).toBeLessThan(baseResult.lifeExpectancyMedian);
    });

    it('should decrease risk with high activity', async () => {
      const baseProfile: UserProfile = {
        age: 40,
        sex: 'male',
        zip3: '902',
        smoking: 'never',
        alcohol: 'none',
        activityMinutesPerWeek: 0,
        vaccinations: { flu: true, covid: true },
      };

      const activeProfile: UserProfile = {
        ...baseProfile,
        activityMinutesPerWeek: 300,
      };

      const baseResult = await estimate(baseProfile, { includeUncertainty: false });
      const activeResult = await estimate(activeProfile, { includeUncertainty: false });

      expect(activeResult.risk1y).toBeLessThan(baseResult.risk1y);
      expect(activeResult.lifeExpectancyMedian).toBeGreaterThan(baseResult.lifeExpectancyMedian);
    });
  });

  describe('Uncertainty Tests', () => {
    it('should include uncertainty when requested', async () => {
      const profile: UserProfile = {
        age: 40,
        sex: 'male',
        zip3: '902',
        smoking: 'never',
        alcohol: 'none',
        activityMinutesPerWeek: 150,
        vaccinations: { flu: true, covid: true },
      };

      const result = await estimate(profile, { 
        includeUncertainty: true,
        bootstrapSamples: 50, // Reduced for faster testing
      });

      expect(result.risk1yCI80.lower).toBeLessThan(result.risk1y);
      expect(result.risk1yCI80.upper).toBeGreaterThan(result.risk1y);
      expect(result.lifeExpectancyCI80.lower).toBeLessThan(result.lifeExpectancyMedian);
      expect(result.lifeExpectancyCI80.upper).toBeGreaterThan(result.lifeExpectancyMedian);
    });

    it('should skip uncertainty when not requested', async () => {
      const profile: UserProfile = {
        age: 40,
        sex: 'male',
        zip3: '902',
        smoking: 'never',
        alcohol: 'none',
        activityMinutesPerWeek: 150,
        vaccinations: { flu: true, covid: true },
      };

      const result = await estimate(profile, { includeUncertainty: false });

      // CI should be approximate (not from bootstrap)
      expect(result.risk1yCI80.lower).toBeDefined();
      expect(result.risk1yCI80.upper).toBeDefined();
      expect(result.lifeExpectancyCI80.lower).toBeDefined();
      expect(result.lifeExpectancyCI80.upper).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid age', async () => {
      const profile: UserProfile = {
        age: 150, // Invalid age
        sex: 'male',
        zip3: '902',
        smoking: 'never',
        alcohol: 'none',
        activityMinutesPerWeek: 150,
        vaccinations: { flu: true, covid: true },
      };

      await expect(estimate(profile)).rejects.toThrow();
    });

    it('should handle missing data gracefully', async () => {
      // Mock missing data
      (getBaseline1YearRisk as jest.Mock).mockRejectedValue(new Error('Data not found'));
      
      const profile: UserProfile = {
        age: 40,
        sex: 'male',
        zip3: '902',
        smoking: 'never',
        alcohol: 'none',
        activityMinutesPerWeek: 150,
        vaccinations: { flu: true, covid: true },
      };

      await expect(estimate(profile)).rejects.toThrow();
    });
  });

  describe('Performance Tests', () => {
    it('should complete estimation within reasonable time', async () => {
      const profile: UserProfile = {
        age: 40,
        sex: 'male',
        zip3: '902',
        smoking: 'never',
        alcohol: 'none',
        activityMinutesPerWeek: 150,
        vaccinations: { flu: true, covid: true },
      };

      const startTime = Date.now();
      const result = await estimate(profile, { includeUncertainty: false });
      const endTime = Date.now();

      expect(result.computationTime).toBeLessThan(1000); // Less than 1 second
      expect(endTime - startTime).toBeLessThan(2000); // Less than 2 seconds total
    });
  });
});
