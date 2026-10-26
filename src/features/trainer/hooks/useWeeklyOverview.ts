import { useQuery } from '@tanstack/react-query';
import { getWeeklyOverview, WeeklyOverviewData } from '@utils/services/analyticsService';

export const useWeeklyOverview = (workout?: any) => {
  return useQuery<WeeklyOverviewData>({
    queryKey: ['weeklyOverview', workout?._id ?? 'default'],
    queryFn: () => getWeeklyOverview(workout),
  });
};
