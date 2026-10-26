import BottomSheet from "@gorhom/bottom-sheet";
import React, { useRef, useState, useCallback } from "react";
import {
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useSelector } from "react-redux";
import PageWrapper from "@components/app/PageWrapper";
import PageHeader from "@components/app/header/PageHeader";
import { MyStackNavigatorScreenProps } from "@navigation/types";
import { constants, theme } from "@utils/styles/theme";
import WorkoutInfoSheet from "../components/WorkoutInfoSheet";
import WorkoutListItem from "../components/WorkoutListItem";
import { store } from "@/store";
import { DefaultExercise, Exercises, WorkoutType } from "@utils/types/types";
import { gymActions } from "../context/slice";
import { ArrowLeft, Check, Lock } from "lucide-react-native";
import Box from "@components/atoms/Box";
import Text from "@components/atoms/Text";
import { useFocusEffect } from "@react-navigation/native";
import {
  useActiveWorkoutSession,
  useWorkoutWeekCalendar,
  useStartWorkoutSession,
  useCompleteWorkoutSession,
  isTodayWorkoutCompleted,
  isWorkoutDayCompleted,
} from "../hooks/useWorkoutSession";

const isPremiumUser = true;

const WorkoutListScreen: React.FC<
  MyStackNavigatorScreenProps<"WorkoutList">
