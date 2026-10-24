import React from 'react';
import Box from '@components/atoms/Box';
import Text from '@components/atoms/Text';
import { theme } from '@utils/styles/theme';
import { HabitType } from '@utils/types/habitTypes';
import { HabitHistoryStats } from '../../hooks/useHabitHistory';
import {
  Clock,
  Target,
  TrendingDown,
  TrendingUp,
  Calendar,
  Droplets,
  Trophy,
  Footprints,
} from 'lucide-react-native';

interface Props {
  habitType: HabitType;
  period: 'week' | 'month';
  stats: HabitHistoryStats;
}

export const HabitKpiCards: React.FC<Props> = ({ habitType, period, stats }) => {
  let leftIcon = <Clock size={20} color={theme.colors.PrimaryGreen} />;
  let leftValue = '';
  let leftSubtitle = '';

  let rightIcon = <Target size={20} color={theme.colors.PrimaryGreen} />;
  let rightValue = '';
  let rightSubtitle = '';

  if (habitType === 'sleep') {
    leftIcon = <Clock size={20} color={theme.colors.PrimaryGreen} />;
    leftValue = stats.longestSleepFormatted || '--';
    leftSubtitle = 'Longest sleep';

    rightIcon = <Target size={20} color={theme.colors.PrimaryGreen} />;
    rightValue = stats.goalReachedFormatted;
    rightSubtitle = 'Goal reached';
  } else if (habitType === 'weight') {
    leftIcon =
      stats.weightChangePositive === false ? (
        <TrendingDown size={20} color={theme.colors.PrimaryGreen} />
      ) : (
        <TrendingUp size={20} color={theme.colors.PrimaryGreen} />
      );
    leftValue = stats.weightChangeFormatted || '0.0 kg';
    leftSubtitle = `Change this ${period}`;

    rightIcon = <Calendar size={20} color={theme.colors.PrimaryGreen} />;
    rightValue = stats.daysLoggedFormatted;
    rightSubtitle = 'Days logged';
  } else if (habitType === 'water') {
    leftIcon = <Droplets size={20} color={theme.colors.PrimaryGreen} />;
    leftValue = stats.totalFormatted;
    leftSubtitle = 'Total intake';

    rightIcon = <Trophy size={20} color={theme.colors.PrimaryGreen} />;
    rightValue = stats.goalReachedFormatted;
    rightSubtitle = 'Goal reached';
  } else if (habitType === 'steps') {
    leftIcon = <Footprints size={20} color={theme.colors.PrimaryGreen} />;
    leftValue = stats.totalFormatted;
    leftSubtitle = 'Total steps';

    rightIcon = <Target size={20} color={theme.colors.PrimaryGreen} />;
    rightValue = stats.goalReachedFormatted;
    rightSubtitle = 'Goal reached';
  }

  return (
    <Box flexDirection="row" gap="md" mb="md">
      {/* Left Card */}
      <Box
        flex={1}
        backgroundColor="backgroundSecondary"
        borderRadius="md"
        p="md"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 6,
          elevation: 6,
        }}
      >
        <Box
          width={40}
          height={40}
          borderRadius="full"
          backgroundColor="PrimaryBlack"
          alignItems="center"
          justifyContent="center"
          mb="sm"
          style={{
            borderWidth: 1,
            borderColor: 'rgba(160, 226, 32, 0.3)',
          }}
        >
          {leftIcon}
        </Box>
        <Text variant="xlBold" color="textPrimary" numberOfLines={1}>
          {leftValue}
        </Text>
        <Text variant="xs" color="textSecondary" mt="xs">
          {leftSubtitle}
        </Text>
      </Box>

      {/* Right Card */}
      <Box
        flex={1}
        backgroundColor="backgroundSecondary"
        borderRadius="md"
        p="md"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 6,
          elevation: 6,
        }}
      >
        <Box
          width={40}
          height={40}
          borderRadius="full"
          backgroundColor="PrimaryBlack"
          alignItems="center"
          justifyContent="center"
          mb="sm"
          style={{
            borderWidth: 1,
            borderColor: 'rgba(160, 226, 32, 0.3)',
          }}
        >
          {rightIcon}
        </Box>
        <Text variant="xlBold" color="textPrimary" numberOfLines={1}>
          {rightValue}
        </Text>
        <Text variant="xs" color="textSecondary" mt="xs">
          {rightSubtitle}
        </Text>
      </Box>
    </Box>
  );
};

export default HabitKpiCards;
