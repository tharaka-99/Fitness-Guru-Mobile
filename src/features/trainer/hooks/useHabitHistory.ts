import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDailyHabitAnalytics, logDailyHabit } from '@utils/services/habitService';
import { HabitAnalyticsPoint, HabitType, LogHabitDto } from '@utils/types/habitTypes';
import Toast from 'react-native-toast-message';

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']; // Sunday = 0
const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];
const FULL_MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export interface ProcessedDayPoint {
  dateString: string; // YYYY-MM-DD
  dayLetter: string;  // M, T, W, T, F, S, S
  dayNumber: number;  // 1 - 31
  shortDate: string;  // "5 Oct"
  fullDate: string;   // "Mon, 5 Oct 2026"
  value: number | null;
  target: number;
  unit: string;
  isLogged: boolean;
  isGoalMet: boolean;
  formattedValue: string;
}

export interface HabitHistoryStats {
  averageFormatted: string;
  averageSubtitle: string;
  latestFormatted: string;
  latestValue: number | null;
  totalFormatted: string;
  totalValue: number;
  daysLoggedFormatted: string;
  goalReachedFormatted: string;
  longestSleepFormatted?: string;
  weightChangeFormatted?: string;
  weightChangePositive?: boolean;
  insightTitle: string;
  insightSubtitle: string;
  chartMaxY: number;
  chartTicks: number[];
  targetValue: number;
  unitLabel: string;
}

export const toISODate = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const isHabitDayEditable = (dateString: string, habitType: HabitType): boolean => {
  const todayStr = toISODate(new Date());
  if (habitType === 'weight') {
    return dateString === todayStr;
  }
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = toISODate(yesterday);
  return dateString === todayStr || dateString === yesterdayStr;
};

