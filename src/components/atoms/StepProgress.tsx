import React, { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import Box from "@components/atoms/Box";
import Text from "@components/atoms/Text";
import { TouchableOpacity } from "react-native";

const AnimatedBox = Animated.createAnimatedComponent(Box);

interface StepProgressProps {
  currentStep: number;
  stepsCount: number;
  handleBackStep: (index: number) => void;
}

const StepProgress: React.FC<StepProgressProps> = ({
  currentStep,
  stepsCount,
  handleBackStep,
}) => {
  const animatedCurrentStep = useSharedValue(currentStep);

  const stepStyles = (index: number) =>
    useAnimatedStyle(() => {
      const scale =
        index === animatedCurrentStep.value
          ? withSpring(1.1)
          : withSpring(0.95);
      return {
        transform: [{ scale }],
      };
    });

  useEffect(() => {
    animatedCurrentStep.value = withTiming(currentStep, {
      duration: 100,
      easing: Easing.inOut(Easing.ease),
    });
  }, [currentStep]);

  const getStepColor = (index: number) => {
    if (index < currentStep) {
      return "PrimaryGreen";
    } else if (index === currentStep) {
      return "SecondaryGrey";
    } else {
      return "PrimaryGrey";
    }
  };

  const getTextColor = (index: number) => {
    if (index < currentStep) {
      return "textPrimaryBlack";
    } else {
      return "textPrimary";
    }
  };

  const handlBackNavigation = (index: number) => {
    if (index < currentStep) handleBackStep(index);
  };
  const steps = Array.from({ length: stepsCount }, (_, index) => index + 1);

  return (
    <Box
      py="sm"
      gap="lg"
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
    >
      {steps?.map((step, index) => (
        <TouchableOpacity onPress={() => handlBackNavigation(index)} key={step}>
          <AnimatedBox
            width={45}
            height={45}
            borderRadius="full"
            alignItems="center"
            justifyContent="center"
            style={[stepStyles(index)]}
            backgroundColor={getStepColor(index)}
          >
            <Text variant="mdBold" color={getTextColor(index)}>
              {step}
            </Text>
          </AnimatedBox>
        </TouchableOpacity>
      ))}
    </Box>
  );
};

export default StepProgress;
