import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  ActivityLevel,
  CalculatedMetrics,
  ExpertiseLevel,
  FitnessInfo,
  Goal,
  PersonalInfo,
  Unit,
} from "@utils/types/types";

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export type IUser = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  city: string;
  gender: string;
  role: string;
  calculatedMetrics: CalculatedMetrics;
  createdAt: string;
  updatedAt: string;
  __v: number;
  subscription: {
    status: Status;
  };
  profileImageFileUrl?: string;
  personalInfo: PersonalInfo;
  fitnessInfo: FitnessInfo;
  isInjured: boolean;
  isTrialActive?: boolean;
};

export type Status = true | false;

export interface InitialState {
  tokens: IAuthTokens;
  user: IUser | null;
}

export const initialState: InitialState = {
  tokens: {
    accessToken: "",
    refreshToken: "",
  },
  user: {
    _id: "",
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    city: "",
    gender: "",
    role: "",
    calculatedMetrics: { bmr: 0, dci: 0 },
    createdAt: "",
    updatedAt: "",
    __v: 0,
    subscription: {
      status: false,
    },
    profileImageFileUrl: "",
    personalInfo: { age: 0, height: 0, unit: Unit.Imperial, weight: 0 },
    fitnessInfo: {
      activityLevel: undefined,
      expertiseLevel: undefined,
      goal: undefined,
    },
    isInjured: false,
    isTrialActive: false,
  },
};

export const authSlice = createSlice({
  name: "feature/auth",
  initialState,
  reducers: {
    setAuthTokens(state, action: PayloadAction<IAuthTokens>) {
      state.tokens.accessToken = action.payload.accessToken;
      state.tokens.refreshToken = action.payload.refreshToken;
    },
    setUser(state, action: PayloadAction<IUser>) {
      state.user = action.payload;
    },
    clearAuth(state) {
      state.tokens.accessToken = "";
      state.tokens.refreshToken = "";
      state.user = null;
    },
    setSubscription(state, action: PayloadAction<any>) {
      if (state.user) {
        state.user.subscription = action.payload;
      }
    },
    setClientInfo(state, action: PayloadAction<any>) {
      if (state.user) {
        state.user.personalInfo = action.payload.personalInfo;
        state.user.fitnessInfo = action.payload.fitnessInfo;
        state.user.isInjured = action.payload.isInjured;
        state.user.calculatedMetrics = action.payload.calculatedMetrics;
      }
    },
    setProfileImage(state, action: PayloadAction<any>) {
      if (state.user) {
        state.user.profileImageFileUrl = action.payload;
      }
    },
    setBmrAndDci(state, action: PayloadAction<any>) {
      if (state.user) {
        state.user.calculatedMetrics = action.payload.calculatedMetrics;
      }
    },
    setIsInjured(state, action: PayloadAction<boolean>) {
      if (state.user) {
        state.user.isInjured = action.payload;
      }
    },
    setTrialStatus(state, action: PayloadAction<boolean>) {
      if (state.user) {
        state.user.isTrialActive = action.payload;
      }
    },
  },
});

export const { actions: authActions } = authSlice;
