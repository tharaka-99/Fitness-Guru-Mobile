import { store } from "@/store";
import PageWrapper from "@components/app/PageWrapper";
import PageHeader from "@components/app/header/PageHeader";
import Box from "@components/atoms/Box";
import WorkoutListItem from "@features/gym/components/WorkoutListItem";
import { gymActions } from "@features/gym/context/slice";
import { MyStackNavigatorScreenProps } from "@navigation/types";
import { getTrainers } from "@utils/services/trainersService";
import {
  getExercises,
  getClientWorkouts,
} from "@utils/services/workoutService";
import { constants, theme } from "@utils/styles/theme";
import { Exercises, Workout, WorkoutType } from "@utils/types/types";
import React, { useState, useEffect } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import Text from "@components/atoms/Text";
import { useQuery } from "react-query";
import FullScreenLoader from "@components/atoms/FullScreenLoader";
import { ArrowLeft } from "lucide-react-native";

const MyDashboardScreen: React.FC<
  MyStackNavigatorScreenProps<"MyDashboardScreen">
> = ({ navigation }) => {
  const { workouts } = store.getState()["feature/gym"];
  const { profile } = store.getState()["feature/overview"];
  const { user } = store.getState()["feature/auth"];
  const goal = profile?.fitnessInfo?.goal?.replace(/([a-z])([A-Z])/g, "$1 $2");
  const [selectedTrainer, setSelectedTrainer] = useState<string>("All");

  const {
    isLoading: isTrainersLoading,
    data: trainers,
    refetch: trainersRefetch,
  } = useQuery("trainers", getTrainers);

  const {
    isLoading: isWorkoutsLoading,
    data: fetchedWorkouts,
    refetch: workoutsRefetch,
  } = useQuery("dashboardWorkouts", getClientWorkouts);

  useEffect(() => {
    if (fetchedWorkouts) {
      store.dispatch(gymActions.setWorkouts(fetchedWorkouts));
    }
  }, [fetchedWorkouts]);



  const myTrainers =
    trainers?.filter(
      (trainer) => user?._id && trainer.clientIds?.includes(user._id)
    ) || [];

  const trainerCreatedWorkouts = workouts.filter(
    (workout) => workout.type === WorkoutType.TrainerCreated
  );

  const selfCreatedWorkouts = workouts.filter(
    (workout) => workout.type === WorkoutType.SelfCreated
  );

  const exercisesByTrainer = trainerCreatedWorkouts.reduce(
    (acc: { [key: string]: Exercises[] }, workout: Workout) => {
      if (workout.createdBy) {
        if (!acc[workout.createdBy]) {
          acc[workout.createdBy] = [];
        }
        workout.exerciseDays.forEach((day) => {
          day.exercises.forEach((exercise) => {
            if (
              exercise?.exercise?._id &&
              workout.createdBy &&
              !acc[workout.createdBy].some(
                (ex: Exercises) => ex?.exercise?._id === exercise.exercise._id
              )
            ) {
              acc[workout.createdBy].push(exercise);
            }
          });
        });
      }
      return acc;
    },
    {}
  );

  const myWorkoutsExercises: Exercises[] = [];
  selfCreatedWorkouts.forEach((workout) => {
    workout.exerciseDays.forEach((day) => {
      day.exercises.forEach((exercise) => {
        if (
          exercise?.exercise?._id &&
          !myWorkoutsExercises.some(
            (ex) => ex?.exercise?._id === exercise.exercise._id
          )
        ) {
          myWorkoutsExercises.push(exercise);
        }
      });
    });
  });

  const allExercises: Exercises[] = [];

  Object.values(exercisesByTrainer).forEach((exerciseList) => {
    exerciseList.forEach((exercise) => {
      if (
        exercise?.exercise?._id &&
        !allExercises.some((ex) => ex?.exercise?._id === exercise.exercise._id)
      ) {
        allExercises.push(exercise);
      }
    });
  });

  myWorkoutsExercises.forEach((exercise) => {
    if (
      exercise?.exercise?._id &&
      !allExercises.some((ex) => ex?.exercise?._id === exercise.exercise._id)
    ) {
      allExercises.push(exercise);
    }
  });


  if (isWorkoutsLoading) {
    return (
      <PageWrapper>
        <FullScreenLoader
          message="Loading..."
        />
      </PageWrapper>
    );
  }

  // Determine which data to show based on selected trainer
  const displayData =
    selectedTrainer === "All"
      ? allExercises
      : selectedTrainer === "myWorkouts"
        ? myWorkoutsExercises
        : exercisesByTrainer[selectedTrainer] || [];

  return (
    <PageWrapper>
      <FlatList
        data={displayData}
        keyExtractor={(item) => String(item?._id || Math.random())}
        contentContainerStyle={{ paddingBottom: theme.spacing.sm }}
        ListHeaderComponent={() => (
          <>
            <PageHeader
              leftComponent={
                <Box flexDirection="row" alignItems="center" gap="md">
                  <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ArrowLeft size={30} color={theme.colors.PrimaryGreen} />
                  </TouchableOpacity>
                  <Text color="PrimaryGreen" variant="xlBold" numberOfLines={1}>
                    Workout Analytics
                  </Text>
                </Box>
              }
            />

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Box
                flexDirection="row"
                justifyContent="space-between"
                overflow="scroll"
                mb="base"
                gap="xs"
              >
                <TouchableOpacity
                  key="all"
                  onPress={() => {
                    setSelectedTrainer("All");
                  }}
                >
                  <Box
                    style={
                      selectedTrainer === "All" ? styles.activeTag : styles.tag
                    }
                  >
                    <Text color={selectedTrainer === "All" ? "PrimaryBlack" : "PrimaryWhite"}>All</Text>
                  </Box>
                </TouchableOpacity>
                <TouchableOpacity
                  key="myWorkouts"
                  onPress={() => setSelectedTrainer("myWorkouts")}
                >
                  <Box
                    style={
                      selectedTrainer === "myWorkouts"
                        ? styles.activeTag
                        : styles.tag
                    }
                  >
                    <Text color={selectedTrainer === "myWorkouts" ? "PrimaryBlack" : "PrimaryWhite"}>My Workouts</Text>
                  </Box>
                </TouchableOpacity>
                {myTrainers?.map((trainer) => (
                  <TouchableOpacity
                    key={trainer?._id || Math.random()}
                    onPress={() => setSelectedTrainer(trainer?._id ?? "")}
                  >
                    <Box
                      style={
                        trainer?._id === selectedTrainer
                          ? styles.activeTag
                          : styles.tag
                      }
                    >
                      <Text color={trainer?._id === selectedTrainer ? "PrimaryBlack" : "PrimaryWhite"}>{`${trainer?.firstName || ""} ${trainer?.lastName || ""
                        }`}</Text>
                    </Box>
                  </TouchableOpacity>
                ))}
              </Box>
            </ScrollView>
          </>
        )}
        renderItem={({ item, index }) => {
          if (!item?.exercise) {
            return null;
          }

          const { exercise } = item;
          const description = "";

          return (
            <TouchableOpacity
              onPress={() => {
                store.dispatch(gymActions.setSelectedExercise(item));
                navigation.navigate("ExercisesAnalytics");
              }}
              activeOpacity={constants.activeOpacity}
              style={{ marginBottom: 9 }}
            >
              <WorkoutListItem
                key={String(exercise?._id || Math.random())}
                title={exercise?.name || "Unknown Exercise"}
                image={exercise?.url ? exercise.url : sampleImage}
                description={description}
              />
            </TouchableOpacity>
          );
        }}
      />
    </PageWrapper>
  );
};

