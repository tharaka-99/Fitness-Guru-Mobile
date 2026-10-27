import { store } from "@/store";
import PageWrapper, { SCREEN_HEIGHT } from "@components/app/PageWrapper";
import PageHeader from "@components/app/header/PageHeader";
import Box from "@components/atoms/Box";
import BoxTab from "@components/atoms/BoxTab";
import { Dumbbell, Edit, BarChart3, ArrowLeft } from "lucide-react-native";
import { MyStackNavigatorScreenProps } from "@navigation/types";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import LogSetsCard from "../components/LogSetsCard";
import WorkoutInfoCard from "../components/WorkoutInfoCard";
import {
  getLastWeekAnalyticsByWorkoutDayExercise,
  getLogHistoryByWorkoutDayExercise,
  logWorkout,
} from "@utils/services/analyticsService";
import {
  CreateLogSetDto,
  LastWeekAnalytics,
  LogSetDto,
} from "@utils/types/analyticsTypes";
import Toast from "react-native-toast-message";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { View } from "react-native";
import { theme } from "@utils/styles/theme";
import { Icon } from "react-native-paper";
import Text from "@components/atoms/Text";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";
import { gymActions } from "@features/gym/context/slice";
import { WorkoutType } from "@utils/types/types";
import {
  useActiveWorkoutSession,
  useWorkoutWeekCalendar,
  isTodayWorkoutCompleted,
  isWorkoutDayCompleted,
} from "../hooks/useWorkoutSession";
import { getLocalDateString } from "@utils/services/workoutSessionService";

const AnalyticsScreen: React.FC<
  MyStackNavigatorScreenProps<"AnalyticsScreen">
