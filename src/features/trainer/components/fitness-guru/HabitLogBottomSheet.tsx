import React, { useCallback, useMemo, useState, useEffect } from "react";
import {
  Keyboard,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import Box from "@components/atoms/Box";
import Text from "@components/atoms/Text";
import { theme } from "@utils/styles/theme";
import { HabitData, LogHabitDto } from "@utils/types/habitTypes";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Scale,
  Footprints,
  Droplets,
  Moon,
  Plus,
  Equal,
} from "lucide-react-native";
import Toast from "react-native-toast-message";

const MAX_WATER_LITRES = 10;
const STEPS_CONFIRM_THRESHOLD = 50000;

interface Props {
  bottomSheetRef: React.RefObject<any>;
  habit: HabitData;
  onSave: (data: LogHabitDto) => void;
  isLoading?: boolean;
  dateLabel?: string;
}

const getHabitIcon = (type: string) => {
  switch (type) {
    case "weight":
      return <Scale size={22} color={theme.colors.PrimaryGreen} />;
    case "steps":
      return <Footprints size={22} color={theme.colors.PrimaryGreen} />;
    case "water":
      return <Droplets size={22} color={theme.colors.PrimaryGreen} />;
    case "sleep":
      return <Moon size={22} color={theme.colors.PrimaryGreen} />;
    default:
      return null;
  }
};

