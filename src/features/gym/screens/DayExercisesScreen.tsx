import BottomSheet from "@gorhom/bottom-sheet";
import React, { useRef, useState, useCallback, useMemo, memo } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";

import { store } from "@/store";
import PageWrapper from "@components/app/PageWrapper";
import PageHeader from "@components/app/header/PageHeader";
import Box from "@components/atoms/Box";
import TextInput from "@components/atoms/Input";
import Text from "@components/atoms/Text";
import { MyStackNavigatorScreenProps } from "@navigation/types";
import { getExercises } from "@utils/services/workoutService";
import { theme } from "@utils/styles/theme";
import { Exercises, SearchExercises } from "@utils/types/types";
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { Swipeable } from "react-native-gesture-handler";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import AddWorkoutSheet from "../components/AddWorkoutSheet";
import WorkoutListItem from "../components/WorkoutListItem";
import WorkoutSuggestionCard from "../components/WorkoutSuggestionCard";
import { gymActions } from "../context/slice";
import { ArrowLeft, Trash2, CircleX } from "lucide-react-native";

// const sampleImage = "https://gymvisual.com/img/p/2/0/3/0/7/20307.gif";
const sampleImage =
  "https://upload.wikimedia.org/wikipedia/commons/b/b1/Loading_icon.gif";

const ExerciseItem = memo(
  ({
    item,
    index,
    drag,
    isActive,
    onRemove,
  }: {
    item: any;
    index: number;
    drag: () => void;
    isActive: boolean;
    onRemove: (index: number) => void;
  }) => {
    const description = `${item.sets} Sets | ${item.reps} Reps | ${item.rest} Rest`;
    const imageUrl = item.exercise.url ? item.exercise.url : sampleImage;

    const renderRightActions = useCallback(
      () => (
        <Box
          bg="PrimaryRed"
          justifyContent="center"
          alignItems="center"
          width={50}
          mb="xs"
        >
          <Trash2
            size={theme.spacing.lg}
            color="white"
            onPress={() => onRemove(index)}
          />
        </Box>
      ),
      [index, onRemove]
    );

    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={drag}
          activeOpacity={0.7}
          delayLongPress={200}
        >
          <Box
            bg={isActive ? "LightBlue" : "SecondaryGreen"}
            px="base"
            py="base"
            mb="xs"
            style={{ overflow: "hidden" }}
          >
            <Box flex={1}>
              <WorkoutListItem
                theme="green"
                image={imageUrl}
                title={item.exercise.name}
                description={description}
              />
            </Box>
            <TouchableOpacity
              onPress={() => onRemove(index)}
              activeOpacity={0.7}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              style={{
                position: "absolute",
                top: 5,
                right: 5,
                zIndex: 1,
              }}
            >
              <Box
                borderRadius="full"
                justifyContent="center"
                alignItems="center"
              >
                <CircleX size={20} color={theme.colors.PrimaryRed} />
              </Box>
            </TouchableOpacity>
          </Box>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  }
);

ExerciseItem.displayName = "ExerciseItem";

const EmptyState = memo(() => (
  <Box alignItems="center" justifyContent="center" flex={1} mt="xl">
    <Text color="SecondaryGrey">
      No exercises added yet. Search above to add exercises.
    </Text>
  </Box>
));

EmptyState.displayName = "EmptyState";

const DayExercisesScreen: React.FC<
  MyStackNavigatorScreenProps<"DayExercises">
