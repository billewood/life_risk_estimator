import { create } from 'zustand';
import { UserProfile, Vaccinations } from '@/lib/model/types';
import { validateUserProfile } from '@/lib/data/schemas';

interface ProfileState {
  profile: Partial<UserProfile>;
  errors: Record<string, string>;
  currentStep: number;
  isComplete: boolean;
  
  // Actions
  updateProfile: (updates: Partial<UserProfile>) => void;
  setStep: (step: number) => void;
  validateCurrentProfile: () => boolean;
  resetProfile: () => void;
  getCompleteProfile: () => UserProfile | null;
  // Computed property for checking completion without side effects
  isProfileComplete: () => boolean;
  // Step-specific validation without side effects
  isCurrentStepValid: () => boolean;
}

const initialState: Partial<UserProfile> = {
  age: undefined,
  sex: undefined,
  zip3: '',
  smoking: 'never',
  alcohol: 'none',
  activityMinutesPerWeek: 0,
  vaccinations: {
    flu: false,
    covid: false,
  } as Vaccinations,
  bmiBand: undefined,
  medications: '',
};

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: initialState,
  errors: {},
  currentStep: 0,
  isComplete: false,

  updateProfile: (updates) => {
    set((state) => ({
      profile: { ...state.profile, ...updates },
      errors: {},
    }));
  },

  setStep: (step) => {
    set({ currentStep: step });
  },

  validateCurrentProfile: () => {
    const { profile, currentStep } = get();
    
    // Step-specific validation
    const errors: Record<string, string> = {};
    
    // Step 0: Age and Sex
    if (currentStep === 0) {
      if (!profile.age || profile.age < 18 || profile.age > 110) {
        errors.age = 'Age must be between 18 and 110';
      }
      if (!profile.sex) {
        errors.sex = 'Please select your sex';
      }
    }
    
    // Step 1: ZIP Code
    if (currentStep === 1) {
      if (!profile.zip3 || !/^\d{3}$/.test(profile.zip3)) {
        errors.zip3 = 'Please enter a valid 3-digit ZIP code';
      }
    }
    
    // Step 2: Health Habits
    if (currentStep === 2) {
      if (profile.activityMinutesPerWeek === undefined || profile.activityMinutesPerWeek < 0 || profile.activityMinutesPerWeek > 1000) {
        errors.activity = 'Activity minutes must be between 0 and 1000';
      }
    }
    
    // Check if profile is complete (for final submission)
    const isComplete = profile.age !== undefined && 
      profile.age >= 18 && 
      profile.age <= 110 &&
      profile.sex !== undefined && 
      profile.zip3 !== undefined && 
      profile.zip3 !== '' &&
      /^\d{3}$/.test(profile.zip3) &&
      profile.smoking !== undefined &&
      profile.alcohol !== undefined &&
      profile.activityMinutesPerWeek !== undefined &&
      profile.activityMinutesPerWeek >= 0 &&
      profile.activityMinutesPerWeek <= 1000 &&
      profile.vaccinations !== undefined;
    
    set({ errors, isComplete });
    
    return Object.keys(errors).length === 0;
  },

  resetProfile: () => {
    set({
      profile: initialState,
      errors: {},
      currentStep: 0,
      isComplete: false,
    });
  },

  getCompleteProfile: () => {
    const { profile, isComplete } = get();
    
    if (!isComplete) return null;
    
    try {
      return validateUserProfile(profile);
    } catch (error) {
      console.error('Profile validation failed:', error);
      return null;
    }
  },

  isProfileComplete: () => {
    const { profile } = get();
    
    // Check if all required fields are present and valid
    return profile.age !== undefined && 
      profile.age >= 18 && 
      profile.age <= 110 &&
      profile.sex !== undefined && 
      profile.zip3 !== undefined && 
      profile.zip3 !== '' &&
      /^\d{3}$/.test(profile.zip3) &&
      profile.smoking !== undefined &&
      profile.alcohol !== undefined &&
      profile.activityMinutesPerWeek !== undefined &&
      profile.activityMinutesPerWeek >= 0 &&
      profile.activityMinutesPerWeek <= 1000 &&
      profile.vaccinations !== undefined;
  },

  isCurrentStepValid: () => {
    const { profile, currentStep } = get();
    
    // Step-specific validation without side effects
    switch (currentStep) {
      case 0: // Age and Sex
        return profile.age !== undefined && 
               profile.age >= 18 && 
               profile.age <= 110 &&
               profile.sex !== undefined;
      
      case 1: // ZIP Code
        return profile.zip3 !== undefined && 
               profile.zip3 !== '' &&
               /^\d{3}$/.test(profile.zip3);
      
      case 2: // Health Habits
        return profile.activityMinutesPerWeek !== undefined &&
               profile.activityMinutesPerWeek >= 0 &&
               profile.activityMinutesPerWeek <= 1000;
      
      default:
        return false;
    }
  },
}));
