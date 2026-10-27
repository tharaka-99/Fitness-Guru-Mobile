import React, { useRef, useState, useMemo } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import PageWrapper from '@components/app/PageWrapper';
import Box from '@components/atoms/Box';
import Text from '@components/atoms/Text';
import { theme } from '@utils/styles/theme';
import { MyStackNavigatorScreenProps } from '@navigation/types';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { HabitData, LogHabitDto } from '@utils/types/habitTypes';
import {
  useHabitHistory,
  ProcessedDayPoint,
  toISODate,
  isHabitDayEditable,
} from '../hooks/useHabitHistory';
import HabitHeroCard from '../components/habits/HabitHeroCard';
import HabitBarChart from '../components/habits/HabitBarChart';
import HabitLineChart from '../components/habits/HabitLineChart';
import HabitKpiCards from '../components/habits/HabitKpiCards';
import HabitInsightCard from '../components/habits/HabitInsightCard';
import HabitLogHistoryList from '../components/habits/HabitLogHistoryList';
import HabitLogBottomSheet from '../components/fitness-guru/HabitLogBottomSheet';
import FullScreenLoader from '@components/atoms/FullScreenLoader';
import Toast from 'react-native-toast-message';

const HABIT_TITLES: Record<string, string> = {
  sleep: 'Sleep',
  weight: 'Weight',
  water: 'Water',
  steps: 'Steps',
};

export const HabitHistoryScreen: React.FC<
  MyStackNavigatorScreenProps<'HabitHistory'>
