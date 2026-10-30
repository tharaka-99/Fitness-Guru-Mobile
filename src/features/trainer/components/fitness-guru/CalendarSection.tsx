import React from 'react';
import { ScrollView } from 'react-native';
import Box from '@components/atoms/Box';
import Text from '@components/atoms/Text';
import { theme } from '@utils/styles/theme';
import { CheckCircle2, MoonStar, CircleDashed } from 'lucide-react-native';
import { WeeklyCalendarDay } from '@utils/types/analyticsTypes';
import { getLocalDateString } from '@utils/services/workoutSessionService';

interface Props {
  dates: WeeklyCalendarDay[];
}

const MIN_DAY_WIDTH = 45;
const GAP = 5;

const CalendarSection: React.FC<Props> = ({ dates }) => {
  const todayStr = getLocalDateString();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        flexGrow: 1, // fill the screen when there's extra space
        minWidth: '100%',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
      }}
    >
      {dates.map((day, index) => {
        const parts = day.date ? day.date.split('-').map(Number) : [];
        const dateObj =
          parts.length === 3 ? new Date(parts[0], parts[1] - 1, parts[2]) : new Date(day.date);
        const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short' })
          .format(dateObj)
          .toUpperCase();
        const dateNum = dateObj.getDate();
        const isToday = day.date === todayStr;

        const isCompleted = day.status === 'completed' || day.completed === true;
        const isRest = !isCompleted && (day.status === 'rest' || day.restDay === true);
        const isMissed = !isCompleted && !isRest && day.status === 'missed';

        return (
          <Box
            key={day.date || index}
            alignItems="center"
            p="xs"
            borderRadius="sm"
            borderWidth={isToday ? 1 : 0}
            borderColor={isToday ? 'PrimaryGreen' : 'SecondaryGrey'}
            backgroundColor="backgroundSecondary"
            style={{
              flex: 1,
              minWidth: MIN_DAY_WIDTH,
              marginRight: index === dates.length - 1 ? 0 : GAP,
            }}
          >
            <Text variant="xs" color="textSecondary">{dayName}</Text>
            <Text variant="md" style={{ fontWeight: 'bold' }} mt="xs" mb="xs">{dateNum}</Text>
            {isCompleted && (
              <CheckCircle2 size={20} color={theme.colors.PrimaryBlack} fill={theme.colors.PrimaryGreen} />
            )}
            {isRest && (
              <MoonStar size={20} color={theme.colors.textSecondary} fill={theme.colors.textSecondary} />
            )}
            {isMissed && (
              <CircleDashed size={20} color={theme.colors.PrimaryBlack} />
            )}
            {!isCompleted && !isRest && !isMissed && (
              <CircleDashed size={20} color={theme.colors.borderSecondary} />
            )}
          </Box>
        );
      })}
    </ScrollView>
  );
};

export default CalendarSection;