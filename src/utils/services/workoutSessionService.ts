import api from '@utils/http/request';
import axios from 'axios';
import {
  ActiveWorkoutSessionData,
  WorkoutWeekCalendarDay,
} from '../types/workoutSessionTypes';
import { WeeklyCalendarDay } from '../types/analyticsTypes';

/**
 * Timezone offset in minutes (e.g. +330 for IST UTC+5:30).
 * In standard JS Date, getTimezoneOffset() returns -330 for UTC+5:30,
 * so -new Date().getTimezoneOffset() returns +330.
 */
export const getLocalTimezoneOffsetMinutes = (): number => {
  return -new Date().getTimezoneOffset();
};

/**
 * Returns Monday of the week for the given local timezone formatted as YYYY-MM-DD.
 */
export const getWeekMondayDateString = (
  date = new Date(),
  offsetMinutes = getLocalTimezoneOffsetMinutes()
): string => {
  const local = new Date(date.getTime() + offsetMinutes * 60 * 1000);
  const day = local.getUTCDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
  const mondayOffset = day === 0 ? 6 : day - 1;
  const monday = new Date(local);
  monday.setUTCDate(local.getUTCDate() - mondayOffset);
  return monday.toISOString().slice(0, 10);
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
 * POST /workout-sessions/start
 * Starts one workout session for today. Rejects if another day is already active today.
 */
export const startWorkoutSession = async (params: {
  workoutId: string;
  exerciseDay: number;
}): Promise<ActiveWorkoutSessionData> => {
  try {
    const payload = {
      workoutId: params.workoutId,
      exerciseDay: params.exerciseDay,
      timezoneOffsetMinutes: getLocalTimezoneOffsetMinutes(),
    };
    const response = await api.post('/workout-sessions/start', payload);
    const raw = response.data;
    return raw && typeof raw === 'object' && 'data' in raw ? raw.data : raw;
  } catch (error) {
    throw extractErrorMessage(error, 'Failed to start workout session');
  }
};

/**
 * GET /workout-sessions/active?timezoneOffsetMinutes=...
 * Returns active session or null if no session is in progress.
 */
export const getActiveWorkoutSession = async (): Promise<ActiveWorkoutSessionData | null> => {
  try {
    const response = await api.get('/workout-sessions/active', {
      params: {
        timezoneOffsetMinutes: getLocalTimezoneOffsetMinutes(),
      },
    });
    const raw = response.data;
    // When backend returns { success: true, statusCode: 200, data: null }, extract data field properly
    const data = raw && typeof raw === 'object' && 'data' in raw ? raw.data : raw;
    if (!data || Object.keys(data).length === 0) {
      return null;
    }
    return data;
  } catch (error) {
    // If backend returns 404 or null when no session is active, treat as null
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw extractErrorMessage(error, 'Failed to fetch active workout session');
  }
};

/**
 * POST /workout-sessions/complete
 * Completes the active workout session. Rejected until all exercises in the day are logged.
 */
export const completeWorkoutSession = async (): Promise<any> => {
  try {
    const payload = {
      timezoneOffsetMinutes: getLocalTimezoneOffsetMinutes(),
    };
    const response = await api.post('/workout-sessions/complete', payload);
    const raw = response.data;
    return raw && typeof raw === 'object' && 'data' in raw ? raw.data : raw;
  } catch (error) {
    throw extractErrorMessage(error, 'Failed to complete workout session');
  }
};

/**
 * GET /workout-sessions/week?startDate=...&timezoneOffsetMinutes=...
 * Returns seven dates from weekStart with completion and rest day status.
 */
export const getWorkoutWeekCalendar = async (
  startDate?: string
): Promise<WeeklyCalendarDay[]> => {
  try {
    const weekStart = startDate || getWeekMondayDateString();
    const response = await api.get('/workout-sessions/week', {
      params: {
        startDate: weekStart,
        timezoneOffsetMinutes: getLocalTimezoneOffsetMinutes(),
      },
    });

    const raw = response.data;
    const payload = raw && typeof raw === 'object' && 'data' in raw ? raw.data : raw;

    const list: any[] = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.days)
      ? payload.days
      : Array.isArray(payload?.calendar)
      ? payload.calendar
      : [];

    return list.map((item: any) => {
      let status: 'completed' | 'rest' | 'missed' | 'none' = 'none';
      if (item.status) {
        status = item.status;
      } else if (item.completed === true) {
        status = 'completed';
      } else if (item.restDay === true || item.isRestDay === true) {
        status = 'rest';
      }

      return {
        date: item.date,
        status,
        completed: item.completed,
        restDay: item.restDay ?? item.isRestDay,
        isRestDay: item.restDay ?? item.isRestDay,
        exerciseDay: item.exerciseDay ?? item.sessions?.[0]?.exerciseDay ?? null,
        workoutId: item.workoutId ?? item.sessions?.[0]?.workoutId ?? null,
        sessions: item.sessions || [],
      };
    });
  } catch (error) {
    console.warn('Error fetching workout week calendar:', error);
    return [];
  }
};
