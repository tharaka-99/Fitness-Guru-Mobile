import React, { useCallback, useState } from "react";
import { TouchableOpacity, ScrollView } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import Box from "@components/atoms/Box";
import Text from "@components/atoms/Text";
import Button from "@components/atoms/Button";
import Select from "@components/atoms/Select";
import { theme } from "@utils/styles/theme";
import { postMealReRequest } from "@utils/services/trainersService";
import { Goal } from "@utils/types/trainersTypes";
import Toast from "react-native-toast-message";

interface Props {
  bottomSheetRef: React.RefObject<BottomSheet>;
  onSuccess: () => void;
}

const MealReRequestSheet: React.FC<Props> = ({ bottomSheetRef, onSuccess }) => {
  const [formValues, setFormValues] = useState({
    goal: Goal.WeightLoss,
    age: "",
    weight: "",
    height: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const sheetBackDrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        opacity={0.7}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    []
  );

  const handleSubmit = async () => {
    const { age, weight, height, goal } = formValues;
    if (!age || !weight || !height) {
      Toast.show({ type: "error", text1: "Error", text2: "Please fill in all fields" });
      return;
    }

    try {
      setIsLoading(true);
      await postMealReRequest({
        goal,
        age: Number(age),
        weight: Number(weight),
        height: Number(height),
      });

      Toast.show({ type: "success", text1: "Success", text2: "Meal plan re-request created successfully" });
      onSuccess();
      bottomSheetRef.current?.close();
    } catch (error: any) {
      Toast.show({ type: "error", text1: "Error", text2: error.message || "Something went wrong" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BottomSheet
      index={-1}
      snapPoints={["70%"]}
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
      <BottomSheetView style={{ flex: 1, backgroundColor: theme.colors.backgroundSecondary }}>
        <ScrollView contentContainerStyle={{ padding: theme.spacing.md, paddingBottom: 100 }}>
          <Box gap="md">
            <Text variant="xlBold" textAlign="center" mb="md">Meal Plan Re-Request</Text>

            <Select
              label="What is your fitness goal?"
              items={[
                { id: "1", option: "Weight Gain", value: Goal.WeightGain },
                { id: "2", option: "Weight Loss", value: Goal.WeightLoss },
                { id: "3", option: "Maintenance", value: Goal.Maintenance },
              ]}
              onSelect={(item) => setFormValues(prev => ({ ...prev, goal: item.value as Goal }))}
            />

            <Box>
              <Text variant="md" mb="xs">Age</Text>
              <Box borderWidth={1} borderColor="borderSecondary" borderRadius="xs" p="xs" backgroundColor="backgroundSecondary">
                <BottomSheetTextInput
                  value={formValues.age}
                  onChangeText={(val) => setFormValues(prev => ({ ...prev, age: val }))}
                  placeholder="Enter your age"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="number-pad"
                  style={{ color: theme.colors.PrimaryWhite, padding: theme.spacing.sm, fontSize: 16 }}
                />
              </Box>
            </Box>

            <Box>
              <Text variant="md" mb="xs">Weight (kg)</Text>
              <Box borderWidth={1} borderColor="borderSecondary" borderRadius="xs" p="xs" backgroundColor="backgroundSecondary">
                <BottomSheetTextInput
                  value={formValues.weight}
                  onChangeText={(val) => setFormValues(prev => ({ ...prev, weight: val }))}
                  placeholder="Enter weight in kg"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="number-pad"
                  style={{ color: theme.colors.PrimaryWhite, padding: theme.spacing.sm, fontSize: 16 }}
                />
              </Box>
            </Box>

            <Box>
              <Text variant="md" mb="xs">Height (cm)</Text>
              <Box borderWidth={1} borderColor="borderSecondary" borderRadius="xs" p="xs" backgroundColor="backgroundSecondary">
                <BottomSheetTextInput
                  value={formValues.height}
                  onChangeText={(val) => setFormValues(prev => ({ ...prev, height: val }))}
                  placeholder="Enter height in cm"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="number-pad"
                  style={{ color: theme.colors.PrimaryWhite, padding: theme.spacing.sm, fontSize: 16 }}
                />
              </Box>
            </Box>

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