const styles = StyleSheet.create({
  topBox: {
    borderRadius: theme.borderRadii.sm,
    borderColor: theme.colors.SecondaryGrey,
    borderWidth: 1,
    width: "48%",
    padding: theme.spacing.sm,
  },
  boxTitle: {
    color: theme.colors.textPrimary,
    fontWeight: "600",
  },
  boxValue: {
    color: theme.colors.PrimaryGreen,
    fontWeight: "700",
  },
  tag: {
    paddingRight: theme.spacing.sm,
    paddingLeft: theme.spacing.sm,
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.xs,
    borderRadius: theme.borderRadii.xs,
    borderColor: theme.colors.SecondaryGrey,
    borderWidth: 0.5,
  },
  activeTag: {
    paddingRight: theme.spacing.sm,
    paddingLeft: theme.spacing.sm,
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.xs,
    borderRadius: theme.borderRadii.xs,
    borderColor: theme.colors.PrimaryGreen,

    backgroundColor: theme.colors.PrimaryGreen,
    borderWidth: 0.5,
  },
});

export default MyDashboardScreen;
// const sampleImage = "https://gymvisual.com/img/p/2/0/3/0/7/20307.gif";
const sampleImage =
  "https://upload.wikimedia.org/wikipedia/commons/b/b1/Loading_icon.gif";
