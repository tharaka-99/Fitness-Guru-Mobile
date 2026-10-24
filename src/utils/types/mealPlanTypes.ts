export enum MealType {
  Breakfast = "breakfast",
  Lunch = "lunch",
  Snack = "snack",
  Dinner = "dinner",
}
//
export enum MealPlanType {
  SelfCreated = "SelfCreated",
  TrainerCreated = "TrainerCreated",
  FitnessGuruCreated = "FitnessGuruCreated",
}
//
export interface MealItemDto {
  mealItemId: string;
  count: number;
  calPerUnit?: number;
  unitAmount?: number;
}
//
export interface CurrentMealItemDto {
  mealItemId: string;
  count: number;
  calPerUnit?: number;
  mealType: MealType;
  unitAmount?: number;
}
//
export interface CreateMealPlanDto {
  breakfast: MealItemDto[];
  lunch: MealItemDto[];
  snack: MealItemDto[];
  dinner: MealItemDto[];
}
//
export interface MealItem {
  _id?: string;
  count: number;
  mealItemId: MealItemID | null;
  name?: string;
  unit?: string;
  calPerUnit?: number;
  unitAmount?: number;
  selected?: boolean;
  url?: string;
}
//
export interface MealPlan {
  _id?: string;
  clientId: string;
  type: MealPlanType;
  breakfast: MealItem[];
  lunch: MealItem[];
  snack: MealItem[];
  dinner: MealItem[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}
//
export interface MealItemID {
  _id?: string;
  name: string;
  unit: string;
  calPerUnit: number;
  unitAmount: number;
  carbs?: number;
  protein?: number;
  fats?: number;
  selected?: boolean;
  url?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MealPlanNutrition {
  totalCalories: number;
  totalCarbs: number;
  totalFats: number;
  totalProtein: number;
  carbsCalories: number;
  fatsCalories: number;
  proteinCalories: number;
  carbsPercent: number;
  fatsPercent: number;
  proteinPercent: number;
}

