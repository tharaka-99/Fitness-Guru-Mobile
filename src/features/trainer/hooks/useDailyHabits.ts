import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDailyHabits, getLocalDateString, logDailyHabit } from '@utils/services/habitService';
import { HabitData, LogHabitDto } from '@utils/types/habitTypes';
import { capitalizeString } from '@utils/helpers';
import Toast from 'react-native-toast-message';

export const useDailyHabits = (date?: string) => {
  const queryClient = useQueryClient();
  const targetDate = date || getLocalDateString();

  const habitsQuery = useQuery({
    queryKey: ['dailyHabits', targetDate],
    queryFn: () => getDailyHabits(targetDate),
  });

  const logHabitMutation = useMutation({
    mutationFn: (data: LogHabitDto) => logDailyHabit(data),
    onMutate: async (newHabit: LogHabitDto) => {
      // 1. Cancel any outgoing refetches for this day
      await queryClient.cancelQueries({ queryKey: ['dailyHabits', targetDate] });

      // 2. Snapshot previous cache
      const previousHabits = queryClient.getQueryData<HabitData[]>(['dailyHabits', targetDate]);

      // 3. Optimistically update UI in realtime immediately
      queryClient.setQueryData<HabitData[]>(['dailyHabits', targetDate], (oldHabits) => {
        if (!oldHabits) return oldHabits;

        return oldHabits.map((habit) => {
          if (habit.type !== newHabit.type) return habit;

          if (newHabit.type === 'weight') {
            const unit = newHabit.unit || 'kg';
            return {
              ...habit,
              logged: true,
              currentValue: newHabit.value,
              unit: unit === 'lbs' ? 'lbs' : 'Kg',
              formattedValue: `${newHabit.value} ${unit}`,
              progress: 1,
              lastUpdated: new Date().toISOString(),
              details: { weightUnit: unit },
            };
          }

          if (newHabit.type === 'steps') {
            const target = habit.targetValue || 10000;
            return {
              ...habit,
              logged: true,
              currentValue: newHabit.steps,
              formattedValue: newHabit.steps.toLocaleString(),
              progress: target > 0 ? Math.min(1, newHabit.steps / target) : 0,
              lastUpdated: new Date().toISOString(),
            };
          }

          if (newHabit.type === 'water') {
            const target = habit.targetValue;
            return {
              ...habit,
              logged: true,
              currentValue: newHabit.consumed,
              formattedValue: `${newHabit.consumed} L`,
              progress: target && target > 0 ? Math.min(1, newHabit.consumed / target) : 0,
              lastUpdated: new Date().toISOString(),
            };
          }

          if (newHabit.type === 'sleep') {
            const totalMins = newHabit.hours * 60 + newHabit.minutes;
            const targetMins = (habit.targetValue || 8) * 60;
            return {
              ...habit,
              logged: true,
              currentValue: Number((totalMins / 60).toFixed(1)),
              formattedValue: `${newHabit.hours}h ${newHabit.minutes > 0 ? `${newHabit.minutes}m` : '00m'}`,
              progress: targetMins > 0 ? Math.min(1, totalMins / targetMins) : 0,
              lastUpdated: new Date().toISOString(),
              details: {
                sleepHours: newHabit.hours,
                sleepMinutes: newHabit.minutes,
              },
            };
          }

          return habit;
        });
      });

      return { previousHabits };
    },
    onError: (error: any, _variables, context) => {
      // Rollback to previous cache state on failure
      if (context?.previousHabits) {
        queryClient.setQueryData(['dailyHabits', targetDate], context.previousHabits);
      }
      Toast.show({
        type: 'error',
        text1: 'Could Not Log Habit',
        text2: error?.message || 'Please check your inputs and try again.',
      });
    },
    onSuccess: (_data, variables) => {
      const habitLabel = capitalizeString(variables.type);
      Toast.show({
        type: 'success',
        text1: `${habitLabel} Logged`,
        text2: 'Your daily habits have been updated.',
      });
    },
    onSettled: () => {
      // Re-fetch to ensure sync with server state
      queryClient.invalidateQueries({ queryKey: ['dailyHabits'] });
      queryClient.invalidateQueries({ queryKey: ['weeklyOverview'] });
    },
  });

  return {
    ...habitsQuery,
    logHabit: logHabitMutation.mutate,
    logHabitAsync: logHabitMutation.mutateAsync,
    isLogging: logHabitMutation.isPending,
  };
};
