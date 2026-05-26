import React from "react";
import { FlatList, TouchableOpacity } from "react-native";
import { ArrowLeft } from "lucide-react-native";

import { store } from "@/store";
import PageWrapper from "@components/app/PageWrapper";
import PageHeader from "@components/app/header/PageHeader";
import { MyStackNavigatorScreenProps } from "@navigation/types";
import { theme } from "@utils/styles/theme";
import DefaultWorkoutsTypeCard from "../components/DefaultWorkoutsTypeCard";
import { gymActions } from "../context/slice";
import Box from "@components/atoms/Box";
import { Icon } from "react-native-paper";
import Text from "@components/atoms/Text";

const GeneralWorkoutRoutineScreen: React.FC<
  MyStackNavigatorScreenProps<"GeneralWorkoutRoutine">
> = ({ navigation }) => {
  const { defaultWorkouts } = store.getState()["feature/gym"];

  const defaultExercisesList = defaultWorkouts?.map((item: any) => item).flat();

  const workoutIdMapping: { [key: number]: string } = {
    0: "1D-GYM",
    1: "2D-GYM",
    2: "3D-HOME",
    3: "4D-HOME",
    4: "5D-GYM",
    5: "6D-GYM",
  };

  const handleWorkoutDayPress = (workoutId: number) => {
    const apiName = workoutIdMapping[workoutId];

    if (!apiName) {
      console.error(`❌ No mapping found for workout ID: ${workoutId}`);
      return;
    }

    const workoutIndex = defaultWorkouts?.findIndex(
      (workout) => workout?.name === apiName
    );

    if (workoutIndex !== -1 && workoutIndex !== undefined) {
      store.dispatch(gymActions.setSelectedGeneralDay(workoutIndex));
      const foundWorkout = defaultWorkouts[workoutIndex];

      navigation.push("WorkoutRoutine");
    } else {
      console.error(
        `❌ Workout "${apiName}" not found. Available: ${defaultWorkouts
          ?.map((w) => w?.name)
          .join(", ")}`
      );
    }
  };

  const generalWorkoutsInfo = [
    {
      id: 0,
      image: require("assets/images/kettlebell.png"),
      name: "ignite",
      description:
        "Kickstart your fitness journey with this invigorating workout.",
    },
    {
      id: 1,
      image: require("assets/images/Momemtum.png"),
      name: "momentum",
      description: "Build on yesterday`s progress and keep the momentum going.",
    },
    {
      id: 2,
      image: require("assets/images/vitality.png"),
      name: "vitality",
      description:
        "Restore energy and vitality with a balanced workout routine.",
    },
    {
      id: 3,
      image: require("assets/images/Zenith1.png"),
      name: "zenith",
      description:
        "Reach the peak of your performance with this comprehensive workout.",
    },
    {
      id: 4,
      image: require("assets/images/resilience.png"),
      name: "resilience",
      description:
        "Strengthen your body and mind, cultivating resilience for the challenges.",
    },
    {
      id: 5,
      image: require("assets/images/Apex1.png"),
      name: "apex",
      description:
        "Push your limits and reach the pinnacle of your fitness potential.",
    },
  ];
  return (
    <PageWrapper>
      <PageHeader
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
      />

      <FlatList
        data={generalWorkoutsInfo}
        keyExtractor={({ name }) => String(name)}
        renderItem={({ item }) => {
          const { name, description, image, id } = item;

          return (
            <DefaultWorkoutsTypeCard
              title={name ? name : ""}
              description={description}
              image={image}
              onPress={() => handleWorkoutDayPress(id)}
            />
          );
        }}
      />
    </PageWrapper>
  );
};

export default GeneralWorkoutRoutineScreen;
