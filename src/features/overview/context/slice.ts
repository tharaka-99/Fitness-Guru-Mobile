import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  ActivityLevel,
  ClientInfo,
  ExpertiseLevel,
  Goal,
  Unit,
} from '@utils/types/types';

export interface InitialState {
  profile: ClientInfo;
  isInjered: boolean;
}

export const initialState: InitialState = {
  profile: {
    fitnessInfo: {
      activityLevel: undefined,
      expertiseLevel: undefined,
      goal: undefined,
    },
    personalInfo: { age: 0, height: 0, unit: Unit.Imperial, weight: 0 },
    isInjured: false
  },
  isInjered: false,
};

export const overviewSlice = createSlice({
  name: 'feature/overview',
  initialState,
  reducers: {
    setProfile(state, action: PayloadAction<ClientInfo>) {
      state.profile = action.payload;
    },
    setIsInjered(state, action: PayloadAction<boolean>) {
      state.isInjered = action.payload;
    },
  },
});

export const { actions: overviewActions } = overviewSlice;
