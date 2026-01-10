import { RootState } from '@/store';
import { initialState } from './slice';

const selectDomain = (state: RootState) =>
  state['feature/trainer'] || initialState;
