import api from "@utils/http/request";
import {
  CreateLogSetDto,
  LastWeekAnalytics,
  LogResponseDto,
} from "@utils/types/analyticsTypes";
import axios from "axios";

export const logWorkout = async (data: CreateLogSetDto): Promise<any> => {
  try {
    const response = await api.post("/log-workout", {
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
): Promise<LogResponseDto[]> => {
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
): Promise<LogResponseDto[]> => {
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
