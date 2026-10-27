import React from "react";
import { ActivityIndicator, Image } from "react-native";
import { Check } from "lucide-react-native";

import { PAGE_WIDTH } from "@components/app/PageWrapper";
import Box from "@components/atoms/Box";
import Text from "@components/atoms/Text";
import { theme as appTheme } from "@utils/styles/theme";

interface WorkoutListItemProps {
  image: string;
  title: string;
  description: string;
  theme?: "green" | "standard";
  isLogged?: boolean;
}

const IMAGE_SIZE = 65;

const WorkoutListItem: React.FC<WorkoutListItemProps> = React.memo(({
  image,
  title,
  description,
  theme = "standard",
  isLogged = false,
}) => {
  const isThemeGreen = theme === "green";

  return (
    // <Box gap="base" width={PAGE_WIDTH} flexDirection="row">
    <Box gap="base" flex={1} flexDirection="row" alignItems="center">
      <Box
        borderRadius="xs"
        width={IMAGE_SIZE}
        height={IMAGE_SIZE}
        overflow="hidden"
        // borderBottomWidth={isThemeGreen ? 0.5 : 0}
        borderWidth={isLogged ? 1.5 : (isThemeGreen ? 1 : undefined)}
        borderColor={isLogged ? "PrimaryGreen" : undefined}
      >
        {image ? (
          <Image
            resizeMode="cover"
            source={{ uri: image }}
            width={IMAGE_SIZE}
            height={IMAGE_SIZE}
          />
        ) : (
          <Box
            alignItems="center"
            justifyContent="center"
            width={IMAGE_SIZE}
            height={IMAGE_SIZE}
          >
            <ActivityIndicator size={"large"} color="PrimaryGreen" />
          </Box>
        )}
      </Box>
      <Box
        flex={1}
        alignItems="flex-start"
        justifyContent="center"
        borderBottomWidth={isThemeGreen ? 0 : 0.5}
        borderBottomColor="textSecondary"
      >
        <Text
          variant="mdBold"
          numberOfLines={1}
          color={isThemeGreen ? "PrimaryBlack" : isLogged ? "PrimaryGreen" : "textPrimary"}
          style={{ textTransform: "capitalize" }}
        >
          {title}
        </Text>
        <Text
          numberOfLines={1}
          color={isThemeGreen ? "PrimaryGrey" : "textSecondary"}
        >
          {description}
        </Text>
      </Box>
      {isLogged && (
        <Box pr="sm">
          <Check size={22} color={appTheme.colors.PrimaryGreen} />
        </Box>
      )}
    </Box>
  );
});

WorkoutListItem.displayName = 'WorkoutListItem';

export default WorkoutListItem;
