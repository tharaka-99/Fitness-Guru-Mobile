import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '@/store';
import { initialState } from './slice';

const selectDomain = (state: RootState) =>
  state['feature/auth'] || initialState;

export const selectAuthTokens = createSelector(
  [selectDomain],
  (state) => state.tokens
);

export const selectUser = createSelector([selectDomain], (state) => state.user);
