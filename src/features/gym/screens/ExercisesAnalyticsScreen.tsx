import { store } from '@/store';
import PageWrapper from '@components/app/PageWrapper';
import PageHeader from '@components/app/header/PageHeader';
import Box from '@components/atoms/Box';
import { MyStackNavigatorScreenProps } from '@navigation/types';
import {
  getLastWeekAnalyticsByExerciseId,
  getLastWeekAnalyticsByWorkoutDayExercise,
  getLogHistoryByExerciseId,
} from '@utils/services/analyticsService';
import { LastWeekAnalytics } from '@utils/types/analyticsTypes';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useQuery } from 'react-query';
import AnalyticsDashboard from '../components/AnalyticsDashboard';

const ExercisesAnalyticsScreen: React.FC<
  MyStackNavigatorScreenProps<'ExercisesAnalytics'>
> = ({ navigation }) => {
  const { selectedExercise, selectedWorkoutId, selectedDay } =
    store.getState()['feature/gym'];

  const {
    isLoading: isLogHistoryByWorkoutDayExerciseLoading,
    data: logHistoryByWorkoutDayExercise,
    refetch: logHistoryByWorkoutDayExerciseRefetch,
  } = useQuery(
    ['getLogHistoryByExerciseId', selectedExercise?.exercise?._id], // Adjust to your actual parameters
    () => getLogHistoryByExerciseId(selectedExercise?.exercise?._id) // Function reference
  );

  const {
    isLoading: isLastWeekAnalyticsByWorkoutDayExerciseLoading,
    data: lastWeekAnalyticsByWorkoutDayExercise,
    refetch: lastWeekAnalyticsByWorkoutDayExerciseRefetch,
  } = useQuery(
    ['getLastWeekAnalyticsByExerciseId', selectedExercise?.exercise?._id], // Adjust to your actual parameters
    () => getLastWeekAnalyticsByExerciseId(selectedExercise?.exercise?._id) // Function reference
  );

  return (
    <ScrollView>
      <PageWrapper>
        <PageHeader title={selectedExercise?.exercise?.name} />
        <Box>
          <AnalyticsDashboard
            logHistoryByWorkoutDayExercise={
              logHistoryByWorkoutDayExercise
                ? logHistoryByWorkoutDayExercise
                : []
            }
            lastWeekAnalytics={
              lastWeekAnalyticsByWorkoutDayExercise || ({} as LastWeekAnalytics)
            }
          />
        </Box>
      </PageWrapper>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  leftBox: {
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  middleBox: {
    // No border radius for middle box
  },
  rightBox: {
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
});

export default ExercisesAnalyticsScreen;
