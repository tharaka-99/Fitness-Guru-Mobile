import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useCallback } from "react";
import { ActivityIndicator, Image } from "react-native";

import Box from "@components/atoms/Box";
import Text from "@components/atoms/Text";
import { theme } from "@utils/styles/theme";

interface Props {
  bottomSheetRef: React.RefObject<BottomSheet>;
  workoutInfo: {
    image: string;
    workoutName: string | undefined;
    description: string | undefined;
    additionalInfo: {
      title: string | undefined;
      value: string | undefined;
    }[];
  };
}

const WorkoutInfoSheet: React.FC<Props> = ({ bottomSheetRef, workoutInfo }) => {
  const { workoutName, description, image, additionalInfo } = workoutInfo;

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

  return (
    <BottomSheet
      index={-1}
      snapPoints={["60%", "85%"]}
      ref={bottomSheetRef}
      enableDynamicSizing
      enablePanDownToClose
      backdropComponent={sheetBackDrop}
      backgroundStyle={{ backgroundColor: theme.colors.backgroundSecondary }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.textPrimary }}
    >
      <BottomSheetView
        style={{ flex: 1, backgroundColor: theme.colors.backgroundSecondary }}
      >
        <Box p="md" alignItems="center" gap="base">
          <Box borderRadius="sm" overflow="hidden">
            {image ? (
              <Image
                resizeMode="cover"
                source={{ uri: image }}
                width={150}
                height={150}
              />
            ) : (
              <Box
                alignItems="center"
                justifyContent="center"
                width={150}
                height={150}
              >
                <ActivityIndicator size={"large"} color="PrimaryGreen" />
              </Box>
            )}
          </Box>

          <Text variant="xlBold">{workoutName}</Text>

          <Box
            gap="base"
            flexWrap="wrap"
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
          >
            {additionalInfo?.map(({ title, value }, index) => (
              <Box
                px="lg"
                py="base"
                width="30%"
                key={index}
                borderRadius="sm"
                style={{ gap: -4 }}
                alignItems="center"
                justifyContent="center"
                backgroundColor="SecondaryWhite"
              >
                <Text color="PrimaryBlack" variant="lgBold">
                  {value}
                </Text>
                <Text color="PrimaryBlack" variant="xs">
                  {title}
                </Text>
              </Box>
            ))}
          </Box>

          <Text color="textSecondary" textAlign="left" mt="sm">
            {description}
          </Text>
        </Box>
      </BottomSheetView>
    </BottomSheet>
  );
};

export default WorkoutInfoSheet;
