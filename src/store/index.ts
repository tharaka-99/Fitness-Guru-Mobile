import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { PersistConfig, persistReducer, persistStore } from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

import { authSlice } from '@features/auth/context/slice';
import { gymSlice } from '@features/gym/context/slice';
import { overviewSlice } from '@features/overview/context/slice';
import { trainerSlice } from '@features/trainer/context/slice';

const reducers = combineReducers({
  'feature/auth': authSlice.reducer,
  'feature/gym': gymSlice.reducer,
  'feature/overview': overviewSlice.reducer,
  'feature/trainer': trainerSlice.reducer,
});
export type RootState = {
  'feature/auth': ReturnType<typeof authSlice.reducer>;
  'feature/gym': ReturnType<typeof gymSlice.reducer>;
  'feature/overview': ReturnType<typeof overviewSlice.reducer>;
  'feature/trainer': ReturnType<typeof trainerSlice.reducer>;
};

const persistConfig: PersistConfig<RootState> = {
  key: 'root',
  storage: AsyncStorage,
  stateReconciler: autoMergeLevel2,
  whitelist: ['feature/auth'],
};
const persistedReducer = persistReducer(persistConfig, reducers);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const reduxPersistor = persistStore(store);
