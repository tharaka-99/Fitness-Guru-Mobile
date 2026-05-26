//NOTE: => ENUMS
export enum Gender {
  Male = "Male",
  Female = "Female",
}
//
export enum ActivityLevel {
  Sedentary = "Sedentary",
  Light = "Light",
  Moderate = "Moderate",
  Active = "Active",
}
//
export enum Goal {
  WeightGain = "WeightGain",
  FatLoss = "FatLoss",
  Maintenance = "Maintenance",
  LeanGaining = "LeanGaining",
  WeightLoss = "WeightLoss",
}
//
export enum ExpertiseLevel {
  Beginner = "Beginner",
  Intermediate = "Intermediate",
  Advanced = "Advanced",
}
//
export enum Unit {
  Metric = "Metric",
  Imperial = "Imperial",
}
//
export enum WorkoutType {
  SelfCreated = "SelfCreated",
  TrainerCreated = "TrainerCreated",
  FitnessGuruCreated = "FitnessGuruCreated",
  Default = "Default",
}

//NOTE: => TYPES
export type Credentials = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

//NOTE: => INTERFACES
export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword?: string;
  mobileNumber: string;
  city: string;
  gender: Gender;
}
//
export interface FitnessInfo {
  activityLevel?: string;
  goal?: string;
  expertiseLevel?: string;
}
//
export interface PersonalInfo {
  age: number;
  unit: Unit;
  weight: number;
  height: number;
}
//
export interface CalculatedMetrics {
  bmr: number;
  dci: number;
}
//
export interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  city: string;
  gender: string;
  role: string;
  calculatedMetrics?: CalculatedMetrics;
  personalInfo: PersonalInfo;
  fitnessInfo: FitnessInfo;
  createdAt: Date;
  profileImageFileUrl?: string;
}
//
export interface ClientInfo {
  personalInfo: PersonalInfo;
  fitnessInfo: FitnessInfo;
  isInjured: boolean;
}
//
export interface Exercises {
  _id?: string;
  order: number;
  exercise: SearchExercises;
  sets: number;
  reps: number;
  rest: number;
  description?: string;
  url?: string;
  type?: WorkoutType;
}
//
export interface DefaultExercise {
  _id?: string;
  order: number;
  exercise: SearchExercises;
  sets: number;
  reps: number;
  rest: number;
  description?: string;
  imageUrl?: string;
}
//
export interface ExerciseDay {
  day: number;
  exercises: Exercises[];
}
//
export interface DefaultExerciseDay {
  day: number;
  exercises: DefaultExercise[];
}
//
export interface Workout {
  _id?: string;
  type?: WorkoutType;
  exerciseDays: ExerciseDay[];
  createdBy?: string;
}
//
export interface SearchExercises {
  _id: string;
  name: string;
  url?: string;
  description?: string;
}
//
export interface DefaultWorkout {
  _id?: string;
  name?: string;
  exerciseDays: DefaultExerciseDay[];
}
//
export interface SelectedWorkout {
  WorkoutType: WorkoutType;
  createdBy: string;
}
