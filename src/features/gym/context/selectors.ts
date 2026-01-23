import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '@/store';
import { initialState } from './slice';

const selectDomain = (state: RootState) => state['feature/gym'] || initialState;

export const setWorkouts = createSelector(
  [selectDomain],
  (state) => state.workouts
);

export const setDefaultsWorkouts = createSelector(
  [selectDomain],
  (state) => state.defaultWorkouts
);

export const setSelectedDay = createSelector(
  [selectDomain],
  (state) => state.selectedDay
);

export const setSelectedWorkout = createSelector(
  [selectDomain],
  (state) => state.selectedWorkout
);