> = ({ navigation, route }) => {
  const { day } = route.params;
  const { days } = useSelector((state: any) => state["feature/gym"]);
  const sheetRef = useRef<BottomSheet>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<
    SearchExercises | undefined
  >();

  const currentDay = useMemo(
    () => days?.exerciseDays?.find((d: any) => d.day === day),
    [days?.exerciseDays, day]
  );

  const {
    isLoading: isExercisesLoading,
    data: exercises,
    refetch: exercisesRefetch,
  } = useQuery(
    {
      queryKey: ["exercises"],
      queryFn: getExercises
    }
  );

  const handleAddExercise = useCallback(
    (exercise: Exercises) => {
      if (exercise && exercise.exercise && exercise.exercise._id) {
        store.dispatch(gymActions.addExerciseToDay({ day, exercise }));
      }
    },
    [day]
  );

  const handleRemoveExercise = useCallback(
    (exerciseIndex: number) => {
      store.dispatch(gymActions.removeExerciseFromDay({ day, exerciseIndex }));
    },
    [day]
  );

  const handleAddWorkout = useCallback(
    (exercise: Exercises) => {
      if (exercise && exercise.exercise && exercise.exercise._id) {
        handleAddExercise(exercise);
        setSearchTerm("");
        setSelectedExercise(undefined);
        setSheetOpen(false);
      }
    },
    [handleAddExercise]
  );

  const filteredExercises = useMemo(
    () =>
      exercises?.filter(
        (exercise) =>
          exercise &&
          exercise.name &&
          exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) || [],
    [exercises, searchTerm]
  );

  const mappedExercises = useMemo(
    () =>
      currentDay?.exercises?.map(
        (exercise: Exercises, exerciseIndex: number) => ({
          ...exercise,
          exerciseIndex: exerciseIndex,
          key: exercise.exercise?._id || exerciseIndex.toString(),
        })
      ) || [],
    [currentDay?.exercises]
  );

  const handleDragEnd = useCallback(
    ({ data }: { data: any[] }) => {
      store.dispatch(
        gymActions.updateExercisesOrder({
          day,
          exercises: data,
        })
      );
    },
    [day]
  );

  const keyExtractor = useCallback(
    (item: any, index: number) => item.key || index.toString(),
    []
  );

  const renderExerciseItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<any> & { index?: number }) => (
      <ExerciseItem
        item={item}
        index={item.exerciseIndex}
        drag={drag}
        isActive={isActive}
        onRemove={handleRemoveExercise}
      />
    ),
    [handleRemoveExercise]
  );

  const handleExerciseSelect = useCallback((exercise: SearchExercises) => {
    if (exercise && exercise._id) {
      setSelectedExercise(exercise);
    }
  }, []);

  const handleSheetExpand = useCallback(() => {
    setSheetOpen(true);
  }, []);

  const hasExercises = mappedExercises.length > 0;
  const isSearching = searchTerm.length > 0;

  return (
    <PageWrapper>
      <PageHeader
        leftComponent={
          <Box flexDirection="row" alignItems="center" gap="md">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ArrowLeft size={30} color={theme.colors.PrimaryGreen} />
            </TouchableOpacity>
            <Text color="PrimaryGreen" variant="xlBold" numberOfLines={1}>
              Day {day} Exercises
            </Text>
          </Box>
        }
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <Box mb="md">
          <TextInput
            value={searchTerm}
            placeholder="Type to Search Exercise"
            onChangeText={setSearchTerm}
          />
        </Box>
        {!isSearching && hasExercises && (
          <Box flex={1}>
            <DraggableFlatList
              data={mappedExercises}
              renderItem={renderExerciseItem}
              keyExtractor={keyExtractor}
              onDragEnd={handleDragEnd}
              keyboardShouldPersistTaps="handled"
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              updateCellsBatchingPeriod={50}
              initialNumToRender={10}
              windowSize={21}
              getItemLayout={(data, index) => ({
                length: 100,
                offset: 100 * index,
                index,
              })}
            />
          </Box>
        )}
        {isSearching && (
          <Box flex={1}>
            <Text variant="lgBold" mb="sm">
              Search Results
            </Text>
            <WorkoutSuggestionCard
              onPress={handleSheetExpand}
              exercises={filteredExercises}
              setSelectedExercise={handleExerciseSelect}
            />
          </Box>
        )}
        {!isSearching && !hasExercises && <EmptyState />}
      </KeyboardAvoidingView>

      {sheetOpen && (
        <AddWorkoutSheet
          image={selectedExercise?.url ? selectedExercise?.url : sampleImage}
          workoutName={selectedExercise || { _id: "", name: "" }}
          bottomSheetRef={sheetRef}
          onAddWorkout={handleAddWorkout}
          onClose={() => {
            setSheetOpen(false);
            setSelectedExercise(undefined);
          }}
        />
      )}
    </PageWrapper>
  );
};

export default DayExercisesScreen;
