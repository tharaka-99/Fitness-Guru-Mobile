import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Role, Trainer, TrainingFor } from "@utils/types/trainersTypes";
export interface InitialState {
  trainer: Trainer;
  pendingApplication: any;
}

export const initialState: InitialState = {
  trainer: {
    _id: "",
    address: "",
    email: "",
    firstName: "",
    lastName: "",
    mobileNumber: "",
    role: Role.Trainer,
    trainingFor: TrainingFor.Men,
    yearsOfExperience: 1,
    image: "",
    certificationFileKey: "",
    certificationFileUrl: "",
    clientIds: [],
    portfolioFileData: [],
  },
};

export const trainerSlice = createSlice({
  name: "feature/trainer",
  initialState,
  reducers: {
    setSelectedTrainer(state, action: PayloadAction<Trainer>) {
      state.trainer = action.payload;
    },
    setPendingApplication(state, action: PayloadAction<any>) {
      state.pendingApplication = action.payload;
    },
    clearPendingApplication(state) {
      state.pendingApplication = null;
    },
  },
});

export const { actions: trainerActions } = trainerSlice;
