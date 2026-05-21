import React, { useCallback, useState } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import Box from "@components/atoms/Box";
import Text from "@components/atoms/Text";
import Button from "@components/atoms/Button";
import Select from "@components/atoms/Select";
//import TextInput from "@components/molecules/TextInput";
import { TextInput } from "react-native-paper";
import Input, { InputProps } from "@components/atoms/Input";
import { theme } from "@utils/styles/theme";
import { postMealReRequest } from "@utils/services/trainersService";
import { setClientProfileInfo } from "@utils/services/authServices";
import { Goal, ActivityLevel } from "@utils/types/trainersTypes";
import { Unit } from "@utils/types/types";
import Toast from "react-native-toast-message";
import InputLabel from "@components/atoms/InputLabel";
import { store } from "@/store";
import { authActions } from "@features/auth/context/slice";
import { gymActions } from "@features/gym/context/slice";

interface Props {
  bottomSheetRef: React.RefObject<BottomSheet>;
  onSuccess: () => void;
}

const MealReRequestSheet: React.FC<Props> = ({ bottomSheetRef, onSuccess }) => {
  const { user } = store.getState()["feature/auth"];
  const [formValues, setFormValues] = useState({
    goal: "",
    age: "",
    weight: "",
    height: "",
    activityLevel: "",
  });
  const [weightUnit, setWeightUnit] = useState(Unit.Metric);
  const [heightUnit, setHeightUnit] = useState(Unit.Metric);
  const [isLoading, setIsLoading] = useState(false);
  const [appUnit, setAppUnit] = useState<Unit>(Unit.Metric);

  const sheetBackDrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        opacity={0.7}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    [],
  );

  const handleUnitToggle = (newUnit: Unit) => {
    if (newUnit === appUnit) return;

    const w = parseFloat(formValues.weight as string) || 0;
    const h = parseFloat(formValues.height as string) || 0;

    const convertedWeight =
      newUnit === Unit.Imperial
        ? w > 0
          ? (w * 2.20462).toFixed(1)
          : ""
        : w > 0
          ? (w / 2.20462).toFixed(1)
          : "";

    const convertedHeight =
      newUnit === Unit.Imperial
        ? h > 0
          ? (h * 0.393701).toFixed(1)
          : ""
        : h > 0
          ? (h / 0.393701).toFixed(1)
          : "";

    setFormValues((prev) => ({
      ...prev,
      weight: convertedWeight.toString(),
      height: convertedHeight.toString(),
    }));

    setAppUnit(newUnit);
  };

  const toggleWeightUnit = (newUnit: Unit) => {
    const w = parseFloat(formValues.weight as string) || 0;
    const convertedWeight =
      newUnit === Unit.Imperial
        ? w > 0
          ? (w * 2.20462).toFixed(1)
          : ""
        : w > 0
          ? (w / 2.20462).toFixed(1)
          : "";

    setFormValues((prev) => ({
      ...prev,
      weight: convertedWeight.toString(),
    }));
    setWeightUnit(newUnit);
  };

  const toggleHeightUnit = (newUnit: Unit) => {
    const h = parseFloat(formValues.height as string) || 0;
    const convertedHeight =
      newUnit === Unit.Imperial
        ? h > 0
          ? (h * 0.393701).toFixed(1)
          : ""
        : h > 0
          ? (h / 0.393701).toFixed(1)
          : "";

    setFormValues((prev) => ({
      ...prev,
      height: convertedHeight.toString(),
    }));
    setHeightUnit(newUnit);
  };

  const handleSubmit = async () => {
    const { age, weight, height, goal } = formValues;
    if (!age || !weight || !height) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill in all fields",
      });
      return;
    }

    try {
      setIsLoading(true);

      const { user } = store.getState()["feature/auth"];

      const metricWeight =
        appUnit === Unit.Imperial
          ? Number((Number(weight) / 2.20462).toFixed(1))
          : Number(weight);
      const metricHeight =
        appUnit === Unit.Imperial
          ? Number((Number(height) / 0.393701).toFixed(1))
          : Number(height);

      await postMealReRequest({
        goal: formValues.goal as Goal,
        age: Number(age),
        weight: metricWeight,
        height: metricHeight,
        activityLevel: formValues.activityLevel as ActivityLevel,
      });

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Meal plan re-request created successfully",
      });
      onSuccess();
      bottomSheetRef.current?.close();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BottomSheet
      index={-1}
      snapPoints={["90%"]}
      ref={bottomSheetRef}
      enablePanDownToClose
      backdropComponent={sheetBackDrop}
      handleIndicatorStyle={{ backgroundColor: theme.colors.textPrimary }}
      backgroundStyle={{ backgroundColor: theme.colors.backgroundSecondary }}
      keyboardBehavior="interactive"
      android_keyboardInputMode="adjustResize"
      keyboardBlurBehavior="restore"
      enableHandlePanningGesture={true}
    >
      <BottomSheetView
        style={{ flex: 1, backgroundColor: theme.colors.backgroundSecondary }}
      >
        <ScrollView contentContainerStyle={{ padding: theme.spacing.md }}>
          <Box gap="md">
            <Text variant="xlBold" textAlign="center" mb="md">
              Meal Plan Re-Request
            </Text>
            <InputLabel label="Age" />
            <Input
              value={formValues.age as string}
              placeholder="Enter your age"
              keyboardType="number-pad"
              outlinecolor={theme.colors.SecondaryGrey}
              onChangeText={(val) =>
                setFormValues((prev) => ({ ...prev, age: val }))
              }
            />

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: -10,
                zIndex: 10,
              }}
            >
              <InputLabel
                label={`Weight in ${appUnit === Unit.Metric ? "kg" : "lbs"}`}
              />
              <Box
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: theme.colors.SecondaryGrey,
                  borderRadius: 6,
                }}
              >
                <TouchableOpacity
                  onPress={() =>
                    appUnit !== Unit.Metric && handleUnitToggle(Unit.Metric)
                  }
                  activeOpacity={0.7}
                  style={{
                    backgroundColor:
                      appUnit === Unit.Metric
                        ? theme.colors.PrimaryGreen
                        : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: theme.spacing.lg + 10,
                    minWidth: theme.spacing["3xl"] + 10,
                    paddingHorizontal: 10,
                    borderRadius: 4,
                    paddingVertical: 5,
                  }}
                >
                  <Text
                    style={{
                      color: theme.colors.PrimaryBlack,
                    }}
                  >
                    Metric
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    appUnit !== Unit.Imperial && handleUnitToggle(Unit.Imperial)
                  }
                  activeOpacity={0.7}
                  style={{
                    backgroundColor:
                      appUnit === Unit.Imperial
                        ? theme.colors.PrimaryGreen
                        : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: theme.spacing.lg + 10,
                    minWidth: theme.spacing["3xl"] + 10,
                    paddingHorizontal: 10,
                    borderRadius: 4,
                    paddingVertical: 5,
                  }}
                >
                  <Text
                    style={{
                      color: theme.colors.PrimaryBlack,
                    }}
                  >
                    Imperial
                  </Text>
                </TouchableOpacity>
              </Box>
            </View>

            <Input
              outlinecolor={theme.colors.SecondaryGrey}
              value={formValues.weight as string}
              keyboardType="number-pad"
              placeholder="Enter your weight"
              onChangeText={(val) =>
                setFormValues((prev) => ({ ...prev, weight: val }))
              }
            />

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: -10,
                zIndex: 10,
              }}
            >
              <InputLabel
                label={`Height in ${appUnit === Unit.Metric ? "cm" : "inches"}`}
              />
            </View>
            <Input
              value={formValues.height as string}
              keyboardType="number-pad"
              placeholder="Enter your height"
              outlinecolor={theme.colors.SecondaryGrey}
              onChangeText={(val) =>
                setFormValues((prev) => ({ ...prev, height: val }))
              }
            />

            <Select
              label="What is your fitness goal?"
              items={[
                { id: "1", option: "Weight Gain", value: Goal.WeightGain },
                { id: "2", option: "Fat Loss", value: Goal.FatLoss },
                { id: "3", option: "Maintenance", value: Goal.Maintenance },
                { id: "4", option: "Lean Gaining", value: Goal.LeanGaining },
                { id: "5", option: "Weight Loss", value: Goal.WeightLoss },
              ]}
              onSelect={(item) =>
                setFormValues((prev) => ({ ...prev, goal: item.value as Goal }))
              }
            />
            <Select
              label="Activity Level"
              items={[
                {
                  id: "1",
                  option: "Sedentary (No Exercise)",
                  value: ActivityLevel.Sedentary,
                },
                {
                  id: "2",
                  option: "Light (Exercise 1-2 days per week)",
                  value: ActivityLevel.Light,
                },
                {
                  id: "3",
                  option: "Moderate (Exercise 3-5 days per week)",
                  value: ActivityLevel.Moderate,
                },
                {
                  id: "4",
                  option: "Active (Exercise 6-7 days per week)",
                  value: ActivityLevel.Active,
                },
              ]}
              onSelect={(item) =>
                setFormValues((prev) => ({
                  ...prev,
                  activityLevel: item.value as ActivityLevel,
                }))
              }
            />

            <Box mt="md">
              <Button
                title={isLoading ? "Submitting..." : "Submit Request"}
                onPress={handleSubmit}
                disabled={isLoading}
              />
            </Box>
          </Box>
        </ScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
};

export default MealReRequestSheet;