const HabitLogBottomSheet: React.FC<Props> = ({
  bottomSheetRef,
  habit,
  onSave,
  isLoading = false,
  dateLabel,
}) => {
  const snapPoints = useMemo(() => ["58%"], []);
  const insets = useSafeAreaInsets();

  // Mode: 'add' (adds to current value) or 'set' (overwrites current value directly)
  const [logMode, setLogMode] = useState<"add" | "set">("add");

  // Weight states (measurement)
  const [weightValue, setWeightValue] = useState("");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");

  // Steps state
  const [stepsInput, setStepsInput] = useState("");

  // Water state
  const [waterInput, setWaterInput] = useState("");

  // Sleep states
  const [sleepHoursInput, setSleepHoursInput] = useState("");
  const [sleepMinutesInput, setSleepMinutesInput] = useState("");

  // Reset inputs whenever selected habit changes
  useEffect(() => {
    if (!habit) return;

    // Default to 'add' mode if already logged, otherwise 'add' (which starts from 0)
    setLogMode(habit.logged ? "add" : "set");

    if (habit.type === "weight") {
      const initialVal =
        habit.currentValue > 0 ? habit.currentValue.toString() : "";
      setWeightValue(initialVal);
      setWeightUnit(
        habit.details?.weightUnit ||
          (habit.unit?.toLowerCase() === "lbs" ? "lbs" : "kg")
      );
    } else if (habit.type === "steps") {
      setStepsInput("");
    } else if (habit.type === "water") {
      setWaterInput("");
    } else if (habit.type === "sleep") {
      setSleepHoursInput("");
      setSleepMinutesInput("");
    }
  }, [habit]);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      Keyboard.dismiss();
    }
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.6}
      />
    ),
    []
  );

  // --- Calculations for live preview ---
  // Steps
  const currentSteps = habit.logged ? habit.currentValue : 0;
  const parsedStepsInput = parseInt(stepsInput || "0", 10);
  const calculatedTotalSteps =
    logMode === "add"
      ? currentSteps + (isNaN(parsedStepsInput) ? 0 : parsedStepsInput)
      : isNaN(parsedStepsInput)
      ? 0
      : parsedStepsInput;

  // Water
  const currentWater = habit.logged ? habit.currentValue : 0;
  const parsedWaterInput = parseFloat(waterInput || "0");
  const calculatedTotalWater = Number(
    (logMode === "add"
      ? currentWater + (isNaN(parsedWaterInput) ? 0 : parsedWaterInput)
      : isNaN(parsedWaterInput)
      ? 0
      : parsedWaterInput
    ).toFixed(2)
  );

  // Sleep
  const currentSleepHours = habit.logged
    ? habit.details?.sleepHours ?? Math.floor(habit.currentValue)
    : 0;
  const currentSleepMinutes = habit.logged
    ? habit.details?.sleepMinutes ?? Math.round((habit.currentValue % 1) * 60)
    : 0;
  const currentSleepTotalMinutes = currentSleepHours * 60 + currentSleepMinutes;

  const parsedSleepHoursInput = parseInt(sleepHoursInput || "0", 10);
  const parsedSleepMinutesInput = parseInt(sleepMinutesInput || "0", 10);
  const enteredSleepTotalMinutes =
    (isNaN(parsedSleepHoursInput) ? 0 : parsedSleepHoursInput) * 60 +
    (isNaN(parsedSleepMinutesInput) ? 0 : parsedSleepMinutesInput);

  const calculatedTotalSleepMinutes =
    logMode === "add"
      ? currentSleepTotalMinutes + enteredSleepTotalMinutes
      : enteredSleepTotalMinutes;

  const calculatedTotalSleepHours = Math.floor(
    calculatedTotalSleepMinutes / 60
  );
  const calculatedTotalSleepMins = calculatedTotalSleepMinutes % 60;

  const handleSubmit = () => {
    Keyboard.dismiss();

    if (habit.type === "weight") {
      const parsed = parseFloat(weightValue);
      if (isNaN(parsed) || parsed <= 0) {
        Toast.show({
          type: "error",
          text1: "Invalid Weight",
          text2: "Please enter a valid weight number.",
        });
        return;
      }
      onSave({
        type: "weight",
        value: Number(parsed.toFixed(1)),
        unit: weightUnit,
      });
    } else if (habit.type === "steps") {
      const entered = parseInt(stepsInput || "0", 10);
      if (isNaN(entered) || entered <= 0) {
        Toast.show({
          type: "error",
          text1: "Invalid Steps",
          text2: "Please enter steps to log.",
        });
        return;
      }

      const saveSteps = () =>
        onSave({
          type: "steps",
          steps: calculatedTotalSteps,
        });

      if (calculatedTotalSteps > STEPS_CONFIRM_THRESHOLD) {
        Alert.alert(
          "Very high step count",
          `This will log ${calculatedTotalSteps.toLocaleString()} steps, which is above ${STEPS_CONFIRM_THRESHOLD.toLocaleString()}. Do you want to save it?`,
          [
            { text: "Cancel", style: "cancel" },
            { text: "Save", onPress: saveSteps },
          ]
        );
        return;
      }

      saveSteps();
    } else if (habit.type === "water") {
      const entered = parseFloat(waterInput || "0");
      if (isNaN(entered) || entered <= 0) {
        Toast.show({
          type: "error",
          text1: "Invalid Water",
          text2: "Please enter water amount in litres.",
        });
        return;
      }

      if (calculatedTotalWater > MAX_WATER_LITRES) {
        const remaining = Math.max(0, MAX_WATER_LITRES - currentWater);
        Toast.show({
          type: "error",
          text1: "Water limit exceeded",
          text2:
            logMode === "add"
              ? `Daily total can't exceed ${MAX_WATER_LITRES} L. You can add up to ${remaining.toFixed(
                  2
                )} L more.`
              : `Daily total can't exceed ${MAX_WATER_LITRES} L.`,
        });
        return;
      }

      onSave({
        type: "water",
        consumed: calculatedTotalWater,
      });
    } else if (habit.type === "sleep") {
      const hours = parseInt(sleepHoursInput || "0", 10);
      const minutes = parseInt(sleepMinutesInput || "0", 10);
      if (isNaN(hours) || hours < 0 || hours > 24) {
        Toast.show({
          type: "error",
          text1: "Invalid Hours",
          text2: "Please enter valid hours (0-24).",
        });
        return;
      }
      if (isNaN(minutes) || minutes < 0 || minutes > 59) {
        Toast.show({
          type: "error",
          text1: "Invalid Minutes",
          text2: "Minutes must be between 0 and 59.",
        });
        return;
      }
      if (hours === 0 && minutes === 0) {
        Toast.show({
          type: "error",
          text1: "Invalid Sleep",
          text2: "Please enter hours or minutes.",
        });
        return;
      }
      onSave({
        type: "sleep",
        hours: calculatedTotalSleepHours,
        minutes: calculatedTotalSleepMins,
      });
    }
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: theme.colors.backgroundSecondary }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.borderSecondary }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      bottomInset={insets.bottom}
    >
      <BottomSheetView style={{ flex: 1, padding: theme.spacing.lg }}>
        {/* Header */}
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          mb="md"
        >
          <Box flexDirection="row" alignItems="center">
            <Box
              width={40}
              height={40}
              borderRadius="full"
              alignItems="center"
              justifyContent="center"
              mr="sm"
              style={{ backgroundColor: "rgba(160, 226, 32, 0.2)" }}
            >
              {getHabitIcon(habit.type)}
            </Box>
            <Box>
              <Text variant="xlBold" style={{ textTransform: "capitalize" }}>
                Log {habit.type}
              </Text>
              <Text variant="xs" color="textSecondary">
                {dateLabel ? `${dateLabel} • ` : ""}
                {habit.type === "weight" && "Record body weight"}
                {habit.type === "steps" && "Daily target: 10,000 steps"}
                {habit.type === "water" &&
                  "Target based on your weight (Liters)"}
                {habit.type === "sleep" && "Target: 8 hours (480 minutes)"}
              </Text>
            </Box>
          </Box>
        </Box>

        {habit.type !== "weight" && habit.logged && (
          <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="flex-end"
            borderRadius="sm"
            p="xs"
            mb="md"
          >
            <TouchableOpacity
              style={{
                paddingVertical: 4,
                paddingHorizontal: 8,
                borderRadius: 4,
                backgroundColor:
                  logMode === "add"
                    ? theme.colors.PrimaryGreen
                    : theme.colors.PrimaryBlack,
              }}
              onPress={() => setLogMode("add")}
            >
              <Text
                variant="md"
                style={{
                  color:
                    logMode === "add"
                      ? theme.colors.PrimaryBlack
                      : theme.colors.textSecondary,
                }}
              >
                Add
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                paddingVertical: 4,
                paddingHorizontal: 8,
                borderRadius: 4,
                backgroundColor:
                  logMode === "set"
                    ? theme.colors.PrimaryGreen
                    : theme.colors.PrimaryBlack,
              }}
              onPress={() => setLogMode("set")}
            >
              <Text
                variant="md"
                style={{
                  color:
                    logMode === "set"
                      ? theme.colors.PrimaryBlack
                      : theme.colors.textSecondary,
                }}
              >
                Replace
              </Text>
            </TouchableOpacity>
          </Box>
        )}

        {/* Current Value Indicator if logged */}
        {habit.logged && habit.type !== "weight" && (
          <Box
            p="sm"
            borderRadius="md"
            mb="md"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Text variant="xs" color="textSecondary">
              Current Logged {dateLabel ? `(${dateLabel})` : "Today"}:
            </Text>
            <Text variant="smBold" color="PrimaryGreen">
              {habit.formattedValue}
            </Text>
          </Box>
        )}

        {/* --- WEIGHT --- */}
        {habit.type === "weight" && (
          <Box mb="md">
            <Box
              flexDirection="row"
              alignItems="center"
              backgroundColor="PrimaryBlack"
              borderRadius="md"
              p="md"
              borderWidth={1}
              borderColor="borderSecondary"
            >
              <BottomSheetTextInput
                style={{
                  flex: 1,
                  color: theme.colors.textPrimary,
                  fontSize: 28,
                  fontWeight: "bold",
                }}
                keyboardType="decimal-pad"
                value={weightValue}
                onChangeText={setWeightValue}
                placeholder="0.0"
                placeholderTextColor={theme.colors.textSecondary}
              />
              <Box
                flexDirection="row"
                backgroundColor="backgroundSecondary"
                borderRadius="sm"
                p="xs"
              >
                <TouchableOpacity
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 6,
                    backgroundColor:
                      weightUnit === "kg"
                        ? theme.colors.PrimaryGreen
                        : "transparent",
                  }}
                  onPress={() => setWeightUnit("kg")}
                >
                  <Text
                    variant="xsBold"
                    style={{
                      color:
                        weightUnit === "kg"
                          ? theme.colors.PrimaryBlack
                          : theme.colors.textSecondary,
                    }}
                  >
                    kg
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 6,
                    backgroundColor:
                      weightUnit === "lbs"
                        ? theme.colors.PrimaryGreen
                        : "transparent",
                  }}
                  onPress={() => setWeightUnit("lbs")}
                >
                  <Text
                    variant="xsBold"
                    style={{
                      color:
                        weightUnit === "lbs"
                          ? theme.colors.PrimaryBlack
                          : theme.colors.textSecondary,
                    }}
                  >
                    lbs
                  </Text>
                </TouchableOpacity>
              </Box>
            </Box>
          </Box>
        )}

        {/* --- STEPS --- */}
        {habit.type === "steps" && (
          <Box mb="md">
            <Box
              flexDirection="row"
              alignItems="center"
              backgroundColor="PrimaryBlack"
              borderRadius="md"
              p="md"
              borderWidth={1}
              borderColor="borderSecondary"
            >
              <Text variant="xlBold" color="PrimaryGreen" mr="xs">
                {logMode === "add" ? "+" : ""}
              </Text>
              <BottomSheetTextInput
                style={{
                  flex: 1,
                  color: theme.colors.textPrimary,
                  fontSize: 28,
                  fontWeight: "bold",
                }}
                keyboardType="number-pad"
                value={stepsInput}
                onChangeText={setStepsInput}
                placeholder={
                  logMode === "add" ? "Add steps" : "Set total steps"
                }
                placeholderTextColor={theme.colors.textSecondary}
                autoFocus
              />
              <Text variant="md" color="textSecondary">
                steps
              </Text>
            </Box>

            {/* Quick Increment Chips */}
            <Box flexDirection="row" gap="xs" mt="sm">
              {[500, 1000, 2500, 5000].map((inc) => (
                <TouchableOpacity
                  key={inc}
                  style={{
                    backgroundColor: theme.colors.PrimaryBlack,
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: theme.colors.borderSecondary,
                  }}
                  onPress={() => {
                    const current = parseInt(stepsInput || "0", 10);
                    setStepsInput((current + inc).toString());
                  }}
                >
                  <Text variant="xs" color="textSecondary">
                    +{inc.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </Box>
          </Box>
        )}

        {/* --- WATER --- */}
        {habit.type === "water" && (
          <Box mb="md">
            <Box
              flexDirection="row"
              alignItems="center"
              backgroundColor="PrimaryBlack"
              borderRadius="md"
              p="md"
              borderWidth={1}
              borderColor="borderSecondary"
            >
              <Text variant="xlBold" color="PrimaryGreen" mr="xs">
                {logMode === "add" ? "+" : ""}
              </Text>
              <BottomSheetTextInput
                style={{
                  flex: 1,
                  color: theme.colors.textPrimary,
                  fontSize: 28,
                  fontWeight: "bold",
                }}
                keyboardType="decimal-pad"
                value={waterInput}
                onChangeText={setWaterInput}
                placeholder={
                  logMode === "add" ? "Add water" : "Set total water"
                }
                placeholderTextColor={theme.colors.textSecondary}
                autoFocus
              />
              <Text variant="md" color="textSecondary">
                Litres
              </Text>
            </Box>

            {/* Quick Increment Chips */}
            <Box flexDirection="row" gap="xs" mt="sm">
              {[0.25, 0.5, 0.75, 1.0].map((inc) => (
                <TouchableOpacity
                  key={inc}
                  style={{
                    backgroundColor: theme.colors.PrimaryBlack,
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: theme.colors.borderSecondary,
                  }}
                  onPress={() => {
                    const current = parseFloat(waterInput || "0");
                    const base = logMode === "add" ? currentWater : 0;
                    const next = current + inc;

                    if (base + next > MAX_WATER_LITRES) {
                      Toast.show({
                        type: "error",
                        text1: "Water limit exceeded",
                        text2: `Total can't exceed ${MAX_WATER_LITRES} L.`,
                      });
                      return;
                    }
                    setWaterInput(next.toFixed(2));
                  }}
                >
                  <Text variant="xs" color="textSecondary">
                    +{inc} L
                  </Text>
                </TouchableOpacity>
              ))}
            </Box>
          </Box>
        )}

        {/* --- SLEEP --- */}
        {habit.type === "sleep" && (
          <Box mb="md">
            <Box flexDirection="row" gap="md">
              <Box
                flex={1}
                backgroundColor="PrimaryBlack"
                borderRadius="md"
                p="md"
                borderWidth={1}
                borderColor="borderSecondary"
              >
                <Text variant="xs" color="textSecondary" mb="xs">
                  {logMode === "add" ? "+ Hours" : "Hours"}
                </Text>
                <BottomSheetTextInput
                  style={{
                    color: theme.colors.textPrimary,
                    fontSize: 28,
                    fontWeight: "bold",
                  }}
                  keyboardType="number-pad"
                  value={sleepHoursInput}
                  onChangeText={setSleepHoursInput}
                  placeholder="0"
                  placeholderTextColor={theme.colors.textSecondary}
                  maxLength={2}
                />
              </Box>

              <Box
                flex={1}
                backgroundColor="PrimaryBlack"
                borderRadius="md"
                p="md"
                borderWidth={1}
                borderColor="borderSecondary"
              >
                <Text variant="xs" color="textSecondary" mb="xs">
                  {logMode === "add" ? "+ Minutes" : "Minutes"}
                </Text>
                <BottomSheetTextInput
                  style={{
                    color: theme.colors.textPrimary,
                    fontSize: 28,
                    fontWeight: "bold",
                  }}
                  keyboardType="number-pad"
                  value={sleepMinutesInput}
                  onChangeText={setSleepMinutesInput}
                  placeholder="0"
                  placeholderTextColor={theme.colors.textSecondary}
                  maxLength={2}
                />
              </Box>
            </Box>

            {/* Live Calculation Preview Banner */}
            {logMode === "add" &&
              currentSleepTotalMinutes > 0 &&
              (sleepHoursInput !== "" || sleepMinutesInput !== "") && (
                <Box
                  mt="md"
                  p="sm"
                  backgroundColor="backgroundSecondary"
                  borderRadius="md"
                  borderWidth={1}
                  borderColor="PrimaryGreen"
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Text variant="xs" color="textSecondary">
                    {currentSleepHours}h {currentSleepMinutes}m +{" "}
                    {parsedSleepHoursInput}h {parsedSleepMinutesInput}m
                  </Text>
                  <Text variant="smBold" color="PrimaryGreen">
                    Total: {calculatedTotalSleepHours}h{" "}
                    {calculatedTotalSleepMins}m
                  </Text>
                </Box>
              )}
          </Box>
        )}

        {/* Save CTA */}
        <TouchableOpacity
          style={{
            backgroundColor: theme.colors.PrimaryGreen,
            padding: theme.spacing.md,
            borderRadius: theme.borderRadii.md,
            alignItems: "center",
            justifyContent: "center",
            marginTop: "auto",
            flexDirection: "row",
            opacity: isLoading ? 0.7 : 1,
          }}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator
              size="small"
              color={theme.colors.PrimaryBlack}
              style={{ marginRight: 8 }}
            />
          ) : null}
          <Text variant="mdBold" style={{ color: theme.colors.PrimaryBlack }}>
            {isLoading
              ? "Saving..."
              : logMode === "add" && habit.type !== "weight" && habit.logged
              ? `Save (Total: ${
                  habit.type === "steps"
                    ? `${calculatedTotalSteps.toLocaleString()} steps`
                    : habit.type === "water"
                    ? `${calculatedTotalWater} L`
                    : `${calculatedTotalSleepHours}h ${calculatedTotalSleepMins}m`
                })`
              : "Save Entry"}
          </Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default HabitLogBottomSheet;
