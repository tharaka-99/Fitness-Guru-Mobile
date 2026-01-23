import React from "react";
import { FlatList } from "react-native";

import PageHeader from "@components/app/header/PageHeader";
import PageWrapper from "@components/app/PageWrapper";
import { MyStackNavigatorScreenProps } from "@navigation/types";
import { theme } from "@utils/styles/theme";
import WorkoutDayCard from "../components/WorkoutDayCard";
import { useQuery } from "react-query";
import { getMealPlan } from "@utils/services/mealPlanService";
import { store } from "@/store";
import { MealPlanType, MealType } from "@utils/types/mealPlanTypes";
import { gymActions } from "../context/slice";
import { Icon } from "react-native-paper";
import { TouchableOpacity } from "react-native-gesture-handler";
import { WorkoutType } from "@utils/types/types";
import Box from "@components/atoms/Box";
import Text from "@components/atoms/Text";
import { ArrowLeft, Plus } from "lucide-react-native";

const MealPlanScreen: React.FC<MyStackNavigatorScreenProps<"MealPlan">> = ({
  navigation,
}) => {
  const { selectedMealPlanType, selectedMealPlan } =
    store.getState()["feature/gym"];
  const {
    isLoading: isMealPlanLoading,
    data: mealPlan,
    refetch: mealPlanRefetch,
  } = useQuery("mealPlan", getMealPlan);

  let selectedMeal;

  if (selectedMealPlanType === MealPlanType.TrainerCreated) {
    selectedMeal = mealPlan?.filter(
      (item) => item.type === selectedMealPlanType
    );
  } else {
    selectedMeal = mealPlan?.filter((item, index) => {
      return item.type === selectedMealPlanType;
    });
  }

  return (
    <PageWrapper>
      <PageHeader
        rightComponent={
          selectedMealPlanType === MealPlanType.SelfCreated && (
            <TouchableOpacity
              onPress={() => navigation.navigate("GenerateMealPlan")}
            >
              <Plus size={30} color={theme.colors.PrimaryGreen} />
            </TouchableOpacity>
          )
        }
        title="Meal Plan"
        leftComponent={
          <Box flexDirection="row" alignItems="center" gap="md">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ArrowLeft size={30} color={theme.colors.PrimaryGreen} />
            </TouchableOpacity>
            <Text color="PrimaryGreen" variant="xlBold" numberOfLines={1}>
              Meal Plan
            </Text>
          </Box>
        }
      />

      <FlatList
        data={selectedMeal}
        keyExtractor={({ _id }) => String(_id)}
        contentContainerStyle={{ gap: theme.spacing.sm }}
        renderItem={({ item }) => {
          const { breakfast, dinner, lunch, snack } = item;

          const breakfastItems = breakfast.map((meal) => {
            return meal.mealItemId.name;
          });
          const lunchItems = lunch.map((meal) => {
            return meal.mealItemId.name;
          });
          const dinnerItems = dinner.map((meal) => {
            return meal.mealItemId.name;
          });
          const snackItems = dinner.map((meal) => {
            return meal.mealItemId.name;
          });

          return (
            <>
              <WorkoutDayCard
                title={"Breakfast"}
                description={breakfastItems
                  .map((item) => {
                    return item;
                  })
                  .toString()}
                onPress={() => {
                  store.dispatch(gymActions.setselectedMealPlanType(breakfast));
                  store.dispatch(
                    gymActions.setSelectedMealType(MealType.Breakfast)
                  );
                  navigation.push("MealsList");
                }}
              />
              <WorkoutDayCard
                title={"Lunch"}
                description={lunchItems.map((item) => item).toString()}
                onPress={() => {
                  store.dispatch(gymActions.setselectedMealPlanType(lunch));
                  store.dispatch(
                    gymActions.setSelectedMealType(MealType.Lunch)
                  );
                  navigation.push("MealsList");
                }}
              />
              <WorkoutDayCard
                title={"Snack"}
                description={snackItems.map((item) => item).toString()}
                onPress={() => {
                  store.dispatch(gymActions.setselectedMealPlanType(snack));
                  store.dispatch(
                    gymActions.setSelectedMealType(MealType.Snack)
                  );
                  navigation.push("MealsList");
                }}
              />
              <WorkoutDayCard
                title={"Dinner"}
                description={dinnerItems.map((item) => item).toString()}
                onPress={() => {
                  store.dispatch(gymActions.setselectedMealPlanType(dinner));
                  store.dispatch(
                    gymActions.setSelectedMealType(MealType.Dinner)
                  );
                  navigation.push("MealsList");
                }}
              />
            </>
          );
        }}
      />
    </PageWrapper>
  );
};

export default MealPlanScreen;
