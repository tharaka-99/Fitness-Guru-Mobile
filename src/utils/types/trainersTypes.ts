// Enum for roles
export enum Role {
  Client = 'Client',
  Trainer = 'Trainer',
  FitnessGuru = 'FitnessGuru',
}

// Enum for trainingFor
export enum TrainingFor {
  Men = 'Men',
  Women = 'Women',
  MenAndWomen = 'MenAndWomen',
}

//trainer requests enums
export enum Gender {
  Male = 'Male',
  Female = 'Female',
}

export enum Unit {
  Metric = 'Metric',
  Imperial = 'Imperial',
}

export enum WorkoutPlace {
  Home = 'Home',
  Gym = 'Gym',
}

export enum ActivityLevel {
  Sedentary = 'Sedentary',
  Light = 'Light',
  Moderate = 'Moderate',
  Active = 'Active',
}

export enum Goal {
  WeightGain = 'WeightGain',
  FatLoss = 'FatLoss',
  Maintenance = 'Maintenance',
  LeanGaining = 'LeanGaining',
  WeightLoss = 'WeightLoss',
}

export enum Cardiovascular {
  Poor = 'Poor',
  Fair = 'Fair',
  Good = 'Good',
  Excellent = 'Excellent',
}
// Interface for PortfolioFileData
export interface PortfolioFileData {
  portfolioFileKey: string;
  portfolioFileUrl: string;
}

// Interface for Trainer
export interface Trainer {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  address: string;
  role: Role;
  trainingFor: TrainingFor;
  yearsOfExperience: number;
  certificationFileKey?: string;
  certificationFileUrl?: string;
  portfolioFileData?: PortfolioFileData[];
  clientIds: string[];
  profileImageFileUrl?: string;
}
// Interface for Trainer packages
export interface TrainerPackage {
  trainerId: string;
  name: string;
  trainingPeriod: number;
  packageBrief: string;
  price: string;
}
// Interface for Trainer requests
export interface CreateTrainerRequestDto {
  trainerId?: string;
  fullName: string;
  occupation: string;
  gender: Gender;
  age: number;
  unit: Unit;
  weight: number;
  height: number;
  workoutPlace: WorkoutPlace;
  workoutDaysPerWeek: string;
  homeEquipments: string;
  isAnyFoodAllergies: boolean;
  foodAllergies: string;
  isAnyInjuries: boolean;
  injuries: string;
  isAnyPhysicalLimitations: boolean;
  physicalLimitations: string;
  isUsingAnyMedications: boolean;
  usingMedications: string;
  activityLevel: ActivityLevel;
  goal: Goal;
  weeklyMealBudget: number;
  isUseAnySupplements: boolean;
  supplements: string;
  cardiovascular: Cardiovascular;
  oneSetPushUpCount: number;
  oneSetBodyWeightSquats: number;
  oneSetPullUps: number;
  canTouchToesKeepingLegsStraight: boolean;
  isPracticingAnyFlexibilityExercises: boolean;
}

export interface ReRequestEligibility {
  meal: {
    canRequest: boolean;
    remainingDays: number;
    nextRequestAt: string | null;
  };
  workout: {
    canRequest: boolean;
    remainingDays: number;
    nextRequestAt: string | null;
  };
}

export interface MealReRequestPayload {
  goal: Goal;
  age: number;
  weight: number;
  height: number;
  activityLevel: ActivityLevel;
}
