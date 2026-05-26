import { BicepsFlexed, CirclePlus } from "lucide-react-native";
import greetingTime from "greeting-time";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { Activity, Utensils, Bike } from "lucide-react-native";
import InfoCard from "@components/app/InfoCard";
import PageWrapper from "@components/app/PageWrapper";
import ProfileHeaderCard from "@components/app/ProfileHeaderCard";
import PageHeader from "@components/app/header/PageHeader";
import Box from "@components/atoms/Box";
import { MyTabNavigatorScreenProps } from "@navigation/types";
import { capitalizeString } from "@utils/helpers";
import { getClientProfileInfo } from "@utils/services/authServices";
import { store } from "@/store";
import { theme } from "@utils/styles/theme";
import Text from "@components/atoms/Text";
import { useFocusEffect } from "@react-navigation/native";
import {
  getClientDefaultWorkouts,
  getClientWorkouts,
} from "@utils/services/workoutService";
import { WorkoutType } from "@utils/types/types";
import Toast from "react-native-toast-message";
import { useQuery } from "react-query";
import { gymActions } from "../../gym/context/slice";
import { MealPlanType } from "@utils/types/mealPlanTypes";
import { getMealPlan } from "@utils/services/mealPlanService";
import { Button } from "react-native-paper";
import FullScreenLoader from "@components/atoms/FullScreenLoader";