> = ({ navigation }) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedWorkoutInfo, setSelectedWorkoutInfo] =
    useState<Exercises | null>(null);
  const [startModalVisible, setStartModalVisible] = useState(false);

  const [selectedGeneralWorkoutInfo, setSelectedGeneralWorkoutInfo] =
    useState<DefaultExercise | null>(null);

  const openWorkoutInfoSheet = () => {
    setSheetOpen(true);
    bottomSheetRef.current?.snapToIndex(0);
  };

  const {
    selectedDay,
    workouts,
    selectedWorkout,
    selectedGeneralDay,
    defaultWorkouts,
  } = useSelector((state: any) => state["feature/gym"]);

  // Server-authoritative queries and mutations
  const { data: activeSession, refetch: refetchActiveSession } =
    useActiveWorkoutSession();

  const { data: weekCalendar, refetch: refetchWeekCalendar } =
    useWorkoutWeekCalendar();

  const startWorkoutMutation = useStartWorkoutSession();
  const completeWorkoutMutation = useCompleteWorkoutSession();

  const isDefault = selectedWorkout.WorkoutType === WorkoutType.Default;
  const isSelfCreated = selectedWorkout.WorkoutType === WorkoutType.SelfCreated;
  const isSessionDisabled = isDefault || isSelfCreated;

  useFocusEffect(
    useCallback(() => {
      if (!isSessionDisabled) {
        refetchActiveSession();
        refetchWeekCalendar();
      }
    }, [isSessionDisabled, refetchActiveSession, refetchWeekCalendar])
  );

  // Find the selected workout
  const selectedWorkoutData = workouts?.find(
    (workout: any) => workout.type === selectedWorkout.WorkoutType
  );

  // Filter exercises based on selected day
  const filteredExercises =
    selectedWorkoutData?.exerciseDays?.find(
      (exerciseDay: any) => exerciseDay.day === selectedDay
    )?.exercises ?? [];

  // Filter general exercises based on selected day
  const filteredGeneralExercises =
    defaultWorkouts?.[selectedGeneralDay]?.exerciseDays?.find(
      (exerciseDay: any) => exerciseDay.day === selectedDay
    )?.exercises ?? [];

  const currentWorkoutId = isDefault
    ? defaultWorkouts?.[selectedGeneralDay]?._id ?? "default-workout-id"
    : selectedWorkoutData?._id ?? "";
  const currentTotalExercises = isDefault
    ? filteredGeneralExercises.length
    : filteredExercises.length;

  const isSessionInProgress = Boolean(
    !isSessionDisabled &&
      activeSession &&
      (activeSession.workoutId ||
        activeSession.exerciseDay != null ||
        activeSession._id) &&
      activeSession.status &&
      activeSession.status !== "completed"
  );
  const isActiveSession = Boolean(
    !isSessionDisabled &&
      isSessionInProgress &&
      activeSession?.exerciseDay === selectedDay &&
      (activeSession?.workoutId === currentWorkoutId ||
        !activeSession?.workoutId)
  );

  // Ready to complete when status is ready_to_complete or logged exercises equal total
  const canCompleteSession =
    isActiveSession &&
    (activeSession?.status === "ready_to_complete" ||
      (activeSession?.loggedExercises &&
        activeSession.loggedExercises.length >= currentTotalExercises));

  const isDisabled = isSessionInProgress && !isActiveSession;

  const isCompletedThisWeek =
    !isSessionDisabled &&
    isWorkoutDayCompleted(selectedDay, weekCalendar, currentWorkoutId);
  const isCompletedToday =
    !isSessionDisabled && isTodayWorkoutCompleted(weekCalendar);

  const handleStartWorkoutClick = () => {
    setStartModalVisible(true);
  };

  const confirmStartWorkout = () => {
    startWorkoutMutation.mutate(
      {
        workoutId: currentWorkoutId,
        exerciseDay: selectedDay,
      },
      {
        onSettled: () => {
          setStartModalVisible(false);
        },
      }
    );
  };

  const handleCompleteWorkout = () => {
    completeWorkoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigation.navigate("FitnessGuru" as any);
      },
    });
  };

  // Function to handle onPress event of workout item
  const handleWorkoutItemPress = (item: any) => {
    setSelectedWorkoutInfo(item);
    if (isPremiumUser) {
      store.dispatch(gymActions.setSelectedExercise(item));
      store.dispatch(
        gymActions.setSelectedWorkoutID(selectedWorkoutData?._id ?? "")
      );
      navigation.push("AnalyticsScreen", { hideTabs: !isSessionDisabled });
    } else openWorkoutInfoSheet();
  };

  const handleGeneralWorkoutItemPress = (item: any) => {
    setSelectedGeneralWorkoutInfo(item);
    if (isPremiumUser) {
      store.dispatch(gymActions.setSelectedExercise(item));
      store.dispatch(
        gymActions.setSelectedWorkoutID(
          defaultWorkouts?.[selectedGeneralDay]?._id ?? ""
        )
      );
      navigation.push("AnalyticsScreen", { hideTabs: !isSessionDisabled });
    } else openWorkoutInfoSheet();
  };

  return (
    <>
      <PageWrapper>
        <PageHeader
          leftComponent={
            <Box flexDirection="row" alignItems="center" gap="md">
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <ArrowLeft size={30} color={theme.colors.PrimaryGreen} />
              </TouchableOpacity>
              <Text color="PrimaryGreen" variant="xlBold" numberOfLines={1}>
                {`Day ${selectedDay}`}
              </Text>
            </Box>
          }
        />

        {selectedWorkout.WorkoutType === WorkoutType.Default ? (
          <FlatList
            data={filteredGeneralExercises}
            showsVerticalScrollIndicator={false}
            keyExtractor={({ _id }) => String(_id)}
            contentContainerStyle={{ gap: theme.spacing.sm }}
            renderItem={({ item }) => {
              const { exercise, reps, rest, sets, _id } = item;
              const description = `${sets} Sets | ${reps} Reps | ${rest} Rest`;
              return (
                <TouchableOpacity
                  onPress={() => handleGeneralWorkoutItemPress(item)}
                  activeOpacity={constants.activeOpacity}
                >
                  <WorkoutListItem
                    key={String(_id)}
                    title={exercise?.name}
                    image={exercise.url ? exercise.url : sampleImage}
                    description={description}
                  />
                </TouchableOpacity>
              );
            }}
          />
        ) : (
          <FlatList
            data={filteredExercises}
            showsVerticalScrollIndicator={false}
            keyExtractor={({ _id }) => String(_id)}
            contentContainerStyle={{ gap: theme.spacing.sm }}
            renderItem={({ item }) => {
              const { exercise, reps, rest, sets, _id } = item;
              const description = `${sets} Sets | ${reps} Reps | ${rest} Rest`;
              return (
                <TouchableOpacity
                  onPress={() => handleWorkoutItemPress(item)}
                  activeOpacity={constants.activeOpacity}
                >
                  <WorkoutListItem
                    key={String(_id)}
                    title={exercise.name}
                    image={exercise?.url || sampleImage}
                    description={description}
                  />
                </TouchableOpacity>
              );
            }}
          />
        )}

        {!isSessionDisabled && (
          <Box py="md">
            {isCompletedThisWeek ? (
              <Box
                width="100%"
                height={50}
                alignItems="center"
                justifyContent="center"
                backgroundColor="SecondaryGrey"
                borderRadius="sm"
                flexDirection="row"
                gap="sm"
              >
                <Check size={20} color={theme.colors.PrimaryBlack} />
                <Text
                  variant="md"
                  fontWeight="500"
                  letterSpacing={1}
                  color="textPrimaryBlack"
                  textTransform="capitalize"
                >
                  Completed For This Week
                </Text>
              </Box>
            ) : isCompletedToday && !isActiveSession ? (
              <Box
                width="100%"
                height={50}
                alignItems="center"
                justifyContent="center"
                backgroundColor="SecondaryGrey"
                borderRadius="sm"
                flexDirection="row"
                gap="sm"
              >
                <Lock size={20} color={theme.colors.textPrimaryBlack} />
                <Text
                  variant="md"
                  fontWeight="500"
                  letterSpacing={1}
                  color="textPrimaryBlack"
                  textTransform="capitalize"
                >
                  Locked Until Midnight
                </Text>
              </Box>
            ) : !isSessionInProgress ? (
              <TouchableOpacity
                activeOpacity={constants.activeOpacity}
                onPress={handleStartWorkoutClick}
                disabled={isDisabled || startWorkoutMutation.isPending}
                style={{
                  width: "100%",
                  height: 50,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: theme.colors.PrimaryGreen,
                  borderRadius: theme.spacing.sm,
                  opacity:
                    isDisabled || startWorkoutMutation.isPending ? 0.5 : 1,
                }}
              >
                {startWorkoutMutation.isPending ? (
                  <ActivityIndicator color={theme.colors.PrimaryBlack} />
                ) : (
                  <Text
                    variant="md"
                    fontWeight="500"
                    letterSpacing={1}
                    color="textPrimaryBlack"
                    textTransform="capitalize"
                  >
                    Start Workout
                  </Text>
                )}
              </TouchableOpacity>
            ) : isActiveSession ? (
              <Box>
                <TouchableOpacity
                  activeOpacity={constants.activeOpacity}
                  onPress={handleCompleteWorkout}
                  disabled={
                    !canCompleteSession || completeWorkoutMutation.isPending
                  }
                  style={{
                    opacity:
                      !canCompleteSession || completeWorkoutMutation.isPending
                        ? 0.5
                        : 1,
                    width: "100%",
                    height: 50,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: canCompleteSession
                      ? theme.colors.PrimaryGreen
                      : theme.colors.PrimaryGreen,
                    borderRadius: theme.spacing.sm,
                  }}
                >
                  {completeWorkoutMutation.isPending ? (
                    <ActivityIndicator color={theme.colors.PrimaryBlack} />
                  ) : (
                    <Text
                      variant="md"
                      fontWeight="500"
                      letterSpacing={1}
                      color="textPrimaryBlack"
                      textTransform="capitalize"
                    >
                      {canCompleteSession ? "Complete Workout" : "In Progress"}
                    </Text>
                  )}
                </TouchableOpacity>
                {!canCompleteSession && (
                  <Text
                    variant="xs"
                    color="textSecondary"
                    style={{ textAlign: "center", marginTop: theme.spacing.sm }}
                  >
                    {`Record all exercises to complete Day ${
                      activeSession?.exerciseDay ?? ""
                    }`}
                  </Text>
                )}
              </Box>
            ) : (
              <Box
                width="100%"
                height={50}
                alignItems="center"
                justifyContent="center"
                backgroundColor="SecondaryGrey"
                borderRadius="sm"
              >
                <Text variant="mdBold" color="PrimaryBlack">
                  {`LOCKED (Day ${
                    activeSession?.exerciseDay ?? ""
                  } In Progress)`}
                </Text>
              </Box>
            )}
          </Box>
        )}
      </PageWrapper>

      {!isSessionDisabled && (
        <Modal
          visible={startModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setStartModalVisible(false)}
        >
          <Box
            flex={1}
            justifyContent="center"
            alignItems="center"
            px="xl"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <Box
              backgroundColor="backgroundSecondary"
              borderRadius="md"
              p="xl"
              width="100%"
            >
              <Text variant="lgBold" mb="md" textAlign="center">
                Start Workout?
              </Text>
              <Text
                variant="md"
                color="textSecondary"
                mb="xl"
                textAlign="center"
              >
                You are about to start Day {selectedDay}. This day contains{" "}
                {currentTotalExercises} exercises. Other workout days will be
                locked while this session is active.
              </Text>

              <Box flexDirection="row" justifyContent="space-between" gap="md">
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() => setStartModalVisible(false)}
                  disabled={startWorkoutMutation.isPending}
                >
                  <Box
                    backgroundColor="SecondaryGrey"
                    p="md"
                    borderRadius="sm"
                    alignItems="center"
                  >
                    <Text variant="mdBold">Cancel</Text>
                  </Box>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={confirmStartWorkout}
                  disabled={startWorkoutMutation.isPending}
                >
                  <Box
                    backgroundColor="PrimaryGreen"
                    p="md"
                    borderRadius="sm"
                    alignItems="center"
                  >
                    {startWorkoutMutation.isPending ? (
                      <ActivityIndicator
                        size="small"
                        color={theme.colors.PrimaryBlack}
                      />
                    ) : (
                      <Text variant="mdBold" color="PrimaryBlack">
                        Start
                      </Text>
                    )}
                  </Box>
                </TouchableOpacity>
              </Box>
            </Box>
          </Box>
        </Modal>
      )}

      {sheetOpen &&
        (selectedWorkout.WorkoutType === WorkoutType.Default ? (
          <WorkoutInfoSheet
            bottomSheetRef={bottomSheetRef}
            workoutInfo={{
              workoutName: selectedGeneralWorkoutInfo?.exercise?.name,
              description:
                "Curls work the bicep muscles at the front of the upper arm and the muscles of the lower arm—the brachialis and brachioradialis.",
              image: sampleImage,
              additionalInfo: [
                {
                  title: "Sets",
                  value: selectedGeneralWorkoutInfo?.sets?.toString(),
                },
                {
                  title: "Reps",
                  value: selectedGeneralWorkoutInfo?.reps?.toString(),
                },
                {
                  title: "Rest",
                  value: `${selectedGeneralWorkoutInfo?.rest} sec`,
                },
              ],
            }}
          />
        ) : (
          <WorkoutInfoSheet
            bottomSheetRef={bottomSheetRef}
            workoutInfo={{
              workoutName: selectedWorkoutInfo?.exercise?.name,
              description: selectedWorkoutInfo?.exercise?.description,
              image: selectedWorkoutInfo?.exercise?.url || sampleImage,
              additionalInfo: [
                { title: "Sets", value: selectedWorkoutInfo?.sets?.toString() },
                { title: "Reps", value: selectedWorkoutInfo?.reps?.toString() },
                { title: "Rest", value: `${selectedWorkoutInfo?.rest} sec` },
              ],
            }}
          />
        ))}
    </>
  );
};

export default WorkoutListScreen;

const sampleImage =
  "https://upload.wikimedia.org/wikipedia/commons/b/b1/Loading_icon.gif";
