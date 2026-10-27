import React from "react";
import { TouchableOpacity } from "react-native";
import Box from "@components/atoms/Box";
import Text from "@components/atoms/Text";
import { theme } from "@utils/styles/theme";
import { HabitType } from "@utils/types/habitTypes";
import {
  ProcessedDayPoint,
  toISODate,
  isHabitDayEditable,
} from "../../hooks/useHabitHistory";
import { Check, Edit3, Plus } from "lucide-react-native";
import Toast from "react-native-toast-message";

interface Props {
  habitType: HabitType;
  points: ProcessedDayPoint[];
  onLogEntry: (point: ProcessedDayPoint) => void;
}

export const HabitLogHistoryList: React.FC<Props> = ({
  habitType,
  points,
  onLogEntry,
}) => {
  // Sort in reverse chronological order (latest date first)
  const sortedPoints = React.useMemo(() => {
    return [...points].reverse();
  }, [points]);

  const todayStr = React.useMemo(() => {
    return toISODate(new Date());
  }, []);

  const yesterdayStr = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return toISODate(d);
  }, []);

  return (
    <Box mt="md" mb="xl">
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        mb="md"
      >
        <Text variant="lgBold" color="textPrimary">
          Log History
        </Text>
        <Text variant="xs" color="textSecondary">
          {sortedPoints.filter((p) => p.isLogged).length} recorded
        </Text>
      </Box>

      {sortedPoints.map((point) => {
        const isToday = point.dateString === todayStr;
        const isYesterday = point.dateString === yesterdayStr;
        const isEditable = isToday;
        const dateTag = isToday ? "Today" : "";

        return (
          <TouchableOpacity
            key={`log-row-${point.dateString}`}
            activeOpacity={isEditable ? 0.7 : 1}
            onPress={() => {
              if (isEditable) {
                onLogEntry(point);
              } else {
                Toast.show({
                  type: "info",
                  text1:
                    habitType === "weight" ? "Weight Log" : "Habit History",
                  text2:
                    habitType === "weight"
                      ? "Only today's weight can be logged or edited."
                      : "Only today and yesterday can be logged or edited.",
                });
              }
            }}
          >
            <Box
              backgroundColor="backgroundSecondary"
              borderRadius="sm"
              p="md"
              mb="sm"
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              style={{
                borderLeftWidth: 3,
                borderLeftColor: point.isGoalMet
                  ? theme.colors.PrimaryGreen
                  : point.isLogged
                  ? theme.colors.SecondaryGrey
                  : "transparent",
                opacity: isEditable || point.isLogged ? 1 : 0.6,
              }}
            >
              {/* Left Column: Date & Status */}
              <Box flex={1}>
                <Box flexDirection="row" alignItems="center">
                  <Text variant="mdBold" color="textPrimary">
                    {point.fullDate}
                  </Text>
                  {dateTag ? (
                    <Box
                      backgroundColor="PrimaryBlack"
                      px="xs"
                      py="none"
                      borderRadius="xs"
                      ml="xs"
                      style={{ paddingHorizontal: 6, paddingVertical: 2 }}
                    >
                      <Text
                        variant="xsBold"
                        color="PrimaryGreen"
                        style={{ fontSize: 9 }}
                      >
                        {dateTag}
                      </Text>
                    </Box>
                  ) : null}
                </Box>

                {/* Status Badge */}
                <Box flexDirection="row" alignItems="center" mt="xs">
                  {point.isGoalMet ? (
                    <Box flexDirection="row" alignItems="center">
                      <Check size={12} color={theme.colors.PrimaryGreen} />
                      <Text
                        variant="xs"
                        color="PrimaryGreen"
                        ml="xs"
                        style={{ fontSize: 11 }}
                      >
                        {habitType === "weight" ? "Recorded" : "Goal Reached"}
                      </Text>
                    </Box>
                  ) : point.isLogged ? (
                    <Text
                      variant="xs"
                      color="textSecondary"
                      style={{ fontSize: 11 }}
                    >
                      Logged • In Progress
                    </Text>
                  ) : (
                    <Text
                      variant="xs"
                      color="SecondaryGrey"
                      style={{ fontSize: 11 }}
                    >
                      Not logged
                    </Text>
                  )}
                </Box>
              </Box>

              {/* Right Column: Value & Edit Action */}
              <Box alignItems="flex-end">
                {point.isLogged ? (
                  <Text variant="mdBold" color="textPrimary">
                    {point.formattedValue}
                  </Text>
                ) : (
                  <Text variant="sm" color="textSecondary">
                    --
                  </Text>
                )}

                {habitType !== "weight" && point.target > 0 && (
                  <Text
                    variant="xs"
                    color="textSecondary"
                    mt="xs"
                    style={{ fontSize: 10 }}
                  >
                    Target: {point.target} {point.unit}
                  </Text>
                )}

                {isEditable && (
                  <Box flexDirection="row" alignItems="center" mt="xs">
                    {point.isLogged ? (
                      <Box flexDirection="row" alignItems="center">
                        <Edit3 size={12} color={theme.colors.SecondaryGrey} />
                        <Text
                          variant="xs"
                          color="textSecondary"
                          ml="xs"
                          style={{ fontSize: 10 }}
                        >
                          Edit
                        </Text>
                      </Box>
                    ) : (
                      <Box flexDirection="row" alignItems="center">
                        <Plus size={12} color={theme.colors.PrimaryGreen} />
                        <Text
                          variant="xs"
                          color="PrimaryGreen"
                          ml="xs"
                          style={{ fontSize: 10 }}
                        >
                          Log
                        </Text>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          </TouchableOpacity>
        );
      })}
    </Box>
  );
};

export default HabitLogHistoryList;