> = ({ navigation, route }) => {
  const habitType = route.params.habitType;
  const sheetRef = useRef<BottomSheetModalMethods | null>(null);
  const [selectedPointForLog, setSelectedPointForLog] = useState<ProcessedDayPoint | null>(null);

  const {
    period,
    setPeriod,
    rangeLabel,
    goToPrevious,
    goToNext,
    points,
    stats,
    isLoading,
    logHabit,
    isLogging,
  } = useHabitHistory(habitType);

  const title = HABIT_TITLES[habitType] || 'Habit';

  const handleOpenLogSheet = (point?: ProcessedDayPoint) => {
    if (point) {
      const isEditable = isHabitDayEditable(point.dateString, habitType);
      if (!isEditable) {
        Toast.show({
          type: 'info',
          text1: habitType === 'weight' ? 'Weight Log' : 'Habit History',
          text2:
            habitType === 'weight'
              ? "Only today's weight can be logged or edited."
              : 'Only today and yesterday can be logged or edited.',
        });
        return;
      }
    }
    setSelectedPointForLog(point || null);
    sheetRef.current?.present();
  };

  const handleSaveLog = (dto: LogHabitDto) => {
    logHabit({
      ...dto,
      date: selectedPointForLog ? selectedPointForLog.dateString : undefined,
    });
    sheetRef.current?.dismiss();
  };

  const selectedDateLabel = useMemo(() => {
    if (!selectedPointForLog) return 'Today';
    const todayStr = toISODate(new Date());
    if (selectedPointForLog.dateString === todayStr) return 'Today';
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (selectedPointForLog.dateString === toISODate(yesterday)) return 'Yesterday';
    return selectedPointForLog.shortDate;
  }, [selectedPointForLog]);

  // Convert selected point into HabitData format for the bottom sheet
  const activeHabitData: HabitData = useMemo(() => {
    const isLogged = selectedPointForLog ? selectedPointForLog.isLogged : false;
    const value = selectedPointForLog?.value ?? stats.latestValue ?? 0;

    let sleepHours = 0;
    let sleepMinutes = 0;
    if (habitType === 'sleep' && value > 0) {
      sleepHours = Math.floor(value);
      sleepMinutes = Math.round((value - sleepHours) * 60);
    }

    return {
      type: habitType,
      logged: isLogged,
      currentValue: value,
      targetValue: stats.targetValue,
      unit: stats.unitLabel,
      formattedValue: selectedPointForLog?.formattedValue || stats.latestFormatted,
      progress: selectedPointForLog?.isGoalMet ? 1 : 0,
      details: {
        weightUnit: 'kg',
        sleepHours,
        sleepMinutes,
      },
    };
  }, [habitType, selectedPointForLog, stats]);

  if (isLoading && points.length === 0) {
    return <FullScreenLoader />;
  }

  return (
    <PageWrapper noPadding>
      {/* Top Header */}
      <Box
        px="md"
        pt="sm"
        pb="sm"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={{ width: 40 }}
        >
          <ChevronLeft size={30} color={theme.colors.PrimaryGreen} />
        </TouchableOpacity>

        <Text
          variant="lgBold"
          style={{
            color: theme.colors.PrimaryGreen,
            fontSize: 22,
            fontWeight: 'bold',
          }}
        >
          {title}
        </Text>

        {/* Balance right side */}
        <Box width={40} />
      </Box>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 60 }}
      >
        {/* Week / Month Toggle Pill */}
        <Box
          flexDirection="row"
          backgroundColor="PrimaryGreyDark"
          borderRadius="full"
          p="xs"
          alignSelf="center"
          mt="sm"
          mb="md"
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setPeriod('week')}
            style={{
              paddingVertical: 7,
              paddingHorizontal: 40,
              borderRadius: 20,
              backgroundColor: period === 'week' ? '#E6E6E6' : 'transparent',
            }}
          >
            <Text
              variant="smBold"
              style={{
                color: period === 'week' ? theme.colors.PrimaryBlack : theme.colors.SecondaryGrey,
              }}
            >
              Week
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setPeriod('month')}
            style={{
              paddingVertical: 7,
              paddingHorizontal: 40,
              borderRadius: 20,
              backgroundColor: period === 'month' ? '#E6E6E6' : 'transparent',
            }}
          >
            <Text
              variant="smBold"
              style={{
                color: period === 'month' ? theme.colors.PrimaryBlack : theme.colors.SecondaryGrey,
              }}
            >
              Month
            </Text>
          </TouchableOpacity>
        </Box>

        {/* Date Range Selector */}
        <Box
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          mb="lg"
          px="xs"
        >
          <TouchableOpacity
            onPress={goToPrevious}
            activeOpacity={0.7}
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              backgroundColor: theme.colors.backgroundSecondary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronLeft size={20} color={theme.colors.PrimaryWhite} />
          </TouchableOpacity>

          <Text variant="mdBold" color="textPrimary">
            {rangeLabel}
          </Text>

          <TouchableOpacity
            onPress={goToNext}
            activeOpacity={0.7}
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              backgroundColor: theme.colors.backgroundSecondary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronRight size={20} color={theme.colors.PrimaryWhite} />
          </TouchableOpacity>
        </Box>

        {/* Top Hero Metric Card */}
        <HabitHeroCard
          habitType={habitType}
          primaryValue={
            habitType === 'weight' ? stats.latestFormatted : stats.averageFormatted
          }
          subtitle={stats.averageSubtitle}
        />

        {/* Chart Card */}
        {habitType === 'weight' ? (
          <HabitLineChart
            period={period}
            points={points}
            ticks={stats.chartTicks}
            title="Weight trend"
            unit="kg"
            onSelectDay={handleOpenLogSheet}
          />
        ) : (
          <HabitBarChart
            habitType={habitType}
            period={period}
            points={points}
            targetValue={stats.targetValue}
            ticks={stats.chartTicks}
            maxY={stats.chartMaxY}
            title={
              habitType === 'sleep'
                ? 'Sleep duration'
                : habitType === 'water'
                ? 'Daily water intake'
                : 'Daily steps'
            }
            unitRight={habitType === 'sleep' ? 'Hours' : undefined}
            onSelectDay={handleOpenLogSheet}
          />
        )}

        {/* Dual KPI Metric Cards */}
        <HabitKpiCards habitType={habitType} period={period} stats={stats} />

        {/* Routine Insight Card */}
        <HabitInsightCard
          habitType={habitType}
          title={stats.insightTitle}
          subtitle={stats.insightSubtitle}
        />

        {/* Detailed Log History List */}
        <HabitLogHistoryList
          habitType={habitType}
          points={points}
          onLogEntry={handleOpenLogSheet}
        />
      </ScrollView>

      {/* Quick Log / Edit BottomSheet */}
      <HabitLogBottomSheet
        bottomSheetRef={sheetRef}
        habit={activeHabitData}
        onSave={handleSaveLog}
        isLoading={isLogging}
        dateLabel={selectedDateLabel}
      />
    </PageWrapper>
  );
};

export default HabitHistoryScreen;
