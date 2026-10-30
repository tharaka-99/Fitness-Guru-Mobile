import {
  BicepsFlexed,
  CirclePlus,
  Utensils,
  Bike,
  ChevronRight,
} from "lucide-react-native";
import greetingTime from "greeting-time";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, TouchableOpacity } from "react-native";
import InfoCard from "@components/app/InfoCard";
import PageWrapper from "@components/app/PageWrapper";
import ProfileHeaderCard from "@components/app/ProfileHeaderCard";
import PageHeader from "@components/app/header/PageHeader";
import Box from "@components/atoms/Box";
import { MyTabNavigatorScreenProps } from "@navigation/types";
import { capitalizeString } from "@utils/helpers";
import { getClientProfileInfo } from "@utils/services/authServices";
import { store } from "@/store";
import { constants, theme } from "@utils/styles/theme";
import Text from "@components/atoms/Text";
import { useFocusEffect } from "@react-navigation/native";
import {
  getClientDefaultWorkouts,
  getClientWorkouts,
} from "@utils/services/workoutService";
import { WorkoutType } from "@utils/types/types";
import Toast from "react-native-toast-message";
import { useQuery } from "@tanstack/react-query";
import { gymActions } from "../../gym/context/slice";
import { MealPlanType } from "@utils/types/mealPlanTypes";
import { getMealPlan } from "@utils/services/mealPlanService";
import { Button } from "react-native-paper";
import FullScreenLoader from "@components/atoms/FullScreenLoader";
import { useSelector } from "react-redux";
import { useBottomTabPadding } from "@/hooks/useBottomTabPadding";
import WorkflowPromoBanner from "../components/WorkflowPromoBanner";