> = ({ navigation, route }) => {
  const {
    selectedExercise,
    selectedWorkoutId,
    selectedDay,
    selectedWorkout,
  } = useSelector((state: any) => state["feature/gym"]);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const hideTabs = route.params?.hideTabs ?? false;
  const [selectedBox, setSelectedBox] = useState<string | null>("Box1");
  const [isLoading, setIsLoading] = useState(false);

  const { data: activeSession } = useActiveWorkoutSession();
  const { data: weekCalendar } = useWorkoutWeekCalendar();

  const isDefault = selectedWorkout?.WorkoutType === WorkoutType.Default;
  const isSelfCreated = selectedWorkout?.WorkoutType === WorkoutType.SelfCreated;
  const isSessionDisabled = isDefault || isSelfCreated;

  const isCurrentDayCompleted = !isSessionDisabled && isWorkoutDayCompleted(
    selectedDay,
    weekCalendar,
    selectedWorkoutId
  );
  const isCompletedToday = !isSessionDisabled && isTodayWorkoutCompleted(weekCalendar);
  const isSessionInProgress = Boolean(
    !isSessionDisabled &&
    activeSession &&
    (activeSession.workoutId || activeSession.exerciseDay != null || activeSession._id) &&
    activeSession.status &&
    activeSession.status !== "completed"
  );
  const isActiveSessionForThisDay = Boolean(
    !isSessionDisabled &&
    isSessionInProgress &&
    activeSession?.exerciseDay === selectedDay
  );
  const isAnotherSessionActive = Boolean(
    !isSessionDisabled &&
    isSessionInProgress &&
    activeSession?.exerciseDay !== selectedDay
  );

  const isWorkoutStarted = isSessionDisabled || isActiveSessionForThisDay;
  const isWorkoutCompleted = !isSessionDisabled && (
    isCurrentDayCompleted ||
    (isCompletedToday && !isActiveSessionForThisDay) ||
    isAnotherSessionActive
  );

  const isLogSetsDisabled = !isSessionDisabled && (!isWorkoutStarted || isWorkoutCompleted);

  useEffect(() => {
    if (isSessionDisabled && selectedBox !== "Box1") {
      setSelectedBox("Box1");
    } else if (isLogSetsDisabled && selectedBox === "Box2") {
      setSelectedBox("Box1");
    }
  }, [isSessionDisabled, isLogSetsDisabled, selectedBox]);

  const {
    isLoading: isLogHistoryByWorkoutDayExerciseLoading,
    data: logHistoryByWorkoutDayExercise,
    refetch: logHistoryByWorkoutDayExerciseRefetch,
  } = useQuery(
    {
      queryKey: [
        "getLogHistoryByWorkoutDayExercise",
        selectedExercise?.exercise?._id,
        selectedWorkoutId,
        selectedDay,
      ],
      queryFn: () =>
        getLogHistoryByWorkoutDayExercise(
          selectedExercise?.exercise?._id,
          selectedWorkoutId,
          selectedDay
        ),
      enabled: !isSessionDisabled && Boolean(selectedExercise?.exercise?._id && selectedWorkoutId),
    }
  );
  const {
    isLoading: isLastWeekAnalyticsByWorkoutDayExerciseLoading,
    data: lastWeekAnalyticsByWorkoutDayExercise,
    refetch: lastWeekAnalyticsByWorkoutDayExerciseRefetch,
  } = useQuery(
    {
      queryKey: [
        "getLastWeekAnalyticsByWorkoutDayExercise",
        selectedExercise?.exercise?._id,
        selectedWorkoutId,
        selectedDay,
      ],
      queryFn: () =>
        getLastWeekAnalyticsByWorkoutDayExercise(
          selectedExercise?.exercise?._id,
          selectedWorkoutId,
          selectedDay
        ),
      enabled: !isSessionDisabled && Boolean(selectedExercise?.exercise?._id && selectedWorkoutId),
    }
  );

  const handleBoxPress = (box: string) => {
    if (box === "Box2" && isLogSetsDisabled) return;
    setSelectedBox(box);
  };

  const submitRecord = async (data: LogSetDto[]) => {
    if (isLogSetsDisabled) {
      Toast.show({
        type: "error",
        text1: "Cannot Log Sets",
        text2: !isWorkoutStarted
          ? "Please start the workout before logging sets."
          : "This workout session is completed or locked.",
      });
      return;
    }

    setIsLoading(true);

    const transformedData = data.map((set) => ({
      setNo: set.setNo,
      totalReps: Number(set.totalReps),
      totalWeight: Number(set.totalWeight),
      unit: set.unit,
    }));

    const logSet = {
      workoutId: selectedWorkoutId,
      exerciseId: selectedExercise?.exercise?._id,
      exerciseDay: selectedDay,
      logSets: transformedData,
    } as CreateLogSetDto;

    try {
      await logWorkout(logSet);

      Toast.show({
        type: "success",
        text1: "Exercise logs updated!",
        text2: "Exercise logs updated successfully.",
      });


      queryClient.invalidateQueries({ queryKey: ["activeWorkoutSession"] });
      queryClient.invalidateQueries({ queryKey: ["workoutWeekCalendar"] });
      queryClient.invalidateQueries({ queryKey: ["weeklyOverview"] });

      logHistoryByWorkoutDayExerciseRefetch();
      lastWeekAnalyticsByWorkoutDayExerciseRefetch();
      setIsLoading(false);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "Error logging sets",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Option B (Start-Day Logic):
  // 1. Check if the exercise was already logged in the current active session
  const isExerciseLoggedinActiveSession = Boolean(
    isActiveSessionForThisDay &&
    activeSession?.loggedExercises?.some((item: any) => {
      const id = typeof item === "string" ? item : item?.exerciseId || item?._id;
      return id === selectedExercise?.exercise?._id;
    })
  );

  // 2. Check if logged on today's date OR on the session start date
  const isExerciseLogged = (logs: any[]): boolean => {
    if (isExerciseLoggedinActiveSession) return true;
    if (!logs || !Array.isArray(logs)) return false;

    const today = getLocalDateString();
    const startTs =
      activeSession?.createdAt ||
      (activeSession as any)?.startedAt ||
      (activeSession as any)?.startDate;
    const sessionStartDate = startTs ? getLocalDateString(new Date(startTs)) : today;

    return logs.some((log) => {
      const logDate = typeof log?.logDate === "string" ? log.logDate.split("T")[0] : "";
      return (sessionStartDate && logDate === sessionStartDate) || logDate === today;
    });
  };


  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      keyboardShouldPersistTaps="handled"
      bounces={false}
      showsVerticalScrollIndicator={false}
      enableOnAndroid={true}
      extraScrollHeight={20}
    //  behavior={Platform.OS === "ios" ? "padding" : "height"}
    //         style={{flex:1, marginBottom:64}}
    //         // contentContainerStyle={{padding:16, gap:16}}
    //         bottemoffset
    //         keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View>
          <PageWrapper>
            <PageHeader
              leftComponent={
                <Box flexDirection="row" alignItems="center" gap="md">
                  <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ArrowLeft size={30} color={theme.colors.PrimaryGreen} />
                  </TouchableOpacity>
                  <Text
                    style={{ textTransform: "capitalize", width: "80%" }}
                    color="PrimaryGreen"
                    variant="lgBold"
                    numberOfLines={1}
                  >
                    {selectedExercise?.exercise?.name}
                  </Text>
                </Box>
              }
            />

            {hideTabs && !isSessionDisabled && (
              <Box
                flexDirection="row"
                justifyContent="space-around"
                marginVertical="base"
              // flex={1}
              >
                <BoxTab
                  title="Exercise"
                  onPress={() => handleBoxPress("Box1")}
                  style={styles.leftBox}
                  selected={selectedBox === "Box1"}
                  icon={{
                    icon: ({ color, size }) => (
                      <Dumbbell color={color} size={size + 1} />
                    ),
                  }}
                />
                <BoxTab
                  title="Log Sets"
                  onPress={() => handleBoxPress("Box2")}
                  style={styles.middleBox}
                  selected={selectedBox === "Box2"}
                  disabled={isLogSetsDisabled}
                  icon={{
                    icon: ({ color, size }) => (
                      <Edit color={color} size={size + 1} />
                    ),
                  }}
                />
                <BoxTab
                  title="Analytics"
                  onPress={() => handleBoxPress("Box3")}
                  style={styles.rightBox}
                  selected={selectedBox === "Box3"}
                  icon={{
                    icon: ({ color, size }) => (
                      <BarChart3 color={color} size={size + 1} />
                    ),
                  }}
                />
              </Box>
            )}

            <Box mt="base">
              {selectedBox === "Box1" && (
                <WorkoutInfoCard
                  workoutInfo={{
                    workoutName: selectedExercise?.exercise?.name,
                    description: selectedExercise?.exercise?.description,
                    image: selectedExercise?.exercise?.url || sampleImage,
                    additionalInfo: [
                      {
                        title: "Sets",
                        value: selectedExercise?.sets?.toString(),
                      },
                      {
                        title: "Reps",
                        value: selectedExercise?.reps.toString(),
                      },
                      {
                        title: "Rest",
                        value: `${selectedExercise?.rest} sec`,
                      },
                    ],
                  }}
                />
              )}
              {selectedBox === "Box2" && (
                isLogSetsDisabled ? (
                  <Box p="lg" alignItems="center" justifyContent="center" mt="xl">
                    <Text
                      variant="md"
                      color="textSecondary"
                      style={{ textAlign: "center" }}
                    >
                      {!isWorkoutStarted
                        ? "Workout has not been started yet. Please start the workout session to log your sets."
                        : "This workout session is already completed or locked for today."}
                    </Text>
                  </Box>
                ) : (
                  <LogSetsCard
                    sets={selectedExercise?.sets}
                    reps={selectedExercise?.reps}
                    submitRecord={submitRecord}
                    isLoading={isLoading}
                    alreadyLogged={isExerciseLogged(
                      logHistoryByWorkoutDayExercise
                        ? logHistoryByWorkoutDayExercise
                        : []
                    )}
                  />
                )
              )}

              {selectedBox === "Box3" && (
                <AnalyticsDashboard
                  logHistoryByWorkoutDayExercise={
                    logHistoryByWorkoutDayExercise
                      ? logHistoryByWorkoutDayExercise
                      : []
                  }
                  lastWeekAnalytics={
                    lastWeekAnalyticsByWorkoutDayExercise ||
                    ({} as LastWeekAnalytics)
                  }
                />
              )}

              {logHistoryByWorkoutDayExercise &&
                logHistoryByWorkoutDayExercise?.length <= 0 &&
                selectedBox === "Box3" && (
                  <View>
                    <Text
                      style={{
                        color: theme.colors.PrimaryWhite,
                        marginTop: theme.spacing["2xl"],
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {" "}
                      No logged data available
                    </Text>
                  </View>
                )}
            </Box>
          </PageWrapper>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  leftBox: {
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  middleBox: {
    // No border radius for middle box
  },
  rightBox: {
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
});

export default AnalyticsScreen;
// const sampleImage = "https://gymvisual.com/img/p/2/0/3/0/7/20307.gif";
const sampleImage =
  "https://upload.wikimedia.org/wikipedia/commons/b/b1/Loading_icon.gif";
