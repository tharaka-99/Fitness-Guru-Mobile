import React from "react";
import { FlatList, TouchableOpacity } from "react-native";

import PageHeader from "@components/app/header/PageHeader";
import PageWrapper from "@components/app/PageWrapper";
import { MyStackNavigatorScreenProps } from "@navigation/types";
import { theme } from "@utils/styles/theme";
import WorkoutDayCard from "../components/WorkoutDayCard";
import { useQuery } from "@tanstack/react-query";
import { getMealPlan } from "@utils/services/mealPlanService";
import { store } from "@/store";
import { MealPlanType, MealType } from "@utils/types/mealPlanTypes";
import { gymActions } from "../context/slice";
import { Icon } from "react-native-paper";
import { WorkoutType } from "@utils/types/types";
import Box from "@components/atoms/Box";
import Text from "@components/atoms/Text";
import { ArrowLeft, Plus } from "lucide-react-native";
import Toast from "react-native-toast-message";
import useSubscription from "@features/subscription/hooks/useSubscription";
import FullScreenLoader from "@components/atoms/FullScreenLoader";
import { useSelector } from "react-redux";

const MealPlanScreen: React.FC<MyStackNavigatorScreenProps<"MealPlan">> = ({
  navigation,
}) => {
  const { isSubscribed } = useSubscription();
  const selectedMealPlanType = useSelector((state: any) => state["feature/gym"].selectedMealPlanType);
  const {
    isLoading: isMealPlanLoading,
    data: mealPlan,
    refetch: mealPlanRefetch,
  } = useQuery(
    {
      queryKey: ["mealPlan"],
      queryFn: getMealPlan
    }
  );

  if (isMealPlanLoading) {
    return <FullScreenLoader message="Loading..." />;
  }

  const handleAddMealPlan = () => {
    // if (!isSubscribed) {
    //   Toast.show({
    //     type: "info",
    //     text1: "Subscription Required",
    //     text2: "Please subscribe to save your meal plans.",
    //   });
    //   navigation.push("PricingPackages");
    //   return;
    // }
    navigation.navigate("Onboard", { fromMealPlan: true });
  };

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
          selectedMealPlanType === MealPlanType.SelfCreated ? (
            <TouchableOpacity onPress={handleAddMealPlan}>
              <Plus size={30} color={theme.colors.PrimaryGreen} />
            </TouchableOpacity>
          ) : null}

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
        keyExtractor={(item, index) => item._id ? String(item._id) : String(index)}
        contentContainerStyle={{ gap: theme.spacing.sm, flexGrow: 1 }}
        ListEmptyComponent={
          <Box flex={1} justifyContent="center" alignItems="center" px="xl">
            <Text variant="lgBold" color="textSecondary" textAlign="center">
              No meal plans found
            </Text>
          </Box>
        }
        renderItem={({ item }) => {
          const { breakfast = [], dinner = [], lunch = [], snack = [] } = item;

          const breakfastItems = breakfast.map((meal) => {
            return meal.mealItemId?.name || meal.name || "Unknown Item";
          });
          const lunchItems = lunch.map((meal) => {
            return meal.mealItemId?.name || meal.name || "Unknown Item";
          });
          const dinnerItems = dinner.map((meal) => {
            return meal.mealItemId?.name || meal.name || "Unknown Item";
          });
          const snackItems = snack.map((meal) => {
            return meal.mealItemId?.name || meal.name || "Unknown Item";
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
