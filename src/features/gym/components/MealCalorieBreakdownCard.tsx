import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Box from '@components/atoms/Box';
import Text from '@components/atoms/Text';
import { theme } from '@utils/styles/theme';
import { MealPlanNutrition } from '@utils/types/mealPlanTypes';

export const CARBS_COLOR = '#2DD4BF';
export const FATS_COLOR = '#D95B96';
export const PROTEIN_COLOR = '#F5A623';

interface Props {
  nutrition: MealPlanNutrition;
  title?: string;
  mealBadge?: string;
  style?: StyleProp<ViewStyle>;
}

const MealCalorieBreakdownCard: React.FC<Props> = ({
  nutrition,
  title = 'Calories',
  mealBadge,
  style,
}) => {
  const hasCalories = nutrition.totalCalories > 0;

  return (
    <Box
      p="base"
      borderRadius="md"
      backgroundColor="PrimaryGrey"
      borderWidth={1}
      borderColor="PrimaryGreyDark"
      style={style}
    >
      {/* Top Header Row */}
      <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb="xs">
        <Text variant="sm" color="textSecondary">
          {title}
        </Text>
        {mealBadge && (
          <Box
            backgroundColor="PrimaryGreyDark"
            px="sm"
            py="xs"
            borderRadius="full"
            flexDirection="row"
            alignItems="center"
          >
            <Box
              width={6}
              height={6}
              borderRadius="full"
              backgroundColor="PrimaryGreen"
              mr="xs"
            />
            <Text
              variant="xsBold"
              color="PrimaryGreen"
              style={{ letterSpacing: 0.5, textTransform: 'uppercase' }}
            >
              {mealBadge}
            </Text>
          </Box>
        )}
      </Box>

      {/* Big Calorie Display */}
      <Box mb="xs">
        <Text variant="2xlBold" color="PrimaryWhite">
          {Math.round(nutrition.totalCalories).toLocaleString()}
          <Text variant="md" color="textSecondary"> kcal</Text>
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
        {hasCalories ? (
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
        ) : (
          <View style={styles.emptyBar} />
        )}
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
        <Box alignItems="flex-start" flex={1}>
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
            {hasCalories ? `${Math.round(nutrition.carbsPercent)}%` : '0%'}
          </Text>
        </Box>

        {/* Fats */}
        <Box alignItems="flex-start" flex={1}>
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
            {hasCalories ? `${Math.round(nutrition.fatsPercent)}%` : '0%'}
          </Text>
        </Box>

        {/* Protein */}
        <Box alignItems="flex-start" flex={1}>
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
            {hasCalories ? `${Math.round(nutrition.proteinPercent)}%` : '0%'}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

const styles = StyleSheet.create({
  emptyBar: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.PrimaryGreyDark,
  },
});

export default MealCalorieBreakdownCard;
