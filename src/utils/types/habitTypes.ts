export type HabitType = 'weight' | 'steps' | 'water' | 'sleep';

export interface BaseHabitPayload {
  date: string;
  timezoneOffsetMinutes: number;
}

export interface LogWeightPayload extends BaseHabitPayload {
  value: number;
  unit: 'kg' | 'lbs';
}

export interface LogStepsPayload extends BaseHabitPayload {
  steps: number;
}

export interface LogWaterPayload extends BaseHabitPayload {
  consumed: number;
}

export interface LogSleepPayload extends BaseHabitPayload {
  hours: number;
  minutes: number;
}

export type LogHabitPayload =
  | { type: 'weight'; value: number; unit?: 'kg' | 'lbs'; date?: string }
  | { type: 'steps'; steps: number; date?: string }
  | { type: 'water'; consumed: number; date?: string }
  | { type: 'sleep'; hours: number; minutes: number; date?: string };

export type LogHabitDto = LogHabitPayload;

export interface WeightHabitResponse {
  logged: boolean;
  value: number | null;
  unit?: 'kg' | 'lbs' | null;
  [key: string]: any;
}

export interface StepsHabitResponse {
  logged: boolean;
  steps: number | null;
  target?: number | null;
  [key: string]: any;
}

export interface WaterHabitResponse {
  logged: boolean;
  consumed: number | null;
  target?: number | null;
  [key: string]: any;
}

export interface SleepHabitResponse {
  logged: boolean;
  hours?: number | null;
  minutes?: number | null;
  totalMinutes?: number | null;
  total_minutes?: number | null;
  target?: number | null;
  [key: string]: any;
}

export interface DailyHabitsDashboardData {
  date?: string;
  weight?: WeightHabitResponse;
  steps?: StepsHabitResponse;
  water?: WaterHabitResponse;
  sleep?: SleepHabitResponse;
  habits?: {
    weight?: WeightHabitResponse;
    steps?: StepsHabitResponse;
    water?: WaterHabitResponse;
    sleep?: SleepHabitResponse;
  };
  [key: string]: any;
}

export interface HabitData {
  type: HabitType;
  logged: boolean;
  currentValue: number;
  targetValue?: number;
  unit: string;
  formattedValue: string;
  formattedTarget?: string;
  progress: number;
  lastUpdated?: string | null;
  details?: {
    weightUnit?: 'kg' | 'lbs';
    sleepHours?: number;
    sleepMinutes?: number;
  };
}

export interface HabitAnalyticsParams {
  metric: HabitType;
  period?: 'week' | 'month' | 'year';
  startDate?: string;
  endDate: string;
}

export interface HabitAnalyticsPoint {
  date: string;
  value: number | null;
  target?: number | null;
  unit?: string;
  total_minutes?: number | null;
  [key: string]: any;
}

export interface HabitAnalyticsResponse {
  metric: HabitType;
  period?: string;
  startDate?: string;
  endDate: string;
  days?: HabitAnalyticsPoint[];
  data?: HabitAnalyticsPoint[];
  dailyTarget?: number;
  averageDailySteps?: number;
  totalSteps?: number;
  daysTargetAchieved?: number;
  [key: string]: any;
}
