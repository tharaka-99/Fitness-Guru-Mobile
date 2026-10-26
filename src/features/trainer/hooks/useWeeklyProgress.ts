import { useWeeklyOverview } from './useWeeklyOverview';

export const useWeeklyProgress = () => {
  const query = useWeeklyOverview();
  return {
    ...query,
    data: query.data?.progress,
  };
};
