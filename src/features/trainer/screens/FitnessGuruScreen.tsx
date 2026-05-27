import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { store } from "@/store";
import PageWrapper from "@components/app/PageWrapper";
import {
  Calendar,
  Users,
  Bike,
  Utensils,
  BicepsFlexed,
  CirclePlus,
} from "lucide-react-native";
import { MyTabNavigatorScreenProps } from "@navigation/types";
import { useQuery } from "react-query";
import {
  getFitnessGuruRequest,
  getScheduleReRequestEligibility,
} from "@utils/services/trainersService";
import { getClientWorkoutsForTrainerView } from "@utils/services/workoutService";
import { getClientMealForTrainerView } from "@utils/services/mealPlanService";
import WorkoutReRequestSheet from "../components/WorkoutReRequestSheet";
import MealReRequestSheet from "../components/MealReRequestSheet";
import BottomSheet from "@gorhom/bottom-sheet";
import { useRef } from "react";
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
import { getClientProfileInfo } from "@utils/services/authServices";
import { useFocusEffect } from "@react-navigation/native";

const FitnessGuruScreen: React.FC<MyTabNavigatorScreenProps<"FitnessGuru">> = ({
  navigation,
}) => {
  const { user } = store.getState()["feature/auth"];
  const greetingMessage: string = greetingTime(new Date());
  const { height: screenHeight } = useWindowDimensions();
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const queryOptions = {
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1,
  };

  const {
    isLoading: isFitnessGuruRequestLoading,
    data: fitnessGuruRequest,
    refetch: fitnessGuruRequestRefetch,
  } = useQuery("fitnessGuruRequest", getFitnessGuruRequest);

  const { data: eligibility, refetch: eligibilityRefetch } = useQuery(
    "scheduleReRequestEligibility",
    getScheduleReRequestEligibility
  );

  const {
    isLoading: isProfileLoading,
    data: profile,
    refetch: profileRefetch,
  } = useQuery("profile", getClientProfileInfo);

  const workoutSheetRef = useRef<BottomSheet>(null);
  const mealSheetRef = useRef<BottomSheet>(null);

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

  useEffect(() => {}, [user]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          await fitnessGuruRequestRefetch();
          await eligibilityRefetch();
          await profileRefetch();
          await workoutRefetch();
          await mealRefetch();
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
    }, [
      profileRefetch,
      workoutRefetch,
      mealRefetch,
      eligibilityRefetch,
      fitnessGuruRequestRefetch,
    ])
  );

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    day: "numeric",
    month: "long",
  }).format(new Date());

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateString));
  };

  const handleWorkoutRequest = () => {
    if (!user?.subscription?.status) {
      workoutSheetRef.current?.close();
      Toast.show({
        type: "info",
        text1: "Subscription Required",
        text2: "Please subscribe to request a workouts plan.",
      });
      navigation.navigate("PricingPackages");
      return;
    }

    if (!eligibility?.workout?.canRequest) {
      workoutSheetRef.current?.close();
      Toast.show({
        type: "info",
        text1: "Request Not Available",
        text2: eligibility?.workout?.nextRequestAt
          ? `You can request again on ${formatDate(
              eligibility?.workout?.nextRequestAt
            )}`
          : "Meal plan and workout plan from Fitness Guru are required",
      });
      return;
    }
    workoutSheetRef.current?.expand();
  };

  const handleMealRequest = () => {
    if (!user?.subscription?.status) {
      mealSheetRef.current?.close();
      Toast.show({
        type: "info",
        text1: "Subscription Required",
        text2: "Please subscribe to request a meal plan.",
      });
      navigation.navigate("PricingPackages");
      return;
    }
    if (!eligibility?.meal?.canRequest) {
      mealSheetRef.current?.close();
      Toast.show({
        type: "info",
        text1: "Request Not Available",
        text2: eligibility?.meal?.nextRequestAt
          ? `You can request again on ${formatDate(
              eligibility?.meal?.nextRequestAt
            )}`
          : "Meal plan from Fitness Guru is required",
      });
      return;
    }
    mealSheetRef.current?.expand();
  };

  if (
    isFitnessGuruRequestLoading ||
    isWorkoutLoading ||
    isMealLoading ||
    isProfileLoading
  ) {
    return <FullScreenLoader />;
  }

  const isLoading =
    !user ||
    user.subscription === undefined ||
    fitnessGuruRequest === undefined ||
    profile === undefined;

  if (isLoading) {
    return <FullScreenLoader />;
  }

  return (
    <Box flex={1}>
      <PageWrapper>
        <PageHeader title="Home" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: theme.spacing.sm,
            flexGrow: 1,
          }}
        >
          <Box flex={1} gap="md">
            <Box flexDirection="row" alignItems="center" gap="md">
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
                        {(capitalizeString(profile?.firstName?.[0] ?? "") ||
                          "") +
                          (capitalizeString(profile?.lastName?.[0] ?? "") ||
                            "")}
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
                <Text variant="lgBold" numberOfLines={1}>
                  {capitalizeString(greetingMessage)},{" "}
                  {profile?.firstName || ""}
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

            <Box flexDirection="row" gap="sm">
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
                    {fitnessGuruRequest?.goal
                      ? fitnessGuruRequest?.goal.replace(
                          /([a-z])([A-Z])/g,
                          "$1 $2"
                        )
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
                  <Text variant="sm" color="textSecondary">
                    DCI
                  </Text>
                  <Text variant="md" numberOfLines={1}>
                    {fitnessGuruRequest?.calculatedMetrics?.dci
                      ? `${Math.round(
                          fitnessGuruRequest?.calculatedMetrics?.dci
                        )} Cal`
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
                  <Text variant="sm" color="textSecondary">
                    BMR
                  </Text>
                  <Text variant="md" numberOfLines={1}>
                    {fitnessGuruRequest?.calculatedMetrics?.bmr
                      ? `${Math.round(
                          fitnessGuruRequest?.calculatedMetrics?.bmr
                        )} Cal`
                      : "0 Cal"}
                  </Text>
                </Box>
                <Box width={8} backgroundColor="PrimaryGreen" />
              </Box>
            </Box>

            {fitnessGuruRequest?.status !== "Pending" ? (
              <InfoCard
                title="Train with Fitness Guru"
                description="Start your journey with guided workouts, progress tracking, and personalized plans designed to support your fitness goals."
                imageSource={require("assets/images/trainer-with-form.png")}
                buttonTitle="Invest in Yourself"
                buttonOnPress={() =>
                  navigation.push("TrainerApplication", {
                    trainerId: "fitness-guru",
                    packageId: "456",
                  })
                }
              />
            ) : !filteredWorkout?.length && !filteredMeal?.length ? (
              <InfoCard
                title="Your Schedule is on the way"
                description="Your data have been shared with your fitnessguru. You will be displayed your workout routines and meal plans once the fitnessguru shared with you."
                imageSource={require("assets/images/green-tick.png")}
              />
            ) : null}

            {((filteredWorkout?.length ?? 0) > 0 ||
              (filteredMeal?.length ?? 0) > 0) && (
              <>
                <Box gap="sm" flex={1}>
                  {filteredWorkout && filteredWorkout.length > 0 && (
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
                      }}
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
                      <BicepsFlexed
                        color={theme.colors.PrimaryGreen}
                        size={40}
                        strokeWidth={1}
                      />
                      <Text
                        variant="lg"
                        color="PrimaryGreen"
                        textAlign="center"
                      >
                        Your Workout Routine
                      </Text>
                      <Text
                        color="textSecondary"
                        textAlign="center"
                        variant="sm"
                      >
                        Perform any workout routine based on your weekly
                        schedule.
                      </Text>
                    </TouchableOpacity>
                  )}

                  {filteredMeal && filteredMeal.length > 0 && (
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
                      }}
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
                      <Utensils
                        color={theme.colors.PrimaryGreen}
                        size={40}
                        strokeWidth={1}
                      />
                      <Text variant="lg" color="PrimaryGreen">
                        Your Meal Plan
                      </Text>
                      <Text
                        variant="sm"
                        color="textSecondary"
                        textAlign="center"
                      >
                        Perform any workout routine based on your weekly
                        schedule.
                      </Text>
                    </TouchableOpacity>
                  )}
                </Box>

                <Box mb="xs">
                  <Text variant="lgBold">Request new schedules</Text>
                  <Box
                    flexDirection="row"
                    justifyContent="space-between"
                    gap="sm"
                    mt="sm"
                  >
                    <TouchableOpacity
                      style={{ flex: 1 }}
                      onPress={handleWorkoutRequest}
                    >
                      <Box
                        backgroundColor="backgroundSecondary"
                        borderRadius="sm"
                        p="md"
                      >
                        <Text variant="xs" color="textSecondary">
                          Type
                        </Text>
                        <Text variant="md">Workout</Text>
                      </Box>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{ flex: 1 }}
                      onPress={handleMealRequest}
                    >
                      <Box
                        backgroundColor="backgroundSecondary"
                        borderRadius="sm"
                        p="md"
                      >
                        <Text variant="xs" color="textSecondary">
                          Type
                        </Text>
                        <Text variant="md">Meal Plan</Text>
                      </Box>
                    </TouchableOpacity>
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </ScrollView>
        <WorkoutReRequestSheet
          bottomSheetRef={workoutSheetRef}
          onSuccess={() => {
            eligibilityRefetch();
          }}
        />
        <MealReRequestSheet
          bottomSheetRef={mealSheetRef}
          onSuccess={() => {
            eligibilityRefetch();
          }}
        />
      </PageWrapper>
    </Box>
  );
};

export default FitnessGuruScreen;
