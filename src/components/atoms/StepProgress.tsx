import React, { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  SharedValue,
} from "react-native-reanimated";

import Box from "@components/atoms/Box";
import Text from "@components/atoms/Text";
import { TouchableOpacity } from "react-native";

const AnimatedBox = Animated.createAnimatedComponent(Box);
interface StepIndicatorProps {
  index: number;
  step: number;
  currentStep: number;
  animatedCurrentStep: SharedValue<number>;
  handleBackNavigation: (index: number) => void;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  index,
  step,
  currentStep,
  animatedCurrentStep,
  handleBackNavigation,
}) => {
  const stepStyle = useAnimatedStyle(() => {
    const scale =
      index === animatedCurrentStep.value ? withSpring(1.1) : withSpring(0.95);
    return {
      transform: [{ scale }],
    };
  });

  const getStepColor = (idx: number) => {
    if (idx < currentStep) {
      return "PrimaryGreen";
    } else if (idx === currentStep) {
      return "SecondaryGrey";
    } else {
      return "PrimaryGrey";
    }
  };

  const getTextColor = (idx: number) => {
    if (idx < currentStep) {
      return "textPrimaryBlack";
    } else {
      return "textPrimary";
    }
  };

  return (
    <TouchableOpacity onPress={() => handleBackNavigation(index)}>
      <AnimatedBox
        width={45}
        height={45}
        borderRadius="full"
        alignItems="center"
        justifyContent="center"
        style={[stepStyle]}
        backgroundColor={getStepColor(index)}
      >
        <Text variant="mdBold" color={getTextColor(index)}>
          {step}
        </Text>
      </AnimatedBox>
    </TouchableOpacity>
  );
};

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

  useEffect(() => {
    animatedCurrentStep.value = withTiming(currentStep, {
      duration: 100,
      easing: Easing.inOut(Easing.ease),
    });
  }, [currentStep, animatedCurrentStep]);

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
        <StepIndicator
          key={step}
          index={index}
          step={step}
          currentStep={currentStep}
          animatedCurrentStep={animatedCurrentStep}
          handleBackNavigation={handlBackNavigation}
        />
      ))}
    </Box>
  );
};

export default StepProgress;
