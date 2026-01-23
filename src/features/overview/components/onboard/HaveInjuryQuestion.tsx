import React from "react";
import { Image, TouchableOpacity } from "react-native";

import Box from "@components/atoms/Box";
import Text from "@components/atoms/Text";
import { constants } from "@utils/styles/theme";

interface Props {
  onAnswer?: (haveInjury: boolean) => void;
}

const HaveInjuryQuestion: React.FC<Props> = ({ onAnswer }) => {
  const ImageSize = 110;
  return (
    <Box gap="lg" mt="md">
      <Text variant="lgBold" textAlign="center" px="sm">
        Do you have any {"\n"} health issues or injuries?
      </Text>

      <Box gap="md">
        <TouchableOpacity
          activeOpacity={constants.activeOpacity}
          onPress={() => onAnswer && onAnswer(true)}
        >
          <Box
            py="xl"
            gap="base"
            borderRadius="sm"
            alignItems="center"
            bg="backgroundSecondary"
          >
            <Image
              source={require("assets/images/red-weight-lifter.png")}
              style={{ width: ImageSize, height: ImageSize }}
              resizeMode="contain"
            />
            <Text
              variant="lgBold"
              color="PrimaryRed"
              textAlign="center"
              textTransform="uppercase"
            >
              Yes I Have {"\n"} Some Injuries
            </Text>
          </Box>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={constants.activeOpacity}
          onPress={() => onAnswer && onAnswer(false)}
        >
          <Box
            py="xl"
            gap="base"
            borderRadius="sm"
            alignItems="center"
            bg="backgroundSecondary"
          >
            <Image
              source={require("assets/images/yellow-weight-lifter.png")}
              style={{ width: ImageSize, height: ImageSize }}
              resizeMode="contain"
            />
            <Text
              variant="lgBold"
              textAlign="center"
              color="PrimaryYellow"
              textTransform="uppercase"
            >
              No I Don't Have {"\n"} Any Injuries
            </Text>
          </Box>
        </TouchableOpacity>
      </Box>
    </Box>
  );
};

export default HaveInjuryQuestion;
