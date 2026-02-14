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
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useQuery } from 'react-query';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import { ArrowLeft } from 'lucide-react-native';
import { theme } from '@utils/styles/theme';
import Text from "@components/atoms/Text";

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
        <PageHeader
          leftComponent={
            <Box flexDirection="row" alignItems="center" gap="md">
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <ArrowLeft size={30} color={theme.colors.PrimaryGreen} />
              </TouchableOpacity>
              <Text color="PrimaryGreen" variant="xlBold" numberOfLines={1} style={{ width: '80%' }}>
                {selectedExercise?.exercise?.name}
              </Text>
            </Box>
          }
        />
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



