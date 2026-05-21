import React, { useCallback, useState } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { ChevronDown } from "lucide-react-native";
import SelectDropdown from "react-native-select-dropdown";
import TextInput from "@components/molecules/TextInput";
import { Unit } from "@utils/types/types";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
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

const WorkoutReRequestSheet: React.FC<Props> = ({
  bottomSheetRef,
  onSuccess,
}) => {
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
    [],
  );

  const handleImageUpload = (
    name: keyof typeof images,
    value: string | string[],
  ) => {
    setImages((prev) => ({
      ...prev,
      [name]: Array.isArray(value) ? value : [value],
    }));
  };

  const handleSubmit = async () => {
    if (!workoutDaysPerWeek) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter workout days per week",
      });
      return;
    }

    if (
      !images.frontView.length ||
      !images.backView.length ||
      !images.sideView.length ||
      !images.lowerBodyView.length
    ) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please upload all 4 body images",
      });
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

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Workout re-request created successfully",
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
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      enableHandlePanningGesture={true}
    >
      <BottomSheetView
        style={{ flex: 1, backgroundColor: theme.colors.backgroundSecondary }}
      >
        <ScrollView contentContainerStyle={{ padding: theme.spacing.md }}>
          <Box gap="md">
            <Text variant="xlBold" textAlign="center" mb="md">
              Workout Re-Request
            </Text>

            <Box>
              <Text variant="md" mb="xs">
                Workout Days Per Week
              </Text>
              <SelectDropdown
                data={["1", "2", "3", "4", "5", "6"]}
                onSelect={(selectedItem) => setWorkoutDaysPerWeek(selectedItem)}
                defaultButtonText="Select Days"
                buttonStyle={{
                  width: "100%",
                  height: 50,
                  backgroundColor: theme.colors.backgroundSecondary,
                  borderRadius: theme.borderRadii.xs,
                  borderWidth: 1,
                  borderColor: theme.colors.SecondaryGrey,
                }}
                renderCustomizedButtonChild={(selectedItem) => (
                  <Box
                    flex={1}
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="space-between"
                    paddingHorizontal="sm"
                  >
                    <Text
                      variant="sm"
                      color={selectedItem ? "textPrimary" : "textSecondary"}
                    >
                      {selectedItem
                        ? `${selectedItem} Day${selectedItem !== "1" ? "s" : ""}`
                        : "Select Days"}
                    </Text>
                    <ChevronDown size={18} color={theme.colors.textSecondary} />
                  </Box>
                )}
                dropdownStyle={{
                  marginTop: -20,
                  backgroundColor: theme.colors.backgroundSecondary,
                  borderRadius: theme.borderRadii.xs,
                }}
                rowStyle={{
                  borderBottomColor: theme.colors.borderSecondary,
                  borderBottomWidth: 1,
                }}
                renderCustomizedRowChild={(item) => (
                  <Box
                    flex={1}
                    paddingLeft="xl"
                    alignItems="flex-start"
                    justifyContent="center"
                    paddingVertical="sm"
                  >
                    <Text variant="sm" color="textPrimary">
                      {item} Day{item !== "1" ? "s" : ""}
                    </Text>
                  </Box>
                )}
              />
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
