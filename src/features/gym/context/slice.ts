import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  CreateMealPlanDto,
  CurrentMealItemDto,
  MealItem,
  MealItemDto,
  MealPlanType,
  MealType,
} from "@utils/types/mealPlanTypes";
import {
  DefaultExercise,
  DefaultWorkout,
  Exercises,
  SelectedWorkout,
  Workout,
  WorkoutType,
} from "@utils/types/types";

export interface InitialState {
  workouts: Workout[];
  defaultWorkouts: DefaultWorkout[];
  selectedDay: number;
  selectedWorkout: SelectedWorkout;
  selectedWorkoutId: string;
  days: Workout;
  selectedGeneralDay: number;
  selectedExercise: Exercises;
  //
  selectedMealType: MealType;
  selectedMealPlanType: MealPlanType;
  selectedMealPlan: MealItem[];
  mealDetails: CreateMealPlanDto;
  totalCalories: number;
  breakfastCalories: number;
  lunchCalories: number;
  snackCalories: number;
  dinnerCalories: number;
  caloryRequirements: {
    perMealRequirement: number;
    perMealLowerLimit: number;
    perMealUpperLimit: number;
    totalLowerLimit: number;
    totalUpperLimit: number;
  };
}

export const initialState: InitialState = {
  workouts: [],
  defaultWorkouts: [],
  selectedDay: 1,
  selectedGeneralDay: 1,
  selectedWorkout: { WorkoutType: WorkoutType.SelfCreated, createdBy: "" },
  selectedWorkoutId: "",
  days: {
    type: WorkoutType.SelfCreated,
    exerciseDays: [],
    createdBy: "",
  },
  selectedExercise: {
    exercise: { _id: "", name: "" },
    order: 0,
    reps: 0,
    rest: 0,
    sets: 0,
    _id: "",
    description: "",
    url: "",
  },
  //
  selectedMealType: MealType.Breakfast,
  selectedMealPlanType: MealPlanType.SelfCreated,
  selectedMealPlan: [],
  mealDetails: {
    breakfast: [],
    lunch: [],
    snack: [],
    dinner: [],
  },
  totalCalories: 0,
  breakfastCalories: 0,
  lunchCalories: 0,
  snackCalories: 0,
  dinnerCalories: 0,
  caloryRequirements: {
    perMealRequirement: 0,
    perMealLowerLimit: 200,
    perMealUpperLimit: 500,
    totalLowerLimit: 1000,
    totalUpperLimit: 3000,
  },
};

