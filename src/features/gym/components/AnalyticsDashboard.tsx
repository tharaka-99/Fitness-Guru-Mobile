import React from 'react';

import Box from '@components/atoms/Box';
import WorkoutSummaryCard from './WorkoutSummaryCard';
import WorkoutSummaryTable from './WorkoutSummeryTable';
import { LastWeekAnalytics, LogEntryDto } from '@utils/types/analyticsTypes';

interface Props {
  logHistoryByWorkoutDayExercise: LogEntryDto[];
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
