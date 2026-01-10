import { Unit } from './types';

export interface LogSetDto {
  setNo: number;
  unit: Unit;
  totalWeight: number;
  totalReps: number;
}

export interface CreateLogSetDto {
  workoutId: string;
  exerciseId: string;
  exerciseDay: number;
  logSets: LogSetDto[];
}

export interface LogEntryDto {
  logDate: string;
  logSets: LogSetDto[];
}

export interface LogResponseDto {
  data: LogEntryDto[];
}

export interface LastWeekAnalytics {
  sets: number;
  setsIncrement: number;
  reps: number;
  repsIncrement: number;
  weight: number;
  weightIncrement: number;
  kgPerRep: number;
  kgPerRepIncrement: number;
}
