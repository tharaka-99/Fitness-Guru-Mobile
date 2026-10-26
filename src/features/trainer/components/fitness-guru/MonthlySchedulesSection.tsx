import React from 'react';
import { TouchableOpacity } from 'react-native';
import Box from '@components/atoms/Box';
import Text from '@components/atoms/Text';
import { theme, constants } from '@utils/styles/theme';
import { Bike, Utensils, ChevronRight } from 'lucide-react-native';

interface Props {
  hasWorkout: boolean;
  hasMealPlan: boolean;
  onWorkoutPress: () => void;
  onMealPress: () => void;
}

const MonthlySchedulesSection: React.FC<Props> = ({
  hasWorkout,
  hasMealPlan,
  onWorkoutPress,
  onMealPress,
}) => {
  return (
    <Box mb="md" px={"md"}>
      {hasWorkout && <Text variant="lgBold" mb="md">Monthly Schedules</Text>}
      <Box flexDirection="row" gap="md">
        {hasWorkout && (
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: theme.colors.backgroundSecondary,
              borderRadius: theme.borderRadii.md,
              padding: theme.spacing.md,
            }}
            activeOpacity={constants.activeOpacity}
            onPress={onWorkoutPress}
          >
            <Box flexDirection="row" alignItems="center" justifyContent="space-between" mb="sm">
              <Box flexDirection="row" alignItems="center" gap="sm">
                <Bike color={theme.colors.PrimaryGreen} size={20} />
                <Text variant="md" style={{ fontWeight: 'bold' }}>Workout</Text>
              </Box>
              <ChevronRight color={theme.colors.textSecondary} size={20} />
            </Box>
            <Text variant="xs" color="textSecondary">
              Your personalised weekly training routine.
            </Text>
          </TouchableOpacity>
        )}

        {hasMealPlan && (
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: theme.colors.backgroundSecondary,
              borderRadius: theme.borderRadii.md,
              padding: theme.spacing.md,
            }}
            activeOpacity={constants.activeOpacity}
            onPress={onMealPress}
          >
            <Box flexDirection="row" alignItems="center" justifyContent="space-between" mb="sm">
              <Box flexDirection="row" alignItems="center" gap="sm">
                <Utensils color={theme.colors.PrimaryGreen} size={20} />
                <Text variant="md" style={{ fontWeight: 'bold' }}>Meal Plan</Text>
              </Box>
              <ChevronRight color={theme.colors.textSecondary} size={20} />
            </Box>
            <Text variant="xs" color="textSecondary">
              Your personalised daily nutrition guide.
            </Text>
          </TouchableOpacity>
        )}
      </Box>
    </Box>
  );
};

export default MonthlySchedulesSection;
