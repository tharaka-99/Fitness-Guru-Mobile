import { MapPin, Calendar, Dumbbell, BicepsFlexed, CirclePlus } from "lucide-react-native";
import greetingTime from "greeting-time";
import React, { useEffect, useState } from "react";
import { ScrollView, Image, TouchableOpacity } from "react-native";
import { PAGE_WIDTH } from "@components/app/PageWrapper";
import { Activity, Utensils, Bike } from "lucide-react-native";
import InfoCard from "@components/app/InfoCard";
import PageWrapper from "@components/app/PageWrapper";
import ProfileHeaderCard from "@components/app/ProfileHeaderCard";
import PageHeader from "@components/app/header/PageHeader";
import Box from "@components/atoms/Box";
import { MyTabNavigatorScreenProps } from "@navigation/types";
import { capitalizeString } from "@utils/helpers";
import { getClientProfileInfo } from "@utils/services/authServices";
import PlanCategoryCard from "../components/PlanCategoryCard";
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
  console.log("user?.isInjured", user?.isInjured);
  const greetingMessage: string = greetingTime(new Date());

  const {
    isLoading: isProfileLoading,
    data: profile,
    refetch: profileRefetch,
  } = useQuery("profile", getClientProfileInfo);

  //
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

  //
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

  // Dispatch workouts to store when data is available
  React.useEffect(() => {
    console.log("🏠 Overview - Workout data received:", workout);
    if (workout) {
      console.log(
        "📝 Overview - Dispatching workouts to store:",
        workout.length,
        "workouts"
      );
      store.dispatch(gymActions.setWorkouts(workout));
    }
  }, [workout]);

  // Extract calorie calculation logic into a separate function
  const calculateCalorieRequirements = React.useCallback((profile: any) => {
    if (!profile?.calculatedMetrics?.dci || !profile?.fitnessInfo?.goal) {
      return null;
    }

    const dci = profile.calculatedMetrics.dci;
    const perMealRequirement = dci;
    const goal = profile.fitnessInfo.goal;

    console.log("goal", goal);

    // Calculate per meal limits based on goal
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

  // Memoize the calculated requirements to avoid unnecessary recalculations
  const calorieRequirements = React.useMemo(() => {
    return calculateCalorieRequirements(profile);
  }, [
    profile?.calculatedMetrics?.dci,
    profile?.fitnessInfo?.goal,
    calculateCalorieRequirements,
  ]);

  // Update Redux store when calorie requirements change
  React.useEffect(() => {
    if (calorieRequirements) {
      const {
        perMealRequirement,
        perMealLowerLimit,
        perMealUpperLimit,
        dci,
        goal,
      } = calorieRequirements;

      // Dispatch the calculated calorie requirements to Redux store
      store.dispatch(
        gymActions.updateCaloriesRequirenment({
          perMealRequirement,
          perMealLowerLimit,
          perMealUpperLimit,
        })
      );

      // Log the calculated values for debugging
      console.log("=== Overview Screen - Calorie Requirements ===");
      console.log("DCI (Daily Calorie Intake):", dci);
      console.log("Per Meal Requirement (DCI):", perMealRequirement);
      console.log("Calculated perMealLowerLimit:", perMealLowerLimit);
      console.log("Calculated perMealUpperLimit:", perMealUpperLimit);
      console.log("Goal:", goal);
      console.log("=============================================");
    }
  }, [calorieRequirements]);

  React.useEffect(() => {
    console.log("🏠 Overview - Default workout data received:", defaultWorkout);
    if (defaultWorkout) {
      console.log(
        "📝 Overview - Dispatching default workouts to store:",
        defaultWorkout.length,
        "workouts"
      );
      store.dispatch(gymActions.setDefaultWorkouts(defaultWorkout));
    }
  }, [defaultWorkout]);


  const isDataMissing = !profile || !workout || !mealPlan;

  if (isProfileLoading && isDataMissing) {
    return (
      <FullScreenLoader
        message="Loading your profile..."
        header={capitalizeString(greetingMessage)}
      />
    );
  }

  return (
    <Box flex={1} >
      <PageWrapper>
        <PageHeader title="Home" />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Box flex={1} gap="md">
            <Box flexDirection="row" alignItems="center" gap="md" px="xs" mb="sm">
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
                    {(profile?.firstName?.[0] || "") + (profile?.lastName?.[0] || "")}
                  </Text>
                </Box>
              )}
              <Box>
                <Text variant="lgBold" numberOfLines={1}>
                  {capitalizeString(greetingMessage)}, {(profile?.firstName || "")}
                </Text>
                <Text variant="md" color="textSecondary">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "short",
                    day: "numeric",
                    month: "long",
                  })}
                </Text>
              </Box>
            </Box>
            {(profile?.fitnessInfo?.goal ||
              (profile?.calculatedMetrics?.dci && Math.round(profile.calculatedMetrics.dci) > 0) ||
              (profile?.calculatedMetrics?.bmr && Math.round(profile.calculatedMetrics.bmr) > 0)) && (
                <Box flexDirection="row" justifyContent="space-between" mb="sm">
                  <Box
                    flex={4}
                    borderRadius="sm"
                    borderWidth={1}
                    borderColor="borderSecondary"
                    flexDirection="row"
                    overflow="hidden"
                  >
                    <Box flex={1} p="sm">
                      <Text variant="sm" color="textSecondary">Goal</Text>
                      <Text variant="md" numberOfLines={1}>
                        {profile?.fitnessInfo?.goal
                          ? profile.fitnessInfo.goal.replace(/([a-z])([A-Z])/g, "$1 $2")
                          : "Not Set"}
                      </Text>
                    </Box>
                    <Box width={8} backgroundColor="LightBlue" />
                  </Box>
                  <Box
                    flex={4}
                    borderRadius="sm"
                    borderWidth={1}
                    borderColor="borderSecondary"
                    flexDirection="row"
                    overflow="hidden"
                    mx="sm"
                  >
                    <Box flex={1} p="sm">
                      <Text variant="sm" color="textSecondary">DCI</Text>
                      <Text variant="md" numberOfLines={1}>
                        {profile?.calculatedMetrics?.dci
                          ? `${Math.round(profile.calculatedMetrics.dci)} Cal`
                          : "0Cal"}
                      </Text>
                    </Box>
                    <Box width={8} backgroundColor="LightPink" />
                  </Box>
                  <Box
                    flex={4}
                    borderRadius="sm"
                    borderWidth={1}
                    borderColor="borderSecondary"
                    flexDirection="row"
                    overflow="hidden"
                  >
                    <Box flex={1} p="sm">
                      <Text variant="sm" color="textSecondary">BMR</Text>
                      <Text variant="md" numberOfLines={1}>
                        {profile?.calculatedMetrics?.bmr
                          ? `${Math.round(profile.calculatedMetrics.bmr)} Cal`
                          : "0Cal"}
                      </Text>
                    </Box>
                    <Box width={8} backgroundColor="PrimaryOrange" />
                  </Box>
                </Box>
              )}

            <Box flex={1} paddingBottom="sm" gap="sm">
              {!user?.isInjured &&
                profile?.fitnessInfo &&
                profile?.personalInfo && (
                  <>
                    <Box flex={1} flexDirection="row" justifyContent="space-between" gap="sm" >
                      {workout && workout?.length > 0 ? (
                        <TouchableOpacity
                          style={{ flex: 1 }}
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
                            flex={1}
                            backgroundColor="backgroundSecondary"
                            borderWidth={1}
                            borderColor="borderSecondary"
                            borderRadius="sm"
                            p="md"
                            alignItems="center"
                            justifyContent="center"
                            gap="sm"
                          >
                            <BicepsFlexed color={theme.colors.LightBlue} size={40} strokeWidth={1} />
                            <Text variant="lg" color="LightBlue">My Workout</Text>
                            <Text variant="xs" color="textSecondary" textAlign="center">
                              Update your workout routine every 30days - 45days.
                            </Text>
                          </Box>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={{ flex: 1 }}
                          onPress={() => navigation.navigate("GenerateWorkout")}
                        >
                          <Box
                            flex={1}
                            backgroundColor="backgroundSecondary"
                            borderWidth={1}
                            borderColor="borderSecondary"
                            borderRadius="sm"
                            p="md"
                            alignItems="center"
                            justifyContent="center"
                            gap="sm"
                          >
                            <CirclePlus color={theme.colors.LightBlue} size={40} strokeWidth={1} />
                            <Text variant="lg" color="LightBlue">Create Workouts</Text>
                            <Text variant="xs" color="textSecondary" textAlign="center">
                              You can create your own custom workouts.
                            </Text>
                          </Box>
                        </TouchableOpacity>
                      )}
                      {mealPlan && mealPlan.length > 0 ? (
                        <TouchableOpacity
                          style={{ flex: 1 }}
                          onPress={() => {
                            store.dispatch(
                              gymActions.setSelectedMealPlanType(
                                MealPlanType.SelfCreated
                              )
                            );
                            navigation.navigate("MealPlan");
                          }}
                        >
                          <Box
                            flex={1}
                            backgroundColor="backgroundSecondary"
                            borderWidth={1}
                            borderColor="borderSecondary"
                            borderRadius="sm"
                            p="md"
                            alignItems="center"
                            justifyContent="center"
                            gap="sm"
                          >
                            <Utensils color={theme.colors.LightPink} size={40} strokeWidth={1} />
                            <Text variant="lg" color="LightPink">My Meal Plan</Text>
                            <Text variant="xs" color="textSecondary" textAlign="center">
                              Update your meal plan when ever you think its necessary.
                            </Text>
                          </Box>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={{ flex: 1 }}
                          onPress={() => navigation.navigate("GenerateMealPlan")}
                        >
                          <Box
                            flex={1}
                            backgroundColor="backgroundSecondary"
                            borderWidth={1}
                            borderColor="borderSecondary"
                            borderRadius="sm"
                            p="md"
                            alignItems="center"
                            justifyContent="center"
                            gap="sm"
                          >
                            <CirclePlus color={theme.colors.LightPink} size={40} strokeWidth={1} />
                            <Text variant="lg" color="LightPink">Create Meal Plan</Text>
                            <Text variant="xs" color="textSecondary" textAlign="center">
                              You can create your own meal plan.
                            </Text>
                          </Box>
                        </TouchableOpacity>
                      )}

                    </Box>

                    <TouchableOpacity
                      style={{ flex: 1 }}
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
                        flex={1}
                        backgroundColor="backgroundSecondary"
                        borderWidth={1}
                        borderColor="borderSecondary"
                        borderRadius="sm"
                        p="md"
                        alignItems="center"
                        justifyContent="center"
                        gap="sm"
                      >
                        <Bike color={theme.colors.PrimaryOrange} size={40} strokeWidth={1} />
                        <Text variant="lg" color="PrimaryOrange">Default Workouts</Text>
                        <Text variant="xs" color="textSecondary" textAlign="center">
                          Perform any workout routine based on your weekly schedule.
                        </Text>
                      </Box>
                    </TouchableOpacity>
                    <Box flex={1}>
                      <Text variant="lgBold">Workout Analytics</Text>
                      <Box flex={1} flexDirection="row" justifyContent="space-between" gap="sm" mt="sm">
                        <TouchableOpacity
                          style={{ flex: 1 }}
                          onPress={() => navigation.navigate("MyDashboardScreen" as any)}
                        >
                          <Box
                            backgroundColor="backgroundSecondary"
                            borderRadius="sm"
                            p="md"
                            justifyContent="center"
                          >
                            <Text variant="xs" color="textSecondary">Schedule</Text>
                            <Text variant="md">My Workout</Text>
                          </Box>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={{ flex: 1 }}
                          onPress={() => navigation.navigate("MyDashboardScreen" as any)}
                        >
                          <Box
                            backgroundColor="backgroundSecondary"
                            borderRadius="sm"
                            p="md"
                            justifyContent="center"
                          >
                            <Text variant="xs" color="textSecondary">Schedule</Text>
                            <Text variant="md">Fitness Guru</Text>
                          </Box>
                        </TouchableOpacity>
                      </Box>
                    </Box>
                  </>
                )}
              {!user?.isInjured &&
                !profile?.fitnessInfo &&
                !profile?.personalInfo && (
                  <InfoCard
                    buttonTitle="Get Started"
                    description="By getting started, you will get to choose your preferred meal plan
                according to your body statistics and you will be provided with a
                Workout Routine based on your expertise level."
                    imageSource={require("assets/images/dumble-with-heart.png")}
                    buttonOnPress={() => navigation.navigate("Onboard")}
                  />
                )}

              {user?.isInjured && (
                <InfoCard
                  title="We Care About You More"
                  description="By getting started, you will get customised workout routines and meal plans based on your injury levels."
                  imageSource={require("assets/images/dumble-with-heart.png")}
                  buttonTitle="Train with Fitness Guru"
                  buttonOnPress={() =>
                    navigation.navigate("Tab", { screen: "FitnessGuru" })
                  }
                />
              )}
            </Box>
          </Box>
        </ScrollView>
      </PageWrapper>
    </Box>
  );
};

export default OverviewScreen;
