import api from '@utils/http/request';
import axios from 'axios';
import {
  DailyHabitsDashboardData,
  HabitAnalyticsParams,
  HabitAnalyticsResponse,
  HabitData,
  LogHabitPayload,
  LogSleepPayload,
  LogStepsPayload,
  LogWaterPayload,
  LogWeightPayload,
} from '../types/habitTypes';

/**
 * Timezone offset in minutes (e.g. +330 for IST UTC+5:30).
 * In standard JS Date, getTimezoneOffset() returns -330 for UTC+5:30,
 * so -new Date().getTimezoneOffset() returns +330.
 */
export const getLocalTimezoneOffsetMinutes = (): number => {
  return -new Date().getTimezoneOffset();
};

/**
 * Returns today's local date formatted as YYYY-MM-DD.
 */
export const getLocalDateString = (
  date = new Date(),
  offsetMinutes = getLocalTimezoneOffsetMinutes()
): string => {
  const localDate = new Date(date.getTime() + offsetMinutes * 60 * 1000);
  return localDate.toISOString().slice(0, 10);
};

const extractErrorMessage = (error: any, fallbackMessage: string): Error => {
  if (axios.isAxiosError(error)) {
    const serverMessage = error.response?.data?.message;
    if (serverMessage) {
      return new Error(serverMessage);
    }
  }
  return new Error(error?.message || fallbackMessage);
};

/**
 * Normalizes backend dashboard response into a consistent HabitData array for UI cards.
 * Handles arrays, nested objects, and various property naming schemes from the backend.
 */
