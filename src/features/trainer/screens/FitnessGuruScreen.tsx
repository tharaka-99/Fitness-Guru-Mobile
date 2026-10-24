import React, { useEffect, useRef } from "react";
import { View, Image, TouchableOpacity, ScrollView } from "react-native";
import { store } from "@/store";
import PageWrapper from "@components/app/PageWrapper";
import { MyTabNavigatorScreenProps } from "@navigation/types";
import { useQuery } from "@tanstack/react-query";
import { getFitnessGuruRequest } from "@utils/services/trainersService";
import { getClientWorkoutsForTrainerView } from "@utils/services/workoutService";
import { getMealPlan } from "@utils/services/mealPlanService";
import { gymActions } from "@features/gym/context/slice";
import { WorkoutType } from "@utils/types/types";
import { MealPlanType } from "@utils/types/mealPlanTypes";
import Box from "@components/atoms/Box";
import Text from "@components/atoms/Text";
import FullScreenLoader from "@components/atoms/FullScreenLoader";
import greetingTime from "greeting-time";
import { capitalizeString } from "@utils/helpers";
import PageHeader from "@components/app/header/PageHeader";
import Toast from "react-native-toast-message";
import { getClientProfileInfo } from "@utils/services/authServices";
import { useFocusEffect } from "@react-navigation/native";
import useSubscription from "@features/subscription/hooks/useSubscription";
import { useSelector } from "react-redux";
import { useBottomTabPadding } from "@/hooks/useBottomTabPadding";

// NEW SECTIONS
import CalendarSection from "../components/fitness-guru/CalendarSection";
import WeeklyGoalSection from "../components/fitness-guru/WeeklyGoalSection";
import MonthlySchedulesSection from "../components/fitness-guru/MonthlySchedulesSection";
import DailyHabitsSection from "../components/fitness-guru/DailyHabitsSection";
import PersonalisedPlanCard from "../components/fitness-guru/PersonalisedPlanCard";

// NEW HOOKS
import { useWeeklyOverview } from "../hooks/useWeeklyOverview";
import { useDailyHabits } from "../hooks/useDailyHabits";

