import api from "@utils/http/request";
import {
  CreateLogSetDto,
  LastWeekAnalytics,
  LogEntryDto,
  WeeklyCalendarDay,
  WeeklyProgressData,
} from "@utils/types/analyticsTypes";
import axios from "axios";

import {
  getLocalTimezoneOffsetMinutes,
  getWorkoutWeekCalendar,
} from "./workoutSessionService";

export const logWorkout = async (data: CreateLogSetDto): Promise<any> => {
  try {
    const response = await api.post("/log-workout", {
      timezoneOffsetMinutes: getLocalTimezoneOffsetMinutes(),
      ...data,
    });

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const errorMessage =
          error.response.data?.message ||
          "An error occurred while logging the workout.";
        console.error("Error response data:", error.response.data);
        throw new Error(errorMessage);
      } else if (error.request) {
        console.error("Error request:", error.request);
        throw new Error("No response received from the server.");
      } else {
        console.error("Error message:", error.message);
        throw new Error(`Error: ${error.message}`);
      }
    }
    throw error;
  }
};

export const getLogHistoryByWorkoutDayExercise = async (
  exerciseId: string,
  workoutId: string,
  exerciseDay: number
): Promise<LogEntryDto[]> => {
  try {
    const response = await api.get(
      `/log-workout/log-history-by-workout-day-exercise`,
      {
        params: {
          exerciseId,
          workoutId,
          exerciseDay,
        },
      }
    );
    return response?.data?.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const errorMessage =
          error.response.data?.message ||
          "An error occurred while logging the workout.";
        console.error("Error response data:", error.response.data);
        throw new Error(errorMessage);
      } else if (error.request) {
        console.error("Error request:", error.request);
        throw new Error("No response received from the server.");
      } else {
        console.error("Error message:", error.message);
        throw new Error(`Error: ${error.message}`);
      }
    }
    throw error;
  }
};

export const getLogHistoryByExerciseId = async (
  exerciseId: string
): Promise<LogEntryDto[]> => {
  try {
    const response = await api.get(
      `/log-workout/log-history-by-workout-day-exercise`,
      {
        params: {
          exerciseId,
        },
      }
    );
    return response?.data?.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const errorMessage =
          error.response.data?.message ||
          "An error occurred while logging the workout.";
        console.error("Error response data:", error.response.data);
        throw new Error(errorMessage);
      } else if (error.request) {
        console.error("Error request:", error.request);
        throw new Error("No response received from the server.");
      } else {
        console.error("Error message:", error.message);
        throw new Error(`Error: ${error.message}`);
      }
    }
    throw error;
  }
};

export const getLastWeekAnalyticsByWorkoutDayExercise = async (
  exerciseId: string,
  workoutId: string,
  exerciseDay: number
): Promise<LastWeekAnalytics> => {
  try {
    const response = await api.get(
      `/log-workout/last-week-analytics-by-workout-day-exercise`,
      {
        params: {
          exerciseId,
          workoutId,
          exerciseDay,
        },
      }
    );
    return response?.data?.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const errorMessage =
          error.response.data?.message ||
          "An error occurred while logging the workout.";
        console.error("Error response data:", error.response.data);
        throw new Error(errorMessage);
      } else if (error.request) {
        console.error("Error request:", error.request);
        throw new Error("No response received from the server.");
      } else {
        console.error("Error message:", error.message);
        throw new Error(`Error: ${error.message}`);
      }
    }
    throw error;
  }
};

export const getLastWeekAnalyticsByExerciseId = async (
  exerciseId: string
): Promise<LastWeekAnalytics> => {
  try {
    const response = await api.get(
      `/log-workout/last-week-analytics-by-workout-day-exercise`,
      {
        params: {
          exerciseId,
        },
      }
    );
    return response?.data?.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const errorMessage =
          error.response.data?.message ||
          "An error occurred while logging the workout.";
        console.error("Error response data:", error.response.data);
        throw new Error(errorMessage);
      } else if (error.request) {
        console.error("Error request:", error.request);
        throw new Error("No response received from the server.");
      } else {
        console.error("Error message:", error.message);
        throw new Error(`Error: ${error.message}`);
      }
    }
    throw error;
  }
};

import { getClientWorkoutsForTrainerView } from "./workoutService";

const getWeeklyData = async (workoutParam?: any) => {
  // 1. Fetch current workout routine for targets if not supplied
  let workout = workoutParam;
  if (!workout) {
    try {
      const workouts = await getClientWorkoutsForTrainerView();
      workout = workouts.find((w) => w.type === "FitnessGuruCreated") || workouts?.[0];
    } catch (err) {
      console.warn("Error fetching workout for weekly targets:", err);
    }
  }

  // 2. Fetch authoritative week calendar & sessions from backend in 1 call
  const serverCalendar = await getWorkoutWeekCalendar();

  // 3. Compute targets from the workout routine
  let targetDays = 0;
  let targetExercises = 0;
  let targetSets = 0;

  if (workout && workout.exerciseDays) {
    targetDays = workout.exerciseDays.length;
    let totalExercises = 0;

    workout.exerciseDays.forEach((day: any) => {
      totalExercises += day.exercises?.length || 0;
      day.exercises?.forEach((ex: any) => {
        targetSets += ex.sets || 0;
      });
    });

    targetExercises = totalExercises;
  }

  // 4. Compute current counts directly from the week calendar & sessions
  let currentSets = 0;
  let currentExercises = 0;
  let completedDaysCount = 0;

  serverCalendar.forEach((day) => {
    if (day.status === "completed" || day.completed === true) {
      completedDaysCount++;
    }

    if (Array.isArray(day.sessions)) {
      day.sessions.forEach((session: any) => {
        if (session.summary?.setsLogged != null) {
          currentSets += Number(session.summary.setsLogged);
        } else if (Array.isArray(session.exercises)) {
          session.exercises.forEach((ex: any) => {
            currentSets += Number(ex.loggedSets || 0);
          });
        }

        if (session.summary?.exercisesLogged != null) {
          currentExercises += Number(session.summary.exercisesLogged);
        } else if (Array.isArray(session.exercises)) {
          const loggedCount = session.exercises.filter(
            (ex: any) => (ex.loggedSets ?? 0) > 0 || ex.isLogged
          ).length;
          currentExercises += (loggedCount > 0 ? loggedCount : session.exercises.length);
        }
      });
    }
  });

  const progress: WeeklyProgressData = {
    sets: { current: currentSets, target: targetSets },
    days: { current: completedDaysCount, target: targetDays },
    exercises: { current: currentExercises, target: targetExercises },
  };

  return { progress, calendar: serverCalendar };
};

export interface WeeklyOverviewData {
  progress: WeeklyProgressData;
  calendar: WeeklyCalendarDay[];
}

export const getWeeklyOverview = async (workoutParam?: any): Promise<WeeklyOverviewData> => {
  return getWeeklyData(workoutParam);
};

export const getWeeklyCalendarStatus = async (): Promise<WeeklyCalendarDay[]> => {
  const data = await getWeeklyOverview();
  return data.calendar;
};

export const getWeeklyProgress = async (): Promise<WeeklyProgressData> => {
  const data = await getWeeklyOverview();
  return data.progress;
};