export const normalizeHabitsDashboard = (
  rawResponse: any
): HabitData[] => {
  let habitsObj: Record<string, any> = {};

  const payload = rawResponse?.data ?? rawResponse;

  if (Array.isArray(payload)) {
    payload.forEach((item) => {
      const type = item?.type || item?.habit || item?.name;
      if (type) {
        habitsObj[type.toLowerCase()] = item;
      }
    });
  } else if (payload && typeof payload === 'object') {
    if (Array.isArray(payload.habits)) {
      payload.habits.forEach((item: any) => {
        const type = item?.type || item?.habit || item?.name;
        if (type) {
          habitsObj[type.toLowerCase()] = item;
        }
      });
    } else {
      const nestedHabits = payload.habits || payload.dailyHabits || payload;
      habitsObj = typeof nestedHabits === 'object' ? nestedHabits : {};
    }
  }

  // Weight
  const weight = habitsObj.weight || habitsObj.Weight || {};
  const weightRaw = weight.value ?? weight.weight ?? weight.currentValue ?? (typeof weight === 'number' ? weight : null);
  const weightVal = weightRaw != null ? Number(weightRaw) : 0;
  const isWeightLogged = Boolean(
    weight.logged === true ||
    (weightRaw != null && weightVal > 0)
  );
  const weightUnit = ((weight.unit || 'kg') as string).toLowerCase() === 'lbs' ? 'lbs' : 'kg';
  const weightCard: HabitData = {
    type: 'weight',
    logged: isWeightLogged,
    currentValue: weightVal,
    unit: weightUnit === 'lbs' ? 'lbs' : 'Kg',
    formattedValue: isWeightLogged ? `${weightVal} ${weightUnit}` : 'Not logged',
    progress: isWeightLogged ? 1 : 0,
    lastUpdated: weight.updatedAt || weight.createdAt || null,
    details: {
      weightUnit,
    },
  };

  // Steps
  const steps = habitsObj.steps || habitsObj.Steps || {};
  const stepsRaw = steps.steps ?? steps.value ?? steps.count ?? steps.currentValue ?? (typeof steps === 'number' ? steps : null);
  const stepsVal = stepsRaw != null ? Math.round(Number(stepsRaw)) : 0;
  const stepsTarget = Number(steps.target ?? steps.targetValue ?? 10000);
  const isStepsLogged = Boolean(
    steps.logged === true ||
    (stepsRaw != null && stepsVal > 0)
  );
  const stepsCard: HabitData = {
    type: 'steps',
    logged: isStepsLogged,
    currentValue: stepsVal,
    targetValue: stepsTarget,
    unit: '',
    formattedValue: isStepsLogged ? stepsVal.toLocaleString() : '0',
    formattedTarget: stepsTarget ? stepsTarget.toLocaleString() : undefined,
    progress: stepsTarget > 0 ? Math.min(1, stepsVal / stepsTarget) : 0,
    lastUpdated: steps.updatedAt || steps.createdAt || null,
  };

  // Water
  const water = habitsObj.water || habitsObj.Water || {};
  const waterRaw = water.consumed ?? water.value ?? water.amount ?? water.litres ?? water.liters ?? water.currentValue ?? (typeof water === 'number' ? water : null);
  const waterVal = waterRaw != null ? Number(Number(waterRaw).toFixed(2)) : 0;
  const rawWaterTarget = water.target ?? water.targetValue ?? 3;
  const waterTarget = rawWaterTarget != null ? Number(Number(rawWaterTarget).toFixed(2)) : 3;
  const isWaterLogged = Boolean(
    water.logged === true ||
    (waterRaw != null && waterVal > 0)
  );
  const waterCard: HabitData = {
    type: 'water',
    logged: isWaterLogged,
    currentValue: waterVal,
    targetValue: waterTarget,
    unit: 'Liters',
    formattedValue: isWaterLogged ? `${waterVal} L` : '0 L',
    formattedTarget: waterTarget ? `${waterTarget} L` : undefined,
    progress: waterTarget && waterTarget > 0 ? Math.min(1, waterVal / waterTarget) : 0,
    lastUpdated: water.updatedAt || water.createdAt || null,
  };

  // Sleep
  const sleep = habitsObj.sleep || habitsObj.Sleep || {};
  const rawTotalMinutes = sleep.totalMinutes ?? sleep.total_minutes ?? (
    sleep.hours != null || sleep.minutes != null
      ? (Number(sleep.hours || 0) * 60 + Number(sleep.minutes || 0))
      : (typeof sleep.value === 'number' ? Math.round(sleep.value * 60) : null)
  );
  const sleepHours =
    sleep.hours != null
      ? Number(sleep.hours)
      : rawTotalMinutes != null
      ? Math.floor(Number(rawTotalMinutes) / 60)
      : 0;
  const sleepMinutes =
    sleep.minutes != null
      ? Number(sleep.minutes)
      : rawTotalMinutes != null
      ? Number(rawTotalMinutes) % 60
      : 0;
  const sleepTotalMinutes =
    rawTotalMinutes != null ? Number(rawTotalMinutes) : sleepHours * 60 + sleepMinutes;
  const sleepTarget = Number(sleep.target ?? sleep.targetValue ?? 480);
  const isSleepLogged = Boolean(
    sleep.logged === true ||
    (rawTotalMinutes != null && sleepTotalMinutes > 0)
  );
  const sleepCard: HabitData = {
    type: 'sleep',
    logged: isSleepLogged,
    currentValue: Number((sleepTotalMinutes / 60).toFixed(1)),
    targetValue: Number((sleepTarget / 60).toFixed(1)),
    unit: 'Hours',
    formattedValue: isSleepLogged
      ? `${sleepHours}h ${sleepMinutes > 0 ? `${sleepMinutes}m` : '00m'}`
      : '0h 00m',
    formattedTarget: `${Math.floor(sleepTarget / 60)}h`,
    progress: sleepTarget > 0 ? Math.min(1, sleepTotalMinutes / sleepTarget) : 0,
    lastUpdated: sleep.updatedAt || sleep.createdAt || null,
    details: {
      sleepHours,
      sleepMinutes,
    },
  };

  return [weightCard, stepsCard, waterCard, sleepCard];
};

/**
 * Fetches daily habits dashboard for a given date (defaults to today's local date).
 */
export const getDailyHabitsDashboard = async (
  date?: string
): Promise<DailyHabitsDashboardData> => {
  try {
    const targetDate = date || getLocalDateString();
    const response = await api.get('/daily-habits', {
      params: { date: targetDate },
    });
    return response.data?.data ?? response.data;
  } catch (error) {
    throw extractErrorMessage(error, 'Failed to fetch daily habits');
  }
};

