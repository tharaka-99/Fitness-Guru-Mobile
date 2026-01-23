import React from "react";
import { Image } from "react-native";

import Box from "@components/atoms/Box";
import Button from "@components/atoms/Button";
import Text from "@components/atoms/Text";
import { useIsFocused } from "@react-navigation/native";

interface Props {
  onOptionSelected: (option: "generater" | "default") => void;
}

const WorkoutGenerateOptions: React.FC<Props> = ({ onOptionSelected }) => {
  return (
    <Box flex={1} justifyContent="center">
      <Box alignItems="center" gap="lg">
        <Image
          source={require("assets/images/gradient-dumbbell.png")}
          style={{ width: 140, height: 140 }}
          resizeMode="contain"
        />
        <Text variant="lg">Select Your Workout Routine</Text>
      </Box>

      <Box gap="base" mt="3xl">
        <Button
          title="Continue with Workout Generator"
          onPress={() => onOptionSelected("generater")}
        />
        <Button
          type="outline"
          title="Continue with Default Workouts"
          onPress={() => onOptionSelected("default")}
        />
      </Box>

      <Box mt="lg">
        <Text color="textSecondary" variant="xs" textAlign="center" px="sm">
          You can generate your own customised workout routines inside Fitness
          Guru Workout Generator based on your preference and equipment
          capacity.
        </Text>
      </Box>
    </Box>
  );
};

export default WorkoutGenerateOptions;
