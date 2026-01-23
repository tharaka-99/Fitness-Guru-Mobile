import { ChevronUp, ChevronDown } from "lucide-react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useEffect, useState } from "react";
import { Image, TouchableOpacity, Keyboard } from "react-native";


import Box from "@components/atoms/Box";
import Text from "@components/atoms/Text";
import { constants, theme } from "@utils/styles/theme";
// import TextInput from '@components/molecules/TextInput';


interface Props {
  unit: string;
  image: string;
  mealName: string;
  caloriesPerUnit: string;
  bottomSheetRef: React.RefObject<BottomSheet>;
  handleAddMealItem?: any;
  selectedMealItemcount: number;
}


const IMAGE_SIZE = 110;


const AddMealSheet: React.FC<Props> = ({
  unit,
  image,
  mealName,
  caloriesPerUnit,
  bottomSheetRef,
  handleAddMealItem,
  selectedMealItemcount,
}) => {
  const [count, setCount] = useState(selectedMealItemcount);
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


  useEffect(() => {
    setCount(selectedMealItemcount);
  }, [selectedMealItemcount]);


  return (
    <BottomSheet
      index={-1}
      snapPoints={[300]}
      ref={bottomSheetRef}
      enablePanDownToClose
      backdropComponent={sheetBackDrop}
      handleIndicatorStyle={{ backgroundColor: theme.colors.textPrimary }}
      backgroundStyle={{ backgroundColor: theme.colors.backgroundSecondary }}
      onClose={() => {
        setCount(0);
        // Keyboard.dismiss();
      }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      enableHandlePanningGesture={true}
    >
      <BottomSheetView
        style={{
          flex: 1,
          backgroundColor: theme.colors.backgroundSecondary,
        }}
      >
        <Box gap="lg" p="base" borderRadius="sm" bg="backgroundSecondary">
          <Box
            gap="md"
            flexDirection="row"
            alignItems="flex-start"
            justifyContent="center"
          >
            <Box
              borderRadius="sm"
              overflow="hidden"
              alignItems="center"
              height={IMAGE_SIZE}
              justifyContent="center"
              width={IMAGE_SIZE * 1.2}
              backgroundColor="SecondaryWhite"
            >
              <Image
                resizeMode="cover"
                source={{ uri: image }}
                width={IMAGE_SIZE * 0.8}
                height={IMAGE_SIZE * 0.8}
              />
            </Box>


            <Box gap="xs" flex={1}>
              <Text
                variant="xlBold"
                numberOfLines={1}
                style={{ textTransform: "capitalize" }}
              >
                {mealName}
              </Text>
              <Text variant="md" numberOfLines={1}>
                {unit}
              </Text>
              <Text variant="md" color="textSecondary" numberOfLines={1}>
                {caloriesPerUnit}
              </Text>
            </Box>
          </Box>


          <Box
            gap="md"
            height={60}
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
          >
            <ArrowButton direction="up" onPress={() => setCount(count + 50)} />


            <Box
              // px="lg"
              width="30%"
              height="100%"
              borderRadius="xs"
              borderWidth={1}
              borderColor="PrimaryWhite"
            >
              <BottomSheetTextInput
                value={count.toString()}
                keyboardType="number-pad"
                onChangeText={(e) => {
                  if (e === "" || e === "0") {
                    setCount(0);
                  } else {
                    setCount(Math.max(0, +e));
                  }
                }}
                placeholder="0"
                style={{
                  fontSize: theme.textVariants.lg.fontSize,
                  alignItems: "center",
                  justifyContent: "center",
                  color: theme.colors.PrimaryWhite,
                  width: "100%",
                  height: "100%",
                  paddingLeft: theme.spacing.md,
                }}
              />
            </Box>


            <ArrowButton
              direction="down"
              onPress={() => setCount(Math.max(0, count - 50))}
            />
          </Box>


          <TouchableOpacity
            activeOpacity={constants.activeOpacity}
            onPress={() => handleAddMealItem(count)}
          >
            <Box py="sm" px="lg" alignItems="center">
              <Text color="PrimaryGreen" variant="mdBold">
                Add Meal
              </Text>
            </Box>
          </TouchableOpacity>
        </Box>
      </BottomSheetView>
    </BottomSheet>
  );
};


export default AddMealSheet;


interface ArrowButtonProps {
  direction: "up" | "down";
  onPress?: () => void;
}


const ArrowButton: React.FC<ArrowButtonProps> = ({
  onPress,
  direction = "up",
}) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={constants.activeOpacity}>
      <Box
        px="md"
        height="100%"
        borderRadius="xs"
        alignItems="center"
        justifyContent="center"
        backgroundColor="PrimaryGreen"
      >
        {direction === "up" ? (
          <ChevronUp color="white" size={20} />
        ) : (
          <ChevronDown color="white" size={20} />
        )}
      </Box>
    </TouchableOpacity>
  );
};



