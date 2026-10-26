import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  startWorkoutSession,
  getActiveWorkoutSession,
  completeWorkoutSession,
  getWorkoutWeekCalendar,
  getLocalDateString,
  getWeekMondayDateString,
} from '@utils/services/workoutSessionService';
import {
  ActiveWorkoutSessionData,
} from '@utils/types/workoutSessionTypes';
import { WeeklyCalendarDay } from '@utils/types/analyticsTypes';
import Toast from 'react-native-toast-message';

export const useActiveWorkoutSession = () => {
  return useQuery<ActiveWorkoutSessionData | null>({
    queryKey: ['activeWorkoutSession'],
    queryFn: getActiveWorkoutSession,
  });
};

export const useWorkoutWeekCalendar = (startDate?: string) => {
  const weekStart = startDate || getWeekMondayDateString();
  return useQuery<WeeklyCalendarDay[]>({
    queryKey: ['workoutWeekCalendar', weekStart],
    queryFn: () => getWorkoutWeekCalendar(weekStart),
  });
};

export const useStartWorkoutSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { workoutId: string; exerciseDay: number }) =>
      startWorkoutSession(params),
    onSuccess: (data) => {
      Toast.show({
        type: 'success',
        text1: 'Workout Started! 💪',
        text2: `Session for Day ${data?.exerciseDay || ''} is now active.`,
      });
      queryClient.invalidateQueries({ queryKey: ['activeWorkoutSession'] });
      queryClient.invalidateQueries({ queryKey: ['workoutWeekCalendar'] });
      queryClient.invalidateQueries({ queryKey: ['weeklyOverview'] });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Could Not Start Workout',
        text2: error?.message || 'Please check your connection and try again.',
      });
    },
  });
};

export const useCompleteWorkoutSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => completeWorkoutSession(),
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Workout Completed! 🎉',
        text2: 'Your session has been recorded for this week.',
      });
      queryClient.invalidateQueries({ queryKey: ['activeWorkoutSession'] });
      queryClient.invalidateQueries({ queryKey: ['workoutWeekCalendar'] });
      queryClient.invalidateQueries({ queryKey: ['weeklyOverview'] });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Could Not Complete Workout',
        text2: error?.message || 'Make sure all exercises are logged before completing.',
      });
    },
  });
};

/**
 * Helper to determine if today already has a completed workout session on the server.
 */
export const isTodayWorkoutCompleted = (calendar?: WeeklyCalendarDay[]): boolean => {
  if (!calendar || calendar.length === 0) return false;
  const todayStr = getLocalDateString();
  return calendar.some((day) => {
    const dayDate = day.date?.slice(0, 10);
    return dayDate === todayStr && (day.status === 'completed' || day.completed === true);
  });
};

/**
 * Helper to determine if a specific workout day has been completed in the week calendar.
 */
export const isWorkoutDayCompleted = (
  day: number,
  calendar?: WeeklyCalendarDay[],
  workoutId?: string
): boolean => {
  if (!calendar || calendar.length === 0) return false;

  return calendar.some((d: any) => {
    const isCompleted = d.status === 'completed' || d.completed === true;
    if (!isCompleted) return false;

    // Check sessions array if present (matches backend structure)
    if (Array.isArray(d.sessions) && d.sessions.length > 0) {
      const matchInSessions = d.sessions.some(
        (s: any) =>
          Number(s.exerciseDay) === day &&
          (!workoutId || !s.workoutId || s.workoutId === workoutId || workoutId === 'default-workout-id')
      );
      if (matchInSessions) return true;
    }

    // Check top-level exerciseDay mapped in workoutSessionService
    if (Number(d.exerciseDay) === day) {
      if (!workoutId || !d.workoutId || d.workoutId === workoutId || workoutId === 'default-workout-id') {
        return true;
      }
    }

    return false;
  });
};