export const useHabitHistory = (habitType: HabitType) => {
  const queryClient = useQueryClient();
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [referenceDate, setReferenceDate] = useState<Date>(() => new Date());

  // Calculate Date Boundaries
  const { startDate, endDate, daysList, rangeLabel } = useMemo(() => {
    if (period === 'week') {
      const d = new Date(referenceDate);
      const day = d.getDay();
      // Monday = 1. If Sunday (0), shift back 6 days. Else shift 1 - day.
      const diffToMonday = day === 0 ? -6 : 1 - day;
      const monday = new Date(d);
      monday.setDate(d.getDate() + diffToMonday);
      monday.setHours(0, 0, 0, 0);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      const days: Date[] = [];
      for (let i = 0; i < 7; i++) {
        const cur = new Date(monday);
        cur.setDate(monday.getDate() + i);
        days.push(cur);
      }

      const startMonth = MONTH_NAMES[monday.getMonth()];
      const endMonth = MONTH_NAMES[sunday.getMonth()];
      const year = sunday.getFullYear();

      let label = '';
      if (startMonth === endMonth) {
        label = `${monday.getDate()} – ${sunday.getDate()} ${endMonth} ${year}`;
      } else {
        label = `${monday.getDate()} ${startMonth} – ${sunday.getDate()} ${endMonth} ${year}`;
      }

      return {
        startDate: monday,
        endDate: sunday,
        daysList: days,
        rangeLabel: label,
      };
    } else {
      // Month
      const year = referenceDate.getFullYear();
      const month = referenceDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      const days: Date[] = [];
      const count = lastDay.getDate();
      for (let i = 1; i <= count; i++) {
        days.push(new Date(year, month, i));
      }

      const label = `${FULL_MONTH_NAMES[month]} ${year}`;

      return {
        startDate: firstDay,
        endDate: lastDay,
        daysList: days,
        rangeLabel: label,
      };
    }
  }, [period, referenceDate]);

  const startDateStr = useMemo(() => toISODate(startDate), [startDate]);
  const endDateStr = useMemo(() => toISODate(endDate), [endDate]);

  // Query Backend Analytics
  const { data: analyticsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['habitAnalytics', habitType, period, startDateStr, endDateStr],
    queryFn: () =>
      getDailyHabitAnalytics({
        metric: habitType,
        period,
        startDate: startDateStr,
        endDate: endDateStr,
      }),
  });

  // Navigation across time
  const goToPrevious = () => {
    setReferenceDate((prev) => {
      const nextDate = new Date(prev);
      if (period === 'week') {
        nextDate.setDate(nextDate.getDate() - 7);
      } else {
        nextDate.setMonth(nextDate.getMonth() - 1);
      }
      return nextDate;
    });
  };

  const goToNext = () => {
    setReferenceDate((prev) => {
      const nextDate = new Date(prev);
      if (period === 'week') {
        nextDate.setDate(nextDate.getDate() + 7);
      } else {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
      return nextDate;
    });
  };

  const goToToday = () => {
    setReferenceDate(new Date());
  };

  // Process data points and stats
  const { points, stats } = useMemo(() => {
    // The backend provides daily points under `days` (or fallback to `data`)
    const rawDataPoints: HabitAnalyticsPoint[] =
      (analyticsData as any)?.days ||
      (analyticsData as any)?.data?.days ||
      (analyticsData as any)?.data ||
      (Array.isArray(analyticsData) ? analyticsData : []);

    const dataByDate = new Map<string, HabitAnalyticsPoint>();
    rawDataPoints.forEach((p) => {
      if (p.date) {
        const dStr = typeof p.date === 'string' ? p.date.slice(0, 10) : '';
        if (dStr) {
          dataByDate.set(dStr, p);
        }
      }
    });

    // Default target fallback per habit, or server target if present
    let defaultTarget = 0;
    let unitLabel = '';
    if (habitType === 'steps') {
      defaultTarget = 10000;
      unitLabel = 'steps';
    } else if (habitType === 'water') {
      defaultTarget = 3.0; // Liters
      unitLabel = 'L';
    } else if (habitType === 'sleep') {
      defaultTarget = 8.0; // Hours
      unitLabel = 'Hours';
    } else if (habitType === 'weight') {
      defaultTarget = 65;
      unitLabel = 'kg';
    }

    const serverDailyTarget =
      (analyticsData as any)?.dailyTarget ?? (analyticsData as any)?.target;
    if (serverDailyTarget != null && Number(serverDailyTarget) > 0) {
      defaultTarget = Number(serverDailyTarget);
    }

    const processedPoints: ProcessedDayPoint[] = daysList.map((dayDate) => {
      const dateString = toISODate(dayDate);
      const raw = dataByDate.get(dateString);
      const dayIndex = dayDate.getDay();
      const dayLetter = DAY_LETTERS[dayIndex];
      const dayNumber = dayDate.getDate();
      const shortDate = `${dayDate.getDate()} ${MONTH_NAMES[dayDate.getMonth()]}`;
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayIndex];
      const fullDate = `${dayName}, ${dayDate.getDate()} ${MONTH_NAMES[dayDate.getMonth()]}`;

      let val: number | null = null;
      let target = raw?.target ?? defaultTarget;

      if (raw) {
        const rawVal =
          raw.value ??
          raw.steps ??
          raw.consumed ??
          raw.weight ??
          raw.amount ??
          null;
        if (rawVal != null) {
          val = Number(rawVal);
        }
      }

      // Format sleep if in minutes or hours
      if (habitType === 'sleep' && raw) {
        const totalMins =
          raw.total_minutes ??
          raw.totalMinutes ??
          (raw.hours != null
            ? Number(raw.hours) * 60 + Number(raw.minutes || 0)
            : null);
        if (totalMins != null) {
          val = Number((totalMins / 60).toFixed(1));
        } else if (raw.value != null) {
          val = Number(Number(raw.value).toFixed(1));
        }
      }

      const isLogged = val != null && !isNaN(val) && val > 0;
      let isGoalMet = false;

      if (habitType === 'weight') {
        isGoalMet = isLogged;
      } else if (habitType === 'sleep') {
        isGoalMet = isLogged && (val ?? 0) >= 8.0;
      } else {
        isGoalMet = isLogged && (val ?? 0) >= target;
      }

      let formattedValue = '';
      if (isLogged && val != null) {
        if (habitType === 'steps') {
          formattedValue = Math.round(val).toLocaleString();
        } else if (habitType === 'water') {
          formattedValue = `${val.toFixed(1)}`;
        } else if (habitType === 'sleep') {
          formattedValue = `${val}h`;
        } else if (habitType === 'weight') {
          formattedValue = `${val.toFixed(1)} kg`;
        }
      }

      return {
        dateString,
        dayLetter,
        dayNumber,
        shortDate,
        fullDate,
        value: val,
        target,
        unit: raw?.unit || unitLabel,
        isLogged,
        isGoalMet,
        formattedValue,
      };
    });

    // Compute Summary Statistics
    const loggedPoints = processedPoints.filter((p) => p.isLogged && p.value != null);
    const totalDays = processedPoints.length;
    const daysLoggedCount = loggedPoints.length;

    // Server-computed metrics if available
    const serverAchieved = (analyticsData as any)?.daysTargetAchieved;
    const goalReachedCount =
      serverAchieved != null
        ? Number(serverAchieved)
        : processedPoints.filter((p) => p.isGoalMet).length;

    const serverAvg =
      (analyticsData as any)?.averageDailySteps ??
      (analyticsData as any)?.averageDailyWater ??
      (analyticsData as any)?.averageDailySleep ??
      (analyticsData as any)?.average;
    const serverTotal =
      (analyticsData as any)?.totalSteps ??
      (analyticsData as any)?.totalWater ??
      (analyticsData as any)?.total;

    let averageFormatted = '0';
    let averageSubtitle = '';
    let latestFormatted = '--';
    let latestValue: number | null = null;
    let totalFormatted = '0';
    let totalValue = 0;
    let longestSleepFormatted: string | undefined;
    let weightChangeFormatted: string | undefined;
    let weightChangePositive: boolean | undefined;
    let insightTitle = '';
    let insightSubtitle = '';
    let chartMaxY = 10;
    let chartTicks = [0, 2, 4, 6, 8, 10];

    // Latest entry
    if (loggedPoints.length > 0) {
      const lastPoint = loggedPoints[loggedPoints.length - 1];
      latestValue = lastPoint.value;
      latestFormatted =
        habitType === 'weight'
          ? `${lastPoint.value} kg`
          : habitType === 'steps'
          ? Math.round(lastPoint.value || 0).toLocaleString()
          : habitType === 'water'
          ? `${(lastPoint.value || 0).toFixed(1)} L`
          : `${lastPoint.value}h`;
    }

    if (habitType === 'sleep') {
      const sum = loggedPoints.reduce((acc, p) => acc + (p.value || 0), 0);
      const avg =
        serverAvg != null
          ? Number(serverAvg)
          : daysLoggedCount > 0
          ? sum / daysLoggedCount
          : 0;
      const avgHrs = Math.floor(avg);
      const avgMins = Math.round((avg - avgHrs) * 60);
      averageFormatted = `${avgHrs}h ${avgMins > 0 ? `${avgMins}m` : '00m'}`;
      averageSubtitle = 'Average sleep duration';

      const maxVal = loggedPoints.reduce((max, p) => Math.max(max, p.value || 0), 0);
      const maxHrs = Math.floor(maxVal);
      const maxMins = Math.round((maxVal - maxHrs) * 60);
      longestSleepFormatted =
        maxVal > 0 ? `${maxHrs}h ${maxMins > 0 ? `${maxMins}m` : '00m'}` : '--';

      insightTitle = 'Your sleep routine';
      insightSubtitle = `You logged at least 8 hours on ${goalReachedCount} ${
        goalReachedCount === 1 ? 'night' : 'nights'
      }.`;

      chartMaxY = 10;
      chartTicks = [10, 8, 6, 4, 2, 0];
    } else if (habitType === 'weight') {
      const firstLogged = loggedPoints[0]?.value ?? null;
      const lastLogged = loggedPoints[loggedPoints.length - 1]?.value ?? null;
      let diff = 0;
      if (firstLogged != null && lastLogged != null && loggedPoints.length > 1) {
        diff = Number((lastLogged - firstLogged).toFixed(1));
      }
      weightChangeFormatted = `${diff > 0 ? '+' : ''}${diff} kg`;
      weightChangePositive = diff >= 0;

      latestFormatted = lastLogged != null ? `${lastLogged} kg` : '--';
      averageSubtitle = 'Latest entry';

      insightTitle = 'See the bigger picture';
      insightSubtitle = 'Compare your weekly averages over time.';

      // Weight chart scale
      const weights = loggedPoints.map((p) => p.value || 0).filter((v) => v > 0);
      if (weights.length > 0) {
        const minW = Math.min(...weights);
        const maxW = Math.max(...weights);
        const pad = Math.max(0.4, (maxW - minW) * 0.2);
        const top = Number((maxW + pad).toFixed(1));
        const bottom = Number((minW - pad).toFixed(1));
        chartMaxY = top;
        const step = (top - bottom) / 4;
        chartTicks = [
          top,
          Number((top - step).toFixed(1)),
          Number((top - step * 2).toFixed(1)),
          Number((top - step * 3).toFixed(1)),
          bottom,
        ];
      } else {
        chartTicks = [63.4, 63.2, 63.0, 62.8, 62.6];
        chartMaxY = 63.4;
      }
    } else if (habitType === 'water') {
      totalValue =
        serverTotal != null
          ? Number(serverTotal)
          : loggedPoints.reduce((acc, p) => acc + (p.value || 0), 0);
      totalFormatted = `${totalValue.toFixed(1)} L`;

      const avg =
        serverAvg != null
          ? Number(serverAvg)
          : daysLoggedCount > 0
          ? totalValue / daysLoggedCount
          : 0;
      averageFormatted = `${avg.toFixed(1)} L`;
      averageSubtitle = 'Average daily intake';

      insightTitle = 'Your hydration habits';
      insightSubtitle = `You reached your ${defaultTarget} L goal on ${goalReachedCount} ${
        goalReachedCount === 1 ? 'day' : 'days'
      }.`;

      const maxWater = Math.max(4, ...loggedPoints.map((p) => p.value || 0));
      chartMaxY = Math.ceil(maxWater);
      chartTicks = [4, 3, 2, 1, 0];
    } else if (habitType === 'steps') {
      totalValue =
        serverTotal != null
          ? Number(serverTotal)
          : loggedPoints.reduce((acc, p) => acc + (p.value || 0), 0);
      totalFormatted = totalValue.toLocaleString();

      const avg =
        serverAvg != null
          ? Math.round(Number(serverAvg))
          : daysLoggedCount > 0
          ? Math.round(totalValue / daysLoggedCount)
          : 0;
      averageFormatted = avg.toLocaleString();
      averageSubtitle = 'Average daily steps';

      insightTitle = 'Your weekly activity';
      insightSubtitle = `You reached ${defaultTarget.toLocaleString()} steps on ${goalReachedCount} ${
        goalReachedCount === 1 ? 'day' : 'days'
      }.`;

      const maxSteps = Math.max(15000, ...loggedPoints.map((p) => p.value || 0));
      chartMaxY = Math.ceil(maxSteps / 5000) * 5000;
      chartTicks = [chartMaxY, (chartMaxY * 2) / 3, chartMaxY / 3, 0];
    }

    const calculatedStats: HabitHistoryStats = {
      averageFormatted,
      averageSubtitle,
      latestFormatted,
      latestValue,
      totalFormatted,
      totalValue,
      daysLoggedFormatted: `${daysLoggedCount} of ${totalDays}`,
      goalReachedFormatted: `${goalReachedCount} of ${totalDays}`,
      longestSleepFormatted,
      weightChangeFormatted,
      weightChangePositive,
      insightTitle,
      insightSubtitle,
      chartMaxY,
      chartTicks,
      targetValue: defaultTarget,
      unitLabel,
    };

    return {
      points: processedPoints,
      stats: calculatedStats,
    };
  }, [analyticsData, daysList, habitType]);

  // Quick logging mutation
  const logMutation = useMutation({
    mutationFn: (dto: LogHabitDto) => logDailyHabit(dto),
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Habit Logged',
        text2: 'History and stats updated.',
      });
      queryClient.invalidateQueries({ queryKey: ['habitAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['dailyHabits'] });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'error',
        text1: 'Failed to Log',
        text2: err?.message || 'Please check your inputs and try again.',
      });
    },
  });

  return {
    period,
    setPeriod,
    rangeLabel,
    goToPrevious,
    goToNext,
    goToToday,
    points,
    stats,
    isLoading,
    isError,
    refetch,
    logHabit: logMutation.mutate,
    isLogging: logMutation.isPending,
  };
};
