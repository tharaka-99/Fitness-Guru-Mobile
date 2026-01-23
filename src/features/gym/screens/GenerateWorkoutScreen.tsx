import {
  Trash2,
  X,
  XCircle,
  ArrowRight,
  PlusCircle,
} from "lucide-react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";

import { store } from "@/store";
import PageWrapper from "@components/app/PageWrapper";
import PageHeader from "@components/app/header/PageHeader";
import Box from "@components/atoms/Box";
import TextInput from "@components/atoms/Input";
import Text from "@components/atoms/Text";
import Button from "@components/atoms/Button";
import { MyStackNavigatorScreenProps } from "@navigation/types";
import {
  createWorkout,
  getCurrentWorkout,
  getExercises,
  updateWorkout,
} from "@utils/services/workoutService";
import { theme } from "@utils/styles/theme";
import {
  ExerciseDay,
  Exercises,
  SearchExercises,
  Workout,
  WorkoutType,
} from "@utils/types/types";
import DraggableFlatList, {
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { Swipeable } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { useQuery } from "react-query";
import { useSelector } from "react-redux";
import AddWorkoutSheet from "../components/AddWorkoutSheet";
import WorkoutListItem from "../components/WorkoutListItem";
import WorkoutSuggestionCard from "../components/WorkoutSuggestionCard";
import { gymActions } from "../context/slice";

const GenerateWorkoutScreen: React.FC<
  MyStackNavigatorScreenProps<"GenerateWorkout">
> = ({ navigation }) => {
  const { user } = store.getState()["feature/auth"];
  const { days } = useSelector((state: any) => state["feature/gym"]);
  const sheetRef = useRef<BottomSheet>(null);
  const swipeableRef = useRef<Swipeable>(null);
  const [searchTerms, setSearchTerms] = useState<{ [key: number]: string }>({});
  const [selectedExercise, setSelectedExercise] = useState<
    SearchExercises | undefined
  >();
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const openExerciseModal = () => setShowExerciseModal(true);
  const closeExerciseModal = () => setShowExerciseModal(false);
  const exerciseDaysLength = days?.exerciseDays[0]?.exercises?.length || 0;
  const {
    isLoading: isExercisesLoading,
    data: exercises,
    refetch: exercisesRefetch,
  } = useQuery("exercises", getExercises);
  const {
    isLoading: isCurrentWorkoutLoading,
    data: currentWorkout,
    refetch: CurrentWorkoutRefetch,
  } = useQuery("currentWorkout", getCurrentWorkout);

  useEffect(() => {
    if (currentWorkout?.length) {
      const selfCreatedWorkoutPlan = currentWorkout.find(
        (workout) => workout.type === "SelfCreated"
      );

      selfCreatedWorkoutPlan?.exerciseDays?.forEach((day: ExerciseDay) => {
        day.exercises.forEach((exerciseData) => {
          // Check if exerciseData and exerciseData.exercise exist before processing
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

  const handleAddExercise = (day: number, exercise: Exercises) => {
    // Ensure exercise has valid exercise data before adding
    if (exercise && exercise.exercise && exercise.exercise._id) {
      store.dispatch(gymActions.addExerciseToDay({ day, exercise }));
    }
  };

  const handleRemoveExercise = (day: number, exerciseIndex: number) => {
    store.dispatch(gymActions.removeExerciseFromDay({ day, exerciseIndex }));
    swipeableRef.current?.close();
  };

  const handleSearchTermChange = (index: number, text: string) => {
    setSearchTerms((prevTerms) => ({ ...prevTerms, [index]: text }));
  };

  const renderExerciseRightActions = (
    dragX: any,
    day: number,
    exerciseIndex: number
  ) => {
    return (
      <TouchableOpacity
        onPress={() => handleRemoveExercise(day, exerciseIndex)}
        style={{
          backgroundColor: theme.colors.PrimaryRed,
          justifyContent: "center",
          alignItems: "center",
          width: 50,
          marginBottom: theme.spacing.xs,
        }}
      >
        <Trash2 size={theme.spacing.lg} color="white" />
      </TouchableOpacity>
    );
  };

  const renderExerciseItem = ({ item, index, drag, isActive }: any) => (
    <ScaleDecorator>
      <Swipeable
        ref={swipeableRef}
        renderRightActions={(progress, dragX) =>
          renderExerciseRightActions(dragX, item.dayIndex, item.exerciseIndex)
        }
      >
        <TouchableOpacity onLongPress={drag}>
          <Box
            key={item.exerciseIndex}
            bg={isActive ? "LightBlue" : "SecondaryGreen"}
            px="base"
            py="base"
            justifyContent="space-between"
            flexDirection="column"
            flex={1}
            mb="xs"
          >
            <WorkoutListItem
              theme="green"
              image={item.exercise.url ? item.exercise.url : ""}
              title={item.exercise.name}
              description={`${item.sets} Sets | ${item.reps} Reps | ${item.rest} Rest`}
            />
          </Box>
        </TouchableOpacity>
      </Swipeable>
    </ScaleDecorator>
  );

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
          <TouchableOpacity onPress={() => removeDay(item.day)}>
            <X size={24} color={theme.colors.PrimaryRed} />
          </TouchableOpacity>
        </Box>

        <Box style={{ gap: 2 }} mt="lg">
          <DraggableFlatList
            scrollEnabled={false}
            keyboardShouldPersistTaps="handled"
            data={item.exercises.map((exercise, exerciseIndex) => ({
              ...exercise,
              dayIndex: item.day,
              exerciseIndex: exerciseIndex,
            }))}
            renderItem={renderExerciseItem}
            keyExtractor={(item, index) => index.toString()}
            onDragEnd={({ data }) => {
              store.dispatch(
                gymActions.updateExercisesOrder({
                  day: item.day,
                  exercises: data,
                })
              );
            }}
          />
        </Box>

        <Box mt="sm">
          <TouchableOpacity
            onPress={() => {
              setSelectedDay(item.day);
              openExerciseModal();
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

        <Modal
          visible={showExerciseModal && selectedDay === item.day}
          animationType="slide"
          transparent={true}
          onRequestClose={closeExerciseModal}
        >
          <Box
            flex={1}
            backgroundColor={"ModalOverlay"}
            justifyContent="center"
            alignItems="center"
          >
            <Box
              width="90%"
              height="60%"
              backgroundColor={"PrimaryBlack"}
              borderRadius={"sm"}
              p="sm"
              borderWidth={2}
              borderColor="PrimaryGrey"
            >
              <TouchableOpacity
                onPress={closeExerciseModal}
                style={{ alignSelf: "flex-end" }}
              >
                <XCircle size={24} color={theme.colors.PrimaryRed} />
              </TouchableOpacity>
              <Box mt="base">
                <TextInput
                  value={searchTerms[item.day] || ""}
                  placeholder="Type to Search Exercise"
                  onChangeText={(text) => {
                    handleSearchTermChange(item.day, text);
                  }}
                />
              </Box>
              {searchTerms[item.day] ? (
                <Box flex={1} pt={"sm"}>
                  <WorkoutSuggestionCard
                    onPress={() => {
                      sheetRef.current?.expand();
                      closeExerciseModal();
                    }}
                    exercises={(() => {
                      const filtered =
                        exercises?.filter(
                          (exercise) =>
                            exercise &&
                            exercise.name &&
                            exercise.name
                              .toLowerCase()
                              .includes(
                                searchTerms[item.day]?.toLowerCase() || ""
                              )
                        ) || [];

                      return filtered;
                    })()}
                    setSelectedExercise={(exercise) => {
                      if (exercise && exercise._id) {
                        setSelectedExercise(exercise);
                      }
                    }}
                  />
                </Box>
              ) : (
                <Text style={{ fontSize: 10, color: "orange", marginTop: 10 }}>
                  No Search term for day {item.day}
                </Text>
              )}
            </Box>
          </Box>
        </Modal>
      </Box>
    );
  };

  const handleAddWorkout = (exercise: Exercises) => {
    // Ensure exercise has valid data before adding
    if (exercise && exercise.exercise && exercise.exercise._id) {
      handleAddExercise(selectedDay, exercise);
      setSearchTerms("");
      setSelectedExercise(undefined);
      sheetRef.current?.close();
    }
  };
  //
  const handleSaveWorkout = async () => {
    if (user?.subscription?.status === true) {
      const transformedDays: Workout = {
        type: WorkoutType.SelfCreated,
        exerciseDays: days.exerciseDays.map((exerciseDay: ExerciseDay) => ({
          day: exerciseDay.day,
          exercises: exerciseDay.exercises
            .filter(
              (exercise: Exercises) =>
                exercise.exercise && exercise.exercise._id
            ) // Filter out exercises with null/undefined exercise
            .map((exercise: Exercises) => ({
              order: exercise.order,
              exercise: exercise.exercise._id,
              sets: exercise.sets,
              reps: exercise.reps,
              rest: exercise.rest,
            })),
        })),
      };

      // Find existing self-created workout plan if it exists
      const selfCreatedWorkoutPlan = currentWorkout?.find(
        (workout) => workout.type === "SelfCreated"
      );

      try {
        // Check if the workout already exists and update it; otherwise, create a new one
        if (selfCreatedWorkoutPlan && selfCreatedWorkoutPlan._id) {
          // Remove `type` for updates
          const updateData = { ...transformedDays };
          delete updateData.type;
          await updateWorkout(selfCreatedWorkoutPlan._id, updateData);
        } else {
          await createWorkout(transformedDays);
        }

        // Show success message and navigate back to Home
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Workout saved successfully!",
        });
        navigation.navigate("Home");

        // Reset workout state after saving
        store.dispatch(gymActions.resetWorkouts());
      } catch (error) {
        // Handle error during workout save
        console.error("Error saving workout:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to save workout. Please try again.",
        });
      }
    } else {
      // If subscription is inactive, prompt user to subscribe or renew
      // Toast.show({
      //   type: 'info',
      //   text1: 'Subscription Required',
      //   text2: 'Please subscribe to save your workouts.',
      // });
      navigation.push("GenerateMealPlan"); // Or navigate to subscription/plan page
    }
  };

  return (
    <PageWrapper>
      <PageHeader
        title="Generate Workouts"
        rightComponent={
          <TouchableOpacity
            onPress={handleSaveWorkout}
            disabled={exerciseDaysLength <= 0}
            style={{ opacity: exerciseDaysLength <= 0 ? 0.5 : 1 }}
          >
            <ArrowRight size={30} color={theme.colors.PrimaryGreen} />
          </TouchableOpacity>
        }
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
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
            ListHeaderComponent={
              <Box gap="md" mb="md">
                <Box
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="flex-end"
                >
                  <TouchableOpacity
                    onPress={addNewDay}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 2,
                      borderColor: theme.colors.PrimaryGreen,
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      paddingVertical: 10,
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
                </Box>
              </Box>
            }
            contentContainerStyle={{ paddingBottom: theme.spacing.lg }}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <AddWorkoutSheet
        image={selectedExercise?.url ? selectedExercise?.url : sampleImage}
        workoutName={selectedExercise || { _id: "", name: "" }}
        bottomSheetRef={sheetRef}
        onAddWorkout={handleAddWorkout}
      />
    </PageWrapper>
  );
};

export default GenerateWorkoutScreen;

// const sampleImage = "https://gymvisual.com/img/p/2/0/3/0/7/20307.gif";
const sampleImage =
  "https://upload.wikimedia.org/wikipedia/commons/b/b1/Loading_icon.gif";
