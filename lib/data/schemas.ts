import { z } from 'zod';
import { 
  Sex, 
  SmokingStatus, 
  AlcoholConsumption, 
  BMIBand, 
  CauseCategory,
  UserProfile,
  MortalityTableRow,
  CauseFraction,
  HRPrior
} from '@/lib/model/types';

// User input validation schemas
export const sexSchema = z.enum(['male', 'female', 'other']);
export const smokingSchema = z.enum(['never', 'former', 'current']);
export const alcoholSchema = z.enum(['none', 'moderate', 'heavy']);
export const bmiBandSchema = z.enum(['underweight', 'normal', 'overweight', 'obese']);

export const vaccinationsSchema = z.object({
  flu: z.boolean(),
  covid: z.boolean(),
});

export const userProfileSchema = z.object({
  age: z.number().min(18).max(110),
  sex: sexSchema,
  zip3: z.string().length(3).regex(/^\d{3}$/),
  smoking: smokingSchema,
  alcohol: alcoholSchema,
  activityMinutesPerWeek: z.number().min(0).max(1000),
  vaccinations: vaccinationsSchema,
  bmiBand: bmiBandSchema.optional(),
  medications: z.string().optional(),
});

// Data validation schemas
export const mortalityTableRowSchema = z.object({
  age: z.number().min(0).max(120),
  sex: sexSchema,
  qx: z.number().min(0).max(1), // Probability of death
  ex: z.number().min(0), // Remaining life expectancy
});

export const causeFractionSchema = z.object({
  ageBand: z.string(),
  sex: sexSchema,
  cause: z.enum([
    'cvd',
    'cancer',
    'respiratory', 
    'injury',
    'metabolic',
    'neuro',
    'infectious',
    'other'
  ]),
  fraction: z.number().min(0).max(1),
});

export const hrPriorSchema = z.object({
  factor: z.string(),
  level: z.string(),
  hrCentral: z.number().min(0.1).max(10), // Reasonable HR bounds
  logSd: z.number().min(0).max(1), // Log-normal standard deviation
  source: z.string(),
});

// File format schemas
export const lifeTableSchema = z.object({
  version: z.string(),
  sex: sexSchema,
  age: z.number(),
  qx: z.number(),
  ex: z.number(),
});

export const causeFractionsSchema = z.object({
  version: z.string(),
  sex: sexSchema,
  ageBand: z.string(),
  cause: z.enum([
    'cvd',
    'cancer',
    'respiratory',
    'injury', 
    'metabolic',
    'neuro',
    'infectious',
    'other'
  ]),
  fraction: z.number(),
});

export const hrPriorsSchema = z.object({
  factor: z.string(),
  level: z.string(),
  hrCentral: z.number(),
  logSd: z.number(),
  source: z.string(),
});

// Validation helpers
export function validateUserProfile(data: unknown): UserProfile {
  return userProfileSchema.parse(data);
}

export function validateMortalityTableRow(data: unknown): MortalityTableRow {
  return mortalityTableRowSchema.parse(data);
}

export function validateCauseFraction(data: unknown): CauseFraction {
  return causeFractionSchema.parse(data);
}

export function validateHRPrior(data: unknown): HRPrior {
  return hrPriorSchema.parse(data);
}

// Data integrity checks
export function validateLifeTableConsistency(rows: MortalityTableRow[]): boolean {
  // Check that probabilities are reasonable
  for (const row of rows) {
    if (row.qx < 0 || row.qx > 0.5) return false;
    if (row.ex < 0 || row.ex > 100) return false;
  }
  
  // Check age sequence is complete
  const ages = rows.map(r => r.age).sort((a, b) => a - b);
  for (let i = 1; i < ages.length; i++) {
    if (ages[i] - ages[i-1] !== 1) return false;
  }
  
  return true;
}

export function validateCauseFractionsConsistency(fractions: CauseFraction[]): boolean {
  // Group by ageBand and sex
  const groups = new Map<string, CauseFraction[]>();
  
  for (const frac of fractions) {
    const key = `${frac.ageBand}-${frac.sex}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(frac);
  }
  
  // Check each group sums to ~1.0
  for (const [key, groupFractions] of groups) {
    const sum = groupFractions.reduce((s: number, f: CauseFraction) => s + f.fraction, 0);
    if (Math.abs(sum - 1.0) > 0.01) {
      console.warn(`Cause fractions for ${key} sum to ${sum}, expected 1.0`);
      return false;
    }
  }
  
  return true;
}

export function validateHRPriorsConsistency(priors: HRPrior[]): boolean {
  // Check all HRs are positive
  for (const prior of priors) {
    if (prior.hrCentral <= 0) return false;
    if (prior.logSd < 0) return false;
  }
  
  return true;
}
