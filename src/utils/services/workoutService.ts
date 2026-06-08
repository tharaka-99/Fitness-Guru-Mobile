import api from '@utils/http/request';
import { DefaultWorkout, SearchExercises, Workout } from '@utils/types/types';

//
export const getClientWorkouts = async (): Promise<Workout[]> => {
  try {
    const response = await api.get('/workout');
    return response.data.data;
  } catch (error) {
    throw error;
  }
};
//
export const getClientDefaultWorkouts = async (): Promise<DefaultWorkout[]> => {
  try {
    const response = await api.get('/workout/default-workouts');

    return response.data.data;
  } catch (error) {
    throw error;
  }
};
//
export const getExercises = async (): Promise<SearchExercises[]> => {
  try {
    const response = await api.get('/workout/exercises');
    return response.data.data;
  } catch (error) {
    throw error;
  }
};
//
export const createWorkout = async (workoutList: Workout): Promise<Workout> => {
  try {
    const response = await api.post('/workout', workoutList);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};
//
export const getCurrentWorkout = async (): Promise<Workout[]> => {
  try {
    const response = await api.get('/workout');
    return response.data.data;
  } catch (error) {
    throw error;
  }
};
//
export const updateWorkout = async (
  id: string,
  workoutList: Workout
): Promise<Workout> => {
  try {
    const response = await api.put(`/workout/${id}`, workoutList);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};
//
export const getClientWorkoutsForTrainerView = async (): Promise<Workout[]> => {
  try {
    const response = await api.get('/workout');
    return response.data.data;
  } catch (error) {
    throw error;
  }
};
