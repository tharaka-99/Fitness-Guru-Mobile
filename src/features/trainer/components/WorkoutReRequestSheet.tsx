import React, { useCallback, useState } from "react";
import { TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import Box from "@components/atoms/Box";
import Text from "@components/atoms/Text";
import Button from "@components/atoms/Button";
import ImageInput from "@components/atoms/ImageInput";
import { theme, constants } from "@utils/styles/theme";
import { postWorkoutReRequest } from "@utils/services/trainersService";
import Toast from "react-native-toast-message";

interface Props {
  bottomSheetRef: React.RefObject<BottomSheet>;
  onSuccess: () => void;
}

const WorkoutReRequestSheet: React.FC<Props> = ({ bottomSheetRef, onSuccess }) => {
  const [workoutDaysPerWeek, setWorkoutDaysPerWeek] = useState("");
  const [images, setImages] = useState<{
    frontView: string[];
    backView: string[];
    sideView: string[];
    lowerBodyView: string[];
  }>({
    frontView: [],
    backView: [],
    sideView: [],
    lowerBodyView: [],
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

  const handleImageUpload = (name: keyof typeof images, value: string | string[]) => {
    setImages((prev) => ({
      ...prev,
      [name]: Array.isArray(value) ? value : [value],
    }));
  };

  const handleSubmit = async () => {
    if (!workoutDaysPerWeek) {
      Toast.show({ type: "error", text1: "Error", text2: "Please enter workout days per week" });
      return;
    }

    if (!images.frontView.length || !images.backView.length || !images.sideView.length || !images.lowerBodyView.length) {
      Toast.show({ type: "error", text1: "Error", text2: "Please upload all 4 body images" });
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("workoutDaysPerWeek", workoutDaysPerWeek);

      formData.append("frontView", {
        uri: images.frontView[0],
        name: "frontView.jpg",
        type: "image/jpeg",
      } as any);

      formData.append("backView", {
        uri: images.backView[0],
        name: "backView.jpg",
        type: "image/jpeg",
      } as any);

      formData.append("sideView", {
        uri: images.sideView[0],
        name: "sideView.jpg",
        type: "image/jpeg",
      } as any);

      formData.append("lowerBodyView", {
        uri: images.lowerBodyView[0],
        name: "lowerBodyView.jpg",
        type: "image/jpeg",
      } as any);

      await postWorkoutReRequest(formData);

      Toast.show({ type: "success", text1: "Success", text2: "Workout re-request created successfully" });
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
      snapPoints={["90%"]}
      ref={bottomSheetRef}
      enablePanDownToClose
      backdropComponent={sheetBackDrop}
      handleIndicatorStyle={{ backgroundColor: theme.colors.textPrimary }}
      backgroundStyle={{ backgroundColor: theme.colors.backgroundSecondary }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      enableHandlePanningGesture={true}
    >
      <BottomSheetView style={{ flex: 1, backgroundColor: theme.colors.backgroundSecondary }}>
        <ScrollView contentContainerStyle={{ padding: theme.spacing.md }}>
          <Box gap="md">
            <Text variant="xlBold" textAlign="center" mb="md">Workout Request</Text>

            <Box>
              <Text variant="md" mb="xs">Workout Days Per Week</Text>
              <Box
                borderWidth={1}
                borderColor="borderSecondary"
                borderRadius="xs"
                p="xs"
                backgroundColor="backgroundSecondary"
              >
                <BottomSheetTextInput
                  value={workoutDaysPerWeek}
                  onChangeText={setWorkoutDaysPerWeek}
                  placeholder="Enter number (e.g. 5)"
                  keyboardType="number-pad"
                  placeholderTextColor={theme.colors.textSecondary}
                  style={{
                    color: theme.colors.PrimaryWhite,
                    padding: theme.spacing.sm,
                    fontSize: 16,
                  }}
                />
              </Box>
            </Box>

            <Box gap="sm">
              <ImageInput
                label="Front View"
                selectionLimit={1}
                onImageUpload={(val) => handleImageUpload("frontView", val)}
              />
              <ImageInput
                label="Back View"
                selectionLimit={1}
                onImageUpload={(val) => handleImageUpload("backView", val)}
              />
              <ImageInput
                label="Side View"
                selectionLimit={1}
                onImageUpload={(val) => handleImageUpload("sideView", val)}
              />
              <ImageInput
                label="Lower Body View"
                selectionLimit={1}
                onImageUpload={(val) => handleImageUpload("lowerBodyView", val)}
              />
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

export default WorkoutReRequestSheet;
