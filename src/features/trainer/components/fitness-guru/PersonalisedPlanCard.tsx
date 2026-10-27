import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Svg, { Line } from "react-native-svg";
import { Check, Clock } from "lucide-react-native";
import Box from "@components/atoms/Box";
import Text from "@components/atoms/Text";
import { theme, constants } from "@utils/styles/theme";
import Button from "@components/atoms/Button";

export type OnboardingStage = "requesting" | "pending";

interface PersonalisedPlanCardProps {
  stage: OnboardingStage;
  onCompleteProfile?: () => void;
}

interface StepConfig {
  stepNumber: number;
  title: string;
  description: string;
}

const STEPS: StepConfig[] = [
  {
    stepNumber: 1,
    title: "Tell Us About Yourself",
    description: "Complete your fitness profile and upload your body photos.",
  },
  {
    stepNumber: 2,
    title: "Your Plans Are Taking Shape",
    description:
      "Our trainers review your details and create your workout and meal plans.",
  },
  {
    stepNumber: 3,
    title: "Ready to Start Your Journey",
    description: "Explore your personalised schedules and start your journey.",
  },
];

const PersonalisedPlanCard: React.FC<PersonalisedPlanCardProps> = ({
  stage,
  onCompleteProfile,
}) => {
  const isPending = stage === "pending";
  const completedCount = isPending ? 1 : 0;

  const getStepState = (stepNumber: number) => {
    if (stepNumber === 1) {
      return isPending ? "completed" : "action_needed";
    }
    if (stepNumber === 2) {
      return isPending ? "in_progress" : "upcoming";
    }
    return "upcoming";
  };

  const renderBadge = (
    status: "completed" | "action_needed" | "in_progress" | "upcoming"
  ) => {
    switch (status) {
      case "completed":
        return (
          <Box
            borderRadius="sm"
            px="sm"
            py="xs"
            style={{ backgroundColor: "rgba(160, 226, 32, 0.15)" }}
          >
            <Text variant="xsBold" color="PrimaryGreen">
              Completed
            </Text>
          </Box>
        );
      case "action_needed":
        return (
          <Box
            borderRadius="sm"
            px="sm"
            py="xs"
            style={{ backgroundColor: "rgba(255, 237, 177, 0.15)" }}
          >
            <Text variant="xsBold" style={{ color: "#fcba03" }}>
              Action needed
            </Text>
          </Box>
        );
      case "in_progress":
        return (
          <Box
            borderRadius="sm"
            px="sm"
            py="xs"
            style={{ backgroundColor: "rgba(255, 237, 177, 0.15)" }}
          >
            <Text variant="xsBold" style={{ color: "#fcba03" }}>
              In progress
            </Text>
          </Box>
        );
      case "upcoming":
      default:
        return (
          <Box
            borderRadius="sm"
            px="sm"
            py="xs"
            backgroundColor="borderSecondary"
          >
            <Text variant="xs" color="textSecondary">
              Upcoming
            </Text>
          </Box>
        );
    }
  };

  const renderIndicator = (stepNumber: number, status: string) => {
    if (status === "completed") {
      return (
        <Box
          width={44}
          height={44}
          borderRadius="full"
          backgroundColor="PrimaryGreen"
          alignItems="center"
          justifyContent="center"
        >
          <Check size={22} color={theme.colors.PrimaryBlack} strokeWidth={3} />
        </Box>
      );
    }

    if (status === "action_needed" || status === "in_progress") {
      return (
        <Box
          width={44}
          height={44}
          borderRadius="full"
          borderWidth={2}
          borderColor="PrimaryYellow"
          alignItems="center"
          justifyContent="center"
          style={{ borderColor: "#fcba03" }}
        >
          <Text variant="lgBold" style={{ color: "#fcba03" }}>
            {stepNumber}
          </Text>
        </Box>
      );
    }

    return (
      <Box
        width={44}
        height={44}
        borderRadius="full"
        borderWidth={2}
        borderColor="borderSecondary"
        alignItems="center"
        justifyContent="center"
      >
        <Text variant="lgBold" color="SecondaryWhite">
          {stepNumber}
        </Text>
      </Box>
    );
  };

  return (
    <Box
      flex={1}
      mx="md"
      px="md"
      pt="md"
      borderRadius="lg"
      backgroundColor="backgroundSecondary"
      borderWidth={1}
      borderColor="borderSecondary"
    >
      {/* Header */}
      <Text variant="xlBold" color="textPrimary">
        Your Personalised Plan
      </Text>
      <Text variant="sm" color="textSecondary" mt="xs" mb="md">
        {completedCount} of 3 complete
      </Text>

      {/* Stepper List */}
      <View style={styles.stepperContainer}>
        {STEPS.map((step, index) => {
          const status = getStepState(step.stepNumber);
          const isLast = index === STEPS.length - 1;

          return (
            <View key={step.stepNumber} style={styles.stepRow}>
              {/* Left Column: Indicator + Connector */}
              <View style={styles.leftColumn}>
                {renderIndicator(step.stepNumber, status)}
                {!isLast && (
                  <Box flex={1} width={2} my="xs" overflow="hidden">
                    <Svg height="100%" width="2">
                      <Line
                        x1="1"
                        y1="0"
                        x2="1"
                        y2="2000"
                        stroke={theme.colors.borderSecondary}
                        strokeWidth="2"
                        strokeDasharray="4 4"
                      />
                    </Svg>
                  </Box>
                )}
              </View>

              {/* Right Column: Badge, Title, Description */}
              <Box flex={1} ml="md" pb={isLast ? "none" : "lg"}>
                <Box alignItems="flex-start" mb="xs">
                  {renderBadge(status)}
                </Box>
                <Text variant="mdBold" color="textPrimary" mb="xs">
                  {step.title}
                </Text>
                <Text variant="xs" color="textSecondary" lineHeight={18}>
                  {step.description}
                </Text>
              </Box>
            </View>
          );
        })}
      </View>

      {/* Bottom Footer Section */}
      {isPending ? (
        <Box
          flexDirection="row"
          alignItems="center"
          backgroundColor="borderSecondary"
          borderWidth={1}
          borderColor="borderSecondary"
          borderRadius="md"
          p="md"
          mt="xl"
          mb="md"
        >
          <Box
            width={38}
            height={38}
            borderRadius="full"
            borderWidth={2}
            borderColor="PrimaryGreen"
            alignItems="center"
            justifyContent="center"
          >
            <Clock
              size={20}
              color={theme.colors.PrimaryGreen}
              strokeWidth={2.2}
            />
          </Box>
          <Box ml="md" flex={1}>
            <Text variant="smBold" color="textPrimary">
              Your details have been submitted.
            </Text>
            <Text variant="xs" color="textSecondary" mt="xs">
              Your personalised plans are being prepared.
            </Text>
          </Box>
        </Box>
      ) : (
        // <TouchableOpacity
        //   style={{
        //     backgroundColor: theme.colors.PrimaryGreen,
        //     borderRadius: theme.borderRadii.md,
        //     height: 52,
        //     alignItems: 'center',
        //     justifyContent: 'center',
        //     marginTop: theme.spacing.lg,
        //   }}
        //   activeOpacity={constants.activeOpacity}
        //   onPress={onCompleteProfile}
        // >
        //   <Text variant="mdBold" color="textPrimaryBlack">
        //     Complete My Profile
        //   </Text>
        // </TouchableOpacity>
        <Box mt="md">
          <Button onPress={onCompleteProfile} title="Complete My Profile" />
        </Box>
      )}
      {/* <Box height={100} /> */}
    </Box>
  );
};

const styles = StyleSheet.create({
  stepperContainer: {
    flex: 1,
    justifyContent: "space-between",
    width: "100%",
  },
  stepRow: {
    flex: 1,
    flexDirection: "row",
  },
  leftColumn: {
    alignItems: "center",
    width: 44,
  },
});

export default PersonalisedPlanCard;
