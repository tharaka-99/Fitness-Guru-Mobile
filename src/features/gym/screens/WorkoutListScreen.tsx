import BottomSheet from "@gorhom/bottom-sheet";
import React, { useRef, useState } from "react";
import { FlatList, TouchableOpacity } from "react-native";

import PageWrapper from "@components/app/PageWrapper";
import PageHeader from "@components/app/header/PageHeader";
import { MyStackNavigatorScreenProps } from "@navigation/types";
import { constants, theme } from "@utils/styles/theme";
import WorkoutInfoSheet from "../components/WorkoutInfoSheet";
import WorkoutListItem from "../components/WorkoutListItem";
import { store } from "@/store";
import { DefaultExercise, Exercises, WorkoutType } from "@utils/types/types";
import { gymActions } from "../context/slice";
import { Icon } from "react-native-paper";
import { ArrowLeft } from "lucide-react-native";

// TODO: handle the user package
const isPremiumUser = true;

const WorkoutListScreen: React.FC<
  MyStackNavigatorScreenProps<"WorkoutList">
> = ({ navigation }) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [selectedWorkoutInfo, setSelectedWorkoutInfo] =
    useState<Exercises | null>(null);

  const [selectedGeneralWorkoutInfo, setSelectedGeneralWorkoutInfo] =
    useState<DefaultExercise | null>(null);

  const openWorkoutInfoSheet = () => {
    bottomSheetRef.current?.snapToIndex(0);
  };

  const {
    selectedDay,
    workouts,
    selectedWorkout,
    selectedGeneralDay,
    defaultWorkouts,
  } = store.getState()["feature/gym"];

  // Find the selected workout
  const selectedWorkoutData = workouts.find(
    (workout) => workout.type === selectedWorkout.WorkoutType
  );

  // Filter exercises based on selected day
  const filteredExercises =
    selectedWorkoutData?.exerciseDays.find(
      (exerciseDay) => exerciseDay.day === selectedDay
    )?.exercises ?? [];
  // Filter general exercises based on selected day
  const filteredGeneralExercises =
    defaultWorkouts[selectedGeneralDay]?.exerciseDays.find(
      (exerciseDay) => exerciseDay.day === selectedDay
    )?.exercises ?? [];
  // Function to handle onPress event of workout item
  const handleWorkoutItemPress = (item: any) => {
    setSelectedWorkoutInfo(item);
    if (isPremiumUser) {
      store.dispatch(gymActions.setSelectedExercise(item));
      store.dispatch(
        gymActions.setSelectedWorkoutID(selectedWorkoutData?._id ?? "")
      );

      navigation.push("AnalyticsScreen", { hideTabs: true });
    } else openWorkoutInfoSheet();
  };
  //
  const handleGeneralWorkoutItemPress = (item: any) => {
    setSelectedGeneralWorkoutInfo(item);
    if (isPremiumUser) {
      store.dispatch(gymActions.setSelectedExercise(item));
      store.dispatch(
        gymActions.setSelectedWorkoutID(
          defaultWorkouts[selectedGeneralDay]._id ?? ""
        )
      );
      navigation.push("AnalyticsScreen");
    } else openWorkoutInfoSheet();
  };

  return (
    <PageWrapper>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <ArrowLeft size={30} color={theme.colors.PrimaryGreen} />
      </TouchableOpacity>
      <PageHeader title={`Day ${selectedDay}`} />

      {selectedWorkout.WorkoutType === WorkoutType.Default ? (
        <FlatList
          data={filteredGeneralExercises}
          showsVerticalScrollIndicator={false}
          keyExtractor={({ _id }) => String(_id)}
          contentContainerStyle={{ gap: theme.spacing.sm }}
          renderItem={({ item }) => {
            const { exercise, order, reps, rest, sets, _id, imageUrl } = item;
            console.log(imageUrl);
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
            const { exercise, order, reps, rest, sets, _id } = item;
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

      {selectedWorkout.WorkoutType === WorkoutType.Default ? (
        <WorkoutInfoSheet
          bottomSheetRef={bottomSheetRef}
          workoutInfo={{
            workoutName: selectedGeneralWorkoutInfo?.exercise?.name,
            description:
              "Curls work the bicep muscles at the front of the upper arm and the muscles of the lower arm—the brachialis and brachioradialis.1 You use these muscles anytime you pick something up, which is common throughout daily life.", //NOTE: get the description from api
            image: sampleImage,
            additionalInfo: [
              {
                title: "Sets",
                value: selectedGeneralWorkoutInfo?.sets?.toString(),
              },
              {
                title: "Reps",
                value: selectedGeneralWorkoutInfo?.reps.toString(),
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
              { title: "Reps", value: selectedWorkoutInfo?.reps.toString() },
              { title: "Rest", value: `${selectedWorkoutInfo?.rest} sec` },
            ],
          }}
        />
      )}
    </PageWrapper>
  );
};

export default WorkoutListScreen;

// const sampleImage = "https://gymvisual.com/img/p/2/0/3/0/7/20307.gif";
const sampleImage =
  "https://upload.wikimedia.org/wikipedia/commons/b/b1/Loading_icon.gif";
