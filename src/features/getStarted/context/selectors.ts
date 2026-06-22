import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '@/store';
import { initialState } from './slice';

const selectDomain = (state: RootState) =>
  state['feature/getStarted'] || initialState;

export const selectHasSeenGetStarted = createSelector(
  [selectDomain],
  (state) => state.hasSeenGetStarted
);
