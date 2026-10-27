import api from '@utils/http/request';
import {
  CreateMealPlanDto,
  MealItem,
  MealItemID,
  MealPlan,
  MealPlanNutrition,
} from '@utils/types/mealPlanTypes';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Calculates nutritional breakdown for a meal plan following Fitness Guru Calorie Bar Logic:
 * Step 1: Calculate total macronutrients:
 *   Item nutrient total = Nutrient value from DB * (Assigned quantity / Unit amount)
 *   Sum across all items to get total Carbs (g), Fats (g), and Protein (g).
 * Step 2: Convert macronutrients to calories:
 *   Carbs Calories = Total Carbs (g) * 4
 *   Fats Calories = Total Fats (g) * 9
 *   Protein Calories = Total Protein (g) * 4
 * Step 3: Calculate total calories:
 *   Total Calories = Carbs Calories + Fats Calories + Protein Calories
 * Step 4: Divide the calorie bar:
 *   Carbs % = (Carbs Calories / Total Calories) * 100
 *   Fats % = (Fats Calories / Total Calories) * 100
 *   Protein % = (Protein Calories / Total Calories) * 100
 */
export const calculateMealItemsNutrition = (
  items?: MealItem[] | null
): MealPlanNutrition => {
  if (!items) {
    return {
      totalCalories: 0,
      totalCarbs: 0,
      totalFats: 0,
      totalProtein: 0,
      carbsCalories: 0,
      fatsCalories: 0,
      proteinCalories: 0,
      carbsPercent: 0,
      fatsPercent: 0,
      proteinPercent: 0,
    };
  }

  let totalCarbs = 0;
  let totalFats = 0;
  let totalProtein = 0;

  items.forEach((item) => {
    if (!item) return;

    const mealItemId =
      typeof item.mealItemId === 'object' && item.mealItemId !== null
        ? item.mealItemId
        : (item as unknown as MealItemID);

    const count = Number(item.count) || 0;
    const rawUnitAmount = Number(mealItemId?.unitAmount);
    const unitAmount = rawUnitAmount > 0 ? rawUnitAmount : 100;
    const multiplier = count / unitAmount;

    const carbs = (Number(mealItemId?.carbs) || 0) * multiplier;
    const fats = (Number(mealItemId?.fats) || 0) * multiplier;
    const protein = (Number(mealItemId?.protein) || 0) * multiplier;

    totalCarbs += carbs;
    totalFats += fats;
    totalProtein += protein;
  });

  const carbsCalories = totalCarbs * 4;
  const fatsCalories = totalFats * 9;
  const proteinCalories = totalProtein * 4;

  const totalCalories = carbsCalories + fatsCalories + proteinCalories;

  let carbsPercent = 0;
  let fatsPercent = 0;
  let proteinPercent = 0;

  if (totalCalories > 0) {
    carbsPercent = (carbsCalories / totalCalories) * 100;
    fatsPercent = (fatsCalories / totalCalories) * 100;
    proteinPercent = (proteinCalories / totalCalories) * 100;
  }

  return {
    totalCalories,
    totalCarbs,
    totalFats,
    totalProtein,
    carbsCalories,
    fatsCalories,
    proteinCalories,
    carbsPercent,
    fatsPercent,
    proteinPercent,
  };
};

export const calculateMealPlanNutrition = (
  mealPlan?: MealPlan | null
): MealPlanNutrition => {
  if (!mealPlan) {
    return calculateMealItemsNutrition([]);
  }

  const allItems: MealItem[] = [
    ...(mealPlan.breakfast || []),
    ...(mealPlan.lunch || []),
    ...(mealPlan.dinner || []),
    ...(mealPlan.snack || []),
  ];

  return calculateMealItemsNutrition(allItems);
};


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
): Promise<ApiResponse<MealPlan>> => {
  try {

    const response = await api.post('/meal-plan', mealPlan);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
//
export const updateMealPlan = async (
  id: string,
  mealPlan: CreateMealPlanDto
): Promise<ApiResponse<MealPlan>> => {
  try {
    const response = await api.put(`/meal-plan/${id}`, mealPlan);

    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
//
// export const getCurrentMealPlan = async (): Promise<MealPlan[]> => {
//   try {
//     const response = await api.get('/meal-plan');

//     return response.data.data;
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// };
// //
// export const getClientMealForTrainerView = async (): Promise<MealPlan[]> => {
//   try {
//     const response = await api.get('/meal-plan');
//     return response.data.data;
//   } catch (error) {
//     throw error;
//   }
// };
