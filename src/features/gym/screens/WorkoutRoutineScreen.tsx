import React from "react";
import { FlatList, TouchableOpacity } from "react-native";
import Box from "@components/atoms/Box";
import { store } from "@/store";
import PageWrapper from "@components/app/PageWrapper";
import PageHeader from "@components/app/header/PageHeader";
import { MyStackNavigatorScreenProps } from "@navigation/types";
import { theme } from "@utils/styles/theme";
import WorkoutDayCard from "../components/WorkoutDayCard";
import { gymActions } from "../context/slice";
import { WorkoutType } from "@utils/types/types";
// import { TouchableOpacity } from 'react-native-gesture-handler';
import { Icon } from "react-native-paper";
import Text from "@components/atoms/Text";
import { ArrowLeft } from "lucide-react-native";

const WorkoutRoutineScreen: React.FC<
  MyStackNavigatorScreenProps<"WorkoutRoutine">
> = ({ navigation }) => {
  const { workouts, selectedWorkout, selectedGeneralDay, defaultWorkouts } =
    store.getState()["feature/gym"];

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
  const exerciseDays = filteredData?.map((item) => item.exerciseDays).flat();

  // get the general workout list according to the selected day
  const generalExerciseDays = defaultWorkouts[selectedGeneralDay]?.exerciseDays;

  // Function to handle onPress event of WorkoutDayCard
  const handleWorkoutDayPress = (day: number) => {
    // Dispatch an action to set the selected day in Redux store
    store.dispatch(gymActions.setSelectedDay(day));

    // Navigate to WorkoutList screen
    navigation.push("WorkoutList");
  };

  return (
    <PageWrapper>
      <PageHeader
        // title="Workout Routine"
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
          selectedWorkout.WorkoutType === WorkoutType.SelfCreated && (
            <TouchableOpacity
              onPress={() => navigation.navigate("GenerateWorkout")}
            >
              <Icon
                size={30}
                source={"plus"}
                color={theme.colors.PrimaryGreen}
              />
            </TouchableOpacity>
          )
        }
      />
      {selectedWorkout.WorkoutType === WorkoutType.Default ? (
        <FlatList
          data={generalExerciseDays}
          keyExtractor={({ day }) => String(day)}
          contentContainerStyle={{ gap: theme.spacing.sm }}
          renderItem={({ item }) => {
            const { day, exercises } = item;

            const exerciseNames =
              exercises
                ?.map((exercise) => exercise?.exercise?.name)
                .filter(Boolean) // Remove null/undefined values
                .join(", ") || "No exercises available";
            return (
              <WorkoutDayCard
                title={`Day ${day?.toString()}`}
                description={exerciseNames}
                onPress={() => handleWorkoutDayPress(day)}
              />
            );
          }}
        />
      ) : (
        <FlatList
          //NOTE: need to clarify which workout plan get if they have multiple workouts
          data={exerciseDays?.filter((item) => {
            const { exercises } = item;
            return (
              exercises?.some((exercise) => exercise?.exercise?.name) || false
            );
          })}
          keyExtractor={({ day }) => String(day)}
          contentContainerStyle={{ gap: theme.spacing.sm }}
          renderItem={({ item }) => {
            const { day, exercises } = item;
            const exerciseNames =
              exercises
                ?.map((exercise) => exercise?.exercise?.name)
                .filter(Boolean) // Remove null/undefined values
                .join(", ") || "No exercises available";
            return (
              <WorkoutDayCard
                title={`Day ${day?.toString()}`}
                description={exerciseNames}
                onPress={() => handleWorkoutDayPress(day)}
              />
            );
          }}
        />
      )}
    </PageWrapper>
  );
};

export default WorkoutRoutineScreen;
