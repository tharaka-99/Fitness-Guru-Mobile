import React, { useEffect } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";

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
import { useQuery } from "react-query";
import { useSelector } from "react-redux";
import { gymActions } from "../context/slice";
import { ArrowLeft, ArrowRight, X, PlusCircle } from "lucide-react-native";

const GenerateWorkoutScreen: React.FC<
  MyStackNavigatorScreenProps<"GenerateWorkout">
> = ({ navigation }) => {
  const { user } = store.getState()["feature/auth"];
  const { days } = useSelector((state: any) => state["feature/gym"]);
  const exerciseDaysLength = days?.exerciseDays[0]?.exercises?.length || 0;
  const {
    isLoading: isCurrentWorkoutLoading,
    data: currentWorkout,
    refetch: CurrentWorkoutRefetch,
  } = useQuery("currentWorkout", getCurrentWorkout);

  useEffect(() => {
    if (currentWorkout?.length) {
      const selfCreatedWorkoutPlan = currentWorkout.find(
        (workout) => workout.type === "SelfCreated",
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
              gymActions.addExerciseToDay({ day: day.day, exercise }),
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
          justifyContent="space-between"
        >
          <Box flexDirection="row" gap="md" alignItems="center">
            <Text variant="lgBold">DAY {item.day}</Text>
          </Box>
          <X
            size={24}
            color={theme.colors.PrimaryRed}
            onPress={() => removeDay(item.day)}
          />
        </Box>

        <Box mt="lg">
          <Text variant="sm" color="SecondaryGrey">
            {item.exercises.length}{" "}
            {item.exercises.length === 1 ? "exercise" : "exercises"}
          </Text>
        </Box>

        <Box mt="sm">
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("DayExercises", { day: item.day });
            }}
            activeOpacity={0.7}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 16,
              backgroundColor: theme.colors.PrimaryGrey,
            }}
          >
            <Text
              style={{
                fontSize: theme.textVariants.lg.fontSize,
                color: theme.colors.SecondaryGrey,
              }}
            >
              Add New Exercise
            </Text>
          </TouchableOpacity>
        </Box>
      </Box>
    );
  };

  const handleSaveWorkout = async () => {
    if (user?.subscription?.status === true) {
      const transformedDays: Workout = {
        type: WorkoutType.SelfCreated,
        exerciseDays: days.exerciseDays.map((exerciseDay: ExerciseDay) => ({
          day: exerciseDay.day,
          exercises: exerciseDay.exercises
            .filter(
              (exercise: Exercises) =>
                exercise.exercise && exercise.exercise._id,
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
        (workout) => workout.type === "SelfCreated",
      );

      try {
        if (selfCreatedWorkoutPlan && selfCreatedWorkoutPlan._id) {
          const updateData = { ...transformedDays };
          delete updateData.type;
          await updateWorkout(selfCreatedWorkoutPlan._id, updateData);
        } else {
          await createWorkout(transformedDays);
        }
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Workout saved successfully!",
        });
        navigation.navigate("Home");
        store.dispatch(gymActions.resetWorkouts());
      } catch (error) {
        console.error("Error saving workout:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to save workout. Please try again.",
        });
      }
    } else {
      Toast.show({
        type: 'info',
        text1: 'Subscription Required',
        text2: 'Please subscribe to save your workouts.',
      });
      navigation.push("GenerateMealPlan");
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
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
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
                    paddingHorizontal: theme.spacing.sm,
                    paddingVertical: theme.spacing.xs,
                    backgroundColor:
                      exerciseDaysLength <= 0
                        ? theme.colors.PrimaryGrey
                        : "transparent",
                    opacity: exerciseDaysLength <= 0 ? 0.5 : 1,
                    gap: theme.spacing.xs,
                  }}
                >
                  <Text
                    variant="lgBold"
                    style={{
                      color: theme.colors.PrimaryGreen,
                    }}
                  >
                    Next
                  </Text>
                  <ArrowRight size={18} color={theme.colors.PrimaryGreen} />
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
              borderWidth: 2,
              borderColor: theme.colors.PrimaryGreen,
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 14,
              backgroundColor: "transparent",
            }}
          >
            <PlusCircle
              size={20}
              color={theme.colors.PrimaryGreen}
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: theme.colors.PrimaryGreen,
              }}
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
