import { MapPin, Calendar, Dumbbell } from "lucide-react-native";
import greetingTime from "greeting-time";
import React from "react";
import { ScrollView } from "react-native";

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
  // useEffect to fetch data when component mounts
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
  if (isProfileLoading) {
    return (
      <FullScreenLoader
        message="Loading your profile..."
        header={capitalizeString(greetingMessage)}
      />
    );
  }

  return (
    <Box flex={1}>
      <PageWrapper>
        <PageHeader title={capitalizeString(greetingMessage)} />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Box flex={1} gap="md">
            <ProfileHeaderCard
              image={profile?.profileImageFileUrl || ""}
              name={`${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`}
              details={[
                {
                  icon: ({ color, size }) => (
                    <MapPin color={color} size={size + 1} />
                  ),
                  value: profile?.city ?? "",
                },
                {
                  icon: ({ color, size }) => (
                    <Calendar color={color} size={size} />
                  ),
                  value: profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                      })
                    : "",
                },
                {
                  icon: ({ color, size }) => (
                    <Dumbbell color={color} size={size - 4} />
                  ),
                  value:
                    profile?.fitnessInfo?.goal.replace(
                      /([a-z])([A-Z])/g,
                      "$1 $2"
                    ) ?? "not set yet",
                },
              ]}
              isDashboardLink={
                profile?.fitnessInfo && profile?.personalInfo ? true : false
              }
            />

            <Box flex={1} paddingBottom="sm">
              {!user?.isInjured &&
                profile?.fitnessInfo &&
                profile?.personalInfo && (
                  <>
                    <PlanCategoryCard
                      category="generalWorkoutRoutine"
                      onPress={() => {
                        navigation.navigate("GeneralWorkoutRoutine");
                        store.dispatch(
                          gymActions.setSelectedWorkout({
                            WorkoutType: WorkoutType.Default,
                            createdBy: "",
                          })
                        );
                      }}
                    />
                    {workout && workout?.length > 0 ? (
                      <PlanCategoryCard
                        category="workout"
                        onPress={() => {
                          navigation.navigate("WorkoutRoutine");
                          store.dispatch(
                            gymActions.setSelectedWorkout({
                              WorkoutType: WorkoutType.SelfCreated,
                              createdBy: "",
                            })
                          );
                        }}
                      />
                    ) : (
                      <PlanCategoryCard
                        category="createWorkout"
                        onPress={() => navigation.navigate("GenerateWorkout")}
                      />
                    )}
                    {mealPlan && mealPlan.length > 0 ? (
                      <PlanCategoryCard
                        category="meal"
                        onPress={() => {
                          store.dispatch(
                            gymActions.setSelectedMealPlanType(
                              MealPlanType.SelfCreated
                            )
                          );
                          navigation.navigate("MealPlan");
                        }}
                      />
                    ) : (
                      <PlanCategoryCard
                        category="createMealPlan"
                        onPress={() => navigation.navigate("GenerateMealPlan")}
                      />
                    )}
                  </>
                )}
              {/* <Button onPress={() => navigation.navigate('PricingPackages')}>
                PRICING
              </Button> */}

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
