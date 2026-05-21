import React, { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity } from "react-native";

import Box from "@components/atoms/Box";
import Text from "@components/atoms/Text";
import { ActivityIndicator, Divider } from "react-native-paper";
import { theme } from "@utils/styles/theme";
import Button from "@components/atoms/Button";
import { Unit } from "@utils/types/types";
import { LogSetDto } from "@utils/types/analyticsTypes";
import useSubscription from "@features/subscription/hooks/useSubscription";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";

interface Props {
  sets: number;
  reps: number;
  submitRecord: (data: LogSetDto[]) => void;
  isLoading: boolean;
  alreadyLogged: boolean | undefined;
}

const LogSetsCard: React.FC<Props> = ({
  sets,
  submitRecord,
  isLoading,
  alreadyLogged,
}) => {
  const { isSubscribed } = useSubscription();
  const navigation = useNavigation<any>();
  const today = new Date();
  const dateStr = today
    .toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    .toLocaleUpperCase();

  const [logSets, setLogSets] = useState<LogSetDto[]>(
    Array(sets)
      .fill({
        setNo: 0,
        unit: Unit.Metric,
        totalWeight: 0,
        totalReps: 0,
      })
      .map((_, index) => ({
        setNo: index + 1,
        unit: Unit.Metric,
        totalWeight: 0,
        totalReps: 0,
      }))
  );

  // Update set data based on input
  const handleChange = (index: number, field: keyof LogSetDto, value: any) => {
    // Convert string to number for numeric fields, handle empty string as 0
    const numericValue =
      field === "totalWeight" || field === "totalReps"
        ? value === ""
          ? 0
          : Number(value) || 0
        : value;

    setLogSets((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: numericValue } : item
      )
    );
  };

  const handleRecord = () => {
    if (!isSubscribed) {
      Toast.show({
        type: "info",
        text1: "Subscription Required",
        text2: "Please subscribe to save your workouts.",
      });
      navigation.push("PricingPackages");
      return;
    }
    submitRecord(logSets);
  };

  return (
    <Box p="sm" gap="base">
      <Box flexDirection="row" justifyContent="space-between" alignItems="center">
        <Text style={styles.dateText}>{dateStr}</Text>
        <Box
          height={35}
          width={100}
          backgroundColor="SecondaryWhite"
          borderRadius="xs"
          flexDirection="row"
        >
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor:
                logSets[0]?.unit === Unit.Metric
                  ? theme.colors.PrimaryGreen
                  : "transparent",
              borderRadius: theme.borderRadii.xs,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() =>
              setLogSets((prev) =>
                prev.map((item) => ({ ...item, unit: Unit.Metric }))
              )
            }
          >
            <Text
              variant="sm"
              color="PrimaryBlack"

            >
              kg
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor:
                logSets[0]?.unit === Unit.Imperial
                  ? theme.colors.PrimaryGreen
                  : "transparent",
              borderRadius: theme.borderRadii.xs,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() =>
              setLogSets((prev) =>
                prev.map((item) => ({ ...item, unit: Unit.Imperial }))
              )
            }
          >
            <Text
              variant="sm"
              color="PrimaryBlack"

            >
              lb
            </Text>
          </TouchableOpacity>
        </Box>
      </Box>
      <Divider />

      <Box
        flexDirection="row"
        justifyContent="space-around"
        marginVertical="base"
        gap="2xl"
      >
        <Text variant="mdBold">Set</Text>
        <Text variant="mdBold">Weight</Text>
        <Text variant="mdBold">Reps</Text>
      </Box>

      {logSets.map((set, index) => (
        <Box
          key={index}
          flexDirection="row"
          justifyContent="space-around"
          alignItems="center"
        >
          <Box
            p="md"
            backgroundColor={alreadyLogged ? "SecondaryGrey" : "PrimaryGreen"}
            borderRadius="xs"
          >
            <Text color="PrimaryBlack">{index + 1}</Text>
          </Box>
          <Box
            backgroundColor="PrimaryWhite"
            flexDirection="column"
            borderRadius="xs"
            width={"40%"}
          >
            <Box
              backgroundColor={alreadyLogged ? "SecondaryGrey" : "PrimaryGreen"}
              p="base"
              borderTopRightRadius="xs"
              borderTopLeftRadius="xs"
              justifyContent="center"
              alignItems="center"
            >
              <Text color="PrimaryBlack">Total Weight</Text>
            </Box>
            <Box
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              paddingRight="base"
              paddingBottom="sm"
            >
              <TextInput
                placeholder="Weight"
                keyboardType="numeric"
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                value={set.totalWeight === 0 ? "" : String(set.totalWeight)}
                onChangeText={(text) =>
                  handleChange(index, "totalWeight", text)
                }
                editable={!alreadyLogged}
              />
              <Text variant="sm" color="textSecondary">
                {set.unit === Unit.Metric ? "kg" : "lb"}
              </Text>
            </Box>
          </Box>
          <Box
            backgroundColor="PrimaryWhite"
            flexDirection="column"
            borderRadius="xs"
          >
            <Box
              backgroundColor={alreadyLogged ? "SecondaryGrey" : "PrimaryGreen"}
              p="base"
              borderTopRightRadius="xs"
              borderTopLeftRadius="xs"
              justifyContent="center"
              alignItems="center"
            >
              <Text color="PrimaryBlack">Total Reps</Text>
            </Box>
            <TextInput
              placeholder="Reps"
              keyboardType="numeric"
              style={styles.input}
              value={set.totalReps === 0 ? "" : String(set.totalReps)}
              onChangeText={(text) => handleChange(index, "totalReps", text)}
              editable={!alreadyLogged}
            />
          </Box>
        </Box>
      ))}

      <Box mt="lg" gap="base">
        {isLoading && <ActivityIndicator color={theme.colors.PrimaryWhite} />}
        {!alreadyLogged ? (
          <>
            <Button
              title={isLoading ? "Adding your logs.." : "Record Workout"}
              onPress={handleRecord}
            />
            <Text color="textSecondary" textAlign="center" mt="sm">
              You can record your sets daily to keep track of your progress
            </Text>
          </>
        ) : (
          <Text color="textSecondary" textAlign="center" mt="sm">
            You've already recorded today's sets! Keep up the great work and
            track your progress tomorrow.
          </Text>
        )}
      </Box>
    </Box>
  );
};

export default LogSetsCard;

const styles = StyleSheet.create({
  dateText: {
    color: theme.colors.textSecondary,
  },
  input: {
    height: 40,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
});
