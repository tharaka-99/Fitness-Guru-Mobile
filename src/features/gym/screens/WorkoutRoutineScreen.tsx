import React, { useCallback, useRef } from "react";
import { FlatList, TouchableOpacity } from "react-native";
import Box from "@components/atoms/Box";
import { store } from "@/store";
import PageWrapper from "@components/app/PageWrapper";
import PageHeader from "@components/app/header/PageHeader";
import { MyStackNavigatorScreenProps } from "@navigation/types";
import { theme } from "@utils/styles/theme";
import WorkoutDayCard from "../components/WorkoutDayCard";
import { gymActions } from "../context/slice";
import {
  WorkoutType,
  Workout,
  ExerciseDay,
  DefaultExercise,
  Exercises,
} from "@utils/types/types";
import Text from "@components/atoms/Text";
import Button from "@components/atoms/Button";
import { ArrowLeft, Plus } from "lucide-react-native";
import useSubscription from "@features/subscription/hooks/useSubscription";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import {
  getClientDefaultWorkouts,
  getCurrentWorkout,
} from "@utils/services/workoutService";
import { getScheduleReRequestEligibility } from "@utils/services/trainersService";
import WorkoutReRequestSheet from "@features/trainer/components/WorkoutReRequestSheet";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import Toast from "react-native-toast-message";
import FullScreenLoader from "@components/atoms/FullScreenLoader";
import { useFocusEffect } from "@react-navigation/native";
import {
  useActiveWorkoutSession,
  useWorkoutWeekCalendar,
  isTodayWorkoutCompleted,
  isWorkoutDayCompleted,
} from "../hooks/useWorkoutSession";

const WorkoutRoutineScreen: React.FC<
  MyStackNavigatorScreenProps<"WorkoutRoutine">
