import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '@/store';
import { initialState } from './slice';

const selectDomain = (state: RootState) =>
  state['feature/overview'] || initialState;

export const selectUser = createSelector(
  [selectDomain],
  (state) => state.profile
);
