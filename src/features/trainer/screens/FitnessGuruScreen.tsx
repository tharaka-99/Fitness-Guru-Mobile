import React, { useEffect, useState } from "react";
import { View, Image, TouchableOpacity, ScrollView } from "react-native";
import { store } from "@/store";
import PageWrapper, { PAGE_WIDTH } from "@components/app/PageWrapper";
import { Calendar, Users, Bike, Utensils, BicepsFlexed, CirclePlus } from "lucide-react-native";
import { MyTabNavigatorScreenProps } from "@navigation/types";
import { useQuery } from "react-query";
import { getFitnessGuruRequest } from "@utils/services/trainersService";
import { getClientWorkoutsForTrainerView } from "@utils/services/workoutService";
import { getClientMealForTrainerView } from "@utils/services/mealPlanService";
import { gymActions } from "@features/gym/context/slice";
import { WorkoutType } from "@utils/types/types";
import { MealPlanType } from "@utils/types/mealPlanTypes";
import Box from "@components/atoms/Box";
import Text from "@components/atoms/Text";
import FullScreenLoader from "@components/atoms/FullScreenLoader";
import { theme, constants } from "@utils/styles/theme";
import InfoCard from "@components/app/InfoCard";
import greetingTime from "greeting-time";
import { capitalizeString } from "@utils/helpers";
import PageHeader from "@components/app/header/PageHeader";
import Toast from "react-native-toast-message";