const FitnessGuruScreen: React.FC<MyTabNavigatorScreenProps<"FitnessGuru">> = ({
  navigation,
}) => {
  const bottomPadding = useBottomTabPadding();
  const { user } = useSelector((state: any) => state["feature/auth"]);
  const greetingMessage: string = greetingTime(new Date());
  const isMountedRef = useRef(true);
  const { isSubscribed } = useSubscription();

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // EXISTING DATA FETCHING
  const {
    isLoading: isFitnessGuruRequestLoading,
    data: fitnessGuruRequest,
    refetch: fitnessGuruRequestRefetch,
  } = useQuery({
    queryKey: ["fitnessGuruRequest"],
    queryFn: getFitnessGuruRequest,
  });


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
    queryKey: ["trainerWorkouts"],
    queryFn: getClientWorkoutsForTrainerView,
  });

  const {
    isLoading: isMealLoading,
    data: meal,
    refetch: mealRefetch,
  } = useQuery({
    queryKey: ["trainerMeals"],
    queryFn: getMealPlan,
  });

  const filteredWorkout = React.useMemo(() => {
    return workout?.filter((w) => w.type === "FitnessGuruCreated");
  }, [workout]);

  const targetWorkout = filteredWorkout?.[0] || workout?.[0];

  // NEW DATA FETCHING (Server-authoritative weekly sessions & targets)
  const {
    data: weeklyOverview,
    isLoading: isWeeklyOverviewLoading,
    refetch: weeklyOverviewRefetch,
  } = useWeeklyOverview(targetWorkout);
  const calendarData = weeklyOverview?.calendar;
  const progressData = weeklyOverview?.progress;
  const { data: habitsData, logHabit, isLogging, isLoading: isHabitsLoading, refetch: habitsRefetch } = useDailyHabits();


  const filteredMeal = React.useMemo(() => {
    return meal?.filter((m) => m.type === "FitnessGuruCreated");
  }, [meal]);

  React.useEffect(() => {
    if (workout) {
      store.dispatch(gymActions.setWorkouts(workout));
    }
  }, [workout]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          await Promise.all([
            fitnessGuruRequestRefetch(),
            profileRefetch(),
            workoutRefetch(),
            mealRefetch(),
            habitsRefetch(),
            weeklyOverviewRefetch(),
          ]);
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
      fitnessGuruRequestRefetch,
      habitsRefetch,
      weeklyOverviewRefetch,
    ])
  );


  if (
    isFitnessGuruRequestLoading ||

    isWorkoutLoading ||
    isMealLoading ||
    isProfileLoading ||
    isWeeklyOverviewLoading ||
    isHabitsLoading
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

  const isPending = fitnessGuruRequest?.status === "Pending";
  const hasActivePlans =
    (filteredWorkout?.length ?? 0) > 0 || (filteredMeal?.length ?? 0) > 0;

  return (
    <PageWrapper noPadding>
      <Box px={"md"}>
        <PageHeader title="Home" />
      </Box>

      <ScrollView
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        contentContainerStyle={{
          flexGrow: 1,
          marginBottom: bottomPadding
        }}
      >
        <Box px={"md"} flexDirection="row" alignItems="center" justifyContent="space-between" mb="md">
          <Box flexDirection="row" alignItems="center">
            {/* Dual overlapping avatar badge */}
            <Box flexDirection="row" alignItems="center">
              {user?.profileImageFileUrl ? (
                <Image
                  source={{ uri: user.profileImageFileUrl }}
                  style={{ width: 50, height: 50, borderRadius: 25 }}
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
            <Box ml="md">
              <Text variant="lgBold" color="PrimaryWhite">
                Welcome, {capitalizeString(profile?.firstName || user?.name || "User")}
              </Text>
              <Text variant="sm" color="textSecondary">
                Your fitness journey starts here
              </Text>
            </Box>
          </Box>
        </Box>

        {/* If no active plans, show the Personalised Plan onboarding stepper */}
        {!hasActivePlans && (
          <PersonalisedPlanCard
            stage={isPending ? "pending" : "requesting"}
            onCompleteProfile={() =>
              navigation.push("TrainerApplication", {
                trainerId: "fitness-guru",
                packageId: "456",
              })
            }
          />
        )}

        {/* NEW UI SECTIONS (ACTIVE PLAN DASHBOARD) */}
        {hasActivePlans && calendarData && <CalendarSection dates={calendarData} />}

        {hasActivePlans && (progressData || filteredMeal) && (
          <WeeklyGoalSection
            progress={progressData}
            mealPlan={
              filteredMeal?.[0] ||
              meal?.find((m) => m.type === "FitnessGuruCreated") ||
              meal?.[0] ||
              null
            }
            onViewWorkout={() => {
              store.dispatch(
                gymActions.setSelectedWorkout({
                  WorkoutType: WorkoutType.FitnessGuruCreated,
                  createdBy: fitnessGuruRequest?.trainerId,
                })
              );
              navigation.navigate("WorkoutRoutine");
            }}
            onViewMealPlan={() => {
              store.dispatch(
                gymActions.setSelectedMealPlanType(MealPlanType.FitnessGuruCreated)
              );
              navigation.navigate("MealPlan");
            }}
          />
        )}

        {hasActivePlans && (
          <MonthlySchedulesSection
            hasWorkout={(filteredWorkout?.length ?? 0) > 0}
            hasMealPlan={(filteredMeal?.length ?? 0) > 0}
            onWorkoutPress={() => {
              store.dispatch(
                gymActions.setSelectedWorkout({
                  WorkoutType: WorkoutType.FitnessGuruCreated,
                  createdBy: fitnessGuruRequest?.trainerId,
                })
              );
              navigation.navigate("WorkoutRoutine");
            }}
            onMealPress={() => {
              store.dispatch(
                gymActions.setSelectedMealPlanType(MealPlanType.FitnessGuruCreated)
              );
              navigation.navigate("MealPlan");
            }}
          />
        )}

        {hasActivePlans && habitsData && (
          <DailyHabitsSection habits={habitsData} onLogHabit={logHabit} isLoading={isLogging} />
        )}

        <Box height={100} />
      </ScrollView>
    </PageWrapper>
  );
};

export default FitnessGuruScreen;
