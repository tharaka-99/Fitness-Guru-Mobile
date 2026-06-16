import React, { useEffect } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { store } from "@/store";
import PageWrapper from "@components/app/PageWrapper";
import PageHeader from "@components/app/header/PageHeader";
import Box from "@components/atoms/Box";
import Text from "@components/atoms/Text";
import { MyStackNavigatorScreenProps } from "@navigation/types";
import {
  createWorkout,
  getCurrentWorkout,
  updateWorkout,
} from "@utils/services/workoutService";
import { theme } from "@utils/styles/theme";
import {
  ExerciseDay,
  Exercises,
  Workout,
  WorkoutType,
} from "@utils/types/types";
import Toast from "react-native-toast-message";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { gymActions } from "../context/slice";
import { ArrowLeft, ArrowRight, X, PlusCircle } from "lucide-react-native";
import { PAGE_WIDTH } from "@components/app/PageWrapper";
import { constants } from "@utils/styles/theme";

const GenerateWorkoutScreen: React.FC<
  MyStackNavigatorScreenProps<"GenerateWorkout">
> = ({ navigation }) => {
  const { user } = store.getState()["feature/auth"];
  const { days } = useSelector((state: any) => state["feature/gym"]);
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const exerciseDaysLength = days?.exerciseDays[0]?.exercises?.length || 0;
  const {
    isLoading: isCurrentWorkoutLoading,
    data: currentWorkout,
    refetch: CurrentWorkoutRefetch,
  } = useQuery(
    {
      queryKey: ["currentWorkout"],
      queryFn: getCurrentWorkout
    }
  );

  useEffect(() => {
    if (currentWorkout?.length) {
      const selfCreatedWorkoutPlan = currentWorkout.find(
        (workout) => workout.type === "SelfCreated"
      );

      selfCreatedWorkoutPlan?.exerciseDays?.forEach((day: ExerciseDay) => {
        day.exercises.forEach((exerciseData) => {
          if (
            exerciseData &&
            exerciseData.exercise &&
            exerciseData.exercise._id
          ) {
            const exercise: Exercises = {
              _id: exerciseData._id,
              order: exerciseData.order,
              exercise: {
                _id: exerciseData.exercise._id,
                name: exerciseData.exercise.name,
                url: exerciseData.exercise.url,
                description: exerciseData.exercise.description,
              },
              sets: exerciseData.sets,
              reps: exerciseData.reps,
              rest: exerciseData.rest,
              description: exerciseData.description,
              url: exerciseData.exercise.url,
            };

            store.dispatch(
              gymActions.addExerciseToDay({ day: day.day, exercise })
            );
          }
        });
      });
    } else {
      store.dispatch(gymActions.resetWorkouts());
    }
  }, [currentWorkout]);

  const addNewDay = () => {
    store.dispatch(gymActions.addDay());
  };

  const removeDay = (day: number) => {
    store.dispatch(gymActions.removeDay(day));
  };

  const renderWorkoutList = ({
    item,
    index,
  }: {
    item: ExerciseDay;
    index: number;
  }) => {
    return (
      <Box key={index} mt="base">
        <Box
          gap="md"
          flexDirection="row"
          alignItems="center"
          justifyContent="flex-end"
          mb="sm"
        >
          <X
            size={24}
            color={theme.colors.PrimaryRed}
            onPress={() => removeDay(item.day)}
          />
        </Box>

        <TouchableOpacity
          activeOpacity={constants.activeOpacity}
          onPress={() => {
            navigation.navigate("DayExercises", { day: item.day });
          }}
        >
          <Box
            mb="xs"
            height={80}
            borderRadius="sm"
            overflow="hidden"
            width={PAGE_WIDTH}
            flexDirection="row"
            backgroundColor="backgroundSecondary"
          >
            <Box
              px="lg"
              flex={1}
              alignItems="flex-start"
              justifyContent="center"
            >
              <Text variant="mdBold" numberOfLines={1}>
                DAY {item.day}
              </Text>
              <Text
                color="textSecondary"
                numberOfLines={1}
                style={{ textTransform: "capitalize" }}
              >
                {`${item.exercises.length} ${item.exercises.length === 1 ? "exercise" : "exercises"
                  } added`}
              </Text>
            </Box>

            <Box
              width="16%"
              height="100%"
              alignItems="center"
              justifyContent="center"
              backgroundColor="PrimaryGreen"
            >
              <ArrowRight size={23} color={theme.colors.PrimaryBlack} />
            </Box>
          </Box>
        </TouchableOpacity>
      </Box>
    );
  };

  const handleSaveWorkout = async () => {
    const transformedDays: Workout = {
      type: WorkoutType.SelfCreated,
      exerciseDays: days.exerciseDays.map((exerciseDay: ExerciseDay) => ({
        day: exerciseDay.day,
        exercises: exerciseDay.exercises
          .filter(
            (exercise: Exercises) => exercise.exercise && exercise.exercise._id
          )
          .map((exercise: Exercises) => ({
            order: exercise.order,
            exercise: exercise.exercise._id,
            sets: exercise.sets,
            reps: exercise.reps,
            rest: exercise.rest,
          })),
      })),
    };
    const selfCreatedWorkoutPlan = currentWorkout?.find(
      (workout) => workout.type === "SelfCreated"
    );

    try {
      if (selfCreatedWorkoutPlan && selfCreatedWorkoutPlan._id) {
        const updateData = { ...transformedDays };
        delete updateData.type;
        await updateWorkout(selfCreatedWorkoutPlan._id, updateData);
      } else {
        await createWorkout(transformedDays);
      }
      store.dispatch(gymActions.resetWorkouts());
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Workout saved successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["UserWorkouts"] });
      queryClient.invalidateQueries({ queryKey: ["currentWorkout"] });
      navigation.navigate("Home");
    } catch (error) {
      console.error("Error saving workout:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to save workout. Please try again.",
      });
    }
  };

  return (
    <PageWrapper>
      <PageHeader
        leftComponent={
          <Box flexDirection="row" alignItems="center" gap="md">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ArrowLeft size={30} color={theme.colors.PrimaryGreen} />
            </TouchableOpacity>
            <Text color="PrimaryGreen" variant="xlBold" numberOfLines={1}>
              Generate Workouts
            </Text>
          </Box>
        }
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 60 + insets.bottom }}
          keyboardShouldPersistTaps="handled"
          overScrollMode="never"
        >
          <FlatList
            data={days.exerciseDays}
            renderItem={renderWorkoutList}
            keyExtractor={(item, index) => index.toString()}
            horizontal={false}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={() => (
              <Box flexDirection="row" justifyContent="flex-end" mb="md">
                <TouchableOpacity
                  onPress={handleSaveWorkout}
                  disabled={exerciseDaysLength <= 0 ? true : false}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 2,
                    borderColor: theme.colors.PrimaryGreen,
                    borderRadius: theme.borderRadii.xs,
                    paddingHorizontal: theme.spacing.md,
                    paddingVertical: theme.spacing.sm,
                    backgroundColor:
                      exerciseDaysLength <= 0
                        ? theme.colors.PrimaryGrey
                        : theme.colors.PrimaryGreen,
                    opacity: exerciseDaysLength <= 0 ? 0.5 : 1,
                    gap: theme.spacing.xs,
                  }}
                >
                  <Text
                    variant="md"
                    fontWeight="500"
                    letterSpacing={1}
                    style={{
                      color:
                        exerciseDaysLength <= 0
                          ? theme.colors.PrimaryGreen
                          : theme.colors.PrimaryBlack,
                    }}
                    textTransform="capitalize"
                  >
                    Save
                  </Text>
                </TouchableOpacity>
              </Box>
            )}
            contentContainerStyle={{ paddingBottom: theme.spacing.lg }}
          />
        </ScrollView>
        {/* Fixed Bottom Buttons */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: theme.colors.backgroundPrimary,
            paddingHorizontal: theme.spacing.sm,
            paddingVertical: theme.spacing.sm,
            paddingBottom: theme.spacing.base,
            borderTopWidth: 1,
            borderTopColor: theme.colors.PrimaryGrey,
            flexDirection: "row",
            gap: theme.spacing.sm,
          }}
        >
          <TouchableOpacity
            onPress={addNewDay}
            activeOpacity={0.7}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.base,
              backgroundColor: theme.colors.PrimaryGreen,
            }}
          >
            <PlusCircle
              size={20}
              color={theme.colors.PrimaryBlack}
              style={{ marginRight: 8 }}
            />
            <Text
              variant="md"
              fontWeight="500"
              letterSpacing={1}
              color="textPrimaryBlack"
              textTransform="capitalize"
            >
              Add New Day
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </PageWrapper>
  );
};

export default GenerateWorkoutScreen;

// const sampleImage = "https://gymvisual.com/img/p/2/0/3/0/7/20307.gif";
const sampleImage =
  "https://upload.wikimedia.org/wikipedia/commons/b/b1/Loading_icon.gif";
