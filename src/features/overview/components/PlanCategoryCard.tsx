import React from "react";
import { Dimensions, Image, TouchableOpacity } from "react-native";

import { PAGE_WIDTH } from "@components/app/PageWrapper";
import Box from "@components/atoms/Box";
import Text from "@components/atoms/Text";
import { constants, theme } from "@utils/styles/theme";

interface PlanCategoryCardProps {
  category:
    | "createWorkout"
    | "createMealPlan"
    | "workout"
    | "meal"
    | "generalWorkoutRoutine";
  onPress?: () => void;
}

const PlanCategoryCard: React.FC<PlanCategoryCardProps> = ({
  category = "workout",
  onPress,
}) => {
  let title = "";
  let description = "";
  let imageSource = null;
  let color: keyof typeof theme.colors = "PrimaryGrey";

  switch (category) {
    case "createWorkout":
      title = "Create Workouts";
      imageSource = require("assets/images/workout.png");
      color = "LightGreen";
      description = "You can create your own custom workouts.";
      break;
    case "createMealPlan":
      title = "Create Meal Plan";
      imageSource = require("assets/images/meal.png");
      color = "LightPink";
      description = "You can create your own meal plan.";
      break;
    case "workout":
      title = "Your Workout Routine";
      imageSource = require("assets/images/workout.png");
      color = "LightGreen";
      description = "Update your workout routine every 30days - 45days.";
      break;
    case "meal":
      title = "Your Meal Plan";
      imageSource = require("assets/images/meal.png");
      color = "LightPink";
      description = "Update your meal plan when ever you think its necessary.";
      break;
    case "generalWorkoutRoutine":
      title = "General Workouts";
      imageSource = require("assets/images/general-workout.png");
      color = "LightBlue";
      description =
        "Perform any workout routine based on your weekly schedule.";
      break;
    default:
      color = "PrimaryGrey";
      break;
  }

  return (
    <TouchableOpacity activeOpacity={constants.activeOpacity} onPress={onPress}>
      <Box
        borderRadius="sm"
        overflow="hidden"
        width={PAGE_WIDTH}
        backgroundColor="backgroundPrimary"
        borderWidth={4}
        flexDirection="row"
        borderColor={color || "LightBlue"}
        p="sm"
        my="sm"
      >
        <Box
          flex={1}
          p="base"
          gap="base"
          alignItems="center"
          flexDirection="row"
        >
          <Image
            resizeMode="cover"
            style={{ width: 60, height: 60 }}
            source={imageSource}
          />

          <Box flex={1} p="base" gap="xs" flexDirection="column">
            <Text variant="lgBold" color={color}>
              {title}
            </Text>
            <Text color="textSecondary">{description}</Text>
          </Box>
        </Box>
      </Box>
    </TouchableOpacity>
  );
};

export default PlanCategoryCard;
