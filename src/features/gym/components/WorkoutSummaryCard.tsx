import React, { useRef, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import PagerView from 'react-native-pager-view';
import { TrendingUp, TrendingDown, GitCompare, GripVertical } from 'lucide-react-native';

import Box from '@components/atoms/Box';
import PaginationDots from '@components/atoms/PaginationDots';
import Text from '@components/atoms/Text';
import { theme } from '@utils/styles/theme';
import { LastWeekAnalytics } from '@utils/types/analyticsTypes';

interface Props {
  lastWeekAnalytics: LastWeekAnalytics;
}

const WorkoutSummaryCard: React.FC<Props> = ({ lastWeekAnalytics }) => {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const pageViewRef = useRef<PagerView>(null);
  const { width } = useWindowDimensions();

  const renderComparisonBox = (
    title: string,
    value: number,
    change: number,
    color: keyof typeof theme.colors,
    changeColor: keyof typeof theme.colors
  ) => (
    <Box
      justifyContent="center"
      minHeight={70}
      borderLeftColor={color}
      borderLeftWidth={8}
      borderRadius="sm"
      pl="md"
      width={'100%'}
    >
      <Text variant="mdBold">{title}</Text>
      <Text color={value < 0 ? 'PrimaryRed' : 'SecondaryGrey'} variant="md">
        {value ? value : 0}
      </Text>
      <Box
        flexDirection="row"
        justifyContent="flex-start"
        alignItems="center"
        gap="xs"
      >
        {change > 0 ? (
          <TrendingUp
            color={theme.colors.PrimaryGreen}
            size={30}
          />
        ) : (
          <TrendingDown
            color={theme.colors.PrimaryRed}
            size={30}
          />
        )}

        <Text
          color={
            !change ? 'SecondaryGrey' : change < 0 ? 'PrimaryRed' : changeColor
          }
          variant="md"
        >
          {change ? change : 0}
        </Text>
      </Box>
    </Box>
  );

  const renderSummaryBox = (
    title: string,
    value: number,
    color: keyof typeof theme.colors
  ) => (
    <Box
      justifyContent="center"
      minHeight={70}
      borderLeftColor={color}
      borderLeftWidth={8}
      borderRadius="sm"
      pl="md"
      width={'100%'}
    >
      <Text variant="mdBold">{title}</Text>
      <Text color="SecondaryGrey" variant="md">
        {value ? value : 0}
      </Text>
    </Box>
  );

  return (
    <Box p="md" borderRadius="sm" bg="backgroundSecondary" gap="xs">
      <Box minHeight={220}>
        <PagerView
          initialPage={0}
          ref={pageViewRef}
          style={{ flex: 1 }}
          onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
        >
          <View key="1">
            <Box
              flexDirection="row"
              justifyContent="flex-start"
              alignItems="center"
              gap="xs"
            >
              <GitCompare color="white" size={25} />
              <Text style={styles.title}>Compared to last week</Text>
            </Box>
            <Box
              p="base"
              gap="sm"
              alignItems="center"
              flexDirection="row"
              justifyContent="space-between"
            >
              <Box
                p="base"
                gap="md"
                alignItems="center"
                flexDirection="column"
                justifyContent="space-between"
                width={'50%'}
              >
                {renderComparisonBox(
                  'Sets',
                  lastWeekAnalytics?.sets,
                  lastWeekAnalytics?.setsIncrement,
                  'PrimaryPurple',
                  'SecondaryGrey'
                )}
                {renderComparisonBox(
                  'Volume (kg)',
                  Number(lastWeekAnalytics?.weight?.toFixed(2)),
                  Number(lastWeekAnalytics?.weightIncrement?.toFixed(2)),
                  'LightBlue',
                  'PrimaryGreen'
                )}
              </Box>
              <Box
                p="base"
                gap="md"
                alignItems="center"
                flexDirection="column"
                justifyContent="space-between"
                width={'50%'}
              >
                {renderComparisonBox(
                  'Repetitions',
                  lastWeekAnalytics?.reps,
                  lastWeekAnalytics?.repsIncrement,
                  'PrimaryRed',
                  'PrimaryGreen'
                )}
                {renderComparisonBox(
                  'kg/rep',
                  Number(lastWeekAnalytics?.kgPerRep?.toFixed(2)),
                  Number(lastWeekAnalytics?.kgPerRepIncrement?.toFixed(2)),
                  'PrimaryOrange',
                  'PrimaryGreen'
                )}
              </Box>
            </Box>
          </View>

          <View key="2">
            <Box
              flexDirection="row"
              justifyContent="flex-start"
              alignItems="center"
              gap="xs"
            >
              <GripVertical color="white" size={25} />
              <Text style={styles.title}>Workout summary</Text>
            </Box>
            <Box
              p="base"
              gap="sm"
              alignItems="center"
              flexDirection="row"
              justifyContent="space-between"
              width={'50%'}
            >
              <Box
                p="base"
                gap="md"
                alignItems="center"
                flexDirection="column"
                justifyContent="space-between"
              >
                {renderSummaryBox(
                  'Total Sets',
                  lastWeekAnalytics?.sets,
                  'PrimaryPurple'
                )}
                {renderSummaryBox(
                  'Total Volume (kg)',
                  Number(lastWeekAnalytics?.weight?.toFixed(2)),
                  'LightBlue'
                )}
              </Box>
              <Box
                p="base"
                gap="md"
                alignItems="center"
                flexDirection="column"
                justifyContent="space-between"
              >
                {renderSummaryBox(
                  'Total Reps',
                  lastWeekAnalytics?.reps,
                  'PrimaryRed'
                )}
                {renderSummaryBox(
                  'Total kg/rep',
                  Number(lastWeekAnalytics?.kgPerRep?.toFixed(2)),
                  'PrimaryOrange'
                )}
              </Box>
            </Box>
          </View>
        </PagerView>
      </Box>

      <PaginationDots currentPage={currentPage} dotsCount={2} />
    </Box>
  );
};

export default WorkoutSummaryCard;

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    textTransform: 'uppercase',
  },
});
