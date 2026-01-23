import React from "react";
import { ActivityIndicator, Image } from "react-native";

import Box from "@components/atoms/Box";
import Text from "@components/atoms/Text";

interface Props {
  workoutInfo: {
    image: string;
    workoutName: string | undefined;
    description: string | undefined;
    additionalInfo: {
      title: string | undefined;
      value: string | undefined;
    }[];
  };
}

const WorkoutInfoCard: React.FC<Props> = ({ workoutInfo }) => {
  const { workoutName, description, image, additionalInfo } = workoutInfo;

  return (
    <Box p="md" alignItems="center" gap="base">
      <Box borderRadius="sm" overflow="hidden">
        {image ? (
          <Image
            resizeMode="cover"
            source={{ uri: image }}
            width={350}
            height={350}
          />
        ) : (
          <Box
            alignItems="center"
            justifyContent="center"
            width={350}
            height={350}
          >
            <ActivityIndicator size={"large"} color="PrimaryGreen" />
          </Box>
        )}
      </Box>

      <Text
        variant="xlBold"
        style={{ textTransform: "capitalize", textAlign: "center" }}
      >
        {workoutName}
      </Text>

      <Box
        gap="sm"
        flexWrap="wrap"
        flexDirection="row"
        alignItems="center"
        justifyContent="center"
      >
        {additionalInfo?.map(({ title, value }, index) => (
          <Box
            px="lg"
            py="base"
            // width="30%"
            key={index}
            borderRadius="sm"
            style={{ gap: -4 }}
            alignItems="center"
            justifyContent="center"
            backgroundColor="SecondaryWhite"
          >
            <Text color="PrimaryBlack" variant="lgBold">
              {value}
            </Text>
            <Text color="PrimaryBlack" variant="xs">
              {title}
            </Text>
          </Box>
        ))}
      </Box>

      <Text
        color="textSecondary"
        textAlign="left"
        mt="sm"
        style={{ textAlign: "center" }}
      >
        {description}
      </Text>
    </Box>
  );
};

export default WorkoutInfoCard;
