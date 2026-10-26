import { ArrowRight, Check } from "lucide-react-native";
import React from "react";
import { TouchableOpacity } from "react-native";

import { PAGE_WIDTH } from "@components/app/PageWrapper";
import Box from "@components/atoms/Box";
import Text from "@components/atoms/Text";
import { constants, theme } from "@utils/styles/theme";

interface Props {
  title: string;
  description: string;
  onPress?: () => void;
  isActiveSession?: boolean;
  isSessionInProgress?: boolean;
  isCompleted?: boolean;
  isDailyLocked?: boolean;
}

const WorkoutDayCard: React.FC<Props> = ({
  title,
  description,
  onPress,
  isActiveSession,
  isSessionInProgress,
  isCompleted,
  isDailyLocked,
}) => {
  const isDisabled = isSessionInProgress && !isActiveSession;
  const opacity = isDisabled ? 0.5 : 1;

  return (
    <TouchableOpacity
      //disabled={isDisabled}
      activeOpacity={constants.activeOpacity}
      onPress={onPress}
    >
      <Box
        mb="sm"
        height={80}
        borderRadius="sm"
        overflow="hidden"
        width={PAGE_WIDTH}
        flexDirection="row"
        backgroundColor="backgroundSecondary"
        alignItems="center"
        justifyContent="space-between"
        px="md"
        borderWidth={1}
        borderColor="PrimaryGreyDark"
        // style={{ opacity }}
      >
        <Box flex={1} mr="sm" justifyContent="center" gap="xs">
          <Box flexDirection="row" alignItems="center" gap="xs">
            <Text variant="mdBold" numberOfLines={1}>
              {title}
            </Text>
            {isCompleted && (
              <Box
                backgroundColor="PrimaryGreen"
                px="sm"
                borderRadius="full"
                ml="xs"
                style={{ paddingVertical: 2 }}
              >
                <Text
                  variant="xs"
                  color="PrimaryBlack"
                  style={{ fontWeight: "700" }}
                >
                  Completed
                </Text>
              </Box>
            )}
          </Box>
          <Text
            color="textSecondary"
            numberOfLines={1}
            style={{ textTransform: "capitalize" }}
          >
            {description}
          </Text>
        </Box>

        <Box
          width={44}
          height={44}
          borderRadius="full"
          alignItems="center"
          justifyContent="center"
          backgroundColor={isCompleted ? "PrimaryGreen" : undefined}
          style={
            !isCompleted
              ? { backgroundColor: "rgba(160, 226, 32, 0.15)" }
              : undefined
          }
        >
          {isCompleted ? (
            <Check
              size={22}
              color={theme.colors.PrimaryBlack}
              strokeWidth={3}
            />
          ) : (
            <ArrowRight size={22} color={theme.colors.PrimaryGreen} />
          )}
        </Box>
      </Box>
    </TouchableOpacity>
  );
};

export default WorkoutDayCard;