const OverviewScreen: React.FC<MyTabNavigatorScreenProps<"Home">> = ({
  navigation,
}) => {
  const { user } = store.getState()["feature/auth"];
  const {
    selectedDay,
    workouts,
    selectedWorkout,
    selectedGeneralDay,
    defaultWorkouts,
  } = store.getState()["feature/gym"];
  const greetingMessage: string = greetingTime(new Date());

  const { height: screenHeight } = useWindowDimensions();

  const HEADER_OFFSET = 220;
  const availableHeight = screenHeight - HEADER_OFFSET;
  const TILE_MIN_HEIGHT = 120;
  const TILE_COUNT = 3;
  const needsScroll = availableHeight < TILE_MIN_HEIGHT * TILE_COUNT + 60;
  const topTileHeight = needsScroll ? TILE_MIN_HEIGHT * 1.4 : undefined;
  const bottomTileHeight = needsScroll ? TILE_MIN_HEIGHT * 1.4 : undefined;

  const {
    isLoading: isProfileLoading,
    data: profile,
    refetch: profileRefetch,
  } = useQuery("profile", getClientProfileInfo);

  const {
    isLoading: isWorkoutLoading,
    data: workout,
    error: workoutError,
    refetch: workoutRefetch,
  } = useQuery("workout", getClientWorkouts);
  //
  const {
    isLoading: isMealLoading,
    data: mealPlan,
    error: mealError,
    refetch: mealRefetch,
  } = useQuery("mealPlan", getMealPlan);

  const {
    isLoading: isDefaultWorkoutLoading,
    data: defaultWorkout,
    error: defaultWorkoutError,
    refetch: defaultWorkoutRefetch,
  } = useQuery("defaultWorkout", getClientDefaultWorkouts);

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          await profileRefetch();
          await workoutRefetch();
          await mealRefetch();
          await defaultWorkoutRefetch();
        } catch (error) {
          console.error("Error fetching profile info:", error);
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Error fetching profile info.",
          });
        }
      };
      fetchData();
    }, [profileRefetch, workoutRefetch, mealRefetch, defaultWorkoutRefetch])
  );

  React.useEffect(() => {
    if (workout) {
      store.dispatch(gymActions.setWorkouts(workout));
    }
  }, [workout]);

  const selfCreatedMelaplan =
    mealPlan?.filter((plan) => plan.type === MealPlanType.SelfCreated) ?? [];

  const selfCreatedWorkoutPlan =
    workout?.filter((work) => work.type === WorkoutType.SelfCreated) ?? [];

  const calculateCalorieRequirements = React.useCallback((profile: any) => {
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
  }, []);

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

  const isDataMissing = !profile || !workout || !mealPlan;

  if (isProfileLoading && isDataMissing) {
    return <FullScreenLoader message="Loading..." />;
  }

  return (
    <Box flex={1} mb="xs">
      <PageWrapper>
        <PageHeader title="My Fitness" />
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: theme.spacing.sm,
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
              <Text variant="md" color="textSecondary">
                <Text variant="md" color="textSecondary">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "short",
                    day: "numeric",
                    month: "long",
                  })}
                </Text>
              </Text>
            </Box>
          </Box>
          {
            <Box
              flexDirection="row"
              gap="sm"
              pb="md"
              justifyContent="space-between"
            >
              <Box
                flex={1}
                borderRadius="sm"
                borderWidth={1}
                borderColor="borderSecondary"
                flexDirection="row"
                overflow="hidden"
              >
                <Box flex={1} p="sm">
                  <Text variant="sm" color="textSecondary">
                    Goal
                  </Text>
                  <Text variant="md" numberOfLines={1}>
                    {profile?.fitnessInfo?.goal
                      ? profile.fitnessInfo.goal.replace(
                          /([a-z])([A-Z])/g,
                          "$1 $2"
                        )
                      : "Not Set"}
                  </Text>
                </Box>
                <Box width={8} backgroundColor="LightBlue" />
              </Box>
              <Box
                flex={1}
                borderRadius="sm"
                borderWidth={1}
                borderColor="borderSecondary"
                flexDirection="row"
                overflow="hidden"
              >
                <Box flex={1} p="sm">
                  <Text variant="sm" color="textSecondary">
                    DCI
                  </Text>
                  <Text variant="md" numberOfLines={1}>
                    {profile?.calculatedMetrics?.dci
                      ? `${Math.round(profile.calculatedMetrics.dci)} Cal`
                      : "0 Cal"}
                  </Text>
                </Box>
                <Box width={8} backgroundColor="LightPink" />
              </Box>
              <Box
                flex={1}
                borderRadius="sm"
                borderWidth={1}
                borderColor="borderSecondary"
                flexDirection="row"
                overflow="hidden"
              >
                <Box flex={1} p="sm">
                  <Text variant="sm" color="textSecondary">
                    BMR
                  </Text>
                  <Text variant="md" numberOfLines={1}>
                    {profile?.calculatedMetrics?.bmr
                      ? `${Math.round(profile.calculatedMetrics.bmr)} Cal`
                      : "0 Cal"}
                  </Text>
                </Box>
                <Box width={8} backgroundColor="PrimaryOrange" />
              </Box>
            </Box>
          }

          <Box gap="sm" flexGrow={1}>
            {
              <Box gap="sm" flexGrow={1}>
                <Box
                  flexGrow={1}
                  flexDirection="row"
                  justifyContent="space-between"
                  gap="sm"
                >
                  {selfCreatedWorkoutPlan?.length > 0 ? (
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        backgroundColor: theme.colors.backgroundSecondary,
                        borderWidth: 1,
                        borderColor: theme.colors.borderSecondary,
                        borderRadius: theme.borderRadii.sm,
                        padding: theme.spacing.sm,
                        alignItems: "center",
                        justifyContent: "center",
                        gap: theme.spacing.sm,
                        minHeight: topTileHeight,
                      }}
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
                      <BicepsFlexed
                        color={theme.colors.LightBlue}
                        size={40}
                        strokeWidth={1}
                      />
                      <Text variant="lg" color="LightBlue">
                        My Workout
                      </Text>
                      <Text
                        variant="xs"
                        color="textSecondary"
                        textAlign="center"
                      >
                        Update your workout routine every 30days - 45days.
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        backgroundColor: theme.colors.backgroundSecondary,
                        borderWidth: 1,
                        borderColor: theme.colors.borderSecondary,
                        borderRadius: theme.borderRadii.sm,
                        padding: theme.spacing.sm,
                        alignItems: "center",
                        justifyContent: "center",
                        gap: theme.spacing.sm,
                        minHeight: topTileHeight,
                      }}
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
                      <CirclePlus
                        color={theme.colors.LightBlue}
                        size={40}
                        strokeWidth={1}
                      />
                      <Text variant="lg" color="LightBlue">
                        Create Workouts
                      </Text>
                      <Text
                        variant="xs"
                        color="textSecondary"
                        textAlign="center"
                      >
                        You can create your own custom workouts.
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: theme.colors.backgroundSecondary,
                      borderWidth: 1,
                      borderColor: theme.colors.borderSecondary,
                      borderRadius: theme.borderRadii.sm,
                      padding: theme.spacing.sm,
                      alignItems: "center",
                      justifyContent: "center",
                      gap: theme.spacing.sm,
                      minHeight: topTileHeight,
                    }}
                    onPress={() => {
                      store.dispatch(
                        gymActions.setSelectedMealPlanType(
                          MealPlanType.SelfCreated
                        )
                      );

                      selfCreatedMelaplan.length > 0
                        ? navigation.navigate("MealPlan")
                        : navigation.navigate("Onboard", {
                            fromMealPlan: true,
                          });
                    }}
                  >
                    {selfCreatedMelaplan.length > 0 ? (
                      <Utensils
                        color={theme.colors.LightPink}
                        size={40}
                        strokeWidth={1}
                      />
                    ) : (
                      <CirclePlus
                        color={theme.colors.LightPink}
                        size={40}
                        strokeWidth={1}
                      />
                    )}
                    <Text variant="lg" color="LightPink">
                      {selfCreatedMelaplan.length > 0
                        ? "My Meal Plan"
                        : "Create Meal Plan"}
                    </Text>

                    {selfCreatedMelaplan.length > 0 ? (
                      <Text
                        variant="xs"
                        color="textSecondary"
                        textAlign="center"
                      >
                        Update your meal plan when ever you think its necessary.
                      </Text>
                    ) : (
                      <Text
                        variant="xs"
                        color="textSecondary"
                        textAlign="center"
                      >
                        Create your own meal plan based on your fitness goal.
                      </Text>
                    )}
                  </TouchableOpacity>
                </Box>

                <TouchableOpacity
                  style={{
                    flexGrow: 1,
                    backgroundColor: theme.colors.backgroundSecondary,
                    borderWidth: 1,
                    borderColor: theme.colors.borderSecondary,
                    borderRadius: theme.borderRadii.sm,
                    padding: theme.spacing.sm,
                    alignItems: "center",
                    justifyContent: "center",
                    gap: theme.spacing.sm,
                    minHeight: bottomTileHeight,
                  }}
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
                  <Bike
                    color={theme.colors.PrimaryOrange}
                    size={40}
                    strokeWidth={1}
                  />
                  <Text variant="lg" color="PrimaryOrange">
                    Default Workouts
                  </Text>
                  <Text variant="xs" color="textSecondary" textAlign="center">
                    Perform any workout routine based on your weekly schedule.
                  </Text>
                </TouchableOpacity>
                <Box mt="sm">
                  <Text variant="lgBold">Workout Analytics</Text>
                  <Box
                    flexDirection="row"
                    justifyContent="space-between"
                    gap="sm"
                    mt="sm"
                    flexGrow={1}
                  >
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        backgroundColor: theme.colors.backgroundSecondary,
                        borderRadius: theme.borderRadii.sm,
                        padding: theme.spacing.md,
                        justifyContent: "center",
                      }}
                      onPress={() =>
                        navigation.navigate("MyDashboardScreen" as any)
                      }
                    >
                      <Text variant="xs" color="textSecondary">
                        Schedule
                      </Text>
                      <Text variant="md">My Workout</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{
                        flex: 1,
                        backgroundColor: theme.colors.backgroundSecondary,
                        borderRadius: theme.borderRadii.sm,
                        padding: theme.spacing.md,
                        justifyContent: "center",
                      }}
                      onPress={() =>
                        navigation.navigate("MyDashboardScreen" as any)
                      }
                    >
                      <Text variant="xs" color="textSecondary">
                        Schedule
                      </Text>
                      <Text variant="md">Fitness Guru</Text>
                    </TouchableOpacity>
                  </Box>
                </Box>
              </Box>
            }
            {/* {!user?.isInjured &&
              !profile?.fitnessInfo &&
              !profile?.personalInfo && (
                <InfoCard
                  buttonTitle="Get Started"
                  description="Get started by adding your body stats and goals, then create your own personalized workout routine and meal plan."
                  imageSource={require("assets/images/dumble-with-heart.png")}
                  buttonOnPress={() => navigation.navigate("Onboard")}
                />
              )} */}

            {/* {user?.isInjured && user.subscription?.status === true && (
              <InfoCard
                title="We Care About You More"
                description="By getting started, you will get customised workout routines and meal plans based on your injury levels."
                imageSource={require("assets/images/dumble-with-heart.png")}
                buttonTitle="Train with Fitness Guru"
                buttonOnPress={() =>
                  navigation.navigate("Tab", { screen: "FitnessGuru" })
                }
              />
            )} */}
          </Box>
        </ScrollView>
      </PageWrapper>
    </Box>
  );
};

export default OverviewScreen;
