import React from 'react';

import Box from '@components/atoms/Box';
import WorkoutSummaryCard from './WorkoutSummaryCard';
import WorkoutSummaryTable from './WorkoutSummeryTable';
import { LastWeekAnalytics, LogResponseDto } from '@utils/types/analyticsTypes';

interface Props {
  logHistoryByWorkoutDayExercise: LogResponseDto[];
  lastWeekAnalytics: LastWeekAnalytics;
}
const AnalyticsDashboard: React.FC<Props> = ({
  logHistoryByWorkoutDayExercise,
  lastWeekAnalytics,
}) => {
  return (
    <Box>
      <WorkoutSummaryCard lastWeekAnalytics={lastWeekAnalytics} />
      <WorkoutSummaryTable tableData={logHistoryByWorkoutDayExercise} />
    </Box>
  );
};

export default AnalyticsDashboard;