/**
 * Fetches and normalizes daily habits into an array of HabitData for UI consumption.
 */
export const getDailyHabits = async (date?: string): Promise<HabitData[]> => {
  try {
    const data = await getDailyHabitsDashboard(date);
    return normalizeHabitsDashboard(data);
  } catch (error) {
    console.warn('Error fetching daily habits from server:', error);
    return normalizeHabitsDashboard(null);
  }
};

/**
 * Log Weight (PUT /daily-habits/weight)
 */
export const logWeightHabit = async (params: {
  value: number;
  unit?: 'kg' | 'lbs';
  date?: string;
}): Promise<any> => {
  try {
    const payload: LogWeightPayload = {
      date: params.date || getLocalDateString(),
      timezoneOffsetMinutes: getLocalTimezoneOffsetMinutes(),
      value: params.value,
      unit: params.unit || 'kg',
    };
    const response = await api.put('/daily-habits/weight', payload);
    return response.data?.data ?? response.data;
  } catch (error) {
    throw extractErrorMessage(error, 'Failed to log weight');
  }
};

/**
 * Log Steps (PUT /daily-habits/steps)
 */
export const logStepsHabit = async (params: {
  steps: number;
  date?: string;
}): Promise<any> => {
  try {
    const payload: LogStepsPayload = {
      date: params.date || getLocalDateString(),
      timezoneOffsetMinutes: getLocalTimezoneOffsetMinutes(),
      steps: Math.round(params.steps),
    };
    const response = await api.put('/daily-habits/steps', payload);
    return response.data?.data ?? response.data;
  } catch (error) {
    throw extractErrorMessage(error, 'Failed to log steps');
  }
};

/**
 * Log Water (PUT /daily-habits/water)
 */
export const logWaterHabit = async (params: {
  consumed: number;
  date?: string;
}): Promise<any> => {
  try {
    const payload: LogWaterPayload = {
      date: params.date || getLocalDateString(),
      timezoneOffsetMinutes: getLocalTimezoneOffsetMinutes(),
      consumed: params.consumed,
    };
    const response = await api.put('/daily-habits/water', payload);
    return response.data?.data ?? response.data;
  } catch (error) {
    throw extractErrorMessage(error, 'Failed to log water');
  }
};

/**
 * Log Sleep (PUT /daily-habits/sleep)
 */
export const logSleepHabit = async (params: {
  hours: number;
  minutes: number;
  date?: string;
}): Promise<any> => {
  try {
    const payload: LogSleepPayload = {
      date: params.date || getLocalDateString(),
      timezoneOffsetMinutes: getLocalTimezoneOffsetMinutes(),
      hours: Math.floor(params.hours),
      minutes: Math.floor(params.minutes),
    };
    const response = await api.put('/daily-habits/sleep', payload);
    return response.data?.data ?? response.data;
  } catch (error) {
    throw extractErrorMessage(error, 'Failed to log sleep');
  }
};

/**
 * Unified dispatch to log any daily habit by type.
 */
export const logDailyHabit = async (payload: LogHabitPayload): Promise<any> => {
  switch (payload.type) {
    case 'weight':
      return logWeightHabit({
        value: payload.value,
        unit: payload.unit,
        date: payload.date,
      });
    case 'steps':
      return logStepsHabit({
        steps: payload.steps,
        date: payload.date,
      });
    case 'water':
      return logWaterHabit({
        consumed: payload.consumed,
        date: payload.date,
      });
    case 'sleep':
      return logSleepHabit({
        hours: payload.hours,
        minutes: payload.minutes,
        date: payload.date,
      });
    default:
      throw new Error(`Unsupported habit type: ${(payload as any)?.type}`);
  }
};

/**
 * Fetch Habit Analytics (GET /daily-habits/analytics)
 */
export const getDailyHabitAnalytics = async (
  params: HabitAnalyticsParams
): Promise<HabitAnalyticsResponse> => {
  try {
    const response = await api.get('/daily-habits/analytics', { params });
    return response.data?.data ?? response.data;
  } catch (error) {
    throw extractErrorMessage(error, 'Failed to fetch habit analytics');
  }
};