export const gymSlice = createSlice({
  name: "feature/gym",
  initialState,
  reducers: {
    //NOTE: workout reducers
    setWorkouts(state, action: PayloadAction<any>) {
      state.workouts = action.payload;
    },
    setDefaultWorkouts(state, action: PayloadAction<any>) {
      state.defaultWorkouts = action.payload;
    },
    setSelectedDay(state, action: PayloadAction<number>) {
      state.selectedDay = action.payload;
    },
    setSelectedGeneralDay(state, action: PayloadAction<number>) {
      state.selectedGeneralDay = action.payload;
    },
    setSelectedWorkout(state, action: PayloadAction<SelectedWorkout>) {
      state.selectedWorkout = action.payload;
    },
    setSelectedWorkoutID(state, action: PayloadAction<string>) {
      state.selectedWorkoutId = action.payload;
    },
    setSelectedExercise(state, action: PayloadAction<Exercises>) {
      state.selectedExercise = action.payload;
    },
    addDay(state) {
      const dayNumber = state.days.exerciseDays.length + 1;
      state.days.exerciseDays.push({
        day: dayNumber,
        exercises: [],
      });
    },
    removeDay(state, action: PayloadAction<number>) {
      const dayToRemove = action.payload;
      state.days.exerciseDays = state.days.exerciseDays.filter(
        (exerciseDay) => exerciseDay.day !== dayToRemove
      );

      // Reorder the remaining days
      state.days.exerciseDays.forEach((exerciseDay, index) => {
        exerciseDay.day = index + 1;
      });
    },
    addExerciseToDay(
      state,
      action: PayloadAction<{ day: number; exercise: Exercises }>
    ) {
      const { day, exercise } = action.payload;
      const exerciseDay = state.days.exerciseDays.find(
        (exerciseDay) => exerciseDay.day === day
      );

      if (exerciseDay) {
        const isExerciseAlreadyAdded = exerciseDay.exercises.some(
          (existingExercise) =>
            existingExercise.exercise._id === exercise.exercise._id
        );

        if (!isExerciseAlreadyAdded) {
          exerciseDay.exercises.push(exercise);
        }
      } else {
        state.days.exerciseDays.push({
          day: day,
          exercises: [exercise],
        });
      }
    },
    removeExerciseFromDay(
      state,
      action: PayloadAction<{ day: number; exerciseIndex: number }>
    ) {
      const { day, exerciseIndex } = action.payload;
      const exerciseDay = state.days.exerciseDays.find(
        (exerciseDay) => exerciseDay.day === day
      );

      if (exerciseDay) {
        exerciseDay.exercises.splice(exerciseIndex, 1);

        // Reorder the exercises based on their order property
        exerciseDay.exercises.forEach((exercise, index) => {
          exercise.order = index + 1;
        });
      }
    },
    updateExercisesOrder(
      state,
      action: PayloadAction<{ day: number; exercises: any }>
    ) {
      const { day, exercises } = action.payload;
      const exerciseDay = state.days.exerciseDays.find(
        (exerciseDay) => exerciseDay.day === day
      );

      if (exerciseDay) {
        exerciseDay.exercises = exercises;

        // Ensure the exercises are correctly ordered
        exerciseDay.exercises.forEach((exercise, index) => {
          exercise.order = index + 1;
        });
      }
    },
    resetWorkouts(state) {
      state.days = initialState.days;
    },
    //NOTE: meal plan reducers
    setSelectedMealType(state, action: PayloadAction<MealType>) {
      state.selectedMealType = action.payload;
    },
    setSelectedMealPlanType(state, action: PayloadAction<MealPlanType>) {
      state.selectedMealPlanType = action.payload;
    },
    setselectedMealPlanType(state, action: PayloadAction<MealItem[]>) {
      state.selectedMealPlan = action.payload;
    },
    updateMealFood(state, action: PayloadAction<MealItemDto>) {
      const { calPerUnit, count, mealItemId, unitAmount } = action.payload;

      const mealArray = state.mealDetails[state.selectedMealType];
      const index = mealArray.findIndex(
        (item) => item.mealItemId === mealItemId
      );

      if (count > 0) {
        // Update count if item exists, or add new item if it doesn't
        if (index !== -1) {
          mealArray[index].count = count;
        } else {
          mealArray.push({ calPerUnit, count, mealItemId });
        }
      } else if (index !== -1) {
        // Remove item from array if count is 0 or less
        mealArray.splice(index, 1);
      }

      // Recalculate calories for the selected meal type
      let calories = 0;
      for (const item of mealArray) {
        const availableCalPerUnit = item.calPerUnit ?? 1;
        calories +=
          (item.count * availableCalPerUnit) / (unitAmount ? unitAmount : 100);
      }
      state[`${state.selectedMealType}Calories`] = calories;

      // Recalculate total calories
      state.totalCalories =
        state.breakfastCalories +
        state.lunchCalories +
        state.snackCalories +
        state.dinnerCalories;
    },
    updateCurrentMealFood(state, action: PayloadAction<CurrentMealItemDto>) {
      const { calPerUnit, count, mealItemId, mealType, unitAmount } =
        action.payload;

      const mealArray = state.mealDetails[mealType];
      const index = mealArray.findIndex(
        (item) => item.mealItemId === mealItemId
      );

      if (count > 0) {
        // Update count if item exists, or add new item if it doesn't
        if (index !== -1) {
          mealArray[index].count = count;
        } else {
          mealArray.push({ calPerUnit, count, mealItemId });
        }
      } else if (index !== -1) {
        // Remove item from array if count is 0 or less
        mealArray.splice(index, 1);
      }

      // Recalculate calories for the selected meal type
      let calories = 0;
      for (const item of mealArray) {
        const availableCalPerUnit = item.calPerUnit ?? 1;
        calories +=
          (item.count / (item.unitAmount ? item.unitAmount : 100)) *
          availableCalPerUnit;
      }
      state[`${mealType}Calories`] = calories;

      // Recalculate total calories
      state.totalCalories =
        state.breakfastCalories +
        state.lunchCalories +
        state.snackCalories +
        state.dinnerCalories;
    },

    removeMealFood(state, action: PayloadAction<{ id: string }>) {
      const { id } = action.payload;
      const mealArray = state.mealDetails[state.selectedMealType];
      const index = mealArray.findIndex((item) => item.mealItemId === id);
      if (index === -1) return;
      mealArray.splice(index, 1);

      let calories = 0;
      for (const item of mealArray) {
        let availableCalPerUnit = item.calPerUnit ? item.calPerUnit : 1;
        calories += item.count * availableCalPerUnit;
      }
      state[`${state.selectedMealType}Calories`] = calories;
      state.totalCalories =
        state.breakfastCalories +
        state.lunchCalories +
        state.snackCalories +
        state.dinnerCalories;
    },
    updateCaloriesRequirenment(state, action) {
      const { perMealRequirement, perMealLowerLimit, perMealUpperLimit } =
        action.payload;

      state.caloryRequirements.perMealRequirement = perMealRequirement;
      state.caloryRequirements.perMealLowerLimit = perMealLowerLimit;
      state.caloryRequirements.perMealUpperLimit = perMealUpperLimit;

      state.caloryRequirements.totalLowerLimit = perMealLowerLimit;
      state.caloryRequirements.totalUpperLimit = perMealUpperLimit;
    },
    resetMeals(state) {
      state.mealDetails = {
        breakfast: [],
        lunch: [],
        snack: [],
        dinner: [],
      };
      state.totalCalories = 0;
      state.breakfastCalories = 0;
      state.lunchCalories = 0;
      state.snackCalories = 0;
      state.dinnerCalories = 0;
      (state.selectedMealType = MealType.Breakfast),
        (state.selectedMealPlanType = MealPlanType.SelfCreated),
        (state.selectedMealPlan = []);
    },
  },
});

export const { actions: gymActions } = gymSlice;
