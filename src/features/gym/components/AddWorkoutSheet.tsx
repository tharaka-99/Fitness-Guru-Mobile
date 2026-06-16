import { ChevronDown } from "lucide-react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useState } from "react";
import { Image, TouchableOpacity, ActivityIndicator } from "react-native";
import SelectDropdown from "react-native-select-dropdown";

import Box from "@components/atoms/Box";
import Text from "@components/atoms/Text";
import { constants, theme } from "@utils/styles/theme";
import { Exercises, SearchExercises } from "@utils/types/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  image: string;
  workoutName: SearchExercises;
  bottomSheetRef: React.RefObject<any>;
  onAddWorkout: (exercise: Exercises) => void;
  onClose?: () => void;
}

const loadingGif = require("assets/loading_gif.gif");

const AddWorkoutSheet: React.FC<Props> = ({
  image,
  workoutName,
  onAddWorkout,
  bottomSheetRef,
  onClose,
}) => {
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

  const [sets, setSets] = useState<number>(0);
  const [reps, setReps] = useState<number>(0);
  const [rest, setRest] = useState<number>(0);

  const handleAddWorkout = () => {
    if (sets && reps && rest) {
      const exercise: Exercises = {
        order: 0,
        exercise: workoutName,
        sets,
        reps,
        rest,
        url: workoutName.url,
      };
      onAddWorkout(exercise);
    }
  };

  const insets = useSafeAreaInsets();

  return (
    <BottomSheet
      index={0}
      // snapPoints={[500]}
      enableDynamicSizing
      ref={bottomSheetRef}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={sheetBackDrop}
      handleIndicatorStyle={{ backgroundColor: theme.colors.textPrimary }}
      backgroundStyle={{ backgroundColor: theme.colors.backgroundSecondary }}
    >
      <BottomSheetView
        style={{
          flex: 1,
          backgroundColor: theme.colors.backgroundSecondary,
          paddingBottom: insets.bottom,
        }}
      >
        <Box
          gap="md"
          p="base"
          borderRadius="sm"
          bg="backgroundSecondary"
          width={"99%"}
        >
          <Box gap="md" alignItems="center" justifyContent="center">
            <Box
              borderRadius="sm"
              overflow="hidden"
              alignItems="center"
              justifyContent="center"
              backgroundColor="SecondaryWhite"
            >
              {image ? (
                <Image
                  resizeMode="cover"
                  source={{ uri: image }}
                  style={{ width: 150, height: 150 }}
                />
              ) : (
                <Box
                  alignItems="center"
                  justifyContent="center"
                  style={{ width: 150, height: 150 }}
                >
                  <ActivityIndicator size={"large"} color="PrimaryGreen" />
                </Box>
              )}
            </Box>

            <Text
              variant="xlBold"
              numberOfLines={2}
              style={{ textTransform: "capitalize", textAlign: "center" }}
              ellipsizeMode="tail"
            >
              {workoutName.name}
            </Text>
          </Box>

          <Box gap="base" alignItems="center">
            <Box flexDirection="row" gap="sm" alignItems="center">
              <Box minWidth="25%">
                <Text variant="md">Sets Count</Text>
              </Box>
              <DropDown
                data={[...Array(50).keys()].map((i) => (i + 1).toString())}
                onSelect={(i) => setSets(Number(i))}
              />
            </Box>

            <Box flexDirection="row" gap="sm" alignItems="center">
              <Box minWidth="25%">
                <Text variant="md">Reps Count</Text>
              </Box>
              <DropDown
                data={[...Array(50).keys()].map((i) => (i + 1).toString())}
                onSelect={(i) => setReps(Number(i))}
              />
            </Box>

            <Box flexDirection="row" gap="sm" alignItems="center">
              <Box minWidth="25%">
                <Text variant="md">Rest Time (s)</Text>
              </Box>
              <DropDown
                data={[...Array(50).keys()].map((i) =>
                  ((i + 1) * 15).toString()
                )}
                onSelect={(i) => setRest(Number(i))}
              />
            </Box>
          </Box>

          <TouchableOpacity
            activeOpacity={constants.activeOpacity}
            onPress={() => handleAddWorkout()}
          >
            <Box py="sm" px="lg" alignItems="center">
              <Text color="PrimaryGreen" variant="mdBold">
                Add Exercise
              </Text>
            </Box>
          </TouchableOpacity>
        </Box>
      </BottomSheetView>
    </BottomSheet>
  );
};

export default AddWorkoutSheet;

interface DropDownProps {
  onSelect: (selectedItem: any, index: number) => void;
  data: any[];
}
const DropDown: React.FC<DropDownProps> = ({ data, onSelect }) => {
  return (
    <SelectDropdown
      data={data}
      disableAutoScroll
      onSelect={onSelect}
      defaultButtonText="Select"
      renderCustomizedButtonChild={(item) => (
        <Box flex={1} alignItems="center" justifyContent="center">
          <Text variant="sm" color={item ? "PrimaryBlack" : "textSecondary"}>
            {item ? item : "Select"}
          </Text>
        </Box>
      )}
      buttonStyle={{
        height: 45,
        borderRadius: theme.borderRadii.xs,
        paddingHorizontal: theme.spacing.base,
      }}
      buttonTextStyle={{ color: theme.colors.PrimaryBlack }}
      renderDropdownIcon={() => (
        <ChevronDown size={16} color={theme.colors.textSecondary} />
      )}
      renderCustomizedRowChild={(item) => (
        <Box
          flex={1}
          alignItems="center"
          justifyContent="center"
          backgroundColor="backgroundSecondary"
          borderBottomWidth={0}
        >
          <Text variant="sm">{item}</Text>
        </Box>
      )}
      dropdownStyle={{
        borderRadius: theme.borderRadii.xs,
        backgroundColor: theme.colors.backgroundSecondary,
      }}
      rowStyle={{
        borderBottomWidth: 0.4,
        borderBottomColor: theme.colors.border,
        backgroundColor: theme.colors.backgroundSecondary,
      }}
    />
  );
};
