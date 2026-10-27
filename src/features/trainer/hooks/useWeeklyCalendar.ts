import { useWeeklyOverview } from './useWeeklyOverview';

export const useWeeklyCalendar = () => {
  const query = useWeeklyOverview();
  return {
    ...query,
    data: query.data?.calendar,
  };
};
