import { createSlice } from '@reduxjs/toolkit';

export interface GetStartedState {
  hasSeenGetStarted: boolean;
}

export const initialState: GetStartedState = {
  hasSeenGetStarted: false,
};

export const getStartedSlice = createSlice({
  name: 'feature/getStarted',
  initialState,
  reducers: {
    markGetStartedSeen(state) {
      state.hasSeenGetStarted = true;
    },
  },
});

export const { actions: getStartedActions } = getStartedSlice;
