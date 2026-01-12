import React from "react";
import { Image } from "react-native";

import { PAGE_WIDTH } from "@components/app/PageWrapper";
import Box from "@components/atoms/Box";
import Text from "@components/atoms/Text";
import { theme as appTheme } from "@utils/styles/theme";

interface MealsListItemProps {
  image: string;
  title: string;
  description: string;
  theme?: "green" | "standard";
  unitCount?: string;
}

const IMAGE_SIZE = 55;

const MealsListItem: React.FC<MealsListItemProps> = ({
  image,
  title,
  unitCount,
  description,
  theme = "standard",
}) => {
  const isThemeGreen = theme === "green";

  return (
    <Box gap="base" width={PAGE_WIDTH} flexDirection="row">
      <Box
        borderRadius="xs"
        width={IMAGE_SIZE}
        height={IMAGE_SIZE}
        overflow="hidden"
        alignItems="center"
        justifyContent="center"
        backgroundColor={isThemeGreen ? "PrimaryGrey" : "SecondaryWhite"}
      >
        <Image
          resizeMode="cover"
          source={{ uri: image }}
          width={IMAGE_SIZE / 1.5}
          height={IMAGE_SIZE / 1.5}
        />
      </Box>

      <Box
        pr="md"
        alignItems="flex-start"
        justifyContent="center"
        borderBottomColor="textSecondary"
        borderBottomWidth={isThemeGreen ? undefined : 0.5}
        width={PAGE_WIDTH - IMAGE_SIZE - appTheme.spacing.base}
      >
        <Text
          variant="mdBold"
          numberOfLines={1}
          color={isThemeGreen ? "PrimaryBlack" : "textPrimary"}
          style={{ textTransform: "capitalize" }}
        >
          {title}
        </Text>

        {!unitCount && (
          <Text
            numberOfLines={1}
            color={isThemeGreen ? "PrimaryBlack" : "textSecondary"}
          >
            {description}
          </Text>
        )}

        {unitCount && (
          <Box flexWrap="nowrap" flexDirection="row" alignItems="center">
            <Box flex={1}>
              <Text
                color={isThemeGreen ? "PrimaryBlack" : "textSecondary"}
                numberOfLines={1}
              >
                {description}
              </Text>
            </Box>

            <Box flex={0.5} alignItems="flex-end">
              <Text
                variant="xsBold"
                numberOfLines={1}
                color={isThemeGreen ? "PrimaryBlack" : "textSecondary"}
              >
                {unitCount}
              </Text>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MealsListItem;