const FitnessGuruScreen: React.FC<MyTabNavigatorScreenProps<"FitnessGuru">> = ({
  navigation,
}) => {
  const { user } = store.getState()["feature/auth"];
  const [subscription, setSubscription] = useState<any>(undefined);
  const greetingMessage: string = greetingTime(new Date());

  const {
    isLoading: isFitnessGuruRequestLoading,
    data: fitnessGuruRequest,
    refetch: fitnessGuruRequestRefetch,
  } = useQuery("fitnessGuruRequest", getFitnessGuruRequest);

  const {
    isLoading: isWorkoutLoading,
    data: workout,
    refetch: workoutRefetch,
  } = useQuery("workout", getClientWorkoutsForTrainerView);

  const {
    isLoading: isMealLoading,
    data: meal,
    refetch: mealRefetch,
  } = useQuery("meal", getClientMealForTrainerView);

  const filteredWorkout = workout?.filter(
    (w) => w.type === "FitnessGuruCreated"
  );


  const filteredMeal = meal?.filter((m) => m.type === "FitnessGuruCreated");

  useEffect(() => {
    setSubscription(user?.subscription);
  }, [user]);

  useEffect(() => {
    fitnessGuruRequestRefetch();
    workoutRefetch();
    mealRefetch();
  }, [fitnessGuruRequestRefetch, workoutRefetch, mealRefetch]);

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    day: "numeric",
    month: "long",
  }).format(new Date());

  if (isFitnessGuruRequestLoading || isWorkoutLoading || isMealLoading) {
    return <FullScreenLoader />;
  }

  const isLoading = !user || subscription === undefined || fitnessGuruRequest === undefined;
  if (isLoading) {
    return <FullScreenLoader />;
  }


  return (
    <Box flex={1}>
      <PageWrapper>
        <PageHeader title="Fitness Guru" />

        <Box flex={1} gap="md" pb="sm">
          <Box flexDirection="row" alignItems="center" gap="md" mb="sm">
            <Box flexDirection="row" alignItems="center">
              <Box>
                {user?.profileImageFileUrl ? (
                  <Image
                    source={{ uri: user.profileImageFileUrl }}
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
                      {(user?.firstName?.[0] || "") + (user?.lastName?.[0] || "")}
                    </Text>
                  </Box>
                )}
              </Box>
              <Box
                style={{ marginLeft: -10 }}
                width={60}
                height={60}
                borderRadius="full"
                backgroundColor="PrimaryGreen"
                alignItems="center"
                justifyContent="center"
              >
                <Image
                  source={require("assets/images/green_logo_icon.png")}
                  style={{ width: 35, height: 35 }}
                  resizeMode="contain"
                />
              </Box>
            </Box>
            <Box>
              <Text variant="lgBold">
                Welcome back, {user?.firstName || "User"}
              </Text>
              <Text variant="md" color="textSecondary">
                {formattedDate}
              </Text>
            </Box>
          </Box>


          {fitnessGuruRequest?.status !== "Pending" ? (
            ((subscription && subscription?.status === true) ||
              user?.isTrialActive === true) ? (
              <InfoCard
                description="By clicking start your journey button, you will be redirected to fill a form where your trainer will create custom workout routines and meal plans based on your input data."
                imageSource={require("assets/images/trainer-with-form.png")}
                buttonTitle="Start Your Journey"
                buttonOnPress={() =>
                  navigation.push("TrainerApplication", {
                    trainerId: "fitness-guru",
                    packageId: "456",
                  })
                }
              />
            ) : (
              <InfoCard
                title="Train with Fitness Guru"
                description="Start your journey with guided workouts, progress tracking, and personalized plans designed to support your fitness goals."
                imageSource={require("assets/images/trainer-with-form.png")}
                buttonTitle="Invest in Yourself"
                buttonOnPress={() => navigation.navigate("PricingPackages")}
              />
            )
          ) : (
            (!filteredWorkout?.length && !filteredMeal?.length) && (
              <InfoCard
                title="Your Schedule is on the way"
                description="Your data have been shared with your fitnessguru. You will be displayed your workout routines and meal plans once the fitnessguru shared with you."
                imageSource={require("assets/images/green-tick.png")}
              />
            )
          )}

          {((filteredWorkout?.length ?? 0) > 0 || (filteredMeal?.length ?? 0) > 0) && (
            <>
              <Box flexDirection="row" gap="sm" mb="sm">
                <Box
                  flex={1}
                  borderRadius="sm"
                  borderWidth={1}
                  borderColor="borderSecondary"
                  flexDirection="row"
                  overflow="hidden"
                >
                  <Box flex={1} p="sm">
                    <Text variant="sm" color="textSecondary">Goal</Text>
                    <Text variant="md" numberOfLines={1}>
                      {user?.fitnessInfo?.goal
                        ? user.fitnessInfo.goal.replace(/([a-z])([A-Z])/g, "$1 $2")
                        : "Not Set"}
                    </Text>
                  </Box>
                  <Box width={8} backgroundColor="PrimaryGreen" />
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
                    <Text variant="sm" color="textSecondary">DCI</Text>
                    <Text variant="md" numberOfLines={1}>
                      {user?.calculatedMetrics?.dci
                        ? `${Math.round(user.calculatedMetrics.dci)} Cal`
                        : "0 Cal"}
                    </Text>
                  </Box>
                  <Box width={8} backgroundColor="PrimaryGreen" />
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
                    <Text variant="sm" color="textSecondary">BMR</Text>
                    <Text variant="md" numberOfLines={1}>
                      {user?.calculatedMetrics?.bmr
                        ? `${Math.round(user.calculatedMetrics.bmr)} Cal`
                        : "0 Cal"}
                    </Text>
                  </Box>
                  <Box width={8} backgroundColor="PrimaryGreen" />
                </Box>
              </Box>
              <Box gap="sm" flex={1}>
                {filteredWorkout && filteredWorkout.length > 0 && (
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    activeOpacity={constants.activeOpacity}
                    onPress={() => {
                      store.dispatch(
                        gymActions.setSelectedWorkout({
                          WorkoutType: WorkoutType.FitnessGuruCreated,
                          createdBy: fitnessGuruRequest?.trainerId,
                        })
                      );
                      navigation.navigate("WorkoutRoutine");
                    }}
                  >
                    <Box
                      flex={1}
                      backgroundColor="backgroundSecondary"
                      borderRadius="md"
                      borderWidth={1}
                      borderColor="borderSecondary"
                      p="lg"
                      alignItems="center"
                      justifyContent="center"
                      gap="xs"

                    >
                      <BicepsFlexed color={theme.colors.PrimaryGreen} size={40} strokeWidth={1} />
                      <Text variant="lg" color="PrimaryGreen" textAlign="center">Your Workout Routine</Text>
                      <Text color="textSecondary" textAlign="center" variant="sm">
                        Perform any workout routine based on your weekly schedule.
                      </Text>
                    </Box>
                  </TouchableOpacity>
                )}


                {filteredMeal && filteredMeal.length > 0 && (
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    activeOpacity={constants.activeOpacity}
                    onPress={() => {
                      store.dispatch(
                        gymActions.setSelectedMealPlanType(
                          MealPlanType.FitnessGuruCreated
                        )
                      );
                      navigation.navigate("MealPlan");
                    }}
                  >
                    <Box
                      flex={1}
                      backgroundColor="backgroundSecondary"
                      borderRadius="md"
                      borderWidth={1}
                      borderColor="borderSecondary"
                      p="lg"
                      alignItems="center"
                      justifyContent="center"
                      gap="xs"


                    >
                      <Utensils color={theme.colors.PrimaryGreen} size={40} strokeWidth={1} />
                      <Text variant="lg" color="PrimaryGreen">Your Meal Plan</Text>
                      <Text variant="sm" color="textSecondary" textAlign="center">
                        Perform any workout routine based on your weekly schedule.
                      </Text>
                    </Box>
                  </TouchableOpacity>
                )}
              </Box>


              <Box mb="xs">
                <Text variant="lgBold">Request new schedules</Text>
                <Box flexDirection="row" justifyContent="space-between" gap="sm" mt="sm">
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={() => {
                      Toast.show({
                        type: "info",
                        text1: "Request New Schedule",
                        text2: "Request workout will be available soon",
                      });
                    }}
                  >
                    <Box
                      backgroundColor="backgroundSecondary"
                      borderRadius="sm"
                      p="md"
                    >
                      <Text variant="xs" color="textSecondary">Type</Text>
                      <Text variant="md">Workout</Text>
                    </Box>
                  </TouchableOpacity>


                  <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={() => {
                      Toast.show({
                        type: "info",
                        text1: "Request New Schedule",
                        text2: "Request meal plan will be available soon",
                      });
                    }}
                  >
                    <Box
                      backgroundColor="backgroundSecondary"
                      borderRadius="sm"
                      p="md"
                    >
                      <Text variant="xs" color="textSecondary">Type</Text>
                      <Text variant="md">Meal Plan</Text>
                    </Box>
                  </TouchableOpacity>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </PageWrapper>
    </Box>
  );
};


export default FitnessGuruScreen;




