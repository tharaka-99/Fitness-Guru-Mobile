import { store } from "@/store";
import PageWrapper, { SCREEN_HEIGHT } from "@components/app/PageWrapper";
import PageHeader from "@components/app/header/PageHeader";
import Box from "@components/atoms/Box";
import BoxTab from "@components/atoms/BoxTab";
import { Dumbbell, Edit, BarChart3, ArrowLeft } from "lucide-react-native";
import { MyStackNavigatorScreenProps } from "@navigation/types";
import React, { useState } from "react";
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
import { useQuery } from "react-query";
import { View } from "react-native";
import { theme } from "@utils/styles/theme";
import { Icon } from "react-native-paper";
import Text from "@components/atoms/Text";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const AnalyticsScreen: React.FC<
  MyStackNavigatorScreenProps<"AnalyticsScreen">
> = ({ navigation, route }) => {
  const { selectedExercise, selectedWorkoutId, selectedDay } =
    store.getState()["feature/gym"];
  const hideTabs = route.params?.hideTabs ?? false;
  const [selectedBox, setSelectedBox] = useState<string | null>("Box1");
  const [isLoading, setIsLoading] = useState(false);

  const {
    isLoading: isLogHistoryByWorkoutDayExerciseLoading,
    data: logHistoryByWorkoutDayExercise,
    refetch: logHistoryByWorkoutDayExerciseRefetch,
  } = useQuery(
    [
      "getLogHistoryByWorkoutDayExercise",
      selectedExercise?.exercise?._id,
      selectedWorkoutId,
      selectedDay,
    ], // Adjust to your actual parameters
    () =>
      getLogHistoryByWorkoutDayExercise(
        selectedExercise?.exercise?._id,
        selectedWorkoutId,
        selectedDay
      ) // Function reference
  );
  const {
    isLoading: isLastWeekAnalyticsByWorkoutDayExerciseLoading,
    data: lastWeekAnalyticsByWorkoutDayExercise,
    refetch: lastWeekAnalyticsByWorkoutDayExerciseRefetch,
  } = useQuery(
    [
      "getLastWeekAnalyticsByWorkoutDayExercise",
      selectedExercise?.exercise?._id,
      selectedWorkoutId,
      selectedDay,
    ], // Adjust to your actual parameters
    () =>
      getLastWeekAnalyticsByWorkoutDayExercise(
        selectedExercise?.exercise?._id,
        selectedWorkoutId,
        selectedDay
      ) // Function reference
  );

  const handleBoxPress = (box: string) => {
    setSelectedBox(box);
  };

  const submitRecord = async (data: LogSetDto[]) => {
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
      const response = await logWorkout(logSet);

      Toast.show({
        type: "success",
        text1: "Exercise logs updated!",
        text2: "Exercise logs updated successfully.",
      });
      logHistoryByWorkoutDayExerciseRefetch();
      lastWeekAnalyticsByWorkoutDayExerciseRefetch();
      setIsLoading(false);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error ",
        text2: "Error login sets",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isTodayInLogs = (logs: any[]): boolean => {
    const today = new Date().toISOString().split("T")[0]; // Format as YYYY-MM-DD
    return logs.some((log) => log.logDate.split("T")[0] === today);
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
                    <Icon
                      source="arrow-left"
                      size={30}
                      color={theme.colors.PrimaryGreen}
                    />
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

            {hideTabs && (
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
                <LogSetsCard
                  sets={selectedExercise?.sets}
                  reps={selectedExercise?.reps}
                  submitRecord={submitRecord}
                  isLoading={isLoading}
                  alreadyLogged={isTodayInLogs(
                    logHistoryByWorkoutDayExercise
                      ? logHistoryByWorkoutDayExercise
                      : []
                  )}
                />
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
