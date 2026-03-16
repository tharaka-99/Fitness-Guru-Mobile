import api from '@utils/http/request';
import {
  CreateMealPlanDto,
  MealItem,
  MealPlan,
} from '@utils/types/mealPlanTypes';

//
export const getMealItems = async (): Promise<MealItem[]> => {
  try {
    const response = await api.get('/meal-plan/meal-items');
    return response.data.data;
  } catch (error) {
    throw error;
  }
};
//
export const getMealPlan = async (): Promise<MealPlan[]> => {
  try {
    const response = await api.get('/meal-plan');
    return response.data.data;
  } catch (error) {
    throw error;
  }
};
//
export const createMealPlan = async (
  mealPlan: CreateMealPlanDto
): Promise<MealPlan> => {
  try {

    const response = await api.post('/meal-plan', mealPlan);
    return response.data.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
//
export const updateMealPlan = async (
  id: string,
  mealPlan: CreateMealPlanDto
): Promise<MealPlan> => {
  try {
    const response = await api.put(`/meal-plan/${id}`, mealPlan);

    return response.data.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
//
export const getCurrentMealPlan = async (): Promise<MealPlan[]> => {
  try {
    const response = await api.get('/meal-plan');

    return response.data.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
//
export const getClientMealForTrainerView = async (): Promise<MealPlan[]> => {
  try {
    const response = await api.get('/meal-plan');
    return response.data.data;
  } catch (error) {
    throw error;
  }
};
