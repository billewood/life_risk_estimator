import {
  probToHazard,
  hazardToProb,
  applyHRToAnnualProb,
  buildSurvivalCurve,
  calculateLifeExpectancy,
  findMedianSurvival,
} from '@/lib/model/survival';

describe('Survival Functions', () => {
  describe('probToHazard', () => {
    it('should convert probability to hazard correctly', () => {
      expect(probToHazard(0.01)).toBeCloseTo(-Math.log(1 - 0.01), 5);
      expect(probToHazard(0.1)).toBeCloseTo(-Math.log(1 - 0.1), 5);
    });

    it('should handle edge cases', () => {
      expect(probToHazard(0)).toBe(0);
      expect(probToHazard(0.5)).toBeCloseTo(-Math.log(0.5), 5);
    });

    it('should clamp extreme values', () => {
      const result = probToHazard(1.0);
      expect(result).toBeLessThan(Infinity);
      expect(result).toBeGreaterThan(0);
    });
  });

  describe('hazardToProb', () => {
    it('should convert hazard to probability correctly', () => {
      expect(hazardToProb(0.01)).toBeCloseTo(1 - Math.exp(-0.01), 5);
      expect(hazardToProb(0.1)).toBeCloseTo(1 - Math.exp(-0.1), 5);
    });

    it('should handle edge cases', () => {
      expect(hazardToProb(0)).toBe(0);
      expect(hazardToProb(1)).toBeCloseTo(1 - Math.exp(-1), 5);
    });
  });

  describe('applyHRToAnnualProb', () => {
    it('should apply hazard ratio correctly', () => {
      const q = 0.01;
      const hr = 2.0;
      const result = applyHRToAnnualProb(q, hr);
      
      const expected = hazardToProb(probToHazard(q) * hr);
      expect(result).toBeCloseTo(expected, 5);
    });

    it('should handle HR = 1 (no change)', () => {
      const q = 0.01;
      const result = applyHRToAnnualProb(q, 1.0);
      expect(result).toBeCloseTo(q, 5);
    });

    it('should increase risk with HR > 1', () => {
      const q = 0.01;
      const result = applyHRToAnnualProb(q, 2.0);
      expect(result).toBeGreaterThan(q);
    });

    it('should decrease risk with HR < 1', () => {
      const q = 0.01;
      const result = applyHRToAnnualProb(q, 0.5);
      expect(result).toBeLessThan(q);
    });
  });

  describe('buildSurvivalCurve', () => {
    it('should build survival curve correctly', () => {
      const startAge = 30;
      const annualQSequence = [0.001, 0.002, 0.003, 0.004, 0.005];
      
      const curve = buildSurvivalCurve(startAge, annualQSequence);
      
      expect(curve).toHaveLength(5);
      expect(curve[0].age).toBe(30);
      expect(curve[0].survival).toBe(1.0);
      expect(curve[0].qx).toBe(0.001);
      
      // Check that survival decreases
      for (let i = 1; i < curve.length; i++) {
        expect(curve[i].survival).toBeLessThan(curve[i-1].survival);
      }
    });

    it('should handle empty sequence', () => {
      const curve = buildSurvivalCurve(30, []);
      expect(curve).toHaveLength(0);
    });

    it('should respect max age', () => {
      const startAge = 105;
      const annualQSequence = Array(10).fill(0.1);
      
      const curve = buildSurvivalCurve(startAge, annualQSequence, 110);
      
      expect(curve.length).toBeLessThanOrEqual(6); // 105 to 110
    });
  });

  describe('calculateLifeExpectancy', () => {
    it('should calculate life expectancy correctly', () => {
      // Simple test with constant mortality
      const curve = [
        { age: 30, survival: 1.0, hazard: 0.01, qx: 0.01 },
        { age: 31, survival: 0.99, hazard: 0.01, qx: 0.01 },
        { age: 32, survival: 0.98, hazard: 0.01, qx: 0.01 },
      ];
      
      const le = calculateLifeExpectancy(curve);
      expect(le).toBeGreaterThan(0);
      expect(le).toBeLessThan(100);
    });

    it('should handle empty curve', () => {
      const le = calculateLifeExpectancy([]);
      expect(le).toBe(0);
    });
  });

  describe('findMedianSurvival', () => {
    it('should find median survival correctly', () => {
      const curve = [
        { age: 30, survival: 1.0, hazard: 0.1, qx: 0.1 },
        { age: 31, survival: 0.9, hazard: 0.1, qx: 0.1 },
        { age: 32, survival: 0.8, hazard: 0.1, qx: 0.1 },
        { age: 33, survival: 0.7, hazard: 0.1, qx: 0.1 },
        { age: 34, survival: 0.6, hazard: 0.1, qx: 0.1 },
        { age: 35, survival: 0.5, hazard: 0.1, qx: 0.1 },
        { age: 36, survival: 0.4, hazard: 0.1, qx: 0.1 },
      ];
      
      const median = findMedianSurvival(curve);
      expect(median).toBe(5); // 5 years from age 30 to age 35
    });

    it('should handle curve where survival never drops below 0.5', () => {
      const curve = [
        { age: 30, survival: 1.0, hazard: 0.01, qx: 0.01 },
        { age: 31, survival: 0.99, hazard: 0.01, qx: 0.01 },
      ];
      
      const median = findMedianSurvival(curve);
      expect(median).toBe(2); // Full curve length
    });

    it('should handle empty curve', () => {
      const median = findMedianSurvival([]);
      expect(median).toBe(0);
    });
  });
});
