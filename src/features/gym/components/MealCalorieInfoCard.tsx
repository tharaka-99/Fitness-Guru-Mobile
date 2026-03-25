import React, { useRef, useState } from "react";
import { View } from "react-native";

import Box from "@components/atoms/Box";
import Text from "@components/atoms/Text";
import { MealType } from "@utils/types/mealPlanTypes";
import { theme } from "@utils/styles/theme";

interface Props {
  summary: {
    baseMetabolicRate: string;
    dailyCalorieIntake: string;
  };
  totalIntakeData: {
    maxCalorieIntake: number;
    minCalorieIntake: number;
    yourPlannedCalorieIntake: number;
  };
}

// Separate component for meal-specific calories
export const MealCalorieSection: React.FC<{
  intakeDataByMeal: {
    mealName: MealType;
    minCalorieIntake: number;
    maxCalorieIntake: number;
    yourPlannedCalorieIntake: number;
  };
}> = ({ intakeDataByMeal }) => {
  return (
    <Box p="md" gap="sm" bg="backgroundPrimary">
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        mb="sm"
      >
        <Text variant="xlBold" fontWeight="600">
          {`${intakeDataByMeal.mealName.replace(
            /^./,
            intakeDataByMeal.mealName[0].toUpperCase()
          )}`}
        </Text>
        <Box paddingHorizontal="sm" paddingVertical="xs" borderRadius="sm">
          <Text variant="xlBold">
            {Number(intakeDataByMeal.yourPlannedCalorieIntake.toFixed(2))}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

// Modified main component - only shows total intake data
const MealCalorieInfoCard: React.FC<Props> = ({ summary, totalIntakeData }) => {
  const getBackgroundColor = (
    minCalorieIntake: number,
    maxCalorieIntake: number,
    yourPlannedCalorieIntake: number
  ) => {
    if (yourPlannedCalorieIntake < minCalorieIntake) {
      return "PrimaryYellow" as keyof typeof theme.colors;
    }
    if (yourPlannedCalorieIntake > maxCalorieIntake) {
      return "PrimaryRed" as keyof typeof theme.colors;
    }
    return "PrimaryGreen" as keyof typeof theme.colors;
  };

  const backgroundColor = getBackgroundColor(
    totalIntakeData.minCalorieIntake,
    totalIntakeData.maxCalorieIntake,
    totalIntakeData.yourPlannedCalorieIntake
  );

  return (
    <Box p="md" borderRadius="sm" bg="backgroundSecondary" gap="xs">
      <Box minHeight={140}>
        <View>
          <Box gap="md">
            <Box gap="sm">
              <Text variant="md" fontWeight="600">
                Total Calorie Intake
              </Text>
              
              <Box
                gap="sm"
                alignItems="center"
                flexDirection="row"
                justifyContent="space-between"
              >
                <Box
                  height={50}
                  width="30%"
                  borderWidth={1}
                  alignItems="center"
                  justifyContent="center"
                  borderColor={backgroundColor}
                  backgroundColor={backgroundColor}
                >
                  <Text variant="mdBold" color="PrimaryBlack">
                    {Number(
                      totalIntakeData.yourPlannedCalorieIntake.toFixed(2)
                    )}
                  </Text>
                </Box>

                <Box width={1} height="100%" backgroundColor="textSecondary" />

                <Box
                  height={50}
                  width="30%"
                  borderWidth={1}
                  alignItems="center"
                  justifyContent="center"
                  borderColor="textSecondary"
                >
                  <Text variant="xs" color="textSecondary" mb="xs">
                    Min
                  </Text>
                  <Text variant="mdBold">
                    {Number(totalIntakeData.minCalorieIntake.toFixed(2))}
                  </Text>
                </Box>

                <Box
                  height={50}
                  width="30%"
                  borderWidth={1}
                  alignItems="center"
                  justifyContent="center"
                  borderColor="textSecondary"
                >
                  <Text variant="xs" color="textSecondary" mb="xs">
                    Max
                  </Text>
                  <Text variant="mdBold">
                    {Number(totalIntakeData.maxCalorieIntake.toFixed(2))}
                  </Text>
                </Box>
              </Box>
            </Box>

            <Box gap="md" flexDirection="row" justifyContent="space-between">
              {[
                {
                  title: "Basal Metabolic Rate",
                  value: summary?.baseMetabolicRate,
                },
                {
                  title: "Daily Calorie Intake",
                  value: summary?.dailyCalorieIntake,
                },
              ]?.map(({ title, value }) => (
                // <Box alignItems="center" key={title}>
                //   <Text variant="mdBold">{title}</Text>
                //   <Text variant="3xlBold" color="PrimaryGreen">
                //     {value}
                //   </Text>
                // </Box>
                <Box gap="sm" flex={1} key={title}>
                  <Box alignItems="center" flex={1}>
                    <Text variant="mdBold">{title}</Text>
                    <Text variant="xlBold" color="PrimaryGreen">
                      {value}
                    </Text>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </View>
      </Box>
    </Box>
  );
};

export default MealCalorieInfoCard;
