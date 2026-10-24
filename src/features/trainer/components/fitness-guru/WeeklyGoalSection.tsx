import React, { useRef, useState, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import PagerView from 'react-native-pager-view';
import Box from '@components/atoms/Box';
import Text from '@components/atoms/Text';
import { theme } from '@utils/styles/theme';
import CircularProgressRing from './CircularProgressRing';
import { WeeklyProgressData } from '@utils/types/analyticsTypes';
import { MealPlan } from '@utils/types/mealPlanTypes';
import { calculateMealPlanNutrition } from '@utils/services/mealPlanService';

interface Props {
  progress?: WeeklyProgressData;
  mealPlan?: MealPlan | null;
  onViewWorkout?: () => void;
  onViewMealPlan?: () => void;
}

const CARBS_COLOR = '#2DD4BF';
const FATS_COLOR = '#D95B96';
const PROTEIN_COLOR = '#F5A623';

const WeeklyGoalSection: React.FC<Props> = ({
  progress,
  mealPlan,
  onViewWorkout,
  onViewMealPlan,
}) => {
  const [activePage, setActivePage] = useState<number>(0);
  const pagerRef = useRef<PagerView>(null);

  const nutrition = useMemo(() => calculateMealPlanNutrition(mealPlan), [mealPlan]);

  const handleTabPress = (index: number) => {
    setActivePage(index);
    pagerRef.current?.setPage(index);
  };

  return (
    <Box p="base" mb="md" backgroundColor="PrimaryGrey">
      <PagerView
        ref={pagerRef}
        initialPage={0}
        style={styles.pager}
        onPageSelected={(e) => setActivePage(e.nativeEvent.position)}
      >
        {/* PAGE 0: WORKOUT PROGRESS */}
        <View key="workout" style={styles.page}>
          <Box flexDirection="row" justifyContent="flex-end" alignItems="center" mb="xs">
            <TouchableOpacity
              onPress={onViewWorkout}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text variant="sm" color="PrimaryGreen">
                View
              </Text>
            </TouchableOpacity>
          </Box>
          <Box flexDirection="row" justifyContent="space-between" alignItems="center">
            <CircularProgressRing
              radius={35}
              strokeWidth={6}
              progress={
                progress && progress.sets.target > 0
                  ? progress.sets.current / progress.sets.target
                  : 0
              }
              color={theme.colors.PrimaryGreen}
              title={progress?.sets.current.toString() ?? '0'}
              subtitle={`${Math.max(
                0,
                (progress?.sets.target ?? 0) - (progress?.sets.current ?? 0)
              )} left`}
              label="Sets"
              subLabel={`${progress?.sets.target ?? 0} target`}
            />
            <CircularProgressRing
              radius={50}
              strokeWidth={8}
              progress={
                progress && progress.days.target > 0
                  ? progress.days.current / progress.days.target
                  : 0
              }
              color={theme.colors.PrimaryGreen}
              title={progress?.days.current.toString() ?? '0'}
              subtitle={`${Math.max(
                0,
                (progress?.days.target ?? 0) - (progress?.days.current ?? 0)
              )} left`}
              label="Days"
              subLabel={`${progress?.days.target ?? 0} target`}
            />
            <CircularProgressRing
              radius={35}
              strokeWidth={6}
              progress={
                progress && progress.exercises.target > 0
                  ? progress.exercises.current / progress.exercises.target
                  : 0
              }
              color={theme.colors.PrimaryGreen}
              title={progress?.exercises.current.toString() ?? '0'}
              subtitle={`${Math.max(
                0,
                (progress?.exercises.target ?? 0) - (progress?.exercises.current ?? 0)
              )} left`}
              label="Exercises"
              subLabel={`${progress?.exercises.target ?? 0} target`}
            />
          </Box>
        </View>

        {/* PAGE 1: MEAL PLAN NUTRITION */}
        <View key="mealPlan" style={[styles.page, { paddingHorizontal: theme.spacing.sm }]} >
          <Box flexDirection="row" justifyContent="space-between" alignItems="center">
            <Text variant="sm" color="textSecondary">
              Calories
            </Text>
            <TouchableOpacity
              onPress={onViewMealPlan}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text variant="sm" color="PrimaryGreen">
                View
              </Text>
            </TouchableOpacity>
          </Box>

          <Box mb="xs">
            <Text variant="2xlBold" color="PrimaryWhite">
              {Math.round(nutrition.totalCalories).toLocaleString()}kcal
            </Text>
          </Box>

          {/* Calorie Bar Breakdown */}
          <Box

            height={14}
            borderRadius="full"
            overflow="hidden"
            flexDirection="row"
            width="100%"
            backgroundColor="PrimaryGreyDark"
            my="sm"
          >
            {nutrition.totalCalories > 0 ? (
              <>
                {nutrition.carbsPercent > 0 && (
                  <View
                    style={{
                      width: `${nutrition.carbsPercent}%`,
                      backgroundColor: CARBS_COLOR,
                      height: '100%',
                    }}
                  />
                )}
                {nutrition.fatsPercent > 0 && (
                  <View
                    style={{
                      width: `${nutrition.fatsPercent}%`,
                      backgroundColor: FATS_COLOR,
                      height: '100%',
                    }}
                  />
                )}
                {nutrition.proteinPercent > 0 && (
                  <View
                    style={{
                      width: `${nutrition.proteinPercent}%`,
                      backgroundColor: PROTEIN_COLOR,
                      height: '100%',
                    }}
                  />
                )}
              </>
            ) : null}
          </Box>

          {/* Macronutrients Columns */}
          <Box
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            width="100%"
            mt="xs"
          >
            {/* Carbs */}
            <Box alignItems="flex-start">
              <Box flexDirection="row" alignItems="center" gap="xs">
                <Box
                  width={8}
                  height={8}
                  borderRadius="full"
                  style={{ backgroundColor: CARBS_COLOR }}
                />
                <Text variant="sm" color="textSecondary">
                  Carbs
                </Text>
              </Box>
              <Text variant="lgBold" color="PrimaryWhite" mt="xs">
                {Math.round(nutrition.totalCarbs)}g
              </Text>
              <Text variant="sm" color="textSecondary" mt="xs">
                {nutrition.totalCalories > 0 ? `${Math.round(nutrition.carbsPercent)}%` : '0%'}
              </Text>
            </Box>

            {/* Fats */}
            <Box alignItems="flex-start">
              <Box flexDirection="row" alignItems="center" gap="xs">
                <Box
                  width={8}
                  height={8}
                  borderRadius="full"
                  style={{ backgroundColor: FATS_COLOR }}
                />
                <Text variant="sm" color="textSecondary">
                  Fats
                </Text>
              </Box>
              <Text variant="lgBold" color="PrimaryWhite" mt="xs">
                {Math.round(nutrition.totalFats)}g
              </Text>
              <Text variant="sm" color="textSecondary" mt="xs">
                {nutrition.totalCalories > 0 ? `${Math.round(nutrition.fatsPercent)}%` : '0%'}
              </Text>
            </Box>

            {/* Protein */}
            <Box alignItems="flex-start">
              <Box flexDirection="row" alignItems="center" gap="xs">
                <Box
                  width={8}
                  height={8}
                  borderRadius="full"
                  style={{ backgroundColor: PROTEIN_COLOR }}
                />
                <Text variant="sm" color="textSecondary">
                  Protein
                </Text>
              </Box>
              <Text variant="lgBold" color="PrimaryWhite" mt="xs">
                {Math.round(nutrition.totalProtein)}g
              </Text>
              <Text variant="sm" color="textSecondary" mt="xs">
                {nutrition.totalCalories > 0 ? `${Math.round(nutrition.proteinPercent)}%` : '0%'}
              </Text>
            </Box>
          </Box>
        </View>
      </PagerView>

      {/* SEGMENTED TAB SWITCHER */}
      <Box alignItems="center" mt="md">
        <View style={styles.tabContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleTabPress(0)}
            style={[styles.tabButton, activePage === 0 && styles.activeTabButton]}
          >
            <Text style={activePage === 0 ? styles.activeTabText : styles.inactiveTabText}>
              Workout
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleTabPress(1)}
            style={[styles.tabButton, activePage === 1 && styles.activeTabButton]}
          >
            <Text style={activePage === 1 ? styles.activeTabText : styles.inactiveTabText}>
              Meal Plan
            </Text>
          </TouchableOpacity>
        </View>

        {/* PAGINATION DOTS */}
        <Box flexDirection="row" justifyContent="center" alignItems="center" gap="xs" mt="sm">
          <TouchableOpacity
            onPress={() => handleTabPress(0)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View
              style={[
                styles.dot,
                {
                  backgroundColor:
                    activePage === 0 ? theme.colors.PrimaryWhite : '#636366',
                  opacity: activePage === 0 ? 1 : 0.4,
                },
              ]}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleTabPress(1)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View
              style={[
                styles.dot,
                {
                  backgroundColor:
                    activePage === 1 ? theme.colors.PrimaryWhite : '#636366',
                  opacity: activePage === 1 ? 1 : 0.4,
                },
              ]}
            />
          </TouchableOpacity>
        </Box>
      </Box>
    </Box>
  );
};

export default WeeklyGoalSection;

const styles = StyleSheet.create({
  pager: {
    height: 190,
  },
  page: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#303030',
    borderRadius: 999,
    padding: 3,
    alignSelf: 'center',
  },
  tabButton: {
    paddingHorizontal: 22,
    paddingVertical: 7,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabButton: {
    backgroundColor: '#E0E0E0',
  },
  activeTabText: {
    color: '#1D1D1D',
    fontWeight: '700',
    fontSize: 14,
  },
  inactiveTabText: {
    color: '#939292',
    fontWeight: '500',
    fontSize: 14,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

