export interface StartWorkoutSessionDto {
  workoutId: string;
  exerciseDay: number;
  timezoneOffsetMinutes: number;
}

export interface CompleteWorkoutSessionDto {
  timezoneOffsetMinutes: number;
}

export interface ActiveWorkoutSessionExercise {
  exerciseId: string;
  repsLeft?: number;
  targetReps?: number;
  loggedReps?: number;
  isLogged?: boolean;
}

export interface ActiveWorkoutSessionData {
  _id?: string;
  id?: string;
  clientId?: string;
  workoutId: string;
  exerciseDay: number;
  status: 'in_progress' | 'ready_to_complete' | 'completed' | string;
  loggedExercises?: (string | ActiveWorkoutSessionExercise)[];
  repsLeft?: number;
  completionDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkoutWeekCalendarDay {
  date: string;
  status?: 'completed' | 'rest' | 'missed' | 'none';
  completed?: boolean;
  isRestDay?: boolean;
  completionDate?: string | null;
  workoutId?: string | null;
  exerciseDay?: number | null;
}

export interface WorkoutWeekResponse {
  days?: WorkoutWeekCalendarDay[];
  calendar?: WorkoutWeekCalendarDay[];
  completedDates?: string[];
  weekStart?: string;
}