> = ({ navigation }) => {
  const { selectedWorkout, selectedGeneralDay } = useSelector(
    (state: any) => state["feature/gym"]
  );
  const { isSubscribed } = useSubscription();

  const { data: workouts, isLoading: isWorkoutLoading } = useQuery({
    queryKey: ["currentWorkout"],
    queryFn: getCurrentWorkout,
  });

  const { data: defaultWorkouts, isLoading: isDefaultWorkoutLoading } =
    useQuery({
      queryKey: ["defaultWorkout"],
      queryFn: getClientDefaultWorkouts,
    });

  // Server-authoritative session and week calendar hooks
  const {
    data: activeSession,
    isLoading: isActiveSessionLoading,
    refetch: refetchActiveSession,
  } = useActiveWorkoutSession();

  const {
    data: weekCalendar,
    isLoading: isWeekCalendarLoading,
    refetch: refetchWeekCalendar,
  } = useWorkoutWeekCalendar();

  const workoutSheetRef = useRef<BottomSheetModalMethods | null>(null);

  const { data: eligibility, refetch: eligibilityRefetch } = useQuery({
    queryKey: ["scheduleReRequestEligibility"],
    queryFn: getScheduleReRequestEligibility,
  });

  useFocusEffect(
    useCallback(() => {
      refetchActiveSession();
      refetchWeekCalendar();
      eligibilityRefetch();
    }, [refetchActiveSession, refetchWeekCalendar, eligibilityRefetch])
  );

  if (
    isWorkoutLoading ||
    isDefaultWorkoutLoading ||
    isActiveSessionLoading ||
    isWeekCalendarLoading
  ) {
    return <FullScreenLoader />;
  }

  const handleAddWorkout = () => {
    navigation.navigate("Onboard");
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateString));
  };

  const handleWorkoutRequest = () => {
    if (!isSubscribed) {
      workoutSheetRef.current?.dismiss();
      Toast.show({
        type: "info",
        text1: "Subscription Required",
        text2: "Please subscribe to request a workouts plan.",
      });
      navigation.navigate("PricingPackages");
      return;
    }

    if (!eligibility?.workout?.canRequest) {
      workoutSheetRef.current?.dismiss();
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
    workoutSheetRef.current?.present();
  };

  const getWorkoutEligibilityText = () => {
    if (!eligibility?.workout) return null;
    if (eligibility.workout.canRequest) {
      return {
        text: "You are eligible to request a new workout routine now",
        isEligible: true,
      };
    }
    if (
      eligibility.workout.remainingDays &&
      eligibility.workout.remainingDays > 0
    ) {
      const days = eligibility.workout.remainingDays;
      const dateStr = formatDate(eligibility.workout.nextRequestAt);
      return {
        text: `Next request available in ${days} day${days > 1 ? "s" : ""}${dateStr ? ` (${dateStr})` : ""
          }`,
        isEligible: false,
      };
    }
    if (eligibility.workout.nextRequestAt) {
      return {
        text: `Next request available on ${formatDate(
          eligibility.workout.nextRequestAt
        )}`,
        isEligible: false,
      };
    }
    return {
      text: "A workout plan from Fitness Guru is required to request an update",
      isEligible: false,
    };
  };

  // Filter out only the data with type "SelfCreated" and "Default"
  let filteredData;
  if (selectedWorkout.WorkoutType === WorkoutType.TrainerCreated) {
    filteredData = workouts?.filter(
      (item) =>
        item.type === selectedWorkout.WorkoutType &&
        item.createdBy === selectedWorkout.createdBy
    );
  } else {
    filteredData = workouts?.filter(
      (item) => item.type === selectedWorkout.WorkoutType
    );
  }

  // Extract exerciseDays from the filtered selfCreatedData
  const exerciseDays = filteredData
    ?.map((item: Workout) => item.exerciseDays)
    .flat();

  // get the general workout list according to the selected day
  const generalExerciseDays =
    defaultWorkouts?.[selectedGeneralDay]?.exerciseDays;

  // Function to handle onPress event of WorkoutDayCard
  const handleWorkoutDayPress = (day: number) => {
    // Dispatch an action to set the selected day in Redux store
    store.dispatch(gymActions.setSelectedDay(day));

    // Navigate to WorkoutList screen
    navigation.push("WorkoutList");
  };

  const isSessionInProgress = Boolean(
    activeSession &&
    (activeSession.workoutId ||
      activeSession.exerciseDay != null ||
      activeSession._id) &&
    activeSession.status &&
    activeSession.status !== "completed"
  );
  const isAnyCompletedToday = isTodayWorkoutCompleted(weekCalendar);

  const canRequestWorkout = !!eligibility?.workout?.canRequest;

  return (
    <PageWrapper>
      <PageHeader
        leftComponent={
          <Box flexDirection="row" alignItems="center" gap="md">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ArrowLeft size={30} color={theme.colors.PrimaryGreen} />
            </TouchableOpacity>
            <Text color="PrimaryGreen" variant="xlBold" numberOfLines={1}>
              Workout Routine
            </Text>
          </Box>
        }
        rightComponent={
          selectedWorkout.WorkoutType === WorkoutType.SelfCreated ? (
            <TouchableOpacity onPress={handleAddWorkout}>
              <Plus size={30} color={theme.colors.PrimaryGreen} />
            </TouchableOpacity>
          ) : null
        }
      />
      {selectedWorkout.WorkoutType === WorkoutType.Default ? (
        <FlatList
          contentContainerStyle={{ flexGrow: 1 }}
          data={generalExerciseDays}
          keyExtractor={({ day }) => String(day)}
          ListEmptyComponent={
            <Box flex={1} justifyContent="center" alignItems="center" px="xl">
              <Text variant="lgBold" color="textSecondary" textAlign="center">
                No Default Workouts Available
              </Text>
            </Box>
          }
          renderItem={({ item }) => {
            const { day, exercises } = item;

            const exerciseNames =
              exercises
                ?.map((exercise: DefaultExercise) => exercise?.exercise?.name)
                .filter(Boolean)
                .join(", ") || "No exercises available";

            const defaultWorkoutId =
              defaultWorkouts?.[selectedGeneralDay]?._id ??
              "default-workout-id";
            const isCompletedThisWeek = isWorkoutDayCompleted(
              day,
              weekCalendar,
              defaultWorkoutId
            );
            const isActiveSession = Boolean(
              isSessionInProgress &&
              activeSession?.exerciseDay === day &&
              (activeSession?.workoutId === defaultWorkoutId ||
                !activeSession?.workoutId)
            );

            return (
              <WorkoutDayCard
                title={`Day ${day?.toString()}`}
                description={exerciseNames}
                onPress={() => handleWorkoutDayPress(day)}
                isActiveSession={isActiveSession}
                isSessionInProgress={isSessionInProgress}
                isCompleted={isCompletedThisWeek}
                isDailyLocked={isAnyCompletedToday && !isCompletedThisWeek}
              />
            );
          }}
        />
      ) : (
        <FlatList
          contentContainerStyle={{ flexGrow: 1 }}
          data={exerciseDays?.filter((item: ExerciseDay) => {
            const { exercises } = item;
            return (
              exercises?.some(
                (exercise: Exercises) => exercise?.exercise?.name
              ) || false
            );
          })}
          ListEmptyComponent={
            <Box flex={1} justifyContent="center" alignItems="center" px="xl">
              <Text variant="lgBold" color="textSecondary" textAlign="center">
                No workouts available
              </Text>
            </Box>
          }
          keyExtractor={({ day }) => String(day)}
          renderItem={({ item }) => {
            const { day, exercises } = item;
            const exerciseNames =
              exercises
                ?.map((exercise: Exercises) => exercise?.exercise?.name)
                .filter(Boolean)
                .join(", ") || "No exercises available";

            const isSelfCreated =
              selectedWorkout.WorkoutType === WorkoutType.SelfCreated;
            const workoutId = filteredData?.[0]?._id || "";
            const isCompletedThisWeek =
              !isSelfCreated &&
              isWorkoutDayCompleted(day, weekCalendar, workoutId);
            const isActiveSession = Boolean(
              !isSelfCreated &&
              isSessionInProgress &&
              activeSession?.exerciseDay === day &&
              (activeSession?.workoutId === workoutId ||
                !activeSession?.workoutId)
            );

            return (
              <WorkoutDayCard
                title={`Day ${day?.toString()}`}
                description={exerciseNames}
                onPress={() => handleWorkoutDayPress(day)}
                isActiveSession={isActiveSession}
                isSessionInProgress={!isSelfCreated && isSessionInProgress}
                isCompleted={isCompletedThisWeek}
                isDailyLocked={
                  !isSelfCreated && isAnyCompletedToday && !isCompletedThisWeek
                }
              />
            );
          }}
        />
      )}

      {selectedWorkout.WorkoutType !== WorkoutType.SelfCreated &&
        selectedWorkout.WorkoutType !== WorkoutType.Default && (
          <Box pt="sm">
            <Button
              disabled={!canRequestWorkout}
              title="Request New Workout Schedule"
              onPress={handleWorkoutRequest}
            />
            {(() => {
              const info = getWorkoutEligibilityText();
              if (!info) return null;
              return (
                <Text
                  variant="xs"
                  color={"textSecondary"}
                  textAlign="center"
                  style={{ marginTop: -12 }}
                  mb="sm"
                >
                  {info.text}
                </Text>
              );
            })()}
          </Box>
        )}

      <WorkoutReRequestSheet
        bottomSheetRef={workoutSheetRef}
        onSuccess={() => {
          eligibilityRefetch();
        }}
      />
    </PageWrapper>
  );
};

export default WorkoutRoutineScreen;