const OverviewScreen: React.FC<MyTabNavigatorScreenProps<"Home">> = ({
  navigation,
}) => {
  const bottomPadding = useBottomTabPadding();
  const { user } = useSelector((state: any) => state["feature/auth"]);
  const { showCreatePlanCard } = useSelector(
    (state: any) => state["feature/gym"]
  );

  const {
    isLoading: isProfileLoading,
    data: profile,
    refetch: profileRefetch,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: getClientProfileInfo,
  });

  const {
    isLoading: isWorkoutLoading,
    data: workout,
    refetch: workoutRefetch,
  } = useQuery({
    queryKey: ["UserWorkouts"],
    queryFn: getClientWorkouts,
  });

  const {
    isLoading: isMealLoading,
    data: mealPlan,
    refetch: mealRefetch,
  } = useQuery({
    queryKey: ["mealPlan"],
    queryFn: getMealPlan,
  });

  const {
    isLoading: isDefaultWorkoutLoading,
    data: defaultWorkout,
    refetch: defaultWorkoutRefetch,
  } = useQuery({
    queryKey: ["defaultWorkout"],
    queryFn: getClientDefaultWorkouts,
  });

  useFocusEffect(
    React.useCallback(
      () => {
        Promise.all([
          // profileRefetch(),
          // workoutRefetch(),
          // mealRefetch(),
          // defaultWorkoutRefetch(),
        ]).catch((error) => {
          console.error("Error refreshing data:", error);
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Error fetching data.",
          });
        });
      },
      [
        // profileRefetch,
        // workoutRefetch,
        // mealRefetch
      ]
    )
  );

  const selfCreatedMelaplan = React.useMemo(() => {
    return (
      mealPlan?.filter((plan) => plan.type === MealPlanType.SelfCreated) ?? []
    );
  }, [mealPlan]);

  const selfCreatedWorkoutPlan = React.useMemo(() => {
    return (
      workout?.filter((work) => work.type === WorkoutType.SelfCreated) ?? []
    );
  }, [workout]);

  const calculateCalorieRequirements = React.useCallback(
    (
      profile:
        | {
          calculatedMetrics?: { dci?: number };
          fitnessInfo?: { goal?: string };
        }
        | undefined
        | null
    ) => {
      if (!profile?.calculatedMetrics?.dci || !profile?.fitnessInfo?.goal) {
        return null;
      }

      const dci = profile.calculatedMetrics.dci;
      const perMealRequirement = dci;
      const goal = profile.fitnessInfo.goal;
      let perMealLowerLimit: number;
      let perMealUpperLimit: number;

      switch (goal) {
        case "WeightGain":
          perMealLowerLimit = perMealRequirement + 250;
          perMealUpperLimit = perMealRequirement + 500;
          break;
        case "WeightLoss":
          perMealLowerLimit = perMealRequirement - 1000;
          perMealUpperLimit = perMealRequirement - 500;
          break;
        case "FatLoss":
          perMealLowerLimit = perMealRequirement - 500;
          perMealUpperLimit = perMealRequirement - 250;
          break;
        case "LeanGaining":
          perMealLowerLimit = perMealRequirement + 100;
          perMealUpperLimit = perMealRequirement + 250;
          break;
        default:
          perMealLowerLimit = perMealRequirement - 50;
          perMealUpperLimit = perMealRequirement + 50;
          break;
      }
      return {
        perMealRequirement,
        perMealLowerLimit,
        perMealUpperLimit,
        dci,
        goal,
      };
    },
    []
  );

  const calorieRequirements = React.useMemo(() => {
    return calculateCalorieRequirements(profile);
  }, [
    profile?.calculatedMetrics?.dci,
    profile?.fitnessInfo?.goal,
    calculateCalorieRequirements,
  ]);

  React.useEffect(() => {
    if (calorieRequirements) {
      const {
        perMealRequirement,
        perMealLowerLimit,
        perMealUpperLimit,
        dci,
        goal,
      } = calorieRequirements;

      store.dispatch(
        gymActions.updateCaloriesRequirenment({
          perMealRequirement,
          perMealLowerLimit,
          perMealUpperLimit,
        })
      );
    }
  }, [calorieRequirements]);

  React.useEffect(() => {
    if (defaultWorkout) {
      store.dispatch(gymActions.setDefaultWorkouts(defaultWorkout));
    }
  }, [defaultWorkout]);

  React.useEffect(() => {
    if (workout) {
      store.dispatch(gymActions.setWorkouts(workout));
    }
  }, [workout]);

  const isDataMissing = !profile || !workout || !mealPlan;

  if (isProfileLoading && isDataMissing) {
    return <FullScreenLoader />;
  }

  return (
    <Box flex={1}>
      <PageWrapper>
        <PageHeader title="My Fitness" />
        <ScrollView
          overScrollMode="never"
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: bottomPadding,
          }}
        >
          <Box flexDirection="row" alignItems="center" gap="md" pb="md">
            {profile?.profileImageFileUrl ? (
              <Image
                source={{ uri: profile.profileImageFileUrl }}
                style={{ width: 60, height: 60, borderRadius: 30 }}
              />
            ) : (
              <Box
                width={60}
                height={60}
                borderRadius="full"
                backgroundColor="SecondaryGrey"
                alignItems="center"
                justifyContent="center"
              >
                <Text variant="lgBold" color="PrimaryWhite">
                  {(capitalizeString(profile?.firstName?.[0] ?? "") || "") +
                    (capitalizeString(profile?.lastName?.[0] ?? "") || "")}
                </Text>
              </Box>
            )}
            <Box>
              <Text variant="lgBold">
                Welcome Back, {user?.firstName || ""}
              </Text>
              <Text variant="sm" color="textSecondary" mt="xs">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </Box>
          </Box>

          {/* <Box
            flexDirection="row"
            gap="sm"
            pb="md"
            justifyContent="space-between"
          >
            <Box
              flex={1}
              borderRadius="sm"
              backgroundColor="backgroundSecondary"
              p="base"
            >
              <Text variant="xs" color="textSecondary" mb="xs">
                Goal
              </Text>
              <Text variant="smBold" color="textPrimary" numberOfLines={1}>
                {profile?.fitnessInfo?.goal
                  ? profile.fitnessInfo.goal.replace(
                    /([a-z])([A-Z])/g,
                    "$1 $2"
                  )
                  : "Not Set"}
              </Text>
            </Box>

            <Box
              flex={1}
              borderRadius="sm"
              backgroundColor="backgroundSecondary"
              p="base"
            >
              <Text variant="xs" color="textSecondary" mb="xs">
                DCI
              </Text>
              <Text variant="smBold" color="textPrimary" numberOfLines={1}>
                {profile?.calculatedMetrics?.dci
                  ? `${Math.round(profile.calculatedMetrics.dci)} Cal`
                  : "0 Cal"}
              </Text>
            </Box>

            <Box
              flex={1}
              borderRadius="sm"
              backgroundColor="backgroundSecondary"
              p="base"
            >
              <Text variant="xs" color="textSecondary" mb="xs">
                BMR
              </Text>
              <Text variant="smBold" color="textPrimary" numberOfLines={1}>
                {profile?.calculatedMetrics?.bmr
                  ? `${Math.round(profile.calculatedMetrics.bmr)} Cal`
                  : "0 Cal"}
              </Text>
            </Box>
          </Box> */}

          <WorkflowPromoBanner />

          <Box gap="base" flexGrow={1}>
            {selfCreatedWorkoutPlan?.length > 0 ? (
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: theme.spacing.sm,
                  backgroundColor: theme.colors.backgroundSecondary,
                  borderRadius: theme.borderRadii.sm,
                  flexDirection: "row",
                  alignItems: "center",
                }}
                activeOpacity={constants.activeOpacity}
                onPress={() => {
                  navigation.navigate("WorkoutRoutine");
                  store.dispatch(
                    gymActions.setSelectedWorkout({
                      WorkoutType: WorkoutType.SelfCreated,
                      createdBy: "",
                    })
                  );
                }}
              >
                <Box
                  width={52}
                  height={52}
                  borderRadius="full"
                  alignItems="center"
                  justifyContent="center"
                  style={{ backgroundColor: "rgba(160, 226, 32, 0.15)" }}
                >
                  <BicepsFlexed
                    color={theme.colors.PrimaryGreen}
                    size={26}
                    strokeWidth={1.8}
                  />
                </Box>
                <Box flex={1} ml="md" mr="sm">
                  <Text variant="mdBold" color="textPrimary" mb="xs">
                    My Workout
                  </Text>
                  <Text variant="xs" color="textSecondary" numberOfLines={2}>
                    Update your workout routine every 30days - 45days.
                  </Text>
                </Box>
                <ChevronRight color={theme.colors.textSecondary} size={20} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={{
                  backgroundColor: theme.colors.backgroundSecondary,
                  borderRadius: theme.borderRadii.sm,
                  flex: 1,
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: theme.spacing.sm,
                  flexDirection: "row",
                  alignItems: "center",
                }}
                activeOpacity={constants.activeOpacity}
                onPress={() => {
                  navigation.navigate("Onboard");
                  store.dispatch(
                    gymActions.setSelectedWorkout({
                      WorkoutType: WorkoutType.SelfCreated,
                      createdBy: "",
                    })
                  );
                }}
              >
                <Box
                  width={52}
                  height={52}
                  borderRadius="full"
                  alignItems="center"
                  justifyContent="center"
                  style={{ backgroundColor: "rgba(160, 226, 32, 0.15)" }}
                >
                  <CirclePlus
                    color={theme.colors.PrimaryGreen}
                    size={26}
                    strokeWidth={1.8}
                  />
                </Box>
                <Box flex={1} ml="md" mr="sm">
                  <Text variant="mdBold" color="textPrimary" mb="xs">
                    Create Workouts
                  </Text>
                  <Text variant="xs" color="textSecondary" numberOfLines={2}>
                    You can create your own custom workouts.
                  </Text>
                </Box>
                <ChevronRight color={theme.colors.textSecondary} size={20} />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={{
                backgroundColor: theme.colors.backgroundSecondary,
                borderRadius: theme.borderRadii.sm,
                flex: 1,
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.sm,
                flexDirection: "row",
                alignItems: "center",
              }}
              activeOpacity={constants.activeOpacity}
              onPress={() => {
                store.dispatch(
                  gymActions.setSelectedMealPlanType(MealPlanType.SelfCreated)
                );

                selfCreatedMelaplan.length > 0
                  ? navigation.navigate("MealPlan")
                  : navigation.navigate("Onboard", {
                    fromMealPlan: true,
                  });
              }}
            >
              <Box
                width={52}
                height={52}
                borderRadius="full"
                alignItems="center"
                justifyContent="center"
                style={{ backgroundColor: "rgba(160, 226, 32, 0.15)" }}
              >
                {selfCreatedMelaplan.length > 0 ? (
                  <Utensils
                    color={theme.colors.PrimaryGreen}
                    size={26}
                    strokeWidth={1.8}
                  />
                ) : (
                  <CirclePlus
                    color={theme.colors.PrimaryGreen}
                    size={26}
                    strokeWidth={1.8}
                  />
                )}
              </Box>
              <Box flex={1} ml="md" mr="sm">
                <Text variant="mdBold" color="textPrimary" mb="xs">
                  {selfCreatedMelaplan.length > 0
                    ? "My Meal Plan"
                    : "Create Meal Plan"}
                </Text>
                <Text variant="xs" color="textSecondary" numberOfLines={2}>
                  {selfCreatedMelaplan.length > 0
                    ? "Update your meal plan when ever you think it's necessary."
                    : "Create your own meal plan based on your fitness goal."}
                </Text>
              </Box>
              <ChevronRight color={theme.colors.textSecondary} size={20} />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: theme.colors.backgroundSecondary,
                borderRadius: theme.borderRadii.sm,
                flex: 1,
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.sm,
                flexDirection: "row",
                alignItems: "center",
              }}
              activeOpacity={constants.activeOpacity}
              onPress={() => {
                navigation.navigate("GeneralWorkoutRoutine");
                store.dispatch(
                  gymActions.setSelectedWorkout({
                    WorkoutType: WorkoutType.Default,
                    createdBy: "",
                  })
                );
              }}
            >
              <Box
                width={52}
                height={52}
                borderRadius="full"
                alignItems="center"
                justifyContent="center"
                style={{ backgroundColor: "rgba(160, 226, 32, 0.15)" }}
              >
                <Bike
                  color={theme.colors.PrimaryGreen}
                  size={26}
                  strokeWidth={1.8}
                />
              </Box>
              <Box flex={1} ml="md" mr="sm">
                <Text variant="mdBold" color="textPrimary" mb="xs">
                  Default Workouts
                </Text>
                <Text variant="xs" color="textSecondary" numberOfLines={2}>
                  Perform any workout routine based on your weekly schedule.
                </Text>
              </Box>
              <ChevronRight color={theme.colors.textSecondary} size={20} />
            </TouchableOpacity>

            {/* <Box mb="md">
              <Text variant="lgBold" color="textPrimary">Workout Analytics</Text>
              <Box
                flexDirection="row"
                justifyContent="space-between"
                gap="sm"
                mt="sm"
              >
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: theme.colors.backgroundSecondary,
                    borderRadius: theme.borderRadii.sm,
                    padding: theme.spacing.md,
                  }}
                  activeOpacity={constants.activeOpacity}
                  onPress={() =>
                    navigation.navigate("MyDashboardScreen" as any)
                  }
                >
                  <Box
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box flex={1}>
                      <Text variant="xs" color="textSecondary" mb="xs">
                        Schedule
                      </Text>
                      <Text variant="smBold" color="textPrimary" numberOfLines={1}>
                        My Workout
                      </Text>
                    </Box>
                    <ChevronRight
                      color={theme.colors.textSecondary}
                      size={18}
                    />
                  </Box>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: theme.colors.backgroundSecondary,
                    borderRadius: theme.borderRadii.sm,
                    padding: theme.spacing.md,
                  }}
                  activeOpacity={constants.activeOpacity}
                  onPress={() =>
                    navigation.navigate("MyDashboardScreen" as any)
                  }
                >
                  <Box
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box flex={1}>
                      <Text variant="xs" color="textSecondary" mb="xs">
                        Schedule
                      </Text>
                      <Text variant="smBold" color="textPrimary" numberOfLines={1}>
                        Fitness Guru
                      </Text>
                    </Box>
                    <ChevronRight
                      color={theme.colors.textSecondary}
                      size={18}
                    />
                  </Box>
                </TouchableOpacity>
              </Box>
            </Box> */}
          </Box>
          {/* <Box height={100} />  */}
        </ScrollView>
      </PageWrapper>
    </Box>
  );
};

export default OverviewScreen;
